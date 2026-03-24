// Map Config API Route - Get Google Maps configuration (without exposing API key)

import { NextResponse } from 'next/server';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/constants';

// Get map configuration
// The API key is NOT sent here - it's loaded via a different mechanism
export async function GET() {
  try {
    const hasApiKey = !!process.env.GOOGLE_MAPS_API_KEY;

    return NextResponse.json({
      hasApiKey,
      defaultCenter: DEFAULT_MAP_CENTER,
      defaultZoom: DEFAULT_MAP_ZOOM,
      // The actual API key loading happens client-side via script injection
      // but we validate it exists here
    });
  } catch (error) {
    console.error('Map config API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
