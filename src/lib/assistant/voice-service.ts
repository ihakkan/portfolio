/**
 * Voice Service
 * Browser-native speech recognition and synthesis
 * Uses Web Speech API with optimized settings for human-like voice
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

export interface VoiceError {
    code: string;
    message: string;
    userFriendlyMessage: string;
    suggestion: string;
}

// ============ Error Mappings ============

const getVoiceError = (errorCode: string): VoiceError => {
    const errors: Record<string, VoiceError> = {
        'no-speech': {
            code: 'no-speech',
            message: 'No speech detected',
            userFriendlyMessage: "I didn't hear anything! 🎤",
            suggestion: "Try speaking closer to your microphone, or switch to text mode.",
        },
        'audio-capture': {
            code: 'audio-capture',
            message: 'No microphone found',
            userFriendlyMessage: "Can't find your microphone! 🎙️",
            suggestion: "Please check if your microphone is connected and working.",
        },
        'not-allowed': {
            code: 'not-allowed',
            message: 'Microphone access denied',
            userFriendlyMessage: "Microphone access is blocked! 🔒",
            suggestion: "Please allow microphone permissions in your browser settings.",
        },
        'network': {
            code: 'network',
            message: 'Network error during speech recognition',
            userFriendlyMessage: "Having trouble connecting! 🌐",
            suggestion: "Please check your internet connection, or try text mode instead.",
        },
        'service-not-allowed': {
            code: 'service-not-allowed',
            message: 'Speech recognition service not allowed',
            userFriendlyMessage: "Voice service unavailable! ⚠️",
            suggestion: "Try using a different browser like Chrome, or use text mode.",
        },
        'bad-grammar': {
            code: 'bad-grammar',
            message: 'Grammar error in speech recognition',
            userFriendlyMessage: "Had trouble understanding that! 🤔",
            suggestion: "Try speaking more clearly, or type your message instead.",
        },
        'language-not-supported': {
            code: 'language-not-supported',
            message: 'Language not supported',
            userFriendlyMessage: "This language isn't supported! 🗣️",
            suggestion: "Try speaking in English, or use text mode.",
        },
        'aborted': {
            code: 'aborted',
            message: 'Recognition aborted',
            userFriendlyMessage: '',
            suggestion: '',
        },
        'default': {
            code: 'unknown',
            message: 'Unknown speech recognition error',
            userFriendlyMessage: "Something went wrong with voice input! 😅",
            suggestion: "No worries! You can type your message using text mode.",
        },
    };

    return errors[errorCode] || errors['default'];
};

export { getVoiceError };

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

// ============ Speech Recognition (Improved) ============

let recognition: any = null;
let isListening = false;
let recognitionTimeout: NodeJS.Timeout | null = null;

export const startListening = (
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string, voiceError?: VoiceError) => void,
    onEnd?: () => void,
    options: VoiceServiceOptions = {}
): boolean => {
    if (!isSpeechRecognitionSupported()) {
        const error = getVoiceError('service-not-allowed');
        onError(error.message, error);
        return false;
    }

    // Stop any existing recognition
    stopListening();

    try {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        recognition = new SpeechRecognition();

        // Improved settings for better recognition
        // Using Indian English (en-IN) for better recognition of Indian accents
        recognition.lang = options.lang || 'en-IN';
        recognition.continuous = true; // Keep listening for better results
        recognition.interimResults = true; // Show partial results
        recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy

        recognition.onstart = () => {
            isListening = true;
            // Set a timeout to auto-stop if no speech (prevents hanging)
            recognitionTimeout = setTimeout(() => {
                if (isListening) {
                    stopListening();
                    const error = getVoiceError('no-speech');
                    onError(error.message, error);
                }
            }, 10000); // 10 second timeout
        };

        recognition.onresult = (event: any) => {
            // Clear timeout since we got a result
            if (recognitionTimeout) {
                clearTimeout(recognitionTimeout);
                recognitionTimeout = null;
            }

            const results = event.results;
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < results.length; i++) {
                const transcript = results[i][0].transcript;
                if (results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Send final result
            if (finalTranscript) {
                onResult(finalTranscript.trim(), true);
                // Auto-stop after getting final result
                stopListening();
            } else if (interimTranscript) {
                // Send interim results for UI feedback
                onResult(interimTranscript, false);
            }
        };

        recognition.onerror = (event: any) => {
            isListening = false;
            if (recognitionTimeout) {
                clearTimeout(recognitionTimeout);
                recognitionTimeout = null;
            }

            const voiceError = getVoiceError(event.error);

            // Skip aborted - user cancelled
            if (event.error === 'aborted') {
                return;
            }

            onError(voiceError.message, voiceError);
        };

        recognition.onend = () => {
            isListening = false;
            if (recognitionTimeout) {
                clearTimeout(recognitionTimeout);
                recognitionTimeout = null;
            }
            onEnd?.();
        };

        // Additional event for audio start (helps with debugging)
        recognition.onaudiostart = () => {
            console.log('Audio capture started');
        };

        recognition.onsoundstart = () => {
            console.log('Sound detected');
        };

        recognition.onspeechstart = () => {
            console.log('Speech detected');
            // Clear timeout when speech is detected
            if (recognitionTimeout) {
                clearTimeout(recognitionTimeout);
                recognitionTimeout = null;
            }
        };

        recognition.start();
        return true;
    } catch (error) {
        const voiceError = getVoiceError('default');
        onError(voiceError.message, voiceError);
        return false;
    }
};

export const stopListening = (): void => {
    if (recognitionTimeout) {
        clearTimeout(recognitionTimeout);
        recognitionTimeout = null;
    }
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

// ============ Speech Synthesis (Improved Sync) ============

let currentUtterance: SpeechSynthesisUtterance | null = null;
let cachedVoice: SpeechSynthesisVoice | null = null;
let isSpeakingActive = false;

// Voice preferences ordered by quality/naturalness
const PREFERRED_VOICES = [
    // High-quality neural/natural voices
    'Google UK English Female',
    'Google UK English Male',
    'Google US English',
    'Microsoft Zira',
    'Microsoft David',
    'Samantha', // macOS
    'Karen', // macOS Australian
    'Daniel', // macOS British
    'Moira', // macOS Irish
    // Fallback options
    'Google',
    'Microsoft',
    'Alex', // macOS
];

const findBestVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    // First, try to find a preferred voice
    for (const preferred of PREFERRED_VOICES) {
        const match = voices.find(
            (v) => v.name.includes(preferred) && v.lang.startsWith('en')
        );
        if (match) return match;
    }

    // Look for any English neural/natural voice
    const englishVoices = voices.filter((v) => v.lang.startsWith('en'));

    // Prefer voices marked as "natural" or "neural"
    const naturalVoice = englishVoices.find(
        (v) =>
            v.name.toLowerCase().includes('natural') ||
            v.name.toLowerCase().includes('neural') ||
            v.name.toLowerCase().includes('premium')
    );
    if (naturalVoice) return naturalVoice;

    // Look for female voices (usually sound more pleasant for assistants)
    const femaleVoice = englishVoices.find(
        (v) =>
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('karen')
    );
    if (femaleVoice) return femaleVoice;

    // Return any English voice
    return englishVoices[0] || null;
};

export const speak = (
    text: string,
    onEnd?: () => void,
    onStart?: () => void,
    options: VoiceServiceOptions = {}
): boolean => {
    if (!isSpeechSynthesisSupported()) {
        onEnd?.();
        return false;
    }

    // Cancel any ongoing speech
    cancelSpeaking();

    try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.lang || 'en-US';

        // Cheerful, expressive voice settings
        // Higher pitch (1.15) for brighter, more cheerful sound
        // Slightly faster rate (1.0) for energetic delivery
        utterance.rate = options.voiceRate || 1.0;
        utterance.pitch = options.voicePitch || 1.15;
        utterance.volume = 1.0;

        // Use cached voice or find the best one
        const voices = window.speechSynthesis.getVoices();
        if (!cachedVoice || !voices.includes(cachedVoice)) {
            cachedVoice = findBestVoice(voices);
        }
        if (cachedVoice) {
            utterance.voice = cachedVoice;
        }

        // IMPORTANT: onstart is called when speech ACTUALLY begins
        utterance.onstart = () => {
            isSpeakingActive = true;
            onStart?.(); // NOW trigger the speaking state
        };

        utterance.onend = () => {
            isSpeakingActive = false;
            currentUtterance = null;
            onEnd?.();
        };

        utterance.onerror = (event) => {
            isSpeakingActive = false;
            currentUtterance = null;
            if (event.error !== 'interrupted' && event.error !== 'canceled') {
                console.error('Speech synthesis error:', event.error);
            }
            onEnd?.();
        };

        currentUtterance = utterance;

        // Chrome bug workaround: cancel any pending utterances first
        window.speechSynthesis.cancel();

        // Use requestAnimationFrame instead of setTimeout for better timing
        requestAnimationFrame(() => {
            window.speechSynthesis.speak(utterance);
        });

        return true;
    } catch (error) {
        console.error('Failed to speak:', error);
        onEnd?.();
        return false;
    }
};

export const cancelSpeaking = (): void => {
    isSpeakingActive = false;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    currentUtterance = null;
};

export const isCurrentlySpeaking = (): boolean => {
    if (typeof window === 'undefined') return false;
    return isSpeakingActive || (window.speechSynthesis?.speaking || false);
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
            cachedVoice = findBestVoice(voices);
            resolve(voices);
            return;
        }

        // Wait for voices to load
        window.speechSynthesis.onvoiceschanged = () => {
            const loadedVoices = window.speechSynthesis.getVoices();
            cachedVoice = findBestVoice(loadedVoices);
            resolve(loadedVoices);
        };

        // Fallback timeout
        setTimeout(() => {
            const loadedVoices = window.speechSynthesis.getVoices();
            cachedVoice = findBestVoice(loadedVoices);
            resolve(loadedVoices);
        }, 1000);
    });
};

// Get current voice info
export const getCurrentVoiceInfo = (): string => {
    if (cachedVoice) {
        return `${cachedVoice.name} (${cachedVoice.lang})`;
    }
    return 'Default system voice';
};
