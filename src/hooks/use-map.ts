// useMap Hook - Map state management

'use client';

import { useState, useCallback } from 'react';
import type { Place, ExtractedPlace, DirectionsRoute, GeocodeResult, PlaceGroup } from '@/types';

// Colors for place groups (cycling through)
const GROUP_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

interface UseMapReturn {
  places: (Place | ExtractedPlace)[]; // All places from all groups (for backward compat)
  placeGroups: PlaceGroup[];
  activeGroupId: string | null;
  setPlaces: (places: (Place | ExtractedPlace)[]) => void;
  addPlaceGroup: (query: string, places: (Place | ExtractedPlace)[]) => string;
  setActiveGroup: (groupId: string | null) => void;
  clearPlaceGroups: () => void;
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
  const [placeGroups, setPlaceGroups] = useState<PlaceGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | ExtractedPlace | null>(null);
  const [directions, setDirections] = useState<DirectionsRoute[] | null>(null);
  const [directionsLoading, setDirectionsLoading] = useState(false);
  const [directionsOrigin, setDirectionsOrigin] = useState<string | null>(null);
  const [directionsDestination, setDirectionsDestination] = useState<string | null>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string | null>(null);
  const [directionsPolyline, setDirectionsPolyline] = useState<string | null>(null);

  // Add a new place group
  const addPlaceGroup = useCallback((query: string, newPlaces: (Place | ExtractedPlace)[]): string => {
    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const colorIndex = placeGroups.length % GROUP_COLORS.length;
    
    const newGroup: PlaceGroup = {
      id: groupId,
      query,
      places: newPlaces,
      color: GROUP_COLORS[colorIndex],
      createdAt: new Date(),
    };

    setPlaceGroups(prev => [...prev, newGroup]);
    setActiveGroupId(groupId); // New group becomes active
    
    // Update flat places for backward compatibility
    setPlaces(prev => [...prev, ...newPlaces]);
    
    return groupId;
  }, [placeGroups.length]);

  // Set active group (for highlighting)
  const setActiveGroup = useCallback((groupId: string | null) => {
    setActiveGroupId(groupId);
  }, []);

  // Clear all place groups
  const clearPlaceGroups = useCallback(() => {
    setPlaceGroups([]);
    setActiveGroupId(null);
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
        
        // Set the first route's polyline for map display
        if (data.routes && data.routes.length > 0 && data.routes[0].polyline) {
          setDirectionsPolyline(data.routes[0].polyline);
        }
        
        // Set origin and destination strings for display
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
    placeGroups,
    activeGroupId,
    setPlaces,
    addPlaceGroup,
    setActiveGroup,
    clearPlaceGroups,
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
