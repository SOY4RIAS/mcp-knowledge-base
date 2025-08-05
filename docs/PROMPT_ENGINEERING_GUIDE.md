# Prompt Engineering Guide for MCP Knowledge Base Server

## Overview

This guide provides comprehensive prompt engineering strategies and context engineering techniques for building an MCP (Model Context Protocol) server that serves as a knowledge base using vector database technology. The guide is designed to help AI assistants understand and implement this complex system effectively.

## Context Engineering Framework

### 1. System Context Definition

**Primary Context**: You are building a Model Context Protocol (MCP) server that acts as a knowledge base using vector database technology. This server enables AI assistants to access, search, and retrieve information through semantic search capabilities.

**Key Components**:
- MCP Protocol implementation
- Vector database integration (Weaviate recommended)
- Document processing pipeline
- Embedding generation system using AI SDK
- Search and retrieval mechanisms

### 2. Technical Context Layers

#### Layer 1: MCP Protocol Understanding
```
MCP (Model Context Protocol) is a standardized way for AI assistants to interact with external tools and resources. 
Key concepts:
- Tools: Functions that the AI can call
- Resources: Data that the AI can access
- Prompts: Context templates for the AI
- Streaming: Real-time data flow
```

#### Layer 2: Vector Database Fundamentals
```
Vector databases store high-dimensional vectors (embeddings) and enable similarity search.
Core concepts:
- Embeddings: Numerical representations of data
- Similarity search: Finding vectors close to a query vector
- HNSW algorithm: Hierarchical Navigable Small World for efficient search
- Hybrid search: Combining vector and traditional search
```

#### Layer 3: Knowledge Base Architecture
```
Knowledge base systems organize and retrieve information efficiently.
Components:
- Document ingestion: Processing various file formats
- Chunking: Breaking documents into searchable pieces
- Metadata extraction: Capturing document properties
- Versioning: Tracking document changes
```

## Prompt Engineering Strategies

### 1. Role-Based Prompting

#### For System Architecture Design
```
You are a senior software architect specializing in AI-powered knowledge management systems. 
Your expertise includes:
- MCP protocol implementation
- Vector database design
- Scalable system architecture
- Performance optimization
- Hono framework and Bun runtime

Your task is to design a robust MCP server that serves as a knowledge base using vector database technology.
Consider: scalability, performance, security, and maintainability in your design decisions.
```

#### For Implementation Guidance
```
You are a senior full-stack developer with expertise in:
- Bun/JavaScript/TypeScript development
- Hono web framework
- Go programming (for future migration)
- Vector database integration
- MCP protocol implementation
- AI SDK integration
- API design and development

Provide detailed implementation guidance, code examples, and best practices for building the MCP knowledge base server.
```

#### For Testing and Quality Assurance
```
You are a QA engineer specializing in AI systems and vector databases.
Your responsibilities include:
- Unit and integration testing strategies
- Performance testing for vector operations
- Security testing for knowledge base systems
- Load testing for concurrent access
- Testing AI SDK integrations

Design comprehensive testing strategies for the MCP knowledge base server.
```

### 2. Context-Aware Prompting

#### Phase-Specific Contexts

**Phase 1 (Bun + Hono Implementation)**
```
Current Phase: Building MCP knowledge base server using Bun runtime with Hono framework
Focus Areas:
- Hono-specific optimizations and best practices
- Bun-specific performance optimizations
- JavaScript/TypeScript implementation patterns
- Weaviate client integration for Bun
- MCP protocol implementation in JavaScript
- AI SDK integration for embedding generation
- Performance considerations for Bun runtime
```

**Phase 2 (Go Migration)**
```
Current Phase: Migrating MCP knowledge base server to Go
Focus Areas:
- Go-specific performance optimizations
- Weaviate client migration to Go
- MCP protocol reimplementation in Go
- Memory management and garbage collection
- Concurrent programming patterns in Go
- AI SDK integration in Go
```

### 3. Problem-Solving Prompts

#### For Technical Challenges
```
Problem Context: [Describe specific technical challenge]
Current Constraints: [List limitations or requirements]
Desired Outcome: [Define success criteria]

As a technical expert, analyze this problem and provide:
1. Root cause analysis
2. Multiple solution approaches
3. Recommended solution with justification
4. Implementation steps
5. Risk mitigation strategies
```

#### For Performance Optimization
```
Performance Context: [Describe performance issue]
Current Metrics: [Provide current performance data]
Target Metrics: [Define performance goals]

As a performance optimization expert, provide:
1. Performance bottleneck identification
2. Optimization strategies
3. Implementation priorities
4. Measurement and monitoring approaches
5. Expected performance improvements
```

