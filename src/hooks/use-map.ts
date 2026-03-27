// useMap Hook - Map state management (simplified - no grouping)

'use client';

import { useState, useCallback } from 'react';
import type { Place, ExtractedPlace, DirectionsRoute, GeocodeResult } from '@/types';

interface UseMapReturn {
  places: (Place | ExtractedPlace)[];
  addPlaces: (places: (Place | ExtractedPlace)[]) => void;
  clearPlaces: () => void;
  selectedPlace: Place | ExtractedPlace | null;
  setSelectedPlace: (place: Place | ExtractedPlace | null) => void;
  directions: DirectionsRoute[] | null;
  directionsLoading: boolean;
  directionsOrigin: string | null;
  directionsDestination: string | null;
  googleMapsUrl: string | null;
  directionsPolyline: string | null;
  getDirections: (origin: string | { lat: number; lng: number }, destination: string | { lat: number; lng: number }, travelMode?: 'driving' | 'walking' | 'bicycling' | 'transit', destinationName?: string) => Promise<void>;
  clearDirections: () => void;
  searchPlaces: (query: string) => Promise<void>;
  getPlaceDetails: (placeId: string) => Promise<Place | null>;
  geocode: (address: string) => Promise<GeocodeResult | null>;
}

export function useMap(): UseMapReturn {
  const [places, setPlaces] = useState<(Place | ExtractedPlace)[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | ExtractedPlace | null>(null);
  const [directions, setDirections] = useState<DirectionsRoute[] | null>(null);
  const [directionsLoading, setDirectionsLoading] = useState(false);
  const [directionsOrigin, setDirectionsOrigin] = useState<string | null>(null);
  const [directionsDestination, setDirectionsDestination] = useState<string | null>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string | null>(null);
  const [directionsPolyline, setDirectionsPolyline] = useState<string | null>(null);

  // Add places to the map
  const addPlaces = useCallback((newPlaces: (Place | ExtractedPlace)[]) => {
    setPlaces(prev => {
      // Filter out duplicates based on name and location
      const existingKeys = new Set(
        prev.map(p => `${p.name}-${'location' in p ? `${p.location?.lat}-${p.location?.lng}` : ''}`)
      );
      const uniqueNewPlaces = newPlaces.filter(p => {
        const key = `${p.name}-${'location' in p ? `${p.location?.lat}-${p.location?.lng}` : ''}`;
        return !existingKeys.has(key);
      });
      return [...prev, ...uniqueNewPlaces];
    });
  }, []);

  // Clear all places
  const clearPlaces = useCallback(() => {
    setPlaces([]);
  }, []);

  const getDirections = useCallback(async (
    origin: string | { lat: number; lng: number },
    destination: string | { lat: number; lng: number },
    travelMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving',
    destinationName?: string
  ) => {
    setDirectionsLoading(true);
    try {
      const response = await fetch('/api/directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, travelMode }),
      });

      if (response.ok) {
        const data = await response.json();
        setDirections(data.routes);
        setGoogleMapsUrl(data.googleMapsUrl);
        
        if (data.routes && data.routes.length > 0 && data.routes[0].polyline) {
          setDirectionsPolyline(data.routes[0].polyline);
        }
        
        setDirectionsOrigin(typeof origin === 'string' ? origin : 'Your Location');
        setDirectionsDestination(typeof destination === 'string' ? destination : (destinationName || 'Selected Place'));
      }
    } catch (error) {
      console.error('Failed to get directions:', error);
    } finally {
      setDirectionsLoading(false);
    }
  }, []);

  const clearDirections = useCallback(() => {
    setDirections(null);
    setDirectionsOrigin(null);
    setDirectionsDestination(null);
    setGoogleMapsUrl(null);
    setDirectionsPolyline(null);
  }, []);

  const searchPlaces = useCallback(async (query: string) => {
    try {
      const response = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        setPlaces(data.places || []);
      }
    } catch (error) {
      console.error('Failed to search places:', error);
    }
  }, []);

  const getPlaceDetails = useCallback(async (placeId: string): Promise<Place | null> => {
    try {
      const response = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.place;
      }
    } catch (error) {
      console.error('Failed to get place details:', error);
    }
    return null;
  }, []);

  const geocode = useCallback(async (address: string): Promise<GeocodeResult | null> => {
    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.results?.[0] || null;
      }
    } catch (error) {
      console.error('Failed to geocode:', error);
    }
    return null;
  }, []);

  return {
    places,
    addPlaces,
    clearPlaces,
    selectedPlace,
    setSelectedPlace,
    directions,
    directionsLoading,
    directionsOrigin,
    directionsDestination,
    googleMapsUrl,
    directionsPolyline,
    getDirections,
    clearDirections,
    searchPlaces,
    getPlaceDetails,
    geocode,
  };
}
