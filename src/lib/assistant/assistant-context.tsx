'use client';

/**
 * Assistant Context
 * React context for managing assistant state and interactions
 * Includes conversation memory for contextual responses
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { getWelcomeMessage, MAX_HISTORY_TURNS, type AssistantResponse, type Turn } from './types';
import { askAssistant, AssistantApiError, type ChatErrorCode } from './chat-client';
import {
    startListening,
    stopListening,
    speak,
    cancelSpeaking,
    isVoiceSupported,
    isSpeechRecognitionSupported,
    preloadVoices,
    primeSpeechSynthesis,
    checkMicrophonePermission,
    VoiceError,
} from './voice-service';

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
    isLoading: boolean;
    /** True while an answer is being read aloud. */
    isSpeaking: boolean;
    sendMessage: (text: string) => void;
    startVoiceInput: () => void;
    startVoiceToText: (onTranscript: (text: string) => void) => void;
    stopVoiceInput: () => void;
    /** Stop the current answer being read aloud, without ending the chat. */
    stopSpeaking: () => void;
    setVoiceEnabled: (enabled: boolean) => void;
    setIsOpen: (open: boolean) => void;
    clearMessages: () => void;
    addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
    caption: Caption | null;
}

const VOICE_PREFERENCE_KEY = 'hakkan_assistant_voice_enabled';

const readVoicePreference = (): boolean => {
    if (typeof window === 'undefined') return true;
    try {
        return window.localStorage.getItem(VOICE_PREFERENCE_KEY) !== 'false';
    } catch {
        return true;
    }
};

/**
 * What each failure sounds like. The chat bubble can afford emoji, markdown
 * and a tip; spoken feedback has to be one short, plain sentence.
 */
const SPOKEN_API_ERROR: Record<ChatErrorCode, string> = {
    rate_limited: "I'm getting more questions than I can keep up with right now. Give me a minute and ask again.",
    unconfigured: "I'm not wired up in this deployment yet, but you can still browse the portfolio.",
    timeout: 'That took too long on my end. Mind asking again?',
    upstream: "I couldn't reach my brain just now. Try again in a moment.",
    network: "I can't reach the network right now. Check your connection and try again.",
    bad_request: "I couldn't quite read that one. Mind rephrasing it?",
};

/** Emoji read aloud as nothing useful, so take them out of spoken notices. */
const stripForSpeech = (text: string): string =>
    text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s{2,}/g, ' ').trim();

const SPOKEN_GENERIC_ERROR = 'Something went wrong on my side. Mind asking that again?';

/** How long an unspoken notice stays on screen in voice mode. */
const NOTICE_CAPTION_MS = 4500;

// ============ Context ============

const AssistantContext = createContext<AssistantContextType | null>(null);

