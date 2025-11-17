import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db, appConfig } from "@archivia/database";
import { eq } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api-utils";

// GET /api/admin/config - Get all config values (admin only)
export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const configs = await db.select().from(appConfig);

    // Mask sensitive values
    const safeConfigs = configs.map((c) => ({
      key: c.key,
      value: c.encrypted ? "***ENCRYPTED***" : c.value,
      encrypted: c.encrypted,
      updatedAt: c.updatedAt,
    }));

    return successResponse(safeConfigs);
  } catch (err) {
    console.error("Failed to fetch config:", err);
    return errorResponse("Failed to fetch configuration", 500);
  }
}

// POST /api/admin/config - Set a config value (admin only)
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const { key, value, encrypted = false } = body;

    if (!key || value === undefined) {
      return errorResponse("Key and value are required", 400);
    }

    // Validate known keys
    const allowedKeys = [
      "ANTHROPIC_API_KEY",
      "OPENAI_API_KEY",
      "OCR_PROVIDER",
      "OCR_LANGUAGE",
      "MAX_UPLOAD_SIZE",
      "STORAGE_PATH",
    ];

    if (!allowedKeys.includes(key)) {
      return errorResponse(`Invalid config key: ${key}`, 400);
    }

    // Upsert the config
    const existing = await db
      .select()
      .from(appConfig)
      .where(eq(appConfig.key, key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(appConfig)
        .set({
          value,
          encrypted,
          updatedAt: new Date().toISOString(),
          updatedBy: session.user.id,
        })
        .where(eq(appConfig.key, key));
    } else {
      await db.insert(appConfig).values({
        key,
        value,
        encrypted,
        updatedBy: session.user.id,
      });
    }

    return successResponse({ key, saved: true }, "Configuration saved");
  } catch (err) {
    console.error("Failed to save config:", err);
    return errorResponse("Failed to save configuration", 500);
  }
}

// DELETE /api/admin/config - Delete a config value (admin only)
export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return errorResponse("Key is required", 400);
    }

    await db.delete(appConfig).where(eq(appConfig.key, key));

    return successResponse({ key, deleted: true }, "Configuration deleted");
  } catch (err) {
    console.error("Failed to delete config:", err);
    return errorResponse("Failed to delete configuration", 500);
  }
}
