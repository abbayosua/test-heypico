// Place Card Molecule - Display place information

'use client';

import { MapPin, Star, ExternalLink, Navigation } from '@/components/atoms/icon';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent } from '@/components/atoms/card';
import type { ExtractedPlace, Place } from '@/types';

interface PlaceCardProps {
  place: ExtractedPlace | Place;
  onDirectionsClick?: () => void;
  onViewOnMapClick?: () => void;
  compact?: boolean;
}

function isPlaceWithLocation(place: ExtractedPlace | Place): place is Place {
  return 'location' in place && typeof place.location === 'object';
}

export function PlaceCard({
  place,
  onDirectionsClick,
  onViewOnMapClick,
  compact = false,
}: PlaceCardProps) {
  const rating = 'rating' in place ? place.rating : undefined;
  const address = place.address || '';
  const type = 'type' in place ? place.type : place.types?.[0];
  const googleMapsUrl = 'googleMapsUrl' in place ? place.googleMapsUrl : undefined;

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{place.name}</h4>
              {address && (
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {address}
                </p>
              )}
            </div>
            {rating && (
              <Badge variant="secondary" className="shrink-0">
                <Star className="h-3 w-3 mr-1" />
                {rating.toFixed(1)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{place.name}</h4>
              {address && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{address}</span>
                </p>
              )}
            </div>
            {rating && (
              <Badge variant="secondary" className="shrink-0">
                <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                {rating.toFixed(1)}
              </Badge>
            )}
          </div>

          {/* Type Badge */}
          {type && (
            <Badge variant="outline" className="capitalize">
              {type.replace(/_/g, ' ')}
            </Badge>
          )}

          {/* Description */}
          {place.description && (
            <p className="text-sm text-muted-foreground">
              {place.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {onDirectionsClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDirectionsClick}
                className="flex-1"
              >
                <Navigation className="h-4 w-4 mr-1" />
                Directions
              </Button>
            )}
            {(googleMapsUrl || onViewOnMapClick) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onViewOnMapClick) {
                    onViewOnMapClick();
                  } else if (googleMapsUrl) {
                    window.open(googleMapsUrl, '_blank');
                  }
                }}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Map
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
