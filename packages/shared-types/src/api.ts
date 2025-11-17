import { z } from "zod";

// ============================================================================
// Base API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Project Validation Schemas
// ============================================================================

export const projectConfigSchema = z.object({
  features: z.object({
    ocr: z.boolean().default(true),
    annotations: z.boolean().default(true),
    hotspots: z.boolean().default(false),
    stories: z.boolean().default(false),
    timeline: z.boolean().default(false),
    map: z.boolean().default(false),
    ontology: z.boolean().default(false),
    aiGeneration: z.boolean().default(false),
    publicReader: z.boolean().default(true),
    collaboration: z.boolean().default(false),
  }),
  primaryLanguage: z.string().default("fr"),
  acceptedFormats: z.array(z.string()).default(["jpg", "png", "tiff"]),
});

export const projectBrandingSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#A67B5B"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#E8D5C4"),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#3B82F6"),
  logoUrl: z.string().url().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  footerText: z.string().optional(),
});

export const projectMetadataSchema = z.object({
  institution: z.string().optional(),
  curator: z.string().optional(),
  contributors: z.array(z.string()).default([]),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  geographicScope: z.string().optional(),
  themes: z.array(z.string()).default([]),
  license: z.string().default("CC BY-NC-SA 4.0"),
});

export const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().optional(),
  config: projectConfigSchema.optional(),
  branding: projectBrandingSchema.optional(),
  metadata: projectMetadataSchema.optional(),
  isPublic: z.boolean().default(false),
});

export const updateProjectSchema = createProjectSchema.partial();

// ============================================================================
// Document Validation Schemas
// ============================================================================

export const createDocumentSchema = z.object({
  projectId: z.string().uuid(),
  type: z.enum(["image", "manuscript", "printed", "mixed"]).default("image"),
  title: z.string().min(1).max(255),
  filePath: z.string().min(1),
  thumbnailPath: z.string().optional(),
  transcription: z.string().optional(),
  transcriptionStatus: z
    .enum(["pending", "processing", "completed", "verified"])
    .default("pending"),
  category: z.string().optional(),
  period: z.string().optional(),
  tags: z.array(z.string()).default([]),
  physicalMetadata: z
    .object({
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
      format: z.string().optional(),
      dpi: z.number().positive().optional(),
      size: z.number().positive().optional(),
    })
    .optional(),
  historicalContext: z.string().optional(),
  position: z.number().int().nonnegative().optional(),
});

export const updateDocumentSchema = createDocumentSchema.partial().omit({
  projectId: true,
});

// ============================================================================
// Entity Validation Schemas
// ============================================================================

export const createEntitySchema = z.object({
  projectId: z.string().uuid(),
  type: z.enum(["person", "place", "date", "event", "concept", "object"]),
  name: z.string().min(1).max(255),
  normalizedName: z.string().optional(),
  description: z.string().optional(),
  aliases: z.array(z.string()).default([]),
  properties: z.record(z.string(), z.unknown()).default({}),
  confidence: z.number().min(0).max(1).default(1),
  source: z.enum(["manual", "ai_extracted", "imported"]).default("manual"),
});

export const updateEntitySchema = createEntitySchema.partial().omit({
  projectId: true,
});

// ============================================================================
// Annotation Validation Schemas
// ============================================================================

export const createAnnotationSchema = z.object({
  documentId: z.string().uuid(),
  type: z.enum(["highlight", "note", "tag", "hotspot", "entity_link"]),
  content: z.string().optional(),
  position: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
    width: z.number().min(0).max(100).optional(),
    height: z.number().min(0).max(100).optional(),
  }),
  entityId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateAnnotationSchema = createAnnotationSchema.partial().omit({
  documentId: true,
});

// ============================================================================
// Query Parameter Schemas
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const projectQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  isPublic: z.coerce.boolean().optional(),
});

export const documentQuerySchema = paginationSchema.extend({
  projectId: z.string().uuid().optional(),
  type: z.enum(["image", "manuscript", "printed", "mixed"]).optional(),
  transcriptionStatus: z
    .enum(["pending", "processing", "completed", "verified"])
    .optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// ============================================================================
// Type exports from schemas
// ============================================================================

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type CreateEntityInput = z.infer<typeof createEntitySchema>;
export type UpdateEntityInput = z.infer<typeof updateEntitySchema>;
export type CreateAnnotationInput = z.infer<typeof createAnnotationSchema>;
export type UpdateAnnotationInput = z.infer<typeof updateAnnotationSchema>;
export type ProjectQuery = z.infer<typeof projectQuerySchema>;
export type DocumentQuery = z.infer<typeof documentQuerySchema>;
