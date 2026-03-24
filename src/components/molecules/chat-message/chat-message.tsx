// Chat Message Molecule - Single message bubble

'use client';

import { Avatar, AvatarFallback } from '@/components/atoms/avatar';
import { Card, CardContent } from '@/components/atoms/card';
import { Bot, User } from '@/components/atoms/icon';
import { cn } from '@/lib/utils';
import type { ExtractedPlace } from '@/types';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  places?: ExtractedPlace[];
  onPlaceClick?: (place: ExtractedPlace) => void;
}

export function ChatMessage({
  role,
  content,
  places,
  onPlaceClick,
}: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 p-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'flex flex-col gap-2 max-w-[80%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <Card
          className={cn(
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          )}
        >
          <CardContent className="p-3 text-sm whitespace-pre-wrap">
            {content}
          </CardContent>
        </Card>

        {/* Place cards */}
        {places && places.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {places.map((place, index) => (
              <button
                key={index}
                onClick={() => onPlaceClick?.(place)}
                className="flex items-center gap-2 px-3 py-2 bg-background border rounded-lg text-xs hover:bg-accent transition-colors text-left"
              >
                <span className="font-medium">{place.name}</span>
                {place.rating && (
                  <span className="text-muted-foreground">
                    ⭐ {place.rating}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
