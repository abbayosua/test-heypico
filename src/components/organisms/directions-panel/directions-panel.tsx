// Directions Panel Organism - Display directions

'use client';

import { useState } from 'react';
import { Navigation, ChevronDown, ChevronUp, Car, Walk, Bike, Train, ExternalLink } from '@/components/atoms/icon';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { Badge } from '@/components/atoms/badge';
import { Separator } from '@/components/atoms/separator';
import { Spinner } from '@/components/atoms/spinner';
import type { DirectionsRoute, ExtractedPlace, Place } from '@/types';

interface DirectionsPanelProps {
  origin?: string;
  destination?: string;
  routes?: DirectionsRoute[];
  googleMapsUrl?: string;
  isLoading?: boolean;
  onTravelModeChange?: (mode: 'driving' | 'walking' | 'bicycling' | 'transit') => void;
  travelMode?: 'driving' | 'walking' | 'bicycling' | 'transit';
  onClose?: () => void;
}

const travelModeIcons = {
  driving: Car,
  walking: Walk,
  bicycling: Bike,
  transit: Train,
};

export function DirectionsPanel({
  origin,
  destination,
  routes,
  googleMapsUrl,
  isLoading = false,
  onTravelModeChange,
  travelMode = 'driving',
  onClose,
}: DirectionsPanelProps) {
  const [expandedRoute, setExpandedRoute] = useState(0);
  const [selectedMode, setSelectedMode] = useState(travelMode);

  const handleModeChange = (mode: 'driving' | 'walking' | 'bicycling' | 'transit') => {
    setSelectedMode(mode);
    onTravelModeChange?.(mode);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (!routes || routes.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Directions
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        {/* Origin & Destination */}
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center rounded-full">
              A
            </Badge>
            <span className="truncate">{origin || 'Your location'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center rounded-full">
              B
            </Badge>
            <span className="truncate">{destination}</span>
          </div>
        </div>

        {/* Travel Mode Selector */}
        <div className="flex gap-1 mt-2">
          {(['driving', 'walking', 'bicycling', 'transit'] as const).map((mode) => {
            const Icon = travelModeIcons[mode];
            return (
              <Button
                key={mode}
                variant={selectedMode === mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleModeChange(mode)}
                className="flex-1"
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        {/* Routes */}
        <div className="divide-y">
          {routes.map((route, index) => (
            <div key={index}>
              <button
                className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedRoute(expandedRoute === index ? -1 : index)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{route.summary}</p>
                    <p className="text-sm text-muted-foreground">
                      {route.distance} • {route.duration}
                    </p>
                  </div>
                  {expandedRoute === index ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Steps */}
              {expandedRoute === index && route.steps && (
                <div className="px-4 pb-4">
                  <ol className="space-y-2">
                    {route.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex gap-3 text-sm">
                        <span className="text-muted-foreground shrink-0">
                          {stepIndex + 1}.
                        </span>
                        <div>
                          <p>{step.instructions}</p>
                          <p className="text-muted-foreground text-xs">
                            {step.distance} • {step.duration}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Open in Google Maps */}
        {googleMapsUrl && (
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(googleMapsUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Google Maps
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
