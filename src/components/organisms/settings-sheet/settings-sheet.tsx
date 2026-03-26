// Settings Sheet Organism - Settings panel

'use client';

import { useState, useEffect } from 'react';
import { Settings, X, Check, AlertCircle } from '@/components/atoms/icon';
import { Button } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { Separator } from '@/components/atoms/separator';
import { Spinner } from '@/components/atoms/spinner';
import { ProviderSelect } from '@/components/molecules/provider-select';
import { ModelSelect } from '@/components/molecules/model-select';
import { ApiKeyInput } from '@/components/molecules/api-key-input';
import { StatusIndicator } from '@/components/molecules/status-indicator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { LLMProviderType, LLMModel } from '@/types';
import { DEFAULT_GEMINI_MODELS, DEFAULT_LLM7_MODELS } from '@/constants';

interface SettingsSheetProps {
  sessionId: string;
  onSettingsChange?: () => void;
}

interface ProviderStatus {
  ollama: { available: boolean };
  gemini: { available: boolean; hasApiKey: boolean };
  llm7: { available: boolean; hasApiKey: boolean };
}

export function SettingsSheet({ sessionId, onSettingsChange }: SettingsSheetProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Settings state - default to LLM7
  const [provider, setProvider] = useState<LLMProviderType>('llm7');
  const [ollamaModel, setOllamaModel] = useState<string | null>(null);
  const [geminiModel, setGeminiModel] = useState<string | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [llm7Model, setLlm7Model] = useState<string | null>(null);
  const [llm7ApiKey, setLlm7ApiKey] = useState('');

  // Models
  const [ollamaModels, setOllamaModels] = useState<LLMModel[]>([]);
  const [geminiModels] = useState<LLMModel[]>(DEFAULT_GEMINI_MODELS);
  const [llm7Models] = useState<LLMModel[]>(DEFAULT_LLM7_MODELS);

  // Status
  const [status, setStatus] = useState<ProviderStatus>({
    ollama: { available: false },
    gemini: { available: false, hasApiKey: false },
    llm7: { available: false, hasApiKey: false },
  });

  // Fetch settings and status on open
  useEffect(() => {
    if (open) {
      fetchSettings();
      fetchStatus();
      fetchModels();
    }
  }, [open, sessionId]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/settings?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setProvider(data.llmProvider || 'llm7');
        setOllamaModel(data.ollamaModel);
        setGeminiModel(data.geminiModel);
        setLlm7Model(data.llm7Model);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus({
          ollama: { available: data.llm?.ollama?.available || false },
          gemini: {
            available: data.llm?.gemini?.available || false,
            hasApiKey: data.llm?.gemini?.hasApiKey || false,
          },
          llm7: {
            available: data.llm?.llm7?.available || false,
            hasApiKey: data.llm?.llm7?.hasApiKey || false,
          },
        });
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models');
      if (res.ok) {
        const data = await res.json();
        setOllamaModels(data.ollama?.models || []);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
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
      if (provider === 'llm7') {
        if (llm7Model) body.llm7Model = llm7Model;
        if (llm7ApiKey) body.llm7ApiKey = llm7ApiKey;
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSettingsChange?.();
        setOpen(false);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Configure your LLM provider and preferences
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6 py-6">
            {/* Provider Status */}
            <div className="space-y-2">
              <Label>Provider Status</Label>
              <div className="flex flex-wrap gap-2">
                <StatusIndicator
                  status={status.llm7.hasApiKey ? 'connected' : 'disconnected'}
                  label="LLM7"
                  tooltip={status.llm7.hasApiKey ? 'API key configured' : 'API key required'}
                />
                <StatusIndicator
                  status={status.gemini.hasApiKey ? 'connected' : 'disconnected'}
                  label="Gemini"
                  tooltip={status.gemini.hasApiKey ? 'API key configured' : 'API key required'}
                />
                <StatusIndicator
                  status={status.ollama.available ? 'connected' : 'disconnected'}
                  label="Ollama"
                  tooltip={status.ollama.available ? 'Ollama is running' : 'Ollama is not available'}
                />
              </div>
            </div>

            <Separator />

            {/* Provider Selection */}
            <ProviderSelect
              value={provider}
              onChange={setProvider}
              ollamaAvailable={status.ollama.available}
              geminiAvailable={status.gemini.hasApiKey}
              llm7Available={status.llm7.hasApiKey}
            />

            {/* Model Selection */}
            {provider === 'ollama' && (
              <ModelSelect
                value={ollamaModel}
                onChange={setOllamaModel}
                models={ollamaModels}
                placeholder="Select Ollama model"
              />
            )}

            {provider === 'gemini' && (
              <>
                <ModelSelect
                  value={geminiModel}
                  onChange={setGeminiModel}
                  models={geminiModels}
                  placeholder="Select Gemini model"
                />
                <ApiKeyInput
                  value={geminiApiKey}
                  onChange={setGeminiApiKey}
                  hasExistingKey={status.gemini.hasApiKey}
                  provider="gemini"
                />
              </>
            )}

            {provider === 'llm7' && (
              <>
                <ModelSelect
                  value={llm7Model}
                  onChange={setLlm7Model}
                  models={llm7Models}
                  placeholder="Select LLM7 model"
                />
                <ApiKeyInput
                  value={llm7ApiKey}
                  onChange={setLlm7ApiKey}
                  hasExistingKey={status.llm7.hasApiKey}
                  provider="llm7"
                />
              </>
            )}

            <Separator />

            {/* Help Text */}
            <div className="text-sm text-muted-foreground space-y-2">
              {provider === 'ollama' && !status.ollama.available && (
                <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Ollama not detected</p>
                    <p className="mt-1">
                      Make sure Ollama is running. Install from{' '}
                      <a
                        href="https://ollama.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        ollama.com
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {provider === 'gemini' && !status.gemini.hasApiKey && (
                <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-yellow-500" />
                  <div>
                    <p className="font-medium">API Key Required</p>
                    <p className="mt-1">
                      Get your Gemini API key from{' '}
                      <a
                        href="https://makersuite.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {provider === 'llm7' && !status.llm7.hasApiKey && (
                <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-yellow-500" />
                  <div>
                    <p className="font-medium">API Key Required</p>
                    <p className="mt-1">
                      Get your free LLM7 token from{' '}
                      <a
                        href="https://token.llm7.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        token.llm7.io
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <Spinner size="sm" className="mr-2" /> : null}
              Save Settings
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
