/**
 * Zod schemas for environment variable validation.
 * Use these to validate env vars at startup for fail-fast behavior.
 */
import { z } from "zod";

/** API environment variables */
export const apiEnvSchema = z.object({
  // CT credentials
  CTP_PROJECT_KEY: z.string().min(1, "CTP_PROJECT_KEY is required"),
  CTP_CLIENT_ID: z.string().min(1, "CTP_CLIENT_ID is required"),
  CTP_CLIENT_SECRET: z.string().min(1, "CTP_CLIENT_SECRET is required"),
  CTP_AUTH_URL: z.string().url("CTP_AUTH_URL must be a valid URL"),
  CTP_API_URL: z.string().url("CTP_API_URL must be a valid URL"),
  CTP_SCOPES: z.string().min(1, "CTP_SCOPES is required"),

  // Redis (one of these pairs is required)
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Server
  PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().positive())
    .default("8080"),
  ALLOWED_ORIGIN: z.string().url().default("http://localhost:3000"),

  // Auth
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters"),
});

/** Web environment variables */
export const webEnvSchema = z.object({
  // API URLs
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8080"),
  INTERNAL_API_URL: z.string().url().optional(),

  // Redis (optional in web)
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type WebEnv = z.infer<typeof webEnvSchema>;
