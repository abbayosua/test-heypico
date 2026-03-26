// Place Details Dialog Organism - Detailed place information panel

'use client';

import { MapPin, Star, Phone, Globe, Clock, Navigation, ExternalLink, X } from 'lucide-react';
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
  if (!place || !open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
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
              onClick={() => onOpenChange(false)}
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
            onClick={() => {
              onDirectionsClick?.(place);
              onOpenChange(false);
            }}
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
  );
}
