import { NextRequest } from "next/server";
import { db, projectMembers, users } from "@archivia/database";
import { eq, and } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { auth } from "@/lib/auth";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["editor", "viewer"]),
});

// GET /api/projects/[id]/members - List project members
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    // Check if user has access to project
    const [membership] = await db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, id),
          eq(projectMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (!membership && session.user.role !== "admin") {
      return errorResponse("Access denied", 403);
    }

    // Get all members with user info
    const members = await db
      .select({
        id: projectMembers.id,
        userId: projectMembers.userId,
        role: projectMembers.role,
        addedAt: projectMembers.addedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(projectMembers)
      .innerJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, id));

    return successResponse(members);
  } catch (err) {
    console.error("Failed to fetch members:", err);
    return errorResponse("Failed to fetch members", 500);
  }
}

// POST /api/projects/[id]/members - Add a member
export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    // Check if user is owner or admin
    const [membership] = await db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, id),
          eq(projectMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (
      (!membership || membership.role !== "owner") &&
      session.user.role !== "admin"
    ) {
      return errorResponse("Only project owners can add members", 403);
    }

    // Parse body
    const body = await request.json();
    const parsed = addMemberSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid input: " + parsed.error.message, 400);
    }

    const { email, role } = parsed.data;

    // Find user by email
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!targetUser) {
      return errorResponse(`User with email '${email}' not found`, 404);
    }

    // Check if already a member
    const [existing] = await db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, id),
          eq(projectMembers.userId, targetUser.id)
        )
      )
      .limit(1);

    if (existing) {
      return errorResponse("User is already a member", 400);
    }

    // Add member
    const [newMember] = await db
      .insert(projectMembers)
      .values({
        projectId: id,
        userId: targetUser.id,
        role,
        addedBy: session.user.id,
      })
      .returning();

    return successResponse(
      {
        ...newMember,
        userName: targetUser.name,
        userEmail: targetUser.email,
      },
      "Member added successfully",
      201
    );
  } catch (err) {
    console.error("Failed to add member:", err);
    return errorResponse("Failed to add member", 500);
  }
}

// DELETE /api/projects/[id]/members - Remove a member
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return errorResponse("memberId query param required", 400);
    }

    // Check if user is owner or admin
    const [membership] = await db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, id),
          eq(projectMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (
      (!membership || membership.role !== "owner") &&
      session.user.role !== "admin"
    ) {
      return errorResponse("Only project owners can remove members", 403);
    }

    // Can't remove the owner
    const [targetMember] = await db
      .select()
      .from(projectMembers)
      .where(eq(projectMembers.id, memberId))
      .limit(1);

    if (!targetMember) {
      return errorResponse("Member not found", 404);
    }

    if (targetMember.role === "owner") {
      return errorResponse("Cannot remove project owner", 400);
    }

    await db.delete(projectMembers).where(eq(projectMembers.id, memberId));

    return successResponse({ memberId }, "Member removed successfully");
  } catch (err) {
    console.error("Failed to remove member:", err);
    return errorResponse("Failed to remove member", 500);
  }
}
