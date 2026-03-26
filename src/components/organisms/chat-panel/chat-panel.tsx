// Chat Panel Organism - Complete chat interface

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatInput } from '@/components/molecules/chat-input';
import { ChatMessage } from '@/components/molecules/chat-message';
import { TypingIndicator } from '@/components/molecules/typing-indicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/atoms/skeleton';
import type { ExtractedPlace, Message, UserLocation } from '@/types';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onPlaceClick?: (place: ExtractedPlace, groupId?: string) => void;
  userLocation?: UserLocation | null;
  onRequestLocation?: () => void;
  className?: string;
}

export function ChatPanel({
  messages,
  isLoading,
  onSendMessage,
  onPlaceClick,
  userLocation,
  onRequestLocation,
  className,
}: ChatPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLocation = Boolean(userLocation);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col" ref={scrollContainerRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="max-w-md space-y-4">
                <h2 className="text-2xl font-bold">AI Location Assistant</h2>
                <p className="text-muted-foreground">
                  Ask me about places to visit, restaurants, attractions, and more.
                  I'll help you find the best spots!
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  <ExamplePrompt
                    text="Best restaurants near me"
                    onClick={onSendMessage}
                    disabled={!hasLocation}
                  />
                  <ExamplePrompt
                    text="Best coffee shops near me"
                    onClick={onSendMessage}
                    disabled={!hasLocation}
                  />
                  <ExamplePrompt
                    text="Tourist attractions near me"
                    onClick={onSendMessage}
                    disabled={!hasLocation}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  places={message.placesData || undefined}
                  placeGroupId={message.placeGroupId}
                  onPlaceClick={onPlaceClick}
                />
              ))}
              {isLoading && <TypingIndicator />}
            </>
          )}
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <ChatInput
        onSend={onSendMessage}
        isLoading={isLoading}
        hasLocation={hasLocation}
        onRequestLocation={onRequestLocation}
      />
    </div>
  );
}

// Example prompt button
function ExamplePrompt({
  text,
  onClick,
  disabled = false,
}: {
  text: string;
  onClick: (message: string) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => !disabled && onClick(text)}
      disabled={disabled}
      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
        disabled
          ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
          : 'bg-muted hover:bg-muted/80'
      }`}
    >
      {text}
    </button>
  );
}
