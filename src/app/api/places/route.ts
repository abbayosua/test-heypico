// Places API Route - Search Google Places

import { NextRequest, NextResponse } from 'next/server';
import { textSearch, nearbySearch, getPlaceDetails } from '@/lib/maps';
import { logApiUsage } from '@/lib/rate-limit';

interface PlacesRequest {
  query?: string;
  location?: { lat: number; lng: number };
  radius?: number;
  type?: string;
  placeId?: string;
}

// Search places or get place details
export async function POST(request: NextRequest) {
  try {
    const body: PlacesRequest = await request.json();
    const { query, location, radius, type, placeId } = body;

    // Get place details by ID
    if (placeId) {
      const place = await getPlaceDetails(placeId);
      await logApiUsage('places', 'google');
      return NextResponse.json({ place });
    }

    // Search by query
    if (query) {
      const result = await textSearch({
        query,
        location,
        radius,
        type,
      });
      await logApiUsage('places', 'google');
      return NextResponse.json(result);
    }

    // Nearby search
    if (location) {
      const result = await nearbySearch({
        location,
        radius,
        type,
      });
      await logApiUsage('places', 'google');
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Either query, placeId, or location is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Places API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
