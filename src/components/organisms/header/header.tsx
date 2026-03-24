// Header Organism - App header

'use client';

import { MapPin, Menu } from '@/components/atoms/icon';
import { Button } from '@/components/atoms/button';
import { StatusIndicator } from '@/components/molecules/status-indicator';
import { SettingsSheet } from '@/components/organisms/settings-sheet';

interface HeaderProps {
  sessionId: string;
  ollamaAvailable?: boolean;
  geminiAvailable?: boolean;
  onSettingsChange?: () => void;
}

export function Header({
  sessionId,
  ollamaAvailable = false,
  geminiAvailable = false,
  onSettingsChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">AI Map Assistant</h1>
        </div>

        {/* Status Indicators */}
        <div className="ml-4 hidden sm:flex items-center gap-2">
          <StatusIndicator
            status={ollamaAvailable ? 'connected' : 'disconnected'}
            label="Ollama"
          />
          <StatusIndicator
            status={geminiAvailable ? 'connected' : 'disconnected'}
            label="Gemini"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Settings */}
        <SettingsSheet sessionId={sessionId} onSettingsChange={onSettingsChange} />
      </div>
    </header>
  );
}
