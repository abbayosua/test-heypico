// Status Indicator Molecule - Show provider status

'use client';

import { Badge } from '@/components/atoms/badge';
import { Check, X, AlertCircle } from '@/components/atoms/icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/atoms/tooltip';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: 'connected' | 'disconnected' | 'error' | 'loading';
  label: string;
  tooltip?: string;
}

const statusConfig = {
  connected: {
    color: 'bg-green-500',
    icon: Check,
    text: 'Connected',
  },
  disconnected: {
    color: 'bg-gray-400',
    icon: X,
    text: 'Disconnected',
  },
  error: {
    color: 'bg-red-500',
    icon: AlertCircle,
    text: 'Error',
  },
  loading: {
    color: 'bg-yellow-500',
    icon: null,
    text: 'Loading...',
  },
};

export function StatusIndicator({
  status,
  label,
  tooltip,
}: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn('flex items-center gap-1.5 cursor-default')}
          >
            <span className={cn('h-2 w-2 rounded-full', config.color)} />
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip || config.text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
