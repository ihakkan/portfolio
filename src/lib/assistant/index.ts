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
    generateEnhancedSpeech,
    isAffirmativeResponse,
    isNegativeResponse,
    isChoiceDelegation,
    setSuggestedTopic,
    clearSuggestedTopic,
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

// New Hybrid AI Backend exports
export { classifyQuery, type QueryCategory, type ClassifiedQuery } from './query-classifier';
export { routeQuery, processQuery, type RouteResult } from './query-router';
export { processUtilityQuery, type UtilityResponse } from './utility-engine';
export { processCasualQuery, type CasualResponse } from './casual-engine';
export { processWorldQuery, type WorldResponse } from './world-engine';
export {
    handlePersonalityQuery,
    detectPersonalityCategory,
    type PersonalityCategory,
    type PersonalityResponse
} from './personality-engine';
