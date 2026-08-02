/**
 * Thin client for /api/chat.
 *
 * Every failure surfaces as an AssistantApiError carrying a display-ready
 * message, so the context layer can drop it straight into the chat without
 * inventing copy of its own. AbortError is rethrown untouched — a superseded
 * request is not an error.
 */

import type { AssistantResponse, Turn } from './types';
import { getSectionId } from './sections';

export type ChatErrorCode =
    | 'bad_request'
    | 'unconfigured'
    | 'rate_limited'
    | 'upstream'
    | 'timeout'
    | 'network';

export class AssistantApiError extends Error {
    constructor(public readonly code: ChatErrorCode, message: string) {
        super(message);
        this.name = 'AssistantApiError';
    }
}

const GENERIC = "I couldn't reach my brain just now. Try again in a moment?";

export async function askAssistant(
    message: string,
    history: Turn[],
    signal: AbortSignal
): Promise<AssistantResponse> {
    let res: Response;

    try {
        res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history }),
            signal,
        });
    } catch (error) {
        if ((error as Error)?.name === 'AbortError') throw error;
        throw new AssistantApiError('network', GENERIC);
    }

    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new AssistantApiError(body?.code ?? 'upstream', body?.error ?? GENERIC);
    }

    const data = await res.json().catch(() => null);
    if (!data?.text) throw new AssistantApiError('upstream', GENERIC);

    // The route already validates this, but the target crosses a network
    // boundary — re-narrow it rather than trusting the wire.
    const target = data.action?.target ? getSectionId(data.action.target) : null;

    return {
        text: data.text,
        speakText: data.speakText,
        action: target ? { type: 'navigate', target } : undefined,
    };
}
