// Settings Types

import type { LLMProviderType, LLMModel } from './llm';

export interface SessionSettings {
  id: string;
  sessionId: string;
  llmProvider: LLMProviderType;
  ollamaModel: string | null;
  geminiModel: string | null;
  geminiApiKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingsState {
  provider: LLMProviderType;
  ollamaModel: string | null;
  geminiModel: string | null;
  geminiApiKey: string | null;
  availableModels: {
    ollama: LLMModel[];
    gemini: LLMModel[];
  };
  isLoading: boolean;
  error: string | null;
}

export interface UpdateSettingsRequest {
  sessionId: string;
  llmProvider?: LLMProviderType;
  ollamaModel?: string;
  geminiModel?: string;
  geminiApiKey?: string;
}

export const DEFAULT_OLLAMA_MODELS: LLMModel[] = [
  { id: 'llama3.2', name: 'Llama 3.2', provider: 'ollama' },
  { id: 'llama3.1', name: 'Llama 3.1', provider: 'ollama' },
  { id: 'mistral', name: 'Mistral', provider: 'ollama' },
  { id: 'gemma2', name: 'Gemma 2', provider: 'ollama' },
  { id: 'qwen2.5', name: 'Qwen 2.5', provider: 'ollama' },
];

export const DEFAULT_GEMINI_MODELS: LLMModel[] = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'gemini' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini' },
];
