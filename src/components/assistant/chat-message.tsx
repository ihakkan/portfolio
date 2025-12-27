'use client';

/**
 * Chat Message Component
 * Individual message bubble for the assistant chat
 * Supports user, assistant, and system (error/info) messages
 */

import { motion } from 'framer-motion';
import { User, Bot, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
    isLatest?: boolean;
    messageType?: 'normal' | 'error' | 'info';
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    role,
    content,
    timestamp,
    isLatest = false,
    messageType = 'normal',
}) => {
    const isUser = role === 'user';
    const isSystem = role === 'system';
    const isError = messageType === 'error';

    // Simple markdown-like formatting (bold and italic)
    const formatContent = (text: string) => {
        // Handle bold (**text**)
        let parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={i} className="font-semibold text-primary">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            // Handle italic (*text*)
            if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
                return (
                    <em key={i} className="italic opacity-80">
                        {part.slice(1, -1)}
                    </em>
                );
            }
            return part;
        });
    };

    // System message (error/info)
    if (isSystem) {
        return (
            <motion.div
                initial={isLatest ? { opacity: 0, y: 10 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-3 px-4 py-3"
            >
                {/* Icon */}
                <div
                    className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2',
                        isError
                            ? 'bg-destructive/10 text-destructive border-destructive/30'
                            : 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                    )}
                >
                    {isError ? (
                        <AlertCircle className="w-4 h-4" />
                    ) : (
                        <Info className="w-4 h-4" />
                    )}
                </div>

                {/* Message Bubble */}
                <div
                    className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm rounded-bl-sm border',
                        isError
                            ? 'bg-destructive/5 text-foreground border-destructive/20'
                            : 'bg-blue-500/5 text-foreground border-blue-500/20'
                    )}
                >
                    {/* Content with line breaks and formatting */}
                    <div className="whitespace-pre-wrap">
                        {content.split('\n').map((line, i) => {
                            const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
                            const isEmoji = /^[\p{Emoji}]/u.test(line.trim());
                            return (
                                <span key={i} className={cn(isBullet ? 'block pl-1' : '', isEmoji && i === 0 ? 'text-base' : '')}>
                                    {formatContent(line)}
                                    {i < content.split('\n').length - 1 && <br />}
                                </span>
                            );
                        })}
                    </div>

                    {/* Timestamp */}
                    {timestamp && (
                        <div className="text-[10px] mt-1 opacity-60 text-left">
                            {new Date(timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }

    // User or Assistant message
    return (
        <motion.div
            initial={isLatest ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
                'flex gap-3 px-4 py-3',
                isUser ? 'flex-row-reverse' : 'flex-row'
            )}
        >
            {/* Avatar */}
            <div
                className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2',
                    isUser
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-accent/20 text-accent-foreground border-accent'
                )}
            >
                {isUser ? (
                    <User className="w-4 h-4" />
                ) : (
                    <Bot className="w-4 h-4" />
                )}
            </div>

            {/* Message Bubble */}
            <div
                className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
                    isUser
                        ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm'
                        : 'bg-muted/80 text-foreground rounded-bl-sm border border-border/50'
                )}
            >
                {/* Content with line breaks and formatting */}
                <div className="whitespace-pre-wrap">
                    {content.split('\n').map((line, i) => {
                        // Check for bullet points
                        const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
                        // Check for numbered lists
                        const isNumbered = /^\d+\./.test(line.trim());
                        return (
                            <span key={i} className={cn(isBullet || isNumbered ? 'block pl-1' : '')}>
                                {formatContent(line)}
                                {i < content.split('\n').length - 1 && <br />}
                            </span>
                        );
                    })}
                </div>

                {/* Timestamp */}
                {timestamp && (
                    <div
                        className={cn(
                            'text-[10px] mt-1 opacity-60',
                            isUser ? 'text-right' : 'text-left'
                        )}
                    >
                        {new Date(timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ChatMessage;
