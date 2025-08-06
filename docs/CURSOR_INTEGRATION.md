# Cursor Integration Guide

This guide explains how to integrate the MCP Knowledge Base Server with Cursor for enhanced development assistance.

## Prerequisites

1. **Cursor IDE**: Make sure you have Cursor installed and updated
2. **MCP Knowledge Base Server**: Running on `http://localhost:3000`
3. **Dependencies**: Weaviate and Redis running (via Docker Compose)

## Setup Instructions

### 1. Start the Infrastructure

First, start the required services:

```bash
# Start Weaviate and Redis
docker-compose up -d

# Start the MCP Knowledge Base Server
bun run dev
```

### 2. Configure Cursor

#### Option A: Using Cursor Settings (Recommended)

1. Open Cursor
2. Go to **Settings** → **Extensions** → **MCP**
3. Add a new MCP server configuration:

```json
{
  "name": "mcp-knowledge-base",
  "command": "bun",
  "args": ["run", "start"],
  "cwd": "/path/to/your/mcp-knowledge-base",
  "env": {
    "NODE_ENV": "development",
    "PORT": "3000",
    "WEAVIATE_URL": "http://localhost:8080",
    "REDIS_URL": "redis://localhost:6379",
    "JWT_SECRET": "your-super-secret-jwt-key-that-is-at-least-32-characters-long",
    "OPENAI_API_KEY": "your-openai-api-key"
  }
}
```

#### Option B: Using Configuration File

1. Copy `cursor-mcp-config.json` to your Cursor configuration directory
2. Update the paths and environment variables as needed
3. Restart Cursor

### 3. Verify Connection

1. Open Cursor's command palette (`Cmd/Ctrl + Shift + P`)
2. Type "MCP" and look for MCP-related commands
3. Check if the knowledge base tools are available

## Available Tools

Once connected, you'll have access to these MCP tools in Cursor:

### 1. `knowledge_base_add`
Add documents to the knowledge base for later retrieval.

**Example Usage:**
```json
{
  "title": "React Component Best Practices",
  "content": "When creating React components, always use functional components with hooks...",
  "source": "cursor",
  "metadata": {
    "type": "documentation",
    "tags": ["react", "frontend", "best-practices"],
    "language": "en"
  }
}
```

### 2. `knowledge_base_search`
Search the knowledge base for relevant information.

**Example Usage:**
```json
{
  "query": "React component patterns",
  "limit": 5,
  "similarity_threshold": 0.7,
  "filters": {
    "tags": ["react"],
    "type": "documentation"
  }
}
```

### 3. `knowledge_base_stats`
Get statistics about the knowledge base.

**Example Usage:**
```json
{}
```

### 4. `development_info_search`
Search for development-related information.

**Example Usage:**
```json
{
  "query": "testing strategies",
  "context": "testing",
  "limit": 3
}
```

## Usage Examples

### Adding Code Documentation

```json
{
  "title": "API Authentication Implementation",
  "content": "To implement JWT authentication in the API, first install the required packages...",
  "source": "cursor",
  "metadata": {
    "type": "code",
    "tags": ["api", "authentication", "jwt", "security"],
    "language": "en"
  }
}
```

### Searching for Solutions

```json
{
  "query": "How to handle async operations in React",
  "limit": 3,
  "filters": {
    "tags": ["react", "async"],
    "type": "documentation"
  }
}
```

### Getting Project Statistics

```json
{
  "query": "knowledge_base_stats"
}
```

## Integration Workflows

### 1. Code Documentation Workflow

1. **Add Code Snippets**: Use `knowledge_base_add` to document important code patterns
2. **Search for Examples**: Use `knowledge_base_search` to find similar implementations
3. **Get Context**: Use `development_info_search` for broader development guidance

### 2. Problem-Solving Workflow

1. **Search Existing Solutions**: Use `knowledge_base_search` to find similar problems
2. **Add New Solutions**: Use `knowledge_base_add` to document successful solutions
3. **Get Statistics**: Use `knowledge_base_stats` to understand your knowledge base

### 3. Learning Workflow

1. **Add Learning Materials**: Use `knowledge_base_add` to store learning resources
2. **Search for Topics**: Use `knowledge_base_search` to find related information
3. **Track Progress**: Use `knowledge_base_stats` to see your knowledge growth

## Troubleshooting

### Common Issues

#### 1. Connection Failed
- **Check**: Ensure the server is running on `http://localhost:3000`
- **Solution**: Restart the server with `bun run dev`

#### 2. Tools Not Available
- **Check**: Verify MCP configuration in Cursor settings
- **Solution**: Restart Cursor after configuration changes

#### 3. Search Returns No Results
- **Check**: Ensure documents have been added to the knowledge base
- **Solution**: Add some test documents using `knowledge_base_add`

#### 4. Weaviate Connection Issues
- **Check**: Ensure Weaviate is running on `http://localhost:8080`
- **Solution**: Start with `docker-compose up -d`

### Debug Commands

```bash
# Check server health
curl http://localhost:3000/health

# Check available tools
curl http://localhost:3000/mcp/tools

# Test adding a document
curl -X POST http://localhost:3000/mcp/tools/knowledge_base_add \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test content","source":"test"}'

# Test searching
curl -X POST http://localhost:3000/mcp/tools/knowledge_base_search \
  -H "Content-Type: application/json" \
  -d '{"query":"test","limit":5}'
```

## Best Practices

### 1. Document Organization
- Use consistent tags for categorization
- Include source information for traceability
- Use descriptive titles and content

### 2. Search Optimization
- Use specific, descriptive queries
- Leverage filters to narrow results
- Adjust similarity thresholds based on needs

### 3. Knowledge Management
- Regularly add new knowledge
- Update existing documents when needed
- Use the stats tool to monitor growth

### 4. Integration Tips
- Keep the server running during development sessions
- Use the tools consistently for better results
- Combine with Cursor's AI features for enhanced assistance

## Advanced Configuration

### Custom Environment Variables

You can customize the server behavior by setting environment variables:

```bash
# Development mode
NODE_ENV=development

# Custom ports
PORT=3000
WEAVIATE_URL=http://localhost:8080
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-secret-key

# AI Configuration
OPENAI_API_KEY=your-openai-key
EMBEDDING_MODEL=text-embedding-ada-002
```

### Performance Tuning

For better performance in Cursor:

1. **Increase Search Limits**: Set higher limits for broader searches
2. **Adjust Similarity Thresholds**: Lower thresholds for more results
3. **Use Filters**: Apply filters to reduce search scope
4. **Batch Operations**: Add multiple documents at once

## Support

If you encounter issues:

1. Check the server logs for error messages
2. Verify all dependencies are running
3. Test the API endpoints directly
4. Review the troubleshooting section above

For additional help, refer to the main [README.md](../README.md) and [TESTING.md](TESTING.md) files. 