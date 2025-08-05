# MCP Knowledge Base Server

A comprehensive Model Context Protocol (MCP) server that serves as a knowledge base using vector database technology. This server enables AI assistants to access, search, and retrieve information through semantic search capabilities.

## 🚀 Project Overview

This project provides a complete solution for building an MCP server that acts as a knowledge base, leveraging the power of vector databases for semantic search and retrieval. The system is designed to be scalable, performant, and production-ready.

### Key Features

- **Semantic Search**: Advanced vector-based search using Weaviate
- **Document Processing**: Support for multiple document formats (PDF, DOCX, TXT, MD)
- **MCP Protocol**: Full Model Context Protocol implementation
- **REST API**: Traditional REST endpoints for direct integration (Hono-based)
- **Real-time Updates**: WebSocket support for live updates
- **Security**: JWT authentication and role-based access control
- **Scalability**: Designed to handle millions of documents and vectors
- **Multi-modal Support**: Ready for images, audio, and video content
- **Flexible Embeddings**: AI SDK integration supporting OpenAI and local LLM endpoints
- **Self-Referential Knowledge Base**: The project will use itself to store and retrieve development-related information

## 🔄 Self-Referential Knowledge Base

This project will implement a unique self-referential capability where it uses its own knowledge base to store and retrieve information related to its development process. This includes:

### Development Information Storage
- **Code Documentation**: Automatically indexed code comments, JSDoc, and inline documentation
- **Architecture Decisions**: Records of design decisions, trade-offs, and rationale
- **Implementation Notes**: Development progress, challenges, and solutions
- **Performance Metrics**: Historical performance data and optimization attempts
- **Bug Reports**: Issues, resolutions, and workarounds
- **Feature Requests**: User feedback and enhancement tracking

### Self-Documentation Features
- **Auto-Indexing**: Automatically processes and indexes all project documentation
- **Development History**: Tracks changes, commits, and evolution of the codebase
- **Knowledge Synthesis**: Combines information from multiple sources to provide comprehensive answers
- **Context-Aware Search**: Understands development context and provides relevant information
- **Learning System**: Improves responses based on development patterns and user interactions

### Use Cases
- **Onboarding**: New developers can query the knowledge base about project structure and decisions
- **Troubleshooting**: Search for similar issues and their solutions
- **Architecture Reviews**: Understand design decisions and their context
- **Performance Optimization**: Find historical performance data and optimization strategies
- **Feature Development**: Access related features, dependencies, and implementation patterns

This self-referential approach demonstrates the power of the MCP Knowledge Base Server and serves as both a practical tool and a proof of concept for the system's capabilities.

## 📚 Documentation

This repository contains comprehensive documentation for building the MCP knowledge base server:

### 1. [Project Plan](./MCP_KNOWLEDGE_BASE_PROJECT_PLAN.md)
Complete project planning document including:
- Executive summary and objectives
- Vector database recommendations (Weaviate)
- Technology stack and architecture
- Implementation timeline (Bun + Hono → Go migration)
- Core features and specifications
- Performance requirements and success metrics

### 2. [Prompt Engineering Guide](./PROMPT_ENGINEERING_GUIDE.md)
Comprehensive prompt engineering strategies for building the system:
- Context engineering framework
- Role-based prompting strategies
- Implementation-specific prompts
- Testing and quality assurance prompts
- Performance optimization guidance

### 3. [Technical Specification](./TECHNICAL_SPECIFICATION.md)
Detailed technical implementation guide including:
- System architecture and data models
- API specifications and MCP protocol implementation
- Vector database schema (Weaviate)
- Security architecture and performance specifications
- Deployment and testing strategies

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   MCP Client    │    │   MCP Server     │    │  Vector DB      │
│   (AI Assistant)│◄──►│  (Knowledge Base)│◄──►│  (Weaviate)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Embedding API   │
                       │  (AI SDK + OpenAI-like) │
                       └──────────────────┘
```

## 🛠️ Technology Stack

### Phase 1: Bun + Hono Implementation
- **Runtime**: Bun (JavaScript/TypeScript)
- **Framework**: Hono (lightweight, fast web framework)
- **Vector Database**: Weaviate
- **Embedding Service**: AI SDK with OpenAI-like API support
- **Cache**: Redis
- **Containerization**: Docker

### Phase 2: Go Migration
- **Runtime**: Go 1.21+
- **Vector Database**: Weaviate
- **Embedding Service**: AI SDK with OpenAI-like API support
- **Framework**: Gin or Echo
- **Cache**: Redis
- **Containerization**: Docker

## 🚀 Quick Start

### Prerequisites
- Bun 1.0+ (for Phase 1)
- Go 1.21+ (for Phase 2)
- Docker and Docker Compose
- Weaviate instance
- OpenAI API key or local LLM endpoint

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mcp-knowledge-base
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start dependencies with Docker Compose**
   ```bash
   docker-compose up -d weaviate redis
   ```

4. **Install dependencies and start development server**
   ```bash
   bun install
   bun run dev
   ```

### Production Deployment

1. **Build the Docker image**
   ```bash
   docker build -t mcp-knowledge-base .
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Or deploy to Kubernetes**
   ```bash
   kubectl apply -f k8s/
   ```

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

