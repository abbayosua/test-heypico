// useMounted Hook - Track if component is mounted on client

'use client';

import { useSyncExternalStore } from 'react';

// Mounted state storage
let mounted = false;
const listeners = new Set<() => void>();

// Subscribe to mounted state changes
function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Client snapshot - returns current mounted state
// This starts as false on first render, matching the server
function getClientSnapshot(): boolean {
  return mounted;
}

// Server snapshot - always returns false
function getServerSnapshot(): boolean {
  return false;
}

// Set mounted to true and notify all listeners
function markAsMounted() {
  if (!mounted) {
    mounted = true;
    listeners.forEach((callback) => callback());
  }
}

/**
 * Hook to check if the component is mounted on the client.
 *
 * Returns false on server and during initial hydration render.
 * Returns true after hydration completes.
 *
 * IMPORTANT: This hook requires the MountedProvider or a useEffect
 * somewhere in the component tree to trigger the mounted state change.
 */
export function useMounted(): boolean {
  // Schedule the mounted state change after the first render
  // Using queueMicrotask ensures this runs after the current render
  // but before paint, so the transition is smooth
  if (typeof window !== 'undefined' && !mounted) {
    queueMicrotask(markAsMounted);
  }

  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
