import sharp from "sharp";
import path from "path";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";

interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
}

const DEFAULT_OPTIONS: ThumbnailOptions = {
  width: 400,
  height: 300,
  quality: 80,
};

/**
 * Generates a thumbnail for an image file
 * @param sourcePath - Absolute path to the source image
 * @param destPath - Absolute path for the thumbnail
 * @param options - Thumbnail options
 * @returns Path to the generated thumbnail
 */
export async function generateThumbnail(
  sourcePath: string,
  destPath: string,
  options: ThumbnailOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Ensure destination directory exists
  const destDir = path.dirname(destPath);
  if (!existsSync(destDir)) {
    await mkdir(destDir, { recursive: true });
  }

  await sharp(sourcePath)
    .resize(opts.width, opts.height, {
      fit: "cover",
      position: "center",
    })
    .jpeg({ quality: opts.quality })
    .toFile(destPath);

  return destPath;
}

/**
 * Generates thumbnail path from original file path
 * @param originalPath - Public path of the original file
 * @returns Public path for the thumbnail
 */
export function getThumbnailPath(originalPath: string): string {
  const dir = path.dirname(originalPath);
  const ext = path.extname(originalPath);
  const base = path.basename(originalPath, ext);
  return path.join(dir, "thumbnails", `${base}_thumb.jpg`);
}

/**
 * Checks if a file type supports thumbnail generation
 * @param mimeType - MIME type of the file
 * @returns true if thumbnails can be generated
 */
export function supportsThumbnail(mimeType: string): boolean {
  const supported = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/tiff",
    "image/gif",
  ];
  return supported.includes(mimeType);
}
