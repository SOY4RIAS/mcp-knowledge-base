import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { config, weaviateConfig, embeddingConfig } from "@/config";
import { EmbeddingService } from "@/services/embedding";
import { WeaviateService } from "@/services/weaviate";
import { DocumentService } from "@/services/document";
import { SelfIndexingService } from "@/services/self-indexing";
import { RedisService } from "@/services/redis";
import { createMCPRoutes } from "@/api/mcp";
import { AppError } from "@/models";

/**
 * Main Application Entry Point
 * Sets up the MCP Knowledge Base Server
 */
class MCPKnowledgeBaseServer {
  private app: Hono;
  private documentService!: DocumentService;
  private embeddingService!: EmbeddingService;
  private weaviateService!: WeaviateService;
  private selfIndexingService!: SelfIndexingService;
  private redisService!: RedisService;

  constructor() {
    this.app = new Hono();
    this.setupServices();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Initialize services
   */
  private setupServices() {
    console.log("Initializing services...");

    // Initialize Redis service
    this.redisService = new RedisService();

    // Initialize embedding service
    this.embeddingService = new EmbeddingService(embeddingConfig);

    // Initialize Weaviate service
    this.weaviateService = new WeaviateService(weaviateConfig);

    // Initialize document service
    this.documentService = new DocumentService(
      this.embeddingService,
      this.weaviateService
    );

    // Initialize self-indexing service
    this.selfIndexingService = new SelfIndexingService(this.documentService);

    console.log("Services initialized successfully");
  }

  /**
   * Setup middleware
   */
  private setupMiddleware() {
    // CORS middleware
    this.app.use(
      "*",
      cors({
        origin: config.server.cors.origin,
        credentials: config.server.cors.credentials,
      })
    );

    // Logging middleware
    this.app.use("*", logger());

    // Request timing middleware
    this.app.use("*", async (c, next) => {
      const start = Date.now();
      await next();
      const end = Date.now();
      console.log(`${c.req.method} ${c.req.url} - ${end - start}ms`);
    });
  }

  /**
   * Setup routes
   */
  private setupRoutes() {
    // Health check endpoint
    this.app.get("/", (c) => {
      return c.json({
        message: "MCP Knowledge Base Server",
        version: "1.0.0",
        status: "healthy",
        timestamp: new Date().toISOString(),
      });
    });

    // Health check endpoint
    this.app.get("/health", async (c) => {
      try {
        const connections = await this.documentService.testConnections();
        const redisConnected = this.redisService.isRedisConnected();

        const health = {
          status:
            connections.embedding && connections.weaviate && redisConnected
              ? "healthy"
              : "degraded",
          timestamp: new Date(),
          uptime: process.uptime(),
          version: "1.0.0",
          services: {
            embedding: {
              status: connections.embedding ? "healthy" : "unhealthy",
            },
            weaviate: {
              status: connections.weaviate ? "healthy" : "unhealthy",
            },
            redis: {
              status: redisConnected ? "healthy" : "unhealthy",
            },
          },
          stats: {
            totalDocuments: 0, // Will be implemented later
            collectionName: "documents",
          },
        };

        return c.json(health);
      } catch (error) {
        console.error("Health check failed:", error);
        return c.json(
          {
            status: "unhealthy",
            timestamp: new Date(),
            error: "Health check failed",
          },
          500
        );
      }
    });

    // MCP routes
    this.app.route("/mcp", createMCPRoutes(this.documentService));

    // Self-indexing routes
    this.app.post("/api/v1/self-index", async (c) => {
      try {
        await this.selfIndexingService.triggerIndexing();
        return c.json({
          success: true,
          message: "Self-indexing triggered successfully",
        });
      } catch (error) {
        console.error("Self-indexing failed:", error);
        return c.json(
          {
            success: false,
            error: "Self-indexing failed",
          },
          500
        );
      }
    });

    this.app.get("/api/v1/self-index/status", (c) => {
      const status = this.selfIndexingService.getStatus();
      return c.json({
        success: true,
        data: status,
      });
    });

    // API documentation
    this.app.get("/docs", (c) => {
      return c.json({
        message: "MCP Knowledge Base Server API",
        version: "1.0.0",
        endpoints: {
          "GET /": "Server information",
          "GET /health": "Health check",
          "GET /mcp/tools": "Get available MCP tools",
          "POST /mcp/tools/:toolName": "Execute MCP tool",
          "POST /api/v1/self-index": "Trigger self-indexing",
          "GET /api/v1/self-index/status": "Get self-indexing status",
        },
        tools: [
          "knowledge_base_search",
          "knowledge_base_add",
          "knowledge_base_update",
          "knowledge_base_delete",
          "knowledge_base_list",
          "knowledge_base_stats",
        ],
      });
    });

    // 404 handler
    this.app.notFound((c) => {
      return c.status(404).json({
        error: "Not Found",
        message: "The requested resource was not found",
        path: c.req.path,
      });
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling() {
    this.app.onError((err, c) => {
      console.error("Application error:", err);

      if (err instanceof AppError) {
        return c.json(
          {
            error: {
              message: err.message,
              code: err.code,
              statusCode: err.statusCode,
              details: err.details,
            },
          },
          err.statusCode
        );
      }

      // Handle other errors
      return c.json(
        {
          error: {
            message: "Internal Server Error",
            code: "INTERNAL_ERROR",
            statusCode: 500,
          },
        },
        500
      );
    });
  }

  /**
   * Initialize the server
   */
  async initialize(): Promise<void> {
    try {
      console.log("Initializing MCP Knowledge Base Server...");

      // Connect to Redis
      await this.redisService.connect();

      // Initialize Weaviate schema
      await this.weaviateService.initializeSchema();

      // Test connections
      const connections = await this.documentService.testConnections();
      console.log("Service connections:", connections);

      // Start self-indexing service
      await this.selfIndexingService.startAutoIndexing();

      console.log("Server initialized successfully");
    } catch (error) {
      console.error("Failed to initialize server:", error);
      throw error;
    }
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    try {
      await this.initialize();

      const port = config.server.port;
      const host = config.server.host;

      console.log(`Starting server on ${host}:${port}`);
      console.log(`Environment: ${config.server.environment}`);

      serve({
        fetch: this.app.fetch,
        port,
        hostname: host,
      });

      console.log(`Server started successfully on http://${host}:${port}`);
      console.log(`Health check: http://${host}:${port}/health`);
      console.log(`API docs: http://${host}:${port}/docs`);
      console.log(`MCP tools: http://${host}:${port}/mcp/tools`);
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  }

  /**
   * Get the Hono app instance
   */
  getApp(): Hono {
    return this.app;
  }
}

// Start the server if this file is run directly
if (import.meta.main) {
  const server = new MCPKnowledgeBaseServer();
  server.start().catch((error) => {
    console.error("Server startup failed:", error);
    process.exit(1);
  });
}

export default MCPKnowledgeBaseServer;