## Detailed Implementation Prompts

### 1. Project Setup and Foundation

#### Initial Project Structure
```
Create a comprehensive project structure for an MCP knowledge base server using Bun runtime with Hono framework.

Requirements:
- Modular architecture with clear separation of concerns
- TypeScript configuration for type safety
- Environment-based configuration management
- Testing framework setup
- Documentation structure
- Docker support for containerization
- Hono framework integration
- AI SDK setup

Include:
- Directory structure with explanations
- Key configuration files
- Dependencies and package.json
- Development workflow setup
- Deployment considerations
```

#### Weaviate Integration Setup
```
Design and implement Weaviate integration for the MCP knowledge base server.

Requirements:
- Connection management and pooling
- Collection schema design for documents and chunks
- Error handling and retry mechanisms
- Configuration management
- Health checks and monitoring

Include:
- Weaviate client configuration
- Collection creation and management
- Data models and schemas
- Connection pooling strategies
- Error handling patterns
```

### 2. Core Feature Implementation

#### Document Processing Pipeline
```
Implement a comprehensive document processing pipeline for the MCP knowledge base server.

Requirements:
- Support for multiple document formats (PDF, DOCX, TXT, MD)
- Intelligent document chunking with overlap
- Metadata extraction and enrichment
- Progress tracking and error handling
- Batch processing capabilities

Include:
- Document parser implementations
- Chunking algorithms and strategies
- Metadata extraction logic
- Progress tracking mechanisms
- Error handling and recovery
```

#### AI SDK Embedding Generation System
```
Design and implement an embedding generation system using AI SDK for the knowledge base.

Requirements:
- Integration with AI SDK for OpenAI-like API support
- Support for local LLM endpoints
- Batch processing for efficiency
- Caching mechanisms to reduce costs
- Error handling and retry logic
- Support for multiple embedding models
- Fallback mechanisms for different providers

Include:
- AI SDK service abstraction
- Provider-specific implementations
- Batch processing implementation
- Caching strategies
- Error handling patterns
- Configuration management
```

#### Vector Search Implementation
```
Implement comprehensive vector search capabilities for the knowledge base.

Requirements:
- Semantic search with similarity scoring
- Hybrid search (vector + text)
- Advanced filtering capabilities
- Result ranking and relevance scoring
- Pagination and result limiting

Include:
- Search query processing
- Vector similarity calculations
- Hybrid search implementation
- Filtering and sorting logic
- Result formatting and scoring
```

### 3. MCP Protocol Implementation

#### Tool Definitions
```
Define and implement MCP tools for knowledge base operations.

Required Tools:
1. knowledge_base_search - Semantic search functionality
2. knowledge_base_add - Document addition
3. knowledge_base_update - Document updates
4. knowledge_base_delete - Document deletion
5. knowledge_base_list - Document listing

For each tool, provide:
- Tool schema definition
- Parameter validation
- Implementation logic
- Error handling
- Response formatting
- Usage examples
```

#### Resource Management
```
Implement MCP resource management for knowledge base content.

Requirements:
- Document resource definitions
- Search result resources
- Metadata resource access
- Streaming capabilities for large datasets
- Resource caching and optimization

Include:
- Resource schema definitions
- Resource provider implementations
- Streaming mechanisms
- Caching strategies
- Access control patterns
```

#### Prompt Templates
```
Create context-aware prompt templates for the MCP knowledge base server.

Template Categories:
1. Search assistance prompts
2. Document analysis prompts
3. Knowledge synthesis prompts
4. Error handling prompts
5. User guidance prompts

For each template, provide:
- Template structure
- Variable placeholders
- Context considerations
- Usage scenarios
- Optimization tips
```

### 4. Advanced Features

#### RAG Integration
```
Implement Retrieval-Augmented Generation (RAG) capabilities for the knowledge base.

Requirements:
- Context retrieval from vector search
- Prompt engineering for RAG
- Response generation with citations
- Source attribution and verification
- Quality assessment mechanisms

Include:
- RAG pipeline design
- Context retrieval strategies
- Prompt engineering patterns
- Response generation logic
- Quality assessment methods
```

#### Multi-modal Support
```
Design multi-modal support for the knowledge base server.

Requirements:
- Image embedding and search
- Audio processing capabilities
- Video content analysis
- Cross-modal search functionality
- Unified search interface

Include:
- Multi-modal embedding strategies
- Content processing pipelines
- Cross-modal search algorithms
- Unified API design
- Performance considerations
```

## Testing and Quality Assurance Prompts

