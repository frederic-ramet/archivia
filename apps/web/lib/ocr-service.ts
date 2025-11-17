import Anthropic from "@anthropic-ai/sdk";
import { db, appConfig } from "@archivia/database";
import { eq } from "drizzle-orm";
import { readFile } from "fs/promises";
import path from "path";

interface OCRResult {
  text: string;
  confidence?: number;
  language?: string;
  metadata?: Record<string, unknown>;
}

interface OCROptions {
  language?: string;
  extractEntities?: boolean;
}

/**
 * Get Anthropic API key from database or environment
 */
async function getAnthropicApiKey(): Promise<string | null> {
  // First try database
  const [config] = await db
    .select()
    .from(appConfig)
    .where(eq(appConfig.key, "ANTHROPIC_API_KEY"))
    .limit(1);

  if (config && config.value) {
    return config.value;
  }

  // Fallback to environment
  return process.env.ANTHROPIC_API_KEY || null;
}

/**
 * Get OCR language configuration
 */
async function getOCRLanguage(): Promise<string> {
  const [config] = await db
    .select()
    .from(appConfig)
    .where(eq(appConfig.key, "OCR_LANGUAGE"))
    .limit(1);

  return config?.value || process.env.OCR_LANGUAGE || "fra";
}

/**
 * Convert image file to base64
 */
async function imageToBase64(imagePath: string): Promise<string> {
  const absolutePath = path.join(process.cwd(), "public", imagePath);
  const buffer = await readFile(absolutePath);
  return buffer.toString("base64");
}

/**
 * Get media type from file path
 */
function getMediaType(
  filePath: string
): "image/jpeg" | "image/png" | "image/webp" | "image/gif" {
  const ext = path.extname(filePath).toLowerCase();
  const types: Record<
    string,
    "image/jpeg" | "image/png" | "image/webp" | "image/gif"
  > = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  return types[ext] || "image/jpeg";
}

/**
 * Language name mapping for prompts
 */
const languageNames: Record<string, string> = {
  fra: "French",
  eng: "English",
  deu: "German",
  spa: "Spanish",
  ita: "Italian",
};

/**
 * Perform OCR on an image using Claude Vision
 */
export async function performOCR(
  imagePath: string,
  options: OCROptions = {}
): Promise<OCRResult> {
  const apiKey = await getAnthropicApiKey();

  if (!apiKey) {
    throw new Error(
      "Anthropic API key not configured. Please set it in Admin Settings."
    );
  }

  const language = options.language || (await getOCRLanguage());
  const languageName = languageNames[language] || "French";

  const anthropic = new Anthropic({
    apiKey,
  });

  const imageBase64 = await imageToBase64(imagePath);
  const mediaType = getMediaType(imagePath);

  const systemPrompt = `You are an expert OCR system specialized in historical document transcription. Your task is to extract and transcribe ALL text visible in the image with high accuracy.

Guidelines:
- Transcribe the text exactly as it appears, preserving original spelling and formatting
- Maintain paragraph structure and line breaks
- If handwritten, transcribe as accurately as possible, noting any uncertain characters with [?]
- Preserve any special characters, accents, and diacritics
- The primary language is ${languageName}, but transcribe any text in other languages as well
- If the image contains no readable text, respond with "[No text detected]"
- Do not add any commentary or interpretation, only the transcribed text`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: "Please transcribe all the text visible in this image.",
          },
        ],
      },
    ],
  });

  // Extract text from response
  const textContent = response.content.find((block) => block.type === "text");
  const transcribedText = textContent
    ? (textContent as { type: "text"; text: string }).text
    : "";

  return {
    text: transcribedText.trim(),
    language,
    metadata: {
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      stopReason: response.stop_reason,
    },
  };
}

/**
 * Check if OCR is available (API key configured)
 */
export async function isOCRAvailable(): Promise<boolean> {
  const apiKey = await getAnthropicApiKey();
  return !!apiKey;
}
