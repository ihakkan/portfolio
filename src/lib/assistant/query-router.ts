/**
 * Query Router
 * Central orchestration layer for the hybrid AI backend
 * Routes queries to appropriate engines based on classification
 * Handles follow-up responses using conversation memory
 */

import { classifyQuery, QueryCategory } from './query-classifier';
import { processUtilityQuery } from './utility-engine';
import { processCasualQuery } from './casual-engine';
import { processWorldQuery } from './world-engine';
import { detectIntent, DetectedIntent } from './intent-detector';
import { generateResponse, AssistantResponse } from './response-generator';
import {
    ConversationContext,
    createEmptyContext,
    updateContext,
    isAffirmativeResponse,
    isNegativeResponse,
    isChoiceDelegation,
} from './smart-response-engine';
import { PROJECTS_KNOWLEDGE } from './knowledge-base';

// ============ Types ============

export interface RouteResult {
    response: AssistantResponse;
    category: QueryCategory;
    updatedContext: ConversationContext;
}

// ============ Suggested Topic Mapping ============

// Maps suggested topics to the intent that should be triggered
const TOPIC_TO_INTENT: Record<string, DetectedIntent> = {
    'projects': {
        intent: 'projects',
        confidence: 1,
        params: {},
        originalInput: 'projects',
    },
    'skills': {
        intent: 'skills',
        confidence: 1,
        params: {},
        originalInput: 'skills',
    },
    'experience': {
        intent: 'experience',
        confidence: 1,
        params: {},
        originalInput: 'experience',
    },
    'education': {
        intent: 'education',
        confidence: 1,
        params: {},
        originalInput: 'education',
    },
    'certifications': {
        intent: 'certifications',
        confidence: 1,
        params: {},
        originalInput: 'certifications',
    },
    'contact': {
        intent: 'contact',
        confidence: 1,
        params: {},
        originalInput: 'contact',
    },
    'about': {
        intent: 'about',
        confidence: 1,
        params: {},
        originalInput: 'about',
    },
};

// Detect what topic was suggested in a response text
const detectSuggestedTopic = (responseText: string): string | null => {
    const textLower = responseText.toLowerCase();

    // Check for explicit suggestions
    if (textLower.includes('project') || textLower.includes('built')) {
        return 'projects';
    }
    if (textLower.includes('skill') || textLower.includes('tech')) {
        return 'skills';
    }
    if (textLower.includes('experience') || textLower.includes('work') || textLower.includes('internship')) {
        return 'experience';
    }
    if (textLower.includes('education') || textLower.includes('degree') || textLower.includes('college')) {
        return 'education';
    }
    if (textLower.includes('certification') || textLower.includes('course')) {
        return 'certifications';
    }
    if (textLower.includes('contact') || textLower.includes('reach') || textLower.includes('email')) {
        return 'contact';
    }
    if (textLower.includes('about') || textLower.includes('hakkan')) {
        return 'about';
    }

    return null;
};

// ============ Main Router ============

/**
 * Routes a user query through the appropriate engine pipeline
 * 
 * Flow:
 * 1. Check if this is a follow-up response (yes/no to a suggestion)
 * 2. Classify query into category (utility, casual, portfolio, world)
 * 3. Route to appropriate engine
 * 4. Detect and store any suggested topics for follow-up
 * 5. Return unified AssistantResponse
 * 
 * @param input - User's raw input text
 * @param context - Current conversation context
 * @returns RouteResult with response, category, and updated context
 */
