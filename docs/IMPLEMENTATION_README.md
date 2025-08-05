# MCP Knowledge Base Server - Implementation

This document describes the implementation of the MCP Knowledge Base Server following the best practices outlined in the `.cursorrules` file.

## 🏗️ Architecture Overview

The implementation follows a modular, layered architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        MCP Knowledge Base Server                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   MCP API   │  │  REST API   │  │  WebSocket  │            │
│  │   Layer     │  │   Layer     │  │   Layer     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Document    │  │ AI SDK      │  │ Vector      │            │
│  │ Processing  │  │ Embedding   │  │ Search      │            │
│  │ Service     │  │ Service     │  │ Service     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Self-       │  │ Redis       │  │ Weaviate    │            │
│  │ Indexing    │  │ Cache       │  │ Vector DB   │            │
│  │ Service     │  │ Service     │  │ Service     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
src/
├── api/                    # API layer (MCP, REST, WebSocket)
│   └── mcp.ts             # MCP protocol implementation
├── services/              # Business logic services
│   ├── embedding.ts       # AI SDK embedding service
│   ├── weaviate.ts        # Weaviate vector database service
│   ├── document.ts        # Document processing service
│   ├── self-indexing.ts   # Self-indexing service
│   └── redis.ts           # Redis caching service
├── models/                # Data models and interfaces
│   └── index.ts           # All data models and schemas
├── utils/                 # Utility functions and helpers
│   └── index.ts           # Common utility functions
├── config/                # Configuration management
│   └── index.ts           # Environment configuration
├── middleware/            # Hono middleware
├── tests/                 # Test files
│   ├── basic.test.ts      # Basic functionality tests
│   └── integration.test.ts # Integration tests
└── index.ts               # Main application entry point
```

## 🚀 Quick Start

### Prerequisites

- Bun 1.0+
- Docker and Docker Compose
- OpenAI API key (or local LLM endpoint)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd mcp-knowledge-base
bun install
```

### 2. Environment Configuration

Create a `.env` file based on `env.example`:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Weaviate Configuration
WEAVIATE_URL=http://localhost:8080
WEAVIATE_COLLECTION_NAME=documents

# AI SDK Configuration
AI_SDK_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-ada-002
OPENAI_API_KEY=your-openai-api-key

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-super-secret-jwt-key-that-is-at-least-32-characters-long

# Self-Referential Features
ENABLE_SELF_INDEXING=true
DEVELOPMENT_COLLECTION_NAME=development_docs
AUTO_INDEX_INTERVAL=3600000
```

### 3. Start Dependencies

```bash
docker-compose up -d weaviate redis
```

### 4. Start Development Server

```bash
bun run dev
```

The server will be available at:
- **Server**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **API Docs**: http://localhost:3000/docs
- **MCP Tools**: http://localhost:3000/mcp/tools

## 🔧 Core Components

### 1. Configuration Management (`src/config/index.ts`)

- Environment-based configuration with Zod validation
- Type-safe configuration objects
- Default values and validation rules
- Support for multiple environments
- Self-indexing configuration
- Redis configuration

```typescript
import { config } from '@/config';

// Access typed configuration
console.log(config.server.port); // 3000
console.log(config.weaviate.url); // http://localhost:8080
console.log(config.selfIndexing.enabled); // true
console.log(config.redis.url); // redis://localhost:6379
```

### 2. Data Models (`src/models/index.ts`)

- Comprehensive TypeScript interfaces
- Zod schemas for validation
- Document, search, and MCP models
- Error handling models
- Development context types
- Extended document types for self-indexing

```typescript
import { Document, DevelopmentContext, DocumentType } from '@/models';

// Type-safe document creation
const document: Document = {
  id: 'doc-123',
  title: 'Sample Document',
  content: 'Document content...',
  metadata: {
    source: 'file.txt',
    type: DocumentType.CODE,
    tags: ['development', 'typescript'],
    language: 'en',
    size: 1024,
    mime_type: 'text/plain',
    custom_fields: {},
  },
  chunks: [],
  created_at: new Date(),
  updated_at: new Date(),
  version: 1,
  status: 'pending' as any,
};
```

### 3. Embedding Service (`src/services/embedding.ts`)

- AI SDK integration for embeddings
- Support for OpenAI, local LLM, and custom endpoints
- Batch processing capabilities
- Error handling and retry logic

```typescript
import { EmbeddingService } from '@/services/embedding';

