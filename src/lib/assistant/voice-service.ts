/**
 * Voice Service
 * Browser-native speech recognition and synthesis
 * Uses Web Speech API - no external dependencies
 */

// ============ Types ============

export type VoiceState = 'idle' | 'listening' | 'speaking';

export interface VoiceServiceOptions {
    lang?: string;
    continuous?: boolean;
    interimResults?: boolean;
    voiceRate?: number;
    voicePitch?: number;
}

// ============ Browser Support Check ============

export const isSpeechRecognitionSupported = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!(
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
    );
};

export const isSpeechSynthesisSupported = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!window.speechSynthesis;
};

export const isVoiceSupported = (): boolean => {
    return isSpeechRecognitionSupported() && isSpeechSynthesisSupported();
};

// ============ Speech Recognition ============

let recognition: any = null;
let isListening = false;

export const startListening = (
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd?: () => void,
    options: VoiceServiceOptions = {}
): boolean => {
    if (!isSpeechRecognitionSupported()) {
        onError('Speech recognition is not supported in this browser');
        return false;
    }

    // Stop any existing recognition
    stopListening();

    try {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        recognition = new SpeechRecognition();
        recognition.lang = options.lang || 'en-US';
        recognition.continuous = options.continuous || false;
        recognition.interimResults = options.interimResults !== false;

        recognition.onstart = () => {
            isListening = true;
        };

        recognition.onresult = (event: any) => {
            const results = event.results;
            for (let i = event.resultIndex; i < results.length; i++) {
                const transcript = results[i][0].transcript;
                const isFinal = results[i].isFinal;
                onResult(transcript, isFinal);
            }
        };

        recognition.onerror = (event: any) => {
            isListening = false;

            // Handle common errors gracefully
            switch (event.error) {
                case 'no-speech':
                    onError('No speech detected. Please try again.');
                    break;
                case 'audio-capture':
                    onError('No microphone found. Please check your device.');
                    break;
                case 'not-allowed':
                    onError('Microphone access denied. Please allow microphone permissions.');
                    break;
                case 'aborted':
                    // User cancelled - not an error to show
                    break;
                default:
                    onError(`Speech recognition error: ${event.error}`);
            }
        };

        recognition.onend = () => {
            isListening = false;
            onEnd?.();
        };

        recognition.start();
        return true;
    } catch (error) {
        onError('Failed to start speech recognition');
        return false;
    }
};

export const stopListening = (): void => {
    if (recognition) {
        try {
            recognition.stop();
        } catch (e) {
            // Ignore errors when stopping
        }
        recognition = null;
    }
    isListening = false;
};

export const isCurrentlyListening = (): boolean => {
    return isListening;
};

// ============ Speech Synthesis ============

let currentUtterance: SpeechSynthesisUtterance | null = null;

export const speak = (
    text: string,
    onEnd?: () => void,
    onStart?: () => void,
    options: VoiceServiceOptions = {}
): boolean => {
    if (!isSpeechSynthesisSupported()) {
        return false;
    }

    // Cancel any ongoing speech
    cancelSpeaking();

    try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.lang || 'en-US';
        utterance.rate = options.voiceRate || 1.0;
        utterance.pitch = options.voicePitch || 1.0;

        // Try to find a natural-sounding voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
            (v) =>
                (v.name.includes('Google') || v.name.includes('Microsoft')) &&
                v.lang.startsWith('en')
        );
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
            onStart?.();
        };

        utterance.onend = () => {
            currentUtterance = null;
            onEnd?.();
        };

        utterance.onerror = (event) => {
            currentUtterance = null;
            if (event.error !== 'interrupted') {
                console.error('Speech synthesis error:', event.error);
            }
            onEnd?.();
        };

        currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
        return true;
    } catch (error) {
        console.error('Failed to speak:', error);
        return false;
    }
};

export const cancelSpeaking = (): void => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    currentUtterance = null;
};

export const isCurrentlySpeaking = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.speechSynthesis?.speaking || false;
};

// ============ Voice List ============

export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
    if (!isSpeechSynthesisSupported()) return [];
    return window.speechSynthesis.getVoices();
};

// Preload voices (needed for some browsers)
export const preloadVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
        if (!isSpeechSynthesisSupported()) {
            resolve([]);
            return;
        }

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            resolve(voices);
            return;
        }

        // Wait for voices to load
        window.speechSynthesis.onvoiceschanged = () => {
            resolve(window.speechSynthesis.getVoices());
        };

        // Fallback timeout
        setTimeout(() => {
            resolve(window.speechSynthesis.getVoices());
        }, 1000);
    });
};
