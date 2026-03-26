// Location Dialog Component - Request location permission with city fallback

'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Search, X, Loader2 } from 'lucide-react';
import type { UserLocation, LocationStatus } from '@/hooks/use-location';

interface CityPrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: LocationStatus;
  error: string | null;
  onAllowLocation: () => Promise<void>;
  onSetLocation: (location: UserLocation) => void;
  onSetLocationFromCity: (city: string) => Promise<boolean>;
}

export function LocationDialog({
  open,
  onOpenChange,
  status,
  error,
  onAllowLocation,
  onSetLocation,
  onSetLocationFromCity,
}: LocationDialogProps) {
  const [cityInput, setCityInput] = useState('');
  const [predictions, setPredictions] = useState<CityPrediction[]>([]);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [isSettingCity, setIsSettingCity] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch city predictions
  useEffect(() => {
    if (!cityInput.trim() || cityInput.length < 2) {
      setPredictions([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Debounce the search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoadingPredictions(true);
      try {
        const response = await fetch(
          `/api/geocode?query=${encodeURIComponent(cityInput)}`,
          { signal: abortControllerRef.current?.signal }
        );
        if (response.ok) {
          const data = await response.json();
          setPredictions(data.predictions || []);
        }
      } catch (err) {
        if (!(err instanceof Error && err.name === 'AbortError')) {
          console.error('Failed to fetch predictions:', err);
        }
      } finally {
        setIsLoadingPredictions(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cityInput]);

  // Handle city selection
  const handleSelectCity = async (prediction: CityPrediction) => {
    setIsSettingCity(true);
    setCityInput(prediction.description);
    setPredictions([]);

    const success = await onSetLocationFromCity(prediction.description);
    setIsSettingCity(false);

    if (success) {
      onOpenChange(false);
    }
  };

  // Handle manual city input
  const handleManualSubmit = async () => {
    if (!cityInput.trim()) return;
    setIsSettingCity(true);
    const success = await onSetLocationFromCity(cityInput);
    setIsSettingCity(false);
    if (success) {
      onOpenChange(false);
    }
  };

  const isLoading = status === 'loading' || isSettingCity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Set Your Location
          </DialogTitle>
          <DialogDescription>
            We use your location to find places near you. Your location is only used locally and never shared.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Allow Location Button */}
          {status !== 'denied' && (
            <Button
              onClick={onAllowLocation}
              disabled={isLoading}
              className="w-full"
              variant="default"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Allow Location Access
                </>
              )}
            </Button>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or enter your city
              </span>
            </div>
          </div>

          {/* City Input with Autocomplete */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Search for a city..."
                className="pl-9 pr-9"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && cityInput.trim()) {
                    handleManualSubmit();
                  }
                }}
              />
              {cityInput && (
                <button
                  onClick={() => {
                    setCityInput('');
                    setPredictions([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {/* Predictions Dropdown */}
            {predictions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                {predictions.map((pred) => (
                  <button
                    key={pred.placeId}
                    onClick={() => handleSelectCity(pred)}
                    className="w-full px-3 py-2 text-left hover:bg-accent transition-colors"
                    disabled={isLoading}
                  >
                    <div className="font-medium">{pred.mainText}</div>
                    {pred.secondaryText && (
                      <div className="text-sm text-muted-foreground">
                        {pred.secondaryText}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Loading indicator for predictions */}
            {isLoadingPredictions && (
              <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Searching...</span>
                </div>
              </div>
            )}
          </div>

          {/* Skip Button */}
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
