// Status API Route - Check provider availability

import { NextResponse } from 'next/server';
import { getProviderStatus } from '@/lib/llm';
import { hasApiKey } from '@/lib/maps';

export async function GET() {
  try {
    const llmStatus = await getProviderStatus();

    return NextResponse.json({
      llm: {
        ollama: {
          available: llmStatus.ollama.available,
          models: llmStatus.ollama.models.length,
        },
        gemini: {
          available: llmStatus.gemini.available,
          hasApiKey: llmStatus.gemini.hasApiKey,
          models: llmStatus.gemini.models.length,
        },
      },
      maps: {
        hasApiKey: hasApiKey(),
      },
    });
  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
