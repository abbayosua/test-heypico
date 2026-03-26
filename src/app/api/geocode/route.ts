// Geocode API Route - Convert addresses to coordinates and city autocomplete

import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress, reverseGeocode, getMapsClient, getApiKey } from '@/lib/maps';
import { logApiUsage } from '@/lib/rate-limit';

interface GeocodeRequest {
  address?: string;
  lat?: number;
  lng?: number;
}

// GET - Geocode via query params (for easier client-side usage)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const query = searchParams.get('query'); // For autocomplete

    // City autocomplete
    if (query) {
      const client = getMapsClient();
      const apiKey = getApiKey();

      const response = await client.placeAutocomplete({
        params: {
          input: query,
          types: '(cities)',
          key: apiKey,
        },
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Places Autocomplete API error: ${response.data.status}`);
      }

      const predictions = (response.data.predictions || []).map((pred) => ({
        placeId: pred.place_id,
        description: pred.description,
        mainText: pred.structured_formatting?.main_text || pred.description,
        secondaryText: pred.structured_formatting?.secondary_text || '',
      }));

      await logApiUsage('geocode', 'google-autocomplete');

      return NextResponse.json({ predictions });
    }

    // Reverse geocode (coordinates to address)
    if (lat && lng) {
      const results = await reverseGeocode(parseFloat(lat), parseFloat(lng));
      await logApiUsage('geocode', 'google');

      // Parse address components
      const formattedResults = results.map((r) => {
        // Parse the formatted address to extract city and country
        const parts = r.formattedAddress?.split(', ') || [];
        const addressComponents: Record<string, string> = {};

        // Try to extract city and country from formatted address
        if (parts.length >= 2) {
          // Usually format is: "City, Country" or "City, State, Country"
          addressComponents.city = parts[0];
          addressComponents.country = parts[parts.length - 1];
        }

        return {
          ...r,
          addressComponents,
        };
      });

      return NextResponse.json({ results: formattedResults });
    }

    // Forward geocode (address to coordinates)
    if (address) {
      const results = await geocodeAddress(address);
      await logApiUsage('geocode', 'google');
      return NextResponse.json({ results });
    }

    return NextResponse.json(
      { error: 'Either address, lat/lng, or query is required' },
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

// POST - Geocode via body (existing functionality)
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
