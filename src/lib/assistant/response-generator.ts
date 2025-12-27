/**
 * Response Generator
 * Generates intelligent, human-readable responses using the knowledge base
 * Handles all query types: general, specific, and detailed
 */

import { DetectedIntent, IntentType } from './intent-detector';
import { getSectionId } from './portfolio-data';
import {
    ConversationContext,
    createEmptyContext,
    optimizeForSpeech,
    generateEnhancedSpeech,
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

// About - Quick intro
const buildAboutResponse = (context: ConversationContext): string => {
    const intros = [
        "Here's a quick intro! ",
        "Let me introduce Hakkan: ",
        "",
    ];

    return getRandomItem(intros) + ABOUT_KNOWLEDGE.quickIntro + "\n\n💡 *Want more details? Ask \"tell me more about Hakkan\"!*";
};

// About Detail - Full bio
const buildAboutDetailResponse = (context: ConversationContext): string => {
    const intros = [
        "Let me tell you more about Hakkan! ",
        "Here's the full story: ",
        "Diving deeper into Hakkan's background: ",
    ];

    return getRandomItem(intros) + ABOUT_KNOWLEDGE.detailedAbout + "\n\n💡 *Want to know about his projects or skills?*";
};

// Projects List
const buildProjectsListResponse = (context: ConversationContext): string => {
    const intros = [
        `Hakkan has built ${PROJECTS_KNOWLEDGE.length} impressive projects! Here's the lineup:`,
        `Let me walk you through Hakkan's ${PROJECTS_KNOWLEDGE.length} projects:`,
        `Check out what Hakkan has created:`,
    ];

    const projectList = PROJECTS_KNOWLEDGE.map((p, i) => {
        return `${i + 1}. **${p.name}** – ${p.shortDescription}`;
    }).join('\n');

    const outros = [
        "\n\n💡 *Ask about any specific project for full details! Just say the project name.*",
        "\n\n🔍 *Interested in any of these? Ask \"tell me about [project name]\"!*",
    ];

    return `${getRandomItem(intros)}\n\n${projectList}${getRandomItem(outros)}`;
};

// Project Detail - Full project info
const buildProjectDetailResponse = (projectName: string, context: ConversationContext): string | null => {
    const project = findProject(projectName);
    if (!project) return null;

    const intros = [
        `Here's everything about ${project.name}! `,
        `${project.name} is one of Hakkan's standout projects! `,
        `Let me tell you all about ${project.name}: `,
    ];

    const sections = [
        project.detailedDescription,
        `\n\n**🎯 Why it was built:**\n${project.whyBuilt}`,
        `\n\n**🛠️ Tech Stack:**\n${project.techHighlights}`,
        `\n\n🌟 **Fun fact:** ${project.coolFact}`,
        `\n\n🔗 **Check it out:** [${project.name}](${project.liveUrl})`,
    ];

    return getRandomItem(intros) + sections.join('');
};

// Skills - All categories
const buildSkillsResponse = (context: ConversationContext): string => {
    const { categories } = SKILLS_KNOWLEDGE;

    const intros = [
        "Hakkan's got a solid tech arsenal! Here's the complete breakdown:",
        "Let me walk you through Hakkan's full technical skill set:",
        "Here's everything Hakkan brings to the table:",
    ];

    const skillsText = [
        `\n\n**🎨 Frontend:**\n${categories.frontend.skills.join(', ')}\n*${categories.frontend.highlight}*`,
        `\n\n**⚙️ Backend:**\n${categories.backend.skills.join(', ')}\n*${categories.backend.highlight}*`,
        `\n\n**🗄️ Databases:**\n${categories.database.skills.join(', ')}\n*${categories.database.highlight}*`,
        `\n\n**🎯 UI/UX:**\n${categories.uiux.skills.join(', ')}\n*${categories.uiux.highlight}*`,
        `\n\n**🤖 AI Tools:**\n${categories.aiTools.skills.join(', ')}\n*${categories.aiTools.highlight}*`,
        `\n\n**🛠️ Dev Tools:**\n${categories.tools.skills.slice(0, 6).join(', ')}`,
        `\n\n**💡 Soft Skills:**\n${categories.softSkills.skills.join(', ')}`,
    ].join('');

    return `${getRandomItem(intros)}${skillsText}\n\n💡 *Ask about a specific category like "frontend skills" or "AI tools"!*`;
};

// Skill Category - Specific category
const buildSkillCategoryResponse = (category: string, context: ConversationContext): string => {
    const { categories } = SKILLS_KNOWLEDGE;
    const categoryKey = category.toLowerCase() as keyof typeof categories;
    const cat = categories[categoryKey];

    if (!cat) {
        return buildSkillsResponse(context);
    }

    const intros = [
        `Here's Hakkan's ${category} expertise:`,
        `When it comes to ${category}:`,
        `Let me tell you about his ${category} skills:`,
    ];

    return `${getRandomItem(intros)}\n\n**Skills:** ${cat.skills.join(', ')}\n\n${cat.summary}\n\n*${cat.highlight}*`;
};

// Experience - All positions
const buildExperienceResponse = (context: ConversationContext): string => {
    const { positions, overview } = EXPERIENCE_KNOWLEDGE;

    const intros = [
        "Here's Hakkan's professional journey:",
        "Let me share Hakkan's work experience:",
        overview,
    ];

    const expText = positions.map((pos) => {
        const achievementHighlights = pos.achievements.slice(0, 4).map(a => `  • ${a}`).join('\n');
        return `\n\n**${pos.role}** at ${pos.company} *(${pos.status === 'Current' ? '🟢 Current' : '🔵 Previous'})*\n\n${pos.summary}\n\n*Key contributions:*\n${achievementHighlights}\n\n*Tech used:* ${pos.techUsed.join(', ')}`;
    }).join('\n\n---');

    return `${getRandomItem(intros)}${expText}\n\n💡 *Ask about a specific role for more details!*`;
};

// Experience Detail - Specific company
const buildExperienceDetailResponse = (company: string, context: ConversationContext): string => {
    const { positions } = EXPERIENCE_KNOWLEDGE;

    const position = positions.find(p =>
        p.company.toLowerCase().includes(company.toLowerCase()) ||
        (company.toLowerCase() === 'aiking' && p.company.toLowerCase().includes('aiking'))
    );

    if (!position) {
        return buildExperienceResponse(context);
    }

    const intros = [
        `Here's the details about Hakkan's role at ${position.company}:`,
        `Let me tell you about the ${position.role} position:`,
    ];

    const allAchievements = position.achievements.map(a => `• ${a}`).join('\n');

    return `${getRandomItem(intros)}\n\n**${position.role}** at ${position.company}\n*Status: ${position.status === 'Current' ? '🟢 Currently working here' : '🔵 Completed'}*\n\n${position.summary}\n\n**All Achievements:**\n${allAchievements}\n\n**Technologies Used:**\n${position.techUsed.join(', ')}\n\n*${position.funFact}*`;
};

// Education
const buildEducationResponse = (context: ConversationContext): string => {
    const { degrees } = EDUCATION_KNOWLEDGE;

    const intros = [
        "Here's Hakkan's educational background:",
        "On the academic front:",
        "Let me share Hakkan's education:",
    ];

    const eduText = degrees.map((edu) => {
        return `\n\n**🎓 ${edu.degree}**\n${edu.institution}\n*${edu.period}* | *${edu.performance}*\n${edu.description}`;
    }).join('');

    return `${getRandomItem(intros)}${eduText}`;
};

// Certifications
const buildCertificationsResponse = (context: ConversationContext): string => {
    const { certifications, overview } = CERTIFICATIONS_KNOWLEDGE;

    const intros = [
        "Hakkan has earned several certifications:",
        overview,
        "Here are Hakkan's credentials:",
    ];

    const certText = certifications.map((cert, i) => {
        return `\n${i + 1}. **${cert.name}**\n   *Issued by:* ${cert.issuer}\n   ${cert.description}\n   *${cert.relevance}*`;
    }).join('\n');

    return `${getRandomItem(intros)}${certText}`;
};

// Contact - All channels
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

    return `${getRandomItem(intros)}${contactText}\n\n✨ *${cta}*\n\n💡 *Ask specifically like "what's his GitHub?" for quick info!*`;
};

