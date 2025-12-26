// Assistant module exports
export { AssistantProvider, useAssistant } from './assistant-context';
export { detectIntent, normalizeInput, type IntentType, type DetectedIntent } from './intent-detector';
export { generateResponse, getWelcomeMessage, type AssistantResponse } from './response-generator';
export {
    startListening,
    stopListening,
    speak,
    cancelSpeaking,
    isVoiceSupported,
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
} from './voice-service';
export * from './portfolio-data';
