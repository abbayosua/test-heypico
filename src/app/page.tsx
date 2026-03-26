// Home Page - AI Map Assistant

'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { MainLayout } from '@/components/templates';
import { ChatPanel } from '@/components/organisms/chat-panel';
import { MapView } from '@/components/organisms/map-view';
import { DirectionsPanel } from '@/components/organisms/directions-panel';
import { PlaceDetailsDialog } from '@/components/organisms/place-details-dialog';
import { LocationDialog } from '@/components/organisms/location-dialog';
import { useChat } from '@/hooks/use-chat';
import { useMap } from '@/hooks/use-map';
import { useSettings } from '@/hooks/use-settings';
import { useLocation } from '@/hooks/use-location';
import type { ExtractedPlace, Place } from '@/types';

// Generate a session ID (in production, this would come from auth)
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// localStorage subscription helpers for useSyncExternalStore
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): string {
  if (typeof window === 'undefined') return '';
  const stored = localStorage.getItem('map-assistant-session-id');
  if (stored) return stored;
  const newId = generateSessionId();
  localStorage.setItem('map-assistant-session-id', newId);
  return newId;
}

function getServerSnapshot(): string {
  return '';
}

export default function Home() {
  // Session ID - use useSyncExternalStore for localStorage
  const sessionId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isReady = Boolean(sessionId);

  // Location hook
  const {
    location: userLocation,
    status: locationStatus,
    error: locationError,
    requestPermission,
    setLocation,
    setLocationFromCity,
  } = useLocation();

  // Show location dialog if no location is set and status is 'prompt'
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [hasPromptedLocation, setHasPromptedLocation] = useState(false);

  // Hooks - only initialize when sessionId is ready
  const {
    messages,
    places: chatPlaces,
    isLoading,
    provider,
    model,
    sendMessage,
  } = useChat({ sessionId, userLocation });

  const {
    places: mapPlaces,
    setPlaces: setMapPlaces,
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
  } = useMap();

  const { status, refreshStatus } = useSettings({ sessionId });

  // Show location dialog on first load if no location
  useEffect(() => {
    if (!hasPromptedLocation && locationStatus === 'prompt') {
      // Use queueMicrotask to defer setState and avoid cascading renders
      queueMicrotask(() => {
        setShowLocationDialog(true);
        setHasPromptedLocation(true);
      });
    }
  }, [locationStatus, hasPromptedLocation]);

  // Combine places from chat and map
  const allPlaces = [...mapPlaces, ...chatPlaces.filter((p): p is ExtractedPlace & { location?: { lat: number; lng: number } } => 'location' in p)];

  // Update map places when chat places change
  useEffect(() => {
    if (chatPlaces.length > 0) {
      setMapPlaces(chatPlaces as (Place | ExtractedPlace)[]);
    }
  }, [chatPlaces, setMapPlaces]);

  // Selected place for details dialog
  const [detailsPlace, setDetailsPlace] = useState<Place | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Directions panel state
  const [showDirections, setShowDirections] = useState(false);

  // Handle place click
  const handlePlaceClick = useCallback((place: ExtractedPlace | Place) => {
    setSelectedPlace(place);
    
    // If it's a full Place object, show details dialog
    if ('placeId' in place && place.placeId) {
      setDetailsPlace(place as Place);
      setShowDetails(true);
    }
  }, [setSelectedPlace]);

  // Handle directions click
  const handleDirectionsClick = useCallback(async (place: ExtractedPlace | Place) => {
    if ('location' in place && place.location) {
      // Use user's actual location if available, otherwise prompt
      if (userLocation) {
        const origin = { lat: userLocation.lat, lng: userLocation.lng };
        const destination = { lat: place.location.lat, lng: place.location.lng };
        
        await getDirections(origin, destination, 'driving', place.name);
        setShowDirections(true);
      } else {
        // No user location - prompt user to set location first
        setShowLocationDialog(true);
      }
    }
  }, [getDirections, userLocation, setShowLocationDialog]);

  // Handle settings change
  const handleSettingsChange = useCallback(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Handle location dialog allow
  const handleAllowLocation = useCallback(async () => {
    return await requestPermission();
  }, [requestPermission]);

  // Show loading state until session is ready (prevents hydration mismatch)
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <MainLayout
      sessionId={sessionId}
      ollamaAvailable={status?.ollama?.available ?? false}
      geminiAvailable={status?.gemini?.hasApiKey ?? false}
      currentProvider={provider || undefined}
      currentModel={model || undefined}
      onSettingsChange={handleSettingsChange}
      userLocation={userLocation}
      onRequestLocation={() => setShowLocationDialog(true)}
    >
      {/* Chat Panel - Left Side */}
      <div className="w-full md:w-[400px] lg:w-[450px] h-[50vh] md:h-[calc(100vh-112px)] border-r flex flex-col">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onPlaceClick={handlePlaceClick}
        />
      </div>

      {/* Map & Directions - Right Side */}
      <div className="flex-1 flex flex-col md:flex-row h-[50vh] md:h-[calc(100vh-112px)]">
        {/* Map View */}
        <div className="flex-1 relative">
          <MapView
            places={allPlaces}
            selectedPlace={selectedPlace}
            onPlaceSelect={handlePlaceClick}
            onDirectionsClick={handleDirectionsClick}
            userLocation={userLocation}
            directionsPolyline={directionsPolyline}
          />
        </div>

        {/* Directions Panel - Overlay on mobile, side panel on desktop */}
        {showDirections && directions && (
          <div className="absolute md:relative top-0 right-0 w-full md:w-80 z-10 p-4 md:p-0">
            <DirectionsPanel
              origin={directionsOrigin || undefined}
              destination={directionsDestination || undefined}
              routes={directions}
              googleMapsUrl={googleMapsUrl || undefined}
              isLoading={directionsLoading}
              onClose={() => {
                setShowDirections(false);
                clearDirections();
              }}
            />
          </div>
        )}
      </div>

      {/* Place Details Dialog */}
      <PlaceDetailsDialog
        place={detailsPlace}
        open={showDetails}
        onOpenChange={setShowDetails}
        onDirectionsClick={(place) => {
          setShowDetails(false);
          handleDirectionsClick(place);
        }}
      />

      {/* Location Permission Dialog */}
      <LocationDialog
        open={showLocationDialog}
        onOpenChange={setShowLocationDialog}
        status={locationStatus}
        error={locationError}
        onAllowLocation={handleAllowLocation}
        onSetLocation={setLocation}
        onSetLocationFromCity={setLocationFromCity}
      />
    </MainLayout>
  );
}
