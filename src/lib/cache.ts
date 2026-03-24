// Search Cache Utility

import { db } from './db';
import { CACHE_TTL_SECONDS } from '@/constants';
import crypto from 'crypto';

interface CacheEntry<T> {
  data: T;
  expiresAt: Date;
}

// Generate a hash for the query
function generateQueryHash(query: string, provider?: string): string {
  const input = provider ? `${provider}:${query}` : query;
  return crypto.createHash('sha256').update(input).digest('hex');
}

// Get cached result
export async function getCachedResult<T>(
  query: string,
  provider?: string
): Promise<T | null> {
  try {
    const queryHash = generateQueryHash(query, provider);
    
    const cached = await db.searchCache.findUnique({
      where: { queryHash },
    });

    if (!cached) {
      return null;
    }

    // Check if expired
    if (new Date() > cached.expiresAt) {
      await db.searchCache.delete({
        where: { queryHash },
      });
      return null;
    }

    return JSON.parse(cached.places) as T;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

// Set cached result
export async function setCachedResult<T>(
  query: string,
  data: T,
  response: string,
  provider: string,
  ttlSeconds: number = CACHE_TTL_SECONDS
): Promise<void> {
  try {
    const queryHash = generateQueryHash(query, provider);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await db.searchCache.upsert({
      where: { queryHash },
      update: {
        query,
        response,
        places: JSON.stringify(data),
        provider,
        expiresAt,
      },
      create: {
        queryHash,
        query,
        response,
        places: JSON.stringify(data),
        provider,
        expiresAt,
      },
    });
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

// Clear expired cache entries
export async function clearExpiredCache(): Promise<number> {
  try {
    const result = await db.searchCache.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  } catch (error) {
    console.error('Cache clear error:', error);
    return 0;
  }
}

// Clear all cache
export async function clearAllCache(): Promise<void> {
  try {
    await db.searchCache.deleteMany({});
  } catch (error) {
    console.error('Cache clear all error:', error);
  }
}
