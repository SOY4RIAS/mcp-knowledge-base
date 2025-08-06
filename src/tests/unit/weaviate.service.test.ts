import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { WeaviateService } from "@/services/weaviate";
import { config } from "@/config";
import { testUtils } from "../setup";
import { testDocuments, testEmbeddings } from "../fixtures/test-data";
import { mockWeaviateClient } from "../utils/mocks";

// Note: Bun doesn't support jest.mock, so we'll mock the client directly in beforeEach

describe("WeaviateService", () => {
  let weaviateService: WeaviateService;

  beforeEach(() => {
    weaviateService = new WeaviateService(config.weaviate);
    // Mock the client property
    (weaviateService as any).client = mockWeaviateClient;
  });

  afterEach(() => {
    // Clean up any resources
  });

  describe("initialize", () => {
    it("should initialize successfully", async () => {
      await expect(weaviateService.initialize()).resolves.not.toThrow();
    });

    it("should handle initialization errors", async () => {
      // Mock a failed initialization
      const mockErrorClient = {
        ...mockWeaviateClient,
        misc: {
          metaGetter: () => ({
            do: () => Promise.reject(new Error("Connection failed")),
          }),
        },
      };
      (weaviateService as any).client = mockErrorClient;

      await expect(weaviateService.initialize()).rejects.toThrow();
    });
  });

  describe("addDocument", () => {
    it("should add document successfully", async () => {
      const document = {
        ...testDocuments.simple,
        id: testUtils.generateTestId(),
        embedding: testEmbeddings.standard,
      };

      const result = await weaviateService.addDocument(document);

      expect(result).toBeDefined();
      expect(result.id).toBe(document.id);
    });

    it("should handle document without embedding", async () => {
      const document = {
        ...testDocuments.simple,
        id: testUtils.generateTestId(),
        embedding: undefined,
      };

      const result = await weaviateService.addDocument(document);

      expect(result).toBeDefined();
      expect(result.id).toBe(document.id);
    });

    it("should handle invalid document data", async () => {
      const invalidDocument = {
        id: testUtils.generateTestId(),
        title: "",
        content: "",
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      await expect(
        weaviateService.addDocument(invalidDocument)
      ).rejects.toThrow();
    });
  });

  describe("getDocument", () => {
    it("should retrieve document by ID", async () => {
      const documentId = testUtils.generateTestId();
      const document = await weaviateService.getDocument(documentId);

      expect(document).toBeDefined();
      expect(document.id).toBe(documentId);
      expect(document.title).toBe("Test Document");
      expect(document.content).toBe("Test content");
    });

    it("should handle non-existent document", async () => {
      const nonExistentId = "non-existent-id";

      // Mock the client to return null for non-existent document
      const mockClientWithNull = {
        ...mockWeaviateClient,
        data: {
          ...mockWeaviateClient.data,
          getterById: () => ({
            withClassName: () => ({
              withId: () => ({
                do: () => Promise.resolve(null),
              }),
            }),
          }),
        },
      };
      (weaviateService as any).client = mockClientWithNull;

      await expect(
        weaviateService.getDocument(nonExistentId)
      ).rejects.toThrow();
    });
  });

  describe("updateDocument", () => {
    it("should update document successfully", async () => {
      const documentId = testUtils.generateTestId();
      const updateData = {
        title: "Updated Title",
        content: "Updated content",
      };

      await expect(
        weaviateService.updateDocument(documentId, updateData)
      ).resolves.not.toThrow();
    });

    it("should handle update with invalid data", async () => {
      const documentId = testUtils.generateTestId();
      const invalidData = {
        title: "",
        content: "",
      };

      await expect(
        weaviateService.updateDocument(documentId, invalidData)
      ).rejects.toThrow();
    });
  });

  describe("deleteDocument", () => {
    it("should delete document successfully", async () => {
      const documentId = testUtils.generateTestId();

      await expect(
        weaviateService.deleteDocument(documentId)
      ).resolves.not.toThrow();
    });

    it("should handle deletion of non-existent document", async () => {
      const nonExistentId = "non-existent-id";

      await expect(
        weaviateService.deleteDocument(nonExistentId)
      ).resolves.not.toThrow();
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

      const results = await weaviateService.searchDocuments(searchQuery);

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
      results.forEach((result) => {
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("title");
        expect(result).toHaveProperty("content");
        expect(result).toHaveProperty("metadata");
        expect(result).toHaveProperty("score");
      });
    });

    it("should handle search with no results", async () => {
      const searchQuery = {
        query: "non-existent content",
        limit: 5,
        offset: 0,
        similarity_threshold: 0.9,
      };

      // Mock empty results
      const mockClientWithEmptyResults = {
        ...mockWeaviateClient,
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
                            Documents: [],
                          },
                        },
                      }),
                  }),
                }),
              }),
            }),
          }),
        },
      };
      (weaviateService as any).client = mockClientWithEmptyResults;

      const results = await weaviateService.searchDocuments(searchQuery);

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

      await expect(
        weaviateService.searchDocuments(invalidQuery)
      ).rejects.toThrow();
    });
  });

  describe("getCollectionStats", () => {
    it("should get collection statistics", async () => {
      const stats = await weaviateService.getCollectionStats();

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty("totalObjects");
      expect(stats).toHaveProperty("className");
      expect(typeof stats.totalObjects).toBe("number");
      expect(typeof stats.className).toBe("string");
    });
  });

  describe("testConnection", () => {
    it("should test connection successfully", async () => {
      const isConnected = await weaviateService.testConnection();

      expect(typeof isConnected).toBe("boolean");
      expect(isConnected).toBe(true);
    });

    it("should handle connection failure", async () => {
      // Mock connection failure
      const mockClientWithFailure = {
        ...mockWeaviateClient,
        misc: {
          metaGetter: () => ({
            do: () => Promise.reject(new Error("Connection failed")),
          }),
        },
      };
      (weaviateService as any).client = mockClientWithFailure;

      const isConnected = await weaviateService.testConnection();

      expect(typeof isConnected).toBe("boolean");
      expect(isConnected).toBe(false);
    });
  });

  describe("configuration", () => {
    it("should use correct configuration", () => {
      expect(weaviateService["config"]).toBe(config.weaviate);
      expect(weaviateService["config"].url).toBe(config.weaviate.url);
      expect(weaviateService["config"].collectionName).toBe(
        config.weaviate.collectionName
      );
    });
  });
});
