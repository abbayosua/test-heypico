// Header Organism - App header

'use client';

import { MapPin, Navigation } from 'lucide-react';
import { SettingsSheet } from '@/components/organisms/settings-sheet';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useMounted } from '@/hooks';

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
  onSettingsChange,
  userLocation,
  onRequestLocation,
}: HeaderProps) {
  // Track if component is mounted to prevent hydration mismatch
  const mounted = useMounted();

  // Default values for SSR to prevent hydration mismatch
  const locationText = mounted
    ? (userLocation ? (userLocation.city || 'Location Set') : 'Set Location')
    : 'Set Location';

  const tooltipText = mounted
    ? (userLocation
        ? `Location: ${userLocation.city || `${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)}`}`
        : 'Click to set your location')
    : 'Click to set your location';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">Abbayosua - Heypico Test</h1>
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
                  {locationText}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {tooltipText}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Settings */}
        <SettingsSheet sessionId={sessionId} onSettingsChange={onSettingsChange} />
      </div>
    </header>
  );
}
