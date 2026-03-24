// Chat Types

import type { ExtractedPlace } from './llm';

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
  createdAt: Date;
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
  provider: string;
  model: string;
  conversationId: string;
}
