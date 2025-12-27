'use client';

/**
 * Assistant Context
 * React context for managing assistant state and interactions
 * Includes conversation memory for contextual responses
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { detectIntent } from './intent-detector';
import { generateResponse, getWelcomeMessage, AssistantResponse } from './response-generator';
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
    updateContext,
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
}

// ============ Context ============

const AssistantContext = createContext<AssistantContextType | null>(null);

// ============ Provider ============

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [state, setState] = useState<AssistantState>('idle');
    const [isOpen, setIsOpen] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [voiceSupported, setVoiceSupported] = useState(false);
    const [hasShownWelcome, setHasShownWelcome] = useState(false);

    // Conversation memory for contextual responses
    const conversationContextRef = useRef<ConversationContext>(createEmptyContext());

    const interimTranscriptRef = useRef<string>('');

    // Check voice support on mount
    useEffect(() => {
        setVoiceSupported(isVoiceSupported());
        preloadVoices();
    }, []);

    // Show welcome message when opened for the first time
    useEffect(() => {
        if (isOpen && !hasShownWelcome) {
            const welcome = getWelcomeMessage();
            addAssistantMessage(welcome);
            setHasShownWelcome(true);
        }
    }, [isOpen, hasShownWelcome]);

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

        // Speak response if voice is enabled
        // NOTE: Speaking state is set by onStart callback to sync animation with actual voice
        if (voiceEnabled && response.speakText) {
            speak(
                response.speakText,
                () => setState('idle'),        // onEnd - back to idle
                () => setState('speaking')     // onStart - only now show speaking state
            );
        }

        return message;
    }, [voiceEnabled]);

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

    // Process user input with conversation context
    const processInput = useCallback((text: string) => {
        const trimmedText = text.trim();
        if (!trimmedText) return;

        // Add user message
        addUserMessage(trimmedText);

        // Set thinking state briefly
        setState('thinking');

        // Detect intent and generate response with context
        setTimeout(() => {
            const intent = detectIntent(trimmedText);

            // Generate response with conversation context
            const response = generateResponse(intent, conversationContextRef.current);

            // Update conversation context for future responses
            conversationContextRef.current = updateContext(
                conversationContextRef.current,
                intent,
                intent.intent !== 'unknown' ? intent.intent : undefined
            );

            addAssistantMessage(response);
            if (!voiceEnabled) {
                setState('idle');
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

        startListening(
            (transcript, isFinal) => {
                if (isFinal) {
                    processInput(transcript);
                } else {
                    interimTranscriptRef.current = transcript;
                }
            },
            handleVoiceError,
            () => {
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
