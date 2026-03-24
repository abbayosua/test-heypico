// LLM Prompts for Location Assistant

import { SYSTEM_PROMPT } from '@/constants';

export const getSystemPrompt = (): string => {
  return SYSTEM_PROMPT;
};

export const buildLocationQueryPrompt = (userMessage: string): string => {
  return userMessage;
};

// Prompt to extract structured place data from LLM response
export const PLACE_EXTRACTION_PROMPT = `
Based on the user's query and your response, extract any places mentioned.

Respond with ONLY a JSON array (no markdown, no code blocks) of places in this format:
[
  {
    "name": "Place Name",
    "address": "Full address if known, otherwise city/area",
    "type": "restaurant|cafe|attraction|hotel|bar|shop|other",
    "description": "Brief 1-2 sentence description"
  }
]

If no specific places are mentioned, return an empty array: []

Important: Return ONLY the JSON array, no other text.`;

export function buildChatMessages(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
    { role: 'system', content: getSystemPrompt() },
  ];

  // Add conversation history
  for (const msg of conversationHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // Add current user message
  messages.push({ role: 'user', content: userMessage });

  return messages;
}

export function buildExtractionMessages(
  userQuery: string,
  llmResponse: string
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  return [
    {
      role: 'system',
      content: 'You are a data extraction assistant. Extract place information from the conversation.',
    },
    {
      role: 'user',
      content: `User asked: "${userQuery}"

Assistant responded: "${llmResponse}"

${PLACE_EXTRACTION_PROMPT}`,
    },
  ];
}