// Add document to knowledge base
const document = await client.callTool('knowledge_base_add', {
  title: 'Introduction to Machine Learning',
  content: 'Machine learning is a subset of artificial intelligence...',
  source: 'academic-paper',
  metadata: {
    author: 'John Doe',
    tags: ['machine-learning', 'ai', 'tutorial']
  }
});

// Query development information (self-referential)
const devInfo = await client.callTool('knowledge_base_search', {
  query: 'architecture decisions for vector database selection',
  limit: 5,
  filters: {
    tags: ['development', 'architecture', 'weaviate']
  }
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

# Add document
curl -X POST http://localhost:3000/api/v1/documents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Machine Learning",
    "content": "Machine learning is a subset of artificial intelligence...",
    "source": "academic-paper",
    "metadata": {
      "author": "John Doe",
      "tags": ["machine-learning", "ai", "tutorial"]
    }
  }'

# Query development information
curl -X POST http://localhost:3000/api/v1/search \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "performance optimization strategies",
    "limit": 5,
    "filters": {
      "tags": ["development", "performance", "optimization"]
    }
  }'
```

### Hono Route Example

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

// Middleware
app.use('*', cors())
app.use('*', logger())

// Routes
app.get('/', (c) => c.text('MCP Knowledge Base Server'))

app.route('/api/v1', apiRoutes)
app.route('/mcp', mcpRoutes)

export default app
```

## 🔧 Configuration

### Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Weaviate Configuration
WEAVIATE_URL=http://localhost:8080
WEAVIATE_API_KEY=your-weaviate-api-key
WEAVIATE_COLLECTION_NAME=documents

# AI SDK Configuration
AI_SDK_PROVIDER=openai  # openai, local, custom
OPENAI_API_KEY=your-openai-api-key
LOCAL_LLM_BASE_URL=http://localhost:11434  # For local LLM endpoints
CUSTOM_EMBEDDING_BASE_URL=https://your-custom-endpoint.com

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Security
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Self-Referential Features
ENABLE_SELF_INDEXING=true
DEVELOPMENT_COLLECTION_NAME=development_docs
AUTO_INDEX_INTERVAL=3600000  # 1 hour in milliseconds
```

### Weaviate Configuration

The system uses Weaviate as the vector database. Key configuration options:

```yaml
# docker-compose.yml
weaviate:
  image: semitechnologies/weaviate:1.32.0
  environment:
    - QUERY_DEFAULTS_LIMIT=25
    - AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true
    - PERSISTENCE_DATA_PATH=/var/lib/weaviate
    - DEFAULT_VECTORIZER_MODULE=text2vec-openai
    - ENABLE_MODULES=text2vec-openai
    - CLUSTER_HOSTNAME=node1
```

### AI SDK Configuration

The system uses AI SDK for flexible embedding generation:

```typescript
// OpenAI configuration
const openaiConfig = {
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'text-embedding-ada-002'
}

// Local LLM configuration
const localConfig = {
  provider: 'local',
  baseUrl: 'http://localhost:11434',
  model: 'nomic-embed-text'
}

// Custom endpoint configuration
const customConfig = {
  provider: 'custom',
  baseUrl: 'https://your-custom-endpoint.com',
  apiKey: process.env.CUSTOM_API_KEY
}
```

## 📊 Performance

### Benchmarks
- **Search Latency**: < 100ms (95th percentile)
- **Document Ingestion**: < 5 seconds per document
- **Concurrent Users**: 1000+ simultaneous users
- **Document Storage**: 10M+ documents
- **Vector Storage**: 1B+ vectors

### Monitoring

The system includes comprehensive monitoring:
- Prometheus metrics
- Health checks
- Performance dashboards
- Error tracking
- Usage analytics

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Editor, Viewer)
- API key authentication for service-to-service communication
- Rate limiting and DDoS protection

### Data Protection
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- Secure WebSocket connections
- Audit logging for compliance

## 🧪 Testing

### Test Coverage
- Unit tests for all core services
- Integration tests for API endpoints
- Performance tests for vector operations
- Security tests for authentication and authorization
- Load tests for concurrent access

### Running Tests

```bash
# Run all tests
bun test

# Run specific test suites
bun test --grep "unit"
bun test --grep "integration"
bun test --grep "performance"

# Run tests with coverage
bun test --coverage
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

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

### Phase 1 (Current)
- [x] Project planning and architecture design
- [x] Documentation and specifications
- [ ] Core MCP server implementation (Bun + Hono)
- [ ] Weaviate integration
- [ ] AI SDK embedding service
- [ ] Basic search functionality
- [ ] Document processing pipeline
- [ ] Self-referential knowledge base implementation

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

## 🙏 Acknowledgments

- [Weaviate](https://weaviate.io/) for the excellent vector database
- [OpenAI](https://openai.com/) for embedding models
- [Bun](https://bun.sh/) for the fast JavaScript runtime
- [Hono](https://hono.dev/) for the lightweight web framework
- [AI SDK](https://sdk.vercel.ai/) for flexible AI integrations
- [MCP Protocol](https://modelcontextprotocol.io/) for the standardization

---

**Built with ❤️ for the AI community** 