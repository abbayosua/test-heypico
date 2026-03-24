// Map View Organism - Google Maps embedded view

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Navigation, ExternalLink, X } from '@/components/atoms/icon';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import { Card, CardContent } from '@/components/atoms/card';
import { Skeleton } from '@/components/atoms/skeleton';
import type { ExtractedPlace, Place } from '@/types';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/constants';

interface MapViewProps {
  places?: (ExtractedPlace | Place)[];
  selectedPlace?: ExtractedPlace | Place | null;
  onPlaceSelect?: (place: ExtractedPlace | Place) => void;
  onDirectionsClick?: (place: ExtractedPlace | Place) => void;
  className?: string;
}

interface MapMarker {
  place: ExtractedPlace | Place;
  marker: google.maps.Marker;
  infoWindow: google.maps.InfoWindow;
}

export function MapView({
  places = [],
  selectedPlace,
  onPlaceSelect,
  onDirectionsClick,
  className,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [infoCardPlace, setInfoCardPlace] = useState<ExtractedPlace | Place | null>(null);

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        // Check if API key exists
        const configRes = await fetch('/api/map-config');
        const config = await configRes.json();

        if (!config.hasApiKey) {
          setError('Google Maps API key not configured');
          setIsLoading(false);
          return;
        }

        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places'],
        });

        await loader.load();

        if (mapRef.current) {
          const googleMap = new google.maps.Map(mapRef.current, {
            center: DEFAULT_MAP_CENTER,
            zoom: DEFAULT_MAP_ZOOM,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          });

          setMap(googleMap);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Map initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  // Update markers when places change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(({ marker, infoWindow }) => {
      marker.setMap(null);
      infoWindow.close();
    });

    if (places.length === 0) {
      setMarkers([]);
      return;
    }

    // Create new markers
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
        // Close all other info windows
        newMarkers.forEach(({ infoWindow: iw }) => iw.close());
        infoWindow.open(map, marker);
        setInfoCardPlace(place);
        setShowInfoCard(true);
        onPlaceSelect?.(place);
      });

      bounds.extend(position);
      newMarkers.push({ place, marker, infoWindow });
    });

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      map.fitBounds(bounds, { padding: 50 });
    }

    setMarkers(newMarkers);

    return () => {
      newMarkers.forEach(({ marker, infoWindow }) => {
        marker.setMap(null);
        infoWindow.close();
      });
    };
  }, [map, places]);

  // Handle selected place
  useEffect(() => {
    if (!map || !selectedPlace) return;

    const location = 'location' in selectedPlace ? selectedPlace.location : null;
    if (!location) return;

    map.panTo({ lat: location.lat, lng: location.lng });
    map.setZoom(15);

    // Open the info window for selected place
    const markerData = markers.find(
      (m) => m.place.name === selectedPlace.name
    );
    if (markerData) {
      markers.forEach(({ infoWindow }) => infoWindow.close());
      markerData.infoWindow.open(map, markerData.marker);
    }
  }, [map, selectedPlace, markers]);

  if (isLoading) {
    return (
      <div className={`relative ${className || ''}`}>
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

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
    <div className={`relative ${className || ''}`}>
      <div ref={mapRef} className="w-full h-full" />

      {/* Info Card Overlay */}
      {showInfoCard && infoCardPlace && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold">{infoCardPlace.name}</h3>
                  {infoCardPlace.address && (
                    <p className="text-sm text-muted-foreground">
                      {infoCardPlace.address}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowInfoCard(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {'rating' in infoCardPlace && infoCardPlace.rating && (
                <Badge variant="secondary" className="mt-2">
                  ⭐ {infoCardPlace.rating.toFixed(1)}
                </Badge>
              )}

              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDirectionsClick?.(infoCardPlace)}
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  Directions
                </Button>
                {'googleMapsUrl' in infoCardPlace && infoCardPlace.googleMapsUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(infoCardPlace.googleMapsUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
