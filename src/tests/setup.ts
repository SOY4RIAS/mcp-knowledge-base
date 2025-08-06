import { beforeAll, afterAll } from "bun:test";
import { config } from "@/config";

// Global test setup
beforeAll(() => {
  console.log("🧪 Setting up test environment...");

  // Set test environment variables
  process.env.NODE_ENV = "test";
  process.env.TEST_MODE = "true";

  // Override configuration for testing
  if (process.env.TEST_MODE === "true") {
    // Use test-specific configurations
    process.env.WEAVIATE_URL =
      process.env.TEST_WEAVIATE_URL || "http://localhost:8080";
    process.env.REDIS_URL =
      process.env.TEST_REDIS_URL || "redis://localhost:6379";
    process.env.JWT_SECRET =
      process.env.TEST_JWT_SECRET ||
      "test-jwt-secret-that-is-long-enough-for-testing";
  }
});

// Global test teardown
afterAll(() => {
  console.log("🧹 Cleaning up test environment...");

  // Clean up any global resources
  // This is where you would clean up databases, connections, etc.
});

// Export test utilities
export const testUtils = {
  // Generate test data
  generateTestDocument: (overrides = {}) => ({
    title: "Test Document",
    content: "This is a test document for unit testing.",
    metadata: {
      source: "test",
      type: "txt" as any,
      author: "Test Author",
      tags: ["test", "unit"],
      language: "en",
      size: 50,
      mime_type: "text/plain",
      custom_fields: {},
    },
    ...overrides,
  }),

  // Generate test embedding
  generateTestEmbedding: (dimensions = 1536) => {
    const embedding = new Array(dimensions)
      .fill(0)
      .map(() => Math.random() - 0.5);
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    );
    return embedding.map((val) => val / magnitude);
  },

  // Wait for async operations
  wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Generate unique test ID
  generateTestId: () =>
    `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
};
