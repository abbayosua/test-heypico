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
import { useMounted } from '@/hooks';
import type { ExtractedPlace, Place } from '@/types';

// Generate a session ID (in production, this would come from auth)
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Session ID storage - module level to prevent hydration mismatch
const SESSION_STORAGE_KEY = 'map-assistant-session-id';
let sessionIdState: string | null = null;
let sessionIdInitialized = false;
const sessionIdListeners = new Set<() => void>();

function subscribeToSessionId(callback: () => void) {
  sessionIdListeners.add(callback);
  return () => sessionIdListeners.delete(callback);
}

function getSessionIdSnapshot(): string {
  // Return empty string during SSR and initial hydration
  if (typeof window === 'undefined') return '';

  // Initialize once after hydration
  if (!sessionIdInitialized) {
    sessionIdInitialized = true;
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        sessionIdState = stored;
      } else {
        sessionIdState = generateSessionId();
        // Queue saving to localStorage after current render
        queueMicrotask(() => {
          localStorage.setItem(SESSION_STORAGE_KEY, sessionIdState!);
          sessionIdListeners.forEach((cb) => cb());
        });
      }
    } catch {
      sessionIdState = generateSessionId();
    }
  }

  return sessionIdState || '';
}

function getServerSessionIdSnapshot(): string {
  return '';
}

export default function Home() {
  // Session ID - use useSyncExternalStore for localStorage
  const sessionId = useSyncExternalStore(
    subscribeToSessionId,
    getSessionIdSnapshot,
    getServerSessionIdSnapshot
  );
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

  // Track if mounted on client (for client-only UI)
  const mounted = useMounted();

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
    lastPlaceGroup,
    sendMessage,
  } = useChat({ sessionId, userLocation });

  const {
    places: mapPlaces,
    placeGroups,
    activeGroupId,
    addPlaceGroup,
    setActiveGroup,
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

  // Show location dialog on first load if no location (only after mount)
  useEffect(() => {
    if (!mounted) return;
    if (!hasPromptedLocation && locationStatus === 'prompt') {
      // Defer setState to avoid cascading renders
      const timer = setTimeout(() => {
        setShowLocationDialog(true);
        setHasPromptedLocation(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [mounted, locationStatus, hasPromptedLocation]);

  // Add places to map when chat returns new places
  useEffect(() => {
    if (lastPlaceGroup && chatPlaces.length > 0) {
      addPlaceGroup(lastPlaceGroup.query, chatPlaces);
    }
  }, [lastPlaceGroup, chatPlaces, addPlaceGroup]);

  // Selected place for details dialog
  const [detailsPlace, setDetailsPlace] = useState<Place | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Directions panel state
  const [showDirections, setShowDirections] = useState(false);

  // Handle place click - with optional group activation
  const handlePlaceClick = useCallback((place: ExtractedPlace | Place, groupId?: string) => {
    setSelectedPlace(place);

    // If groupId provided, activate that group
    if (groupId) {
      setActiveGroup(groupId);
    }

    // If it's a full Place object, show details dialog
    if ('placeId' in place && place.placeId) {
      setDetailsPlace(place as Place);
      setShowDetails(true);
    }
  }, [setSelectedPlace, setActiveGroup]);

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
  }, [getDirections, userLocation]);

  // Handle settings change
  const handleSettingsChange = useCallback(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Handle location dialog allow
  const handleAllowLocation = useCallback(async () => {
    return await requestPermission();
  }, [requestPermission]);

  // Handle send message wrapper
  const handleSendMessage = useCallback(async (message: string) => {
    await sendMessage(message);
  }, [sendMessage]);

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
          onSendMessage={handleSendMessage}
          onPlaceClick={handlePlaceClick}
          userLocation={userLocation}
          onRequestLocation={() => setShowLocationDialog(true)}
        />
      </div>

      {/* Map & Directions - Right Side */}
      <div className="flex-1 flex flex-col md:flex-row h-[50vh] md:h-[calc(100vh-112px)]">
        {/* Map View */}
        <div className="flex-1 relative h-full min-h-0">
          <MapView
            places={mapPlaces}
            placeGroups={placeGroups}
            activeGroupId={activeGroupId}
            selectedPlace={selectedPlace}
            onPlaceSelect={handlePlaceClick}
            userLocation={userLocation}
            directionsPolyline={directionsPolyline}
          />
        </div>

        {/* Directions Panel - Overlay on mobile, side panel on desktop */}
        {showDirections && directions && (
          <div className="absolute md:relative top-0 right-0 w-full md:w-80 h-full z-10 p-4 md:p-0 flex flex-col">
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
