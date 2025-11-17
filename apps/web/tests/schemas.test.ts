import { describe, it, expect } from "vitest";
import { createProjectSchema, updateDocumentSchema } from "@archivia/shared-types";

describe("Project Schema Validation", () => {
  it("should validate a minimal project", () => {
    const data = {
      name: "Test Project",
      slug: "test-project",
    };

    const result = createProjectSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should validate a complete project", () => {
    const data = {
      name: "Heritage Collection",
      slug: "heritage-collection",
      description: "A collection of historical documents",
      config: {
        features: {
          ocr: true,
          annotations: true,
        },
        primaryLanguage: "fra",
      },
      metadata: {
        institution: "Museum",
        curator: "John Doe",
        themes: ["history", "art"],
      },
    };

    const result = createProjectSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject project without name", () => {
    const data = {
      slug: "test-project",
    };

    const result = createProjectSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject project without slug", () => {
    const data = {
      name: "Test Project",
    };

    const result = createProjectSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject invalid slug format", () => {
    const data = {
      name: "Test Project",
      slug: "Invalid Slug With Spaces",
    };

    const result = createProjectSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("Document Schema Validation", () => {
  it("should validate document update with title", () => {
    const data = {
      title: "New Title",
    };

    const result = updateDocumentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should validate document update with tags", () => {
    const data = {
      tags: ["tag1", "tag2", "tag3"],
    };

    const result = updateDocumentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should validate document update with transcription status", () => {
    const data = {
      transcriptionStatus: "completed",
    };

    const result = updateDocumentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject invalid transcription status", () => {
    const data = {
      transcriptionStatus: "invalid",
    };

    const result = updateDocumentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should validate empty update", () => {
    const data = {};

    const result = updateDocumentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