### 1. Unit Testing Strategy
```
Design a comprehensive unit testing strategy for the MCP knowledge base server.

Testing Areas:
- Document processing functions
- Vector operations
- MCP protocol handlers
- Authentication and authorization
- Error handling mechanisms
- AI SDK integrations
- Hono route handlers

Include:
- Test framework setup
- Mock strategies for external dependencies
- Test data management
- Coverage requirements
- CI/CD integration
```

### 2. Integration Testing
```
Create integration testing strategies for the knowledge base server.

Testing Scenarios:
- End-to-end document processing
- Vector search functionality
- MCP protocol compliance
- Performance under load
- Error recovery scenarios
- AI SDK provider switching

Include:
- Test environment setup
- Integration test scenarios
- Performance testing approaches
- Load testing strategies
- Monitoring and metrics
```

### 3. Security Testing
```
Develop security testing approaches for the knowledge base server.

Security Areas:
- Authentication and authorization
- Input validation and sanitization
- Data encryption and protection
- API security and rate limiting
- Audit logging and monitoring

Include:
- Security test scenarios
- Penetration testing approaches
- Vulnerability assessment methods
- Security monitoring strategies
- Compliance considerations
```

## Performance Optimization Prompts

### 1. Vector Database Optimization
```
Optimize Weaviate configuration and usage for maximum performance.

Optimization Areas:
- Index configuration and tuning
- Query optimization strategies
- Memory usage optimization
- Connection pooling and management
- Caching strategies

Include:
- Weaviate configuration parameters
- Query optimization techniques
- Memory management strategies
- Performance monitoring approaches
- Benchmarking methodologies
```

### 2. Application Performance
```
Optimize the MCP server application for high performance and scalability.

Optimization Areas:
- Request processing optimization
- Memory management
- Concurrent request handling
- Database connection optimization
- Caching strategies
- Hono-specific optimizations

Include:
- Performance profiling techniques
- Optimization strategies
- Scalability considerations
- Monitoring and alerting
- Capacity planning approaches
```

## Deployment and Operations Prompts

### 1. Containerization Strategy
```
Design containerization strategy for the MCP knowledge base server.

Requirements:
- Multi-stage Docker builds
- Environment-specific configurations
- Health checks and monitoring
- Resource limits and optimization
- Security hardening

Include:
- Dockerfile design
- Docker Compose configuration
- Environment management
- Security considerations
- Monitoring and logging setup
```

### 2. Production Deployment
```
Plan production deployment strategy for the knowledge base server.

Deployment Areas:
- Infrastructure requirements
- Load balancing and scaling
- Monitoring and alerting
- Backup and disaster recovery
- Security and compliance

Include:
- Infrastructure design
- Deployment automation
- Monitoring strategies
- Backup procedures
- Security measures
```

## Maintenance and Evolution Prompts

### 1. Code Maintenance
```
Establish code maintenance practices for the knowledge base server.

Maintenance Areas:
- Code review processes
- Documentation maintenance
- Dependency management
- Security updates
- Performance monitoring

Include:
- Code review guidelines
- Documentation standards
- Dependency update procedures
- Security update processes
- Performance monitoring approaches
```

### 2. Feature Evolution
```
Plan feature evolution and enhancement strategies for the knowledge base server.

Evolution Areas:
- New feature development
- API versioning strategies
- Backward compatibility
- Migration planning
- User feedback integration

Include:
- Feature development processes
- API versioning approaches
- Migration strategies
- User feedback mechanisms
- Roadmap planning
```

## Best Practices and Guidelines

### 1. Code Quality Standards
```
Establish code quality standards for the MCP knowledge base server.

Standards Areas:
- Code formatting and style
- Documentation requirements
- Testing requirements
- Performance standards
- Security requirements

Include:
- Coding standards
- Documentation guidelines
- Testing requirements
- Performance benchmarks
- Security guidelines
```

### 2. Development Workflow
```
Define development workflow for the knowledge base server project.

Workflow Components:
- Feature development process
- Code review procedures
- Testing and quality assurance
- Deployment processes
- Release management

Include:
- Development processes
- Review procedures
- Testing workflows
- Deployment strategies
- Release management
```

## Conclusion

This prompt engineering guide provides a comprehensive framework for building an MCP knowledge base server. The prompts are designed to be context-aware, role-specific, and solution-oriented, enabling AI assistants to effectively understand and implement this complex system.

Key success factors:
1. **Clear Context Definition**: Always establish the technical and business context
2. **Role-Based Prompting**: Tailor prompts to specific roles and expertise areas
3. **Progressive Complexity**: Build from simple to complex implementations
4. **Quality Focus**: Emphasize testing, security, and performance throughout
5. **Iterative Approach**: Allow for refinement and improvement based on feedback

Use these prompts as a foundation and adapt them based on specific project requirements, team expertise, and organizational constraints. 