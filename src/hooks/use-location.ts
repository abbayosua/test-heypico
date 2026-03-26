// useLocation Hook - User location management

'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

export interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

export type LocationStatus =
  | 'idle'
  | 'prompt'
  | 'loading'
  | 'granted'
  | 'denied'
  | 'error';

export interface UseLocationReturn {
  location: UserLocation | null;
  status: LocationStatus;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  setLocation: (location: UserLocation | null) => void;
  setLocationFromCity: (city: string) => Promise<boolean>;
}

// Storage key for persisting location
const LOCATION_STORAGE_KEY = 'map-assistant-user-location';

// External store for location state
// Initialize with null to match server-side render
let locationState: UserLocation | null = null;
let statusState: LocationStatus = 'prompt';
let errorState: string | null = null;
let initialized = false;
const listeners = new Set<() => void>();

// Subscribe to location changes
function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Get current location snapshot
function getLocationSnapshot(): UserLocation | null {
  return locationState;
}

// Get current status snapshot
function getStatusSnapshot(): LocationStatus {
  return statusState;
}

// Get server snapshot (always returns null for SSR)
function getServerLocationSnapshot(): UserLocation | null {
  return null;
}

function getServerStatusSnapshot(): LocationStatus {
  return 'prompt';
}

// Notify all listeners of state change
function notifyListeners() {
  listeners.forEach((callback) => callback());
}

// Initialize from localStorage - must be called AFTER hydration
function initializeFromStorage() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  try {
    const savedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (savedLocation) {
      const parsed = JSON.parse(savedLocation) as UserLocation;
      locationState = parsed;
      statusState = 'granted';
      notifyListeners();
    } else {
      // Check if geolocation is available
      statusState = navigator.geolocation ? 'prompt' : 'error';
    }
  } catch {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    statusState = navigator.geolocation ? 'prompt' : 'error';
  }
}

// Save location to localStorage
function saveLocation(loc: UserLocation | null) {
  if (typeof window === 'undefined') return;
  if (loc) {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
  } else {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
  }
}

// Flag to track if we've scheduled initialization
let initScheduled = false;

export function useLocation(): UseLocationReturn {
  // Use useSyncExternalStore to prevent hydration mismatch
  const location = useSyncExternalStore(
    subscribe,
    getLocationSnapshot,
    getServerLocationSnapshot
  );

  const status = useSyncExternalStore(
    subscribe,
    getStatusSnapshot,
    getServerStatusSnapshot
  );

  // Schedule initialization after first render (after hydration)
  // Using useEffect timing via a flag check during render
  if (typeof window !== 'undefined' && !initScheduled) {
    initScheduled = true;
    // Use setTimeout to ensure this runs after hydration completes
    // This is the earliest we can safely access localStorage without
    // causing hydration mismatch
    setTimeout(initializeFromStorage, 0);
  }

  const [error, setError] = useState<string | null>(errorState);

  // Set location and persist
  const setLocation = useCallback((loc: UserLocation | null) => {
    locationState = loc;
    statusState = loc ? 'granted' : 'prompt';
    errorState = null;
    saveLocation(loc);
    setError(null);
    notifyListeners();
  }, []);

  // Request geolocation permission
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      statusState = 'error';
      errorState = 'Geolocation is not supported by your browser';
      notifyListeners();
      setError(errorState);
      return false;
    }

    statusState = 'loading';
    errorState = null;
    notifyListeners();
    setError(null);

    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Try to get city name via reverse geocoding
          try {
            const response = await fetch(
              `/api/geocode?lat=${position.coords.latitude}&lng=${position.coords.longitude}`
            );
            if (response.ok) {
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                const addressComponents = data.results[0].addressComponents || {};
                newLocation.city = addressComponents.city || addressComponents.town || addressComponents.village;
                newLocation.country = addressComponents.country;
              }
            }
          } catch (err) {
            console.warn('Failed to get city name:', err);
          }

          setLocation(newLocation);
          resolve(true);
        },
        (err) => {
          console.error('Geolocation error:', err);
          statusState = 'denied';
          errorState = err.code === err.PERMISSION_DENIED
            ? 'Location permission denied'
            : 'Failed to get your location';
          notifyListeners();
          setError(errorState);
          resolve(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        }
      );
    });
  }, [setLocation]);

  // Set location from city name (geocoding)
  const setLocationFromCity = useCallback(async (city: string): Promise<boolean> => {
    if (!city.trim()) return false;

    statusState = 'loading';
    errorState = null;
    notifyListeners();
    setError(null);

    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(city)}`);
      if (!response.ok) {
        throw new Error('Failed to geocode city');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const newLocation: UserLocation = {
          lat: result.location.lat,
          lng: result.location.lng,
          city: city,
        };
        setLocation(newLocation);
        return true;
      } else {
        statusState = 'error';
        errorState = 'City not found';
        notifyListeners();
        setError(errorState);
        return false;
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      statusState = 'error';
      errorState = 'Failed to find city';
      notifyListeners();
      setError(errorState);
      return false;
    }
  }, [setLocation]);

  return {
    location,
    status,
    error,
    requestPermission,
    setLocation,
    setLocationFromCity,
  };
}
