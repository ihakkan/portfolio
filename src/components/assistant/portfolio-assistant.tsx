'use client';

/**
 * Portfolio Assistant Main Component
 * Floating button with expandable chat panel
 */

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Minimize2, Sparkles, MessageSquareText, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssistantProvider, useAssistant, speak } from '@/lib/assistant';
import { AssistantState } from '@/lib/assistant/assistant-context'; // Import type for state override
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
    const { isOpen, setIsOpen, state, voiceEnabled, addMessage } = useAssistant();
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [chatMode, setChatMode] = useState<ChatMode>('voice');

    // Local state to override global state for easter eggs (animating without chat context)
    const [overrideState, setOverrideState] = useState<AssistantState | null>(null);

    // Easter Egg: Shake Detection
    const lastMousePos = useRef({ x: 0, y: 0 });
    const shakeDistance = useRef(0);
    const lastShakeCheck = useRef(Date.now());
    const lastEasterEggTime = useRef(0);
    const shakeThreshold = 700; // Pixels moved in 700ms
    const shakeCheckInterval = 500;

    // Hover Voice Response
    const lastHoverTime = useRef(0);
    const spokenHoverIds = useRef<Set<string>>(new Set());

    const handleHoverSpeak = (id: string, text: string) => {
        if (!voiceEnabled) return;
        if (spokenHoverIds.current.has(id)) return; // Already spoken this session

        const now = Date.now();
        if (now - lastHoverTime.current < 2000) return; // 2s cooldown
        if (state === 'speaking' || overrideState === 'speaking') return; // Don't interrupt

        lastHoverTime.current = now;
        spokenHoverIds.current.add(id);
        speak(text);
    };

    const handleBotMouseMove = (e: React.MouseEvent) => {
        // Track movement
        const currentPos = { x: e.clientX, y: e.clientY };
        const dist = Math.abs(currentPos.x - lastMousePos.current.x) + Math.abs(currentPos.y - lastMousePos.current.y);
        shakeDistance.current += dist;
        lastMousePos.current = currentPos;

        const now = Date.now();
        if (now - lastShakeCheck.current > shakeCheckInterval) {
            // Check if shaken enough
            if (shakeDistance.current > shakeThreshold) {
                triggerShakeEasterEgg();
            }
            // Reset window
            shakeDistance.current = 0;
            lastShakeCheck.current = now;
        }
    };

    const triggerShakeEasterEgg = () => {
        if (!voiceEnabled) return;

        const now = Date.now();
        // Cooldown: 5 seconds
        if (now - lastEasterEggTime.current < 5000) return;
        if (state === 'speaking' || overrideState === 'speaking') return; // Don't interrupt if already speaking

        lastEasterEggTime.current = now;

        const responses = [
            "Hey! What are you doing? I'm getting dizzy!",
            "Whoa whoa! Stop shaking me!",
            "Please stop cursor dancing on my face!",
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        // Speak without adding to chat history, but animate bot
        speak(
            randomResponse,
            () => setOverrideState(null),    // onEnd
            () => setOverrideState('speaking') // onStart
        );
    };

    // Auto-Greeting Sequence
    // Auto-Greeting Sequence
    const [showWelcomeText, setShowWelcomeText] = useState(false);

    useEffect(() => {
        const hasGreeted = sessionStorage.getItem('hakkan_assistant_welcome_shown');
        if (hasGreeted) return;

        const handleInteraction = () => {
            if (sessionStorage.getItem('hakkan_assistant_welcome_shown')) return;
            sessionStorage.setItem('hakkan_assistant_welcome_shown', 'true');

            setIsOpen(true);
            setShowWelcomeText(true);

            setTimeout(() => {
                const messageText = "Hello! Welcome to Hakkan's portfolio. You can find his latest projects, technical skills, and professional experience here. I'm his AI assistant, ready to help. Just ping me for anything you want to ask further!";

                addMessage({
                    role: 'assistant',
                    content: messageText,
                });

                if (voiceEnabled) {
                    const startTime = Date.now();
                    speak(
                        messageText,
                        () => {
                            setShowWelcomeText(false);
                            const elapsed = Date.now() - startTime;
                            const waitTime = elapsed < 1000 ? 8000 : 1000;

                            setTimeout(() => {
                                setIsOpen(false);
                                setOverrideState(null);
                            }, waitTime);
                        },
                        () => {
                            setOverrideState('speaking');
                        }
                    );
                } else {
                    setTimeout(() => {
                        setShowWelcomeText(false);
                        setIsOpen(false);
                    }, 8000);
                }
            }, 500);

            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
    }, [voiceEnabled, setIsOpen, speak, addMessage]);

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
                                        onMouseEnter={() => handleHoverSpeak('minimize', "Need some space? You can minimize me here.")}
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
                                    onMouseEnter={() => handleHoverSpeak('close', "Click here to close the assistant. I'll be here when you need me!")}
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
                                    onMouseEnter={() => handleHoverSpeak('tab-voice', "Voice mode to talk to me directly.")}
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
                                    onMouseEnter={() => handleHoverSpeak('tab-text', "Prefer typing? Switch to text mode here.")}
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
                                        <div
                                            className="flex-1 flex items-center justify-center bg-gradient-to-b from-muted/10 to-background relative overflow-hidden"
                                            onMouseMove={handleBotMouseMove}
                                        >
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
                                                    state={overrideState || state}
                                                    size="xl"
                                                    className="w-64 h-64 md:w-72 md:h-72"
                                                />
                                            </div>

                                            {/* Welcome Text Overlay */}
                                            <AnimatePresence>
                                                {showWelcomeText && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                                                        transition={{ type: 'spring', duration: 0.8 }}
                                                        className="absolute bottom-2 left-0 right-0 z-20 flex justify-center pointer-events-none"
                                                    >
                                                        <div className="relative">
                                                            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-accent drop-shadow-2xl animate-pulse">
                                                                Hello!
                                                            </h2>
                                                            <Sparkles className="absolute -top-4 -right-6 w-8 h-8 text-yellow-400 animate-bounce" />
                                                            <Sparkles className="absolute -bottom-2 -left-6 w-6 h-6 text-purple-400 animate-pulse delay-100" />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
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
