// LLM Provider Types

// Simple chat message format for LLM providers
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type LLMProviderType = 'ollama' | 'gemini';

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

export interface ExtractedPlace {
  name: string;
  address?: string;
  type?: string;
  description?: string;
  location?: {
    lat: number;
    lng: number;
  };
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
}
