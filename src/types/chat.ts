// Chat Types

import type { ExtractedPlace } from './place';

export interface Conversation {
  id: string;
  sessionId: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  placesData: ExtractedPlace[] | null;
  placeGroupId?: string; // Reference to the place group
  createdAt: Date;
}

// Simple chat message format for LLM providers (renamed to avoid conflict)
export interface ChatMessageForLLM {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
}

export interface SendMessageRequest {
  message: string;
  sessionId: string;
  conversationId?: string;
}

export interface SendMessageResponse {
  response: string;
  places: ExtractedPlace[];
  placeGroupId: string; // ID of the place group for this search
  query: string; // The original search query
  provider: string;
  model: string;
  conversationId: string;
}
