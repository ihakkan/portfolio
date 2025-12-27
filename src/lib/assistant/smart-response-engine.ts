/**
 * Smart Response Engine
 * Intelligence layer for the portfolio assistant
 * Provides dynamic rephrasing, contextual responses, and conversational memory
 */

import { IntentType, DetectedIntent } from './intent-detector';

// ============ Types ============

export interface ConversationContext {
    previousIntents: IntentType[];
    lastTopic: string | null;
    mentionedProjects: string[];
    mentionedSkills: string[];
    turnCount: number;
}

export interface SmartResponseConfig {
    addPersonality: boolean;
    verboseMode: boolean;
    includeFollowUp: boolean;
}

// ============ Conversation Memory ============

export const createEmptyContext = (): ConversationContext => ({
    previousIntents: [],
    lastTopic: null,
    mentionedProjects: [],
    mentionedSkills: [],
    turnCount: 0,
});

export const updateContext = (
    context: ConversationContext,
    intent: DetectedIntent,
    topic?: string
): ConversationContext => {
    return {
        ...context,
        previousIntents: [...context.previousIntents.slice(-5), intent.intent],
        lastTopic: topic || context.lastTopic,
        turnCount: context.turnCount + 1,
    };
};

// ============ Time-Based Greetings ============

const getTimeBasedGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Hello';
};

// ============ Response Variation Templates ============

const personalityPhrases = {
    enthusiasm: [
        "Great question!",
        "I'd love to tell you about that!",
        "Absolutely!",
        "Oh, that's interesting!",
        "Happy to share!",
    ],
    transitions: [
        "So,",
        "Well,",
        "You know,",
        "Here's the thing:",
        "Let me tell you,",
    ],
    followUps: [
        "Would you like to know more?",
        "Anything specific you'd like to explore?",
        "Feel free to ask follow-up questions!",
        "Want me to dive deeper into any of these?",
        "Shall I elaborate on anything?",
    ],
    acknowledgments: [
        "Got it!",
        "Sure thing!",
        "Of course!",
        "Absolutely!",
        "Right away!",
    ],
};

const getRandomPhrase = (phrases: string[]): string => {
    return phrases[Math.floor(Math.random() * phrases.length)];
};

// ============ Smart Rephrasing Functions ============

export const rephraseName = (name: string): string => {
    const variations = [
        `${name}`,
        `Hakkan`,
        `he`,
    ];
    return variations[Math.floor(Math.random() * variations.length)];
};

