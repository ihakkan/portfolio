/**
 * Casual Conversation Engine
 * Handles greetings, small talk, and farewells
 * Uses a finite response bank - no deep conversation simulation
 */

import { optimizeForSpeech } from './smart-response-engine';

// ============ Types ============

export interface CasualResponse {
    text: string;
    speakText: string;
}

// ============ Utility Functions ============

const getRandomItem = <T>(items: T[]): T => {
    return items[Math.floor(Math.random() * items.length)];
};

const getTimeBasedGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Hello';
};

// ============ Response Banks ============

const GREETING_RESPONSES = [
    "👋 {greeting}! I'm Hakkan's Portfolio Assistant. What would you like to explore today?",
    "Hey there! {greeting}! Ready to discover Hakkan's amazing work? Ask me about his projects, skills, or experience!",
    "{greeting}! Welcome to Hakkan's portfolio. I know everything about his work – what interests you?",
    "Hi! 🚀 {greeting}! I'm here to help you learn about Hakkan's projects and skills. What catches your eye?",
];

const WELLBEING_RESPONSES = [
    "I'm doing great, thanks for asking! 😊 Ready to help you explore Hakkan's portfolio. What would you like to know?",
    "I'm fantastic! Always excited to talk about Hakkan's projects. What can I tell you about?",
    "Doing well! Thanks for checking in. 🙌 Now, how can I help you today?",
    "I'm wonderful! Let's explore some cool projects together. What interests you?",
];

const FAREWELL_RESPONSES = [
    "Goodbye! 👋 Thanks for visiting Hakkan's portfolio. Come back anytime!",
    "See you later! Don't forget to check out the live projects if you haven't already!",
    "Take care! Feel free to reach out to Hakkan through the contact section. Bye! 👋",
    "Bye! Hope you enjoyed exploring the portfolio. See you next time! ✨",
];

const GRATITUDE_RESPONSES = [
    "You're welcome! 😊 Happy to help. Is there anything else you'd like to know?",
    "No problem at all! Let me know if you need anything else.",
    "Glad I could help! Feel free to ask more questions anytime.",
    "Anytime! 🙌 Anything else you'd like to explore?",
];

const EMPTY_INPUT_RESPONSES = [
    "I'm here to help! Ask me about Hakkan's projects, skills, experience, or anything else in the portfolio.",
    "Need some ideas? Try asking about projects like MockHick or BuildMyCV, or explore Hakkan's technical skills!",
    "Ready when you are! Feel free to ask about anything in the portfolio.",
];

// ============ Handlers ============

const handleGreeting = (): CasualResponse => {
    const greeting = getTimeBasedGreeting();
    const template = getRandomItem(GREETING_RESPONSES);
    const text = template.replace('{greeting}', greeting);

    return {
        text,
        speakText: optimizeForSpeech(text),
    };
};

const handleWellbeing = (): CasualResponse => {
    const text = getRandomItem(WELLBEING_RESPONSES);
    return {
        text,
        speakText: optimizeForSpeech(text),
    };
};

const handleFarewell = (): CasualResponse => {
    const text = getRandomItem(FAREWELL_RESPONSES);
    return {
        text,
        speakText: optimizeForSpeech(text),
    };
};

const handleGratitude = (): CasualResponse => {
    const text = getRandomItem(GRATITUDE_RESPONSES);
    return {
        text,
        speakText: optimizeForSpeech(text),
    };
};

const handleEmptyInput = (): CasualResponse => {
    const text = getRandomItem(EMPTY_INPUT_RESPONSES);
    return {
        text,
        speakText: optimizeForSpeech(text),
    };
};

// ============ Main Handler ============

/**
 * Process a casual conversation query based on its subtype
 */
export const processCasualQuery = (
    subtype?: string
): CasualResponse => {
    switch (subtype) {
        case 'greeting':
            return handleGreeting();

        case 'wellbeing':
            return handleWellbeing();

        case 'farewell':
            return handleFarewell();

        case 'gratitude':
            return handleGratitude();

        case 'empty':
            return handleEmptyInput();

        default:
            // Default to a friendly greeting
            return handleGreeting();
    }
};

export default processCasualQuery;
