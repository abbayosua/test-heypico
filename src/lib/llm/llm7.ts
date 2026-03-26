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
    console.log('[LLM7] Initialized with model:', this.defaultModel);
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    return this.chatWithModel(this.defaultModel, messages);
  }

  async chatWithModel(modelId: string, messages: ChatMessage[]): Promise<string> {
    console.log('[LLM7] Sending chat request with model:', modelId);
    
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

      console.log('[LLM7] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[LLM7] API error response:', errorText);
        throw new Error(`LLM7 API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[LLM7] Response received successfully');
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('[LLM7] Chat error:', error);
      throw new Error(`LLM7 chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    // Simple check - just verify we have an API key
    // The actual API call will fail during chat if there's an issue
    const hasKey = !!this.apiKey && this.apiKey.length > 0;
    console.log('[LLM7] isAvailable check:', hasKey ? 'API key present' : 'No API key');
    return hasKey;
  }

  async getModels(): Promise<LLMModel[]> {
    return DEFAULT_LLM7_MODELS;
  }
}

// Singleton instance
let llm7Instance: LLM7Provider | null = null;

export function getLLM7Provider(apiKey?: string, defaultModel?: string): LLM7Provider | null {
  const key = apiKey || process.env.LLM7_API_KEY;
  
  console.log('[LLM7] getLLM7Provider called, key exists:', !!key, 'key length:', key?.length);
  
  if (!key) {
    console.log('[LLM7] No API key available');
    return null;
  }

  // Always create new instance if model changes or if no instance exists
  if (!llm7Instance || (defaultModel && llm7Instance['defaultModel'] !== defaultModel)) {
    llm7Instance = new LLM7Provider(key, defaultModel);
  }
  return llm7Instance;
}

export function resetLLM7Provider(): void {
  console.log('[LLM7] Resetting provider instance');
  llm7Instance = null;
}