const embeddingService = new EmbeddingService(config.embeddings);
const embedding = await embeddingService.generateEmbedding('Sample text');
```

### 4. Weaviate Service (`src/services/weaviate.ts`)

- Vector database operations
- Schema management
- Search and CRUD operations
- Connection pooling and error handling

```typescript
import { WeaviateService } from '@/services/weaviate';

const weaviateService = new WeaviateService(config.weaviate);
await weaviateService.initializeSchema();
```

### 5. Document Service (`src/services/document.ts`)

- Orchestrates document processing
- Handles embedding generation and storage
- Manages document lifecycle
- Provides search functionality

```typescript
import { DocumentService } from '@/services/document';

const documentService = new DocumentService(embeddingService, weaviateService);
const document = await documentService.addDocument(documentRequest);
```

### 6. Self-Indexing Service (`src/services/self-indexing.ts`)

- Auto-indexing of project documentation and code
- Git integration for tracking development history
- Development context extraction and analysis
- Development suggestions and recommendations
- Project structure analysis

```typescript
import { SelfIndexingService } from '@/services/self-indexing';

const selfIndexingService = new SelfIndexingService(documentService);
await selfIndexingService.startAutoIndexing();
```

### 7. Redis Service (`src/services/redis.ts`)

- Caching layer for improved performance
- Session management
- JSON serialization support
- Hash operations
- Counter operations
- TTL management

```typescript
import { RedisService } from '@/services/redis';

const redisService = new RedisService();
await redisService.connect();

// Cache search results
await redisService.setJson('search:query123', results, 3600);

// Get cached results
const cachedResults = await redisService.getJson('search:query123');
```

### 8. MCP Protocol (`src/api/mcp.ts`)

- Model Context Protocol implementation
- Tool definitions and handlers
- REST API endpoints for MCP tools
- Error handling and validation
- Development-specific tools

```typescript
import { createMCPRoutes } from '@/api/mcp';

const mcpRoutes = createMCPRoutes(documentService);
app.route('/mcp', mcpRoutes);
```

## 🛠️ Available MCP Tools

### Core Knowledge Base Tools

1. **`knowledge_base_search`** - Search the knowledge base using semantic similarity
2. **`knowledge_base_add`** - Add a new document to the knowledge base
3. **`knowledge_base_update`** - Update an existing document
4. **`knowledge_base_delete`** - Delete a document from the knowledge base
5. **`knowledge_base_list`** - List documents in the knowledge base
6. **`knowledge_base_stats`** - Get knowledge base statistics

### Development Tools (New!)

7. **`development_info_search`** - Search development-related information

```json
{
  "name": "development_info_search",
  "description": "Search development-related information in the knowledge base",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search query for development information"
      },
      "context": {
        "type": "string",
        "enum": ["architecture", "performance", "bug", "feature", "general"],
        "description": "Development context to search in"
      },
      "phase": {
        "type": "string",
        "enum": ["planning", "implementation", "testing", "deployment", "maintenance"],
        "description": "Development phase filter"
      },
      "limit": {
        "type": "number",
        "default": 5,
        "description": "Maximum number of results"
      }
    },
    "required": ["query"]
  }
}
```

8. **`development_suggestion`** - Get development suggestions based on current context

```json
{
  "name": "development_suggestion",
  "description": "Get development suggestions based on current context",
  "inputSchema": {
    "type": "object",
    "properties": {
      "context": {
        "type": "string",
        "description": "Current development context or issue"
      },
      "type": {
        "type": "string",
        "enum": ["architecture", "performance", "bug", "feature", "best_practice"],
        "description": "Type of suggestion needed"
      },
      "limit": {
        "type": "number",
        "default": 3,
        "description": "Maximum number of suggestions"
      }
    },
    "required": ["context"]
  }
}
```

## 🔌 API Endpoints

### Health Check
```bash
GET /health
```

### MCP Tools
```bash
GET /mcp/tools                    # Get available tools
POST /mcp/tools/:toolName         # Execute tool
```

### API Documentation
```bash
GET /docs                         # API documentation
```

### Self-Referential Endpoints
```bash
POST /api/v1/self-index           # Trigger self-indexing
GET  /api/v1/self-index/status    # Get indexing status
```

## 🧪 Testing

Run tests using Bun's built-in test runner:

```bash
# Run all tests
bun test

