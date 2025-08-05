import { z } from "zod";
import { config as dotenvConfig } from "dotenv";

// Load environment variables
dotenvConfig();

// Configuration schemas
const WeaviateConfigSchema = z.object({
  url: z.string().url().default("http://localhost:8080"),
  apiKey: z.string().optional(),
  collectionName: z.string().default("documents"),
  timeout: z.number().default(30000),
  retries: z.number().default(3),
});

const EmbeddingConfigSchema = z.object({
  provider: z.enum(["openai", "local", "custom"]).default("openai"),
  model: z.string().default("text-embedding-ada-002"),
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  dimensions: z.number().default(1536),
  timeout: z.number().default(30000),
  retries: z.number().default(3),
});

const ServerConfigSchema = z.object({
  port: z.number().default(3000),
  host: z.string().default("0.0.0.0"),
  environment: z
    .enum(["development", "production", "test"])
    .default("development"),
  cors: z.object({
    origin: z.string().default("*"),
    credentials: z.boolean().default(true),
  }),
});

const AuthConfigSchema = z.object({
  jwtSecret: z.string().min(32, "JWT secret must be at least 32 characters"),
  jwtExpiresIn: z.string().default("24h"),
  rateLimitWindowMs: z.number().default(900000), // 15 minutes
  rateLimitMaxRequests: z.number().default(100),
});

const RedisConfigSchema = z.object({
  url: z.string().default("redis://localhost:6379"),
  password: z.string().optional(),
  db: z.number().default(0),
  timeout: z.number().default(5000),
});

const SelfIndexingConfigSchema = z.object({
  enabled: z.boolean().default(true),
  developmentCollectionName: z.string().default("development_docs"),
  autoIndexInterval: z.number().default(3600000), // 1 hour in milliseconds
});

const ConfigSchema = z.object({
  weaviate: WeaviateConfigSchema,
  embeddings: EmbeddingConfigSchema,
  server: ServerConfigSchema,
  auth: AuthConfigSchema,
  redis: RedisConfigSchema,
  selfIndexing: SelfIndexingConfigSchema,
});

// Configuration types
export type WeaviateConfig = z.infer<typeof WeaviateConfigSchema>;
export type EmbeddingConfig = z.infer<typeof EmbeddingConfigSchema>;
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type AuthConfig = z.infer<typeof AuthConfigSchema>;
export type RedisConfig = z.infer<typeof RedisConfigSchema>;
export type SelfIndexingConfig = z.infer<typeof SelfIndexingConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;

// Load and validate configuration
const loadConfig = (): Config => {
  const configData = {
    weaviate: {
      url: process.env.WEAVIATE_URL,
      apiKey: process.env.WEAVIATE_API_KEY,
      collectionName: process.env.WEAVIATE_COLLECTION_NAME,
      timeout: process.env.WEAVIATE_TIMEOUT
        ? parseInt(process.env.WEAVIATE_TIMEOUT)
        : undefined,
      retries: process.env.WEAVIATE_RETRIES
        ? parseInt(process.env.WEAVIATE_RETRIES)
        : undefined,
    },
    embeddings: {
      provider: process.env.AI_SDK_PROVIDER,
      model: process.env.EMBEDDING_MODEL,
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.LOCAL_LLM_BASE_URL,
      dimensions: process.env.EMBEDDING_DIMENSIONS
        ? parseInt(process.env.EMBEDDING_DIMENSIONS)
        : undefined,
      timeout: process.env.EMBEDDING_TIMEOUT
        ? parseInt(process.env.EMBEDDING_TIMEOUT)
        : undefined,
      retries: process.env.EMBEDDING_RETRIES
        ? parseInt(process.env.EMBEDDING_RETRIES)
        : undefined,
    },
    server: {
      port: process.env.PORT ? parseInt(process.env.PORT) : undefined,
      host: process.env.HOST,
      environment: process.env.NODE_ENV,
      cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: process.env.CORS_CREDENTIALS === "true",
      },
    },
    auth: {
      jwtSecret: process.env.JWT_SECRET,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN,
      rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS
        ? parseInt(process.env.RATE_LIMIT_WINDOW_MS)
        : undefined,
      rateLimitMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS
        ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)
        : undefined,
    },
    redis: {
      url: process.env.REDIS_URL,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : undefined,
      timeout: process.env.REDIS_TIMEOUT
        ? parseInt(process.env.REDIS_TIMEOUT)
        : undefined,
    },
    selfIndexing: {
      enabled: process.env.ENABLE_SELF_INDEXING === "true",
      developmentCollectionName: process.env.DEVELOPMENT_COLLECTION_NAME,
      autoIndexInterval: process.env.AUTO_INDEX_INTERVAL
        ? parseInt(process.env.AUTO_INDEX_INTERVAL)
        : undefined,
    },
  };

  try {
    return ConfigSchema.parse(configData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Configuration validation failed:");
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join(".")}: ${err.message}`);
      });
    }
    throw new Error("Invalid configuration");
  }
};

// Export validated configuration
export const config = loadConfig();

// Export individual configs for convenience
export const weaviateConfig = config.weaviate;
export const embeddingConfig = config.embeddings;
export const serverConfig = config.server;
export const authConfig = config.auth;
export const redisConfig = config.redis;
export const selfIndexingConfig = config.selfIndexing;
