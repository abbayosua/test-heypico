// Main Layout Template - Main application layout

'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/organisms/header';
import { Footer } from '@/components/organisms/footer';

interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
}

interface MainLayoutProps {
  children: ReactNode;
  sessionId: string;
  ollamaAvailable?: boolean;
  geminiAvailable?: boolean;
  currentProvider?: string;
  currentModel?: string;
  onSettingsChange?: () => void;
  userLocation?: UserLocation | null;
  onRequestLocation?: () => void;
}

export function MainLayout({
  children,
  sessionId,
  ollamaAvailable = false,
  geminiAvailable = false,
  currentProvider,
  currentModel,
  onSettingsChange,
  userLocation,
  onRequestLocation,
}: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header
        sessionId={sessionId}
        ollamaAvailable={ollamaAvailable}
        geminiAvailable={geminiAvailable}
        onSettingsChange={onSettingsChange}
        userLocation={userLocation}
        onRequestLocation={onRequestLocation}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row">
        {children}
      </main>

      {/* Footer */}
      <Footer provider={currentProvider} model={currentModel} />
    </div>
  );
}
