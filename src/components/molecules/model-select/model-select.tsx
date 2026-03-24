// Model Select Molecule - Model selection for LLM

'use client';

import { Label } from '@/components/atoms/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { Spinner } from '@/components/atoms/spinner';
import type { LLMModel } from '@/types';

interface ModelSelectProps {
  value: string | null;
  onChange: (value: string) => void;
  models: LLMModel[];
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ModelSelect({
  value,
  onChange,
  models,
  placeholder = 'Select model',
  disabled = false,
  isLoading = false,
}: ModelSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="model-select">Model</Label>
      <Select
        value={value || undefined}
        onValueChange={onChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id="model-select">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span>Loading models...</span>
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