export const rephraseSkillCategory = (category: string, skills: string[]): string => {
    const templates = [
        `When it comes to ${category.toLowerCase()}, Hakkan works with ${skills.slice(0, 3).join(', ')}${skills.length > 3 ? ` and ${skills.length - 3} more` : ''}.`,
        `For ${category.toLowerCase()} development, he's proficient in ${skills.join(', ')}.`,
        `On the ${category.toLowerCase()} side, his toolkit includes ${skills.slice(0, 4).join(', ')}${skills.length > 4 ? ', among others' : ''}.`,
        `${category} expertise includes ${skills.join(', ')}.`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
};

export const rephraseProjectIntro = (projectCount: number): string => {
    const templates = [
        `Hakkan has built ${projectCount} impressive projects that showcase his skills.`,
        `There are ${projectCount} projects in the portfolio, each solving real-world problems.`,
        `Let me walk you through ${projectCount} projects Hakkan has worked on.`,
        `The portfolio features ${projectCount} diverse projects. Here's a quick overview:`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
};

export const rephraseProjectDescription = (title: string, description: string, tags: string[]): string => {
    const techMention = tags.length > 0 ? `, built using ${tags.slice(0, 3).join(', ')}` : '';
    const templates = [
        `**${title}** - ${description}${techMention}.`,
        `**${title}**: ${description} The tech stack includes ${tags.slice(0, 3).join(', ')}.`,
        `Check out **${title}**! ${description}`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
};

export const rephraseAbout = (aboutText: string): string => {
    // Extract key info and rephrase
    const templates = [
        `${getRandomPhrase(personalityPhrases.transitions)} Hakkan Parbej Shah is ${aboutText}`,
        `Let me introduce you to Hakkan! He's ${aboutText}`,
        `Here's a bit about Hakkan - ${aboutText}`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
};

export const rephraseExperience = (role: string, company: string, period: string, description: string): string => {
    const templates = [
        `As a **${role}** at ${company} (${period}), Hakkan ${description.toLowerCase().startsWith('worked') ? description : 'worked on ' + description.toLowerCase()}`,
        `At ${company}, Hakkan served as **${role}** during ${period}. ${description}`,
        `**${role}** @ ${company} (${period}) — ${description}`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
};

// ============ Context-Aware Response Builders ============

export const buildContextualIntro = (context: ConversationContext, topic: string): string => {
    if (context.turnCount === 0) {
        return getRandomPhrase(personalityPhrases.enthusiasm) + ' ';
    }

    if (context.previousIntents.includes(topic as IntentType)) {
        const continuationPhrases = [
            "Coming back to that topic, ",
            "More on that - ",
            "To add to what I mentioned earlier, ",
            "Good follow-up! ",
        ];
        return getRandomPhrase(continuationPhrases);
    }

    if (context.turnCount > 2) {
        const flowPhrases = [
            "Sure! ",
            "Of course! ",
            "Let me tell you! ",
            "",
        ];
        return getRandomPhrase(flowPhrases);
    }

    return getRandomPhrase(personalityPhrases.acknowledgments) + ' ';
};

export const buildFollowUpSuggestion = (currentTopic: IntentType, context: ConversationContext): string => {
    const suggestions: Record<IntentType, string[]> = {
        about: ["Would you like to see my projects or skills next?", "Shall I tell you about my experience?"],
        projects: ["Want details on any specific project?", "Should I show you the tech stack I use?"],
        skills: ["Want to see these skills in action through my projects?", "Interested in my work experience?"],
        experience: ["Want to know about my education background?", "Shall I show you projects from this period?"],
        education: ["Would you like to see my certifications?", "How about checking out my projects?"],
        certifications: ["Interested in my skills and technologies?", "Want to know more about my experience?"],
        contact: ["Meanwhile, feel free to explore the portfolio!", "Anything else you'd like to know?"],
        greeting: ["What would you like to know about Hakkan?", "Feel free to ask about projects, skills, or experience!"],
        help: ["Just ask away!", "What catches your interest?"],
        thanks: ["Anything else I can help with?", "Feel free to explore more!"],
        goodbye: ["Take care!", "Hope to see you again!"],
        project_detail: ["Want to know about other projects?", "Interested in the tech stack?"],
        navigation: ["What else can I help you find?", "Feel free to ask more questions!"],
        unknown: ["Try asking about projects, skills, or experience!", "I know a lot about Hakkan's portfolio!"],
    };

    const topicSuggestions = suggestions[currentTopic] || suggestions.unknown;
    return '\n\n' + getRandomPhrase(topicSuggestions);
};

// ============ Smart Error Handling ============

export const buildSmartFallback = (originalInput: string, context: ConversationContext): string => {
    const inputLower = originalInput.toLowerCase();

    // Check for partial matches and suggest
    const topicHints: Array<{ keywords: string[]; suggestion: string; topic: string }> = [
        { keywords: ['work', 'job', 'career', 'company'], suggestion: "Did you mean to ask about work experience?", topic: 'experience' },
        { keywords: ['code', 'program', 'develop', 'build', 'make', 'create'], suggestion: "Are you asking about projects Hakkan has built?", topic: 'projects' },
        { keywords: ['tech', 'framework', 'language', 'tool'], suggestion: "Would you like to know about technical skills?", topic: 'skills' },
        { keywords: ['study', 'degree', 'college', 'school', 'learn'], suggestion: "Are you interested in educational background?", topic: 'education' },
        { keywords: ['hire', 'freelance', 'available', 'work together'], suggestion: "Would you like contact information to reach out?", topic: 'contact' },
        { keywords: ['certificate', 'course', 'training'], suggestion: "Looking for certifications and courses?", topic: 'certifications' },
    ];

    for (const hint of topicHints) {
        if (hint.keywords.some(kw => inputLower.includes(kw))) {
            return `${hint.suggestion} Try asking "Tell me about ${hint.topic}" or just say "${hint.topic}"!`;
        }
    }

    // Context-aware fallback
    if (context.lastTopic) {
        return `I'm not quite sure about that, but I was just telling you about ${context.lastTopic}. Would you like more details on that, or shall we explore something else like projects, skills, or experience?`;
    }

    // Friendly generic fallback with personality
    const friendlyFallbacks = [
        "Hmm, I'm not quite sure how to help with that. I'm Hakkan's portfolio assistant, so I know all about his projects, skills, work experience, and education. What would you like to explore?",
        "That's a bit outside my expertise! I'm here to tell you about Hakkan's portfolio. Try asking about his projects, technical skills, or how to get in touch!",
        "I wish I could help with that! My specialty is Hakkan's portfolio though. Want to know about his projects, skills, or experience?",
        "Interesting question! But I'm best at answering questions about Hakkan's work. Ask me about projects, skills, experience, or education!",
    ];

    return getRandomPhrase(friendlyFallbacks);
};

// ============ Response Enhancement ============

export const enhanceResponse = (
    baseResponse: string,
    intent: IntentType,
    context: ConversationContext,
    config: SmartResponseConfig = { addPersonality: true, verboseMode: true, includeFollowUp: true }
): string => {
    let enhanced = baseResponse;

    // Add contextual intro for personality
    if (config.addPersonality && context.turnCount > 0) {
        const intro = buildContextualIntro(context, intent);
        if (intro && !enhanced.startsWith(intro.trim())) {
            enhanced = intro + enhanced;
        }
    }

    // Add follow-up suggestion
    if (config.includeFollowUp && !['thanks', 'goodbye', 'help'].includes(intent)) {
        enhanced += buildFollowUpSuggestion(intent, context);
    }

    return enhanced;
};

// ============ Speech Optimization ============

export const optimizeForSpeech = (text: string): string => {
    return text
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
        .replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g, (match) => {
            return match.replace('@', ' at ').replace(/\./g, ' dot ');
        })
        // Normalize spaces
        .replace(/\s+/g, ' ')
        .trim();
};

// ============ Greeting with Time Context ============

export const getSmartGreeting = (context: ConversationContext): { text: string; speakText: string } => {
    const timeGreeting = getTimeBasedGreeting();

    if (context.turnCount === 0) {
        const greetings = [
            `${timeGreeting}! 👋 I'm Hakkan's Portfolio Assistant. I can tell you about his projects, skills, experience, and more. What would you like to know?`,
            `${timeGreeting}! Welcome to Hakkan's portfolio. I'm here to help you explore his work. Ask me anything!`,
            `Hey there! ${timeGreeting}! I'm your guide to Hakkan's portfolio. Curious about his projects or skills?`,
        ];
        const text = getRandomPhrase(greetings);
        return {
            text,
            speakText: optimizeForSpeech(text),
        };
    }

    // Returning user in same session
    const returnGreetings = [
        "Hey again! What else would you like to know?",
        "Welcome back! More questions?",
        "Hi! Ready to explore more of the portfolio?",
    ];
    const text = getRandomPhrase(returnGreetings);
    return {
        text,
        speakText: optimizeForSpeech(text),
    };
};
