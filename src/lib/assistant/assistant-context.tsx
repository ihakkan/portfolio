'use client';

/**
 * Assistant Context
 * React context for managing assistant state and interactions
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
} from './voice-service';

// ============ Types ============

export type AssistantState = 'idle' | 'listening' | 'speaking' | 'thinking';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
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
        if (voiceEnabled && response.speakText) {
            setState('speaking');
            speak(
                response.speakText,
                () => setState('idle'),
                () => setState('speaking')
            );
        }

        return message;
    }, [voiceEnabled]);

    // Process user input
    const processInput = useCallback((text: string) => {
        const trimmedText = text.trim();
        if (!trimmedText) return;

        // Add user message
        addUserMessage(trimmedText);

        // Set thinking state briefly
        setState('thinking');

        // Detect intent and generate response
        setTimeout(() => {
            const intent = detectIntent(trimmedText);
            const response = generateResponse(intent);
            addAssistantMessage(response);
            if (!voiceEnabled) {
                setState('idle');
            }
        }, 300); // Small delay for natural feel
    }, [addUserMessage, addAssistantMessage, voiceEnabled]);

    // Send text message
    const sendMessage = useCallback((text: string) => {
        cancelSpeaking();
        processInput(text);
    }, [processInput]);

    // Voice input handlers
    const startVoiceInput = useCallback(() => {
        if (!voiceSupported) return;

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
            (error) => {
                console.error('Voice input error:', error);
                setState('idle');
            },
            () => {
                setState('idle');
            }
        );
    }, [voiceSupported, processInput]);

    // Start voice-to-text (fills input box instead of auto-sending)
    const transcriptCallbackRef = useRef<((text: string) => void) | null>(null);

    const startVoiceToText = useCallback((onTranscript: (text: string) => void) => {
        if (!voiceSupported) return;

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
            (error) => {
                console.error('Voice-to-text error:', error);
                setState('idle');
            },
            () => {
                setState('idle');
            }
        );
    }, [voiceSupported]);

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

    // Clear messages
    const clearMessages = useCallback(() => {
        setMessages([]);
        setHasShownWelcome(false);
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
