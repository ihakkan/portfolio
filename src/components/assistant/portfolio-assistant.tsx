'use client';

/**
 * Portfolio Assistant Main Component
 * Floating button with expandable chat panel
 */

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Minimize2, Sparkles, MessageSquareText, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssistantProvider, useAssistant } from '@/lib/assistant';
import AssistantChat from './assistant-chat';
import { cn } from '@/lib/utils';

// Lazy load 3D bot to avoid SSR issues
const Assistant3DBot = dynamic(() => import('./assistant-3d-bot'), {
    ssr: false,
    loading: () => (
        <div className="w-32 h-32 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 animate-pulse" />
        </div>
    ),
});

// ============ Inner Component (uses context) ============

type ChatMode = 'text' | 'voice';

const AssistantInner: React.FC = () => {
    const { isOpen, setIsOpen, state } = useAssistant();
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [chatMode, setChatMode] = useState<ChatMode>('voice');

    // Check for mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Keyboard shortcut to toggle (Ctrl/Cmd + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(!isOpen);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, setIsOpen]);

    return (
        <>
            {/* Floating Trigger Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <div className="flex items-center gap-3">
                            {/* Speech Bubble Tooltip - slides out from button */}
                            <motion.div
                                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                                animate={{
                                    opacity: [0, 1, 1, 0],
                                    x: [20, 0, 0, 20],
                                    scale: [0.9, 1, 1, 0.9]
                                }}
                                transition={{
                                    duration: 3,
                                    times: [0, 0.1, 0.85, 1],
                                    ease: "easeOut"
                                }}
                                className="relative whitespace-nowrap bg-background/95 backdrop-blur-sm border border-border rounded-2xl px-4 py-2.5 shadow-xl"
                            >
                                <span className="flex items-center gap-2 text-sm">
                                    <Sparkles className="w-3 h-3 text-primary" />
                                    <span className="font-medium">Ask anything about Hakkan!</span>
                                </span>
                                <span className="text-[10px] text-muted-foreground mt-1 block text-center">
                                    Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Ctrl+K</kbd>
                                </span>
                                {/* Triangle pointer with border - outer (border) + inner (fill) */}
                                <div className="absolute -right-[10px] top-1/2 -translate-y-1/2">
                                    {/* Outer triangle (border color) */}
                                    <div className="w-0 h-0 border-t-[10px] border-b-[10px] border-l-[10px] border-t-transparent border-b-transparent border-l-border" />
                                    {/* Inner triangle (background fill) - positioned over outer */}
                                    <div className="absolute top-[1px] left-[-11px] w-0 h-0 border-t-[9px] border-b-[9px] border-l-[9px] border-t-transparent border-b-transparent border-l-background" />
                                </div>
                            </motion.div>

                            {/* Button */}
                            <div className="relative">
                                <Button
                                    onClick={() => setIsOpen(true)}
                                    size="icon"
                                    className={cn(
                                        'rounded-full w-12 h-12',
                                        'bg-gradient-to-br from-primary to-primary/80',
                                        'hover:from-primary/90 hover:to-primary/70',
                                        'text-primary-foreground shadow-lg',
                                        'border border-primary/50',
                                        'transition-all duration-300 hover:scale-105 hover:shadow-xl',
                                        'group'
                                    )}
                                    title="Open Hakkan's Assistant (Ctrl+K)"
                                >
                                    <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </Button>

                                {/* Subtle glow effect */}
                                <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse pointer-events-none" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, x: 20 }}
                        animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, x: 0 }}
                        exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, x: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className={cn(
                            'fixed z-50 bg-background/95 backdrop-blur-xl border-2 border-foreground shadow-2xl',
                            'flex flex-col overflow-hidden no-click-effect',
                            isMobile
                                ? 'inset-0 rounded-none'
                                : isMinimized
                                    ? 'bottom-6 right-6 w-80 h-16 rounded-2xl'
                                    : 'bottom-6 right-6 w-[400px] h-[600px] max-h-[80vh] rounded-2xl'
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                            <div className="flex items-center gap-3">
                                {/* 3D Bot mini avatar with online indicator */}
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 flex items-center justify-center">
                                        <Assistant3DBot state={state} size="sm" className="w-12 h-12 scale-110" />
                                    </div>
                                    {/* Online indicator dot */}
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background">
                                        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Hakkan&apos;s Assistant
                                    </h3>
                                    <p className="text-[10px] text-muted-foreground capitalize">
                                        {state === 'idle' ? 'Online' : state}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                {!isMobile && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsMinimized(!isMinimized)}
                                        className="h-8 w-8"
                                        title={isMinimized ? 'Expand' : 'Minimize'}
                                    >
                                        <Minimize2 className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="h-8 w-8"
                                    title="Close"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Mode Tabs */}
                        {!isMinimized && (
                            <div className="flex border-b border-border bg-muted/10">
                                <button
                                    onClick={() => setChatMode('voice')}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all',
                                        chatMode === 'voice'
                                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                    )}
                                >
                                    <Mic className="w-4 h-4" />
                                    <span>Voice</span>
                                </button>
                                <button
                                    onClick={() => setChatMode('text')}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all',
                                        chatMode === 'text'
                                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                    )}
                                >
                                    <MessageSquareText className="w-4 h-4" />
                                    <span>Text</span>
                                </button>
                            </div>
                        )}

                        {/* Content */}
                        {!isMinimized && (
                            <div className="flex flex-1 overflow-hidden">
                                {/* Voice Mode: 3D Bot as centerpiece */}
                                {chatMode === 'voice' ? (
                                    <div className="flex-1 flex flex-col">
                                        {/* 3D Bot - Main Attraction */}
                                        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-muted/10 to-background relative overflow-hidden">
                                            {/* Background glow effect */}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className={cn(
                                                    'w-48 h-48 rounded-full blur-3xl transition-all duration-500',
                                                    state === 'listening' ? 'bg-primary/20' :
                                                        state === 'speaking' ? 'bg-accent/20' :
                                                            state === 'thinking' ? 'bg-amber-500/20' :
                                                                'bg-primary/10'
                                                )} />
                                            </div>

                                            {/* 3D Bot */}
                                            <div className="relative z-10">
                                                <Assistant3DBot
                                                    state={state}
                                                    size="xl"
                                                    className="w-64 h-64 md:w-72 md:h-72"
                                                />
                                            </div>
                                        </div>

                                        {/* Voice Controls Section */}
                                        <div className="shrink-0">
                                            <AssistantChat mode={chatMode} />
                                        </div>
                                    </div>
                                ) : (
                                    /* Text Mode: Full-width chat */
                                    <div className="flex-1 flex flex-col min-w-0">
                                        <AssistantChat mode={chatMode} />
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop for mobile */}
            <AnimatePresence>
                {isOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40"
                    />
                )}
            </AnimatePresence>
        </>
    );
};

// ============ Main Export (with Provider) ============

const PortfolioAssistant: React.FC = () => {
    return (
        <AssistantProvider>
            <AssistantInner />
        </AssistantProvider>
    );
};

export default PortfolioAssistant;
