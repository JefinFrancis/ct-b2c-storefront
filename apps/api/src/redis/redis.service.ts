/**
 * RedisService — Environment-aware Redis wrapper for NestJS.
 * Uses ioredis for local development (REDIS_URL) and Upstash for production
 * (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).
 * Used for: CT response caching, cart session storage, token caching.
 */
import type { OnModuleDestroy } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { Redis as Upstash } from "@upstash/redis";
import IORedis from "ioredis";

type RedisClient = Upstash | IORedis;

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: RedisClient;
  private readonly useUpstash: boolean;

  constructor(private config: ConfigService) {
    const upstashUrl = this.config.get<string>("UPSTASH_REDIS_REST_URL");
    const upstashToken = this.config.get<string>("UPSTASH_REDIS_REST_TOKEN");

    // Use Upstash in production/staging, ioredis locally
    if (upstashUrl && upstashToken) {
      this.useUpstash = true;
      this.client = new Upstash({ url: upstashUrl, token: upstashToken });
      console.log("🔴 Redis: Using Upstash");
    } else {
      this.useUpstash = false;
      const redisUrl =
        this.config.get<string>("REDIS_URL") ?? "redis://localhost:6379";
      this.client = new IORedis(redisUrl);
      console.log(`🔴 Redis: Using ioredis (${redisUrl})`);
    }
  }

  async onModuleDestroy() {
    if (!this.useUpstash && this.client instanceof IORedis) {
      await this.client.quit();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.useUpstash) {
      return (this.client as Upstash).get<T>(key);
    }
    const value = await (this.client as IORedis).get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (this.useUpstash) {
      const client = this.client as Upstash;
      if (ttlSeconds) {
        await client.set(key, value, { ex: ttlSeconds });
      } else {
        await client.set(key, value);
      }
    } else {
      const client = this.client as IORedis;
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await client.setex(key, ttlSeconds, serialized);
      } else {
        await client.set(key, serialized);
      }
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }
}
