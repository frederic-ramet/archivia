import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Projects table
export const projects = sqliteTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),

  // JSON fields stored as text
  config: text("config", { mode: "json" })
    .$type<ProjectConfigDB>()
    .notNull()
    .default(sql`'{}'`),
  branding: text("branding", { mode: "json" })
    .$type<ProjectBrandingDB>()
    .notNull()
    .default(sql`'{}'`),
  metadata: text("metadata", { mode: "json" })
    .$type<ProjectMetadataDB>()
    .notNull()
    .default(sql`'{}'`),

  status: text("status", { enum: ["draft", "active", "archived"] })
    .notNull()
    .default("active"),
  isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Documents table
export const documents = sqliteTable("documents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  type: text("type", {
    enum: ["image", "manuscript", "printed", "mixed"],
  }).notNull(),
  title: text("title").notNull(),
  filePath: text("file_path").notNull(),
  thumbnailPath: text("thumbnail_path"),

  transcription: text("transcription"),
  transcriptionStatus: text("transcription_status", {
    enum: ["pending", "processing", "completed", "verified"],
  })
    .notNull()
    .default("pending"),
  transcriptionProvider: text("transcription_provider"),

  category: text("category"),
  period: text("period"),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  historicalContext: text("historical_context"),

  metadata: text("metadata", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'`),

  position: integer("position").notNull().default(0),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Entities table (for ontology)
export const entities = sqliteTable("entities", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  type: text("type", {
    enum: ["person", "place", "concept", "object", "event"],
  }).notNull(),
  name: text("name").notNull(),
  normalizedName: text("normalized_name"),
  aliases: text("aliases", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  description: text("description"),
  properties: text("properties", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'`),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Entity relationships
export const entityRelationships = sqliteTable("entity_relationships", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sourceId: text("source_id")
    .notNull()
    .references(() => entities.id, { onDelete: "cascade" }),
  targetId: text("target_id")
    .notNull()
    .references(() => entities.id, { onDelete: "cascade" }),

  relationType: text("relation_type").notNull(),
  properties: text("properties", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'`),
  weight: real("weight").notNull().default(1.0),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Annotations table
export const annotations = sqliteTable("annotations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  userId: text("user_id"),

  type: text("type", {
    enum: ["note", "correction", "hotspot", "region"],
  }).notNull(),
  content: text("content"),

  x: real("x"),
  y: real("y"),
  width: real("width"),
  height: real("height"),

  metadata: text("metadata", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'`),
  status: text("status", { enum: ["draft", "published", "archived"] })
    .notNull()
    .default("draft"),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Type definitions for JSON fields
interface ProjectConfigDB {
  features?: {
    ocr?: boolean;
    annotations?: boolean;
    hotspots?: boolean;
    stories?: boolean;
    timeline?: boolean;
    map?: boolean;
    ontology?: boolean;
    aiGeneration?: boolean;
    publicReader?: boolean;
    collaboration?: boolean;
  };
  primaryLanguage?: string;
  acceptedFormats?: string[];
}

interface ProjectBrandingDB {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  footerText?: string;
}

interface ProjectMetadataDB {
  institution?: string;
  curator?: string;
  contributors?: string[];
  periodStart?: string;
  periodEnd?: string;
  themes?: string[];
  license?: string;
}

// ============================================================================
// Authentication tables (NextAuth compatible)
// ============================================================================

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text("image"),
  password: text("password"), // Hashed password for credentials auth
  role: text("role", { enum: ["admin", "curator", "viewer"] })
    .notNull()
    .default("viewer"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const accounts = sqliteTable("accounts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

// ============================================================================
// Application configuration (API keys, settings)
// ============================================================================

export const appConfig = sqliteTable("app_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  encrypted: integer("encrypted", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedBy: text("updated_by").references(() => users.id),
});

// ============================================================================
// Project members (multi-user permissions)
// ============================================================================

export const projectMembers = sqliteTable("project_members", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["owner", "editor", "viewer"] })
    .notNull()
    .default("viewer"),
  addedAt: text("added_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  addedBy: text("added_by").references(() => users.id),
});
