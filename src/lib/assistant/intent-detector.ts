/**
 * Intent Detection System
 * Pattern-based intent detection for the portfolio assistant
 * No external APIs - uses keyword matching and pattern recognition
 */

export type IntentType =
    | 'greeting'
    | 'about'
    | 'projects'
    | 'project_detail'
    | 'skills'
    | 'experience'
    | 'education'
    | 'certifications'
    | 'contact'
    | 'navigation'
    | 'help'
    | 'thanks'
    | 'goodbye'
    | 'unknown';

export interface DetectedIntent {
    intent: IntentType;
    confidence: number;
    params: Record<string, string>;
    originalInput: string;
}

// ============ Input Normalization ============

export const normalizeInput = (input: string): string => {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, ' ') // Remove punctuation
        .replace(/\s+/g, ' '); // Normalize whitespace
};

// ============ Intent Patterns ============

interface IntentPattern {
    intent: IntentType;
    patterns: RegExp[];
    keywords: string[];
    extractParams?: (input: string) => Record<string, string>;
}

const intentPatterns: IntentPattern[] = [
    {
        intent: 'greeting',
        patterns: [
            /^(hi|hello|hey|greetings|howdy|hola|namaste)/i,
            /good\s*(morning|afternoon|evening)/i,
            /what'?s?\s*up/i,
        ],
        keywords: ['hi', 'hello', 'hey', 'greetings', 'howdy'],
    },
    {
        intent: 'about',
        patterns: [
            /who\s*(are|is)\s*(you|hakkan)/i,
            /tell\s*(me)?\s*about\s*(yourself|you|hakkan)/i,
            /introduce\s*(yourself)?/i,
            /what\s*(do|does)\s*(you|hakkan)\s*do/i,
            /describe\s*(yourself|hakkan)/i,
        ],
        keywords: ['who', 'about', 'yourself', 'introduce', 'background'],
    },
    {
        intent: 'projects',
        patterns: [
            /what\s*(are|have)\s*(your|the)?\s*projects/i,
            /show\s*(me)?\s*(your|the)?\s*projects/i,
            /tell\s*(me)?\s*about\s*(your|the)?\s*projects/i,
            /what\s*(have)?\s*(you|hakkan)\s*(built|created|made|worked\s*on)/i,
            /portfolio\s*(work|projects)?/i,
        ],
        keywords: ['projects', 'portfolio', 'built', 'created', 'work', 'apps', 'applications'],
    },
    {
        intent: 'project_detail',
        patterns: [
            /tell\s*(me)?\s*(more)?\s*about\s+(\w+)/i,
            /what\s*is\s+(\w+)/i,
            /explain\s+(\w+)/i,
        ],
        keywords: [],
        extractParams: (input: string): Record<string, string> => {
            const projectNames = ['mockhick', 'buildmycv', 'verifyai', 'confesscode', 'mememate', 'aluchat', 'reelxtract', 'math-o-matic', 'hit-the-jhatu'];
            const normalized = normalizeInput(input);
            for (const name of projectNames) {
                if (normalized.includes(name.toLowerCase())) {
                    return { projectName: name };
                }
            }
            return {} as Record<string, string>;
        },
    },
    {
        intent: 'skills',
        patterns: [
            /what\s*(are|is)\s*(your|the)?\s*skills/i,
            /what\s*technologies\s*(do\s*you\s*(know|use))?/i,
            /what\s*can\s*(you|hakkan)\s*do/i,
            /tech\s*stack/i,
            /programming\s*languages/i,
            /what\s*(do\s*you|tools)\s*(use|know)/i,
        ],
        keywords: ['skills', 'technologies', 'tech', 'stack', 'programming', 'languages', 'tools', 'expertise'],
    },
    {
        intent: 'experience',
        patterns: [
            /what\s*(is|about)\s*(your|the)?\s*experience/i,
            /where\s*(have|did)\s*(you|hakkan)\s*work(ed)?/i,
            /work\s*history/i,
            /internship/i,
            /professional\s*experience/i,
            /job\s*experience/i,
        ],
        keywords: ['experience', 'work', 'job', 'internship', 'career', 'professional', 'employment'],
    },
    {
        intent: 'education',
        patterns: [
            /what\s*(is|about)\s*(your|the)?\s*education/i,
            /where\s*did\s*(you|hakkan)\s*study/i,
            /what\s*degree/i,
            /college|university/i,
            /educational\s*background/i,
            /qualifications/i,
        ],
        keywords: ['education', 'degree', 'college', 'university', 'study', 'school', 'qualifications'],
    },
    {
        intent: 'certifications',
        patterns: [
            /what\s*(are|about)\s*(your|the)?\s*certifications/i,
            /certificates/i,
            /what\s*courses/i,
            /training/i,
        ],
        keywords: ['certifications', 'certificates', 'courses', 'training', 'credentials'],
    },
    {
        intent: 'contact',
        patterns: [
            /how\s*(can|do)\s*(i|we)?\s*contact\s*(you|hakkan)?/i,
            /how\s*(can|to)\s*reach\s*(you|hakkan)?/i,
            /what\s*(is|are)\s*(your|the)?\s*(email|phone|contact)/i,
            /get\s*in\s*touch/i,
            /contact\s*(info|information|details)/i,
        ],
        keywords: ['contact', 'email', 'phone', 'reach', 'connect', 'linkedin', 'github'],
    },
    {
        intent: 'navigation',
        patterns: [
            /go\s*to\s+(\w+)/i,
            /navigate\s*to\s+(\w+)/i,
            /show\s*(me)?\s+(the)?\s*(\w+)\s*section/i,
            /take\s*me\s*to\s+(\w+)/i,
            /scroll\s*to\s+(\w+)/i,
        ],
        keywords: [],
        extractParams: (input: string): Record<string, string> => {
            const sections = ['home', 'about', 'experience', 'projects', 'skills', 'education', 'certifications', 'contact'];
            const normalized = normalizeInput(input);
            for (const section of sections) {
                if (normalized.includes(section)) {
                    return { section };
                }
            }
            return {} as Record<string, string>;
        },
    },
    {
        intent: 'help',
        patterns: [
            /what\s*can\s*(you|this\s*assistant)\s*do/i,
            /help(\s*me)?/i,
            /what\s*(are|is)\s*(the)?\s*(commands|options)/i,
            /how\s*do\s*(i|you)\s*use\s*this/i,
        ],
        keywords: ['help', 'commands', 'options', 'guide', 'assist'],
    },
    {
        intent: 'thanks',
        patterns: [
            /thank\s*(you|s)/i,
            /thanks/i,
            /appreciate/i,
        ],
        keywords: ['thanks', 'thank', 'appreciate', 'grateful'],
    },
    {
        intent: 'goodbye',
        patterns: [
            /bye/i,
            /goodbye/i,
            /see\s*you/i,
            /later/i,
            /take\s*care/i,
        ],
        keywords: ['bye', 'goodbye', 'later', 'cya'],
    },
];

