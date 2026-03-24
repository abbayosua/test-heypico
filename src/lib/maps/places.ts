// Google Places API Wrapper

import { getMapsClient, getApiKey } from './client';
import type { Place, PlaceSearchResult } from '@/types';

interface TextSearchParams {
  query: string;
  location?: { lat: number; lng: number };
  radius?: number;
  type?: string;
}

interface NearbySearchParams {
  location: { lat: number; lng: number };
  radius?: number;
  type?: string;
  keyword?: string;
}

// Text search - search for places using a text query
export async function textSearch(params: TextSearchParams): Promise<PlaceSearchResult> {
  const client = getMapsClient();
  const apiKey = getApiKey();

  try {
    const response = await client.textSearch({
      params: {
        query: params.query,
        location: params.location
          ? { lat: params.location.lat, lng: params.location.lng }
          : undefined,
        radius: params.radius || 5000,
        type: params.type,
        key: apiKey,
      },
    });

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API error: ${response.data.status}`);
    }

    const places = (response.data.results || []).map((result) => ({
      id: result.place_id,
      placeId: result.place_id,
      name: result.name || 'Unknown',
      address: result.formatted_address || result.vicinity || '',
      formattedAddress: result.formatted_address,
      location: {
        lat: result.geometry?.location?.lat || 0,
        lng: result.geometry?.location?.lng || 0,
      },
      rating: result.rating,
      totalRatings: result.user_ratings_total,
      priceLevel: result.price_level,
      types: result.types,
      openingHours: result.opening_hours
        ? {
            isOpen: result.opening_hours.open_now ?? false,
          }
        : undefined,
      googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${result.place_id}`,
    }));

    return {
      places,
      total: places.length,
      query: params.query,
      location: params.location,
    };
  } catch (error) {
    console.error('Places text search error:', error);
    throw error;
  }
}

// Nearby search - search for places near a location
export async function nearbySearch(params: NearbySearchParams): Promise<PlaceSearchResult> {
  const client = getMapsClient();
  const apiKey = getApiKey();

  try {
    const response = await client.placesNearby({
      params: {
        location: { lat: params.location.lat, lng: params.location.lng },
        radius: params.radius || 5000,
        type: params.type,
        keyword: params.keyword,
        key: apiKey,
      },
    });

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places Nearby API error: ${response.data.status}`);
    }

    const places = (response.data.results || []).map((result) => ({
      id: result.place_id,
      placeId: result.place_id,
      name: result.name || 'Unknown',
      address: result.vicinity || result.formatted_address || '',
      formattedAddress: result.formatted_address,
      location: {
        lat: result.geometry?.location?.lat || 0,
        lng: result.geometry?.location?.lng || 0,
      },
      rating: result.rating,
      totalRatings: result.user_ratings_total,
      priceLevel: result.price_level,
      types: result.types,
      openingHours: result.opening_hours
        ? {
            isOpen: result.opening_hours.open_now ?? false,
          }
        : undefined,
      photos: result.photos?.map((photo) => ({
        photoReference: photo.photo_reference,
        height: photo.height,
        width: photo.width,
      })),
      googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${result.place_id}`,
    }));

    return {
      places,
      total: places.length,
      query: params.keyword || params.type || 'nearby',
      location: params.location,
    };
  } catch (error) {
    console.error('Places nearby search error:', error);
    throw error;
  }
}

// Get place details
export async function getPlaceDetails(placeId: string): Promise<Place> {
  const client = getMapsClient();
  const apiKey = getApiKey();

  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: [
          'place_id',
          'name',
          'formatted_address',
          'geometry',
          'rating',
          'user_ratings_total',
          'price_level',
          'types',
          'opening_hours',
          'photos',
          'formatted_phone_number',
          'website',
          'url',
          'reviews',
        ],
        key: apiKey,
      },
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Place Details API error: ${response.data.status}`);
    }

    const result = response.data.result;

    return {
      id: result.place_id || placeId,
      placeId: result.place_id || placeId,
      name: result.name || 'Unknown',
      address: result.formatted_address || '',
      formattedAddress: result.formatted_address,
      location: {
        lat: result.geometry?.location?.lat || 0,
        lng: result.geometry?.location?.lng || 0,
      },
      rating: result.rating,
      totalRatings: result.user_ratings_total,
      priceLevel: result.price_level,
      types: result.types,
      openingHours: result.opening_hours
        ? {
            isOpen: result.opening_hours.open_now ?? false,
            periods: result.opening_hours.periods as any,
            weekdayText: result.opening_hours.weekday_text,
          }
        : undefined,
      photos: result.photos?.map((photo) => ({
        photoReference: photo.photo_reference,
        height: photo.height,
        width: photo.width,
      })),
      phoneNumber: result.formatted_phone_number,
      website: result.website,
      googleMapsUrl: result.url || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    };
  } catch (error) {
    console.error('Place details error:', error);
    throw error;
  }
}

// Get photo URL
export function getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
  const apiKey = getApiKey();
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${apiKey}`;
}
