import { createClient } from "redis";
import type { RedisClientType } from "redis";
import { config } from "@/config";

/**
 * Redis Service
 * Handles caching and session management
 */
export class RedisService {
  private client: RedisClientType;
  private isConnected = false;

  constructor() {
    const clientConfig: any = {
      url: config.redis.url,
      database: config.redis.db,
      socket: {
        connectTimeout: config.redis.timeout,
      },
    };

    // Only include password if it's defined
    if (config.redis.password) {
      clientConfig.password = config.redis.password;
    }

    this.client = createClient(clientConfig);
    this.setupEventHandlers();
  }

  /**
   * Setup Redis event handlers
   */
  private setupEventHandlers(): void {
    this.client.on("connect", () => {
      console.log("Redis client connected");
      this.isConnected = true;
    });

    this.client.on("ready", () => {
      console.log("Redis client ready");
    });

    this.client.on("error", (error) => {
      console.error("Redis client error:", error);
      this.isConnected = false;
    });

    this.client.on("end", () => {
      console.log("Redis client disconnected");
      this.isConnected = false;
    });
  }

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
    } catch (error) {
      console.error("Failed to disconnect from Redis:", error);
    }
  }

  /**
   * Check if Redis is connected
   */
  isRedisConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Set a key-value pair with optional expiration
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error(`Failed to set Redis key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a value by key
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`Failed to get Redis key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error(`Failed to delete Redis key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Failed to check Redis key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set a key-value pair with JSON serialization
   */
  async setJson(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, jsonValue);
      } else {
        await this.client.set(key, jsonValue);
      }
    } catch (error) {
      console.error(`Failed to set JSON Redis key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a JSON value by key
   */
  async getJson<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Failed to get JSON Redis key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set a hash field
   */
  async hSet(key: string, field: string, value: string): Promise<number> {
    try {
      return await this.client.hSet(key, field, value);
    } catch (error) {
      console.error(`Failed to set Redis hash ${key}.${field}:`, error);
      throw error;
    }
  }

  /**
   * Get a hash field
   */
  async hGet(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hGet(key, field);
    } catch (error) {
      console.error(`Failed to get Redis hash ${key}.${field}:`, error);
      throw error;
    }
  }

  /**
   * Get all hash fields
   */
  async hGetAll(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hGetAll(key);
    } catch (error) {
      console.error(`Failed to get all Redis hash fields for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Increment a counter
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error(`Failed to increment Redis key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Increment a counter by a specific amount
   */
  async incrBy(key: string, amount: number): Promise<number> {
    try {
      return await this.client.incrBy(key, amount);
    } catch (error) {
      console.error(
        `Failed to increment Redis key ${key} by ${amount}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Set expiration for a key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      console.error(`Failed to set expiration for Redis key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get time to live for a key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`Failed to get TTL for Redis key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Flush all keys (use with caution)
   */
  async flushAll(): Promise<void> {
    try {
      await this.client.flushAll();
    } catch (error) {
      console.error("Failed to flush Redis database:", error);
      throw error;
    }
  }

  /**
   * Get Redis info
   */
  async info(): Promise<string> {
    try {
      return await this.client.info();
    } catch (error) {
      console.error("Failed to get Redis info:", error);
      throw error;
    }
  }

  /**
   * Ping Redis server
   */
  async ping(): Promise<string> {
    try {
      return await this.client.ping();
    } catch (error) {
      console.error("Failed to ping Redis:", error);
      throw error;
    }
  }
}
