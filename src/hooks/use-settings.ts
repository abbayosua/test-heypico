// useSettings Hook - Settings state management

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { LLMModel, ProviderStatus } from '@/types';

interface UseSettingsOptions {
  sessionId: string;
}

interface UseSettingsReturn {
  status: ProviderStatus | null;
  isLoading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
}

export function useSettings(_options: UseSettingsOptions): UseSettingsReturn {
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setStatus({
          ollama: { 
            available: data.llm?.ollama?.available || false, 
            models: [] 
          },
          gemini: { 
            available: data.llm?.gemini?.available || false, 
            hasApiKey: data.llm?.gemini?.hasApiKey || false,
            models: [],
          },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch status on mount
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return {
    status,
    isLoading,
    error,
    refreshStatus,
  };
}
