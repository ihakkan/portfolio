/**
 * Intent Detection System
 * Advanced pattern-based intent detection with fuzzy matching
 * Supports specific queries (e.g., specific project, specific contact method)
 */

export type IntentType =
    | 'greeting'
    | 'about'
    | 'about_detail'
    | 'projects'
    | 'project_detail'
    | 'skills'
    | 'skill_category'
    | 'experience'
    | 'experience_detail'
    | 'education'
    | 'certifications'
    | 'contact'
    | 'contact_specific'
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
    suggestedTopics?: string[];
}

// ============ Input Normalization ============

export const normalizeInput = (input: string): string => {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ');
};

// ============ Fuzzy Matching (Levenshtein Distance) ============

const levenshteinDistance = (str1: string, str2: string): number => {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }
    return dp[m][n];
};

const getSimilarity = (str1: string, str2: string): number => {
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1;
    return 1 - levenshteinDistance(str1.toLowerCase(), str2.toLowerCase()) / maxLen;
};

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

// ============ Project Names for Detection ============

const PROJECT_NAMES = [
    'mockhick', 'mock hick', 'maukhik',
    'buildmycv', 'build my cv', 'cvbanao', 'resume builder',
    'verifyai', 'verify ai', 'deepfake detector', 'fake news',
    'confesscode', 'confess code', 'anonymous',
    'mememate', 'meme mate', 'meme dating',
    'aluchat', 'alu chat', 'chatbot',
    'reelxtract', 'reel xtract', 'reels downloader', 'instagram downloader',
    'mathomatic', 'math o matic', 'calculator',
    'hit the jhatu', 'jhatu game', 'whack a mole'
];

// ============ Skill Categories for Detection ============

const SKILL_CATEGORIES = [
    'frontend', 'front end', 'front-end', 'ui',
    'backend', 'back end', 'back-end', 'server',
    'database', 'db', 'databases',
    'uiux', 'ui/ux', 'design',
    'tools', 'dev tools', 'development tools',
    'ai', 'ai tools', 'artificial intelligence',
    'programming', 'programming languages', 'languages',
    'soft skills', 'softskills'
];

// ============ Contact Methods for Detection ============

const CONTACT_METHODS = [
    'email', 'mail', 'gmail',
    'phone', 'call', 'mobile', 'number',
    'github', 'git',
    'linkedin', 'linked in',
    'google', 'g.dev', 'google dev'
];

// ============ Intent Patterns ============

interface IntentPattern {
    intent: IntentType;
    patterns: RegExp[];
    keywords: string[];
    fuzzyKeywords?: string[];
    extractParams?: (input: string) => Record<string, string>;
}

