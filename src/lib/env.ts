// Environment Configuration

import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().default('file:./dev.db'),
  
  // LLM Provider
  LLM_PROVIDER: z.enum(['ollama', 'gemini']).default('ollama'),
  
  // Ollama
  OLLAMA_BASE_URL: z.string().default('http://localhost:11434'),
  OLLAMA_DEFAULT_MODEL: z.string().default('llama3.2'),
  
  // Gemini
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_DEFAULT_MODEL: z.string().default('gemini-2.0-flash-exp'),
  
  // Google Maps
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().default('60000'),
  CACHE_TTL_SECONDS: z.string().default('3600'),
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  return envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    LLM_PROVIDER: process.env.LLM_PROVIDER,
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
    OLLAMA_DEFAULT_MODEL: process.env.OLLAMA_DEFAULT_MODEL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_DEFAULT_MODEL: process.env.GEMINI_DEFAULT_MODEL,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    CACHE_TTL_SECONDS: process.env.CACHE_TTL_SECONDS,
  });
}

export const env = getEnv();
