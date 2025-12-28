/**
 * Response Generator
 * Generates intelligent, human-readable responses using the knowledge base
 * Handles all query types: general, specific, and detailed
 */

import { DetectedIntent, IntentType, PROJECT_CATEGORIES } from './intent-detector';
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
    PORTFOLIO_FEATURES_KNOWLEDGE,
    SECTIONS_KNOWLEDGE,
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

// Projects by Category - AI, Games, Utilities, Social
const buildProjectsByCategoryResponse = (category: string, context: ConversationContext): string => {
    const categoryNames: Record<string, string> = {
        'ai': 'AI-Powered',
        'utility': 'Utility Tool',
        'game': 'Game/Fun',
        'social': 'Social Platform',
        '3d': '3D/Graphics',
    };

    const categoryKey = category.toLowerCase();
    const projectNames = PROJECT_CATEGORIES[categoryKey] || [];

    if (projectNames.length === 0) {
        return buildProjectsListResponse(context);
    }

    const categoryDisplayName = categoryNames[categoryKey] || category.toUpperCase();

    const intros = [
        `Here are Hakkan's ${categoryDisplayName} projects:`,
        `Looking for ${categoryDisplayName} projects? Here they are:`,
        `Hakkan has built ${projectNames.length} ${categoryDisplayName} projects:`,
    ];

    const projectList = projectNames.map((name, i) => {
        const project = PROJECTS_KNOWLEDGE.find(p => p.name === name);
        if (project) {
            return `${i + 1}. **${project.name}** – ${project.shortDescription}`;
        }
        return `${i + 1}. **${name}**`;
    }).join('\n');

    return `${getRandomItem(intros)}\n\n${projectList}\n\n💡 *Ask about any of these projects for full details!*`;
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

// Smart Fallback with enhanced semantic understanding
const buildSmartFallback = (originalInput: string, context: ConversationContext): string => {
    const inputLower = originalInput.toLowerCase();

    // Normalize pronouns and references to Hakkan
    const normalizedInput = inputLower
        .replace(/\b(him|he|his|the guy|this guy|that guy|this person|the person)\b/g, 'hakkan')
        .replace(/\b(u|ur|you|your|yourself)\b/g, 'hakkan');

    // Comprehensive semantic topic detection with multiple keyword variations
    const topicMappings = [
        {
            topics: ['projects', 'work', 'portfolio'],
            keywords: ['project', 'projects', 'work', 'portfolio', 'built', 'build', 'create', 'created',
                'made', 'make', 'develop', 'developed', 'app', 'apps', 'application', 'website',
                'websites', 'software', 'thing', 'things', 'stuff', 'done', 'do', 'doing'],
            response: "It sounds like you're interested in Hakkan's work! Here's what I can tell you:\n\n" +
                "• **\"What are his projects?\"** – See all ${count} projects\n" +
                "• **\"Tell me about MockHick\"** – Get details on a specific project\n" +
                "• **\"AI projects\"** – See projects by category\n\n" +
                "What would you like to know?",
            projectCount: true
        },
        {
            topics: ['skills', 'tech'],
            keywords: ['skill', 'skills', 'tech', 'technology', 'technologies', 'stack', 'know', 'knows',
                'use', 'uses', 'good', 'expert', 'expertise', 'capable', 'ability', 'abilities',
                'language', 'languages', 'framework', 'frameworks', 'tool', 'tools', 'proficient'],
            response: "Sounds like you want to know about Hakkan's technical abilities! Try asking:\n\n" +
                "• **\"What are his skills?\"** – Full tech stack\n" +
                "• **\"Frontend skills\"** – Specific category\n" +
                "• **\"What languages does he know?\"** – Programming languages"
        },
        {
            topics: ['contact', 'reach'],
            keywords: ['contact', 'reach', 'connect', 'talk', 'speak', 'message', 'email', 'phone',
                'call', 'hire', 'hiring', 'touch', 'linkedin', 'github', 'find', 'get',
                'available', 'freelance', 'chat', 'communication'],
            response: "Want to get in touch with Hakkan? Here are your options:\n\n" +
                "• **\"How can I contact him?\"** – All contact methods\n" +
                "• **\"What's his email?\"** – Specific contact\n" +
                "• **\"I want to hire him\"** – Contact for opportunities\n\n" +
                "Just ask!"
        },
        {
            topics: ['experience', 'work history'],
            keywords: ['experience', 'job', 'jobs', 'work', 'worked', 'working', 'intern', 'internship',
                'company', 'companies', 'career', 'professional', 'employment', 'employed',
                'position', 'role', 'background', 'history', 'previous', 'current'],
            response: "Interested in Hakkan's professional experience? Ask:\n\n" +
                "• **\"What's his experience?\"** – Work history\n" +
                "• **\"Where has he worked?\"** – Companies\n" +
                "• **\"Tell me about his current job\"** – Current position"
        },
        {
            topics: ['education', 'study'],
            keywords: ['education', 'study', 'studied', 'studying', 'degree', 'college', 'university',
                'school', 'academic', 'qualification', 'graduate', 'graduation', 'learn',
                'learning', 'student', 'cgpa', 'gpa', 'marks', 'score'],
            response: "Looking for educational background? Try:\n\n" +
                "• **\"What's his education?\"** – Full academic history\n" +
                "• **\"Where did he study?\"** – College info\n" +
                "• **\"What degree does he have?\"** – Qualifications"
        },
        {
            topics: ['certifications', 'courses'],
            keywords: ['certificate', 'certificates', 'certification', 'certifications', 'course',
                'courses', 'training', 'trained', 'credential', 'credentials', 'certified',
                'badge', 'badges', 'qualified', 'aws', 'mern'],
            response: "Want to see credentials? Ask about:\n\n" +
                "• **\"What certifications does he have?\"** – All certs\n" +
                "• **\"Any AWS certifications?\"** – Specific ones"
        },
        {
            topics: ['about', 'intro'],
            keywords: ['who', 'about', 'intro', 'introduction', 'person', 'guy', 'hakkan', 'background',
                'himself', 'self', 'bio', 'biography', 'describe', 'description', 'tell',
                'know', 'meet'],
            response: "Want to know about Hakkan? Try:\n\n" +
                "• **\"Who is Hakkan?\"** – Quick intro\n" +
                "• **\"Tell me more about him\"** – Detailed background\n" +
                "• **\"What does he do?\"** – His work profile"
        }
    ];

    // Check for semantic matches
    for (const mapping of topicMappings) {
        const matchCount = mapping.keywords.filter(kw => normalizedInput.includes(kw)).length;
        if (matchCount >= 1) {
            let response = mapping.response;
            if (mapping.projectCount) {
                response = response.replace('${count}', String(PROJECTS_KNOWLEDGE.length));
            }
            return response;
        }
    }

    // Check for question patterns without clear topic
    const isQuestion = /\?$|^(what|who|how|where|when|why|can|do|does|is|are|tell|show|give|explain)/i.test(originalInput);

    if (isQuestion) {
        return "Great question! I'm Hakkan's portfolio assistant and I can help with:\n\n" +
            "🚀 **Projects** – \"What has he built?\"\n" +
            "💻 **Skills** – \"What tech does he know?\"\n" +
            "💼 **Experience** – \"Where has he worked?\"\n" +
            "📧 **Contact** – \"How can I reach him?\"\n" +
            "🎓 **Education** – \"Where did he study?\"\n" +
            "👤 **About** – \"Who is Hakkan?\"\n\n" +
            "What would you like to explore?";
    }

    // Context-aware fallback
    if (context.lastTopic) {
        const topicResponses: Record<string, string> = {
            'projects': "We were just talking about projects. Would you like details on a specific one, or explore something else?",
            'skills': "We were discussing skills. Want to dive into a specific category like frontend or AI tools?",
            'experience': "We were looking at experience. Want more details about a specific role?",
            'contact': "We were on contact info. Need a specific way to reach Hakkan?",
            'education': "We were on education. Any specific questions about his academic background?"
        };

        if (topicResponses[context.lastTopic]) {
            return topicResponses[context.lastTopic];
        }

        return `I was just telling you about ${context.lastTopic}. Want more details on that, or should we explore something else like projects, skills, or experience?`;
    }

    // Friendly generic fallback with clear guidance
    const fallbacks = [
        "I'm here to help you learn about Hakkan! I can share details about his **projects**, **technical skills**, **work experience**, **education**, or **contact info**. What interests you most?",
        "I didn't quite catch that, but I know everything about Hakkan's portfolio! Ask me about his **projects** (he's built ${count}!), **skills**, or **how to contact him**.",
        "I'm Hakkan's portfolio assistant 🤖 I can tell you about:\n• His **projects** and what he's built\n• His **skills** and tech stack\n• His **experience** and career\n• How to **contact** him\n\nWhat would you like to know?"
    ];

    return getRandomItem(fallbacks).replace('${count}', String(PROJECTS_KNOWLEDGE.length));
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

        case 'portfolio_overview': {
            const text = `🌟 **Hakkan's Portfolio Overview**\n\n` +
                `This portfolio is packed with cool features! Here's what you'll find:\n\n` +
                `📄 **Resume/CV**\n${PORTFOLIO_FEATURES_KNOWLEDGE.resume.shortAnswer}\n\n` +
                `💻 **Terminal Animation**\n${PORTFOLIO_FEATURES_KNOWLEDGE.terminal.shortAnswer}\n\n` +
                `🎮 **Hidden Minigames**\n${PORTFOLIO_FEATURES_KNOWLEDGE.heroImage.shortAnswer}\n\n` +
                `📊 **GitHub Stats**\n${PORTFOLIO_FEATURES_KNOWLEDGE.githubStats.shortAnswer}\n\n` +
                `🚀 **${PROJECTS_KNOWLEDGE.length} Projects**\nFrom AI-powered apps to fun games – explore them all in the Projects section!\n\n` +
                `💡 *Ask me about any specific feature for more details!*`;

            const speakText = `Welcome to Hakkan's portfolio! Let me give you a tour. ` +
                `First, in the home section, you'll see a cool terminal animation that types out Hakkan's introduction like a real command line. ` +
                `Right below the terminal, there's a Download CV button where you can get his complete resume. ` +
                `Here's a fun secret: try clicking on Hakkan's profile picture multiple times to discover hidden Easter egg minigames! ` +
                `Scroll down and you'll find a GitHub Stats section showing his coding activity, contribution streaks, and most used programming languages. ` +
                `The portfolio also features ${PROJECTS_KNOWLEDGE.length} amazing projects including AI-powered tools, web apps, and games. ` +
                `You can explore sections like About, Experience, Skills, Education, and Contact. ` +
                `Feel free to ask me about any of these in detail!`;

            return {
                text,
                speakText,
                action: { type: 'navigate', target: 'home' },
            };
        }

        case 'section_detail': {
            const sectionName = intent.params.section || 'home';
            const sectionKey = sectionName as keyof typeof SECTIONS_KNOWLEDGE;
            const sectionInfo = SECTIONS_KNOWLEDGE[sectionKey];

            if (sectionInfo) {
                const text = `${sectionInfo.title}\n\n${sectionInfo.description}`;
                return {
                    text,
                    speakText: sectionInfo.speakText,
                    action: { type: 'navigate', target: sectionName },
                };
            }

            return {
                text: "I can provide details about: Home, About, Experience, Projects, Skills, Education, Certifications, and Contact sections. Which one would you like to know about?",
                speakText: "Which section would you like to know about? I can tell you about Home, About, Experience, Projects, Skills, Education, Certifications, or Contact.",
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

        case 'projects_category': {
            const category = intent.params.category || 'ai';
            const text = buildProjectsByCategoryResponse(category, context);
            const categoryProjects = PROJECT_CATEGORIES[category] || [];
            const speakNames = categoryProjects.slice(0, 3).join(', ');
            return {
                text,
                speakText: generateEnhancedSpeech(
                    `Hakkan has ${categoryProjects.length} ${category} related projects, including ${speakNames}. Would you like details on any of these?`,
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

        case 'portfolio_feature': {
            const feature = intent.params.feature || 'resume';
            let text = '';
            let speakText = '';

            switch (feature) {
                case 'resume':
                    text = "📄 **Resume/CV**\n\n" + PORTFOLIO_FEATURES_KNOWLEDGE.resume.location;
                    speakText = PORTFOLIO_FEATURES_KNOWLEDGE.resume.shortAnswer;
                    break;
                case 'terminal':
                    text = "💻 **Terminal Animation**\n\n" + PORTFOLIO_FEATURES_KNOWLEDGE.terminal.description;
                    speakText = PORTFOLIO_FEATURES_KNOWLEDGE.terminal.shortAnswer;
                    break;
                case 'minigame':
                    text = "🎮 **Hidden Minigames**\n\n" + PORTFOLIO_FEATURES_KNOWLEDGE.heroImage.description;
                    speakText = PORTFOLIO_FEATURES_KNOWLEDGE.heroImage.shortAnswer;
                    break;
                case 'github':
                    text = "📊 **GitHub Stats**\n\n" + PORTFOLIO_FEATURES_KNOWLEDGE.githubStats.description;
                    speakText = PORTFOLIO_FEATURES_KNOWLEDGE.githubStats.shortAnswer;
                    break;
                default:
                    text = "This portfolio has cool features! Ask me about the **resume download**, **terminal animation**, **hidden minigames**, or **GitHub stats**!";
                    speakText = "This portfolio has many cool features! Ask me about the resume, terminal, minigames, or GitHub stats.";
            }

            return {
                text,
                speakText,
                action: { type: 'navigate', target: 'home' },
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
