// Assistant module exports
//
// Note: `./profile` is deliberately NOT re-exported here. It is server-only —
// pulling it through this barrel would drag the whole grounding corpus into the
// client bundle. The API route imports it directly.

export { AssistantProvider, useAssistant } from './assistant-context';
export type { AssistantState, Message, Caption } from './assistant-context';

export {
    getWelcomeMessage,
    optimizeForSpeech,
    MAX_HISTORY_TURNS,
    type AssistantResponse,
    type Turn,
} from './types';

export { SECTION_IDS, getSectionId, type SectionId } from './sections';

export { askAssistant, AssistantApiError, type ChatErrorCode } from './chat-client';

export {
    startListening,
    stopListening,
    speak,
    cancelSpeaking,
    isVoiceSupported,
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
} from './voice-service';
