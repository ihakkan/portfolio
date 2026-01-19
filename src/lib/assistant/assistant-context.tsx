'use client';

/**
 * Assistant Context
 * React context for managing assistant state and interactions
 * Includes conversation memory for contextual responses
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { getWelcomeMessage, AssistantResponse } from './response-generator';
import { routeQuery } from './query-router';
import {
    startListening,
    stopListening,
    speak,
    cancelSpeaking,
    isVoiceSupported,
    preloadVoices,
    VoiceError,
} from './voice-service';
import {
    ConversationContext,
    createEmptyContext,
} from './smart-response-engine';

// ============ Types ============

export type AssistantState = 'idle' | 'listening' | 'speaking' | 'thinking';

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    messageType?: 'normal' | 'error' | 'info';
    action?: {
        type: 'navigate';
        target: string;
    };
}

export interface Caption {
    text: string;
    source: 'user' | 'assistant';
}

interface AssistantContextType {
    messages: Message[];
    state: AssistantState;
    isOpen: boolean;
    voiceEnabled: boolean;
    voiceSupported: boolean;
    sendMessage: (text: string) => void;
    startVoiceInput: () => void;
    startVoiceToText: (onTranscript: (text: string) => void) => void;
    stopVoiceInput: () => void;
    setVoiceEnabled: (enabled: boolean) => void;
    setIsOpen: (open: boolean) => void;
    clearMessages: () => void;
    addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
    caption: Caption | null;
}

// ============ Context ============

const AssistantContext = createContext<AssistantContextType | null>(null);

// ============ Provider ============

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [state, setState] = useState<AssistantState>('idle');
    const [caption, setCaption] = useState<Caption | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [voiceSupported, setVoiceSupported] = useState(false);
    const [hasShownWelcome, setHasShownWelcome] = useState(false);

    // Conversation memory for contextual responses
    const conversationContextRef = useRef<ConversationContext>(createEmptyContext());

    const interimTranscriptRef = useRef<string>('');
    const captionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Check voice support on mount
    useEffect(() => {
        setVoiceSupported(isVoiceSupported());
        preloadVoices();
    }, []);

    // Helper to generate unique ID
    const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add message helpers
    const addUserMessage = useCallback((content: string) => {
        const message: Message = {
            id: generateId(),
            role: 'user',
            content,
            timestamp: Date.now(),
            messageType: 'normal',
        };
        setMessages((prev) => [...prev, message]);
        return message;
    }, []);

    const addAssistantMessage = useCallback((response: AssistantResponse) => {
        const message: Message = {
            id: generateId(),
            role: 'assistant',
            content: response.text,
            timestamp: Date.now(),
            messageType: 'normal',
            action: response.action,
        };
        setMessages((prev) => [...prev, message]);

        // Handle navigation action
        if (response.action?.type === 'navigate') {
            setTimeout(() => {
                const element = document.getElementById(response.action!.target);
                if (element) {
                    const headerOffset = 100;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth',
                    });
                }
            }, 500);
        }

        // Speak response if voice is enabled with robust error handling
        // NOTE: Speaking state is set by onStart callback to sync animation with actual voice
        if (voiceEnabled && response.speakText) {
            // Safety timeout: if voice gets stuck, reset state after 30 seconds
            const safetyTimeout = setTimeout(() => {
                setState((currentState) => {
                    if (currentState === 'speaking') {
                        console.warn('Voice speaking timeout - resetting state');
                        cancelSpeaking();
                        return 'idle';
                    }
                    return currentState;
                });
            }, 30000);

            speak(
                response.speakText,
                () => {
                    clearTimeout(safetyTimeout);
                    if (captionTimeoutRef.current) clearTimeout(captionTimeoutRef.current);
                    setState('idle'); // onEnd - back to idle
                    setCaption(null);
                },
                () => {
                    setState('speaking'); // onStart
                    // Chunk long text for cinematic subtitles
                    const text = response.speakText || '';
                    if (captionTimeoutRef.current) clearTimeout(captionTimeoutRef.current);

                    const words = text.split(' ');
                    const chunkSize = 10; // Words per slide

                    if (words.length <= chunkSize) {
                        setCaption({ text, source: 'assistant' });
                    } else {
                        let currentIndex = 0;
                        const showNextChunk = () => {
                            if (currentIndex >= words.length) return;

                            const chunk = words.slice(currentIndex, currentIndex + chunkSize).join(' ');
                            setCaption({ text: chunk, source: 'assistant' });

                            // Estimate reading time: 300ms per word + 500ms base
                            const duration = (chunk.split(' ').length * 300) + 500;
                            currentIndex += chunkSize;

                            captionTimeoutRef.current = setTimeout(showNextChunk, duration);
                        };
                        showNextChunk();
                    }
                },
                {} // options
            );
        }

        return message;
    }, [voiceEnabled]);

    // Expose generic addMessage
    const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
        const newMessage: Message = {
            id: generateId(),
            timestamp: Date.now(),
            ...message
        };
        setMessages((prev) => [...prev, newMessage]);
    }, []);

    // Add system/error message (for voice errors, etc.)
    const addSystemMessage = useCallback((content: string, messageType: 'error' | 'info' = 'info') => {
        const message: Message = {
            id: generateId(),
            role: 'system',
            content,
            timestamp: Date.now(),
            messageType,
        };
        setMessages((prev) => [...prev, message]);
        return message;
    }, []);

    // Show welcome message when opened for the first time
    // Needs to use internal addAssistantMessage or generic one?
    // Using addAssistantMessage is better as it handles internal logic
    useEffect(() => {
        if (isOpen && !hasShownWelcome) {
            const welcome = getWelcomeMessage();
            addAssistantMessage(welcome);
            setHasShownWelcome(true);
        }
    }, [isOpen, hasShownWelcome, addAssistantMessage]);

    // Process user input with conversation context
    const processInput = useCallback((text: string) => {
        const trimmedText = text.trim();
        if (!trimmedText) return;

        // Add user message
        addUserMessage(trimmedText);

        // Set thinking state briefly
        setState('thinking');

        // Safety timeout: if thinking state gets stuck, reset after 10 seconds
        const thinkingTimeout = setTimeout(() => {
            setState((currentState) => {
                if (currentState === 'thinking') {
                    console.warn('Thinking timeout - resetting state');
                    return 'idle';
                }
                return currentState;
            });
        }, 10000);

        // Route query through the hybrid AI backend
        setTimeout(() => {
            try {
                clearTimeout(thinkingTimeout);
                const result = routeQuery(trimmedText, conversationContextRef.current);

                // Update conversation context from router result
                conversationContextRef.current = result.updatedContext;

                addAssistantMessage(result.response);
                if (!voiceEnabled) {
                    setState('idle');
                }
            } catch (error) {
                clearTimeout(thinkingTimeout);
                console.error('Error processing query:', error);
                setState('idle');
                // Add fallback error message
                const fallbackMessage: AssistantResponse = {
                    text: "Sorry, something went wrong processing your request. Please try again!",
                    speakText: "Sorry, something went wrong. Please try again.",
                };
                addAssistantMessage(fallbackMessage);
            }
        }, 300 + Math.random() * 200); // Slightly variable delay for natural feel
    }, [addUserMessage, addAssistantMessage, voiceEnabled]);


    // Send text message
    const sendMessage = useCallback((text: string) => {
        cancelSpeaking();
        processInput(text);
    }, [processInput]);

    // Handle voice error with user-friendly message
    const handleVoiceError = useCallback((errorMessage: string, voiceError?: VoiceError) => {
        setState('idle');

        if (voiceError && voiceError.userFriendlyMessage) {
            // Show user-friendly error message
            const errorContent = `${voiceError.userFriendlyMessage}\n\n💡 *${voiceError.suggestion}*`;
            addSystemMessage(errorContent, 'error');
        } else {
            // Generic fallback message
            addSystemMessage(
                "Voice input ran into an issue! 🎤\n\n💡 *No worries – you can type your message using text mode instead.*",
                'error'
            );
        }

        console.error('Voice input error:', errorMessage);
    }, [addSystemMessage]);

    // Voice input handlers
    const listeningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const startVoiceInput = useCallback(() => {
        if (!voiceSupported) {
            addSystemMessage(
                "Voice isn't supported in this browser! 🔇\n\n💡 *Try using Chrome, Edge, or Safari for voice features, or use text mode.*",
                'error'
            );
            return;
        }

        cancelSpeaking();
        setState('listening');
        interimTranscriptRef.current = '';

        // Safety timeout: if listening state gets stuck, reset after 20 seconds
        if (listeningTimeoutRef.current) {
            clearTimeout(listeningTimeoutRef.current);
        }
        listeningTimeoutRef.current = setTimeout(() => {
            setState((currentState) => {
                if (currentState === 'listening') {
                    console.warn('Listening timeout - resetting state');
                    stopListening();
                    return 'idle';
                }
                return currentState;
            });
        }, 20000);

        startListening(
            (transcript, isFinal) => {
                // Update caption with live transcript
                setCaption({ text: transcript, source: 'user' });

                if (isFinal) {
                    if (listeningTimeoutRef.current) {
                        clearTimeout(listeningTimeoutRef.current);
                        listeningTimeoutRef.current = null;
                    }
                    processInput(transcript);
                    // Don't clear caption yet, let it persist a moment or until bot speaks
                    setTimeout(() => setCaption(null), 1500);
                } else {
                    interimTranscriptRef.current = transcript;
                }
            },
            (errorMessage, voiceError) => {
                setCaption(null);
                if (listeningTimeoutRef.current) {
                    clearTimeout(listeningTimeoutRef.current);
                    listeningTimeoutRef.current = null;
                }
                handleVoiceError(errorMessage, voiceError);
            },
            () => {
                if (listeningTimeoutRef.current) {
                    clearTimeout(listeningTimeoutRef.current);
                    listeningTimeoutRef.current = null;
                }
                setState('idle');
            }
        );
    }, [voiceSupported, processInput, handleVoiceError, addSystemMessage]);

    // Start voice-to-text (fills input box instead of auto-sending)
    const transcriptCallbackRef = useRef<((text: string) => void) | null>(null);

    const startVoiceToText = useCallback((onTranscript: (text: string) => void) => {
        if (!voiceSupported) {
            addSystemMessage(
                "Voice isn't supported in this browser! 🔇\n\n💡 *Try using Chrome, Edge, or Safari for voice features.*",
                'error'
            );
            return;
        }

        cancelSpeaking();
        setState('listening');
        interimTranscriptRef.current = '';
        transcriptCallbackRef.current = onTranscript;

        startListening(
            (transcript, isFinal) => {
                // Send interim results to input as user types
                if (transcriptCallbackRef.current) {
                    transcriptCallbackRef.current(transcript);
                }
                if (isFinal) {
                    setState('idle');
                }
            },
            handleVoiceError,
            () => {
                setState('idle');
            }
        );
    }, [voiceSupported, handleVoiceError, addSystemMessage]);

    const stopVoiceInput = useCallback(() => {
        stopListening();
        setState('idle');
        transcriptCallbackRef.current = null;

        // Process any interim transcript (only for voice mode)
        if (interimTranscriptRef.current.trim() && !transcriptCallbackRef.current) {
            processInput(interimTranscriptRef.current);
            interimTranscriptRef.current = '';
        }
    }, [processInput]);

    // Clear messages and reset conversation context
    const clearMessages = useCallback(() => {
        setMessages([]);
        setHasShownWelcome(false);
        conversationContextRef.current = createEmptyContext(); // Reset conversation memory
    }, []);

    const value: AssistantContextType = {
        messages,
        state,
        caption,
        isOpen,
        voiceEnabled,
        voiceSupported,
        sendMessage,
        startVoiceInput,
        startVoiceToText,
        stopVoiceInput,
        setVoiceEnabled,
        setIsOpen,
        clearMessages,
        addMessage,
    };

    return (
        <AssistantContext.Provider value={value}>
            {children}
        </AssistantContext.Provider>
    );
};

// ============ Hook ============

export const useAssistant = (): AssistantContextType => {
    const context = useContext(AssistantContext);
    if (!context) {
        throw new Error('useAssistant must be used within an AssistantProvider');
    }
    return context;
};

export default AssistantContext;
