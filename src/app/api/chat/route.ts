// Chat API Route

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chatWithFallback } from '@/lib/llm';
import { buildChatMessages } from '@/lib/llm/prompts';
import { textSearch } from '@/lib/maps';
import { logApiUsage } from '@/lib/rate-limit';
import type { ExtractedPlace } from '@/types';

interface ChatRequest {
  message: string;
  sessionId: string;
  conversationId?: string;
  userLocation?: {
    lat: number;
    lng: number;
    city?: string;
  };
}

interface ChatResponse {
  response: string;
  places: ExtractedPlace[];
  placeGroupId: string;
  query: string;
  provider: string;
  model: string;
  conversationId: string;
}

// Extended place type for response
interface PlaceResult extends ExtractedPlace {
  location?: { lat: number; lng: number };
  placeId?: string;
  rating?: number;
  googleMapsUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, sessionId, conversationId, userLocation } = body;

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      );
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await db.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: true, settings: true },
      });
    }

    // If no conversation found by ID, try to find by sessionId
    if (!conversation) {
      conversation = await db.conversation.findFirst({
        where: { sessionId },
        include: { messages: true, settings: true },
      });
    }

    // If still no conversation, create a new one
    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          sessionId,
          title: message.slice(0, 50),
          settings: {
            create: {
              sessionId,
              llmProvider: 'llm7', // Default to LLM7 (free and always available)
            },
          },
        },
        include: { messages: true, settings: true },
      });
    }

    // Get settings
    const settings = conversation.settings;
    const llmProvider = settings?.llmProvider || 'llm7';

    console.log('[Chat] Provider:', llmProvider);
    console.log('[Chat] Settings llm7ApiKey exists:', !!settings?.llm7ApiKey);
    console.log('[Chat] Env LLM7_API_KEY exists:', !!process.env.LLM7_API_KEY);
    console.log('[Chat] Env LLM7_API_KEY length:', process.env.LLM7_API_KEY?.length);

    // Build conversation history
    const history = conversation.messages
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    // Check if the query is about finding places FIRST
    let places: PlaceResult[] = [];
    const lowerMessage = message.toLowerCase();
    const isPlaceQuery =
      // Location/search patterns
      lowerMessage.includes('near me') ||
      lowerMessage.includes('nearby') ||
      lowerMessage.includes('around me') ||
      lowerMessage.includes('close to me') ||
      lowerMessage.includes('in my area') ||
      lowerMessage.includes('local') ||
      // Action verbs
      lowerMessage.includes('find') ||
      lowerMessage.includes('search') ||
      lowerMessage.includes('looking for') ||
      lowerMessage.includes('look for') ||
      lowerMessage.includes('where') ||
      lowerMessage.includes('recommend') ||
      // Place types
      lowerMessage.includes('restaurant') ||
      lowerMessage.includes('cafe') ||
      lowerMessage.includes('coffee') ||
      lowerMessage.includes('place') ||
      lowerMessage.includes('eat') ||
      lowerMessage.includes('food') ||
      lowerMessage.includes('dinner') ||
      lowerMessage.includes('lunch') ||
      lowerMessage.includes('breakfast') ||
      lowerMessage.includes('visit') ||
      lowerMessage.includes('hotel') ||
      lowerMessage.includes('shop') ||
      lowerMessage.includes('store') ||
      lowerMessage.includes('mall') ||
      lowerMessage.includes('market') ||
      lowerMessage.includes('bar') ||
      lowerMessage.includes('pub') ||
      lowerMessage.includes('club') ||
      lowerMessage.includes('museum') ||
      lowerMessage.includes('park') ||
      lowerMessage.includes('beach') ||
      lowerMessage.includes('gym') ||
      lowerMessage.includes('hospital') ||
      lowerMessage.includes('pharmacy') ||
      lowerMessage.includes('bank') ||
      lowerMessage.includes('atm') ||
      lowerMessage.includes('gas station') ||
      lowerMessage.includes('petrol') ||
      lowerMessage.includes('attraction') ||
      lowerMessage.includes('tourist') ||
      // Superlatives often used with places
      lowerMessage.includes('best') ||
      lowerMessage.includes('top') ||
      lowerMessage.includes('good') ||
      lowerMessage.includes('great') ||
      lowerMessage.includes('popular');

    // Search for places BEFORE calling the LLM
    if (isPlaceQuery) {
      try {
        // Build search params with optional location
        const searchParams: {
          query: string;
          location?: { lat: number; lng: number };
          radius?: number;
        } = {
          query: message,
        };

        // Add user location if available
        if (userLocation) {
          searchParams.location = { lat: userLocation.lat, lng: userLocation.lng };
          searchParams.radius = 10000; // 10km radius
        }

        console.log('[Chat] Places search params:', searchParams);

        // Search for places
        const searchResult = await textSearch(searchParams);

        if (searchResult.places.length > 0) {
          places = searchResult.places.slice(0, 5).map((p) => ({
            name: p.name,
            address: p.address,
            type: p.types?.[0] || 'establishment',
            description: p.rating ? `Rating: ${p.rating}/5` : undefined,
            location: p.location,
            placeId: p.placeId,
            rating: p.rating,
            googleMapsUrl: p.googleMapsUrl,
          }));
        }
      } catch (error) {
        console.error('Places search error:', error);
      }
    }

    // Build messages for LLM with places context
    const messages = buildChatMessages(message, history, places, userLocation);

    // Get LLM response
    const result = await chatWithFallback(messages, {
      preferredProvider: llmProvider,
      ollamaModel: settings?.ollamaModel || undefined,
      geminiApiKey: settings?.geminiApiKey || undefined,
      geminiModel: settings?.geminiModel || undefined,
      llm7ApiKey: settings?.llm7ApiKey || undefined,
      llm7Model: settings?.llm7Model || undefined,
    });

    // Save user message
    await db.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    // Save assistant message
    await db.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: result.response,
        placesData: places.length > 0 ? JSON.stringify(places) : null,
      },
    });

    // Update conversation timestamp
    await db.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // Log usage
    await logApiUsage('llm', result.provider, sessionId);

    // Generate a unique place group ID for this search
    const placeGroupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const response: ChatResponse = {
      response: result.response,
      places,
      placeGroupId,
      query: message,
      provider: result.provider,
      model: result.model,
      conversationId: conversation.id,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
