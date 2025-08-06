# Testing Guide

This document provides comprehensive guidance for testing the MCP Knowledge Base Server following Bun testing standards.

## Overview

The project implements a comprehensive testing strategy with three main test types:

- **Unit Tests**: Test individual functions and classes in isolation
- **Integration Tests**: Test service interactions and API endpoints
- **End-to-End Tests**: Test complete user workflows and system behavior

## Test Structure

```
src/tests/
├── setup.ts                 # Global test setup and utilities
├── utils/
│   └── mocks.ts            # Mock implementations for external dependencies
├── fixtures/
│   └── test-data.ts        # Test data and fixtures
├── unit/                   # Unit tests
│   ├── embedding.service.test.ts
│   ├── weaviate.service.test.ts
│   └── document.service.test.ts
├── integration/            # Integration tests
│   └── api.test.ts
└── e2e/                   # End-to-end tests
    └── mcp-protocol.test.ts
```

## Running Tests

### Basic Commands

```bash
# Run all tests
bun test

# Run specific test suites
bun test:unit              # Unit tests only
bun test:integration       # Integration tests only
bun test:e2e              # E2E tests only

# Run tests with coverage
bun test:coverage

# Run tests in watch mode
bun test:watch

# Run todo tests
bun test:todo

# Run tests for CI/CD
bun test:ci
```

### Advanced Commands

```bash
# Run tests with specific patterns
bun test --test-name-pattern "embedding"
bun test --test-name-pattern "search"

# Run tests with preload setup
bun test --preload ./src/tests/setup.ts

# Run tests with specific timeout
bun test --timeout 30000

# Run tests with specific reporter
bun test --reporter=junit
```

## Test Configuration

### bunfig.toml

The project uses `bunfig.toml` for test configuration:

```toml
[test]
preload = ["./src/tests/setup.ts"]
timeout = 10000
coverage = true

[test.env]
NODE_ENV = "test"
TEST_MODE = "true"
```

### Environment Variables

Test-specific environment variables:

```bash
# Test environment
NODE_ENV=test
TEST_MODE=true

# Test service URLs
TEST_WEAVIATE_URL=http://localhost:8080
TEST_REDIS_URL=redis://localhost:6379
TEST_SERVER_URL=http://localhost:3000

# Test secrets
TEST_JWT_SECRET=test-jwt-secret-that-is-long-enough-for-testing
```

## Test Types

### Unit Tests

Unit tests focus on testing individual functions and classes in isolation.

**Location**: `src/tests/unit/`

**Characteristics**:
- Fast execution (< 100ms per test)
- No external dependencies
- Mocked external services
- High coverage (90%+)

**Example**:
```typescript
describe("EmbeddingService", () => {
  it("should generate embeddings for valid text", async () => {
    const text = "Test document";
    const embedding = await embeddingService.generateEmbedding(text);
    
    expect(embedding).toBeInstanceOf(Array);
    expect(embedding.length).toBe(config.embeddings.dimensions);
  });
});
```

### Integration Tests

Integration tests verify service interactions and API endpoints.

**Location**: `src/tests/integration/`

**Characteristics**:
- Medium execution time (100ms - 1s per test)
- May require test databases
- Test service interactions
- 80%+ coverage of service interactions

**Example**:
```typescript
describe("API Integration Tests", () => {
  it("should add document successfully", async () => {
    const res = await app.request("/mcp/tools/knowledge_base_add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testRequest),
    });
    
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

### End-to-End Tests

E2E tests verify complete user workflows and system behavior.

**Location**: `src/tests/e2e/`

**Characteristics**:
- Slow execution (1s - 30s per test)
- Require full application stack
- Test complete workflows
- Critical user paths only

**Example**:
```typescript
describe("MCP Protocol E2E Tests", () => {
  it("should handle full document lifecycle", async () => {
    // Add document
    const addResult = await addDocument(testDoc);
    
    // Search for document
    const searchResult = await searchDocuments(testDoc.title);
    
    // Verify document is found
    expect(searchResult.results).toContainEqual(
      expect.objectContaining({ id: addResult.document.id })
    );
  }, 30000);
});
```

## Mocking Strategy

### External Dependencies

The project mocks external dependencies to ensure test isolation:

- **Weaviate Client**: Mocked in `src/tests/utils/mocks.ts`
- **Redis Client**: Mocked for caching operations
- **AI SDK**: Mocked for embedding generation
- **Hono App**: Mocked for API testing

### Mock Examples

```typescript
// Weaviate client mock
export const mockWeaviateClient = {
  data: {
    creator: () => ({
      withClassName: () => ({
        withProperties: () => ({
          withVector: () => ({
            withId: () => ({
              do: () => Promise.resolve({ id: "test-id" }),
            }),
          }),
        }),
      }),
    }),
  },
};

