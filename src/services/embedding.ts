import { embed, embedMany } from "ai";
import type { EmbeddingConfig } from "@/config";
import { AppError } from "@/models";
import { retryWithBackoff, sanitizeText } from "@/utils";

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const localModel = createOpenAICompatible({
  name: "lmstudio",
  baseURL: "http://192.168.40.15:1234/v1",
});

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

      const embedding = await retryWithBackoff(
        async () => {
          const result = await embed({
            model: localModel.textEmbeddingModel("qwen3-embedding-0.6b"),
            value: sanitizedText,
            apiKey: this.config.apiKey,
            baseURL: this.config.baseUrl,
          });

          return result.embedding;
        },
        this.config.retries,
        1000
      );

      return embedding;
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

      const embeddings = await retryWithBackoff(
        async () => {
          const results = await embedMany({
            model: this.config.model,
            values: sanitizedTexts,
            dimensions: this.config.dimensions,
            apiKey: this.config.apiKey,
            baseURL: this.config.baseUrl,
          });

          return results.embeddings;
        },
        this.config.retries,
        1000
      );

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
  validateEmbeddingDimensions(embedding: number[]): boolean {
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
