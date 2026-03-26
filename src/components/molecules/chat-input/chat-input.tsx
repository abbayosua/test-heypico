// Chat Input Molecule - Input area for sending messages

'use client';

import { useState, useCallback } from 'react';
import { Send, Loader2, MapPin, AlertCircle } from '@/components/atoms/icon';
import { Button } from '@/components/atoms/button';
import { Textarea } from '@/components/atoms/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  hasLocation?: boolean;
  onRequestLocation?: () => void;
}

export function ChatInput({
  onSend,
  isLoading = false,
  placeholder = 'Ask about places to visit, eat, explore...',
  disabled = false,
  hasLocation = true,
  onRequestLocation,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');

  const handleSubmit = useCallback(() => {
    if (message.trim() && !isLoading && !disabled) {
      if (!hasLocation) {
        // Show warning dialog
        setPendingMessage(message.trim());
        setShowLocationWarning(true);
      } else {
        onSend(message.trim());
        setMessage('');
      }
    }
  }, [message, isLoading, disabled, hasLocation, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleProceedWithoutLocation = useCallback(() => {
    if (pendingMessage) {
      onSend(pendingMessage);
      setMessage('');
      setPendingMessage('');
    }
    setShowLocationWarning(false);
  }, [pendingMessage, onSend]);

  const handleSetLocation = useCallback(() => {
    setShowLocationWarning(false);
    setPendingMessage('');
    onRequestLocation?.();
  }, [onRequestLocation]);

  return (
    <>
      <div className="flex flex-col gap-2 p-4 border-t bg-background">
        {/* Location Warning Banner */}
        {!hasLocation && (
          <Alert className="py-2 px-3">
            <MapPin className="h-4 w-4" />
            <AlertDescription className="text-xs flex items-center justify-between w-full">
              <span>No location set. Search will use map center.</span>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-primary"
                onClick={onRequestLocation}
              >
                Set location
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Input Area */}
        <div className="flex items-end gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasLocation ? placeholder : 'Set location first for better results...'}
            disabled={disabled || isLoading}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading || disabled}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Location Warning Dialog */}
      <AlertDialog open={showLocationWarning} onOpenChange={setShowLocationWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              No Location Set
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You haven&apos;t set your location yet. Without a location, the search will use the
                current map center as the reference point.
              </p>
              <p className="text-sm text-muted-foreground">
                For better results, we recommend setting your location first.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSetLocation}
              className="bg-primary text-primary-foreground"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Set Location
            </AlertDialogAction>
            <AlertDialogAction
              onClick={handleProceedWithoutLocation}
              className="bg-secondary text-secondary-foreground"
            >
              Proceed Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
