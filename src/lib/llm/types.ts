// LLM Provider Types

import type { ChatMessage, LLMModel, LLMProviderType } from '@/types';

export interface ILLMProvider {
  name: LLMProviderType;
  chat(messages: ChatMessage[]): Promise<string>;
  isAvailable(): Promise<boolean>;
  getModels(): Promise<LLMModel[]>;
}

export interface LLMProviderConfig {
  ollamaBaseUrl: string;
  ollamaDefaultModel: string;
  geminiApiKey?: string;
  geminiDefaultModel: string;
}
