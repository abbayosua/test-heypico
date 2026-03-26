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

// In-memory location state for client-side updates
let locationState: UserLocation | null = null;
let statusState: LocationStatus = 'prompt';
const listeners = new Set<() => void>();

// Subscribe to location changes
function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Get current location snapshot (client)
function getLocationSnapshot(): UserLocation | null {
  return locationState;
}

// Get current status snapshot (client)
function getStatusSnapshot(): LocationStatus {
  return statusState;
}

// Get server snapshot (always returns null/idle for SSR)
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

// Initialize from localStorage (runs once on client)
function initializeFromStorage() {
  if (typeof window === 'undefined') return;

  try {
    const savedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (savedLocation) {
      const parsed = JSON.parse(savedLocation) as UserLocation;
      locationState = parsed;
      statusState = 'granted';
    } else {
      statusState = navigator.geolocation ? 'prompt' : 'error';
    }
  } catch {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    statusState = navigator.geolocation ? 'prompt' : 'error';
  }
  notifyListeners();
}

// Run initialization once
let initialized = false;

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

  // Initialize from localStorage once on client
  if (!initialized && typeof window !== 'undefined') {
    initialized = true;
    initializeFromStorage();
  }

  const [error, setError] = useState<string | null>(null);

  // Save location to localStorage
  const saveLocation = useCallback((loc: UserLocation | null) => {
    if (typeof window === 'undefined') return;
    if (loc) {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
    } else {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
    }
  }, []);

  // Set location and persist
  const setLocation = useCallback((loc: UserLocation | null) => {
    locationState = loc;
    statusState = loc ? 'granted' : 'prompt';
    saveLocation(loc);
    notifyListeners();
  }, [saveLocation]);

  // Request geolocation permission
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      statusState = 'error';
      notifyListeners();
      setError('Geolocation is not supported by your browser');
      return false;
    }

    statusState = 'loading';
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
          notifyListeners();
          setError(
            err.code === err.PERMISSION_DENIED
              ? 'Location permission denied'
              : 'Failed to get your location'
          );
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
        notifyListeners();
        setError('City not found');
        return false;
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      statusState = 'error';
      notifyListeners();
      setError('Failed to find city');
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
