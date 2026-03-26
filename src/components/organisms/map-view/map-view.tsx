// Map View Organism - Google Maps embedded view

'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from '@/components/atoms/icon';
import { Skeleton } from '@/components/atoms/skeleton';
import type { ExtractedPlace, Place } from '@/types';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/constants';

interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
}

interface MapViewProps {
  places?: (ExtractedPlace | Place)[];
  selectedPlace?: ExtractedPlace | Place | null;
  onPlaceSelect?: (place: ExtractedPlace | Place) => void;
  userLocation?: UserLocation | null;
  directionsPolyline?: string | null;
  className?: string;
}

interface MapMarker {
  place: ExtractedPlace | Place;
  marker: google.maps.Marker;
  infoWindow: google.maps.InfoWindow;
}

// Global callback name for Google Maps
const CALLBACK_NAME = 'initGoogleMapsCallback';

// Track if we've set up the global callback
let globalCallbackSetup = false;
let resolveCallback: (() => void) | null = null;

export function MapView({
  places = [],
  selectedPlace,
  onPlaceSelect,
  userLocation,
  directionsPolyline,
  className,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const initAttemptedRef = useRef(false);

  // Fetch API key and set up Google Maps
  useEffect(() => {
    let mounted = true;

    const setupGoogleMaps = async () => {
      try {
        const res = await fetch('/api/map-config');
        const config = await res.json();

        if (!mounted) return;

        if (!config.hasApiKey || !config.apiKey) {
          setError('Google Maps API key not configured');
          setIsLoading(false);
          return;
        }

        // Check if Google Maps is already loaded
        if (window.google?.maps?.Map) {
          setMapsReady(true);
          return;
        }

        // Set up global callback if not already done
        if (!globalCallbackSetup) {
          globalCallbackSetup = true;
          (window as unknown as Record<string, unknown>)[CALLBACK_NAME] = () => {
            if (resolveCallback) {
              resolveCallback();
              resolveCallback = null;
            }
          };
        }

        // Create a promise that resolves when Google Maps is ready
        const mapsPromise = new Promise<void>((resolve) => {
          // Check if already loaded
          if (window.google?.maps?.Map) {
            resolve();
            return;
          }
          resolveCallback = resolve;
        });

        // Load the Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=places,geometry&callback=${CALLBACK_NAME}`;
        script.async = true;
        script.defer = true;

        document.head.appendChild(script);

        // Wait for Google Maps to be ready
        await mapsPromise;

        if (mounted) {
          setMapsReady(true);
        }
      } catch (err) {
        console.error('Failed to setup Google Maps:', err);
        if (mounted) {
          setError('Failed to load map configuration');
          setIsLoading(false);
        }
      }
    };

    setupGoogleMaps();

    return () => {
      mounted = false;
    };
  }, []);

  // Initialize map when Google Maps is ready
  useEffect(() => {
    if (!mapsReady || !mapRef.current || initAttemptedRef.current) {
      return;
    }

    // Double-check that google.maps.Map is actually available
    if (typeof google.maps.Map !== 'function') {
      console.error('google.maps.Map is not a constructor');
      // Defer state update to avoid cascading renders
      queueMicrotask(() => {
        setError('Google Maps failed to initialize properly');
        setIsLoading(false);
      });
      return;
    }

    initAttemptedRef.current = true;

    try {
      // Use user location as default center if available
      const initialCenter = userLocation
        ? { lat: userLocation.lat, lng: userLocation.lng }
        : DEFAULT_MAP_CENTER;

      const googleMap = new google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: userLocation ? 13 : DEFAULT_MAP_ZOOM,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      setMap(googleMap);
      setIsLoading(false);
    } catch (err) {
      console.error('Map initialization error:', err);
      // Defer state update to avoid cascading renders
      queueMicrotask(() => {
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setIsLoading(false);
      });
    }
  }, [mapsReady]);

  // Store markers in ref
  const markersRef = useRef<MapMarker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  // Render directions polyline
  useEffect(() => {
    if (!map) return;

    // Remove existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (!directionsPolyline) return;

    // Decode and render the polyline
    const path = google.maps.geometry?.encoding?.decodePath(directionsPolyline);
    if (!path) {
      // If geometry library not loaded, we need to add it
      console.warn('Google Maps geometry library not loaded');
      return;
    }

    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#4285F4',
      strokeOpacity: 1.0,
      strokeWeight: 5,
      map,
    });

    polylineRef.current = polyline;

    // Fit map to show the entire route
    const bounds = new google.maps.LatLngBounds();
    path.forEach((point) => bounds.extend(point));
    map.fitBounds(bounds, 50);

    return () => {
      polyline.setMap(null);
    };
  }, [map, directionsPolyline]);

  // Add user location marker
  useEffect(() => {
    if (!map) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }

    if (!userLocation) return;

    // Create user location marker with custom icon
    const userMarker = new google.maps.Marker({
      position: { lat: userLocation.lat, lng: userLocation.lng },
      map,
      title: userLocation.city || 'Your Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
    });

    // Add pulsing circle around user marker
    const pulseCircle = new google.maps.Circle({
      strokeColor: '#4285F4',
      strokeOpacity: 0.4,
      strokeWeight: 2,
      fillColor: '#4285F4',
      fillOpacity: 0.1,
      map,
      center: { lat: userLocation.lat, lng: userLocation.lng },
      radius: 500, // 500 meters
    });

    userMarkerRef.current = userMarker;

    // Pan to user location when it changes
    map.panTo({ lat: userLocation.lat, lng: userLocation.lng });
    map.setZoom(13);

    return () => {
      userMarker.setMap(null);
      pulseCircle.setMap(null);
    };
  }, [map, userLocation]);

  // Update markers when places change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(({ marker, infoWindow }) => {
      marker.setMap(null);
      infoWindow.close();
    });
    markersRef.current = [];

    if (places.length === 0) return;

    const newMarkers: MapMarker[] = [];
    const bounds = new google.maps.LatLngBounds();

    places.forEach((place) => {
      const location = 'location' in place ? place.location : null;
      if (!location) return;

      const position = { lat: location.lat, lng: location.lng };

      const marker = new google.maps.Marker({
        position,
        map,
        title: place.name,
        animation: google.maps.Animation.DROP,
      });

      const infoContent = `
        <div style="padding: 8px; max-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${place.name}</h3>
          ${place.address ? `<p style="font-size: 12px; color: #666;">${place.address}</p>` : ''}
          ${'rating' in place && place.rating ? `<p style="font-size: 12px;">⭐ ${place.rating}</p>` : ''}
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: infoContent,
      });

      marker.addListener('click', () => {
        newMarkers.forEach(({ infoWindow: iw }) => iw.close());
        infoWindow.open(map, marker);
        onPlaceSelect?.(place);
      });

      bounds.extend(position);
      newMarkers.push({ place, marker, infoWindow });
    });

    if (newMarkers.length > 0) {
      map.fitBounds(bounds, 50);
    }

    markersRef.current = newMarkers;

    return () => {
      newMarkers.forEach(({ marker, infoWindow }) => {
        marker.setMap(null);
        infoWindow.close();
      });
    };
  }, [map, places, onPlaceSelect]);

  // Handle selected place
  useEffect(() => {
    if (!map || !selectedPlace) return;

    const location = 'location' in selectedPlace ? selectedPlace.location : null;
    if (!location) return;

    map.panTo({ lat: location.lat, lng: location.lng });
    map.setZoom(15);

    const markerData = markersRef.current.find(
      (m) => m.place.name === selectedPlace.name
    );
    if (markerData) {
      markersRef.current.forEach(({ infoWindow }) => infoWindow.close());
      markerData.infoWindow.open(map, markerData.marker);
    }
  }, [map, selectedPlace]);

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className || ''}`}>
        <div className="text-center p-4">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Please configure GOOGLE_MAPS_API_KEY
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      {/* Map container */}
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 pointer-events-none">
          <Skeleton className="w-full h-full" />
        </div>
      )}
    </div>
  );
}
