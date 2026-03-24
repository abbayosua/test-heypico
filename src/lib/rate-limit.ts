// Rate Limiting Utility

import { db } from './db';
import { RATE_LIMIT } from '@/constants';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const defaultConfig: RateLimitConfig = {
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || String(RATE_LIMIT.MAX_REQUESTS), 10),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || String(RATE_LIMIT.WINDOW_MS), 10),
};

// In-memory rate limiting for fast checks (fallback if DB is slow)
const memoryStore = new Map<string, { count: number; resetTime: number }>();

// Clean up memory store periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (now > value.resetTime) {
      memoryStore.delete(key);
    }
  }
}, 60000); // Clean every minute

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

// Check rate limit for a session
export async function checkRateLimit(
  sessionId: string,
  apiType: string,
  config: RateLimitConfig = defaultConfig
): Promise<RateLimitResult> {
  const key = `${sessionId}:${apiType}`;
  const now = Date.now();
  const resetTime = now + config.windowMs;

  // Check memory store first
  const memoryEntry = memoryStore.get(key);
  
  if (memoryEntry && now < memoryEntry.resetTime) {
    if (memoryEntry.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(memoryEntry.resetTime),
        retryAfter: Math.ceil((memoryEntry.resetTime - now) / 1000),
      };
    }

    // Increment and allow
    memoryEntry.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - memoryEntry.count,
      resetTime: new Date(memoryEntry.resetTime),
    };
  }

  // Create new entry
  memoryStore.set(key, { count: 1, resetTime });
  
  return {
    allowed: true,
    remaining: config.maxRequests - 1,
    resetTime: new Date(resetTime),
  };
}

// Log API usage
export async function logApiUsage(
  apiType: string,
  provider?: string,
  sessionId?: string,
  costUnits: number = 1
): Promise<void> {
  try {
    await db.apiUsageLog.create({
      data: {
        apiType,
        provider,
        sessionId,
        costUnits,
      },
    });
  } catch (error) {
    console.error('Failed to log API usage:', error);
  }
}

// Get usage statistics for a session
export async function getSessionUsage(
  sessionId: string,
  hours: number = 24
): Promise<Record<string, number>> {
  try {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const logs = await db.apiUsageLog.groupBy({
      by: ['apiType'],
      where: {
        sessionId,
        createdAt: {
          gte: since,
        },
      },
      _sum: {
        costUnits: true,
      },
    });

    const usage: Record<string, number> = {};
    for (const log of logs) {
      usage[log.apiType] = log._sum.costUnits || 0;
    }

    return usage;
  } catch (error) {
    console.error('Failed to get session usage:', error);
    return {};
  }
}
