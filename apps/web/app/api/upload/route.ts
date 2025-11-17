import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";
import { db, documents, projects } from "@archivia/database";
import { eq } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api-utils";
import {
  generateThumbnail,
  getThumbnailPath,
  supportsThumbnail,
} from "@/lib/thumbnails";

// Configure upload limits
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/webp",
  "application/pdf",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const title = formData.get("title") as string | null;
    const category = formData.get("category") as string | null;
    const period = formData.get("period") as string | null;
    const tagsStr = formData.get("tags") as string | null;

    // Validate required fields
    if (!file) {
      return errorResponse("No file provided", 400);
    }

    if (!projectId) {
      return errorResponse("Project ID is required", 400);
    }

    if (!title) {
      return errorResponse("Title is required", 400);
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse(
        `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
        400
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(
        `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        400
      );
    }

    // Verify project exists
    const [project] = await db
      .select({ id: projects.id, slug: projects.slug })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return errorResponse("Project not found", 404);
    }

    // Create upload directory for project
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      project.slug
    );
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const fileExt = path.extname(file.name);
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const timestamp = Date.now();
    const safeFileName = `${timestamp}_${uniqueId}${fileExt}`;
    const filePath = path.join(uploadDir, safeFileName);
    const publicPath = `/uploads/${project.slug}/${safeFileName}`;

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate thumbnail if supported
    let thumbnailPublicPath = publicPath;
    if (supportsThumbnail(file.type)) {
      try {
        const thumbPublicPath = getThumbnailPath(publicPath);
        const thumbAbsPath = path.join(process.cwd(), "public", thumbPublicPath);
        await generateThumbnail(filePath, thumbAbsPath);
        thumbnailPublicPath = thumbPublicPath;
      } catch (thumbErr) {
        console.error("Thumbnail generation failed:", thumbErr);
        // Continue with original file as thumbnail
      }
    }

    // Determine document type based on file
    let docType: "image" | "manuscript" | "printed" | "mixed" = "image";
    if (file.type === "application/pdf") {
      docType = "printed";
    } else if (file.type === "image/tiff") {
      docType = "manuscript";
    }

    // Parse tags
    const tags = tagsStr
      ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    // Get metadata
    const metadata: Record<string, unknown> = {
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };

    // Create document in database
    const [document] = await db
      .insert(documents)
      .values({
        projectId,
        type: docType,
        title,
        filePath: publicPath,
        thumbnailPath: thumbnailPublicPath,
        transcriptionStatus: "pending",
        category: category || undefined,
        period: period || undefined,
        tags,
        metadata,
      })
      .returning();

    return successResponse(
      {
        document,
        uploadPath: publicPath,
      },
      "File uploaded successfully",
      201
    );
  } catch (err) {
    console.error("Upload error:", err);
    return errorResponse("Failed to upload file", 500);
  }
}

// Handle multiple file uploads
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const projectId = formData.get("projectId") as string | null;

    if (!files || files.length === 0) {
      return errorResponse("No files provided", 400);
    }

    if (!projectId) {
      return errorResponse("Project ID is required", 400);
    }

    // Verify project exists
    const [project] = await db
      .select({ id: projects.id, slug: projects.slug })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return errorResponse("Project not found", 404);
    }

    // Create upload directory for project
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      project.slug
    );
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const results: { success: boolean; fileName: string; error?: string }[] =
      [];

    // Process each file
    for (const file of files) {
      try {
        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
          results.push({
            success: false,
            fileName: file.name,
            error: "Invalid file type",
          });
          continue;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          results.push({
            success: false,
            fileName: file.name,
            error: "File too large",
          });
          continue;
        }

        // Generate unique filename
        const fileExt = path.extname(file.name);
        const uniqueId = crypto.randomBytes(8).toString("hex");
        const timestamp = Date.now();
        const safeFileName = `${timestamp}_${uniqueId}${fileExt}`;
        const filePath = path.join(uploadDir, safeFileName);
        const publicPath = `/uploads/${project.slug}/${safeFileName}`;

        // Write file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Generate thumbnail if supported
        let thumbnailPublicPath = publicPath;
        if (supportsThumbnail(file.type)) {
          try {
            const thumbPublicPath = getThumbnailPath(publicPath);
            const thumbAbsPath = path.join(process.cwd(), "public", thumbPublicPath);
            await generateThumbnail(filePath, thumbAbsPath);
            thumbnailPublicPath = thumbPublicPath;
          } catch {
            // Continue with original file as thumbnail
          }
        }

        // Determine document type
        let docType: "image" | "manuscript" | "printed" | "mixed" = "image";
        if (file.type === "application/pdf") {
          docType = "printed";
        } else if (file.type === "image/tiff") {
          docType = "manuscript";
        }

        // Create document
        await db.insert(documents).values({
          projectId,
          type: docType,
          title: file.name.replace(fileExt, ""),
          filePath: publicPath,
          thumbnailPath: thumbnailPublicPath,
          transcriptionStatus: "pending",
          tags: [],
          metadata: {
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          },
        });

        results.push({
          success: true,
          fileName: file.name,
        });
      } catch (err) {
        console.error(`Error uploading ${file.name}:`, err);
        results.push({
          success: false,
          fileName: file.name,
          error: "Upload failed",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return successResponse(
      {
        results,
        summary: {
          total: files.length,
          success: successCount,
          failed: failCount,
        },
      },
      `Uploaded ${successCount} of ${files.length} files`
    );
  } catch (err) {
    console.error("Batch upload error:", err);
    return errorResponse("Failed to process uploads", 500);
  }
}
