// Place Details Dialog Organism - Detailed place information with mobile bottom sheet

'use client';

import { useState } from 'react';
import { MapPin, Star, Phone, Globe, Clock, Navigation, ExternalLink, X, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Separator } from '@/components/atoms/separator';
import type { Place } from '@/types';

interface PlaceDetailsDialogProps {
  place: Place | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDirectionsClick?: (place: Place) => void;
}

export function PlaceDetailsDialog({
  place,
  open,
  onOpenChange,
  onDirectionsClick,
}: PlaceDetailsDialogProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!place || !open) return null;

  const handleDirections = () => {
    onDirectionsClick?.(place);
    onOpenChange(false);
    setIsExpanded(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setIsExpanded(false);
  };

  return (
    <>
      {/* Mobile: Bottom Sheet */}
      {/* Collapsed Bar */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50 cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center justify-between p-3 gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="bg-primary/10 p-2 rounded-full shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{place.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {place.rating && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    {place.rating.toFixed(1)}
                  </span>
                )}
                {place.types?.[0] && (
                  <span className="capitalize">{place.types[0].replace(/_/g, ' ')}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                handleDirections();
              }}
            >
              <Navigation className="h-4 w-4 mr-1" />
              Go
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Drag indicator */}
        <div className="flex justify-center pb-2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
      </div>

      {/* Expanded Bottom Sheet */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Sheet */}
          <div 
            className="md:hidden fixed inset-x-0 bottom-0 bg-background rounded-t-2xl shadow-2xl z-50 max-h-[70vh] flex flex-col overflow-hidden"
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
            <div className="p-4 pb-2 shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{place.name}</h3>
                  {place.rating && (
                    <Badge variant="secondary" className="mt-1">
                      <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                      {place.rating.toFixed(1)}
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-start gap-1 mt-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{place.formattedAddress || place.address}</span>
              </div>
            </div>

            {/* Types */}
            {place.types && place.types.length > 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1 shrink-0">
                {place.types.slice(0, 3).map((type) => (
                  <Badge key={type} variant="outline" className="capitalize text-xs">
                    {type.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            )}

            {/* Contact Info */}
            <div className="px-4 py-2 space-y-1.5 text-sm shrink-0">
              {place.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <a
                    href={`tel:${place.phoneNumber}`}
                    className="hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {place.phoneNumber}
                  </a>
                </div>
              )}

              {place.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {new URL(place.website).hostname}
                  </a>
                </div>
              )}

              {place.openingHours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className={place.openingHours.isOpen ? 'text-green-600' : 'text-red-600'}>
                    {place.openingHours.isOpen ? 'Open now' : 'Closed'}
                  </span>
                </div>
              )}
            </div>

            <Separator className="shrink-0" />

            {/* Actions */}
            <div className="p-3 flex gap-2 shrink-0">
              <Button
                className="flex-1"
                onClick={handleDirections}
              >
                <Navigation className="h-4 w-4 mr-1" />
                Directions
              </Button>
              {place.googleMapsUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(place.googleMapsUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Maps
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Desktop: Floating Card */}
      <div className="hidden md:block fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
        <div className="bg-background border rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-4 pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">{place.name}</h3>
                {place.rating && (
                  <Badge variant="secondary" className="mt-1">
                    <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                    {place.rating.toFixed(1)}
                  </Badge>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            
            <div className="flex items-start gap-1 mt-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{place.formattedAddress || place.address}</span>
            </div>
          </div>

          {/* Types */}
          {place.types && place.types.length > 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1">
              {place.types.slice(0, 3).map((type) => (
                <Badge key={type} variant="outline" className="capitalize text-xs">
                  {type.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          )}

          {/* Contact Info */}
          <div className="px-4 py-2 space-y-1.5 text-sm">
            {place.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <a
                  href={`tel:${place.phoneNumber}`}
                  className="hover:underline truncate"
                >
                  {place.phoneNumber}
                </a>
              </div>
            )}

            {place.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline truncate"
                >
                  {new URL(place.website).hostname}
                </a>
              </div>
            )}

            {place.openingHours && (
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className={place.openingHours.isOpen ? 'text-green-600' : 'text-red-600'}>
                  {place.openingHours.isOpen ? 'Open now' : 'Closed'}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="p-3 flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={handleDirections}
            >
              <Navigation className="h-4 w-4 mr-1" />
              Directions
            </Button>
            {place.googleMapsUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(place.googleMapsUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
