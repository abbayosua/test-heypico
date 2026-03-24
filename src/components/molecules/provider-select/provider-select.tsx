// Provider Select Molecule - LLM Provider selection

'use client';

import { Label } from '@/components/atoms/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { Badge } from '@/components/atoms/badge';
import { Check, X } from '@/components/atoms/icon';
import type { LLMProviderType } from '@/types';

interface ProviderSelectProps {
  value: LLMProviderType;
  onChange: (value: LLMProviderType) => void;
  ollamaAvailable?: boolean;
  geminiAvailable?: boolean;
  disabled?: boolean;
}

export function ProviderSelect({
  value,
  onChange,
  ollamaAvailable = false,
  geminiAvailable = false,
  disabled = false,
}: ProviderSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="provider-select">LLM Provider</Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as LLMProviderType)}
        disabled={disabled}
      >
        <SelectTrigger id="provider-select">
          <SelectValue placeholder="Select provider" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ollama">
            <div className="flex items-center justify-between w-full gap-2">
              <span>Ollama (Local)</span>
              {ollamaAvailable ? (
                <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  Available
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-2 text-red-600 border-red-600">
                  <X className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
          </SelectItem>
          <SelectItem value="gemini">
            <div className="flex items-center justify-between w-full gap-2">
              <span>Gemini (Cloud)</span>
              {geminiAvailable ? (
                <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-2 text-yellow-600 border-yellow-600">
                  API Key Needed
                </Badge>
              )}
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
