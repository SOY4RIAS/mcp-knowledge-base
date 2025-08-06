import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { testUtils } from "../setup";
import { testMCPRequests } from "../fixtures/test-data";

describe("MCP Protocol E2E Tests", () => {
  let baseUrl: string;

  beforeAll(async () => {
    // In a real E2E test, this would start the actual server
    baseUrl = process.env.TEST_SERVER_URL || "http://localhost:3000";

    // Wait for server to be ready
    await testUtils.wait(2000);
  });

  afterAll(async () => {
    // Cleanup any test data
  });

  describe("MCP Protocol Compliance", () => {
    it("should implement required MCP tool endpoints", async () => {
      const requiredEndpoints = [
        "/mcp/tools/knowledge_base_add",
        "/mcp/tools/knowledge_base_search",
        "/mcp/tools/knowledge_base_stats",
        "/mcp/tools/development_info_search",
      ];

      for (const endpoint of requiredEndpoints) {
        const res = await fetch(`${baseUrl}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        // Should not return 404 (endpoint exists)
        expect(res.status).not.toBe(404);
      }
    });

    it("should return proper MCP tool schema", async () => {
      const res = await fetch(`${baseUrl}/mcp/tools`);
      const tools = await res.json();

      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBeGreaterThan(0);

      // Check for required tool properties
      const tool = tools[0];
      expect(tool).toHaveProperty("name");
      expect(tool).toHaveProperty("description");
      expect(tool).toHaveProperty("inputSchema");
    });
  });

  describe("Complete Document Lifecycle", () => {
    it("should handle full document lifecycle: add, search, update, delete", async () => {
      // Step 1: Add a document
      const addRequest = {
        ...testMCPRequests.addDocument,
        title: `E2E Test Document ${Date.now()}`,
      };

      const addRes = await fetch(`${baseUrl}/mcp/tools/knowledge_base_add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addRequest),
      });

      expect(addRes.status).toBe(200);
      const addResult = await addRes.json();
      expect(addResult.success).toBe(true);
      expect(addResult.document).toBeDefined();
      expect(addResult.document.id).toBeDefined();

      const documentId = addResult.document.id;

      // Step 2: Search for the document
      const searchRequest = {
        query: addRequest.title,
        limit: 5,
        similarity_threshold: 0.7,
      };

      const searchRes = await fetch(
        `${baseUrl}/mcp/tools/knowledge_base_search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchRequest),
        }
      );

      expect(searchRes.status).toBe(200);
      const searchResult = await searchRes.json();
      expect(searchResult.success).toBe(true);
      expect(searchResult.results).toBeInstanceOf(Array);
      expect(searchResult.results.length).toBeGreaterThan(0);

      // Verify the document is found
      const foundDocument = searchResult.results.find(
        (doc: any) => doc.id === documentId
      );
      expect(foundDocument).toBeDefined();
      expect(foundDocument.title).toBe(addRequest.title);

      // Step 3: Get statistics
      const statsRes = await fetch(
        `${baseUrl}/mcp/tools/knowledge_base_stats`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      expect(statsRes.status).toBe(200);
      const statsResult = await statsRes.json();
      expect(statsResult.success).toBe(true);
      expect(statsResult.stats.totalDocuments).toBeGreaterThan(0);
    }, 30000); // 30 second timeout for E2E test
  });

  describe("Search Functionality", () => {
    it("should perform semantic search with different query types", async () => {
      const searchQueries = [
        "test document",
        "MCP protocol",
        "knowledge base",
        "vector search",
      ];

      for (const query of searchQueries) {
        const searchRequest = {
          query,
          limit: 3,
          similarity_threshold: 0.5,
        };

        const res = await fetch(`${baseUrl}/mcp/tools/knowledge_base_search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchRequest),
        });

        expect(res.status).toBe(200);
        const result = await res.json();
        expect(result.success).toBe(true);
        expect(result.results).toBeInstanceOf(Array);
        expect(result.query).toBe(query);
      }
    });

    it("should handle search with filters and metadata", async () => {
      const searchRequest = {
        query: "documentation",
        limit: 5,
        similarity_threshold: 0.6,
        filters: {
          tags: ["documentation"],
          type: "documentation",
        },
        include_metadata: true,
      };

      const res = await fetch(`${baseUrl}/mcp/tools/knowledge_base_search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchRequest),
      });

      expect(res.status).toBe(200);
      const result = await res.json();
      expect(result.success).toBe(true);
      expect(result.results).toBeInstanceOf(Array);

      // Check that results have metadata
      result.results.forEach((doc: any) => {
        expect(doc.metadata).toBeDefined();
        expect(doc.metadata.tags).toBeDefined();
      });
    });
  });

  describe("Development Info Search", () => {
    it("should search development documentation", async () => {
      const devSearchRequest = {
        query: "architecture",
        context: "development",
        limit: 3,
      };

      const res = await fetch(`${baseUrl}/mcp/tools/development_info_search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(devSearchRequest),
      });

      expect(res.status).toBe(200);
      const result = await res.json();
      expect(result.success).toBe(true);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.context).toBe(devSearchRequest.context);
    });

    it("should filter development results by context", async () => {
      const devSearchRequest = {
        query: "testing",
        context: "testing",
        limit: 5,
      };

      const res = await fetch(`${baseUrl}/mcp/tools/development_info_search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(devSearchRequest),
      });

      expect(res.status).toBe(200);
      const result = await res.json();
      expect(result.success).toBe(true);
      expect(result.results).toBeInstanceOf(Array);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle malformed requests gracefully", async () => {
      const malformedRequests = [
        { title: "", content: "" }, // Empty fields
        { title: "Test" }, // Missing required fields
        null, // Null request
        {}, // Empty object
      ];

      for (const request of malformedRequests) {
        const res = await fetch(`${baseUrl}/mcp/tools/knowledge_base_add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        // Should return 400 for malformed requests
        expect(res.status).toBe(400);
      }
    });

    it("should handle large requests", async () => {
      const largeContent = "This is a large document. ".repeat(1000);
      const largeRequest = {
        title: "Large Document Test",
        content: largeContent,
        metadata: {
          source: "e2e-test",
          type: "txt",
          size: largeContent.length,
        },
      };

      const res = await fetch(`${baseUrl}/mcp/tools/knowledge_base_add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(largeRequest),
      });

      // Should handle large content (either success or appropriate error)
      expect([200, 400, 413]).toContain(res.status);
    });

    it("should handle concurrent requests", async () => {
      const concurrentRequests = Array.from({ length: 5 }, (_, i) => ({
        title: `Concurrent Test ${i}`,
        content: `Content for concurrent test ${i}`,
        metadata: {
          source: "e2e-test",
          type: "txt",
        },
      }));

      const promises = concurrentRequests.map((request) =>
        fetch(`${baseUrl}/mcp/tools/knowledge_base_add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        })
      );

      const responses = await Promise.all(promises);

      // All requests should complete (not necessarily all successful)
      responses.forEach((res) => {
        expect([200, 400, 429]).toContain(res.status);
      });
    });
  });

  describe("Performance and Scalability", () => {
    it("should handle multiple search requests efficiently", async () => {
      const searchRequests = Array.from({ length: 10 }, (_, i) => ({
        query: `search query ${i}`,
        limit: 5,
        similarity_threshold: 0.7,
      }));

      const startTime = Date.now();

      const promises = searchRequests.map((request) =>
        fetch(`${baseUrl}/mcp/tools/knowledge_base_search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        })
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All requests should complete
      responses.forEach((res) => {
        expect([200, 400, 429]).toContain(res.status);
      });

      // Should complete within reasonable time (adjust based on expectations)
      expect(totalTime).toBeLessThan(10000); // 10 seconds
    }, 15000);

    it("should maintain response consistency", async () => {
      const searchRequest = {
        query: "test",
        limit: 5,
        similarity_threshold: 0.7,
      };

      // Make multiple identical requests
      const responses = await Promise.all(
        Array.from({ length: 3 }, () =>
          fetch(`${baseUrl}/mcp/tools/knowledge_base_search`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(searchRequest),
          })
        )
      );

      const results = await Promise.all(responses.map((res) => res.json()));

      // All responses should be successful
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });

      // Results should be consistent (same structure, reasonable count)
      results.forEach((result) => {
        expect(result).toHaveProperty("results");
        expect(result).toHaveProperty("total");
        expect(Array.isArray(result.results)).toBe(true);
      });
    });
  });
});
