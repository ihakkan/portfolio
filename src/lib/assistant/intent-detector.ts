/**
 * Intent Detection System
 * Advanced pattern-based intent detection with fuzzy matching
 * No external APIs - uses keyword matching, pattern recognition, and similarity scoring
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
    suggestedTopics?: string[]; // For unknown intents, suggest close matches
}

// ============ Input Normalization ============

export const normalizeInput = (input: string): string => {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, ' ') // Remove punctuation
        .replace(/\s+/g, ' '); // Normalize whitespace
};

// ============ Fuzzy Matching (Levenshtein Distance) ============

const levenshteinDistance = (str1: string, str2: string): number => {
    const m = str1.length;
    const n = str2.length;

    // Create matrix
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    // Initialize first row and column
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // Fill the matrix
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],     // deletion
                    dp[i][j - 1],     // insertion
                    dp[i - 1][j - 1]  // substitution
                );
            }
        }
    }

    return dp[m][n];
};

const getSimilarity = (str1: string, str2: string): number => {
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1;
    const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    return 1 - distance / maxLen;
};

// Check if a word approximately matches any in a list
const fuzzyMatchWord = (word: string, targets: string[], threshold = 0.7): { match: string | null; score: number } => {
    let bestMatch: string | null = null;
    let bestScore = 0;

    for (const target of targets) {
        const similarity = getSimilarity(word, target);
        if (similarity > bestScore && similarity >= threshold) {
            bestScore = similarity;
            bestMatch = target;
        }
    }

    return { match: bestMatch, score: bestScore };
};

// ============ Intent Patterns ============

interface IntentPattern {
    intent: IntentType;
    patterns: RegExp[];
    keywords: string[];
    fuzzyKeywords?: string[]; // Additional keywords for fuzzy matching
    extractParams?: (input: string) => Record<string, string>;
}

const intentPatterns: IntentPattern[] = [
    {
        intent: 'greeting',
        patterns: [
            /^(hi|hello|hey|greetings|howdy|hola|namaste)/i,
            /good\s*(morning|afternoon|evening)/i,
            /what'?s?\s*up/i,
            /^(yo|sup|heyy+)/i,
        ],
        keywords: ['hi', 'hello', 'hey', 'greetings', 'howdy'],
        fuzzyKeywords: ['helo', 'hallo', 'hii', 'helllo', 'heya'],
    },
    {
        intent: 'about',
        patterns: [
            /who\s*(are|is)\s*(you|hakkan)/i,
            /tell\s*(me)?\s*about\s*(yourself|you|hakkan)/i,
            /introduce\s*(yourself)?/i,
            /what\s*(do|does)\s*(you|hakkan)\s*do/i,
            /describe\s*(yourself|hakkan)/i,
            /about\s*(you|hakkan|yourself)/i,
            /who\s*is\s*this/i,
        ],
        keywords: ['who', 'about', 'yourself', 'introduce', 'background', 'bio', 'profile'],
        fuzzyKeywords: ['abut', 'abot', 'introduse', 'bakground'],
    },
    {
        intent: 'projects',
        patterns: [
            /what\s*(are|have)\s*(your|the)?\s*projects/i,
            /show\s*(me)?\s*(your|the)?\s*projects/i,
            /tell\s*(me)?\s*about\s*(your|the)?\s*projects/i,
            /what\s*(have)?\s*(you|hakkan)\s*(built|created|made|worked\s*on)/i,
            /portfolio\s*(work|projects)?/i,
            /^projects?$/i,
            /list\s*(your|the)?\s*projects/i,
            /what\s*apps?/i,
        ],
        keywords: ['projects', 'portfolio', 'built', 'created', 'work', 'apps', 'applications', 'websites', 'builds'],
        fuzzyKeywords: ['projcts', 'porfolio', 'aplication', 'projets'],
    },
    {
        intent: 'project_detail',
        patterns: [
            /tell\s*(me)?\s*(more)?\s*about\s+(\w+)/i,
            /what\s*is\s+(\w+)/i,
            /explain\s+(\w+)/i,
            /show\s*(me)?\s+(\w+)\s*project/i,
            /details?\s*(about|on|for)\s+(\w+)/i,
        ],
        keywords: [],
        extractParams: (input: string): Record<string, string> => {
            const projectNames = ['mockhick', 'buildmycv', 'verifyai', 'confesscode', 'mememate', 'aluchat', 'reelxtract', 'math-o-matic', 'hit-the-jhatu'];
            const normalized = normalizeInput(input);

            // Exact match first
            for (const name of projectNames) {
                if (normalized.includes(name.toLowerCase())) {
                    return { projectName: name };
                }
            }

            // Fuzzy match for project names
            const words = normalized.split(' ');
            for (const word of words) {
                const { match, score } = fuzzyMatchWord(word, projectNames, 0.65);
                if (match) {
                    return { projectName: match };
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
            /^skills?$/i,
            /technical\s*(skills|abilities|expertise)/i,
        ],
        keywords: ['skills', 'technologies', 'tech', 'stack', 'programming', 'languages', 'tools', 'expertise', 'frontend', 'backend', 'database'],
        fuzzyKeywords: ['skils', 'tecnologies', 'programing', 'techstack'],
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
            /previous\s*(jobs?|work|companies)/i,
            /^experience$/i,
        ],
        keywords: ['experience', 'work', 'job', 'internship', 'career', 'professional', 'employment', 'company', 'companies'],
        fuzzyKeywords: ['experiance', 'experince', 'interneship', 'carreer'],
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
            /^education$/i,
            /academic\s*(background|history)/i,
        ],
        keywords: ['education', 'degree', 'college', 'university', 'study', 'school', 'qualifications', 'academic', 'graduation'],
        fuzzyKeywords: ['educaton', 'colege', 'univeristy', 'degre'],
    },
    {
        intent: 'certifications',
        patterns: [
            /what\s*(are|about)\s*(your|the)?\s*certifications/i,
            /certificates/i,
            /what\s*courses/i,
            /training/i,
            /^certifications?$/i,
            /credentials/i,
        ],
        keywords: ['certifications', 'certificates', 'courses', 'training', 'credentials', 'certified'],
        fuzzyKeywords: ['certifcations', 'certificats', 'cources'],
    },
    {
        intent: 'contact',
        patterns: [
            /how\s*(can|do)\s*(i|we)?\s*contact\s*(you|hakkan)?/i,
            /how\s*(can|to)\s*reach\s*(you|hakkan)?/i,
            /what\s*(is|are)\s*(your|the)?\s*(email|phone|contact)/i,
            /get\s*in\s*touch/i,
            /contact\s*(info|information|details)/i,
            /^contact$/i,
            /hire\s*(you|hakkan)/i,
            /reach\s*out/i,
        ],
        keywords: ['contact', 'email', 'phone', 'reach', 'connect', 'linkedin', 'github', 'hire', 'message'],
        fuzzyKeywords: ['contct', 'emal', 'linkdin', 'gethub'],
    },
    {
        intent: 'navigation',
        patterns: [
            /go\s*to\s+(\w+)/i,
            /navigate\s*to\s+(\w+)/i,
            /show\s*(me)?\s+(the)?\s*(\w+)\s*section/i,
            /take\s*me\s*to\s+(\w+)/i,
            /scroll\s*to\s+(\w+)/i,
            /open\s+(\w+)\s*(section)?/i,
        ],
        keywords: [],
        extractParams: (input: string): Record<string, string> => {
            const sections = ['home', 'about', 'experience', 'projects', 'skills', 'education', 'certifications', 'contact'];
            const normalized = normalizeInput(input);

            // Exact match
            for (const section of sections) {
                if (normalized.includes(section)) {
                    return { section };
                }
            }

            // Fuzzy match
            const words = normalized.split(' ');
            for (const word of words) {
                const { match } = fuzzyMatchWord(word, sections, 0.7);
                if (match) {
                    return { section: match };
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
            /^help$/i,
            /guide\s*me/i,
            /what\s*should\s*i\s*ask/i,
        ],
        keywords: ['help', 'commands', 'options', 'guide', 'assist', 'how', 'what can'],
        fuzzyKeywords: ['halp', 'hlep'],
    },
    {
        intent: 'thanks',
        patterns: [
            /thank\s*(you|s)/i,
            /thanks/i,
            /appreciate/i,
            /thx/i,
            /ty/i,
        ],
        keywords: ['thanks', 'thank', 'appreciate', 'grateful', 'thx', 'ty'],
    },
    {
        intent: 'goodbye',
        patterns: [
            /bye/i,
            /goodbye/i,
            /see\s*you/i,
            /later/i,
            /take\s*care/i,
            /cya/i,
            /gotta\s*go/i,
        ],
        keywords: ['bye', 'goodbye', 'later', 'cya', 'peace', 'adios'],
    },
];

// ============ Intent Detection ============

export const detectIntent = (input: string): DetectedIntent => {
    const normalizedInput = normalizeInput(input);
    const words = normalizedInput.split(' ').filter(w => w.length > 1);

    let bestMatch: DetectedIntent = {
        intent: 'unknown',
        confidence: 0,
        params: {},
        originalInput: input,
        suggestedTopics: [],
    };

    const potentialTopics: Array<{ topic: IntentType; score: number }> = [];

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

        // Check exact keywords (medium-high confidence)
        const matchedKeywords = pattern.keywords.filter((kw) =>
            words.some((word) => word === kw || word.includes(kw) || kw.includes(word))
        );
        if (matchedKeywords.length > 0) {
            const keywordConfidence = 0.6 + (matchedKeywords.length * 0.1);
            confidence = Math.max(confidence, Math.min(keywordConfidence, 0.85));
        }

        // Check fuzzy keywords (lower confidence but better fallback)
        if (pattern.fuzzyKeywords && confidence < 0.5) {
            for (const word of words) {
                const { match, score } = fuzzyMatchWord(word, pattern.fuzzyKeywords, 0.65);
                if (match) {
                    const fuzzyConfidence = 0.4 + (score * 0.3);
                    confidence = Math.max(confidence, fuzzyConfidence);
                }
            }
        }

        // Extract params if applicable
        if (pattern.extractParams && confidence > 0.3) {
            params = pattern.extractParams(input);
            if (Object.keys(params).length > 0) {
                confidence = Math.min(confidence + 0.15, 1.0);
            }
        }

        // Track potential topics for suggestions
        if (confidence > 0.2 && confidence < 0.5) {
            potentialTopics.push({ topic: pattern.intent, score: confidence });
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

    // For low-confidence or unknown matches, add suggestions
    if (bestMatch.confidence < 0.5) {
        const topSuggestions = potentialTopics
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(t => t.topic);

        if (topSuggestions.length === 0) {
            // Default suggestions if nothing matched
            topSuggestions.push('projects', 'skills', 'experience');
        }

        bestMatch.suggestedTopics = topSuggestions;

        // If confidence is too low, mark as unknown
        if (bestMatch.confidence < 0.4) {
            bestMatch.intent = 'unknown';
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
    const questionWords = ['what', 'who', 'where', 'when', 'why', 'how', 'which', 'can', 'do', 'does', 'is', 'are', 'tell'];
    const normalized = normalizeInput(input);
    return questionWords.some((w) => normalized.startsWith(w)) || input.includes('?');
};

// ============ Spell-check Suggestions ============

export const getSuggestions = (input: string): string[] => {
    const normalizedInput = normalizeInput(input);
    const words = normalizedInput.split(' ');

    const allKeywords = intentPatterns.flatMap(p => [...p.keywords, ...(p.fuzzyKeywords || [])]);
    const suggestions: string[] = [];

    for (const word of words) {
        if (word.length > 3) {
            const { match } = fuzzyMatchWord(word, allKeywords, 0.6);
            if (match && match !== word) {
                suggestions.push(match);
            }
        }
    }

    return [...new Set(suggestions)].slice(0, 3);
};
