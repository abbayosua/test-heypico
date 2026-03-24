// Footer Organism - App footer

'use client';

import { Sparkles, MapPin } from '@/components/atoms/icon';

interface FooterProps {
  provider?: string;
  model?: string;
}

export function Footer({ provider, model }: FooterProps) {
  return (
    <footer className="sticky bottom-0 z-40 w-full border-t bg-background py-3 px-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Sparkles className="h-4 w-4" />
          <span>Powered by {provider || 'Ollama'}</span>
          {model && <span className="text-xs">({model})</span>}
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>Google Maps</span>
        </div>
      </div>
    </footer>
  );
}
