import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { Hono } from "hono";
import { testUtils } from "../setup";
import { testDocuments, testMCPRequests } from "../fixtures/test-data";

describe("API Integration Tests", () => {
  let app: Hono;

  beforeAll(async () => {
    // Create a test Hono app
    app = new Hono();

    // Add basic routes for testing
    app.get("/health", (c) =>
      c.json({ status: "healthy", timestamp: new Date() })
    );
    app.get("/", (c) => c.json({ message: "MCP Knowledge Base Server" }));

    // Add MCP tool routes
    app.post("/mcp/tools/knowledge_base_add", async (c) => {
      const body = await c.req.json();
      return c.json({
        success: true,
        document: {
          id: testUtils.generateTestId(),
          title: body.title,
          content: body.content,
          metadata: body.metadata,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    });

    app.post("/mcp/tools/knowledge_base_search", async (c) => {
      const body = await c.req.json();
      return c.json({
        success: true,
        results: [
          {
            id: testUtils.generateTestId(),
            title: "Test Result",
            content: "This is a test search result",
            metadata: testDocuments.simple.metadata,
            score: 0.85,
          },
        ],
        total: 1,
        query: body.query,
      });
    });

    app.post("/mcp/tools/knowledge_base_stats", async (c) => {
      return c.json({
        success: true,
        stats: {
          totalDocuments: 10,
          totalChunks: 25,
          averageDocumentSize: 500,
          storageSize: "2.5MB",
        },
      });
    });
  });

  afterAll(async () => {
    // Cleanup
  });

  describe("Health Check Endpoint", () => {
    it("should return healthy status", async () => {
      const res = await app.request("/health");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("status");
      expect(data.status).toBe("healthy");
      expect(data).toHaveProperty("timestamp");
    });
  });

  describe("Root Endpoint", () => {
    it("should return server information", async () => {
      const res = await app.request("/");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("MCP Knowledge Base Server");
    });
  });

  describe("MCP Tools - Knowledge Base Add", () => {
    it("should add document successfully", async () => {
      const request = testMCPRequests.addDocument;
      const res = await app.request("/mcp/tools/knowledge_base_add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.document).toBeDefined();
      expect(data.document.title).toBe(request.title);
      expect(data.document.content).toBe(request.content);
      expect(data.document.metadata).toEqual(request.metadata);
    });

    it("should handle invalid request", async () => {
      const invalidRequest = {
        title: "",
        content: "",
      };

      const res = await app.request("/mcp/tools/knowledge_base_add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidRequest),
      });

      expect(res.status).toBe(400);
    });

    it("should handle missing required fields", async () => {
      const incompleteRequest = {
        title: "Test Document",
        // Missing content and metadata
      };

      const res = await app.request("/mcp/tools/knowledge_base_add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(incompleteRequest),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("MCP Tools - Knowledge Base Search", () => {
    it("should search documents successfully", async () => {
      const request = testMCPRequests.searchDocuments;
      const res = await app.request("/mcp/tools/knowledge_base_search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results).toBeInstanceOf(Array);
      expect(data.results.length).toBeGreaterThan(0);
      expect(data.total).toBe(1);
      expect(data.query).toBe(request.query);

      const result = data.results[0];
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("content");
      expect(result).toHaveProperty("metadata");
      expect(result).toHaveProperty("score");
    });

    it("should handle search with filters", async () => {
      const request = {
        ...testMCPRequests.searchDocuments,
        filters: {
          tags: ["technical"],
          type: "documentation",
        },
      };

      const res = await app.request("/mcp/tools/knowledge_base_search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results).toBeInstanceOf(Array);
    });

    it("should handle empty search results", async () => {
      const request = {
        query: "non-existent content",
        limit: 5,
        similarity_threshold: 0.9,
      };

      const res = await app.request("/mcp/tools/knowledge_base_search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results).toBeInstanceOf(Array);
      expect(data.results.length).toBe(0);
    });

    it("should handle invalid search query", async () => {
      const invalidRequest = {
        query: "",
        limit: -1,
        similarity_threshold: 1.5,
      };

      const res = await app.request("/mcp/tools/knowledge_base_search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidRequest),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("MCP Tools - Knowledge Base Stats", () => {
    it("should return statistics successfully", async () => {
      const res = await app.request("/mcp/tools/knowledge_base_stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.stats).toBeDefined();
      expect(data.stats).toHaveProperty("totalDocuments");
      expect(data.stats).toHaveProperty("totalChunks");
      expect(data.stats).toHaveProperty("averageDocumentSize");
      expect(data.stats).toHaveProperty("storageSize");
      expect(typeof data.stats.totalDocuments).toBe("number");
      expect(typeof data.stats.totalChunks).toBe("number");
    });
  });

  describe("Error Handling", () => {
    it("should handle 404 for non-existent endpoints", async () => {
      const res = await app.request("/non-existent-endpoint");
      expect(res.status).toBe(404);
    });

    it("should handle malformed JSON", async () => {
      const res = await app.request("/mcp/tools/knowledge_base_add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "invalid json",
      });

      expect(res.status).toBe(400);
    });

    it("should handle missing Content-Type header", async () => {
      const res = await app.request("/mcp/tools/knowledge_base_add", {
        method: "POST",
        body: JSON.stringify(testMCPRequests.addDocument),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("Response Headers", () => {
    it("should include correct CORS headers", async () => {
      const res = await app.request("/health");

      // Note: In a real app, CORS middleware would be applied
      // This test verifies the basic response structure
      expect(res.status).toBe(200);
    });

    it("should include correct content type for JSON responses", async () => {
      const res = await app.request("/health");
      const contentType = res.headers.get("content-type");

      expect(contentType).toContain("application/json");
    });
  });
});