// Redis client mock
export const mockRedisClient = {
  connect: () => Promise.resolve(),
  set: () => Promise.resolve("OK"),
  get: () => Promise.resolve("test-value"),
};
```

## Test Data and Fixtures

### Test Data Structure

Test data is organized in `src/tests/fixtures/test-data.ts`:

```typescript
export const testDocuments = {
  simple: {
    title: "Simple Test Document",
    content: "Basic test content",
    metadata: { source: "test", type: "txt" },
  },
  technical: {
    title: "Technical Documentation",
    content: "Technical content with API details",
    metadata: { source: "docs", type: "documentation" },
  },
};

export const testQueries = {
  simple: {
    query: "test document",
    limit: 5,
    similarity_threshold: 0.7,
  },
};
```

### Test Utilities

Common test utilities in `src/tests/setup.ts`:

```typescript
export const testUtils = {
  generateTestDocument: (overrides = {}) => ({
    title: "Test Document",
    content: "Test content",
    metadata: { source: "test", type: "txt" },
    ...overrides,
  }),
  
  generateTestEmbedding: (dimensions = 1536) => {
    // Generate normalized test embedding
  },
  
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  generateTestId: () => `test-${Date.now()}-${Math.random()}`,
};
```

## Best Practices

### Test Organization

1. **Group related tests** using `describe` blocks
2. **Use descriptive test names** that explain the expected behavior
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Keep tests independent** - no shared state between tests

### Test Naming

```typescript
// Good
it("should generate embeddings for valid text", async () => {});
it("should handle empty text gracefully", async () => {});
it("should reject invalid document data", async () => {});

// Avoid
it("should work", async () => {});
it("test 1", async () => {});
```

### Assertions

```typescript
// Use specific assertions
expect(result).toBeDefined();
expect(result.id).toBe(documentId);
expect(result.metadata.tags).toContain("technical");

// Avoid generic assertions
expect(result).toBeTruthy();
expect(result).toBe(true);
```

### Error Testing

```typescript
// Test error conditions
it("should handle invalid input", async () => {
  await expect(service.processData(null)).rejects.toThrow();
});

it("should return appropriate error code", async () => {
  const res = await app.request("/invalid-endpoint");
  expect(res.status).toBe(404);
});
```

## Coverage Goals

### Unit Tests
- **Target**: 90%+ coverage
- **Focus**: Business logic, validation, error handling
- **Exclude**: External dependencies, configuration loading

### Integration Tests
- **Target**: 80%+ coverage
- **Focus**: Service interactions, API endpoints, data flow
- **Include**: Error scenarios, edge cases

### E2E Tests
- **Target**: Critical user workflows
- **Focus**: Complete document lifecycle, MCP protocol compliance
- **Include**: Performance, scalability, error handling

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run tests
  run: |
    bun test:ci
    bun test:coverage
```

### Test Reports

The project generates test reports for CI/CD:

- **Coverage reports**: HTML and JSON formats
- **JUnit reports**: For CI/CD integration
- **Test summaries**: Console output with pass/fail statistics

## Troubleshooting

### Common Issues

1. **Test timeouts**: Increase timeout in `bunfig.toml`
2. **Mock failures**: Verify mock implementations match actual APIs
3. **Environment issues**: Check test environment variables
4. **Flaky tests**: Add retry logic or fix race conditions

### Debugging

```bash
# Run single test with verbose output
bun test --verbose src/tests/unit/embedding.service.test.ts

# Run tests with debug logging
DEBUG=* bun test

# Run tests with specific timeout
bun test --timeout 30000
```

## Performance Testing

### Load Testing

```typescript
it("should handle concurrent requests", async () => {
  const requests = Array.from({ length: 100 }, () => createRequest());
  const startTime = Date.now();
  
  const responses = await Promise.all(requests.map(sendRequest));
  const endTime = Date.now();
  
  expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
  expect(responses.every(r => r.status === 200)).toBe(true);
});
```

### Memory Testing

```typescript
it("should not leak memory", async () => {
  const initialMemory = process.memoryUsage().heapUsed;
  
  for (let i = 0; i < 1000; i++) {
    await processLargeDocument();
  }
  
  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = finalMemory - initialMemory;
  
  expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
});
```

## Contributing

When adding new tests:

1. **Follow existing patterns** and conventions
2. **Add appropriate test data** to fixtures
3. **Update documentation** if needed
4. **Ensure tests pass** in CI/CD environment
5. **Maintain coverage goals** for your changes

For more information, see the main [README.md](../README.md) and [CONTRIBUTING.md](../CONTRIBUTING.md) files. 