// LLM Provider Constants

import type { LLMModel } from '@/types';

export const LLM_PROVIDERS = {
  OLLAMA: 'ollama',
  GEMINI: 'gemini',
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
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Experimental)', provider: 'gemini' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B', provider: 'gemini' },
];

export const SYSTEM_PROMPT = `You are an AI Location Assistant specialized in helping users find places to visit, eat, explore, and discover.

Your capabilities:
- Find restaurants, cafes, attractions, hotels, and other places
- Provide recommendations based on location and preferences
- Give information about places including ratings, reviews, and details
- Help with directions and travel planning

When a user asks about places:
1. Understand their intent (find restaurants, attractions, etc.)
2. Extract the location they're interested in
3. Identify any specific preferences (cuisine, price range, etc.)

IMPORTANT: When responding about places, structure your response as follows:
- First, provide a natural conversational response
- Then, if you're recommending specific places, list them clearly with names and brief descriptions

Always be helpful, friendly, and provide accurate location-based recommendations.

If you need more information from the user (like their current location), ask for it politely.`;

export const FALLBACK_RESPONSE = `I'm sorry, I'm having trouble connecting to the AI service. Please check:

1. If using Ollama: Make sure Ollama is running locally (ollama serve)
2. If using Gemini: Make sure you've entered a valid API key in settings

You can switch providers in the settings panel.`;
