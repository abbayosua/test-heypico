// Google Maps Client Configuration
// All API calls are made server-side to protect the API key

import { Client } from '@googlemaps/google-maps-services-js';

let mapsClient: Client | null = null;

export function getMapsClient(): Client {
  if (!mapsClient) {
    mapsClient = new Client({});
  }
  return mapsClient;
}

export function getApiKey(): string {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is not configured');
  }
  return apiKey;
}

export function hasApiKey(): boolean {
  return !!process.env.GOOGLE_MAPS_API_KEY;
}