export const routeQuery = (
    input: string,
    context: ConversationContext = createEmptyContext()
): RouteResult => {
    let response: AssistantResponse;
    let updatedContext = context;
    let category: QueryCategory;

    // Step 1: Check for follow-up responses (yes/no to previous suggestion)
    if (context.suggestedTopic && isAffirmativeResponse(input)) {
        // User said "yes" to a suggestion - fulfill it
        const topicIntent = TOPIC_TO_INTENT[context.suggestedTopic];

        if (topicIntent) {
            response = generateResponse(topicIntent, context);
            category = 'portfolio';

            // Update context and clear the suggestion (it's been addressed)
            updatedContext = {
                ...updateContext(context, topicIntent, topicIntent.intent),
                suggestedTopic: null,
            };

            // Check if the response suggests a new topic
            const newSuggestion = detectSuggestedTopic(response.text);
            if (newSuggestion && newSuggestion !== context.suggestedTopic) {
                updatedContext.suggestedTopic = newSuggestion;
            }

            return { response, category, updatedContext };
        }
    }

    if (context.suggestedTopic && isNegativeResponse(input)) {
        // User declined - acknowledge and clear suggestion
        const responses = [
            "No problem! Is there something else you'd like to know about Hakkan's portfolio?",
            "Sure thing! Feel free to ask about anything else – projects, skills, experience, or contact info!",
            "Alright! What else can I help you with? I know all about Hakkan's work.",
        ];
        response = {
            text: responses[Math.floor(Math.random() * responses.length)],
            speakText: responses[Math.floor(Math.random() * responses.length)],
        };
        category = 'casual';
        updatedContext = {
            ...context,
            suggestedTopic: null,
            turnCount: context.turnCount + 1,
        };
        return { response, category, updatedContext };
    }

    // Step 2: Check for choice delegation (you choose, pick one, surprise me)
    // This works best when the last topic was about projects
    if (isChoiceDelegation(input)) {
        // Pick a random project to recommend
        const randomProject = PROJECTS_KNOWLEDGE[Math.floor(Math.random() * PROJECTS_KNOWLEDGE.length)];

        const projectIntent: DetectedIntent = {
            intent: 'project_detail',
            confidence: 1,
            params: { projectName: randomProject.name },
            originalInput: input,
        };

        response = generateResponse(projectIntent, context);

        // Add a personalized intro
        const intros = [
            `Great! Let me recommend **${randomProject.name}** – `,
            `Alright, here's my pick: **${randomProject.name}**! `,
            `I'd suggest checking out **${randomProject.name}**! `,
        ];
        const intro = intros[Math.floor(Math.random() * intros.length)];
        response.text = intro + response.text;
        response.speakText = intro.replace(/\*\*/g, '') + (response.speakText || '');

        category = 'portfolio';
        updatedContext = {
            ...updateContext(context, projectIntent, 'project_detail'),
            suggestedTopic: 'projects', // Suggest exploring more projects
        };
        return { response, category, updatedContext };
    }

    // Step 3: Classify the query normally
    const classification = classifyQuery(input);
    category = classification.category;

    // Step 3: Route to appropriate engine
    switch (classification.category) {
        case 'utility': {
            // Handle with utility engine (math, time, date, identity)
            const subtype = classification.metadata?.subtype as string | undefined;
            const utilityResponse = processUtilityQuery(input, subtype);

            response = {
                text: utilityResponse.text,
                speakText: utilityResponse.speakText,
            };

            // Update context minimally for utility queries
            updatedContext = {
                ...context,
                suggestedTopic: null,  // Clear any pending suggestions
                turnCount: context.turnCount + 1,
            };
            break;
        }

        case 'casual': {
            // Handle with casual engine (greetings, wellbeing, farewells)
            const subtype = classification.metadata?.subtype as string | undefined;
            const casualResponse = processCasualQuery(subtype);

            response = {
                text: casualResponse.text,
                speakText: casualResponse.speakText,
            };

            // Update context for casual queries
            updatedContext = {
                ...context,
                suggestedTopic: null,  // Clear any pending suggestions
                turnCount: context.turnCount + 1,
            };
            break;
        }

        case 'portfolio': {
            // Use existing intent detection and response generation
            const intent = detectIntent(input);
            response = generateResponse(intent, context);

            // Update context using existing logic
            updatedContext = updateContext(
                context,
                intent,
                intent.intent !== 'unknown' ? intent.intent : undefined
            );

            // Detect if the response suggests a topic for potential follow-up
            const suggestedTopic = detectSuggestedTopic(response.text);
            if (suggestedTopic) {
                updatedContext.suggestedTopic = suggestedTopic;
            } else {
                updatedContext.suggestedTopic = null;
            }
            break;
        }

        case 'world':
        default: {
            // Handle with world engine (out-of-scope questions)
            const worldResponse = processWorldQuery(input);

            response = {
                text: worldResponse.text,
                speakText: worldResponse.speakText,
            };

            // Detect what topic was suggested in the redirect
            const suggestedTopic = detectSuggestedTopic(worldResponse.text);

            // Update context with suggested topic for follow-up
            updatedContext = {
                ...context,
                suggestedTopic: suggestedTopic,
                turnCount: context.turnCount + 1,
            };
            break;
        }
    }

    return {
        response,
        category,
        updatedContext,
    };
};

/**
 * Simple query processing that returns just the response
 * For backward compatibility with simpler use cases
 */
export const processQuery = (
    input: string,
    context?: ConversationContext
): AssistantResponse => {
    const result = routeQuery(input, context);
    return result.response;
};

export default routeQuery;
