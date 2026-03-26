// LLM Provider Types

import type { ExtractedPlace } from './place';

// Simple chat message format for LLM providers
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type LLMProviderType = 'ollama' | 'gemini' | 'llm7';

export interface LLMModel {
  id: string;
  name: string;
  provider: LLMProviderType;
}

export interface LLMResponse {
  content: string;
  provider: LLMProviderType;
  model: string;
  places?: ExtractedPlace[];
}

export interface ProviderStatus {
  ollama: {
    available: boolean;
    models: LLMModel[];
  };
  gemini: {
    available: boolean;
    hasApiKey: boolean;
    models: LLMModel[];
  };
  llm7: {
    available: boolean;
    hasApiKey: boolean;
    models: LLMModel[];
  };
}

// Re-export ExtractedPlace for backward compatibility
export type { ExtractedPlace } from './place';
