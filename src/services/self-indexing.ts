import { DocumentService } from "./document";
import type { Document } from "@/models";
import { DevelopmentContext, DocumentType } from "@/models";
import { config } from "@/config";
import { readFile, readdir, stat } from "fs/promises";
import { join, extname, basename } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Self-Indexing Service
 * Automatically indexes project documentation and development information
 */
export class SelfIndexingService {
  private documentService: DocumentService;
  private isIndexing = false;
  private indexingInterval?: NodeJS.Timeout;

  constructor(documentService: DocumentService) {
    this.documentService = documentService;
  }

  /**
   * Start auto-indexing process
   */
  async startAutoIndexing(): Promise<void> {
    if (!config.selfIndexing.enabled) {
      console.log("Self-indexing is disabled");
      return;
    }

    console.log("Starting self-indexing service...");

    // Initial indexing
    await this.performIndexing();

    // Set up periodic indexing
    const interval = config.selfIndexing.autoIndexInterval;
    this.indexingInterval = setInterval(async () => {
      await this.performIndexing();
    }, interval);

    console.log(`Self-indexing service started with ${interval}ms interval`);
  }

  /**
   * Stop auto-indexing process
   */
  stopAutoIndexing(): void {
    if (this.indexingInterval) {
      clearInterval(this.indexingInterval);
      this.indexingInterval = undefined;
      console.log("Self-indexing service stopped");
    }
  }

  /**
   * Perform the indexing process
   */
  private async performIndexing(): Promise<void> {
    if (this.isIndexing) {
      console.log("Indexing already in progress, skipping...");
      return;
    }

    this.isIndexing = true;
    console.log("Starting indexing process...");

    try {
      // Index documentation files
      await this.indexDocumentation();

      // Index code files
      await this.indexCodeFiles();

      // Index development history
      await this.indexDevelopmentHistory();

      // Index project structure
      await this.indexProjectStructure();

      console.log("Indexing process completed successfully");
    } catch (error) {
      console.error("Indexing process failed:", error);
    } finally {
      this.isIndexing = false;
    }
  }

  /**
   * Index documentation files
   */
  private async indexDocumentation(): Promise<void> {
    const docExtensions = [".md", ".txt", ".rst", ".adoc"];
    const docPaths = ["docs/", "README.md", "CHANGELOG.md", "CONTRIBUTING.md"];

    for (const path of docPaths) {
      try {
        await this.indexFile(path, DevelopmentContext.DOCUMENTATION);
      } catch (error) {
        console.warn(`Failed to index documentation file ${path}:`, error);
      }
    }

    // Index all files in docs directory
    try {
      await this.indexDirectory(
        "docs/",
        docExtensions,
        DevelopmentContext.DOCUMENTATION
      );
    } catch (error) {
      console.warn("Failed to index docs directory:", error);
    }
  }

  /**
   * Index code files
   */
  private async indexCodeFiles(): Promise<void> {
    const codeExtensions = [
      ".ts",
      ".js",
      ".tsx",
      ".jsx",
      ".json",
      ".yaml",
      ".yml",
    ];

    try {
      await this.indexDirectory(
        "src/",
        codeExtensions,
        DevelopmentContext.CODE
      );
    } catch (error) {
      console.warn("Failed to index src directory:", error);
    }

    // Index configuration files
    const configFiles = [
      "package.json",
      "tsconfig.json",
      "docker-compose.yml",
      "Dockerfile",
    ];
    for (const file of configFiles) {
      try {
        await this.indexFile(file, DevelopmentContext.CONFIGURATION);
      } catch (error) {
        console.warn(`Failed to index config file ${file}:`, error);
      }
    }
  }

  /**
   * Index development history from Git
   */
  private async indexDevelopmentHistory(): Promise<void> {
    try {
      // Get recent commits
      const { stdout: commits } = await execAsync(
        'git log --oneline --since="1 week ago" --pretty=format:"%h %s"'
      );

      if (commits.trim()) {
        const document: Document = {
          id: `git-history-${Date.now()}`,
          title: "Recent Development History",
          content: commits,
          metadata: {
            source: "git-history",
            type: DocumentType.DEVELOPMENT_HISTORY,
            tags: ["git", "development", "history"],
            language: "en",
            size: commits.length,
            mime_type: "text/plain",
            custom_fields: {},
          },
          chunks: [],
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
          status: "pending" as any,
        };

        await this.documentService.addDocument(document);
      }

      // Get current branch and status
      const { stdout: branch } = await execAsync("git branch --show-current");
      const { stdout: status } = await execAsync("git status --porcelain");

      if (status.trim()) {
        const document: Document = {
          id: `git-status-${Date.now()}`,
          title: `Git Status - ${branch.trim()}`,
          content: `Branch: ${branch.trim()}\nStatus:\n${status}`,
          metadata: {
            source: "git-status",
            type: DocumentType.DEVELOPMENT_STATUS,
            tags: ["git", "development", "status"],
            language: "en",
            size: status.length,
            mime_type: "text/plain",
            custom_fields: {},
          },
          chunks: [],
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
          status: "pending" as any,
        };

        await this.documentService.addDocument(document);
      }
    } catch (error) {
      console.warn("Failed to index development history:", error);
    }
  }

