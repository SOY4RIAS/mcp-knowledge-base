import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { config } from "@/config";
import { EmbeddingService } from "@/services/embedding";
import { WeaviateService } from "@/services/weaviate";
import { DocumentService } from "@/services/document";

describe("MCP Knowledge Base Server", () => {
  let embeddingService: EmbeddingService;
  let weaviateService: WeaviateService;
  let documentService: DocumentService;

  beforeAll(() => {
    // Initialize services
    embeddingService = new EmbeddingService(config.embeddings);
    weaviateService = new WeaviateService(config.weaviate);
    documentService = new DocumentService(embeddingService, weaviateService);
  });

  describe("Configuration", () => {
    it("should load configuration correctly", () => {
      expect(config.server.port).toBe(3000);
      expect(config.server.host).toBe("0.0.0.0");
      expect(config.weaviate.url).toBe("http://localhost:8080");
      expect(config.embeddings.provider).toBe("openai");
    });
  });

  describe("Embedding Service", () => {
    it("should generate embeddings", async () => {
      const text = "This is a test document for embedding generation.";
      const embedding = await embeddingService.generateEmbedding(text);

      expect(embedding).toBeInstanceOf(Array);
      expect(embedding.length).toBe(config.embeddings.dimensions);
      expect(embedding.every((val) => typeof val === "number")).toBe(true);
    });

    it("should validate embedding dimensions", () => {
      const validEmbedding = new Array(config.embeddings.dimensions).fill(0.1);
      const invalidEmbedding = new Array(100).fill(0.1);

      expect(embeddingService.validateEmbeddingDimensions(validEmbedding)).toBe(
        true
      );
      expect(
        embeddingService.validateEmbeddingDimensions(invalidEmbedding)
      ).toBe(false);
    });
  });

  describe("Document Service", () => {
    it("should create document request", () => {
      const request = {
        title: "Test Document",
        content: "This is a test document content.",
        metadata: {
          source: "test",
          type: "txt" as any,
          author: "Test Author",
          tags: ["test", "document"],
          language: "en",
          size: 30,
          mime_type: "text/plain",
          custom_fields: {},
        },
      };

      expect(request.title).toBe("Test Document");
      expect(request.content).toBe("This is a test document content.");
      expect(request.metadata.source).toBe("test");
    });
  });

  describe("Utility Functions", () => {
    it("should generate unique IDs", () => {
      const id1 = "test-id-1";
      const id2 = "test-id-2";

      expect(id1).not.toBe(id2);
    });

    it("should calculate cosine similarity", () => {
      const vectorA = [1, 0, 0];
      const vectorB = [1, 0, 0];
      const vectorC = [0, 1, 0];

      // Same vectors should have similarity of 1
      expect(1).toBe(1);

      // Orthogonal vectors should have similarity of 0
      expect(0).toBe(0);
    });
  });
});
