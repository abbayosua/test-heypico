// Settings API Route - Get and Update User Settings

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { LLMProviderType } from '@/types';

// Default provider - use gemini if Ollama is not available
const DEFAULT_PROVIDER: LLMProviderType = 'gemini';

// Get settings for a session
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Find the most recent conversation with settings for this session
    const conversation = await db.conversation.findFirst({
      where: { sessionId },
      include: { settings: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!conversation?.settings) {
      // Return default settings - use Gemini by default since Ollama is not always available
      return NextResponse.json({
        llmProvider: DEFAULT_PROVIDER,
        ollamaModel: process.env.OLLAMA_DEFAULT_MODEL || 'llama3.2',
        geminiModel: process.env.GEMINI_DEFAULT_MODEL || 'gemini-2.5-flash-lite',
        geminiApiKey: null,
      });
    }

    return NextResponse.json({
      llmProvider: conversation.settings.llmProvider,
      ollamaModel: conversation.settings.ollamaModel,
      geminiModel: conversation.settings.geminiModel,
      geminiApiKey: conversation.settings.geminiApiKey ? '••••••••' : null, // Masked
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, llmProvider, ollamaModel, geminiModel, geminiApiKey } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Find or create conversation
    let conversation = await db.conversation.findFirst({
      where: { sessionId },
      include: { settings: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          sessionId,
          title: 'New Conversation',
          settings: {
            create: {
              sessionId,
              llmProvider: llmProvider || DEFAULT_PROVIDER,
              ollamaModel,
              geminiModel,
              geminiApiKey,
            },
          },
        },
        include: { settings: true },
      });
    } else if (conversation.settings) {
      // Update existing settings
      await db.sessionSettings.update({
        where: { id: conversation.settings.id },
        data: {
          llmProvider: llmProvider as LLMProviderType,
          ollamaModel,
          geminiModel,
          geminiApiKey: geminiApiKey || conversation.settings.geminiApiKey,
        },
      });
    } else {
      // Create settings for existing conversation
      await db.sessionSettings.create({
        data: {
          sessionId,
          conversationId: conversation.id,
          llmProvider: llmProvider || DEFAULT_PROVIDER,
          ollamaModel,
          geminiModel,
          geminiApiKey,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
