/**
 * Query Classifier
 * Lightweight rule-based classification system
 * Categorizes user input into: portfolio, utility, casual, or world
 */

// ============ Types ============

export type QueryCategory = 'portfolio' | 'utility' | 'casual' | 'world';

export interface ClassifiedQuery {
    category: QueryCategory;
    normalizedInput: string;
    originalInput: string;
    metadata?: Record<string, unknown>;
}

// ============ Input Normalization ============

export const normalizeQueryInput = (input: string): string => {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^\w\s+\-*/%^().?!]/g, ' ')  // Keep math operators and punctuation
        .replace(/\s+/g, ' ');
};

// ============ Pattern Definitions ============

// Utility patterns - math, time, date, robot identity
const UTILITY_PATTERNS = {
    // Math expressions
    math: [
        /^[\d\s+\-*/%^().]+$/,  // Pure math expression like "2 + 2"
        /what\s*(?:is|'s|are)?\s*[\d\s+\-*/%^().]+/i,  // "what is 2 + 2"
        /calculate\s+[\d\s+\-*/%^().]+/i,  // "calculate 15 * 3"
        /(?:add|subtract|multiply|divide|plus|minus|times)\s+\d+/i,
        /\d+\s*(?:\+|\-|\*|\/|\%|\^)\s*\d+/,  // Direct expression "5 + 3"
    ],
    // Time queries - must be explicitly asking for time
    time: [
        /^what\s*(?:is|'s)?\s*(?:the\s*)?(?:current\s*)?time\??$/i,
        /^(?:tell\s*me\s*)?(?:the\s*)?time\s*(?:now|please)?\??$/i,
        /^what\s*time\s*is\s*it\??$/i,
        /^(?:current\s*)?time\??$/i,
    ],
    // Date queries - must be explicitly asking for date
    date: [
        /^what\s*(?:is|'s)?\s*(?:the\s*)?(?:current\s*)?date\??$/i,
        /^(?:what\s*(?:is|'s)?\s*)?today'?s?\s*date\??$/i,
        /^what\s*day\s*(?:is\s*it|of\s*the\s*week)\??$/i,
        /^what\s*day\s*is\s*(?:it\s*)?today\??$/i,
        /^(?:current\s*)?date\??$/i,
    ],
    // Robot/identity questions - questions about the bot itself
    identity: [
        /are\s*you\s*(?:a\s*)?(?:robot|bot|ai|human|real|machine)/i,
        /what\s*are\s*you/i,
        /are\s*you\s*alive/i,
        /do\s*you\s*have\s*(?:feelings|emotions)/i,
        // Self-awareness patterns
        /^who\s*are\s*you\??$/i,  // "who are you" exactly
        /^tell\s*(?:me\s*)?about\s*yourself\??$/i,  // "tell me about yourself"
        /^(?:what'?s?\s*)?your\s*name\??$/i,  // "what's your name"
        /^introduce\s*yourself\??$/i,  // "introduce yourself"
        /^describe\s*yourself\??$/i,  // "describe yourself"
        /^what\s*(?:do\s*)?you\s*do\??$/i,  // "what do you do"
        /^who\s*(?:made|created|built)\s*you\??$/i,  // "who made you"
        /^what\s*can\s*you\s*(?:do|help\s*with)\??$/i,  // "what can you do"
    ],
};

// Casual patterns - greetings, small talk, farewells
const CASUAL_PATTERNS = {
    greetings: [
        /^(?:hi|hello|hey|hola|namaste|howdy|yo|sup|hiya|greetings)(?:\s|!|$)/i,
        /^good\s*(?:morning|afternoon|evening|night)/i,
        /^what'?s?\s*up/i,
    ],
    wellbeing: [
        /how\s*(?:are\s*you|r\s*u|'?re\s*you)/i,
        /how\s*(?:are\s*)?(?:you\s*)?doing/i,
        /how\s*(?:is\s*)?(?:it\s*)?going/i,
        /you\s*(?:ok|okay|good|fine)/i,
    ],
    farewells: [
        /^(?:bye|goodbye|cya|see\s*ya|later|adios|peace|take\s*care|gotta\s*go)/i,
        /^(?:good\s*)?night/i,
    ],
    gratitude: [
        /^(?:thanks?|thank\s*you|thx|ty|appreciate)/i,
    ],
};

// Portfolio keywords - anything related to Hakkan's portfolio
const PORTFOLIO_KEYWORDS = [
    // Core topics
    'project', 'projects', 'portfolio', 'skill', 'skills', 'experience', 'work',
    'education', 'degree', 'college', 'university', 'certification', 'certifications',
    'contact', 'email', 'phone', 'github', 'linkedin',

    // Names and specific terms
    'hakkan', 'about', 'introduce', 'who is', 'tell me about',

    // Project names (including typos and voice variants)
    'mockhick', 'mock hick', 'maukhik', 'moukhik', 'mokhik', 'mokhick', 'mock interview',
    'buildmycv', 'build my cv', 'cvbanao', 'cv banao', 'resume builder', 'cv builder', 'cv maker',
    'verifyai', 'verify ai', 'deepfake', 'fake news', 'ai detector', 'fake detector',
    'confesscode', 'confess code', 'confession', 'confessions', 'anonymous confession',
    'mememate', 'meme mate', 'meme dating', 'dating app', 'meme app',
    'aluchat', 'alu chat', 'chatbot', 'ai chatbot', 'alu',
    'reelxtract', 'reel xtract', 'reels downloader', 'instagram downloader', 'reel download',
    'mathomatic', 'math o matic', 'calculator', 'scientific calculator',
    'jhatu', 'hit the jhatu', 'jhatu game', 'whack game', 'jaatu',

    // Tech terms in context
    'tech stack', 'technologies', 'frontend', 'backend', 'database',
    'internship', 'job', 'career', 'built', 'created', 'developed',

    // Navigation
    'navigate', 'go to', 'show me', 'scroll to', 'section',

    // Help within portfolio context
    'help', 'what can you', 'how to use',
];

// ============ Classification Logic ============

const matchesAnyPattern = (input: string, patterns: RegExp[]): boolean => {
    return patterns.some(pattern => pattern.test(input));
};

const containsAnyKeyword = (input: string, keywords: string[]): boolean => {
    const normalized = input.toLowerCase();
    return keywords.some(keyword => normalized.includes(keyword.toLowerCase()));
};

const isMathExpression = (input: string): boolean => {
    const normalized = normalizeQueryInput(input);

    // First, check for explicit math request patterns
    // These are reliable indicators of math intent
    const explicitMathPatterns = [
        /^[\d\s+\-*/%^().]+$/,  // Pure math expression like "2 + 2"
        /^what\s*(?:is|'s)\s*\d+\s*[\+\-\*\/\%\^]\s*\d+/i,  // "what is 5 + 3"
        /^calculate\s+\d/i,  // "calculate 15 * 3"
        /^compute\s+\d/i,    // "compute 10 / 2"
        /^solve\s+\d/i,      // "solve 8 - 3"
        /^\d+\s*[\+\-\*\/\%\^]\s*\d+$/,  // Just "5 + 3" (pure expression)
    ];

    if (explicitMathPatterns.some(p => p.test(normalized))) {
        return true;
    }

    // Check for word-based math operations with numbers
    const wordMathPatterns = [
        /^(?:what\s*(?:is|'s)\s*)?\d+\s*(?:plus|minus|times|divided\s*by|multiplied\s*by)\s*\d+/i,
        /^add\s+\d+\s*(?:and|to|plus)\s*\d+/i,
        /^subtract\s+\d+\s*from\s*\d+/i,
        /^multiply\s+\d+\s*(?:by|times|and)\s*\d+/i,
        /^divide\s+\d+\s*by\s*\d+/i,
    ];

    if (wordMathPatterns.some(p => p.test(normalized))) {
        return true;
    }

    // Must have at least two numbers separated by an operator to be considered math
    // This prevents false positives from text that happens to contain numbers
    const strictMathPattern = /\d+\s*[\+\*\/\%\^]\s*\d+/;  // Note: excluding - as it's too common
    const multiplicationDivision = /\d+\s*[\*\/]\s*\d+/;
    const explicitAddition = /\d+\s*\+\s*\d+/;
    const powerOperation = /\d+\s*\^\s*\d+/;

    return strictMathPattern.test(normalized) ||
        multiplicationDivision.test(normalized) ||
        explicitAddition.test(normalized) ||
        powerOperation.test(normalized);
};

const isTimeQuery = (input: string): boolean => {
    return matchesAnyPattern(input, UTILITY_PATTERNS.time);
};

const isDateQuery = (input: string): boolean => {
    return matchesAnyPattern(input, UTILITY_PATTERNS.date);
};

const isIdentityQuery = (input: string): boolean => {
    return matchesAnyPattern(input, UTILITY_PATTERNS.identity);
};

const isGreeting = (input: string): boolean => {
    return matchesAnyPattern(input, CASUAL_PATTERNS.greetings);
};

const isWellbeingQuery = (input: string): boolean => {
    return matchesAnyPattern(input, CASUAL_PATTERNS.wellbeing);
};

const isFarewell = (input: string): boolean => {
    return matchesAnyPattern(input, CASUAL_PATTERNS.farewells);
};

const isGratitude = (input: string): boolean => {
    return matchesAnyPattern(input, CASUAL_PATTERNS.gratitude);
};

const isPortfolioQuery = (input: string): boolean => {
    return containsAnyKeyword(input, PORTFOLIO_KEYWORDS);
};

// ============ Main Classifier ============

/**
 * Classifies a user query into one of four categories:
 * - portfolio: Questions answerable from portfolio data
 * - utility: Math, date, time, simple factual operations
 * - casual: Greetings, small talk, farewells
 * - world: General knowledge or opinion questions (fallback)
 * 
 * Classification priority:
 * 1. Utility (specific patterns take precedence)
 * 2. Casual (conversational patterns)
 * 3. Portfolio (keyword matching)
 * 4. World (fallback for everything else)
 */
export const classifyQuery = (input: string): ClassifiedQuery => {
    const normalizedInput = normalizeQueryInput(input);
    const originalInput = input;

    // Check for empty input
    if (!normalizedInput.trim()) {
        return {
            category: 'casual',
            normalizedInput,
            originalInput,
            metadata: { subtype: 'empty' },
        };
    }

    // 1. UTILITY - Check for math, time, date, identity
    if (isMathExpression(normalizedInput)) {
        return {
            category: 'utility',
            normalizedInput,
            originalInput,
            metadata: { subtype: 'math' },
        };
    }

    if (isTimeQuery(normalizedInput)) {
        return {
            category: 'utility',
            normalizedInput,
            originalInput,
            metadata: { subtype: 'time' },
        };
    }

    if (isDateQuery(normalizedInput)) {
        return {
            category: 'utility',
            normalizedInput,
            originalInput,
            metadata: { subtype: 'date' },
        };
    }

    if (isIdentityQuery(normalizedInput)) {
        return {
            category: 'utility',
            normalizedInput,
            originalInput,
            metadata: { subtype: 'identity' },
        };
    }

    // 2. CASUAL - Check for greetings, wellbeing, farewells, gratitude
    if (isGreeting(normalizedInput)) {
        return {
            category: 'casual',
            normalizedInput,
            originalInput,
            metadata: { subtype: 'greeting' },
        };
    }

    if (isWellbeingQuery(normalizedInput)) {
        return {
            category: 'casual',
            normalizedInput,
            originalInput,
            metadata: { subtype: 'wellbeing' },
        };
    }

    if (isFarewell(normalizedInput)) {
        return {
            category: 'casual',
            normalizedInput,
            originalInput,
            metadata: { subtype: 'farewell' },
        };
    }

    if (isGratitude(normalizedInput)) {
        return {
            category: 'casual',
            normalizedInput,
            originalInput,
            metadata: { subtype: 'gratitude' },
        };
    }

    // 3. PORTFOLIO - Check for portfolio-related keywords
    if (isPortfolioQuery(normalizedInput)) {
        return {
            category: 'portfolio',
            normalizedInput,
            originalInput,
        };
    }

    // 4. WORLD - Fallback for general knowledge/opinion questions
    return {
        category: 'world',
        normalizedInput,
        originalInput,
    };
};

// ============ Exports ============

export default classifyQuery;
