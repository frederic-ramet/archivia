import Anthropic from "@anthropic-ai/sdk";
import { db, appConfig, projects, documents, entities, entityRelationships } from "@archivia/database";
import { eq } from "drizzle-orm";

interface StoryOptions {
  style?: "narrative" | "documentary" | "educational";
  length?: "short" | "medium" | "long";
  focus?: string; // Entity name to focus on
}

interface GeneratedStory {
  title: string;
  content: string;
  metadata: {
    style: string;
    length: string;
    wordCount: number;
    entitiesUsed: string[];
    generatedAt: string;
  };
}

async function getAnthropicApiKey(): Promise<string | null> {
  const [config] = await db
    .select()
    .from(appConfig)
    .where(eq(appConfig.key, "ANTHROPIC_API_KEY"))
    .limit(1);

  return config?.value || process.env.ANTHROPIC_API_KEY || null;
}

/**
 * Fetch all relevant data for story generation
 */
async function fetchProjectContext(projectId: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    throw new Error("Project not found");
  }

  const projectDocuments = await db
    .select()
    .from(documents)
    .where(eq(documents.projectId, projectId));

  const projectEntities = await db
    .select()
    .from(entities)
    .where(eq(entities.projectId, projectId));

  const entityIds = new Set(projectEntities.map((e) => e.id));
  const allRelationships = await db.select().from(entityRelationships);
  const projectRelationships = allRelationships.filter(
    (r) => entityIds.has(r.sourceId) && entityIds.has(r.targetId)
  );

  return { project, documents: projectDocuments, entities: projectEntities, relationships: projectRelationships };
}

/**
 * Generate a narrative story from project data
 */
export async function generateStory(
  projectId: string,
  options: StoryOptions = {}
): Promise<GeneratedStory> {
  const apiKey = await getAnthropicApiKey();
  if (!apiKey) {
    throw new Error("Anthropic API key not configured");
  }

  const style = options.style || "narrative";
  const length = options.length || "medium";

  const context = await fetchProjectContext(projectId);
  const { project, documents: docs, entities: ents, relationships } = context;

  // Build context summary
  const entitySummary = ents
    .map((e) => `- ${e.name} (${e.type})${e.description ? `: ${e.description}` : ""}`)
    .join("\n");

  const relationshipSummary = relationships
    .map((r) => {
      const source = ents.find((e) => e.id === r.sourceId)?.name || "?";
      const target = ents.find((e) => e.id === r.targetId)?.name || "?";
      return `- ${source} ${r.relationType.replace(/_/g, " ")} ${target}`;
    })
    .join("\n");

  const transcriptions = docs
    .filter((d) => d.transcription)
    .map((d) => `Document "${d.title}":\n${d.transcription?.substring(0, 500)}...`)
    .join("\n\n");

  const lengthGuide = {
    short: "300-500 words",
    medium: "800-1200 words",
    long: "1500-2500 words",
  };

  const styleGuide = {
    narrative: "Write an engaging narrative story with vivid descriptions, dialogue possibilities, and emotional depth. Create a compelling plot that connects the historical elements.",
    documentary: "Write in a documentary style with factual reporting, historical context, and objective analysis. Focus on chronology and verified information.",
    educational: "Write an educational piece that explains historical concepts, provides learning points, and makes the subject accessible to students.",
  };

  const anthropic = new Anthropic({ apiKey });

  const systemPrompt = `You are a skilled historical writer and storyteller. Your task is to create a compelling ${style} piece based on historical documents and entities.

${styleGuide[style]}

Guidelines:
- Use the provided entities, relationships, and document excerpts as your source material
- Create a cohesive narrative that connects the elements meaningfully
- Target length: ${lengthGuide[length]}
- Maintain historical accuracy based on the provided information
- If focusing on a specific entity, make them central to the story
- Include a captivating title
- Write in the same language as the source material (likely French)

Format your response as:
TITLE: [Your creative title]

STORY:
[Your narrative content]`;

  const userPrompt = `Create a ${style} story (${lengthGuide[length]}) based on the following historical project:

PROJECT: ${project.name}
${project.description || ""}

ENTITIES (${ents.length}):
${entitySummary || "No entities extracted yet"}

RELATIONSHIPS:
${relationshipSummary || "No relationships identified"}

DOCUMENT EXCERPTS:
${transcriptions || "No transcriptions available"}

${options.focus ? `FOCUS: Please center the story around "${options.focus}"` : ""}

Please generate an engaging ${style} piece that brings these historical elements to life.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textContent = response.content.find((block) => block.type === "text");
  const responseText = textContent
    ? (textContent as { type: "text"; text: string }).text
    : "";

  // Parse title and content
  let title = "Histoire générée";
  let content = responseText;

  const titleMatch = responseText.match(/^TITLE:\s*(.+?)(?:\n|$)/m);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  const storyMatch = responseText.match(/STORY:\s*([\s\S]+)/m);
  if (storyMatch) {
    content = storyMatch[1].trim();
  }

  const wordCount = content.split(/\s+/).length;

  return {
    title,
    content,
    metadata: {
      style,
      length,
      wordCount,
      entitiesUsed: ents.map((e) => e.name),
      generatedAt: new Date().toISOString(),
    },
  };
}

export async function isStoryGenerationAvailable(): Promise<boolean> {
  const apiKey = await getAnthropicApiKey();
  return !!apiKey;
}
