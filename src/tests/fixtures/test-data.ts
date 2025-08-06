import { testUtils } from "../setup";

// Test documents
export const testDocuments = {
  simple: testUtils.generateTestDocument({
    title: "Simple Test Document",
    content: "This is a simple test document with basic content.",
  }),

  technical: testUtils.generateTestDocument({
    title: "Technical Documentation",
    content:
      "This document contains technical information about API endpoints, database schemas, and system architecture.",
    metadata: {
      ...testUtils.generateTestDocument().metadata,
      tags: ["technical", "documentation", "api"],
      type: "documentation" as any,
    },
  }),

  code: testUtils.generateTestDocument({
    title: "Source Code Example",
    content: `function example() {
  const data = { id: 1, name: "test" };
  return data;
}`,
    metadata: {
      ...testUtils.generateTestDocument().metadata,
      tags: ["code", "javascript", "function"],
      type: "code" as any,
      mime_type: "text/javascript",
    },
  }),

  large: testUtils.generateTestDocument({
    title: "Large Document",
    content:
      "This is a large document with ".repeat(100) +
      "lots of content for testing performance and chunking.",
    metadata: {
      ...testUtils.generateTestDocument().metadata,
      size: 5000,
    },
  }),
};

// Test search queries
export const testQueries = {
  simple: {
    query: "test document",
    limit: 5,
    similarity_threshold: 0.7,
  },

  technical: {
    query: "API endpoints database",
    limit: 10,
    similarity_threshold: 0.6,
    filters: {
      tags: ["technical"],
    },
  },

  code: {
    query: "function example",
    limit: 3,
    similarity_threshold: 0.8,
    filters: {
      type: "code",
    },
  },
};

// Test MCP tool requests
export const testMCPRequests = {
  addDocument: {
    title: "MCP Test Document",
    content: "This document was added via MCP protocol for testing.",
    source: "mcp-test",
    metadata: {
      type: "txt" as any,
      tags: ["mcp", "test"],
    },
  },

  searchDocuments: {
    query: "MCP protocol testing",
    limit: 5,
    similarity_threshold: 0.7,
    include_metadata: true,
    include_chunks: false,
  },

  developmentSearch: {
    query: "architecture decisions",
    context: "architecture",
    limit: 3,
  },
};

// Test embeddings
export const testEmbeddings = {
  small: testUtils.generateTestEmbedding(128),
  standard: testUtils.generateTestEmbedding(1536),
  large: testUtils.generateTestEmbedding(3072),
};

// Test metadata
export const testMetadata = {
  basic: {
    source: "test",
    type: "txt" as any,
    author: "Test Author",
    tags: ["test"],
    language: "en",
    size: 100,
    mime_type: "text/plain",
    custom_fields: {},
  },

  technical: {
    source: "documentation",
    type: "documentation" as any,
    author: "Technical Writer",
    tags: ["technical", "api", "documentation"],
    language: "en",
    size: 500,
    mime_type: "text/markdown",
    custom_fields: {
      version: "1.0.0",
      category: "api",
    },
  },

  code: {
    source: "repository",
    type: "code" as any,
    author: "Developer",
    tags: ["code", "javascript", "function"],
    language: "en",
    size: 200,
    mime_type: "text/javascript",
    custom_fields: {
      language: "javascript",
      framework: "nodejs",
    },
  },
};
