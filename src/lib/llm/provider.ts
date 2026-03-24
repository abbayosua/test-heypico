// LLM Provider Factory

import type { ILLMProvider } from './types';
import { OllamaProvider, getOllamaProvider } from './ollama';
import { GeminiProvider, getGeminiProvider, resetGeminiProvider } from './gemini';
import type { LLMProviderType, LLMModel } from '@/types';
import { DEFAULT_OLLAMA_MODELS, DEFAULT_GEMINI_MODELS, FALLBACK_RESPONSE } from '@/constants';

export interface ProviderStatus {
  ollama: {
    available: boolean;
    models: LLMModel[];
  };
  gemini: {
    available: boolean;
    models: LLMModel[];
    hasApiKey: boolean;
  };
}

// Get provider status
export async function getProviderStatus(
  ollamaBaseUrl?: string,
  geminiApiKey?: string
): Promise<ProviderStatus> {
  const ollamaProvider = getOllamaProvider(ollamaBaseUrl);
  const [ollamaAvailable, ollamaModels] = await Promise.all([
    ollamaProvider.isAvailable(),
    ollamaProvider.getModels(),
  ]);

  const geminiProvider = getGeminiProvider(geminiApiKey);
  const geminiAvailable = geminiProvider ? await geminiProvider.isAvailable() : false;

  return {
    ollama: {
      available: ollamaAvailable,
      models: ollamaModels.length > 0 ? ollamaModels : DEFAULT_OLLAMA_MODELS,
    },
    gemini: {
      available: geminiAvailable,
      models: DEFAULT_GEMINI_MODELS,
      hasApiKey: !!geminiApiKey || !!process.env.GEMINI_API_KEY,
    },
  };
}

// Get or create provider based on settings
export function getProvider(
  providerType: LLMProviderType,
  config?: {
    ollamaBaseUrl?: string;
    ollamaModel?: string;
    geminiApiKey?: string;
    geminiModel?: string;
  }
): ILLMProvider | null {
  if (providerType === 'gemini') {
    const apiKey = config?.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    // Reset instance if API key changed
    if (config?.geminiApiKey) {
      resetGeminiProvider();
    }
    return getGeminiProvider(apiKey, config?.geminiModel);
  }

  return getOllamaProvider(config?.ollamaBaseUrl, config?.ollamaModel);
}

// Chat with fallback
export async function chatWithFallback(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  config: {
    preferredProvider: LLMProviderType;
    ollamaBaseUrl?: string;
    ollamaModel?: string;
    geminiApiKey?: string;
    geminiModel?: string;
  }
): Promise<{ response: string; provider: LLMProviderType; model: string }> {
  const { preferredProvider, ollamaBaseUrl, ollamaModel, geminiApiKey, geminiModel } = config;

  // Try preferred provider first
  const provider = getProvider(preferredProvider, {
    ollamaBaseUrl,
    ollamaModel,
    geminiApiKey,
    geminiModel,
  });

  if (provider) {
    const isAvailable = await provider.isAvailable();
    if (isAvailable) {
      try {
        const model = preferredProvider === 'ollama' 
          ? (ollamaModel || process.env.OLLAMA_DEFAULT_MODEL || 'llama3.2')
          : (geminiModel || process.env.GEMINI_DEFAULT_MODEL || 'gemini-2.0-flash-exp');
        
        // Use the appropriate method based on provider type
        if (preferredProvider === 'ollama') {
          const ollamaProv = provider as OllamaProvider;
          const response = await ollamaProv.chatWithModel(model, messages);
          return { response, provider: preferredProvider, model };
        } else {
          const geminiProv = provider as GeminiProvider;
          const response = await geminiProv.chatWithModel(model, messages);
          return { response, provider: preferredProvider, model };
        }
      } catch (error) {
        console.error(`${preferredProvider} chat failed:`, error);
      }
    }
  }

  // Try fallback provider
  const fallbackProvider = preferredProvider === 'ollama' ? 'gemini' : 'ollama';
  const fallbackProv = getProvider(fallbackProvider, {
    ollamaBaseUrl,
    ollamaModel,
    geminiApiKey,
    geminiModel,
  });

  if (fallbackProv) {
    const isAvailable = await fallbackProv.isAvailable();
    if (isAvailable) {
      try {
        const model = fallbackProvider === 'ollama'
          ? (ollamaModel || process.env.OLLAMA_DEFAULT_MODEL || 'llama3.2')
          : (geminiModel || process.env.GEMINI_DEFAULT_MODEL || 'gemini-2.0-flash-exp');

        if (fallbackProvider === 'ollama') {
          const ollamaProv = fallbackProv as OllamaProvider;
          const response = await ollamaProv.chatWithModel(model, messages);
          return { response, provider: fallbackProvider, model };
        } else {
          const geminiProv = fallbackProv as GeminiProvider;
          const response = await geminiProv.chatWithModel(model, messages);
          return { response, provider: fallbackProvider, model };
        }
      } catch (error) {
        console.error(`${fallbackProvider} chat failed:`, error);
      }
    }
  }

  // Both providers failed
  return {
    response: FALLBACK_RESPONSE,
    provider: preferredProvider,
    model: preferredProvider === 'ollama' 
      ? (ollamaModel || 'llama3.2')
      : (geminiModel || 'gemini-2.0-flash-exp'),
  };
}

// Get available models for a provider
export async function getAvailableModels(
  provider: LLMProviderType,
  ollamaBaseUrl?: string
): Promise<LLMModel[]> {
  if (provider === 'ollama') {
    const ollamaProvider = getOllamaProvider(ollamaBaseUrl);
    const models = await ollamaProvider.getModels();
    return models.length > 0 ? models : DEFAULT_OLLAMA_MODELS;
  }

  return DEFAULT_GEMINI_MODELS;
}

export { OllamaProvider } from './ollama';
export { GeminiProvider } from './gemini';
