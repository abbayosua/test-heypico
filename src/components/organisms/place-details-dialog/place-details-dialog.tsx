// Place Details Dialog Organism - Detailed place information

'use client';

import { MapPin, Star, Phone, Globe, Clock, Navigation, ExternalLink, X } from '@/components/atoms/icon';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Separator } from '@/components/atoms/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  if (!place) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-start justify-between gap-2">
            {place.name}
            {place.rating && (
              <Badge variant="secondary" className="shrink-0">
                <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                {place.rating.toFixed(1)}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="flex items-start gap-1">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
            {place.formattedAddress || place.address}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Types */}
          {place.types && place.types.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {place.types.slice(0, 5).map((type) => (
                <Badge key={type} variant="outline" className="capitalize text-xs">
                  {type.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-2">
            {place.phoneNumber && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${place.phoneNumber}`}
                  className="hover:underline"
                >
                  {place.phoneNumber}
                </a>
              </div>
            )}

            {place.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline truncate"
                >
                  {place.website}
                </a>
              </div>
            )}

            {place.openingHours && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className={place.openingHours.isOpen ? 'text-green-600' : 'text-red-600'}>
                  {place.openingHours.isOpen ? 'Open now' : 'Closed'}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => {
                onDirectionsClick?.(place);
                onOpenChange(false);
              }}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
            {place.googleMapsUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(place.googleMapsUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