// ============ Provider ============

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [state, setState] = useState<AssistantState>('idle');
    const [caption, setCaption] = useState<Caption | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [voiceEnabled, setVoiceEnabledState] = useState(true);
    const [voiceSupported, setVoiceSupported] = useState(false);
    const [hasShownWelcome, setHasShownWelcome] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Conversation memory. The model gets the actual turns, so follow-ups like
    // "yes", "tell me more" and "the second one" resolve natively — no need for
    // the old suggested-topic bookkeeping.
    const historyRef = useRef<Turn[]>([]);

    // Guards against a superseded request landing after a newer one.
    const requestIdRef = useRef(0);
    const abortRef = useRef<AbortController | null>(null);

    const interimTranscriptRef = useRef<string>('');

    // Check voice support and restore the visitor's audio preference
    useEffect(() => {
        setVoiceSupported(isVoiceSupported());
        setVoiceEnabledState(readVoicePreference());
        preloadVoices();
    }, []);

    const setVoiceEnabled = useCallback((enabled: boolean) => {
        setVoiceEnabledState(enabled);
        try {
            window.localStorage.setItem(VOICE_PREFERENCE_KEY, String(enabled));
        } catch {
            // Private mode — the preference just won't persist.
        }
        if (!enabled) cancelSpeaking();
    }, []);

    const stopSpeaking = useCallback(() => {
        cancelSpeaking();
        setCaption(null);
        setState((current) => (current === 'speaking' ? 'idle' : current));
    }, []);

    // Leaving the chat should never leave audio playing behind it.
    useEffect(() => {
        if (isOpen) return;
        cancelSpeaking();
        stopListening();
        setCaption(null);
        setState('idle');
    }, [isOpen]);

    useEffect(() => () => {
        cancelSpeaking();
        stopListening();
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

        // Read the answer aloud. Captions are driven by the audio itself, one
        // spoken chunk at a time, so they can't drift out of sync.
        if (voiceEnabled && response.speakText) {
            const speakText = response.speakText;

            // Backstop only: the voice service has its own start watchdog, so
            // this is scaled to the length of the answer and should never fire.
            const estimatedMs = Math.min(120000, (speakText.length / 12) * 1000 + 15000);
            const safetyTimeout = setTimeout(() => {
                setState((current) => {
                    if (current === 'speaking' || current === 'thinking') {
                        console.warn('Speech ran past its expected duration - resetting state');
                        cancelSpeaking();
                        return 'idle';
                    }
                    return current;
                });
                setCaption(null);
            }, estimatedMs);

            speak(
                speakText,
                () => {
                    clearTimeout(safetyTimeout);
                    // 'thinking' too: speech may never have started (muted tab,
                    // missing voices), and the UI must not stay stuck.
                    setState((current) => (current === 'speaking' || current === 'thinking' ? 'idle' : current));
                    setCaption(null);
                },
                () => setState('speaking'),
                {
                    onCaption: (chunk) => setCaption({ text: chunk, source: 'assistant' }),
                }
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

    /**
     * Say a one-off line (an error, a notice) without putting it in the
     * model's conversation history. In voice mode an error used to be
     * completely silent — the bubble is in the text transcript the visitor
     * isn't looking at — so the bot just appeared to ignore them.
     */
    const speakNotice = useCallback((spoken: string) => {
        if (!spoken) return;

        const clearIfStillShowing = () =>
            setCaption((current) => (current?.text === spoken ? null : current));

        setCaption({ text: spoken, source: 'assistant' });

        // Muted: the caption is the only feedback there is, so leave it up.
        if (!voiceEnabled) {
            setTimeout(clearIfStillShowing, NOTICE_CAPTION_MS);
            return;
        }

        speak(
            spoken,
            () => {
                setState((current) => (current === 'speaking' ? 'idle' : current));
                clearIfStillShowing();
            },
            () => setState('speaking'),
            { onCaption: (chunk) => setCaption({ text: chunk, source: 'assistant' }) }
        );
    }, [voiceEnabled]);

    /** Show a notice in the transcript and say it out loud. */
    const announce = useCallback(
        (content: string, spoken: string, type: 'error' | 'info' = 'error') => {
            addSystemMessage(content, type);
            speakNotice(spoken);
        },
        [addSystemMessage, speakNotice]
    );

    // Show welcome message when opened for the first time
    // Needs to use internal addAssistantMessage or generic one?
    // Using addAssistantMessage is better as it handles internal logic
    useEffect(() => {
        if (isOpen && !hasShownWelcome) {
            // Deliberately silent: nobody expects a website to start talking at
            // them. Answers are spoken; the greeting is not.
            const { speakText: _unused, ...welcome } = getWelcomeMessage();
            addAssistantMessage(welcome);
            setHasShownWelcome(true);
        }
    }, [isOpen, hasShownWelcome, addAssistantMessage]);

    // Ask the model. The network round trip is the natural pause now, so there
    // is no artificial "thinking" delay.
    const processInput = useCallback(async (text: string) => {
        const trimmedText = text.trim();
        if (!trimmedText) return;

        // Supersede anything still in flight — the user has moved on.
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const myRequestId = ++requestIdRef.current;

        addUserMessage(trimmedText);
        setState('thinking');
        setIsLoading(true);

        // Safety net for a request that neither resolves nor rejects.
        const thinkingTimeout = setTimeout(() => {
            setState((currentState) => {
                if (currentState === 'thinking') {
                    console.warn('Thinking timeout - resetting state');
                    return 'idle';
                }
                return currentState;
            });
        }, 12000);

        try {
            const response = await askAssistant(trimmedText, historyRef.current, controller.signal);

            // A newer question has since been asked; this answer is stale.
            if (myRequestId !== requestIdRef.current) return;

            const nextHistory: Turn[] = [
                ...historyRef.current,
                { role: 'user', content: trimmedText },
                { role: 'assistant', content: response.text },
            ];
            historyRef.current = nextHistory.slice(-MAX_HISTORY_TURNS);

            addAssistantMessage(response);
            if (!voiceEnabled) {
                setState('idle');
            }
        } catch (error) {
            if (myRequestId !== requestIdRef.current) return;
            // Superseded by a newer request, not a failure.
            if ((error as Error)?.name === 'AbortError') return;

            console.error('Error processing query:', error);
            setState('idle');

            const isApiError = error instanceof AssistantApiError;
            announce(
                isApiError ? error.message : 'Sorry, something went wrong. Please try again!',
                isApiError ? SPOKEN_API_ERROR[error.code] ?? SPOKEN_GENERIC_ERROR : SPOKEN_GENERIC_ERROR,
                isApiError && error.code === 'unconfigured' ? 'info' : 'error'
            );
        } finally {
            clearTimeout(thinkingTimeout);
            if (myRequestId === requestIdRef.current) setIsLoading(false);
        }
    }, [addUserMessage, addAssistantMessage, announce, voiceEnabled]);


    // Send text message
    const sendMessage = useCallback((text: string) => {
        cancelSpeaking();
        // Runs inside the tap that sent the message, which is the only moment
        // mobile browsers will let us unlock speech synthesis.
        if (voiceEnabled) primeSpeechSynthesis();
        void processInput(text);
    }, [processInput, voiceEnabled]);

    // Handle voice error with user-friendly message
    const handleVoiceError = useCallback((errorMessage: string, voiceError?: VoiceError) => {
        setState('idle');

        if (voiceError?.userFriendlyMessage) {
            announce(
                `${voiceError.userFriendlyMessage}\n\n💡 *${voiceError.suggestion}*`,
                `${stripForSpeech(voiceError.userFriendlyMessage)} ${voiceError.suggestion}`
            );
        } else {
            announce(
                "Voice input ran into an issue! 🎤\n\n💡 *No worries – you can type your message using text mode instead.*",
                'Voice input ran into an issue. You can type your message instead.'
            );
        }

        console.error('Voice input error:', errorMessage);
    }, [announce]);

    const startVoiceInput = useCallback(() => {
        if (!voiceSupported) {
            announce(
                isSpeechRecognitionSupported()
                    ? "This browser can't read answers aloud. 🔇\n\n💡 *Voice input still works, or just use text mode.*"
                    : "Voice input isn't supported in this browser! 🔇\n\n💡 *Chrome, Edge or Safari support it — or use text mode.*",
                isSpeechRecognitionSupported()
                    ? ''
                    : "Voice input isn't supported in this browser. Chrome, Edge or Safari support it, or you can type instead."
            );
            return;
        }

        // Speaking over the visitor is rude: stop the answer when they talk.
        cancelSpeaking();
        if (voiceEnabled) primeSpeechSynthesis();
        setState('listening');
        interimTranscriptRef.current = '';

        void checkMicrophonePermission().then((permission) => {
            if (permission === 'denied') {
                stopListening();
                setState('idle');
                announce(
                    'Microphone access is blocked! 🔒\n\n💡 *Allow it from the padlock icon in your address bar, then tap the mic again.*',
                    'Microphone access is blocked. Allow it from the padlock icon in your address bar, then tap the mic again.'
                );
            }
        });

        startListening(
            (transcript, isFinal) => {
                setCaption({ text: transcript, source: 'user' });

                if (isFinal) {
                    // Clear immediately so stopVoiceInput can't resend it.
                    interimTranscriptRef.current = '';
                    void processInput(transcript);
                    setTimeout(() => setCaption(null), 1200);
                } else {
                    interimTranscriptRef.current = transcript;
                }
            },
            (errorMessage, voiceError) => {
                setCaption(null);
                handleVoiceError(errorMessage, voiceError);
            },
            () => {
                // Only release the UI if we're still listening — by now the
                // answer may already be playing.
                setState((current) => (current === 'listening' ? 'idle' : current));
            }
        );
    }, [voiceSupported, voiceEnabled, processInput, handleVoiceError, announce]);

    // Start voice-to-text (fills input box instead of auto-sending)
    const transcriptCallbackRef = useRef<((text: string) => void) | null>(null);

    const startVoiceToText = useCallback((onTranscript: (text: string) => void) => {
        if (!voiceSupported) {
            announce(
                "Voice isn't supported in this browser! 🔇\n\n💡 *Try using Chrome, Edge, or Safari for voice features.*",
                "Voice isn't supported in this browser. Try Chrome, Edge or Safari."
            );
            return;
        }

        cancelSpeaking();
        setState('listening');
        interimTranscriptRef.current = '';
        transcriptCallbackRef.current = onTranscript;

        startListening(
            (transcript, isFinal) => {
                // Send interim results to the input as the visitor speaks
                transcriptCallbackRef.current?.(transcript);
                if (isFinal) {
                    interimTranscriptRef.current = '';
                    transcriptCallbackRef.current = null;
                    setState('idle');
                }
            },
            handleVoiceError,
            () => setState((current) => (current === 'listening' ? 'idle' : current))
        );
    }, [voiceSupported, handleVoiceError, announce]);

    const stopVoiceInput = useCallback(() => {
        const pendingTranscript = interimTranscriptRef.current.trim();
        const wasVoiceToText = transcriptCallbackRef.current !== null;

        stopListening();
        interimTranscriptRef.current = '';
        transcriptCallbackRef.current = null;
        setCaption(null);
        setState((current) => (current === 'listening' ? 'idle' : current));

        // In voice mode, stopping means "I'm done talking" — send it.
        if (pendingTranscript && !wasVoiceToText) {
            void processInput(pendingTranscript);
        }
    }, [processInput]);

    // Clear messages and reset conversation context
    const clearMessages = useCallback(() => {
        abortRef.current?.abort();
        requestIdRef.current++;
        setMessages([]);
        setHasShownWelcome(false);
        setIsLoading(false);
        historyRef.current = []; // Reset conversation memory
    }, []);

    const value: AssistantContextType = {
        messages,
        state,
        caption,
        isOpen,
        voiceEnabled,
        voiceSupported,
        isLoading,
        isSpeaking: state === 'speaking',
        sendMessage,
        startVoiceInput,
        startVoiceToText,
        stopVoiceInput,
        stopSpeaking,
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
