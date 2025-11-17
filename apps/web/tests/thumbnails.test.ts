import { describe, it, expect } from "vitest";
import { getThumbnailPath, supportsThumbnail } from "@/lib/thumbnails";

describe("Thumbnails utility", () => {
  describe("getThumbnailPath", () => {
    it("should generate correct thumbnail path for JPEG", () => {
      const result = getThumbnailPath("/uploads/test/image.jpg");
      expect(result).toBe("/uploads/test/thumbnails/image_thumb.jpg");
    });

    it("should generate correct thumbnail path for PNG", () => {
      const result = getThumbnailPath("/uploads/project/photo.png");
      expect(result).toBe("/uploads/project/thumbnails/photo_thumb.jpg");
    });

    it("should handle nested directories", () => {
      const result = getThumbnailPath("/uploads/a/b/c/file.webp");
      expect(result).toBe("/uploads/a/b/c/thumbnails/file_thumb.jpg");
    });
  });

  describe("supportsThumbnail", () => {
    it("should return true for JPEG", () => {
      expect(supportsThumbnail("image/jpeg")).toBe(true);
    });

    it("should return true for PNG", () => {
      expect(supportsThumbnail("image/png")).toBe(true);
    });

    it("should return true for WebP", () => {
      expect(supportsThumbnail("image/webp")).toBe(true);
    });

    it("should return true for TIFF", () => {
      expect(supportsThumbnail("image/tiff")).toBe(true);
    });

    it("should return true for GIF", () => {
      expect(supportsThumbnail("image/gif")).toBe(true);
    });

    it("should return false for PDF", () => {
      expect(supportsThumbnail("application/pdf")).toBe(false);
    });

    it("should return false for text", () => {
      expect(supportsThumbnail("text/plain")).toBe(false);
    });
  });
});