  /**
   * Index project structure
   */
  private async indexProjectStructure(): Promise<void> {
    try {
      const structure = await this.generateProjectStructure(".");

      const document: Document = {
        id: `project-structure-${Date.now()}`,
        title: "Project Structure",
        content: structure,
        metadata: {
          source: "project-structure",
          type: DocumentType.PROJECT_STRUCTURE,
          tags: ["project", "structure", "development"],
          language: "en",
          size: structure.length,
          mime_type: "text/plain",
          custom_fields: {},
        },
        chunks: [],
        created_at: new Date(),
        updated_at: new Date(),
        version: 1,
        status: "pending" as any,
      };

      await this.documentService.addDocument(document);
    } catch (error) {
      console.warn("Failed to index project structure:", error);
    }
  }

  /**
   * Index a single file
   */
  private async indexFile(
    filePath: string,
    context: DevelopmentContext
  ): Promise<void> {
    try {
      const content = await readFile(filePath, "utf-8");
      const fileName = basename(filePath);
      const extension = extname(filePath);

      // Map context to document type
      let documentType: DocumentType;
      switch (context) {
        case DevelopmentContext.CODE:
          documentType = DocumentType.CODE;
          break;
        case DevelopmentContext.DOCUMENTATION:
          documentType = DocumentType.DOCUMENTATION;
          break;
        case DevelopmentContext.CONFIGURATION:
          documentType = DocumentType.CONFIGURATION;
          break;
        default:
          documentType = DocumentType.TXT;
      }

      const document: Document = {
        id: `${fileName}-${Date.now()}`,
        title: fileName,
        content,
        metadata: {
          source: filePath,
          type: documentType,
          tags: [context, extension.replace(".", "")],
          language: "en",
          size: content.length,
          mime_type: "text/plain",
          custom_fields: {},
          filePath,
        },
        chunks: [],
        created_at: new Date(),
        updated_at: new Date(),
        version: 1,
        status: "pending" as any,
      };

      await this.documentService.addDocument(document);
    } catch (error) {
      throw new Error(`Failed to index file ${filePath}: ${error}`);
    }
  }

  /**
   * Index a directory recursively
   */
  private async indexDirectory(
    dirPath: string,
    extensions: string[],
    context: DevelopmentContext
  ): Promise<void> {
    try {
      const files = await this.getFilesRecursively(dirPath, extensions);

      for (const file of files) {
        try {
          await this.indexFile(file, context);
        } catch (error) {
          console.warn(`Failed to index file ${file}:`, error);
        }
      }
    } catch (error) {
      throw new Error(`Failed to index directory ${dirPath}: ${error}`);
    }
  }

  /**
   * Get all files in a directory recursively
   */
  private async getFilesRecursively(
    dirPath: string,
    extensions: string[]
  ): Promise<string[]> {
    const files: string[] = [];

    try {
      const items = await readdir(dirPath);

      for (const item of items) {
        const fullPath = join(dirPath, item);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          // Skip node_modules and .git
          if (item === "node_modules" || item === ".git") {
            continue;
          }
          const subFiles = await this.getFilesRecursively(fullPath, extensions);
          files.push(...subFiles);
        } else if (stats.isFile()) {
          const ext = extname(item);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to read directory ${dirPath}:`, error);
    }

    return files;
  }

  /**
   * Generate project structure as text
   */
  private async generateProjectStructure(
    dirPath: string,
    prefix = ""
  ): Promise<string> {
    const structure: string[] = [];

    try {
      const items = await readdir(dirPath);

      for (const item of items) {
        if (item === "node_modules" || item === ".git" || item === "dist") {
          continue;
        }

        const fullPath = join(dirPath, item);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          structure.push(`${prefix}📁 ${item}/`);
          const subStructure = await this.generateProjectStructure(
            fullPath,
            prefix + "  "
          );
          structure.push(subStructure);
        } else {
          structure.push(`${prefix}📄 ${item}`);
        }
      }
    } catch (error) {
      console.warn(`Failed to generate structure for ${dirPath}:`, error);
    }

    return structure.join("\n");
  }

  /**
   * Get indexing status
   */
  getStatus(): { isIndexing: boolean; lastIndexed?: Date } {
    return {
      isIndexing: this.isIndexing,
    };
  }

  /**
   * Trigger manual indexing
   */
  async triggerIndexing(): Promise<void> {
    console.log("Manual indexing triggered");
    await this.performIndexing();
  }
}
