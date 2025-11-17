import { NextRequest } from "next/server";
import { db, projects } from "@archivia/database";
import { eq } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { generateStory, isStoryGenerationAvailable } from "@/lib/story-generator";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/projects/[id]/story - Generate a narrative story
export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    // Check availability
    const available = await isStoryGenerationAvailable();
    if (!available) {
      return errorResponse(
        "Story generation not configured. Please add your Anthropic API key in Admin Settings.",
        503
      );
    }

    // Verify project exists
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!project) {
      return errorResponse(`Project with id '${id}' not found`, 404);
    }

    // Parse options
    let options = {};
    try {
      const body = await request.json();
      options = body || {};
    } catch {
      // Use defaults
    }

    // Generate story
    const story = await generateStory(id, options);

    return successResponse(story, "Story generated successfully");
  } catch (err) {
    console.error("Story generation error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Story generation failed";
    return errorResponse(errorMessage, 500);
  }
}
