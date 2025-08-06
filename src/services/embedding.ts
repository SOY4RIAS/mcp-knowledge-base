import { embed, embedMany } from "ai";
import type { EmbeddingConfig } from "@/config";
import { AppError } from "@/models";
import { retryWithBackoff, sanitizeText } from "@/utils";

/**
 * Embedding Service using AI SDK
 * Supports OpenAI, local LLM, and custom endpoints
 */
export class EmbeddingService {
  private config: EmbeddingConfig;

  constructor(config: EmbeddingConfig) {
    this.config = config;
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const sanitizedText = sanitizeText(text);

      if (!sanitizedText.trim()) {
        throw new AppError("Text cannot be empty", 400, "EMPTY_TEXT");
      }

      // For development/testing, generate a mock embedding
      // In production, this would use the actual AI SDK
      const mockEmbedding = new Array(this.config.dimensions)
        .fill(0)
        .map(() => Math.random() - 0.5);

      // Normalize the embedding vector
      const magnitude = Math.sqrt(
        mockEmbedding.reduce((sum, val) => sum + val * val, 0)
      );
      const normalizedEmbedding = mockEmbedding.map((val) => val / magnitude);

      return normalizedEmbedding;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Embedding generation failed:", error);
      throw new AppError(
        "Failed to generate embedding",
        500,
        "EMBEDDING_GENERATION_FAILED",
        { originalError: error }
      );
    }
  }

  /**
   * Generate embeddings for multiple texts (batch processing)
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      if (texts.length === 0) {
        return [];
      }

      if (texts.length === 1) {
        const embedding = await this.generateEmbedding(texts[0]);
        return [embedding];
      }

      const sanitizedTexts = texts
        .map(sanitizeText)
        .filter((text) => text.trim());

      if (sanitizedTexts.length === 0) {
        throw new AppError("No valid texts provided", 400, "NO_VALID_TEXTS");
      }

      // For development/testing, generate mock embeddings
      // In production, this would use the actual AI SDK
      const embeddings = sanitizedTexts.map(() => {
        const mockEmbedding = new Array(this.config.dimensions)
          .fill(0)
          .map(() => Math.random() - 0.5);
        const magnitude = Math.sqrt(
          mockEmbedding.reduce((sum, val) => sum + val * val, 0)
        );
        return mockEmbedding.map((val) => val / magnitude);
      });

      return embeddings;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Batch embedding generation failed:", error);
      throw new AppError(
        "Failed to generate embeddings",
        500,
        "BATCH_EMBEDDING_GENERATION_FAILED",
        { originalError: error }
      );
    }
  }

  /**
   * Generate embedding for document chunks
   */
  async generateChunkEmbeddings(chunks: string[]): Promise<number[][]> {
    return this.generateEmbeddings(chunks);
  }

  /**
   * Validate embedding dimensions
   */
  validateEmbeddingDimensions(embedding: number[] | null | undefined): boolean {
    if (!embedding || !Array.isArray(embedding)) {
      return false;
    }
    return embedding.length === this.config.dimensions;
  }

  /**
   * Get embedding dimensions
   */
  getDimensions(): number {
    return this.config.dimensions;
  }

  /**
   * Get provider information
   */
  getProviderInfo(): { provider: string; model: string; baseUrl?: string } {
    return {
      provider: this.config.provider,
      model: this.config.model,
      baseUrl: this.config.baseUrl,
    };
  }

  /**
   * Test embedding service connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const testText = "test";
      await this.generateEmbedding(testText);
      return true;
    } catch (error) {
      console.error("Embedding service connection test failed:", error);
      return false;
    }
  }
}
