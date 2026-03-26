// useLocation Hook - User location management

'use client';

import { useState, useEffect, useCallback } from 'react';

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
  requestPermission: () => Promise<void>;
  setLocation: (location: UserLocation | null) => void;
  setLocationFromCity: (city: string) => Promise<boolean>;
}

// Storage key for persisting location
const LOCATION_STORAGE_KEY = 'map-assistant-user-location';

export function useLocation(): UseLocationReturn {
  const [location, setLocationState] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation) as UserLocation;
        setLocationState(parsed);
        setStatus('granted');
      } catch {
        // Invalid saved location, ignore
        localStorage.removeItem(LOCATION_STORAGE_KEY);
      }
    } else {
      // Check if we should prompt for location
      if (navigator.geolocation) {
        setStatus('prompt');
      } else {
        setStatus('error');
        setError('Geolocation is not supported by your browser');
      }
    }
  }, []);

  // Save location to localStorage
  const saveLocation = useCallback((loc: UserLocation | null) => {
    if (loc) {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
    } else {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
    }
  }, []);

  // Set location and persist
  const setLocation = useCallback((loc: UserLocation | null) => {
    setLocationState(loc);
    saveLocation(loc);
    if (loc) {
      setStatus('granted');
    }
  }, [saveLocation]);

  // Request geolocation permission
  const requestPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocation is not supported by your browser');
      return;
    }

    setStatus('loading');
    setError(null);

    return new Promise<void>((resolve) => {
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
          resolve();
        },
        (err) => {
          console.error('Geolocation error:', err);
          setStatus('denied');
          setError(
            err.code === err.PERMISSION_DENIED
              ? 'Location permission denied'
              : 'Failed to get your location'
          );
          resolve();
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

    setStatus('loading');
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
        setStatus('error');
        setError('City not found');
        return false;
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setStatus('error');
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
