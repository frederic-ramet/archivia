// Project types
export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  config: ProjectConfig;
  branding: ProjectBranding;
  metadata: ProjectMetadata;
  status: "draft" | "active" | "archived";
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectConfig {
  features: {
    ocr: boolean;
    annotations: boolean;
    hotspots: boolean;
    stories: boolean;
    timeline: boolean;
    map: boolean;
    ontology: boolean;
    aiGeneration: boolean;
    publicReader: boolean;
    collaboration: boolean;
  };
  primaryLanguage: string;
  acceptedFormats: string[];
}

export interface ProjectBranding {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  heroTitle: string;
  heroSubtitle: string;
  footerText: string;
}

export interface ProjectMetadata {
  institution?: string;
  curator?: string;
  contributors: string[];
  periodStart?: string;
  periodEnd?: string;
  themes: string[];
  license: string;
}

// Document types
export interface Document {
  id: string;
  projectId: string;
  type: "image" | "manuscript" | "printed" | "mixed";
  title: string;
  filePath: string;
  thumbnailPath?: string;
  transcription?: string;
  transcriptionStatus: "pending" | "processing" | "completed" | "verified";
  category?: string;
  period?: string;
  tags: string[];
  historicalContext?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Entity types (for ontology)
export interface Entity {
  id: string;
  projectId: string;
  type: "person" | "place" | "concept" | "object" | "event";
  name: string;
  aliases: string[];
  description?: string;
  properties: Record<string, unknown>;
  createdAt: Date;
}

export interface EntityRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: string;
  properties: Record<string, unknown>;
  weight: number;
  createdAt: Date;
}

// Annotation types
export interface Annotation {
  id: string;
  documentId: string;
  userId: string;
  type: "note" | "correction" | "hotspot" | "region";
  content: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  metadata: Record<string, unknown>;
  status: "draft" | "published" | "archived";
  createdAt: Date;
}

// Hotspot types
export interface Hotspot {
  id: string;
  documentId: string;
  entityId?: string;
  x: number;
  y: number;
  radius: number;
  label: string;
  color: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

// Story types
export interface Story {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  coverImageId?: string;
  content: StoryItem[];
  published: boolean;
  createdAt: Date;
}

export interface StoryItem {
  order: number;
  documentId: string;
  transition: string;
  focusPoints: string[];
  questions: string[];
  duration: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Export API validation schemas
export * from "./api";
