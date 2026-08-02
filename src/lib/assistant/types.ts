/**
 * The contract between the assistant backend and the UI.
 *
 * Everything downstream of a response — scroll-to-section, text-to-speech, the
 * cinematic captions, the 3D bot's state machine — is driven purely by these
 * three fields. Keeping the shape stable is what let the rule engine be swapped
 * for an LLM without touching the voice or rendering layers.
 */

import type { SectionId } from './sections';

export interface AssistantResponse {
    /** Rendered in the chat bubble. Only **bold** and *italic* are parsed. */
    text: string;
    /** Plain spoken variant, free of markdown, emoji and URLs. Fed to speak(). */
    speakText?: string;
    /** Optional scroll instruction. */
    action?: { type: 'navigate'; target: SectionId };
}

/** One turn of history sent back to the model for follow-up context. */
export interface Turn {
    role: 'user' | 'assistant';
    content: string;
}

/** How many turns of history to keep and send. */
export const MAX_HISTORY_TURNS = 8;

/**
 * Strips text down to something a speech synthesiser reads cleanly.
 * Moved verbatim from the old smart-response-engine.ts — it is the fallback
 * used when the model returns prose instead of the JSON contract.
 */
export const optimizeForSpeech = (text: string): string =>
    text
        // Remove markdown
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#{1,6}\s/g, '')
        // Handle line breaks
        .replace(/\n\n/g, '. ')
        .replace(/\n/g, '. ')
        // Clean up list formatting
        .replace(/^\d+\.\s/gm, '')
        .replace(/^[-•]\s/gm, '')
        // Clean up URLs (they don't sound good spoken)
        .replace(/https?:\/\/[^\s]+/g, 'the link in the portfolio')
        // Clean up email addresses
        .replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g, (match) =>
            match.replace('@', ' at ').replace(/\./g, ' dot ')
        )
        // Clean up emojis for cleaner speech
        .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
        // Normalize spaces
        .replace(/\s+/g, ' ')
        .trim();

export const getWelcomeMessage = (): AssistantResponse => ({
    text: "👋 Hey! I'm **Hakkan's Assistant**. Ask me about his work, his projects, or what he's building at Persist.",
    speakText: "Hey! I'm Hakkan's assistant. Ask me about his work, his projects, or what he's building at Persist.",
});
