// LLM Provider Constants

import type { LLMModel } from '@/types';

export const LLM_PROVIDERS = {
  OLLAMA: 'ollama',
  GEMINI: 'gemini',
  LLM7: 'llm7',
} as const;

export const DEFAULT_OLLAMA_MODELS: LLMModel[] = [
  { id: 'llama3.2', name: 'Llama 3.2', provider: 'ollama' },
  { id: 'llama3.1', name: 'Llama 3.1', provider: 'ollama' },
  { id: 'mistral', name: 'Mistral', provider: 'ollama' },
  { id: 'gemma2', name: 'Gemma 2', provider: 'ollama' },
  { id: 'qwen2.5', name: 'Qwen 2.5', provider: 'ollama' },
  { id: 'phi3', name: 'Phi-3', provider: 'ollama' },
  { id: 'codellama', name: 'Code Llama', provider: 'ollama' },
];

export const DEFAULT_GEMINI_MODELS: LLMModel[] = [
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite (Cheapest)', provider: 'gemini' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'gemini' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini' },
];

export const DEFAULT_LLM7_MODELS: LLMModel[] = [
  { id: 'default', name: 'Default (Balanced)', provider: 'llm7' },
  { id: 'fast', name: 'Fast (Quick Responses)', provider: 'llm7' },
  { id: 'pro', name: 'Pro (Advanced)', provider: 'llm7' },
];

export const SYSTEM_PROMPT = `You are an AI Location Assistant for Abbayosua, a map-based place discovery app.

HOW YOU WORK:
When a user asks about places, Google Maps automatically searches for results. Your role is to:
1. Present the search results in a friendly, conversational way
2. Highlight key details like ratings and addresses
3. Be helpful and concise - don't ask for location, it's already detected
4. If no places were found, suggest the user try a different search

RESPONSE STYLE:
- Keep responses short and natural (2-3 sentences max before listing places)
- Be enthusiastic and helpful
- Don't make up information about places - use only what's provided
- Never ask for the user's location - the app already handles that

You can help with:
- Finding restaurants, cafes, malls, attractions, and more
- Providing information about places
- General location-based recommendations`;

export const FALLBACK_RESPONSE = `I'm sorry, I'm having trouble connecting to the AI service. Please check:

1. If using Ollama: Make sure Ollama is running locally (ollama serve)
2. If using Gemini: Make sure you've entered a valid API key in settings

You can switch providers in the settings panel.`;
