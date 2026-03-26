// Gemini Provider Implementation with Proxy Support

import { GoogleGenerativeAI } from '@google/generative-ai';
import { setGlobalDispatcher, ProxyAgent } from 'undici';
import type { ILLMProvider } from './types';
import type { ChatMessage, LLMModel } from '@/types';
import { DEFAULT_GEMINI_MODELS } from '@/constants';

// Initialize proxy if configured
let proxyConfigured = false;

// Default proxy for bypassing region restrictions (hardcoded for reliability)
const DEFAULT_PROXY = 'http://yezuwkea:tukomztvcxzx@31.59.20.176:6754/';

function initProxy(): void {
  if (proxyConfigured) return;

  // Use environment variable or fallback to default proxy
  const proxyUrl = process.env.GEMINI_PROXY_URL || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || DEFAULT_PROXY;

  console.log('[Gemini] Configuring proxy:', proxyUrl.split('@')[1] || proxyUrl.replace(/:[^:@]+@/, ':****@'));
  const proxyAgent = new ProxyAgent(proxyUrl);
  setGlobalDispatcher(proxyAgent);
  proxyConfigured = true;
}

export class GeminiProvider implements ILLMProvider {
  name = 'gemini' as const;
  private genAI: GoogleGenerativeAI;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel: string = 'gemini-2.5-flash-lite') {
    // Initialize proxy before making any requests
    initProxy();
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.defaultModel = defaultModel;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    return this.chatWithModel(this.defaultModel, messages);
  }

  async chatWithModel(modelId: string, messages: ChatMessage[]): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: modelId });

      // Convert messages to Gemini format
      // Gemini uses 'user' and 'model' roles
      const history = messages.slice(0, -1).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      // Get the last user message
      const lastMessage = messages[messages.length - 1];

      // Start chat with history (if there are previous messages)
      if (history.length > 0) {
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(lastMessage.content);
        return result.response.text();
      } else {
        // No history, just send the message directly
        const result = await model.generateContent(lastMessage.content);
        return result.response.text();
      }
    } catch (error) {
      console.error('Gemini chat error:', error);
      throw new Error(`Gemini chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Try to make a simple request to verify the API key works
      const model = this.genAI.getGenerativeModel({ model: this.defaultModel });
      await model.generateContent('test');
      return true;
    } catch (error) {
      console.error('Gemini availability check failed:', error);
      return false;
    }
  }

  async getModels(): Promise<LLMModel[]> {
    // Gemini doesn't have a list models API in the same way
    // Return the default models list
    return DEFAULT_GEMINI_MODELS;
  }
}

// Singleton instance (created when API key is available)
let geminiInstance: GeminiProvider | null = null;

export function getGeminiProvider(apiKey?: string, defaultModel?: string): GeminiProvider | null {
  const key = apiKey || process.env.GEMINI_API_KEY;
  
  if (!key) {
    return null;
  }

  if (!geminiInstance) {
    geminiInstance = new GeminiProvider(key, defaultModel);
  }
  return geminiInstance;
}

export function resetGeminiProvider(): void {
  geminiInstance = null;
}
