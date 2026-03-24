// Models API Route - Get available models for a provider

import { NextRequest, NextResponse } from 'next/server';
import { getAvailableModels, getProviderStatus } from '@/lib/llm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const provider = searchParams.get('provider') as 'ollama' | 'gemini' | null;

    if (provider) {
      // Get models for specific provider
      const models = await getAvailableModels(provider);
      return NextResponse.json({ provider, models });
    }

    // Get status for all providers
    const status = await getProviderStatus();

    return NextResponse.json({
      ollama: {
        models: status.ollama.models,
        available: status.ollama.available,
      },
      gemini: {
        models: status.gemini.models,
        available: status.gemini.available,
        hasApiKey: status.gemini.hasApiKey,
      },
    });
  } catch (error) {
    console.error('Models API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
