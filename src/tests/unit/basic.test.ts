import { describe, it, expect } from "bun:test";
import { testUtils } from "../setup";

describe("Basic Tests", () => {
  it("should pass basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should generate test utilities", () => {
    const testId = testUtils.generateTestId();
    expect(testId).toBeDefined();
    expect(typeof testId).toBe("string");
    expect(testId.startsWith("test-")).toBe(true);
  });

  it("should generate test documents", () => {
    const testDoc = testUtils.generateTestDocument();
    expect(testDoc).toBeDefined();
    expect(testDoc.title).toBe("Test Document");
    expect(testDoc.content).toBe("This is a test document for unit testing.");
    expect(testDoc.metadata).toBeDefined();
  });

  it("should generate test embeddings", () => {
    const embedding = testUtils.generateTestEmbedding();
    expect(embedding).toBeInstanceOf(Array);
    expect(embedding.length).toBe(1536);
    expect(embedding.every((val) => typeof val === "number")).toBe(true);
  });
});
