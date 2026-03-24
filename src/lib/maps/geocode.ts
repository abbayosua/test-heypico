// Google Geocoding API Wrapper

import { getMapsClient, getApiKey } from './client';
import type { GeocodeResult } from '@/types';

// Geocode address to coordinates
export async function geocodeAddress(address: string): Promise<GeocodeResult[]> {
  const client = getMapsClient();
  const apiKey = getApiKey();

  try {
    const response = await client.geocode({
      params: {
        address,
        key: apiKey,
      },
    });

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw new Error(`Geocoding API error: ${response.data.status}`);
    }

    return (response.data.results || []).map((result) => ({
      address: address,
      formattedAddress: result.formatted_address,
      location: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      placeId: result.place_id,
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

// Reverse geocode coordinates to address
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult[]> {
  const client = getMapsClient();
  const apiKey = getApiKey();

  try {
    const response = await client.reverseGeocode({
      params: {
        latlng: { lat, lng },
        key: apiKey,
      },
    });

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw new Error(`Reverse Geocoding API error: ${response.data.status}`);
    }

    return (response.data.results || []).map((result) => ({
      address: result.formatted_address,
      formattedAddress: result.formatted_address,
      location: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      placeId: result.place_id,
    }));
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
}

// Get a single geocode result (best match)
export async function geocode(address: string): Promise<GeocodeResult | null> {
  const results = await geocodeAddress(address);
  return results[0] || null;
}
