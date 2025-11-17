import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import type { ApiResponse } from "@archivia/shared-types";

export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function errorResponse(
  error: string,
  status = 400
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

export function validationErrorResponse(
  zodError: ZodError
): NextResponse<ApiResponse<never>> {
  const issues = zodError.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });

  return NextResponse.json(
    {
      success: false,
      error: `Validation failed: ${issues.join(", ")}`,
    },
    { status: 400 }
  );
}

export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse<ApiResponse<never>> }> {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    return { data: parsed };
  } catch (err) {
    if (err instanceof ZodError) {
      return { error: validationErrorResponse(err) };
    }
    if (err instanceof SyntaxError) {
      return { error: errorResponse("Invalid JSON body", 400) };
    }
    return { error: errorResponse("Failed to parse request body", 400) };
  }
}

export function parseSearchParams<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): { data: T } | { error: NextResponse<ApiResponse<never>> } {
  try {
    const params: Record<string, string | string[]> = {};

    searchParams.forEach((value, key) => {
      const existing = params[key];
      if (existing) {
        if (Array.isArray(existing)) {
          existing.push(value);
        } else {
          params[key] = [existing, value];
        }
      } else {
        params[key] = value;
      }
    });

    const parsed = schema.parse(params);
    return { data: parsed };
  } catch (err) {
    if (err instanceof ZodError) {
      return { error: validationErrorResponse(err) };
    }
    return { error: errorResponse("Failed to parse query parameters", 400) };
  }
}
