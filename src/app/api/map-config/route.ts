// Map Config API Route - Get Google Maps configuration

import { NextResponse } from 'next/server';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/constants';

// Get map configuration
export async function GET() {
  try {
    // Check both possible env variable names
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const hasApiKey = !!apiKey;

    return NextResponse.json({
      hasApiKey,
      apiKey: hasApiKey ? apiKey : null,
      defaultCenter: DEFAULT_MAP_CENTER,
      defaultZoom: DEFAULT_MAP_ZOOM,
    });
  } catch (error) {
    console.error('Map config API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