const intentPatterns: IntentPattern[] = [
    // Greeting
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

    // About (quick intro)
    {
        intent: 'about',
        patterns: [
            /^who\s*(is)?\s*(hakkan|he)/i,
            /^tell\s*(me)?\s*about\s*(hakkan|yourself|you)/i,
            /^introduce/i,
            /^about\s*(hakkan|you|yourself)?$/i,
            /who\s*are\s*you/i,
        ],
        keywords: ['who', 'about', 'introduce', 'hakkan'],
        fuzzyKeywords: ['abut', 'abot', 'hakan'],
    },

    // About Detail (more info)
    {
        intent: 'about_detail',
        patterns: [
            /more\s*(about|info|details?|information)/i,
            /tell\s*(me)?\s*more/i,
            /what\s*(does|do)\s*(he|hakkan|you)\s*do/i,
            /describe\s*(hakkan|yourself|him)/i,
            /background/i,
            /in\s*detail/i,
            /elaborate/i,
            /full\s*(bio|profile|story)/i,
        ],
        keywords: ['more', 'detail', 'details', 'elaborate', 'describe', 'background', 'full'],
    },

    // Projects (list all)
    {
        intent: 'projects',
        patterns: [
            /what\s*(are|have)\s*(your|his|the)?\s*projects/i,
            /show\s*(me)?\s*(your|his|the|all)?\s*projects/i,
            /tell\s*(me)?\s*about\s*(your|his|the)?\s*projects/i,
            /what\s*(have)?\s*(you|he|hakkan)\s*(built|created|made|worked\s*on)/i,
            /portfolio\s*(work|projects)?/i,
            /^projects?$/i,
            /list\s*(your|his|the|all)?\s*projects/i,
            /all\s*projects/i,
            /what\s*apps?/i,
        ],
        keywords: ['projects', 'portfolio', 'built', 'created', 'work', 'apps', 'applications', 'websites', 'builds'],
        fuzzyKeywords: ['projcts', 'porfolio', 'projets'],
    },

    // Project Detail (specific project)
    {
        intent: 'project_detail',
        patterns: [
            /tell\s*(me)?\s*(more)?\s*about\s+(\w+)/i,
            /what\s*is\s+(\w+)/i,
            /explain\s+(\w+)/i,
            /show\s*(me)?\s+(\w+)\s*project/i,
            /details?\s*(about|on|for)\s+(\w+)/i,
            /(\w+)\s*project\s*(details?|info)?/i,
        ],
        keywords: PROJECT_NAMES,
        extractParams: (input: string): Record<string, string> => {
            const normalized = normalizeInput(input);

            // Check for project name mentions
            const projectMappings: Record<string, string> = {
                'mockhick': 'MockHick', 'mock hick': 'MockHick', 'maukhik': 'MockHick', 'interview app': 'MockHick',
                'buildmycv': 'BuildMyCV', 'build my cv': 'BuildMyCV', 'cvbanao': 'BuildMyCV', 'resume builder': 'BuildMyCV', 'cv builder': 'BuildMyCV',
                'verifyai': 'VerifyAI', 'verify ai': 'VerifyAI', 'deepfake': 'VerifyAI', 'fake news': 'VerifyAI',
                'confesscode': 'ConfessCode', 'confess code': 'ConfessCode', 'confession': 'ConfessCode', 'anonymous': 'ConfessCode',
                'mememate': 'MemeMate', 'meme mate': 'MemeMate', 'meme dating': 'MemeMate',
                'aluchat': 'AluChat', 'alu chat': 'AluChat', 'chatbot': 'AluChat',
                'reelxtract': 'ReelXtract', 'reel xtract': 'ReelXtract', 'reels downloader': 'ReelXtract', 'instagram': 'ReelXtract',
                'mathomatic': 'Math-O-Matic', 'math o matic': 'Math-O-Matic', 'calculator': 'Math-O-Matic',
                'hit the jhatu': 'Hit-The-Jhatu', 'jhatu': 'Hit-The-Jhatu', 'jhatu game': 'Hit-The-Jhatu', 'whack': 'Hit-The-Jhatu'
            };

            for (const [key, value] of Object.entries(projectMappings)) {
                if (normalized.includes(key)) {
                    return { projectName: value };
                }
            }

            return {};
        },
    },

    // Skills (general)
    {
        intent: 'skills',
        patterns: [
            /what\s*(are|is)\s*(your|his|the|hakkan'?s?)?\s*(skills?|technologies|tech)/i,
            /tell\s*(me)?\s*(about)?\s*(your|his)?\s*skills/i,
            /tech\s*stack/i,
            /skill\s*set/i,
            /what\s*(technologies|tech)\s*(do|does)\s*(you|he|hakkan)\s*(know|use)/i,
            /^skills?$/i,
            /technical\s*(skills?|abilities|expertise)/i,
            /what\s*can\s*(you|he|hakkan)\s*do/i,
            /programming\s*languages?/i,
            /what\s*(do\s*you|does\s*he|tools)\s*(use|know)/i,
        ],
        keywords: ['skills', 'skill', 'technologies', 'tech', 'stack', 'programming', 'languages', 'tools', 'expertise', 'skillset'],
        fuzzyKeywords: ['skils', 'tecnologies', 'programing', 'techstack', 'skilset'],
    },

    // Skill Category (specific category)
    {
        intent: 'skill_category',
        patterns: [
            /frontend\s*(skills?|tech|technologies)?/i,
            /backend\s*(skills?|tech|technologies)?/i,
            /database\s*(skills?|tech|knowledge)?/i,
            /(ui|ux|ui\/ux|design)\s*(skills?)?/i,
            /what\s*(frontend|backend|database|ai)\s*(tools?|tech)?/i,
            /soft\s*skills?/i,
        ],
        keywords: SKILL_CATEGORIES,
        extractParams: (input: string): Record<string, string> => {
            const normalized = normalizeInput(input);
            const categoryMappings: Record<string, string> = {
                'frontend': 'frontend', 'front end': 'frontend', 'front-end': 'frontend', 'ui': 'frontend',
                'backend': 'backend', 'back end': 'backend', 'back-end': 'backend', 'server': 'backend',
                'database': 'database', 'db': 'database', 'databases': 'database',
                'uiux': 'uiux', 'ui/ux': 'uiux', 'design': 'uiux', 'ux': 'uiux',
                'tools': 'tools', 'dev tools': 'tools',
                'ai': 'aiTools', 'ai tools': 'aiTools', 'artificial intelligence': 'aiTools',
                'programming': 'programming', 'languages': 'programming',
                'soft skills': 'softSkills', 'soft': 'softSkills'
            };
            for (const [key, value] of Object.entries(categoryMappings)) {
                if (normalized.includes(key)) {
                    return { category: value };
                }
            }
            return {};
        },
    },

    // Experience (general)
    {
        intent: 'experience',
        patterns: [
            /what\s*(is|about)\s*(your|his|the|hakkan'?s?)?\s*experience/i,
            /tell\s*(me)?\s*(about)?\s*(your|his)?\s*experience/i,
            /where\s*(have|did|does)\s*(you|he|hakkan)\s*work(ed)?/i,
            /work\s*history/i,
            /internship(s)?/i,
            /professional\s*experience/i,
            /job\s*(experience|history)/i,
            /previous\s*(jobs?|work|companies)/i,
            /^experience$/i,
            /career/i,
        ],
        keywords: ['experience', 'work', 'job', 'internship', 'internships', 'career', 'professional', 'employment', 'company', 'companies'],
        fuzzyKeywords: ['experiance', 'experince', 'interneship', 'carreer'],
    },

    // Experience Detail (specific company or role)
    {
        intent: 'experience_detail',
        patterns: [
            /udrcrafts?/i,
            /aiking/i,
            /ai\s*king/i,
            /current\s*(job|work|internship|role)/i,
            /previous\s*(job|work|internship|role)/i,
            /first\s*(job|internship)/i,
        ],
        keywords: ['udrcrafts', 'aiking', 'current', 'previous'],
        extractParams: (input: string): Record<string, string> => {
            const normalized = normalizeInput(input);
            if (normalized.includes('udrcrafts') || normalized.includes('current')) {
                return { company: 'UDRCRAFTS' };
            }
            if (normalized.includes('aiking') || normalized.includes('ai king') || normalized.includes('previous')) {
                return { company: 'AIKing' };
            }
            return {};
        },
    },

    // Education
    {
        intent: 'education',
        patterns: [
            /what\s*(is|about)\s*(your|his|the|hakkan'?s?)?\s*education/i,
            /tell\s*(me)?\s*(about)?\s*(your|his)?\s*education/i,
            /where\s*did\s*(you|he|hakkan)\s*study/i,
            /what\s*degree/i,
            /college|university/i,
            /educational\s*background/i,
            /qualifications?/i,
            /^education$/i,
            /academic/i,
            /cgpa|gpa|percentage/i,
            /btech|b\.?tech/i,
        ],
        keywords: ['education', 'degree', 'college', 'university', 'study', 'school', 'qualifications', 'academic', 'graduation', 'btech'],
        fuzzyKeywords: ['educaton', 'colege', 'univeristy', 'degre'],
    },

    // Certifications
    {
        intent: 'certifications',
        patterns: [
            /what\s*(are|about)\s*(your|his|the|hakkan'?s?)?\s*certifications?/i,
            /certificates?/i,
            /what\s*courses?/i,
            /training/i,
            /^certifications?$/i,
            /credentials?/i,
            /aws|palo\s*alto|blue\s*prism|zscaler|mern/i,
        ],
        keywords: ['certifications', 'certification', 'certificates', 'certificate', 'courses', 'training', 'credentials', 'certified'],
        fuzzyKeywords: ['certifcations', 'certificats', 'cources'],
    },

    // Contact (general)
    {
        intent: 'contact',
        patterns: [
            /how\s*(can|do|to)\s*(i|we)?\s*contact\s*(you|him|hakkan)?/i,
            /how\s*(can|to)\s*reach\s*(you|him|hakkan)?/i,
            /contact\s*(info|information|details)?/i,
            /get\s*in\s*touch/i,
            /^contact$/i,
            /hire\s*(you|him|hakkan)/i,
            /reach\s*out/i,
            /connect\s*with/i,
        ],
        keywords: ['contact', 'reach', 'connect', 'hire', 'touch'],
    },

    // Contact Specific (specific method)
    {
        intent: 'contact_specific',
        patterns: [
            /what\s*(is|are)?\s*(your|his|hakkan'?s?)?\s*email/i,
            /what\s*(is|are)?\s*(your|his|hakkan'?s?)?\s*(phone|number|mobile)/i,
            /what\s*(is|are)?\s*(your|his|hakkan'?s?)?\s*github/i,
            /what\s*(is|are)?\s*(your|his|hakkan'?s?)?\s*linkedin/i,
            /github\s*(profile|link|url|account)/i,
            /linkedin\s*(profile|link|url|account)/i,
            /email\s*(address|id)?/i,
            /phone\s*number/i,
            /call\s*(you|him|hakkan)/i,
        ],
        keywords: CONTACT_METHODS,
        extractParams: (input: string): Record<string, string> => {
            const normalized = normalizeInput(input);
            const methodMappings: Record<string, string> = {
                'email': 'email', 'mail': 'email', 'gmail': 'email',
                'phone': 'phone', 'call': 'phone', 'mobile': 'phone', 'number': 'phone',
                'github': 'github', 'git': 'github',
                'linkedin': 'linkedin', 'linked in': 'linkedin',
                'google': 'googleDev', 'g dev': 'googleDev', 'gdev': 'googleDev'
            };
            for (const [key, value] of Object.entries(methodMappings)) {
                if (normalized.includes(key)) {
                    return { method: value };
                }
            }
            return {};
        },
    },

    // Navigation
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
            for (const section of sections) {
                if (normalized.includes(section)) {
                    return { section };
                }
            }
            return {};
        },
    },

    // Help
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
        keywords: ['help', 'commands', 'options', 'guide', 'assist'],
        fuzzyKeywords: ['halp', 'hlep'],
    },

    // Thanks
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

    // Goodbye
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
            words.some((word) => word === kw || normalizedInput.includes(kw))
        );
        if (matchedKeywords.length > 0) {
            const keywordConfidence = 0.6 + (matchedKeywords.length * 0.1);
            confidence = Math.max(confidence, Math.min(keywordConfidence, 0.85));
        }

        // Check fuzzy keywords (lower confidence)
        if (pattern.fuzzyKeywords && confidence < 0.5) {
            for (const word of words) {
                const { match, score } = fuzzyMatchWord(word, pattern.fuzzyKeywords, 0.65);
                if (match) {
                    confidence = Math.max(confidence, 0.4 + (score * 0.3));
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

    // For low-confidence matches, add suggestions
    if (bestMatch.confidence < 0.5) {
        const topSuggestions = potentialTopics
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(t => t.topic);

        if (topSuggestions.length === 0) {
            topSuggestions.push('projects', 'skills', 'experience');
        }

        bestMatch.suggestedTopics = topSuggestions;

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
