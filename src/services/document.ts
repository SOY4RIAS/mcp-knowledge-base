import {
  DocumentStatus,
  type Document,
  type CreateDocumentRequest,
  type UpdateDocumentRequest,
  type SearchQuery,
  type SearchResult,
  type DocumentType,
} from "@/models";
import { AppError } from "@/models";
import { EmbeddingService } from "./embedding";
import { WeaviateService } from "./weaviate";
import {
  generateId,
  generateIdWithPrefix,
  chunkText,
  estimateTokenCount,
} from "@/utils";

/**
 * Document Service
 * Orchestrates document processing, embedding generation, and vector storage
 */
export class DocumentService {
  private embeddingService: EmbeddingService;
  private weaviateService: WeaviateService;

  constructor(
    embeddingService: EmbeddingService,
    weaviateService: WeaviateService
  ) {
    this.embeddingService = embeddingService;
    this.weaviateService = weaviateService;
  }

  /**
   * Add a new document to the knowledge base
   */
  async addDocument(request: CreateDocumentRequest): Promise<Document> {
    try {
      // Generate document ID
      const documentId = generateId();
      const now = new Date();

      // Create document object
      const document: Document = {
        id: documentId,
        title: request.title,
        content: request.content,
        metadata: request.metadata,
        chunks: [],
        created_at: now,
        updated_at: now,
        version: 1,
        status: DocumentStatus.PROCESSING,
      };

      // Generate embedding for the document
      const embedding = await this.embeddingService.generateEmbedding(
        request.content
      );
      document.embedding = embedding;

      // Add document to vector database
      await this.weaviateService.addDocument(document);

      // Update status to completed
      document.status = DocumentStatus.COMPLETED;

      return document;
    } catch (error) {
      console.error("Failed to add document:", error);
      throw new AppError(
        "Failed to add document to knowledge base",
        500,
        "DOCUMENT_ADDITION_FAILED",
        { originalError: error }
      );
    }
  }

  /**
   * Add document with chunking
   */
  async addDocumentWithChunks(
    request: CreateDocumentRequest,
    chunkSize: number = 1000,
    overlap: number = 200
  ): Promise<Document> {
    try {
      // Generate document ID
      const documentId = generateId();
      const now = new Date();

      // Create document object
      const document: Document = {
        id: documentId,
        title: request.title,
        content: request.content,
        metadata: request.metadata,
        chunks: [],
        created_at: now,
        updated_at: now,
        version: 1,
        status: DocumentStatus.PROCESSING,
      };

      // Chunk the document content
      const textChunks = chunkText(request.content, chunkSize, overlap);

      // Generate embeddings for chunks
      const chunkEmbeddings =
        await this.embeddingService.generateChunkEmbeddings(textChunks);

      // Create chunk objects
      const chunks = textChunks.map((content, index) => ({
        id: generateIdWithPrefix("chunk"),
        document_id: documentId,
        content,
        embedding: chunkEmbeddings[index],
        metadata: {
          chunk_index: index,
          start_position: index * (chunkSize - overlap),
          end_position: Math.min(
            (index + 1) * chunkSize,
            request.content.length
          ),
          overlap_with_previous: index > 0 ? overlap : 0,
          overlap_with_next: index < textChunks.length - 1 ? overlap : 0,
          token_count: estimateTokenCount(content),
        },
        created_at: now,
      }));

      document.chunks = chunks;

      // Generate embedding for the full document
      const documentEmbedding = await this.embeddingService.generateEmbedding(
        request.content
      );
      document.embedding = documentEmbedding;

      // Add document to vector database
      await this.weaviateService.addDocument(document);

      // Update status to completed
      document.status = DocumentStatus.COMPLETED;

      return document;
    } catch (error) {
      console.error("Failed to add document with chunks:", error);
      throw new AppError(
        "Failed to add document to knowledge base",
        500,
        "DOCUMENT_ADDITION_FAILED",
        { originalError: error }
      );
    }
  }

  /**
   * Search documents using semantic similarity
   */
  async searchDocuments(query: SearchQuery): Promise<SearchResult[]> {
    try {
      // Generate embedding for the search query
      const queryEmbedding = await this.embeddingService.generateEmbedding(
        query.query
      );

      // Create search query with embedding
      const searchQuery = {
        ...query,
        embedding: queryEmbedding,
      };

      // Search in vector database
      const results = await this.weaviateService.searchDocuments(searchQuery);

      return results;
    } catch (error) {
      console.error("Failed to search documents:", error);
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
      return await this.weaviateService.getDocument(id);
    } catch (error) {
      console.error("Failed to get document:", error);
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
  async updateDocument(
    id: string,
    updates: UpdateDocumentRequest
  ): Promise<Document> {
    try {
      // Get existing document
      const existingDocument = await this.weaviateService.getDocument(id);
      if (!existingDocument) {
        throw new AppError("Document not found", 404, "DOCUMENT_NOT_FOUND");
      }

      // Prepare update data
      const updateData: Partial<Document> = {
        updated_at: new Date(),
      };

      if (updates.title) updateData.title = updates.title;
      if (updates.content) {
        updateData.content = updates.content;
        // Regenerate embedding if content changed
        const newEmbedding = await this.embeddingService.generateEmbedding(
          updates.content
        );
        updateData.embedding = newEmbedding;
      }
      if (updates.metadata) updateData.metadata = updates.metadata;

      // Update document in vector database
      await this.weaviateService.updateDocument(id, updateData);

      // Return updated document
      return {
        ...existingDocument,
        ...updateData,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Failed to update document:", error);
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
      await this.weaviateService.deleteDocument(id);
    } catch (error) {
      console.error("Failed to delete document:", error);
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
  async getStats(): Promise<{
    totalDocuments: number;
    collectionName: string;
  }> {
    try {
      const stats = await this.weaviateService.getCollectionStats();
      return {
        totalDocuments: stats.totalObjects,
        collectionName: stats.className,
      };
    } catch (error) {
      console.error("Failed to get statistics:", error);
      throw new AppError(
        "Failed to get statistics",
        500,
        "STATS_RETRIEVAL_FAILED",
        { originalError: error }
      );
    }
  }

  /**
   * Test service connectivity
   */
  async testConnections(): Promise<{
    embedding: boolean;
    weaviate: boolean;
  }> {
    const [embeddingConnected, weaviateConnected] = await Promise.all([
      this.embeddingService.testConnection(),
      this.weaviateService.testConnection(),
    ]);

    return {
      embedding: embeddingConnected,
      weaviate: weaviateConnected,
    };
  }
}
