// LLM Provider Factory

import type { ILLMProvider } from './types';
import { OllamaProvider, getOllamaProvider } from './ollama';
import { GeminiProvider, getGeminiProvider, resetGeminiProvider } from './gemini';
import { LLM7Provider, getLLM7Provider, resetLLM7Provider } from './llm7';
import type { LLMProviderType, LLMModel, ProviderStatus } from '@/types';
import { DEFAULT_OLLAMA_MODELS, DEFAULT_GEMINI_MODELS, DEFAULT_LLM7_MODELS, FALLBACK_RESPONSE } from '@/constants';

// Get provider status
export async function getProviderStatus(
  ollamaBaseUrl?: string,
  geminiApiKey?: string,
  llm7ApiKey?: string
): Promise<ProviderStatus> {
  const ollamaProvider = getOllamaProvider(ollamaBaseUrl);
  const [ollamaAvailable, ollamaModels] = await Promise.all([
    ollamaProvider.isAvailable(),
    ollamaProvider.getModels(),
  ]);

  const geminiProvider = getGeminiProvider(geminiApiKey);
  const geminiAvailable = geminiProvider ? await geminiProvider.isAvailable() : false;

  const llm7Provider = getLLM7Provider(llm7ApiKey);
  const llm7Available = llm7Provider ? await llm7Provider.isAvailable() : false;

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
    llm7: {
      available: llm7Available,
      models: DEFAULT_LLM7_MODELS,
      hasApiKey: !!llm7ApiKey || !!process.env.LLM7_API_KEY,
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
    llm7ApiKey?: string;
    llm7Model?: string;
  }
): ILLMProvider | null {
  if (providerType === 'gemini') {
    const apiKey = config?.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    if (config?.geminiApiKey) {
      resetGeminiProvider();
    }
    return getGeminiProvider(apiKey, config?.geminiModel);
  }

  if (providerType === 'llm7') {
    const apiKey = config?.llm7ApiKey || process.env.LLM7_API_KEY;
    if (!apiKey) {
      return null;
    }
    if (config?.llm7ApiKey) {
      resetLLM7Provider();
    }
    return getLLM7Provider(apiKey, config?.llm7Model);
  }

  return getOllamaProvider(config?.ollamaBaseUrl, config?.ollamaModel);
}

// Get default model for a provider
function getDefaultModel(provider: LLMProviderType, config?: {
  ollamaModel?: string;
  geminiModel?: string;
  llm7Model?: string;
}): string {
  switch (provider) {
    case 'ollama':
      return config?.ollamaModel || process.env.OLLAMA_DEFAULT_MODEL || 'llama3.2';
    case 'gemini':
      return config?.geminiModel || process.env.GEMINI_DEFAULT_MODEL || 'gemini-2.5-flash-lite';
    case 'llm7':
      return config?.llm7Model || process.env.LLM7_DEFAULT_MODEL || 'default';
    default:
      return 'default';
  }
}

// Chat with fallback (tries multiple providers)
export async function chatWithFallback(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  config: {
    preferredProvider: LLMProviderType;
    ollamaBaseUrl?: string;
    ollamaModel?: string;
    geminiApiKey?: string;
    geminiModel?: string;
    llm7ApiKey?: string;
    llm7Model?: string;
  }
): Promise<{ response: string; provider: LLMProviderType; model: string }> {
  const { preferredProvider } = config;

  // Order of providers to try
  const providerOrder: LLMProviderType[] = [preferredProvider];
  
  // Add other providers as fallbacks
  const allProviders: LLMProviderType[] = ['llm7', 'gemini', 'ollama'];
  for (const p of allProviders) {
    if (!providerOrder.includes(p)) {
      providerOrder.push(p);
    }
  }

  // Try each provider in order
  for (const providerType of providerOrder) {
    console.log(`[Chat] Trying provider: ${providerType}`);
    const provider = getProvider(providerType, config);
    
    if (!provider) {
      console.log(`[Chat] Provider ${providerType} not available (no instance)`);
      continue;
    }
    
    try {
      const isAvailable = await provider.isAvailable();
      console.log(`[Chat] Provider ${providerType} isAvailable: ${isAvailable}`);
      
      if (isAvailable) {
        const model = getDefaultModel(providerType, config);
        console.log(`[Chat] Calling ${providerType}.chatWithModel with model: ${model}`);
        const response = await provider.chatWithModel(model, messages);
        
        // Validate response
        if (!response || response.trim() === '') {
          console.error(`[Chat] ${providerType} returned empty response`);
          continue;
        }
        
        console.log(`[Chat] ${providerType} response received, length: ${response.length}`);
        return { response, provider: providerType, model };
      }
    } catch (error) {
      console.error(`[Chat] ${providerType} chat failed:`, error instanceof Error ? error.message : error);
      console.error(`[Chat] ${providerType} error stack:`, error instanceof Error ? error.stack : 'No stack');
    }
  }

  console.log('[Chat] All providers failed, returning fallback response');
  
  // All providers failed
  return {
    response: FALLBACK_RESPONSE,
    provider: preferredProvider,
    model: getDefaultModel(preferredProvider, config),
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

  if (provider === 'llm7') {
    return DEFAULT_LLM7_MODELS;
  }

  return DEFAULT_GEMINI_MODELS;
}

export { OllamaProvider } from './ollama';
export { GeminiProvider } from './gemini';
export { LLM7Provider } from './llm7';
