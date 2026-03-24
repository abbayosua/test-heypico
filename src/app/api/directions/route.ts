// Directions API Route - Get directions between locations

import { NextRequest, NextResponse } from 'next/server';
import { getDirections, getGoogleMapsDirectionsUrl } from '@/lib/maps';
import { logApiUsage } from '@/lib/rate-limit';
import type { DirectionsRequest } from '@/types';

interface DirectionsRequestBody extends DirectionsRequest {
  returnUrl?: boolean;
}

// Get directions
export async function POST(request: NextRequest) {
  try {
    const body: DirectionsRequestBody = await request.json();
    const { origin, destination, travelMode, returnUrl } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    // Return just the Google Maps URL
    if (returnUrl) {
      const url = getGoogleMapsDirectionsUrl(origin, destination, travelMode);
      return NextResponse.json({ url });
    }

    // Get full directions
    const routes = await getDirections({
      origin,
      destination,
      travelMode,
    });

    await logApiUsage('directions', 'google');

    // Also include the Google Maps URL for convenience
    const googleMapsUrl = getGoogleMapsDirectionsUrl(origin, destination, travelMode);

    return NextResponse.json({
      routes,
      googleMapsUrl,
    });
  } catch (error) {
    console.error('Directions API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
