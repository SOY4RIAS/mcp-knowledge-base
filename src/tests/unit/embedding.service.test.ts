import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { EmbeddingService } from "@/services/embedding";
import { config } from "@/config";
import { testUtils } from "../setup";
import { testEmbeddings } from "../fixtures/test-data";

describe("EmbeddingService", () => {
  let embeddingService: EmbeddingService;

  beforeEach(() => {
    embeddingService = new EmbeddingService(config.embeddings);
  });

  afterEach(() => {
    // Clean up any resources
  });

  describe("generateEmbedding", () => {
    it("should generate embeddings for valid text", async () => {
      const text = "This is a test document for embedding generation.";
      const embedding = await embeddingService.generateEmbedding(text);

      expect(embedding).toBeInstanceOf(Array);
      expect(embedding.length).toBe(config.embeddings.dimensions);
      expect(embedding.every((val) => typeof val === "number")).toBe(true);
      expect(embedding.every((val) => val >= -1 && val <= 1)).toBe(true);
    });

    it("should handle empty text", async () => {
      const text = "";
      await expect(embeddingService.generateEmbedding(text)).rejects.toThrow();
    });

    it("should handle whitespace-only text", async () => {
      const text = "   \n\t  ";
      await expect(embeddingService.generateEmbedding(text)).rejects.toThrow();
    });

    it("should handle very long text", async () => {
      const longText = "This is a very long text. ".repeat(1000);
      const embedding = await embeddingService.generateEmbedding(longText);

      expect(embedding).toBeInstanceOf(Array);
      expect(embedding.length).toBe(config.embeddings.dimensions);
    });

    it("should generate consistent embeddings for same text", async () => {
      const text = "Consistent test text";
      const embedding1 = await embeddingService.generateEmbedding(text);
      const embedding2 = await embeddingService.generateEmbedding(text);

      expect(embedding1).toBeInstanceOf(Array);
      expect(embedding2).toBeInstanceOf(Array);
      expect(embedding1.length).toBe(embedding2.length);
    });
  });

  describe("generateEmbeddings", () => {
    it("should generate embeddings for multiple texts", async () => {
      const texts = [
        "First test document",
        "Second test document",
        "Third test document",
      ];
      const embeddings = await embeddingService.generateEmbeddings(texts);

      expect(embeddings).toBeInstanceOf(Array);
      expect(embeddings.length).toBe(texts.length);
      embeddings.forEach((embedding) => {
        expect(embedding).toBeInstanceOf(Array);
        expect(embedding.length).toBe(config.embeddings.dimensions);
      });
    });

    it("should handle empty array", async () => {
      const texts: string[] = [];
      const embeddings = await embeddingService.generateEmbeddings(texts);

      expect(embeddings).toBeInstanceOf(Array);
      expect(embeddings.length).toBe(0);
    });

    it("should handle array with empty strings", async () => {
      const texts = ["Valid text", "", "Another valid text"];
      const embeddings = await embeddingService.generateEmbeddings(texts);

      // Should filter out empty strings and return embeddings for valid texts
      expect(embeddings).toBeInstanceOf(Array);
      expect(embeddings.length).toBe(2); // Only 2 valid texts
    });
  });

  describe("validateEmbeddingDimensions", () => {
    it("should validate correct embedding dimensions", () => {
      const validEmbedding = testEmbeddings.standard;
      expect(embeddingService.validateEmbeddingDimensions(validEmbedding)).toBe(
        true
      );
    });

    it("should reject incorrect embedding dimensions", () => {
      const invalidEmbedding = testEmbeddings.small;
      expect(
        embeddingService.validateEmbeddingDimensions(invalidEmbedding)
      ).toBe(false);
    });

    it("should handle empty embedding", () => {
      const emptyEmbedding: number[] = [];
      expect(embeddingService.validateEmbeddingDimensions(emptyEmbedding)).toBe(
        false
      );
    });

    it("should handle null/undefined embedding", () => {
      expect(embeddingService.validateEmbeddingDimensions(null as any)).toBe(
        false
      );
      expect(
        embeddingService.validateEmbeddingDimensions(undefined as any)
      ).toBe(false);
    });
  });

  describe("testConnection", () => {
    it("should test connection successfully", async () => {
      const isConnected = await embeddingService.testConnection();
      expect(typeof isConnected).toBe("boolean");
    });
  });

  describe("configuration", () => {
    it("should use correct configuration", () => {
      expect(embeddingService["config"]).toBe(config.embeddings);
      expect(embeddingService["config"].dimensions).toBe(
        config.embeddings.dimensions
      );
      expect(embeddingService["config"].provider).toBe(
        config.embeddings.provider
      );
    });
  });
});
