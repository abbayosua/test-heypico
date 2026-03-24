// Google Directions API Wrapper

import { getMapsClient, getApiKey } from './client';
import type { DirectionsRoute, DirectionsStep, DirectionsRequest } from '@/types';

// Get directions between two points
export async function getDirections(request: DirectionsRequest): Promise<DirectionsRoute[]> {
  const client = getMapsClient();
  const apiKey = getApiKey();

  try {
    const origin = typeof request.origin === 'string' 
      ? request.origin 
      : `${request.origin.lat},${request.origin.lng}`;
    
    const destination = typeof request.destination === 'string'
      ? request.destination
      : `${request.destination.lat},${request.destination.lng}`;

    const response = await client.directions({
      params: {
        origin,
        destination,
        mode: request.travelMode || 'driving',
        key: apiKey,
      },
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Directions API error: ${response.data.status}`);
    }

    return (response.data.routes || []).map((route) => ({
      summary: route.summary,
      distance: route.legs[0]?.distance?.text || '',
      duration: route.legs[0]?.duration?.text || '',
      steps: (route.legs[0]?.steps || []).map((step): DirectionsStep => ({
        distance: step.distance?.text || '',
        duration: step.duration?.text || '',
        instructions: step.html_instructions?.replace(/<[^>]*>/g, '') || '',
        travelMode: step.travel_mode || '',
      })),
    }));
  } catch (error) {
    console.error('Directions error:', error);
    throw error;
  }
}

// Get the URL to open directions in Google Maps
export function getGoogleMapsDirectionsUrl(
  origin: string | { lat: number; lng: number },
  destination: string | { lat: number; lng: number },
  travelMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
): string {
  const originStr = typeof origin === 'string' 
    ? encodeURIComponent(origin) 
    : `${origin.lat},${origin.lng}`;
  
  const destStr = typeof destination === 'string'
    ? encodeURIComponent(destination)
    : `${destination.lat},${destination.lng}`;

  const modeMap: Record<string, string> = {
    driving: 'd',
    walking: 'w',
    bicycling: 'b',
    transit: 't',
  };

  return `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=${modeMap[travelMode] || 'd'}`;
}
