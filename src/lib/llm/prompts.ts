// LLM Prompts for Location Assistant

import { SYSTEM_PROMPT } from '@/constants';
import type { ExtractedPlace } from '@/types';

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

interface PlaceWithDetails extends ExtractedPlace {
  location?: { lat: number; lng: number };
  placeId?: string;
  rating?: number;
  googleMapsUrl?: string;
}

export function buildChatMessages(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  places?: PlaceWithDetails[],
  userLocation?: { lat: number; lng: number; city?: string }
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  // Build enhanced system prompt with context
  let enhancedSystemPrompt = SYSTEM_PROMPT;

  // Add places context if available
  if (places && places.length > 0) {
    const placesContext = `

IMPORTANT CONTEXT - Google Maps Search Results:
I have already searched Google Maps for the user's query and found these places. Present these results naturally in your response:

${places.map((p, i) => `${i + 1}. **${p.name}**
   - Address: ${p.address || 'Address not available'}
   - Rating: ${p.rating ? `${p.rating}/5` : 'Not rated'}
   - Type: ${p.type || 'Place'}`).join('\n')}

Your task is to:
1. Acknowledge the user's request warmly
2. Present these places in a natural, conversational way
3. Mention the ratings if available
4. Keep your response concise and helpful
5. Do NOT ask for location - we already searched near the user's location`;
    
    enhancedSystemPrompt += placesContext;
  } else if (userLocation) {
    // Add location context when no places found
    const locationContext = `

IMPORTANT CONTEXT:
The user's location has been detected. They are near coordinates: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}${userLocation.city ? ` (in ${userLocation.city})` : ''}.
Use this context when helping them find places.`;
    
    enhancedSystemPrompt += locationContext;
  }

  const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
    { role: 'system', content: enhancedSystemPrompt },
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
