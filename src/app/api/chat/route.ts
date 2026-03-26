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

    // Build messages for LLM
    const messages = buildChatMessages(message, history);

    // Get LLM response
    const result = await chatWithFallback(messages, {
      preferredProvider: llmProvider,
      ollamaModel: settings?.ollamaModel || undefined,
      geminiApiKey: settings?.geminiApiKey || undefined,
      geminiModel: settings?.geminiModel || undefined,
      llm7ApiKey: settings?.llm7ApiKey || undefined,
      llm7Model: settings?.llm7Model || undefined,
    });

    // Extract places from the response
    let places: PlaceResult[] = [];

    // If the query is about finding places, do a places search
    if (
      message.toLowerCase().includes('find') ||
      message.toLowerCase().includes('where') ||
      message.toLowerCase().includes('restaurant') ||
      message.toLowerCase().includes('cafe') ||
      message.toLowerCase().includes('place') ||
      message.toLowerCase().includes('eat') ||
      message.toLowerCase().includes('visit') ||
      message.toLowerCase().includes('hotel') ||
      message.toLowerCase().includes('shop') ||
      message.toLowerCase().includes('bar') ||
      message.toLowerCase().includes('museum') ||
      message.toLowerCase().includes('park') ||
      message.toLowerCase().includes('attraction')
    ) {
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

    const response: ChatResponse = {
      response: result.response,
      places,
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
