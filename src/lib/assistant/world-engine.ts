/**
 * World Question Engine
 * Handles out-of-scope questions gracefully
 * Never hallucinates facts - provides polite limitation messages
 */

import { optimizeForSpeech } from './smart-response-engine';

// ============ Types ============

export interface WorldResponse {
    text: string;
    speakText: string;
}

// ============ Utility Functions ============

const getRandomItem = <T>(items: T[]): T => {
    return items[Math.floor(Math.random() * items.length)];
};

// ============ Response Banks ============

// Polite limitation messages that redirect to portfolio
const LIMITATION_RESPONSES = [
    "That's an interesting question! 🤔 I'm specifically designed to help with Hakkan's portfolio though. Want to know about his **projects**, **skills**, or **experience** instead?",
    "Great question, but that's a bit outside my expertise! I'm Hakkan's portfolio assistant, so I know all about his work. Shall I tell you about his projects?",
    "I wish I could help with that! My specialty is Hakkan's portfolio – his projects, technical skills, work experience, and more. What would you like to explore?",
    "Hmm, I'm not quite equipped to answer that one. 😅 But I'd love to tell you about Hakkan's **projects** or **skills**! What sounds interesting?",
];

// For questions that seem to ask for opinions
const OPINION_RESPONSES = [
    "I don't really have personal opinions, but I can tell you lots about Hakkan's work! Want to hear about his projects or technical skills?",
    "That's a thought-provoking question! While I can't share opinions, I can definitely tell you about Hakkan's impressive portfolio. What interests you?",
    "I prefer to stick to facts about Hakkan's work rather than opinions. His projects are pretty cool though – want to hear about them?",
];

// For questions about current events or news
const CURRENT_EVENTS_RESPONSES = [
    "I don't have information about current events, but I'm fully up-to-date on Hakkan's portfolio! Ask me about his projects, skills, or how to get in touch.",
    "I can't help with news or current events, but I know everything about Hakkan's work. Want to explore his projects?",
];

// For questions about other people/celebrities
const OTHER_PEOPLE_RESPONSES = [
    "I only know about Hakkan! 😄 He's a full-stack developer with some really cool projects. Want to learn more about him?",
    "My expertise is limited to Hakkan's portfolio. But he's pretty interesting – want to know about his work or projects?",
];

// For completely random/absurd questions
const ABSURD_RESPONSES = [
    "Ha! That's a creative question. 😄 I'm just a portfolio assistant though, so let me redirect you – want to check out Hakkan's projects?",
    "Interesting thought! While I ponder that, how about exploring Hakkan's portfolio? He's got some cool projects!",
    "That's...quite a question! 🤔 I'll stick to what I know best – Hakkan's portfolio. What would you like to explore?",
];

// For "why" questions about life/existence
const PHILOSOPHICAL_RESPONSES = [
    "Ah, the big questions! 🌟 I'm more of a practical assistant though. How about something I can actually help with – like Hakkan's projects or skills?",
    "Philosophy is fascinating, but I'm better at talking about Hakkan's portfolio! Want to know about his technical skills or work experience?",
];

// ============ Detection Helpers ============

const isOpinionQuestion = (input: string): boolean => {
    const patterns = [
        /what\s*(do\s*you\s*)?(think|believe|feel)/i,
        /your\s*(opinion|thoughts|view)/i,
        /should\s*(i|we)/i,
        /is\s*it\s*(good|bad|better|worse)/i,
        /do\s*you\s*(like|prefer|recommend)/i,
    ];
    return patterns.some(p => p.test(input));
};

const isCurrentEventsQuestion = (input: string): boolean => {
    const keywords = ['news', 'today', 'yesterday', 'last week', 'recent', 'latest', 'happening', 'election', 'politics', 'stock', 'weather'];
    const lower = input.toLowerCase();
    return keywords.some(kw => lower.includes(kw));
};

const isOtherPersonQuestion = (input: string): boolean => {
    const patterns = [
        /who\s*is\s+(?!hakkan)/i,
        /tell\s*me\s*about\s+(?!hakkan|his|the|your)/i,
    ];
    // Exclude portfolio-related names
    const portfolioNames = ['hakkan', 'mockhick', 'buildmycv', 'verifyai', 'confesscode', 'mememate', 'aluchat'];
    const lower = input.toLowerCase();

    const matchesPattern = patterns.some(p => p.test(input));
    const isPortfolioRelated = portfolioNames.some(name => lower.includes(name));

    return matchesPattern && !isPortfolioRelated;
};

const isPhilosophicalQuestion = (input: string): boolean => {
    const patterns = [
        /meaning\s*of\s*life/i,
        /why\s*(are|do)\s*we/i,
        /what\s*is\s*(life|love|happiness|consciousness)/i,
        /exist(ence)?/i,
        /purpose\s*of/i,
    ];
    return patterns.some(p => p.test(input));
};

const isAbsurdQuestion = (input: string): boolean => {
    const keywords = ['unicorn', 'dragon', 'magic', 'teleport', 'fly', 'alien', 'zombie', 'vampire', 'time travel'];
    const lower = input.toLowerCase();
    return keywords.some(kw => lower.includes(kw));
};

// ============ Main Handler ============

/**
 * Process a world/out-of-scope question
 * Always provides a polite, helpful response that redirects to portfolio
 */
export const processWorldQuery = (input: string): WorldResponse => {
    // Check for specific question types
    if (isPhilosophicalQuestion(input)) {
        const text = getRandomItem(PHILOSOPHICAL_RESPONSES);
        return { text, speakText: optimizeForSpeech(text) };
    }

    if (isOpinionQuestion(input)) {
        const text = getRandomItem(OPINION_RESPONSES);
        return { text, speakText: optimizeForSpeech(text) };
    }

    if (isCurrentEventsQuestion(input)) {
        const text = getRandomItem(CURRENT_EVENTS_RESPONSES);
        return { text, speakText: optimizeForSpeech(text) };
    }

    if (isOtherPersonQuestion(input)) {
        const text = getRandomItem(OTHER_PEOPLE_RESPONSES);
        return { text, speakText: optimizeForSpeech(text) };
    }

    if (isAbsurdQuestion(input)) {
        const text = getRandomItem(ABSURD_RESPONSES);
        return { text, speakText: optimizeForSpeech(text) };
    }

    // Default limitation response
    const text = getRandomItem(LIMITATION_RESPONSES);
    return { text, speakText: optimizeForSpeech(text) };
};

export default processWorldQuery;
