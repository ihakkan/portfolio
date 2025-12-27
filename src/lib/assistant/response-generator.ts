/**
 * Response Generator
 * Generates intelligent, human-readable responses using the knowledge base
 * Provides varied, natural-sounding answers - never copies data word-for-word
 */

import { DetectedIntent, IntentType } from './intent-detector';
import { getSectionId } from './portfolio-data';
import {
    ConversationContext,
    createEmptyContext,
    optimizeForSpeech,
} from './smart-response-engine';
import {
    ABOUT_KNOWLEDGE,
    PROJECTS_KNOWLEDGE,
    SKILLS_KNOWLEDGE,
    EXPERIENCE_KNOWLEDGE,
    EDUCATION_KNOWLEDGE,
    CERTIFICATIONS_KNOWLEDGE,
    CONTACT_KNOWLEDGE,
    findProject,
    getRandomAboutVersion,
} from './knowledge-base';

// ============ Response Types ============

export interface AssistantResponse {
    text: string;
    speakText?: string;
    action?: {
        type: 'navigate';
        target: string;
    };
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

// ============ Response Builders ============

const buildGreetingResponse = (context: ConversationContext): { text: string; speakText: string } => {
    const timeGreeting = getTimeBasedGreeting();

    if (context.turnCount === 0) {
        const greetings = [
            `${timeGreeting}! 👋 I'm Hakkan's Portfolio Assistant. I know everything about his projects, skills, experience, and more. What would you like to explore?`,
            `${timeGreeting}! Welcome to Hakkan's portfolio. I can tell you about his work, skills, or help you navigate. What interests you?`,
            `Hey there! ${timeGreeting}! I'm here to help you discover Hakkan's work. Ask me about his projects, technical skills, or experience!`,
        ];
        const text = getRandomItem(greetings);
        return { text, speakText: optimizeForSpeech(text) };
    }

    const returnGreetings = [
        "Hey again! What else would you like to know?",
        "Welcome back! Ready to explore more?",
        "Hi! What can I help you with now?",
    ];
    const text = getRandomItem(returnGreetings);
    return { text, speakText: optimizeForSpeech(text) };
};

const buildAboutResponse = (context: ConversationContext): string => {
    const intros = [
        "Let me tell you about Hakkan! ",
        "Here's the story of Hakkan: ",
        "Glad you asked! ",
    ];

    // Use different versions based on context
    if (context.turnCount === 0) {
        return getRandomItem(intros) + ABOUT_KNOWLEDGE.detailedAbout + "\n\n💡 *Want to know about his projects or skills?*";
    } else {
        return getRandomItem(intros) + getRandomAboutVersion();
    }
};

const buildProjectsListResponse = (context: ConversationContext): string => {
    const intros = [
        `Hakkan has built ${PROJECTS_KNOWLEDGE.length} impressive projects! Here's the lineup:`,
        `Let me walk you through Hakkan's ${PROJECTS_KNOWLEDGE.length} projects:`,
        `Check out what Hakkan has created:`,
    ];

    const projectList = PROJECTS_KNOWLEDGE.map((p, i) => {
        // Vary the format
        const formats = [
            `${i + 1}. **${p.name}** – ${p.shortDescription}`,
            `${i + 1}. **${p.name}**: ${p.shortDescription}`,
        ];
        return getRandomItem(formats);
    }).join('\n');

    const outros = [
        "\n\n💡 *Ask about any specific project to learn more! For example, \"Tell me about MockHick\"*",
        "\n\n🔍 *Interested in any of these? Just ask for details!*",
        "\n\n*Want the full story on any project? Just say the name!*",
    ];

    return `${getRandomItem(intros)}\n\n${projectList}${getRandomItem(outros)}`;
};

const buildProjectDetailResponse = (projectName: string, context: ConversationContext): string | null => {
    const project = findProject(projectName);
    if (!project) return null;

    const intros = [
        `${project.name} is one of Hakkan's standout projects! `,
        `Ah, ${project.name}! Great choice. `,
        `Let me tell you about ${project.name}: `,
    ];

    const sections = [
        project.detailedDescription,
        `\n\n**Why it was built:** ${project.whyBuilt}`,
        `\n\n**Tech highlights:** ${project.techHighlights}`,
        `\n\n🌟 **Cool fact:** ${project.coolFact}`,
    ];

    return getRandomItem(intros) + sections.join('');
};

const buildSkillsResponse = (context: ConversationContext): string => {
    const { categories } = SKILLS_KNOWLEDGE;

    const intros = [
        "Hakkan's got a solid tech arsenal! Here's the breakdown:",
        "Let me walk you through Hakkan's technical skills:",
        "Here's what Hakkan brings to the table:",
    ];

    const skillsText = [
        `\n\n**🎨 Frontend:** ${categories.frontend.skills.join(', ')}\n*${categories.frontend.highlight}*`,
        `\n\n**⚙️ Backend:** ${categories.backend.skills.join(', ')}\n*${categories.backend.highlight}*`,
        `\n\n**🗄️ Databases:** ${categories.database.skills.join(', ')}\n*${categories.database.highlight}*`,
        `\n\n**🎯 UI/UX:** ${categories.uiux.skills.join(', ')}\n*${categories.uiux.highlight}*`,
        `\n\n**🤖 AI Tools:** ${categories.aiTools.skills.join(', ')}\n*${categories.aiTools.highlight}*`,
        `\n\n**🛠️ Dev Tools:** ${categories.tools.skills.slice(0, 6).join(', ')}`,
        `\n\n**💡 Soft Skills:** ${categories.softSkills.skills.join(', ')}`,
    ].join('');

    return `${getRandomItem(intros)}${skillsText}`;
};

const buildExperienceResponse = (context: ConversationContext): string => {
    const { positions, overview } = EXPERIENCE_KNOWLEDGE;

    const intros = [
        "Here's Hakkan's professional journey:",
        "Let me share Hakkan's work experience:",
        overview,
    ];

    const expText = positions.map((pos) => {
        const achievementHighlights = pos.achievements.slice(0, 3).map(a => `  • ${a}`).join('\n');
        return `\n\n**${pos.role}** at ${pos.company} *(${pos.status === 'Current' ? '🟢 Current' : 'Previous'})*\n\n${pos.summary}\n\n*Key contributions:*\n${achievementHighlights}\n\n*Tech used:* ${pos.techUsed.slice(0, 5).join(', ')}`;
    }).join('\n\n---');

    return `${getRandomItem(intros)}${expText}`;
};

const buildEducationResponse = (context: ConversationContext): string => {
    const { degrees } = EDUCATION_KNOWLEDGE;

    const intros = [
        "Here's Hakkan's educational background:",
        "On the academic front:",
        "Let me share Hakkan's education:",
    ];

    const eduText = degrees.map((edu) => {
        return `\n\n**🎓 ${edu.degree}**\n${edu.institution}\n*${edu.period}* | *${edu.performance}*`;
    }).join('');

    return `${getRandomItem(intros)}${eduText}`;
};

const buildCertificationsResponse = (context: ConversationContext): string => {
    const { certifications, overview } = CERTIFICATIONS_KNOWLEDGE;

    const intros = [
        "Hakkan has earned several certifications:",
        overview,
        "Here are Hakkan's credentials:",
    ];

    const certText = certifications.map((cert, i) => {
        return `\n${i + 1}. **${cert.name}**\n   *Issued by:* ${cert.issuer}\n   *${cert.relevance}*`;
    }).join('\n');

    return `${getRandomItem(intros)}${certText}`;
};

const buildContactResponse = (context: ConversationContext): string => {
    const { channels, cta } = CONTACT_KNOWLEDGE;

    const intros = [
        "Here's how you can reach Hakkan:",
        "Want to connect? Here are all the ways:",
        "Hakkan would love to hear from you! Here's how to reach him:",
    ];

    const contactText = [
        `\n\n📧 **Email:** ${channels.email.value}\n   *${channels.email.description}*`,
        `\n\n📱 **Phone:** ${channels.phone.value}\n   *${channels.phone.description}*`,
        `\n\n💻 **GitHub:** [${channels.github.username}](${channels.github.url})\n   *${channels.github.description}*`,
        `\n\n💼 **LinkedIn:** [${channels.linkedin.username}](${channels.linkedin.url})\n   *${channels.linkedin.description}*`,
        `\n\n🔷 **Google Dev:** [${channels.googleDev.username}](${channels.googleDev.url})`,
    ].join('');

    return `${getRandomItem(intros)}${contactText}\n\n✨ *${cta}*`;
};

const buildHelpResponse = (context: ConversationContext): string => {
    if (context.turnCount > 3) {
        return `Quick reminder – I can help with:\n\n• **Projects** – See what Hakkan has built\n• **Skills** – Technical expertise\n• **Experience** – Work history\n• **Contact** – Get in touch\n\nJust ask naturally!`;
    }

    return `I'm here to help you explore Hakkan's portfolio! Here's what I know about:\n\n` +
        `🚀 **Projects** – ${PROJECTS_KNOWLEDGE.length} impressive builds including MockHick, BuildMyCV, and more\n` +
        `💻 **Skills** – Frontend, Backend, Databases, AI Integration\n` +
        `💼 **Experience** – Real internship experience at tech companies\n` +
        `🎓 **Education** – B.Tech CSE journey\n` +
        `📜 **Certifications** – MERN, AWS AI/ML, Cybersecurity, and more\n` +
        `📧 **Contact** – Email, GitHub, LinkedIn, and phone\n\n` +
        `Just ask naturally! For example:\n• "What projects has Hakkan built?"\n• "Tell me about MockHick"\n• "What's his tech stack?"\n• "How can I contact him?"`;
};

const buildThanksResponse = (context: ConversationContext): string => {
    const responses = [
        "You're welcome! Happy to help. 😊",
        "Glad I could assist! Let me know if you need anything else.",
        "No problem at all! Feel free to ask more questions.",
        "Anytime! Is there anything else you'd like to explore?",
    ];

    if (context.turnCount > 5) {
        return getRandomItem([
            "You're very welcome! It's been great chatting with you.",
            "My pleasure! Thanks for exploring Hakkan's portfolio.",
        ]);
    }

    return getRandomItem(responses);
};

const buildGoodbyeResponse = (context: ConversationContext): string => {
    const responses = [
        "Goodbye! Thanks for visiting Hakkan's portfolio. 👋",
        "See you later! Feel free to come back anytime.",
        "Take care! Don't forget to check out the projects!",
        "Bye! Hope you found what you were looking for.",
    ];

    if (context.turnCount > 5) {
        return getRandomItem([
            "It was great talking with you! Goodbye and take care! 👋",
            "Thanks for the conversation! See you next time!",
        ]);
    }

    return getRandomItem(responses);
};

const buildNavigationResponse = (section: string): string => {
    const responses = [
        `Taking you to the ${section} section now!`,
        `Navigating to ${section}... There you go!`,
        `Sure thing! Here's the ${section} section.`,
        `Scrolling to ${section} for you!`,
    ];
    return getRandomItem(responses);
};

const buildSmartFallback = (originalInput: string, context: ConversationContext): string => {
    const inputLower = originalInput.toLowerCase();

    // Topic-based hints
    const topicHints = [
        { keywords: ['work', 'job', 'career', 'company', 'intern'], suggestion: "Looks like you're asking about work. Try asking about Hakkan's **experience** or **internships**!" },
        { keywords: ['code', 'program', 'develop', 'build', 'make', 'create', 'app'], suggestion: "Sounds like you're interested in what Hakkan has built! Ask about his **projects**." },
        { keywords: ['tech', 'framework', 'language', 'tool', 'know', 'use'], suggestion: "Want to know Hakkan's tech stack? Ask about his **skills**!" },
        { keywords: ['study', 'degree', 'college', 'school', 'learn', 'university'], suggestion: "Curious about academics? Ask about Hakkan's **education**!" },
        { keywords: ['hire', 'freelance', 'available', 'reach', 'email', 'call'], suggestion: "Want to get in touch? Ask for **contact** information!" },
        { keywords: ['certificate', 'course', 'training', 'certified'], suggestion: "Looking for credentials? Ask about **certifications**!" },
        { keywords: ['who', 'about', 'hakkan', 'person'], suggestion: "Want to know about Hakkan? Just ask \"Who is Hakkan?\" or \"Tell me about Hakkan\"!" },
    ];

    for (const hint of topicHints) {
        if (hint.keywords.some(kw => inputLower.includes(kw))) {
            return hint.suggestion;
        }
    }

    // Context-aware fallback
    if (context.lastTopic) {
        return `I'm not quite sure about that, but I was just telling you about ${context.lastTopic}. Want more details on that, or should we explore something else like projects, skills, or experience?`;
    }

    // Friendly generic fallback
    const friendlyFallbacks = [
        "Hmm, I'm not sure how to help with that. I'm Hakkan's portfolio assistant, so I can tell you about his **projects**, **skills**, **experience**, or **contact** info. What interests you?",
        "That's a bit outside my knowledge! I specialize in Hakkan's portfolio. Try asking about his projects, technical skills, or work experience!",
        "I wish I could help with that! My specialty is Hakkan's work though. Want to know about his projects, skills, or how to reach him?",
    ];

    return getRandomItem(friendlyFallbacks);
};

// ============ Main Response Generator ============

export const generateResponse = (
    intent: DetectedIntent,
    context: ConversationContext = createEmptyContext()
): AssistantResponse => {
    switch (intent.intent) {
        case 'greeting': {
            const greeting = buildGreetingResponse(context);
            return { text: greeting.text, speakText: greeting.speakText };
        }

        case 'about': {
            const text = buildAboutResponse(context);
            return {
                text,
                speakText: ABOUT_KNOWLEDGE.quickIntro,
                action: { type: 'navigate', target: 'about' },
            };
        }

        case 'projects': {
            const text = buildProjectsListResponse(context);
            return {
                text,
                speakText: `Hakkan has built ${PROJECTS_KNOWLEDGE.length} projects including MockHick, BuildMyCV, VerifyAI, and more. Want details on any specific one?`,
                action: { type: 'navigate', target: 'projects' },
            };
        }

        case 'project_detail': {
            const projectName = intent.params.projectName;
            if (projectName) {
                const text = buildProjectDetailResponse(projectName, context);
                if (text) {
                    const project = findProject(projectName);
                    return {
                        text,
                        speakText: project ? `${project.name}: ${project.shortDescription}. ${project.coolFact}` : optimizeForSpeech(text),
                        action: { type: 'navigate', target: 'projects' },
                    };
                }
            }
            return {
                text: `I couldn't find that specific project. ${buildProjectsListResponse(context)}`,
                speakText: `I couldn't find that project. Let me show you all ${PROJECTS_KNOWLEDGE.length} projects Hakkan has built.`,
                action: { type: 'navigate', target: 'projects' },
            };
        }

        case 'skills': {
            const text = buildSkillsResponse(context);
            return {
                text,
                speakText: SKILLS_KNOWLEDGE.quickSummary,
                action: { type: 'navigate', target: 'skills' },
            };
        }

        case 'experience': {
            const text = buildExperienceResponse(context);
            return {
                text,
                speakText: EXPERIENCE_KNOWLEDGE.quickSummary,
                action: { type: 'navigate', target: 'experience' },
            };
        }

        case 'education': {
            const text = buildEducationResponse(context);
            return {
                text,
                speakText: EDUCATION_KNOWLEDGE.quickSummary,
                action: { type: 'navigate', target: 'education' },
            };
        }

        case 'certifications': {
            const text = buildCertificationsResponse(context);
            return {
                text,
                speakText: CERTIFICATIONS_KNOWLEDGE.quickSummary,
                action: { type: 'navigate', target: 'certifications' },
            };
        }

        case 'contact': {
            const text = buildContactResponse(context);
            return {
                text,
                speakText: CONTACT_KNOWLEDGE.quickSummary,
                action: { type: 'navigate', target: 'contact' },
            };
        }

        case 'navigation': {
            const section = intent.params.section;
            if (section) {
                const sectionId = getSectionId(section);
                if (sectionId) {
                    return {
                        text: buildNavigationResponse(section),
                        speakText: `Taking you to ${section}`,
                        action: { type: 'navigate', target: sectionId },
                    };
                }
            }
            return {
                text: "I couldn't find that section. Available sections are: Home, About, Experience, Projects, Skills, Education, Certifications, and Contact. Where would you like to go?",
                speakText: "I couldn't find that section. Try asking for projects, skills, experience, or contact.",
            };
        }

        case 'help': {
            const text = buildHelpResponse(context);
            return {
                text,
                speakText: "I can help you learn about Hakkan's projects, skills, experience, education, certifications, and contact info. Just ask naturally!",
            };
        }

        case 'thanks':
            return {
                text: buildThanksResponse(context),
                speakText: "You're welcome!",
            };

        case 'goodbye':
            return {
                text: buildGoodbyeResponse(context),
                speakText: "Goodbye! Thanks for visiting!",
            };

        case 'unknown':
        default: {
            const text = buildSmartFallback(intent.originalInput, context);
            return {
                text,
                speakText: optimizeForSpeech(text),
            };
        }
    }
};

// ============ Quick Response Helpers ============

export const getWelcomeMessage = (): AssistantResponse => {
    return {
        text: `👋 Hey! I'm **Hakkan's Assistant**. I know everything about his ${PROJECTS_KNOWLEDGE.length} projects, technical skills, work experience, and more. Ask me anything or just say "help" to see what I can do!`,
        speakText: "Hey! I'm Hakkan's Assistant. Ask me anything about his portfolio, or say help to see what I can do!",
    };
};

export const getErrorResponse = (): AssistantResponse => {
    const errors = [
        "Oops! Something went wrong on my end. Could you try asking that again?",
        "Sorry, I hit a small snag. Please try rephrasing your question!",
        "Something went wrong, but don't worry! Try asking again.",
    ];
    return {
        text: getRandomItem(errors),
        speakText: "Sorry, something went wrong. Please try again.",
    };
};
