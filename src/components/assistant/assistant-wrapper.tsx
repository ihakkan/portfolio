'use client';

/**
 * Client-side wrapper for the Portfolio Assistant
 * This is needed because the 3D bot uses ssr: false which requires a client component
 */

import dynamic from 'next/dynamic';

const PortfolioAssistant = dynamic(
    () => import('./portfolio-assistant'),
    { ssr: false }
);

export default function AssistantWrapper() {
    return <PortfolioAssistant />;
}
