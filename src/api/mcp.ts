import { Hono } from "hono";
import type { DocumentService } from "@/services/document";
import type {
  SearchQuery,
  CreateDocumentRequest,
  UpdateDocumentRequest,
} from "@/models";
import { AppError } from "@/models";
import { createSuccessResponse, createErrorResponse } from "@/utils";

/**
 * MCP Protocol Implementation
 * Provides Model Context Protocol tools for AI assistants
 */
export class MCPProtocol {
  private documentService: DocumentService;

  constructor(documentService: DocumentService) {
    this.documentService = documentService;
  }

  /**
   * Get MCP tools definition
   */
  getTools() {
    return [
      {
        name: "knowledge_base_search",
        description: "Search the knowledge base using semantic similarity",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query text",
            },
            limit: {
              type: "number",
              default: 10,
              description: "Maximum number of results to return",
            },
            filters: {
              type: "object",
              description: "Search filters",
            },
            similarity_threshold: {
              type: "number",
              default: 0.7,
              description: "Minimum similarity score",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "knowledge_base_add",
        description: "Add a new document to the knowledge base",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Document title",
            },
            content: {
              type: "string",
              description: "Document content",
            },
            metadata: {
              type: "object",
              description: "Document metadata",
            },
            source: {
              type: "string",
              description: "Document source",
            },
          },
          required: ["content", "source"],
        },
      },
      {
        name: "knowledge_base_update",
        description: "Update an existing document in the knowledge base",
        inputSchema: {
          type: "object",
          properties: {
            document_id: {
              type: "string",
              description: "Document ID to update",
            },
            title: {
              type: "string",
              description: "Updated document title",
            },
            content: {
              type: "string",
              description: "Updated document content",
            },
            metadata: {
              type: "object",
              description: "Updated document metadata",
            },
          },
          required: ["document_id"],
        },
      },
      {
        name: "knowledge_base_delete",
        description: "Delete a document from the knowledge base",
        inputSchema: {
          type: "object",
          properties: {
            document_id: {
              type: "string",
              description: "Document ID to delete",
            },
          },
          required: ["document_id"],
        },
      },
      {
        name: "knowledge_base_list",
        description: "List documents in the knowledge base",
        inputSchema: {
          type: "object",
          properties: {
            filters: {
              type: "object",
              description: "Filter criteria",
            },
            limit: {
              type: "number",
              default: 50,
              description: "Maximum number of results",
            },
            offset: {
              type: "number",
              default: 0,
              description: "Result offset",
            },
          },
        },
      },
      {
        name: "knowledge_base_stats",
        description: "Get knowledge base statistics",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "development_info_search",
        description:
          "Search development-related information in the knowledge base",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query for development information",
            },
            context: {
              type: "string",
              enum: [
                "architecture",
                "performance",
                "bug",
                "feature",
                "general",
              ],
              description: "Development context to search in",
            },
            phase: {
              type: "string",
              enum: [
                "planning",
                "implementation",
                "testing",
                "deployment",
                "maintenance",
              ],
              description: "Development phase filter",
            },
            limit: {
              type: "number",
              default: 5,
              description: "Maximum number of results",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "development_suggestion",
        description: "Get development suggestions based on current context",
        inputSchema: {
          type: "object",
          properties: {
            context: {
              type: "string",
              description: "Current development context or issue",
            },
            type: {
              type: "string",
              enum: [
                "architecture",
                "performance",
                "bug",
                "feature",
                "best_practice",
              ],
              description: "Type of suggestion needed",
            },
            limit: {
              type: "number",
              default: 3,
              description: "Maximum number of suggestions",
            },
          },
          required: ["context"],
        },
      },
    ];
  }

  /**
   * Handle MCP tool calls
   */
  async handleToolCall(toolName: string, args: any): Promise<any> {
    try {
      switch (toolName) {
        case "knowledge_base_search":
          return await this.handleSearch(args);

        case "knowledge_base_add":
          return await this.handleAdd(args);

        case "knowledge_base_update":
          return await this.handleUpdate(args);

        case "knowledge_base_delete":
          return await this.handleDelete(args);

        case "knowledge_base_list":
          return await this.handleList(args);

        case "knowledge_base_stats":
          return await this.handleStats(args);

        case "development_info_search":
          return await this.handleDevelopmentInfoSearch(args);

        case "development_suggestion":
          return await this.handleDevelopmentSuggestion(args);

        default:
          throw new AppError(`Unknown tool: ${toolName}`, 400, "UNKNOWN_TOOL");
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error(`MCP tool call failed for ${toolName}:`, error);
      throw new AppError(
        `Failed to execute tool: ${toolName}`,
        500,
        "TOOL_EXECUTION_FAILED",
        { originalError: error }
      );
    }
  }

  /**
   * Handle search tool
   */
  private async handleSearch(args: any): Promise<any> {
    const { query, limit = 10, filters, similarity_threshold = 0.7 } = args;

    if (!query || typeof query !== "string") {
      throw new AppError(
        "Query is required and must be a string",
        400,
        "INVALID_QUERY"
      );
    }

    const searchQuery: SearchQuery = {
      query,
      limit,
      filters,
      offset: 0,
      similarity_threshold,
      include_metadata: true,
      include_chunks: false,
    };

    const results = await this.documentService.searchDocuments(searchQuery);

    return createSuccessResponse({
      results,
      total: results.length,
      query: searchQuery,
    });
  }

  /**
   * Handle add tool
   */
  private async handleAdd(args: any): Promise<any> {
    const { title, content, metadata, source } = args;

    if (!content || typeof content !== "string") {
      throw new AppError(
        "Content is required and must be a string",
        400,
        "INVALID_CONTENT"
      );
    }

    if (!source || typeof source !== "string") {
      throw new AppError(
        "Source is required and must be a string",
        400,
        "INVALID_SOURCE"
      );
    }

    const documentRequest: CreateDocumentRequest = {
      title: title || "Untitled Document",
      content,
      metadata: {
        source,
        type: "txt" as any,
        author: metadata?.author,
        tags: metadata?.tags || [],
        language: metadata?.language || "en",
        size: content.length,
        mime_type: "text/plain",
        custom_fields: metadata?.custom_fields || {},
      },
    };

    const document = await this.documentService.addDocument(documentRequest);

    return createSuccessResponse({
      document,
      message: "Document added successfully",
    });
  }

  /**
   * Handle update tool
   */
  private async handleUpdate(args: any): Promise<any> {
    const { document_id, title, content, metadata } = args;

    if (!document_id || typeof document_id !== "string") {
      throw new AppError(
        "Document ID is required and must be a string",
        400,
        "INVALID_DOCUMENT_ID"
      );
    }

    const updates: UpdateDocumentRequest = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (metadata) updates.metadata = metadata;

    const document = await this.documentService.updateDocument(
      document_id,
      updates
    );

    return createSuccessResponse({
      document,
      message: "Document updated successfully",
    });
  }

  /**
   * Handle delete tool
   */
  private async handleDelete(args: any): Promise<any> {
    const { document_id } = args;

    if (!document_id || typeof document_id !== "string") {
      throw new AppError(
        "Document ID is required and must be a string",
        400,
        "INVALID_DOCUMENT_ID"
      );
    }

    await this.documentService.deleteDocument(document_id);

    return createSuccessResponse({
      message: "Document deleted successfully",
    });
  }

  /**
   * Handle list tool
   */
  private async handleList(args: any): Promise<any> {
    // For now, return a simple message since we need to implement listing
    // This would typically query the database for documents with pagination
    return createSuccessResponse({
      message: "Document listing not yet implemented",
      documents: [],
      total: 0,
    });
  }

  /**
   * Handle stats tool
   */
  private async handleStats(args: any): Promise<any> {
    const stats = await this.documentService.getStats();

    return createSuccessResponse({
      stats,
      message: "Statistics retrieved successfully",
    });
  }

  /**
   * Handle development info search tool
   */
  private async handleDevelopmentInfoSearch(args: any): Promise<any> {
    const { query, context, phase, limit = 5 } = args;

    if (!query || typeof query !== "string") {
      throw new AppError(
        "Query is required and must be a string",
        400,
        "INVALID_QUERY"
      );
    }

    // Build filters for development-related content
    const filters: any = {
      tags: ["development", "code", "documentation", "configuration"],
    };

    if (context) {
      filters.tags = [...filters.tags, context];
    }

    const searchQuery: SearchQuery = {
      query,
      limit,
      filters,
      offset: 0,
      similarity_threshold: 0.6, // Lower threshold for development info
      include_metadata: true,
      include_chunks: false,
    };

    const results = await this.documentService.searchDocuments(searchQuery);

    return createSuccessResponse({
      results,
      total: results.length,
      query: searchQuery,
      context: context || "general",
      phase: phase || "all",
    });
  }

  /**
   * Handle development suggestion tool
   */
  private async handleDevelopmentSuggestion(args: any): Promise<any> {
    const { context, type, limit = 3 } = args;

    if (!context || typeof context !== "string") {
      throw new AppError(
        "Context is required and must be a string",
        400,
        "INVALID_CONTEXT"
      );
    }

    // Search for relevant development information
    const searchQuery: SearchQuery = {
      query: context,
      limit: limit * 2, // Get more results to filter
      filters: {
        tags: ["development", "best_practice", "architecture", "performance"],
      },
      offset: 0,
      similarity_threshold: 0.5,
      include_metadata: true,
      include_chunks: false,
    };

    const results = await this.documentService.searchDocuments(searchQuery);

    // Generate suggestions based on results
    const suggestions = results.slice(0, limit).map((result, index) => ({
      id: `suggestion-${index + 1}`,
      title: result.document.title,
      content: result.document.content.substring(0, 200) + "...",
      relevance: result.score,
      type: type || "general",
      source: result.document.metadata.source,
    }));

    return createSuccessResponse({
      suggestions,
      total: suggestions.length,
      context,
      type: type || "general",
    });
  }
}

/**
 * Create MCP routes for Hono
 */
export function createMCPRoutes(documentService: DocumentService) {
  const app = new Hono();
  const mcpProtocol = new MCPProtocol(documentService);

  // Get available tools
  app.get("/tools", (c) => {
    return c.json(
      createSuccessResponse({
        tools: mcpProtocol.getTools(),
      })
    );
  });

  // Execute tool
  app.post("/tools/:toolName", async (c) => {
    const toolName = c.req.param("toolName");
    const args = await c.req.json();

    try {
      const result = await mcpProtocol.handleToolCall(toolName, args);
      return c.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json(
          createErrorResponse(
            error.message,
            error.statusCode,
            error.code,
            error.details
          ),
          error.statusCode
        );
      }

      return c.json(
        createErrorResponse("Internal server error", 500, "INTERNAL_ERROR"),
        500
      );
    }
  });

  return app;
}
