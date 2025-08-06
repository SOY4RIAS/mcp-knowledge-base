import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { DocumentService } from "@/services/document";
import { EmbeddingService } from "@/services/embedding";
import { WeaviateService } from "@/services/weaviate";
import { config } from "@/config";
import { testUtils } from "../setup";
import { testDocuments, testQueries } from "../fixtures/test-data";
import { mockWeaviateClient, mockEmbeddingService } from "../utils/mocks";

describe("DocumentService", () => {
  let documentService: DocumentService;
  let embeddingService: EmbeddingService;
  let weaviateService: WeaviateService;

  beforeEach(() => {
    // Use mock services instead of real ones
    embeddingService = mockEmbeddingService as any;
    weaviateService = new WeaviateService(config.weaviate);
    // Mock the Weaviate client
    (weaviateService as any).client = mockWeaviateClient;

    documentService = new DocumentService(embeddingService, weaviateService);
  });

  afterEach(() => {
    // Clean up any resources
  });

  describe("addDocument", () => {
    it("should add document successfully", async () => {
      const request = {
        title: "Test Document",
        content: "This is a test document content.",
        metadata: testDocuments.simple.metadata,
      };

      const result = await documentService.addDocument(request);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe(request.title);
      expect(result.content).toBe(request.content);
      expect(result.metadata).toEqual(request.metadata);
      expect(result.status).toBe("completed");
    });

    it("should handle document with custom fields", async () => {
      const request = {
        title: "Document with Custom Fields",
        content: "Content with custom metadata.",
        metadata: {
          ...testDocuments.simple.metadata,
          custom_fields: {
            category: "test",
            priority: "high",
            version: "1.0.0",
          },
        },
      };

      const result = await documentService.addDocument(request);

      expect(result).toBeDefined();
      expect(result.metadata.custom_fields).toEqual(
        request.metadata.custom_fields
      );
    });

    it("should handle invalid document request", async () => {
      const invalidRequest = {
        title: "",
        content: "",
        metadata: {},
      };

      // This should fail because content is empty
      await expect(
        documentService.addDocument(invalidRequest)
      ).rejects.toThrow();
    });

    it("should handle document with very long content", async () => {
      const longContent = "This is a very long document. ".repeat(1000);
      const request = {
        title: "Long Document",
        content: longContent,
        metadata: testDocuments.simple.metadata,
      };

      const result = await documentService.addDocument(request);

      expect(result).toBeDefined();
      expect(result.content).toBe(longContent);
    });
  });

  describe("getDocument", () => {
    it("should retrieve document by ID", async () => {
      const documentId = testUtils.generateTestId();
      const document = await documentService.getDocument(documentId);

      expect(document).toBeDefined();
      expect(document.id).toBeDefined();
      expect(document.title).toBe("Test Document");
      expect(document.content).toBe("Test content");
      expect(document.metadata).toBeDefined();
    });

    it("should handle non-existent document", async () => {
      const nonExistentId = "non-existent-id";

      // Mock should return null for non-existent document
      const document = await documentService.getDocument(nonExistentId);
      expect(document).toBeNull();
    });
  });

  describe("updateDocument", () => {
    it("should update document successfully", async () => {
      const documentId = testUtils.generateTestId();
      const updateData = {
        title: "Updated Title",
        content: "Updated content",
        metadata: {
          ...testDocuments.simple.metadata,
          tags: ["updated", "test"],
        },
      };

      const result = await documentService.updateDocument(
        documentId,
        updateData
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe(updateData.title);
      expect(result.content).toBe(updateData.content);
    });

    it("should handle partial updates", async () => {
      const documentId = testUtils.generateTestId();
      const partialUpdate = {
        title: "Only Title Updated",
      };

      const result = await documentService.updateDocument(
        documentId,
        partialUpdate
      );

      expect(result).toBeDefined();
      expect(result.title).toBe(partialUpdate.title);
    });

    it("should handle update with invalid data", async () => {
      const documentId = testUtils.generateTestId();
      const invalidUpdate = {
        title: "",
        content: "",
      };

      // Mock should handle invalid data gracefully
      const result = await documentService.updateDocument(
        documentId,
        invalidUpdate
      );
      expect(result).toBeDefined();
    });
  });

  describe("deleteDocument", () => {
    it("should delete document successfully", async () => {
      const documentId = testUtils.generateTestId();

      // Mock should handle deletion gracefully
      await documentService.deleteDocument(documentId);
      expect(true).toBe(true); // Just verify it doesn't throw
    });

    it("should handle deletion of non-existent document", async () => {
      const nonExistentId = "non-existent-id";

      // Mock should handle non-existent document gracefully
      await documentService.deleteDocument(nonExistentId);
      expect(true).toBe(true); // Just verify it doesn't throw
    });
  });

  describe("searchDocuments", () => {
    it("should search documents successfully", async () => {
      const searchQuery = {
        query: "test document",
        limit: 5,
        offset: 0,
        similarity_threshold: 0.7,
      };

      const results = await documentService.searchDocuments(searchQuery);

      expect(results).toBeInstanceOf(Array);
      // Note: In unit tests with mocked services, results might be empty
      // The important thing is that the method returns an array
      expect(Array.isArray(results)).toBe(true);
    });

    it("should handle search with filters", async () => {
      const searchQuery = {
        query: "technical documentation",
        limit: 10,
        offset: 0,
        similarity_threshold: 0.6,
        filters: {
          tags: ["technical"],
          type: "documentation",
        },
      };

      const results = await documentService.searchDocuments(searchQuery);

      expect(results).toBeInstanceOf(Array);
      // Results should be filtered according to the query
      results.forEach((result) => {
        expect(result.metadata.tags).toContain("technical");
      });
    });

    it("should handle search with no results", async () => {
      const searchQuery = {
        query: "non-existent content that should not be found",
        limit: 5,
        offset: 0,
        similarity_threshold: 0.9,
      };

      const results = await documentService.searchDocuments(searchQuery);

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBe(0);
    });

    it("should handle search with invalid query", async () => {
      const invalidQuery = {
        query: "",
        limit: -1,
        offset: -1,
        similarity_threshold: 1.5,
      };

      // This should fail because query is empty
      await expect(
        documentService.searchDocuments(invalidQuery)
      ).rejects.toThrow();
    });
  });

  describe("getStats", () => {
    it("should get document statistics", async () => {
      const stats = await documentService.getStats();

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty("totalDocuments");
      expect(stats).toHaveProperty("collectionName");
      expect(typeof stats.totalDocuments).toBe("number");
      expect(typeof stats.collectionName).toBe("string");
    });
  });

  describe("testConnections", () => {
    it("should test all service connections", async () => {
      const connections = await documentService.testConnections();

      expect(connections).toBeDefined();
      expect(connections).toHaveProperty("embedding");
      expect(connections).toHaveProperty("weaviate");
      expect(typeof connections.embedding).toBe("boolean");
      expect(typeof connections.weaviate).toBe("boolean");
    });
  });

  describe("addDocumentWithChunks", () => {
    it("should add document with chunking", async () => {
      const request = {
        title: "Large Document for Chunking",
        content: "This is a large document. ".repeat(100),
        metadata: testDocuments.simple.metadata,
      };

      const result = await documentService.addDocumentWithChunks(request);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe(request.title);
      expect(result.content).toBe(request.content);
      expect(result.chunks).toBeInstanceOf(Array);
      expect(result.chunks.length).toBeGreaterThan(1);
    });
  });
});
