// Typing Indicator Molecule - Show AI is typing

'use client';

import { Avatar, AvatarFallback } from '@/components/atoms/avatar';
import { Bot } from '@/components/atoms/icon';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex gap-3 p-4', className)}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-muted">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1 px-4 py-3 bg-muted rounded-lg">
        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
      </div>
    </div>
  );
}
