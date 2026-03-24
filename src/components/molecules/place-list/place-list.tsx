// Place List Molecule - List of place cards

'use client';

import { PlaceCard } from '@/components/molecules/place-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ExtractedPlace, Place } from '@/types';

interface PlaceListProps {
  places: (ExtractedPlace | Place)[];
  onPlaceClick?: (place: ExtractedPlace | Place) => void;
  onDirectionsClick?: (place: ExtractedPlace | Place) => void;
  compact?: boolean;
  maxItems?: number;
}

export function PlaceList({
  places,
  onPlaceClick,
  onDirectionsClick,
  compact = false,
  maxItems,
}: PlaceListProps) {
  const displayedPlaces = maxItems ? places.slice(0, maxItems) : places;

  if (displayedPlaces.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex flex-col gap-3 p-2">
        {displayedPlaces.map((place, index) => (
          <div
            key={`${place.name}-${index}`}
            onClick={() => onPlaceClick?.(place)}
            className="cursor-pointer"
          >
            <PlaceCard
              place={place}
              compact={compact}
              onDirectionsClick={() => onDirectionsClick?.(place)}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
