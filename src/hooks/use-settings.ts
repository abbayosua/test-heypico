// useSettings Hook - Settings state management

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { LLMProviderType, LLMModel, ProviderStatus } from '@/types';

interface UseSettingsOptions {
  sessionId: string;
}

interface UseSettingsReturn {
  provider: LLMProviderType;
  setProvider: (provider: LLMProviderType) => void;
  ollamaModel: string | null;
  setOllamaModel: (model: string | null) => void;
  geminiModel: string | null;
  setGeminiModel: (model: string | null) => void;
  geminiApiKey: string | null;
  setGeminiApiKey: (key: string | null) => void;
  ollamaModels: LLMModel[];
  geminiModels: LLMModel[];
  status: ProviderStatus | null;
  isLoading: boolean;
  error: string | null;
  saveSettings: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  refreshModels: () => Promise<void>;
}

export function useSettings({ sessionId }: UseSettingsOptions): UseSettingsReturn {
  const [provider, setProvider] = useState<LLMProviderType>('ollama');
  const [ollamaModel, setOllamaModel] = useState<string | null>(null);
  const [geminiModel, setGeminiModel] = useState<string | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [ollamaModels, setOllamaModels] = useState<LLMModel[]>([]);
  const [geminiModels, setGeminiModels] = useState<LLMModel[]>([]);
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial settings
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const [settingsRes, statusRes, modelsRes] = await Promise.all([
          fetch(`/api/settings?sessionId=${sessionId}`),
          fetch('/api/status'),
          fetch('/api/models'),
        ]);

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setProvider(data.llmProvider || 'ollama');
          setOllamaModel(data.ollamaModel);
          setGeminiModel(data.geminiModel);
          setGeminiApiKey(data.geminiApiKey);
        }

        if (statusRes.ok) {
          const data = await statusRes.json();
          setStatus({
            ollama: { available: data.llm?.ollama?.available || false, models: [] },
            gemini: { available: data.llm?.gemini?.available || false, hasApiKey: data.llm?.gemini?.hasApiKey || false, models: [] },
          });
        }

        if (modelsRes.ok) {
          const data = await modelsRes.json();
          setOllamaModels(data.ollama?.models || []);
          setGeminiModels(data.gemini?.models || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [sessionId]);

  const saveSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        sessionId,
        llmProvider: provider,
      };

      if (provider === 'ollama' && ollamaModel) {
        body.ollamaModel = ollamaModel;
      }
      if (provider === 'gemini') {
        if (geminiModel) body.geminiModel = geminiModel;
        if (geminiApiKey) body.geminiApiKey = geminiApiKey;
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, provider, ollamaModel, geminiModel, geminiApiKey]);

  const refreshStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setStatus({
          ollama: { available: data.llm?.ollama?.available || false, models: [] },
          gemini: { available: data.llm?.gemini?.available || false, hasApiKey: data.llm?.gemini?.hasApiKey || false, models: [] },
        });
      }
    } catch (err) {
      console.error('Failed to refresh status:', err);
    }
  }, []);

  const refreshModels = useCallback(async () => {
    try {
      const response = await fetch('/api/models');
      if (response.ok) {
        const data = await response.json();
        setOllamaModels(data.ollama?.models || []);
        setGeminiModels(data.gemini?.models || []);
      }
    } catch (err) {
      console.error('Failed to refresh models:', err);
    }
  }, []);

  return {
    provider,
    setProvider,
    ollamaModel,
    setOllamaModel,
    geminiModel,
    setGeminiModel,
    geminiApiKey,
    setGeminiApiKey,
    ollamaModels,
    geminiModels,
    status,
    isLoading,
    error,
    saveSettings,
    refreshStatus,
    refreshModels,
  };
}
