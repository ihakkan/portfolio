'use client';

/**
 * Chat Message Component
 * Individual message bubble for the assistant chat
 */

import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: number;
    isLatest?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    role,
    content,
    timestamp,
    isLatest = false,
}) => {
    const isUser = role === 'user';

    // Simple markdown-like formatting (bold only)
    const formatContent = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={i} className="font-semibold text-primary">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return part;
        });
    };

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
                        return (
                            <span key={i} className={isBullet ? 'block pl-1' : ''}>
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
