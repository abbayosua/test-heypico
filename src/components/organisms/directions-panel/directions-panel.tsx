// Directions Panel Organism - Display directions with mobile bottom sheet support

'use client';

import { useState } from 'react';
import { Navigation, ChevronDown, ChevronUp, ExternalLink, X } from '@/components/atoms/icon';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { Badge } from '@/components/atoms/badge';
import { Separator } from '@/components/atoms/separator';
import { Spinner } from '@/components/atoms/spinner';
import type { DirectionsRoute } from '@/types';

interface DirectionsPanelProps {
  origin?: string;
  destination?: string;
  routes?: DirectionsRoute[];
  googleMapsUrl?: string;
  isLoading?: boolean;
  onClose?: () => void;
}

export function DirectionsPanel({
  origin,
  destination,
  routes,
  googleMapsUrl,
  isLoading = false,
  onClose,
}: DirectionsPanelProps) {
  const [expandedRoute, setExpandedRoute] = useState<number | null>(0);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <Card className="w-full h-full flex items-center justify-center rounded-none md:rounded-lg">
        <CardContent className="flex items-center justify-center p-8">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (!routes || routes.length === 0) {
    return null;
  }

  const firstRoute = routes[0];

  return (
    <>
      {/* Mobile: Collapsed Bar - shows summary at bottom */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50 cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Navigation className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{firstRoute.distance || ''}</p>
              <p className="text-xs text-muted-foreground">{firstRoute.duration || ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {googleMapsUrl && (
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(googleMapsUrl, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Maps
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Drag indicator */}
        <div className="flex justify-center pb-2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
      </div>

      {/* Mobile: Expanded Bottom Sheet */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Sheet */}
          <div 
            className="md:hidden fixed inset-x-0 bottom-0 bg-background rounded-t-2xl shadow-2xl z-50 max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div 
              className="flex justify-center pt-2 cursor-pointer"
              onClick={() => setIsExpanded(false)}
            >
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                <span className="font-semibold">Directions</span>
              </div>
              <div className="flex items-center gap-1">
                {googleMapsUrl && (
                  <Button 
                    size="sm"
                    onClick={() => window.open(googleMapsUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open in Maps
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Origin & Destination */}
            <div className="px-4 pb-3 shrink-0">
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
                  <span className="truncate">{destination || 'Destination'}</span>
                </div>
              </div>
            </div>

            <Separator className="shrink-0" />

            {/* Scrollable Routes */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="divide-y">
                {routes.map((route, index) => (
                  <div key={`route-mobile-${index}`}>
                    <button
                      className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedRoute(expandedRoute === index ? null : index)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{route.summary || 'Route'}</p>
                          <p className="text-sm text-muted-foreground">
                            {route.distance || ''} {route.duration ? `• ${route.duration}` : ''}
                          </p>
                        </div>
                        {expandedRoute === index ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {expandedRoute === index && route.steps && route.steps.length > 0 && (
                      <div className="px-4 pb-4">
                        <ol className="space-y-2">
                          {route.steps.map((step, stepIndex) => (
                            <li key={`step-mobile-${index}-${stepIndex}`} className="flex gap-3 text-sm">
                              <span className="text-muted-foreground shrink-0">
                                {stepIndex + 1}.
                              </span>
                              <div>
                                <p>{step.instructions || ''}</p>
                                <p className="text-muted-foreground text-xs">
                                  {step.distance || ''} {step.duration ? `• ${step.duration}` : ''}
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
            </div>
          </div>
        </>
      )}

      {/* Desktop: Side Panel */}
      <Card className="hidden md:flex w-full h-full flex-col overflow-hidden">
        <CardHeader className="pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Directions
            </CardTitle>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

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
              <span className="truncate">{destination || 'Destination'}</span>
            </div>
          </div>
        </CardHeader>

        <Separator className="shrink-0" />

        <CardContent className="flex-1 overflow-y-auto p-0 min-h-0">
          <div className="divide-y">
            {routes.map((route, index) => (
              <div key={`route-desktop-${index}`}>
                <button
                  className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedRoute(expandedRoute === index ? null : index)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{route.summary || 'Route'}</p>
                      <p className="text-sm text-muted-foreground">
                        {route.distance || ''} {route.duration ? `• ${route.duration}` : ''}
                      </p>
                    </div>
                    {expandedRoute === index ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {expandedRoute === index && route.steps && route.steps.length > 0 && (
                  <div className="px-4 pb-4">
                    <ol className="space-y-2">
                      {route.steps.map((step, stepIndex) => (
                        <li key={`step-desktop-${index}-${stepIndex}`} className="flex gap-3 text-sm">
                          <span className="text-muted-foreground shrink-0">
                            {stepIndex + 1}.
                          </span>
                          <div>
                            <p>{step.instructions || ''}</p>
                            <p className="text-muted-foreground text-xs">
                              {step.distance || ''} {step.duration ? `• ${step.duration}` : ''}
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
        </CardContent>

        {googleMapsUrl && (
          <div className="shrink-0 p-4 border-t">
            <Button
              className="w-full"
              onClick={() => window.open(googleMapsUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Google Maps
            </Button>
          </div>
        )}
      </Card>
    </>
  );
}
