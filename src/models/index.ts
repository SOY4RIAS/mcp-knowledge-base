import { z } from "zod";

// Document Types
export enum DocumentType {
  PDF = "pdf",
  DOCX = "docx",
  TXT = "txt",
  MD = "md",
  HTML = "html",
  JSON = "json",
  CSV = "csv",
  // Development-related types
  CODE = "code",
  DOCUMENTATION = "documentation",
  CONFIGURATION = "configuration",
  DEVELOPMENT_HISTORY = "development-history",
  DEVELOPMENT_STATUS = "development-status",
  PROJECT_STRUCTURE = "project-structure",
}

// Development Context Types
export enum DevelopmentContext {
  CODE = "code",
  DOCUMENTATION = "documentation",
  CONFIGURATION = "configuration",
  ARCHITECTURE = "architecture",
  PERFORMANCE = "performance",
  BUG = "bug",
  FEATURE = "feature",
  GENERAL = "general",
}

export enum DocumentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  ARCHIVED = "archived",
}

// Document Models
export const DocumentMetadataSchema = z.object({
  source: z.string(),
  type: z.nativeEnum(DocumentType),
  author: z.string().optional(),
  tags: z.array(z.string()).default([]),
  language: z.string().default("en"),
  size: z.number(),
  mime_type: z.string(),
  extracted_text: z.string().optional(),
  custom_fields: z.record(z.any()).default({}),
  filePath: z.string().optional(), // For self-indexing service
});

export const DocumentChunkSchema = z.object({
  id: z.string(),
  document_id: z.string(),
  content: z.string(),
  embedding: z.array(z.number()),
  metadata: z.object({
    chunk_index: z.number(),
    start_position: z.number(),
    end_position: z.number(),
    overlap_with_previous: z.number().default(0),
    overlap_with_next: z.number().default(0),
    token_count: z.number(),
    importance_score: z.number().optional(),
  }),
  created_at: z.date(),
});

export const DocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  metadata: DocumentMetadataSchema,
  chunks: z.array(DocumentChunkSchema).default([]),
  embedding: z.array(z.number()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
  version: z.number().default(1),
  status: z.nativeEnum(DocumentStatus).default(DocumentStatus.PENDING),
});

// Search Models
export const DateRangeSchema = z.object({
  start: z.date(),
  end: z.date(),
});

export const SearchFiltersSchema = z.object({
  document_types: z.array(z.nativeEnum(DocumentType)).optional(),
  sources: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  date_range: DateRangeSchema.optional(),
  authors: z.array(z.string()).optional(),
  custom_fields: z.record(z.any()).optional(),
});

export const SearchQuerySchema = z.object({
  query: z.string(),
  filters: SearchFiltersSchema.optional(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  similarity_threshold: z.number().min(0).max(1).default(0.7),
  include_metadata: z.boolean().default(true),
  include_chunks: z.boolean().default(false),
});

export const MatchedChunkSchema = z.object({
  chunk: DocumentChunkSchema,
  score: z.number(),
  relevance: z.number(),
});

export const HighlightSchema = z.object({
  field: z.string(),
  content: z.string(),
  positions: z.array(z.number()),
});

export const SearchResultSchema = z.object({
  document: DocumentSchema,
  score: z.number(),
  matched_chunks: z.array(MatchedChunkSchema).default([]),
  highlights: z.array(HighlightSchema).default([]),
});

// MCP Models
export const MCPToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: z.any(), // JSONSchema
  outputSchema: z.any(), // JSONSchema
});

export const MCPResourceSchema = z.object({
  uri: z.string(),
  name: z.string(),
  description: z.string(),
  mimeType: z.string(),
  data: z.any(),
});

export const MCPPromptSchema = z.object({
  name: z.string(),
  description: z.string(),
  arguments: z.array(z.any()),
  template: z.string(),
});

// Error Models
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const ErrorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.string(),
    statusCode: z.number(),
    details: z.any().optional(),
  }),
});

// API Response Models
export const PaginationSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  message: z.string().optional(),
  pagination: PaginationSchema.optional(),
});

// Health Check Models
export const HealthCheckSchema = z.object({
  status: z.enum(["healthy", "unhealthy", "degraded"]),
  timestamp: z.date(),
  uptime: z.number(),
  version: z.string(),
  services: z.record(
    z.object({
      status: z.enum(["healthy", "unhealthy"]),
      responseTime: z.number().optional(),
      error: z.string().optional(),
    })
  ),
});

// Export types
export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;
export type DocumentChunk = z.infer<typeof DocumentChunkSchema>;
export type Document = z.infer<typeof DocumentSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type MatchedChunk = z.infer<typeof MatchedChunkSchema>;
export type Highlight = z.infer<typeof HighlightSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type MCPTool = z.infer<typeof MCPToolSchema>;
export type MCPResource = z.infer<typeof MCPResourceSchema>;
export type MCPPrompt = z.infer<typeof MCPPromptSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type HealthCheck = z.infer<typeof HealthCheckSchema>;

// Utility types
export type CreateDocumentRequest = Omit<
  Document,
  "id" | "created_at" | "updated_at" | "chunks" | "embedding"
>;
export type UpdateDocumentRequest = Partial<
  Omit<Document, "id" | "created_at" | "updated_at">
>;
export type DocumentListResponse = {
  documents: Document[];
  pagination: Pagination;
};
export type SearchResponse = {
  results: SearchResult[];
  total: number;
  query: SearchQuery;
};