// Contact Specific - Single channel
const buildContactSpecificResponse = (method: string, context: ConversationContext): string => {
    const { channels } = CONTACT_KNOWLEDGE;

    switch (method) {
        case 'email':
            return `📧 **Hakkan's Email:** ${channels.email.value}\n\n${channels.email.description}\n\n*${channels.email.action}*`;
        case 'phone':
            return `📱 **Hakkan's Phone:** ${channels.phone.value}\n\n${channels.phone.description}\n\n*${channels.phone.action}*`;
        case 'github':
            return `💻 **Hakkan's GitHub:** [${channels.github.username}](${channels.github.url})\n\n${channels.github.description}\n\n*${channels.github.action}*`;
        case 'linkedin':
            return `💼 **Hakkan's LinkedIn:** [${channels.linkedin.username}](${channels.linkedin.url})\n\n${channels.linkedin.description}\n\n*${channels.linkedin.action}*`;
        case 'googleDev':
            return `🔷 **Hakkan's Google Dev:** [${channels.googleDev.username}](${channels.googleDev.url})\n\n${channels.googleDev.description}\n\n*${channels.googleDev.action}*`;
        default:
            return buildContactResponse(context);
    }
};

// Help
const buildHelpResponse = (context: ConversationContext): string => {
    if (context.turnCount > 3) {
        return `Quick reminder – I can help with:\n\n• **Projects** – See what Hakkan has built\n• **Skills** – Technical expertise\n• **Experience** – Work history\n• **Contact** – Get in touch\n\nJust ask naturally!`;
    }

    return `I'm here to help you explore Hakkan's portfolio! Here's what I know about:\n\n` +
        `🚀 **Projects** – ${PROJECTS_KNOWLEDGE.length} impressive builds\n` +
        `   _Examples: "show me projects", "tell me about MockHick"_\n\n` +
        `💻 **Skills** – Full tech stack\n` +
        `   _Examples: "what are his skills?", "frontend skills"_\n\n` +
        `💼 **Experience** – Work history & internships\n` +
        `   _Examples: "work experience", "tell me about UDRCrafts"_\n\n` +
        `🎓 **Education** – Academic background\n` +
        `   _Examples: "education", "what degree?"_\n\n` +
        `📜 **Certifications** – Credentials & courses\n` +
        `   _Examples: "certifications", "what courses?"_\n\n` +
        `📧 **Contact** – Ways to connect\n` +
        `   _Examples: "contact info", "what's his GitHub?"_\n\n` +
        `👤 **About** – Who is Hakkan?\n` +
        `   _Examples: "who is Hakkan?", "tell me more about him"_\n\n` +
        `Just ask naturally – I understand many different ways of asking!`;
};

