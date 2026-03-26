// useMounted Hook - Track if component is mounted on client

'use client';

import { useRef, useSyncExternalStore } from 'react';

// Subscribe function for useSyncExternalStore (no-op since we don't need external updates)
function subscribe(callback: () => void) {
  // Subscribe to nothing, just return cleanup
  return () => {};
}

// Get snapshot for client - always returns true after initial render
function getClientSnapshot(): boolean {
  return true;
}

// Get snapshot for server - always returns false
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Hook to check if the component is mounted on the client.
 * Returns false on server and during initial hydration, true after that.
 * Use this to prevent hydration mismatches when rendering client-only content.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
