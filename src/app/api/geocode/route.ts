// Geocode API Route - Convert addresses to coordinates

import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress, reverseGeocode } from '@/lib/maps';
import { logApiUsage } from '@/lib/rate-limit';

interface GeocodeRequest {
  address?: string;
  lat?: number;
  lng?: number;
}

// Geocode address or reverse geocode coordinates
export async function POST(request: NextRequest) {
  try {
    const body: GeocodeRequest = await request.json();
    const { address, lat, lng } = body;

    // Reverse geocode (coordinates to address)
    if (lat !== undefined && lng !== undefined) {
      const results = await reverseGeocode(lat, lng);
      await logApiUsage('geocode', 'google');
      return NextResponse.json({ results });
    }

    // Forward geocode (address to coordinates)
    if (address) {
      const results = await geocodeAddress(address);
      await logApiUsage('geocode', 'google');
      return NextResponse.json({ results });
    }

    return NextResponse.json(
      { error: 'Either address or lat/lng is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Geocode API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