// Thanks
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

// Goodbye
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

// Navigation
const buildNavigationResponse = (section: string): string => {
    const responses = [
        `Taking you to the ${section} section now!`,
        `Navigating to ${section}... There you go!`,
        `Sure thing! Here's the ${section} section.`,
        `Scrolling to ${section} for you!`,
    ];
    return getRandomItem(responses);
};

// Smart Fallback
const buildSmartFallback = (originalInput: string, context: ConversationContext): string => {
    const inputLower = originalInput.toLowerCase();

    // Topic-based hints
    const topicHints = [
        { keywords: ['work', 'job', 'career', 'company', 'intern'], suggestion: "Looks like you're asking about work. Try asking about Hakkan's **experience** or **internships**!" },
        { keywords: ['code', 'program', 'develop', 'build', 'make', 'create', 'app'], suggestion: "Sounds like you're interested in what Hakkan has built! Ask about his **projects**." },
        { keywords: ['tech', 'framework', 'language', 'tool', 'know', 'use', 'stack', 'skill'], suggestion: "Want to know Hakkan's tech stack? Ask about his **skills**!" },
        { keywords: ['study', 'degree', 'college', 'school', 'learn', 'university', 'academic'], suggestion: "Curious about academics? Ask about Hakkan's **education**!" },
        { keywords: ['hire', 'freelance', 'available', 'reach', 'email', 'call', 'connect'], suggestion: "Want to get in touch? Ask for **contact** information!" },
        { keywords: ['certificate', 'course', 'training', 'certified'], suggestion: "Looking for credentials? Ask about **certifications**!" },
        { keywords: ['who', 'about', 'hakkan', 'person', 'himself'], suggestion: "Want to know about Hakkan? Just ask \"Who is Hakkan?\" or \"Tell me more about him\"!" },
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
                speakText: generateEnhancedSpeech(ABOUT_KNOWLEDGE.quickIntro + " " + ABOUT_KNOWLEDGE.versions.casual, 'general'),
                action: { type: 'navigate', target: 'about' },
            };
        }

        case 'about_detail': {
            const text = buildAboutDetailResponse(context);
            return {
                text,
                speakText: generateEnhancedSpeech(ABOUT_KNOWLEDGE.detailedAbout, 'general', { maxLength: 600 }),
                action: { type: 'navigate', target: 'about' },
            };
        }

        case 'projects': {
            const text = buildProjectsListResponse(context);
            const projectNames = PROJECTS_KNOWLEDGE.slice(0, 5).map(p => p.name).join(', ');
            return {
                text,
                speakText: generateEnhancedSpeech(
                    `Hakkan has built ${PROJECTS_KNOWLEDGE.length} impressive projects! Here are some highlights: ${projectNames}. Each project solves real problems using modern tech.`,
                    'projects'
                ),
                action: { type: 'navigate', target: 'projects' },
            };
        }

        case 'project_detail': {
            const projectName = intent.params.projectName;
            if (projectName) {
                const text = buildProjectDetailResponse(projectName, context);
                if (text) {
                    const project = findProject(projectName);
                    if (project) {
                        const detailedSpeech = `${project.name} is ${project.shortDescription} ${project.whyBuilt} The tech stack includes ${project.techHighlights} Here's a fun fact: ${project.coolFact}`;
                        return {
                            text,
                            speakText: generateEnhancedSpeech(detailedSpeech, 'projects', { maxLength: 600 }),
                            action: { type: 'navigate', target: 'projects' },
                        };
                    }
                    return {
                        text,
                        speakText: generateEnhancedSpeech(text, 'projects', { maxLength: 500 }),
                        action: { type: 'navigate', target: 'projects' },
                    };
                }
            }
            return {
                text: `I couldn't find that specific project. ${buildProjectsListResponse(context)}`,
                speakText: `I couldn't find that project. Let me show you all ${PROJECTS_KNOWLEDGE.length} projects Hakkan has built. Which one would you like to hear about?`,
                action: { type: 'navigate', target: 'projects' },
            };
        }

        case 'skills': {
            const text = buildSkillsResponse(context);
            const { categories } = SKILLS_KNOWLEDGE;
            const skillsSpeech = `Hakkan has a versatile skill set! On the frontend, he works with ${categories.frontend.skills.slice(0, 3).join(', ')}, and more. For backend, he uses ${categories.backend.skills.slice(0, 3).join(', ')}. He's also experienced with databases like ${categories.database.skills.slice(0, 3).join(', ')}, and has integrated AI tools like ${categories.aiTools.skills.join(', ')}.`;
            return {
                text,
                speakText: generateEnhancedSpeech(skillsSpeech, 'skills'),
                action: { type: 'navigate', target: 'skills' },
            };
        }

        case 'skill_category': {
            const category = intent.params.category || 'frontend';
            const text = buildSkillCategoryResponse(category, context);
            return {
                text,
                speakText: generateEnhancedSpeech(text, 'skills'),
                action: { type: 'navigate', target: 'skills' },
            };
        }

        case 'experience': {
            const text = buildExperienceResponse(context);
            const { positions } = EXPERIENCE_KNOWLEDGE;
            const currentJob = positions.find(p => p.status === 'Current');
            const previousJob = positions.find(p => p.status === 'Previous');
            const expSpeech = `Hakkan has real-world experience through internships! He's currently working as a ${currentJob?.role} at ${currentJob?.company}, building e-commerce solutions. Previously, he was a ${previousJob?.role} at ${previousJob?.company}, working on an AI interview platform.`;
            return {
                text,
                speakText: generateEnhancedSpeech(expSpeech, 'experience'),
                action: { type: 'navigate', target: 'experience' },
            };
        }

        case 'experience_detail': {
            const company = intent.params.company || 'UDRCRAFTS';
            const text = buildExperienceDetailResponse(company, context);
            const position = EXPERIENCE_KNOWLEDGE.positions.find(p =>
                p.company.toLowerCase().includes(company.toLowerCase())
            );
            if (position) {
                const achievements = position.achievements.slice(0, 3).join('. ');
                const detailSpeech = `At ${position.company}, Hakkan works as a ${position.role}. ${position.summary} Some key achievements include: ${achievements}. He uses technologies like ${position.techUsed.slice(0, 4).join(', ')}.`;
                return {
                    text,
                    speakText: generateEnhancedSpeech(detailSpeech, 'experience', { maxLength: 600 }),
                    action: { type: 'navigate', target: 'experience' },
                };
            }
            return {
                text,
                speakText: generateEnhancedSpeech(text, 'experience', { maxLength: 500 }),
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

        case 'contact_specific': {
            const method = intent.params.method || 'email';
            const text = buildContactSpecificResponse(method, context);
            return {
                text,
                speakText: optimizeForSpeech(text),
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
