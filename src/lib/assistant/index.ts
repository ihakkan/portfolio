// Assistant module exports
export { AssistantProvider, useAssistant } from './assistant-context';
export { detectIntent, normalizeInput, isQuestion, getSuggestions, type IntentType, type DetectedIntent } from './intent-detector';
export { generateResponse, getWelcomeMessage, getErrorResponse, type AssistantResponse } from './response-generator';
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
export {
    type ConversationContext,
    createEmptyContext,
    updateContext,
    optimizeForSpeech,
} from './smart-response-engine';
export {
    ABOUT_KNOWLEDGE,
    PROJECTS_KNOWLEDGE,
    SKILLS_KNOWLEDGE,
    EXPERIENCE_KNOWLEDGE,
    EDUCATION_KNOWLEDGE,
    CERTIFICATIONS_KNOWLEDGE,
    CONTACT_KNOWLEDGE,
    findProject,
    getProjectsByCategory,
    getRandomAboutVersion,
    getSkillCategory,
} from './knowledge-base';

