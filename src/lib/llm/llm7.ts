// LLM7 Provider Implementation - OpenAI-compatible API

import type { ILLMProvider } from './types';
import type { ChatMessage, LLMModel } from '@/types';
import { DEFAULT_LLM7_MODELS } from '@/constants';

const LLM7_BASE_URL = 'https://api.llm7.io/v1';

export class LLM7Provider implements ILLMProvider {
  name = 'llm7' as const;
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel?: string) {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel || process.env.LLM7_DEFAULT_MODEL || 'default';
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    return this.chatWithModel(this.defaultModel, messages);
  }

  async chatWithModel(modelId: string, messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch(`${LLM7_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`LLM7 API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('LLM7 chat error:', error);
      throw new Error(`LLM7 chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Make a simple test request
      const response = await fetch(`${LLM7_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'default',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('LLM7 availability check failed:', error);
      return false;
    }
  }

  async getModels(): Promise<LLMModel[]> {
    return DEFAULT_LLM7_MODELS;
  }
}

// Singleton instance
let llm7Instance: LLM7Provider | null = null;

export function getLLM7Provider(apiKey?: string, defaultModel?: string): LLM7Provider | null {
  const key = apiKey || process.env.LLM7_API_KEY;
  
  if (!key) {
    return null;
  }

  if (!llm7Instance) {
    llm7Instance = new LLM7Provider(key, defaultModel);
  }
  return llm7Instance;
}

export function resetLLM7Provider(): void {
  llm7Instance = null;
}
