// API Key Input Molecule - For Gemini API key

'use client';

import { useState } from 'react';
import { Eye, EyeOff, Check, X } from '@/components/atoms/icon';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Button } from '@/components/atoms/button';
import { cn } from '@/lib/utils';

interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => void;
  hasExistingKey?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ApiKeyInput({
  value,
  onChange,
  onSave,
  hasExistingKey = false,
  disabled = false,
  className,
}: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false);
  const [isEditing, setIsEditing] = useState(!hasExistingKey);

  const handleSave = () => {
    if (value.trim()) {
      onSave?.(value.trim());
      setIsEditing(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setIsEditing(true);
  };

  if (!isEditing && hasExistingKey) {
    return (
      <div className={cn('space-y-2', className)}>
        <Label>Gemini API Key</Label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm">
            ••••••••••••••••
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={disabled}
          >
            Change
          </Button>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Check className="h-3 w-3 text-green-500" />
          API key configured
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="api-key">Gemini API Key</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id="api-key"
            type={showKey ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your Gemini API key"
            disabled={disabled}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full w-10"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {onSave && (
          <Button
            onClick={handleSave}
            disabled={!value.trim() || disabled}
          >
            Save
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Get your API key from{' '}
        <a
          href="https://makersuite.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          Google AI Studio
        </a>
      </p>
    </div>
  );
}
