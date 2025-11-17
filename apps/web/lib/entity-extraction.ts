import Anthropic from "@anthropic-ai/sdk";
import { db, appConfig, entities, entityRelationships } from "@archivia/database";
import { eq } from "drizzle-orm";

interface ExtractedEntity {
  type: "person" | "place" | "concept" | "object" | "event";
  name: string;
  aliases?: string[];
  description?: string;
  properties?: Record<string, unknown>;
}

interface ExtractedRelationship {
  source: string; // Entity name
  target: string; // Entity name
  relationType: string;
  properties?: Record<string, unknown>;
}

interface ExtractionResult {
  entities: ExtractedEntity[];
  relationships: ExtractedRelationship[];
  metadata: Record<string, unknown>;
}

/**
 * Get Anthropic API key from database or environment
 */
async function getAnthropicApiKey(): Promise<string | null> {
  const [config] = await db
    .select()
    .from(appConfig)
    .where(eq(appConfig.key, "ANTHROPIC_API_KEY"))
    .limit(1);

  if (config && config.value) {
    return config.value;
  }

  return process.env.ANTHROPIC_API_KEY || null;
}

/**
 * Extract entities from text using Claude
 */
export async function extractEntities(
  text: string,
  projectId: string
): Promise<ExtractionResult> {
  const apiKey = await getAnthropicApiKey();

  if (!apiKey) {
    throw new Error(
      "Anthropic API key not configured. Please set it in Admin Settings."
    );
  }

  const anthropic = new Anthropic({ apiKey });

  const systemPrompt = `You are an expert in historical document analysis and named entity recognition. Your task is to extract all meaningful entities and their relationships from the provided text.

Extract the following entity types:
- person: Named individuals (with roles, titles, occupations if mentioned)
- place: Geographic locations (cities, countries, addresses, landmarks)
- event: Historical events, ceremonies, meetings
- object: Physical objects mentioned (documents, artifacts, tools)
- concept: Abstract concepts, themes, or topics

For each entity, provide:
- type: The entity type
- name: The canonical name
- aliases: Alternative names or spellings found in text (array)
- description: Brief description based on context (optional)
- properties: Additional metadata like dates, roles, attributes (optional)

Also identify relationships between entities, such as:
- "located_in" (person/event located in place)
- "participated_in" (person participated in event)
- "related_to" (general relationship)
- "created_by" (object created by person)
- "mentioned_with" (entities mentioned together)

Respond with a valid JSON object in this exact format:
{
  "entities": [
    {
      "type": "person",
      "name": "Jean Dupont",
      "aliases": ["J. Dupont", "Monsieur Dupont"],
      "description": "Notaire mentionné dans le document",
      "properties": {"role": "notaire", "date_mentioned": "1850"}
    }
  ],
  "relationships": [
    {
      "source": "Jean Dupont",
      "target": "Paris",
      "relationType": "located_in",
      "properties": {}
    }
  ]
}

Important:
- Extract ALL entities mentioned, even if briefly
- Normalize names (proper capitalization, remove extra spaces)
- Group variations of the same entity under aliases
- If no entities found, return empty arrays
- Response MUST be valid JSON only, no additional text`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Please extract all entities and relationships from this text:\n\n${text}`,
      },
    ],
  });

  // Extract JSON from response
  const textContent = response.content.find((block) => block.type === "text");
  const responseText = textContent
    ? (textContent as { type: "text"; text: string }).text
    : "{}";

  let parsed: { entities: ExtractedEntity[]; relationships: ExtractedRelationship[] };

  try {
    parsed = JSON.parse(responseText);
  } catch {
    console.error("Failed to parse entity extraction response:", responseText);
    parsed = { entities: [], relationships: [] };
  }

  // Save entities to database
  const entityMap = new Map<string, string>(); // name -> id

  for (const entity of parsed.entities || []) {
    const [inserted] = await db
      .insert(entities)
      .values({
        projectId,
        type: entity.type,
        name: entity.name,
        normalizedName: entity.name.toLowerCase().trim(),
        aliases: entity.aliases || [],
        description: entity.description || null,
        properties: entity.properties || {},
      })
      .returning();

    entityMap.set(entity.name, inserted.id);
  }

  // Save relationships
  for (const rel of parsed.relationships || []) {
    const sourceId = entityMap.get(rel.source);
    const targetId = entityMap.get(rel.target);

    if (sourceId && targetId) {
      await db.insert(entityRelationships).values({
        sourceId,
        targetId,
        relationType: rel.relationType,
        properties: rel.properties || {},
      });
    }
  }

  return {
    entities: parsed.entities || [],
    relationships: parsed.relationships || [],
    metadata: {
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      stopReason: response.stop_reason,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Check if entity extraction is available
 */
export async function isEntityExtractionAvailable(): Promise<boolean> {
  const apiKey = await getAnthropicApiKey();
  return !!apiKey;
}
