/**
 * Response Generator
 * Generates human-readable responses from portfolio data based on detected intents
 */

import { DetectedIntent, IntentType } from './intent-detector';
import {
    getFormattedAbout,
    getFormattedProjectsList,
    getFormattedProjectDetails,
    getFormattedSkillsList,
    getFormattedExperience,
    getFormattedEducation,
    getFormattedCertifications,
    getFormattedContact,
    getProjectByName,
    getSectionId,
} from './portfolio-data';

// ============ Response Types ============

export interface AssistantResponse {
    text: string;
    speakText?: string; // Optimized for TTS (shorter, simpler)
    action?: {
        type: 'navigate';
        target: string;
    };
}

// ============ Response Templates ============

const greetings = [
    "Hello! I'm Hakkan's Portfolio Assistant. How can I help you learn more about Hakkan's work and skills?",
    "Hi there! Welcome to Hakkan's portfolio. Feel free to ask me anything about his projects, skills, or experience!",
    "Hey! I'm here to help you navigate Hakkan's portfolio. What would you like to know?",
];

const helpText = `I can help you with:

• **About** - Learn about Hakkan
• **Projects** - Explore the portfolio projects
• **Skills** - See technical skills and tools
• **Experience** - View work history
• **Education** - Check educational background
• **Certifications** - View certificates
• **Contact** - Get contact information

You can also ask me to navigate to any section, like "Go to projects" or "Show me the skills section".`;

const thanksResponses = [
    "You're welcome! Let me know if you need anything else.",
    "Happy to help! Feel free to ask more questions.",
    "No problem! Is there anything else you'd like to know?",
];

const goodbyeResponses = [
    "Goodbye! Thanks for visiting Hakkan's portfolio.",
    "See you later! Don't forget to check out the projects!",
    "Take care! Feel free to come back anytime.",
];

const fallbackResponses = [
    "I'm not sure I understand. I can help you with information about Hakkan's projects, skills, experience, education, certifications, or contact details. What would you like to know?",
    "I can only answer questions about Hakkan's portfolio content. Try asking about projects, skills, or experience!",
    "I didn't quite catch that. Would you like to know about Hakkan's projects, skills, experience, or how to contact him?",
];

// ============ Helper Functions ============

const getRandomItem = <T>(items: T[]): T => {
    return items[Math.floor(Math.random() * items.length)];
};

const simplifyForSpeech = (text: string): string => {
    // Remove markdown formatting
    return text
        .replace(/\*\*/g, '')
        .replace(/\n\n/g, '. ')
        .replace(/\n/g, '. ')
        .replace(/\d+\.\s/g, '')
        .trim();
};

// ============ Response Generator ============

export const generateResponse = (intent: DetectedIntent): AssistantResponse => {
    switch (intent.intent) {
        case 'greeting':
            return {
                text: getRandomItem(greetings),
                speakText: "Hello! I'm Hakkan's Portfolio Assistant. How can I help you?",
            };

        case 'about':
            const aboutText = getFormattedAbout();
            return {
                text: aboutText,
                speakText: simplifyForSpeech(aboutText),
                action: { type: 'navigate', target: 'about' },
            };

        case 'projects':
            const projectsText = getFormattedProjectsList();
            return {
                text: projectsText,
                speakText: "Hakkan has built several projects including MockHick, BuildMyCV, VerifyAI, and more. Would you like to know more about any specific project?",
                action: { type: 'navigate', target: 'projects' },
            };

        case 'project_detail':
            const projectName = intent.params.projectName;
            if (projectName) {
                const project = getProjectByName(projectName);
                if (project) {
                    const detailText = getFormattedProjectDetails(project);
                    return {
                        text: detailText,
                        speakText: simplifyForSpeech(detailText),
                        action: { type: 'navigate', target: 'projects' },
                    };
                }
            }
            return {
                text: "I couldn't find that specific project. " + getFormattedProjectsList(),
                speakText: "I couldn't find that project. Let me show you all available projects.",
                action: { type: 'navigate', target: 'projects' },
            };

        case 'skills':
            const skillsText = getFormattedSkillsList();
            return {
                text: skillsText,
                speakText: "Hakkan is skilled in Frontend technologies like React and Next.js, Backend with Node.js and Express, and various databases. He's also proficient with tools like Git, VS Code, and AI assistants.",
                action: { type: 'navigate', target: 'skills' },
            };

        case 'experience':
            const expText = getFormattedExperience();
            return {
                text: expText,
                speakText: simplifyForSpeech(expText),
                action: { type: 'navigate', target: 'experience' },
            };

        case 'education':
            const eduText = getFormattedEducation();
            return {
                text: eduText,
                speakText: simplifyForSpeech(eduText),
                action: { type: 'navigate', target: 'education' },
            };

        case 'certifications':
            const certText = getFormattedCertifications();
            return {
                text: certText,
                speakText: simplifyForSpeech(certText),
                action: { type: 'navigate', target: 'certifications' },
            };

        case 'contact':
            const contactText = getFormattedContact();
            return {
                text: contactText,
                speakText: "You can reach Hakkan via email at hakkanparbej@gmail.com, on GitHub as HakkanShah, or on LinkedIn. Should I navigate to the contact section?",
                action: { type: 'navigate', target: 'contact' },
            };

        case 'navigation':
            const section = intent.params.section;
            if (section) {
                const sectionId = getSectionId(section);
                if (sectionId) {
                    return {
                        text: `Navigating to the ${section} section...`,
                        speakText: `Taking you to ${section}`,
                        action: { type: 'navigate', target: sectionId },
                    };
                }
            }
            return {
                text: "I couldn't find that section. Available sections are: Home, About, Experience, Projects, Skills, Education, Certifications, and Contact.",
                speakText: "I couldn't find that section. Try asking for projects, skills, or experience.",
            };

        case 'help':
            return {
                text: helpText,
                speakText: "I can help you learn about Hakkan's projects, skills, experience, education, certifications, and contact info. Just ask!",
            };

        case 'thanks':
            return {
                text: getRandomItem(thanksResponses),
                speakText: "You're welcome!",
            };

        case 'goodbye':
            return {
                text: getRandomItem(goodbyeResponses),
                speakText: "Goodbye! Thanks for visiting!",
            };

        case 'unknown':
        default:
            return {
                text: getRandomItem(fallbackResponses),
                speakText: "I'm not sure about that. Try asking about projects, skills, or experience.",
            };
    }
};

// ============ Quick Response Helpers ============

export const getWelcomeMessage = (): AssistantResponse => {
    return {
        text: "👋 Hi! I'm **Hakkan's Assistant**. Ask me anything about his projects, skills, experience, or how to contact him!",
        speakText: "Hi! I'm Hakkan's Assistant. Ask me anything about his portfolio!",
    };
};

export const getErrorResponse = (): AssistantResponse => {
    return {
        text: "Sorry, something went wrong. Please try asking your question again.",
        speakText: "Sorry, something went wrong. Please try again.",
    };
};
