// LLM Provider Types

export type LLMProviderType = 'ollama' | 'gemini';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMProvider {
  name: LLMProviderType;
  chat(messages: ChatMessage[]): Promise<string>;
  isAvailable(): Promise<boolean>;
  getModels(): Promise<LLMModel[]>;
}

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
}

export interface ProviderStatus {
  ollama: {
    available: boolean;
    models: LLMModel[];
  };
  gemini: {
    available: boolean;
    models: LLMModel[];
  };
}
