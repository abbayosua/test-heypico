// Home Page - AI Map Assistant

'use client';

import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/templates';
import { ChatPanel } from '@/components/organisms/chat-panel';
import { MapView } from '@/components/organisms/map-view';
import { DirectionsPanel } from '@/components/organisms/directions-panel';
import { PlaceDetailsDialog } from '@/components/organisms/place-details-dialog';
import { useChat } from '@/hooks/use-chat';
import { useMap } from '@/hooks/use-map';
import { useSettings } from '@/hooks/use-settings';
import type { ExtractedPlace, Place } from '@/types';

// Generate a session ID (in production, this would come from auth)
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function Home() {
  // Session ID (persisted in localStorage)
  const [sessionId, setSessionId] = useState<string>('');
  
  useEffect(() => {
    const stored = localStorage.getItem('map-assistant-session-id');
    if (stored) {
      setSessionId(stored);
    } else {
      const newId = generateSessionId();
      localStorage.setItem('map-assistant-session-id', newId);
      setSessionId(newId);
    }
  }, []);

  // Hooks
  const {
    messages,
    places: chatPlaces,
    isLoading,
    provider,
    model,
    sendMessage,
    clearChat,
    setMessages,
  } = useChat({ sessionId });

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
    getDirections,
    clearDirections,
  } = useMap();

  const {
    status,
    refreshStatus,
  } = useSettings({ sessionId });

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
      // For now, use a placeholder origin (user's location would be ideal)
      // In production, you'd use the user's current location
      const origin = 'Current location';
      const destination = place.address || `${place.location.lat},${place.location.lng}`;
      
      await getDirections(origin, destination);
      setShowDirections(true);
    }
  }, [getDirections]);

  // Handle settings change
  const handleSettingsChange = useCallback(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Don't render until session is ready
  if (!sessionId) {
    return null;
  }

  return (
    <MainLayout
      sessionId={sessionId}
      ollamaAvailable={status?.ollama?.available ?? false}
      geminiAvailable={status?.gemini?.hasApiKey ?? false}
      currentProvider={provider || undefined}
      currentModel={model || undefined}
      onSettingsChange={handleSettingsChange}
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
    </MainLayout>
  );
}
