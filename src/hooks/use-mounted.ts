// useMounted Hook - Track if component is mounted on client
// Uses the standard React pattern: useState + useEffect

'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to check if the component is mounted on the client.
 * 
 * Returns false on server and during initial hydration render.
 * Returns true after hydration completes.
 * 
 * This is the standard, recommended pattern for detecting client-side mount.
 * useEffect runs AFTER hydration, so this never causes hydration mismatch.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return mounted;
}
