import weaviate, {
  type WeaviateClient,
  type ObjectsBatcher,
} from "weaviate-ts-client";
import type { WeaviateConfig } from "@/config";
import type {
  Document,
  DocumentChunk,
  SearchQuery,
  SearchResult,
} from "@/models";
import { AppError } from "@/models";
import { retryWithBackoff, calculateCosineSimilarity } from "@/utils";

/**
 * Weaviate Client Service
 * Handles all vector database operations
 */
export class WeaviateService {
  private client: WeaviateClient;
  private config: WeaviateConfig;

  constructor(config: WeaviateConfig) {
    this.config = config;
    this.client = weaviate.client({
      scheme: config.url.startsWith("https") ? "https" : "http",
      host: config.url.replace(/^https?:\/\//, ""),
      apiKey: config.apiKey ? new weaviate.ApiKey(config.apiKey) : undefined,
    });
  }

  /**
   * Initialize the Weaviate schema
   */
  async initializeSchema(): Promise<void> {
    try {
      const schema = {
        class: "Documents", // Weaviate uses capitalized class names
        description: "Knowledge base documents with vector embeddings",
        vectorizer: "none", // We'll provide our own embeddings
        properties: [
          {
            name: "title",
            dataType: ["text"],
            description: "Document title",
          },
          {
            name: "content",
            dataType: ["text"],
            description: "Document content",
          },
          {
            name: "source",
            dataType: ["text"],
            description: "Document source",
          },
          {
            name: "type",
            dataType: ["text"],
            description: "Document type",
          },
          {
            name: "author",
            dataType: ["text"],
            description: "Document author",
          },
          {
            name: "tags",
            dataType: ["text[]"],
            description: "Document tags",
          },
          {
            name: "language",
            dataType: ["text"],
            description: "Document language",
          },
          {
            name: "metadata",
            dataType: ["object"],
            description: "Additional document metadata",
            nestedProperties: [
              {
                name: "source",
                dataType: ["text"],
                description: "Document source",
              },
              {
                name: "type",
                dataType: ["text"],
                description: "Document type",
              },
              {
                name: "author",
                dataType: ["text"],
                description: "Document author",
              },
              {
                name: "tags",
                dataType: ["text[]"],
                description: "Document tags",
              },
              {
                name: "language",
                dataType: ["text"],
                description: "Document language",
              },
              {
                name: "size",
                dataType: ["int"],
                description: "Document size in bytes",
              },
              {
                name: "mime_type",
                dataType: ["text"],
                description: "Document MIME type",
              },
              {
                name: "extracted_text",
                dataType: ["text"],
                description: "Extracted text content",
              },
              {
                name: "filePath",
                dataType: ["text"],
                description: "File path for self-indexing",
              },
              {
                name: "custom_fields",
                dataType: ["text"],
                description: "Custom metadata fields as JSON string",
              },
            ],
          },
          {
            name: "created_at",
            dataType: ["date"],
            description: "Document creation date",
          },
          {
            name: "updated_at",
            dataType: ["date"],
            description: "Document last update date",
          },
        ],
      };

      await this.client.schema.classCreator().withClass(schema).do();
      console.log(
        `Schema initialized for collection: ${this.config.collectionName}`
      );
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        console.log(
          `Schema already exists for collection: ${this.config.collectionName}`
        );
        return;
      }
      throw new AppError(
        "Failed to initialize Weaviate schema",
        500,
        "SCHEMA_INITIALIZATION_FAILED",
        { originalError: error }
      );
    }
  }

  /**
   * Add a document to the vector database
   */
  async addDocument(document: Document): Promise<void> {
    try {
      const dataObject = {
        title: document.title,
        content: document.content,
        source: document.metadata.source,
        type: document.metadata.type,
        author: document.metadata.author || "",
        tags: document.metadata.tags,
        language: document.metadata.language,
        metadata: {
          source: document.metadata.source,
          type: document.metadata.type,
          author: document.metadata.author || "",
          tags: document.metadata.tags,
          language: document.metadata.language,
          size: document.metadata.size,
          mime_type: document.metadata.mime_type,
          extracted_text: document.metadata.extracted_text || "",
          filePath: document.metadata.filePath || "",
          custom_fields: JSON.stringify(document.metadata.custom_fields || {}),
        },
        created_at: document.created_at,
        updated_at: document.updated_at,
      };

      await retryWithBackoff(
        async () => {
          await this.client.data
            .creator()
            .withClassName(this.config.collectionName)
            .withProperties(dataObject)
            .withVector(document.embedding || [])
            .withId(document.id)
            .do();
        },
        this.config.retries,
        1000
      );
    } catch (error) {
      console.error("Failed to add document to Weaviate:", error);
      throw new AppError(
        "Failed to add document to vector database",
        500,
        "DOCUMENT_ADDITION_FAILED",
        { originalError: error }
      );
    }
  }

