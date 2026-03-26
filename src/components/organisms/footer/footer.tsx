// Footer Organism - App footer

'use client';

import { MapPin } from '@/components/atoms/icon';

export function Footer() {
  return (
    <footer className="sticky bottom-0 z-40 w-full border-t bg-background py-3 px-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>Created for Take Home test for HeyPico</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>Google Maps</span>
        </div>
      </div>
    </footer>
  );
}