# Run tests with coverage
bun test --coverage

# Run tests in watch mode
bun test --watch
```

### Test Structure

- **`src/tests/basic.test.ts`** - Unit tests for core functionality
- **`src/tests/integration.test.ts`** - Integration tests for the full system

## 🐳 Docker Deployment

### Build and Run

```bash
# Build the image
docker build -t mcp-knowledge-base .

# Run with dependencies
docker-compose up -d

# Or run standalone
docker run -p 3000:3000 mcp-knowledge-base
```

### Docker Compose

The `docker-compose.yml` file includes:
- Weaviate vector database
- Redis cache
- Health checks for all services

## 🔒 Security Features

- Environment-based configuration
- Input validation with Zod schemas
- Error handling with custom error types
- CORS configuration
- Request logging and timing
- JWT authentication (configured)
- Rate limiting (configured)

## 📊 Performance Features

- Connection pooling for Weaviate
- Batch processing for embeddings
- Retry logic with exponential backoff
- Request timing middleware
- Health checks and monitoring
- Redis caching layer
- Self-indexing with configurable intervals

## 🔄 Self-Referential Knowledge Base Features

### Auto-Indexing Capabilities

The system automatically indexes:

1. **Documentation Files**
   - Markdown files (`.md`)
   - Text files (`.txt`)
   - ReStructuredText (`.rst`)
   - AsciiDoc (`.adoc`)

2. **Code Files**
   - TypeScript/JavaScript (`.ts`, `.js`, `.tsx`, `.jsx`)
   - Configuration files (`.json`, `.yaml`, `.yml`)
   - Package files (`package.json`, `tsconfig.json`)

3. **Development History**
   - Recent Git commits
   - Current branch status
   - Git status information

4. **Project Structure**
   - Directory tree representation
   - File organization analysis

### Development Context Types

- **CODE** - Source code files
- **DOCUMENTATION** - Documentation files
- **CONFIGURATION** - Configuration files
- **ARCHITECTURE** - Architecture-related content
- **PERFORMANCE** - Performance-related content
- **BUG** - Bug-related content
- **FEATURE** - Feature-related content
- **GENERAL** - General development content

### Document Types

Extended document types for development content:

- **CODE** - Source code
- **DOCUMENTATION** - Documentation
- **CONFIGURATION** - Configuration files
- **DEVELOPMENT_HISTORY** - Git history
- **DEVELOPMENT_STATUS** - Git status
- **PROJECT_STRUCTURE** - Project structure

## 🔧 Development Workflow

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Comprehensive error handling

### Testing Strategy

- Unit tests for all services
- Integration tests for API endpoints
- Health checks for dependencies
- Performance benchmarks

## 🚀 Production Deployment

### Environment Variables

Ensure all required environment variables are set:

```bash
# Required
OPENAI_API_KEY=your-openai-api-key
JWT_SECRET=your-super-secret-jwt-key-that-is-at-least-32-characters-long

# Optional (with defaults)
WEAVIATE_URL=http://localhost:8080
EMBEDDING_MODEL=text-embedding-ada-002
PORT=3000
REDIS_URL=redis://localhost:6379
ENABLE_SELF_INDEXING=true
```

### Monitoring

- Health check endpoint: `/health`
- Request timing logs
- Error logging with context
- Service connectivity tests
- Redis connection status
- Self-indexing status

## 🔄 Next Steps

### Phase 1 Enhancements (Completed)
- [x] Add self-indexing service
- [x] Implement Redis caching
- [x] Add development MCP tools
- [x] Add auto-indexing of project documentation
- [x] Integrate Git monitoring for development history
- [x] Add comprehensive configuration management
- [x] Implement health checks with Redis status

### Phase 2 (Next)
- [ ] Go migration
- [ ] Performance optimization
- [ ] Advanced search features
- [ ] Multi-modal support
- [ ] Production deployment
- [ ] Enhanced self-documentation features

### Phase 3 (Future)
- [ ] AI-powered features
- [ ] Advanced analytics
- [ ] Enterprise integrations
- [ ] Global distribution
- [ ] Intelligent development assistance

## 🤝 Contributing

1. Follow the coding standards in `.cursorrules`
2. Write tests for new functionality
3. Update documentation
4. Ensure all tests pass
5. Submit pull requests

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ following MCP Knowledge Base best practices** 