  /**
   * Add multiple documents in batch
   */
  async addDocuments(documents: Document[]): Promise<void> {
    try {
      const batcher: ObjectsBatcher = this.client.batch.objectsBatcher();

      for (const document of documents) {
        const dataObject = {
          title: document.title,
          content: document.content,
          source: document.metadata.source,
          type: document.metadata.type,
          author: document.metadata.author || "",
          tags: document.metadata.tags,
          language: document.metadata.language,
          metadata: document.metadata,
          created_at: document.created_at,
          updated_at: document.updated_at,
        };

        batcher.withObject({
          class: this.config.collectionName,
          properties: dataObject,
          vector: document.embedding || [],
          id: document.id,
        });
      }

      await retryWithBackoff(
        async () => {
          await batcher.do();
        },
        this.config.retries,
        1000
      );
    } catch (error) {
      console.error("Failed to add documents to Weaviate:", error);
      throw new AppError(
        "Failed to add documents to vector database",
        500,
        "BATCH_DOCUMENT_ADDITION_FAILED",
        { originalError: error }
      );
    }
  }

  /**
   * Search documents using vector similarity
   */
  async searchDocuments(query: SearchQuery): Promise<SearchResult[]> {
    try {
      // For now, return a simple implementation that gets all documents
      // In production, this would use proper vector similarity search
      const searchResponse = await retryWithBackoff(
        async () => {
          return await this.client.graphql
            .get()
            .withClassName("Documents") // Weaviate uses capitalized class names
            .withFields(
              "title content metadata { source type author tags language size mime_type extracted_text filePath custom_fields } created_at updated_at"
            )
            .withLimit(query.limit)
            .withOffset(query.offset)
            .do();
        },
        this.config.retries,
        1000
      );

      const results: SearchResult[] = [];

      if (
        searchResponse.data &&
        searchResponse.data.Get &&
        searchResponse.data.Get["Documents"]
      ) {
        for (const item of searchResponse.data.Get["Documents"]) {
          const document: Document = {
            id: item._additional?.id || item.id,
            title: item.title || "",
            content: item.content || "",
            metadata: item.metadata || {},
            chunks: [],
            created_at: new Date(item.created_at),
            updated_at: new Date(item.updated_at),
            version: 1,
            status: "completed" as any,
          };

          // For now, use a simple text-based relevance score
          const queryLower = query.query.toLowerCase();
          const titleMatch = document.title.toLowerCase().includes(queryLower);
          const contentMatch = document.content
            .toLowerCase()
            .includes(queryLower);
          const score = titleMatch ? 0.9 : contentMatch ? 0.7 : 0.3;

          if (score >= query.similarity_threshold) {
            results.push({
              document,
              score,
              matched_chunks: [],
              highlights: [],
            });
          }
        }
      }

      return results;
    } catch (error) {
      console.error("Failed to search documents in Weaviate:", error);
      throw new AppError(
        "Failed to search documents",
        500,
        "DOCUMENT_SEARCH_FAILED",
        { originalError: error }
      );
    }
  }

  /**
   * Get document by ID
   */
  async getDocument(id: string): Promise<Document | null> {
    try {
      const response = await this.client.data
        .getterById()
        .withClassName(this.config.collectionName)
        .withId(id)
        .do();

      if (!response) {
        return null;
      }

      return {
        id: response.id || "",
        title: (response.properties?.title as string) || "",
        content: (response.properties?.content as string) || "",
        metadata: (response.properties?.metadata as any) || {},
        chunks: [],
        created_at: new Date(response.properties?.created_at as string),
        updated_at: new Date(response.properties?.updated_at as string),
        version: 1,
        status: "completed" as any,
      };
    } catch (error) {
      console.error("Failed to get document from Weaviate:", error);
      throw new AppError(
        "Failed to get document",
        500,
        "DOCUMENT_RETRIEVAL_FAILED",
        { originalError: error }
      );
    }
  }

  /**
   * Update document
   */
  async updateDocument(id: string, updates: Partial<Document>): Promise<void> {
    try {
      const updateData: any = {};

      if (updates.title) updateData.title = updates.title;
      if (updates.content) updateData.content = updates.content;
      if (updates.metadata) updateData.metadata = updates.metadata;
      if (updates.updated_at) updateData.updated_at = updates.updated_at;

      await this.client.data
        .updater()
        .withClassName(this.config.collectionName)
        .withId(id)
        .withProperties(updateData)
        .do();
    } catch (error) {
      console.error("Failed to update document in Weaviate:", error);
      throw new AppError(
        "Failed to update document",
        500,
        "DOCUMENT_UPDATE_FAILED",
        { originalError: error }
      );
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      await this.client.data
        .deleter()
        .withClassName(this.config.collectionName)
        .withId(id)
        .do();
    } catch (error) {
      console.error("Failed to delete document from Weaviate:", error);
      throw new AppError(
        "Failed to delete document",
        500,
        "DOCUMENT_DELETION_FAILED",
        { originalError: error }
      );
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(): Promise<{
    totalObjects: number;
    className: string;
  }> {
    try {
      // For now, return a simple implementation
      // In production, this would use proper aggregation
      return {
        totalObjects: 0, // Will be implemented later
        className: this.config.collectionName,
      };
    } catch (error) {
      console.error("Failed to get collection stats from Weaviate:", error);
      throw new AppError(
        "Failed to get collection statistics",
        500,
        "STATS_RETRIEVAL_FAILED",
        { originalError: error }
      );
    }
  }

  /**
   * Test Weaviate connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.misc.metaGetter().do();
      return true;
    } catch (error) {
      console.error("Weaviate connection test failed:", error);
      return false;
    }
  }
}
