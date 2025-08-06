import { testUtils } from "../setup";

// Mock Weaviate client
export const mockWeaviateClient = {
  data: {
    creator: () => ({
      withClassName: () => ({
        withProperties: () => ({
          withVector: () => ({
            withId: () => ({
              do: () => Promise.resolve({ id: testUtils.generateTestId() }),
            }),
          }),
        }),
      }),
    }),
    getterById: () => ({
      withClassName: () => ({
        withId: (id: string) => ({
          do: () => {
            // Return null for non-existent documents
            if (id === "non-existent-id") {
              return Promise.resolve(null);
            }
            return Promise.resolve({
              id: testUtils.generateTestId(),
              properties: {
                title: "Test Document",
                content: "Test content",
                metadata: testUtils.generateTestDocument().metadata,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            });
          },
        }),
      }),
    }),
    updater: () => ({
      withClassName: () => ({
        withId: () => ({
          withProperties: () => ({
            do: () => Promise.resolve(),
          }),
        }),
      }),
    }),
    deleter: () => ({
      withClassName: () => ({
        withId: () => ({
          do: () => Promise.resolve(),
        }),
      }),
    }),
  },
  graphql: {
    get: () => ({
      withClassName: () => ({
        withFields: () => ({
          withLimit: () => ({
            withOffset: () => ({
              do: () =>
                Promise.resolve({
                  data: {
                    Get: {
                      Documents: [
                        {
                          _additional: { id: testUtils.generateTestId() },
                          title: "Test Document",
                          content: "Test content",
                          metadata: testUtils.generateTestDocument().metadata,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                        },
                      ],
                    },
                  },
                }),
            }),
          }),
        }),
      }),
    }),
  },
  misc: {
    metaGetter: () => ({
      do: () => Promise.resolve({ version: "1.0.0" }),
    }),
  },
};

// Mock Redis client
export const mockRedisClient = {
  connect: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  set: () => Promise.resolve("OK"),
  get: () => Promise.resolve("test-value"),
  setEx: () => Promise.resolve("OK"),
  del: () => Promise.resolve(1),
  exists: () => Promise.resolve(1),
  hSet: () => Promise.resolve(1),
  hGet: () => Promise.resolve("test-value"),
  hGetAll: () => Promise.resolve({ key: "value" }),
  incr: () => Promise.resolve(1),
  incrBy: () => Promise.resolve(5),
  expire: () => Promise.resolve(true),
  ttl: () => Promise.resolve(3600),
  flushAll: () => Promise.resolve("OK"),
  info: () => Promise.resolve("redis_version:6.0.0"),
  ping: () => Promise.resolve("PONG"),
  on: () => {},
};

// Mock AI SDK
export const mockAISDK = {
  embed: () =>
    Promise.resolve({
      embedding: testUtils.generateTestEmbedding(),
    }),
  embedMany: () =>
    Promise.resolve({
      embeddings: [testUtils.generateTestEmbedding()],
    }),
};

// Mock embedding service
export const mockEmbeddingService = {
  generateEmbedding: (text: string) => {
    if (!text || !text.trim()) {
      throw new Error("Text cannot be empty");
    }
    return Promise.resolve(testUtils.generateTestEmbedding());
  },
  generateEmbeddings: (texts: string[]) => {
    const validTexts = texts.filter((text) => text && text.trim());
    if (validTexts.length === 0) {
      throw new Error("No valid texts provided");
    }
    return Promise.resolve(
      validTexts.map(() => testUtils.generateTestEmbedding())
    );
  },
  validateEmbeddingDimensions: (embedding: number[]) => {
    return embedding && Array.isArray(embedding) && embedding.length === 1536;
  },
  testConnection: () => Promise.resolve(true),
};

// Mock Hono app
export const mockHonoApp = {
  get: () => ({
    json: (data: any) => ({ data }),
  }),
  post: () => ({
    json: (data: any) => ({ data }),
  }),
  route: () => ({}),
  onError: () => ({}),
  fetch: () => Promise.resolve(new Response(JSON.stringify({ success: true }))),
};
