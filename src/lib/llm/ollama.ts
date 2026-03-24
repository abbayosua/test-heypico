// Ollama Provider Implementation

import ollama from 'ollama';
import type { ILLMProvider } from './types';
import type { ChatMessage, LLMModel } from '@/types';

export class OllamaProvider implements ILLMProvider {
  name = 'ollama' as const;
  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl: string = 'http://localhost:11434', defaultModel: string = 'llama3.2') {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await ollama.chat({
        model: this.defaultModel,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      return response.message.content;
    } catch (error) {
      console.error('Ollama chat error:', error);
      throw new Error(`Ollama chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async chatWithModel(model: string, messages: ChatMessage[]): Promise<string> {
    try {
      const response = await ollama.chat({
        model: model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      return response.message.content;
    } catch (error) {
      console.error('Ollama chat error:', error);
      throw new Error(`Ollama chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await ollama.list();
      return true;
    } catch (error) {
      console.error('Ollama availability check failed:', error);
      return false;
    }
  }

  async getModels(): Promise<LLMModel[]> {
    try {
      const response = await ollama.list();
      return response.models.map((model) => ({
        id: model.name,
        name: model.name.charAt(0).toUpperCase() + model.name.slice(1),
        provider: 'ollama' as const,
      }));
    } catch (error) {
      console.error('Failed to fetch Ollama models:', error);
      return [];
    }
  }

  async pullModel(modelName: string): Promise<boolean> {
    try {
      await ollama.pull({ model: modelName });
      return true;
    } catch (error) {
      console.error(`Failed to pull model ${modelName}:`, error);
      return false;
    }
  }
}

// Singleton instance
let ollamaInstance: OllamaProvider | null = null;

export function getOllamaProvider(baseUrl?: string, defaultModel?: string): OllamaProvider {
  if (!ollamaInstance) {
    ollamaInstance = new OllamaProvider(baseUrl, defaultModel);
  }
  return ollamaInstance;
}
