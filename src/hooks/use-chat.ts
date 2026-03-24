// useChat Hook - Chat state management

'use client';

import { useState, useCallback } from 'react';
import type { Message, ExtractedPlace, SendMessageResponse } from '@/types';

interface UseChatOptions {
  sessionId: string;
  conversationId?: string;
}

interface UseChatReturn {
  messages: Message[];
  places: ExtractedPlace[];
  isLoading: boolean;
  error: string | null;
  provider: string | null;
  model: string | null;
  conversationId: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  setMessages: (messages: Message[]) => void;
}

export function useChat({ sessionId, conversationId: initialConversationId }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [places, setPlaces] = useState<ExtractedPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: conversationId || '',
      role: 'user',
      content: message,
      placesData: null,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SendMessageResponse = await response.json();

      // Remove temp message and add real messages
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));

      // Add user message (from server for consistency)
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        conversationId: data.conversationId,
        role: 'user',
        content: message,
        placesData: null,
        createdAt: new Date(),
      };

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        conversationId: data.conversationId,
        role: 'assistant',
        content: data.response,
        placesData: data.places.length > 0 ? data.places : null,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setPlaces(data.places);
      setProvider(data.provider);
      setModel(data.model);
      setConversationId(data.conversationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, conversationId, isLoading]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setPlaces([]);
    setError(null);
    setConversationId(null);
  }, []);

  return {
    messages,
    places,
    isLoading,
    error,
    provider,
    model,
    conversationId,
    sendMessage,
    clearChat,
    setMessages,
  };
}
