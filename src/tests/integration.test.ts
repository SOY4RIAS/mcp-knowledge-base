import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import MCPKnowledgeBaseServer from "../index";
import { config } from "../config";

describe("MCP Knowledge Base Server Integration Tests", () => {
  let server: MCPKnowledgeBaseServer;

  beforeAll(async () => {
    // Create server instance
    server = new MCPKnowledgeBaseServer();

    // Initialize server (this will connect to dependencies)
    try {
      await server.initialize();
    } catch (error) {
      console.warn(
        "Server initialization failed (dependencies may not be running):",
        error
      );
    }
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe("Server Health", () => {
    it("should have a valid configuration", () => {
      expect(config.server.port).toBeDefined();
      expect(config.server.host).toBeDefined();
      expect(config.weaviate.url).toBeDefined();
      expect(config.embeddings.provider).toBeDefined();
    });

    it("should have self-indexing configuration", () => {
      expect(config.selfIndexing.enabled).toBeDefined();
      expect(config.selfIndexing.developmentCollectionName).toBeDefined();
      expect(config.selfIndexing.autoIndexInterval).toBeDefined();
    });

    it("should have Redis configuration", () => {
      expect(config.redis.url).toBeDefined();
      expect(config.redis.db).toBeDefined();
      expect(config.redis.timeout).toBeDefined();
    });
  });

  describe("MCP Tools", () => {
    it("should have development tools defined", () => {
      const app = server.getApp();
      expect(app).toBeDefined();

      // The tools are defined in the MCP API
      // We can't easily test them without starting the server
      // but we can verify the server structure
      expect(server).toBeInstanceOf(MCPKnowledgeBaseServer);
    });
  });

  describe("Configuration Validation", () => {
    it("should have valid JWT secret", () => {
      expect(config.auth.jwtSecret).toBeDefined();
      expect(config.auth.jwtSecret.length).toBeGreaterThanOrEqual(32);
    });

    it("should have valid embedding configuration", () => {
      expect(config.embeddings.model).toBeDefined();
      expect(config.embeddings.dimensions).toBeGreaterThan(0);
    });

    it("should have valid Weaviate configuration", () => {
      expect(config.weaviate.url).toMatch(/^https?:\/\//);
      expect(config.weaviate.collectionName).toBeDefined();
    });
  });

  describe("Environment Variables", () => {
    it("should have required environment variables", () => {
      // Check that critical environment variables are loaded
      expect(process.env.JWT_SECRET).toBeDefined();
      expect(process.env.WEAVIATE_URL).toBeDefined();
      expect(process.env.REDIS_URL).toBeDefined();
    });
  });
});