// ============ Intent Detection ============

export const detectIntent = (input: string): DetectedIntent => {
    const normalizedInput = normalizeInput(input);
    const words = normalizedInput.split(' ');

    let bestMatch: DetectedIntent = {
        intent: 'unknown',
        confidence: 0,
        params: {},
        originalInput: input,
    };

    for (const pattern of intentPatterns) {
        let confidence = 0;
        let params: Record<string, string> = {};

        // Check regex patterns (high confidence)
        for (const regex of pattern.patterns) {
            if (regex.test(input)) {
                confidence = Math.max(confidence, 0.9);
                break;
            }
        }

        // Check keywords (medium confidence)
        const matchedKeywords = pattern.keywords.filter((kw) =>
            words.some((word) => word.includes(kw) || kw.includes(word))
        );
        if (matchedKeywords.length > 0) {
            const keywordConfidence = 0.5 + (matchedKeywords.length * 0.1);
            confidence = Math.max(confidence, Math.min(keywordConfidence, 0.8));
        }

        // Extract params if applicable
        if (pattern.extractParams && confidence > 0) {
            params = pattern.extractParams(input);
            if (Object.keys(params).length > 0) {
                confidence = Math.min(confidence + 0.1, 1.0);
            }
        }

        // Update best match
        if (confidence > bestMatch.confidence) {
            bestMatch = {
                intent: pattern.intent,
                confidence,
                params,
                originalInput: input,
            };
        }
    }

    return bestMatch;
};

// ============ Quick Intent Check ============

export const isGreeting = (input: string): boolean => {
    const result = detectIntent(input);
    return result.intent === 'greeting' && result.confidence > 0.5;
};

export const isQuestion = (input: string): boolean => {
    const questionWords = ['what', 'who', 'where', 'when', 'why', 'how', 'which', 'can', 'do', 'does', 'is', 'are'];
    const normalized = normalizeInput(input);
    return questionWords.some((w) => normalized.startsWith(w)) || input.includes('?');
};
