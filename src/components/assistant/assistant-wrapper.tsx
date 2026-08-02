'use client';

/**
 * Client-side wrapper for the Portfolio Assistant
 * This is needed because the 3D bot uses ssr: false which requires a client component
 */

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const PortfolioAssistant = dynamic(
    () => import('./portfolio-assistant'),
    { ssr: false }
);

type IdleWindow = Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
};

export default function AssistantWrapper() {
    const [shouldLoad, setShouldLoad] = useState(false);

    // The assistant pulls in the knowledge base, intent detection and response
    // generation — none of it is needed for first paint, and it already waits
    // 7s before greeting anyone. Holding the chunk back until the browser is
    // idle keeps it from competing with hydration.
    useEffect(() => {
        const w = window as IdleWindow;

        if (typeof w.requestIdleCallback === 'function') {
            const id = w.requestIdleCallback(() => setShouldLoad(true), { timeout: 2000 });
            return () => w.cancelIdleCallback?.(id);
        }

        const timer = setTimeout(() => setShouldLoad(true), 1200);
        return () => clearTimeout(timer);
    }, []);

    if (!shouldLoad) return null;

    return <PortfolioAssistant />;
}
