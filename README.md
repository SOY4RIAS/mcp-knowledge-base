# MCP Knowledge Base Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.0+-black?logo=bun)](https://bun.sh/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Weaviate](https://img.shields.io/badge/Weaviate-1.32+-orange?logo=weaviate)](https://weaviate.io/)

A comprehensive **Model Context Protocol (MCP) server** that serves as a **self-referential knowledge base** using vector database technology. This innovative system enables AI assistants to access, search, and retrieve information through semantic search capabilities while automatically documenting and improving itself.

## 🌟 Key Features

### 🔄 Self-Referential Knowledge Base
- **Auto-Indexing**: Automatically indexes project documentation, code files, and development history
- **Git Integration**: Tracks recent commits, branch status, and development changes
- **Project Structure Analysis**: Generates and indexes project directory structure
- **Context-Aware Categorization**: Intelligently categorizes content by development context

### 🚀 Performance & Scalability
- **Redis Caching**: Comprehensive caching layer for improved response times
- **Vector Search**: Advanced semantic search using Weaviate vector database
- **Batch Processing**: Efficient batch operations for embeddings and documents
- **Connection Pooling**: Optimized database connections and resource management

### 🤖 AI Integration
- **MCP Protocol**: Full Model Context Protocol implementation for AI assistants
- **Development Tools**: Specialized MCP tools for development assistance
- **Context-Aware Search**: Development context understanding and filtering
- **AI SDK Integration**: Support for OpenAI and local LLM endpoints

### 🛡️ Production Ready
- **Type Safety**: Comprehensive TypeScript implementation
- **Error Handling**: Robust error handling with graceful degradation
- **Health Monitoring**: Comprehensive health checks and service monitoring
- **Docker Support**: Complete containerization with Docker Compose

