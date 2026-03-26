// Header Organism - App header

'use client';

import { MapPin, Navigation } from 'lucide-react';
import { StatusIndicator } from '@/components/molecules/status-indicator';
import { SettingsSheet } from '@/components/organisms/settings-sheet';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
}

interface HeaderProps {
  sessionId: string;
  ollamaAvailable?: boolean;
  geminiAvailable?: boolean;
  onSettingsChange?: () => void;
  userLocation?: UserLocation | null;
  onRequestLocation?: () => void;
}

export function Header({
  sessionId,
  ollamaAvailable = false,
  geminiAvailable = false,
  onSettingsChange,
  userLocation,
  onRequestLocation,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">AI Map Assistant</h1>
        </div>

        {/* Status Indicators */}
        <div className="ml-4 hidden sm:flex items-center gap-2">
          <StatusIndicator
            status={ollamaAvailable ? 'connected' : 'disconnected'}
            label="Ollama"
          />
          <StatusIndicator
            status={geminiAvailable ? 'connected' : 'disconnected'}
            label="Gemini"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Location Indicator */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="mr-2 gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={onRequestLocation}
              >
                <Navigation className="h-4 w-4" />
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {userLocation ? (userLocation.city || 'Location Set') : 'Set Location'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {userLocation
                ? `Location: ${userLocation.city || `${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)}`}`
                : 'Click to set your location'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Settings */}
        <SettingsSheet sessionId={sessionId} onSettingsChange={onSettingsChange} />
      </div>
    </header>
  );
}