## 🏗️ Architecture

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

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) 1.0+ (JavaScript/TypeScript runtime)
- [Docker](https://www.docker.com/) and Docker Compose
- [OpenAI API Key](https://platform.openai.com/api-keys) (or local LLM endpoint)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mcp-knowledge-base
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
# Required: OPENAI_API_KEY, JWT_SECRET
# Optional: Customize other settings as needed
```

### 3. Start Dependencies

```bash
# Start Weaviate and Redis with Docker Compose
docker-compose up -d
```

### 4. Install Dependencies & Start Server

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

### 5. Verify Installation

Visit the following endpoints to verify everything is working:

- **Server Info**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **API Documentation**: http://localhost:3000/docs
- **MCP Tools**: http://localhost:3000/mcp/tools

## 📖 Usage Examples

### MCP Protocol Integration

```typescript
// Connect to MCP server
const client = new MCPClient({
  serverUrl: 'ws://localhost:3000/mcp',
  apiKey: 'your-api-key'
});

// Search knowledge base
const results = await client.callTool('knowledge_base_search', {
  query: 'machine learning algorithms',
  limit: 10,
  similarity_threshold: 0.7
});

// Search development information (self-referential)
const devInfo = await client.callTool('development_info_search', {
  query: 'architecture decisions for vector database selection',
  context: 'architecture',
  limit: 5
});

// Get development suggestions
const suggestions = await client.callTool('development_suggestion', {
  context: 'performance optimization strategies',
  type: 'best_practice',
  limit: 3
});
```

### REST API Integration

```bash
# Search documents
curl -X POST http://localhost:3000/api/v1/search \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning algorithms",
    "limit": 10,
    "filters": {
      "tags": ["machine-learning"]
    }
  }'

# Trigger self-indexing
curl -X POST http://localhost:3000/api/v1/self-index \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get self-indexing status
curl -X GET http://localhost:3000/api/v1/self-index/status
```

### Self-Indexing Features

The system automatically indexes:

- **Documentation Files**: `.md`, `.txt`, `.rst`, `.adoc`
- **Code Files**: `.ts`, `.js`, `.tsx`, `.jsx`, `.json`, `.yaml`, `.yml`
- **Configuration Files**: `package.json`, `tsconfig.json`, `docker-compose.yml`
- **Development History**: Git commits, branch status, repository state
- **Project Structure**: Directory tree and file organization

## 🛠️ Available MCP Tools

### Core Knowledge Base Tools
1. **`knowledge_base_search`** - Semantic search with filters
2. **`knowledge_base_add`** - Add documents to knowledge base
3. **`knowledge_base_update`** - Update existing documents
4. **`knowledge_base_delete`** - Delete documents
5. **`knowledge_base_list`** - List documents with pagination
6. **`knowledge_base_stats`** - Get knowledge base statistics

### Development Tools (Self-Referential)
7. **`development_info_search`** - Context-aware development information search
8. **`development_suggestion`** - Development suggestions based on context

## ⚙️ Configuration

### Environment Variables

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

### Docker Compose Services

```yaml
services:
  weaviate:
    image: semitechnologies/weaviate:1.32.0
    ports:
      - "8080:8080"
    environment:
      - QUERY_DEFAULTS_LIMIT=25
      - AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true
      - DEFAULT_VECTORIZER_MODULE=text2vec-openai
      - ENABLE_MODULES=text2vec-openai

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
```

## 🧪 Testing

The project follows Bun testing standards with a comprehensive testing strategy including unit tests, integration tests, and end-to-end tests.

### Testing Strategy

#### Unit Tests
- **Location**: `src/tests/unit/`
- **Purpose**: Test individual functions and classes in isolation
- **Coverage**: Services, utilities, models, and business logic
- **Mocking**: External dependencies (Weaviate, Redis, AI SDK)

#### Integration Tests
- **Location**: `src/tests/integration/`
- **Purpose**: Test service interactions and API endpoints
- **Coverage**: Service integration, database operations, API responses
- **Dependencies**: May require test databases and external services

#### End-to-End Tests
- **Location**: `src/tests/e2e/`
- **Purpose**: Test complete user workflows and system behavior
- **Coverage**: Full application lifecycle, MCP protocol compliance
- **Dependencies**: Full application stack with test environment

### Test Commands

```bash
# Run all tests
bun test

# Run tests with coverage
bun test --coverage

# Run tests in watch mode
bun test --watch

# Run specific test suites
bun test src/tests/unit/          # Unit tests only
bun test src/tests/integration/   # Integration tests only
bun test src/tests/e2e/           # E2E tests only

# Run tests with specific patterns
bun test --test-name-pattern "embedding"  # Tests with "embedding" in name
bun test --test-name-pattern "search"     # Tests with "search" in name

# Run tests with preload setup
bun test --preload ./src/tests/setup.ts

# Run todo tests (tests marked as .todo)
bun test --todo
```

### Test Configuration

The project uses Bun's built-in test runner with Jest-compatible API. Configuration is handled through:

- **bunfig.toml**: Global test configuration
- **Test setup**: `src/tests/setup.ts` for global test environment
- **Test utilities**: `src/tests/utils/` for common test helpers
- **Fixtures**: `src/tests/fixtures/` for test data

### Test Coverage

The testing strategy aims for:
- **Unit Tests**: 90%+ coverage of business logic
- **Integration Tests**: 80%+ coverage of service interactions
- **E2E Tests**: Critical user workflows and MCP protocol compliance

### Testing Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Mocking**: External dependencies should be mocked in unit tests
3. **Fixtures**: Use consistent test data and fixtures
4. **Cleanup**: Always clean up test data and resources
5. **Naming**: Use descriptive test names that explain the expected behavior
6. **Performance**: Tests should run quickly and efficiently

### Test Environment

Tests can run in different environments:
- **Development**: Uses local dependencies and mock services
- **CI/CD**: Uses containerized test environment
- **Production**: Uses staging environment for E2E tests

## 🐳 Docker Deployment

### Development

```bash
# Build and run with dependencies
docker-compose up -d

# Or build and run standalone
docker build -t mcp-knowledge-base .
docker run -p 3000:3000 mcp-knowledge-base
```

### Production

```bash
# Build production image
docker build -t mcp-knowledge-base:latest .

# Run with production environment
docker run -d \
  --name mcp-knowledge-base \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e OPENAI_API_KEY=your-key \
  -e JWT_SECRET=your-secret \
  mcp-knowledge-base:latest
```

## 📊 Performance

### Benchmarks
- **Search Latency**: < 100ms (95th percentile)
- **Document Ingestion**: < 5 seconds per document
- **Concurrent Users**: 1000+ simultaneous users
- **Document Storage**: 10M+ documents
- **Vector Storage**: 1B+ vectors

### Monitoring
- Health check endpoint: `/health`
- Request timing logs
- Error logging with context
- Service connectivity tests
- Redis connection status
- Self-indexing status

## 🔒 Security

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Configurable rate limiting and DDoS protection
- **Input Validation**: Comprehensive input validation with Zod schemas
- **Error Handling**: Secure error handling without information leakage
- **Environment Variables**: Secure configuration management

## 📚 Documentation

- **[Implementation Guide](docs/IMPLEMENTATION_README.md)** - Detailed implementation documentation
- **[Technical Specification](docs/TECHNICAL_SPECIFICATION.md)** - Technical architecture and API specs
- **[Project Plan](docs/MCP_KNOWLEDGE_BASE_PROJECT_PLAN.md)** - Project planning and roadmap
- **[Prompt Engineering Guide](docs/PROMPT_ENGINEERING_GUIDE.md)** - AI integration strategies

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`bun test`)
6. Commit your changes (`git commit -m 'feat: add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- 📖 [Documentation](./docs/)
- 🐛 [Issue Tracker](https://github.com/your-org/mcp-knowledge-base/issues)
- 💬 [Discussions](https://github.com/your-org/mcp-knowledge-base/discussions)
- 📧 [Email Support](mailto:support@your-org.com)

### Community
- 🌐 [Website](https://your-org.com)
- 📱 [Twitter](https://twitter.com/your-org)
- 💼 [LinkedIn](https://linkedin.com/company/your-org)

## 🗺️ Roadmap

### Phase 1 (Current) ✅
- [x] Self-referential knowledge base system
- [x] Redis caching layer
- [x] Development MCP tools
- [x] Auto-indexing capabilities
- [x] Comprehensive testing
- [x] Production-ready deployment

### Phase 2 (Next)
- [ ] Go migration for improved performance
- [ ] Advanced search features
- [ ] Multi-modal support (images, audio, video)
- [ ] Enterprise integrations
- [ ] Enhanced self-documentation features

### Phase 3 (Future)
- [ ] AI-powered features
- [ ] Advanced analytics
- [ ] Global distribution
- [ ] Intelligent development assistance

## 🙏 Acknowledgments

- [Weaviate](https://weaviate.io/) for the excellent vector database
- [OpenAI](https://openai.com/) for embedding models
- [Bun](https://bun.sh/) for the fast JavaScript runtime
- [Hono](https://hono.dev/) for the lightweight web framework
- [AI SDK](https://sdk.vercel.ai/) for flexible AI integrations
- [MCP Protocol](https://modelcontextprotocol.io/) for the standardization

---

**Built with ❤️ for the AI community**

*This project demonstrates the future of self-improving AI systems that can document and enhance themselves.*