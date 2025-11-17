# Design Fonctionnel - Features d'Exploitation de l'Ontologie Émergente

**Version**: 1.0
**Date**: 2025-11-17
**Statut**: Proposition

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Feature 1 : Chatbot d'Enrichissement](#2-feature-1--chatbot-denrichissement)
3. [Feature 2 : Générateur de Questions d'Entretien](#3-feature-2--générateur-de-questions-dentretien)
4. [Feature 3 : Parcours Thématique Intelligent](#4-feature-3--parcours-thématique-intelligent)
5. [Feature 4 : Détecteur de Patterns & Insights](#5-feature-4--détecteur-de-patterns--insights)
6. [Feature 5 : Assistant de Recherche Contextuel (RAG)](#6-feature-5--assistant-de-recherche-contextuel-rag)
7. [Infrastructure Technique Commune](#7-infrastructure-technique-commune)
8. [Intégration avec la Codebase Existante](#8-intégration-avec-la-codebase-existante)
9. [Schéma d'Architecture Global](#9-schéma-darchitecture-global)
10. [Roadmap d'Implémentation](#10-roadmap-dimplémentation)

---

## 1. Vue d'ensemble

### 1.1 Objectifs

Ces 5 features exploitent l'ontologie émergente d'Archivia pour transformer une simple base documentaire en un système d'intelligence patrimoniale capable de :

- **Enrichir** : Collecter et structurer de nouvelles connaissances
- **Analyser** : Révéler des patterns cachés dans les données
- **Naviguer** : Créer des parcours narratifs intelligents
- **Interroger** : Répondre aux questions en exploitant le graphe sémantique
- **Optimiser** : Identifier les lacunes et suggérer des actions

### 1.2 Principes Architecturaux

Cohérence avec l'architecture existante :
- **TypeScript strict** pour toutes les implémentations
- **API Routes Next.js** pour la logique serveur
- **Drizzle ORM** pour l'accès base de données
- **Zod** pour la validation des schémas
- **Services AI centralisés** dans `/lib/`
- **Composants React réutilisables** dans `/components/`

---

## 2. Feature 1 : Chatbot d'Enrichissement

### 2.1 Description Fonctionnelle

Un chatbot conversationnel qui permet aux utilisateurs d'enrichir l'ontologie par le dialogue. L'utilisateur peut :
- Poser des questions pour clarifier des informations
- Ajouter de nouvelles entités ou relations via conversation naturelle
- Signaler des erreurs ou incohérences
- Consulter les questions fréquemment posées (FAQ dynamique)
- Recevoir des suggestions d'enrichissement proactives

### 2.2 Cas d'Usage Détaillés

**CU1 - Ajout d'information par conversation**
```
Utilisateur: "Jean Dupont était en fait le frère de Marie Dupont"
Bot: "Je vais créer une relation de parenté entre Jean Dupont et Marie Dupont.
      Type de relation : frère/sœur
      Confirmez-vous cette information ? (Oui/Non/Modifier)"
Utilisateur: "Oui"
Bot: "Relation créée. Source : contribution utilisateur [date].
      Souhaitez-vous ajouter d'autres précisions ?"
```

**CU2 - Question avec enrichissement automatique**
```
Utilisateur: "Qui était le maire de Verdun en 1918 ?"
Bot: "D'après les documents, je n'ai pas cette information précise.
      Si vous la connaissez, souhaitez-vous l'ajouter à la base ?
      Cela enrichirait notre ontologie sur le thème 'Verdun'."
```

**CU3 - FAQ dynamique**
```
Bot affiche: "Questions fréquentes sur ce projet :
- Combien de documents mentionnent la Grande Guerre ? (23 fois)
- Quels sont les lieux les plus mentionnés ? (8 fois)
- Comment ajouter une nouvelle personne ? (15 fois)"
```

### 2.3 Spécifications Techniques

#### 2.3.1 Modèle de Données

```typescript
// packages/database/src/schema.ts - Nouvelles tables

export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),
  metadata: text('metadata', { mode: 'json' }).$type<{
    intent?: 'question' | 'enrichment' | 'correction' | 'clarification';
    entitiesReferenced?: string[];
    enrichmentApplied?: boolean;
    confidence?: number;
  }>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const enrichmentSuggestions = sqliteTable('enrichment_suggestions', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  chatMessageId: text('chat_message_id').references(() => chatMessages.id),
  suggestionType: text('suggestion_type', {
    enum: ['add_entity', 'add_relationship', 'modify_entity', 'delete_entity']
  }).notNull(),
  payload: text('payload', { mode: 'json' }).notNull(), // Structured suggestion
  status: text('status', { enum: ['pending', 'approved', 'rejected', 'applied'] }).default('pending'),
  reviewedBy: text('reviewed_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  appliedAt: integer('applied_at', { mode: 'timestamp' }),
});

export const frequentQuestions = sqliteTable('frequent_questions', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  canonicalAnswer: text('canonical_answer'),
  askCount: integer('ask_count').notNull().default(1),
  lastAskedAt: integer('last_asked_at', { mode: 'timestamp' }).notNull(),
  relatedEntityIds: text('related_entity_ids', { mode: 'json' }).$type<string[]>(),
});
```

#### 2.3.2 Service d'Enrichissement

```typescript
// apps/web/lib/enrichment-chatbot.ts

import Anthropic from '@anthropic-ai/sdk';
import { db } from '@archivia/database';
import { entities, entityRelationships, chatMessages, enrichmentSuggestions } from '@archivia/database/schema';
import { eq, and } from 'drizzle-orm';

interface ChatContext {
  projectId: string;
  userId: string;
  sessionId: string;
  recentMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

interface EnrichmentResult {
  response: string;
  suggestions: Array<{
    type: 'add_entity' | 'add_relationship' | 'modify_entity';
    payload: unknown;
    confidence: number;
  }>;
  questionsMatched: string[];
}

export async function processEnrichmentMessage(
  message: string,
  context: ChatContext
): Promise<EnrichmentResult> {
  // 1. Récupérer le contexte ontologique du projet
  const projectEntities = await db.select().from(entities).where(eq(entities.projectId, context.projectId));
  const projectRelations = await db.select().from(entityRelationships);

  // 2. Construire le prompt système
  const systemPrompt = buildEnrichmentSystemPrompt(projectEntities, projectRelations);

  // 3. Analyser l'intention de l'utilisateur
  const anthropic = new Anthropic();
  const intentAnalysis = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [
      ...context.recentMessages,
      { role: 'user', content: message }
    ],
    tools: [
      {
        name: 'suggest_enrichment',
        description: 'Suggérer un enrichissement de l\'ontologie',
        input_schema: {
          type: 'object',
          properties: {
            enrichment_type: { type: 'string', enum: ['add_entity', 'add_relationship', 'modify_entity'] },
            entity_data: { type: 'object' },
            relationship_data: { type: 'object' },
            confidence: { type: 'number' },
            needs_confirmation: { type: 'boolean' }
          }
        }
      },
      {
        name: 'answer_question',
        description: 'Répondre à une question basée sur l\'ontologie',
        input_schema: {
          type: 'object',
          properties: {
            answer: { type: 'string' },
            sources: { type: 'array', items: { type: 'string' } },
            confidence: { type: 'number' }
          }
        }
      }
    ]
  });

  // 4. Traiter la réponse et extraire les suggestions
  const result = parseIntentAnalysis(intentAnalysis);

  // 5. Logger la conversation
  await saveChatMessage(context, message, result);

  // 6. Mettre à jour les questions fréquentes si applicable
  await updateFrequentQuestions(context.projectId, message);

  return result;
}

function buildEnrichmentSystemPrompt(
  entities: Array<{ id: string; name: string; type: string }>,
  relationships: Array<{ sourceId: string; targetId: string; relationType: string }>
): string {
  return `Tu es un assistant spécialisé dans l'enrichissement d'ontologies patrimoniales.

CONTEXTE ONTOLOGIQUE ACTUEL:
Entités (${entities.length}):
${entities.map(e => `- ${e.name} [${e.type}]`).join('\n')}

Relations (${relationships.length}):
${relationships.slice(0, 50).map(r => {
  const source = entities.find(e => e.id === r.sourceId)?.name || r.sourceId;
  const target = entities.find(e => e.id === r.targetId)?.name || r.targetId;
  return `- ${source} --[${r.relationType}]--> ${target}`;
}).join('\n')}

INSTRUCTIONS:
1. Analyse chaque message pour détecter :
   - Questions sur l'ontologie existante
   - Nouvelles informations à intégrer
   - Corrections d'erreurs
   - Demandes de clarification

2. Pour les enrichissements :
   - Propose des modifications structurées
   - Indique un niveau de confiance (0-1)
   - Demande confirmation si nécessaire
   - Respecte les types d'entités : person, place, event, object, concept

3. Pour les questions :
   - Réponds en te basant sur l'ontologie
   - Cite les sources (entités/relations)
   - Si l'info manque, propose d'enrichir

Réponds en français, de manière concise et professionnelle.`;
}
```

#### 2.3.3 Routes API

```typescript
// apps/web/app/api/projects/[id]/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { processEnrichmentMessage } from '@/lib/enrichment-chatbot';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const chatRequestSchema = z.object({
  message: z.string().min(1).max(10000),
  sessionId: z.string().uuid(),
  context: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional().default([])
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = chatRequestSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { message, sessionId, context } = validation.data;

  const result = await processEnrichmentMessage(message, {
    projectId: params.id,
    userId: session.user.id,
    sessionId,
    recentMessages: context
  });

  return NextResponse.json(result);
}

// GET pour récupérer les questions fréquentes
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const frequentQuestions = await db.select()
    .from(frequentQuestions)
    .where(eq(frequentQuestions.projectId, params.id))
    .orderBy(desc(frequentQuestions.askCount))
    .limit(10);

  return NextResponse.json({ questions: frequentQuestions });
}
```

#### 2.3.4 Composant Frontend

```typescript
// apps/web/components/enrichment-chatbot.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: EnrichmentSuggestion[];
  timestamp: Date;
}

interface EnrichmentSuggestion {
  type: string;
  payload: unknown;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
}

export function EnrichmentChatbot() {
  const { id: projectId } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const [frequentQuestions, setFrequentQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFrequentQuestions();
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchFrequentQuestions = async () => {
    const res = await fetch(`/api/projects/${projectId}/chat`);
    const data = await res.json();
    setFrequentQuestions(data.questions.map((q: { question: string }) => q.question));
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId,
          context: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        })
      });

      const result = await response.json();

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: result.response,
        suggestions: result.suggestions,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionAction = async (messageId: string, suggestionIndex: number, action: 'approve' | 'reject') => {
    // Appliquer ou rejeter la suggestion d'enrichissement
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.suggestions) {
        const updatedSuggestions = [...msg.suggestions];
        updatedSuggestions[suggestionIndex].status = action === 'approve' ? 'approved' : 'rejected';
        return { ...msg, suggestions: updatedSuggestions };
      }
      return msg;
    }));

    if (action === 'approve') {
      // Appliquer l'enrichissement via API
      // POST /api/projects/{id}/enrichment/apply
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-white">
      {/* En-tête */}
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold">Assistant d'Enrichissement</h3>
        <p className="text-sm text-gray-600">
          Posez des questions ou ajoutez des informations pour enrichir l'ontologie
        </p>
      </div>

      {/* Questions fréquentes */}
      {messages.length === 0 && frequentQuestions.length > 0 && (
        <div className="p-4 bg-blue-50">
          <p className="text-sm font-medium mb-2">Questions fréquentes :</p>
          <div className="flex flex-wrap gap-2">
            {frequentQuestions.slice(0, 5).map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="text-xs bg-white px-2 py-1 rounded border hover:bg-gray-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zone de messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>

              {/* Suggestions d'enrichissement */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="bg-white rounded p-2 text-gray-800">
                      <p className="text-xs font-medium">
                        Suggestion : {suggestion.type}
                        <span className="ml-2 text-gray-500">
                          (confiance: {Math.round(suggestion.confidence * 100)}%)
                        </span>
                      </p>
                      {suggestion.status === 'pending' && (
                        <div className="mt-1 flex gap-2">
                          <button
                            onClick={() => handleSuggestionAction(message.id, idx, 'approve')}
                            className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                          >
                            Approuver
                          </button>
                          <button
                            onClick={() => handleSuggestionAction(message.id, idx, 'reject')}
                            className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                          >
                            Rejeter
                          </button>
                        </div>
                      )}
                      {suggestion.status !== 'pending' && (
                        <span className={`text-xs ${
                          suggestion.status === 'approved' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {suggestion.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-sm text-gray-500">Analyse en cours...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Posez une question ou ajoutez une information..."
            className="flex-1 border rounded px-3 py-2 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 2.4 Points d'Intégration avec l'Existant

| Composant Existant | Intégration |
|---|---|
| `entities` table | Lecture/écriture des nouvelles entités suggérées |
| `entityRelationships` table | Ajout de nouvelles relations |
| `/api/projects/[id]/entities` | Réutilisation du format de graphe |
| `lib/entity-extraction.ts` | Pattern similaire pour le prompt engineering |
| `lib/auth.ts` | Authentification requise |
| `components/search-bar.tsx` | Intégration du chatbot dans le header |

---

## 3. Feature 2 : Générateur de Questions d'Entretien

### 3.1 Description Fonctionnelle

Analyse automatique de l'ontologie pour identifier les lacunes et générer des questions d'entretien ciblées. Le système :
- Détecte les "trous" dans le graphe de connaissances
- Identifie les acteurs non interviewés mais mentionnés
- Suggère des questions précises basées sur les entités
- Génère des guides d'entretien complets
- Priorise les questions par potentiel d'enrichissement

### 3.2 Cas d'Usage

**CU1 - Analyse des lacunes**
```
Système détecte :
- Jean Dupont mentionné 12 fois mais aucun document de source directe
- Période 1916-1917 non couverte pour le lieu "Verdun"
- Relation entre "Compagnie X" et "Bataille de Y" non explicite

Suggère :
- Interviewer Jean Dupont ou ses descendants
- Rechercher des sources sur la période manquante
- Clarifier le lien entreprise-événement
```

**CU2 - Génération de guide d'entretien**
```
Pour entité : "Marie Durand (person)"
Questions générées :
1. "Pouvez-vous préciser votre rôle exact lors de [événement X] ?"
2. "Vous avez mentionné [lieu Y], pouvez-vous décrire cet endroit ?"
3. "Quelle était votre relation avec [personne Z] ?"
4. "Avez-vous des documents personnels (photos, lettres) de cette période ?"
```

### 3.3 Spécifications Techniques

#### 3.3.1 Modèle de Données

```typescript
// packages/database/src/schema.ts

export const ontologyGaps = sqliteTable('ontology_gaps', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  gapType: text('gap_type', {
    enum: ['missing_entity', 'missing_relationship', 'temporal_gap', 'unconfirmed_source', 'incomplete_entity']
  }).notNull(),
  description: text('description').notNull(),
  severity: text('severity', { enum: ['low', 'medium', 'high', 'critical'] }).default('medium'),
  relatedEntityIds: text('related_entity_ids', { mode: 'json' }).$type<string[]>(),
  suggestedActions: text('suggested_actions', { mode: 'json' }).$type<string[]>(),
  status: text('status', { enum: ['open', 'in_progress', 'resolved', 'ignored'] }).default('open'),
  detectedAt: integer('detected_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
});

export const interviewGuides = sqliteTable('interview_guides', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  targetEntityId: text('target_entity_id').references(() => entities.id),
  title: text('title').notNull(),
  introduction: text('introduction'),
  questions: text('questions', { mode: 'json' }).$type<Array<{
    question: string;
    rationale: string;
    priority: 'essential' | 'important' | 'optional';
    relatedGapId?: string;
  }>>(),
  createdBy: text('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
```

#### 3.3.2 Service d'Analyse des Lacunes

```typescript
// apps/web/lib/gap-analyzer.ts

import { db } from '@archivia/database';
import { entities, entityRelationships, documents, ontologyGaps } from '@archivia/database/schema';
import { eq, sql, count } from 'drizzle-orm';
import Anthropic from '@anthropic-ai/sdk';

interface GapAnalysisResult {
  gaps: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    relatedEntities: string[];
    suggestedActions: string[];
  }>;
  statistics: {
    totalGaps: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
}

export async function analyzeOntologyGaps(projectId: string): Promise<GapAnalysisResult> {
  // 1. Récupérer toutes les données du projet
  const projectEntities = await db.select().from(entities).where(eq(entities.projectId, projectId));
  const projectRelations = await db.select().from(entityRelationships);
  const projectDocuments = await db.select().from(documents).where(eq(documents.projectId, projectId));

  const gaps: GapAnalysisResult['gaps'] = [];

  // 2. Analyse structurelle : entités isolées
  const connectedEntityIds = new Set([
    ...projectRelations.map(r => r.sourceId),
    ...projectRelations.map(r => r.targetId)
  ]);

  const isolatedEntities = projectEntities.filter(e => !connectedEntityIds.has(e.id));
  for (const entity of isolatedEntities) {
    gaps.push({
      type: 'incomplete_entity',
      description: `L'entité "${entity.name}" (${entity.type}) n'a aucune relation avec d'autres entités`,
      severity: 'medium',
      relatedEntities: [entity.id],
      suggestedActions: [
        `Rechercher des liens avec d'autres entités du projet`,
        `Vérifier si des documents mentionnent cette entité`
      ]
    });
  }

  // 3. Analyse temporelle : périodes non couvertes
  const eventEntities = projectEntities.filter(e => e.type === 'event');
  // Détecter les gaps temporels...

  // 4. Analyse des mentions : personnes non sourcées
  const personEntities = projectEntities.filter(e => e.type === 'person');
  const mentionCounts = await countEntityMentions(personEntities, projectDocuments);

  for (const [entityId, count] of mentionCounts) {
    if (count > 5) {
      const entity = personEntities.find(e => e.id === entityId);
      const hasDirectSource = await checkDirectSource(entityId, projectDocuments);

      if (!hasDirectSource) {
        gaps.push({
          type: 'unconfirmed_source',
          description: `"${entity?.name}" est mentionné(e) ${count} fois mais n'a pas de source directe (entretien, témoignage)`,
          severity: count > 10 ? 'high' : 'medium',
          relatedEntities: [entityId],
          suggestedActions: [
            `Interviewer ${entity?.name} ou ses proches`,
            `Rechercher des documents personnels`,
            `Croiser avec d'autres témoignages`
          ]
        });
      }
    }
  }

  // 5. Utiliser Claude pour une analyse sémantique avancée
  const aiGaps = await performAIGapAnalysis(projectEntities, projectRelations, projectDocuments);
  gaps.push(...aiGaps);

  // 6. Sauvegarder les gaps détectés
  await saveGapsToDatabase(projectId, gaps);

  return {
    gaps,
    statistics: computeStatistics(gaps)
  };
}

async function performAIGapAnalysis(
  entities: Array<{ id: string; name: string; type: string; properties: unknown }>,
  relationships: Array<{ sourceId: string; targetId: string; relationType: string }>,
  documents: Array<{ title: string; transcription: string | null }>
): Promise<GapAnalysisResult['gaps']> {
  const anthropic = new Anthropic();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    system: `Tu es un expert en analyse d'ontologies patrimoniales.
Ton rôle est d'identifier les lacunes, incohérences et opportunités d'enrichissement dans un graphe de connaissances.

Analyse les données fournies et retourne un JSON avec les lacunes détectées.`,
    messages: [{
      role: 'user',
      content: `Analyse cette ontologie et identifie les lacunes :

ENTITÉS (${entities.length}):
${JSON.stringify(entities.slice(0, 100), null, 2)}

RELATIONS (${relationships.length}):
${JSON.stringify(relationships.slice(0, 100), null, 2)}

DOCUMENTS (${documents.length}):
${documents.map(d => `- ${d.title}`).join('\n')}

Retourne un JSON avec ce format :
{
  "gaps": [
    {
      "type": "missing_relationship|temporal_gap|...",
      "description": "Description claire",
      "severity": "low|medium|high|critical",
      "relatedEntities": ["entity_name1", "entity_name2"],
      "suggestedActions": ["Action 1", "Action 2"]
    }
  ]
}`
    }]
  });

  // Parse et retourner les gaps détectés par l'IA
  const content = response.content[0];
  if (content.type === 'text') {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]).gaps;
    }
  }
  return [];
}

export async function generateInterviewGuide(
  projectId: string,
  targetEntityId?: string
): Promise<{
  title: string;
  introduction: string;
  questions: Array<{ question: string; rationale: string; priority: string }>;
}> {
  // Récupérer les gaps pertinents
  const gaps = await db.select().from(ontologyGaps)
    .where(eq(ontologyGaps.projectId, projectId));

  const projectEntities = await db.select().from(entities)
    .where(eq(entities.projectId, projectId));

  const targetEntity = targetEntityId
    ? projectEntities.find(e => e.id === targetEntityId)
    : null;

  const anthropic = new Anthropic();
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: `Tu es un expert en méthodologie d'entretien pour la collecte de témoignages patrimoniaux.
Génère des questions d'entretien précises et pertinentes basées sur les lacunes ontologiques.`,
    messages: [{
      role: 'user',
      content: `Génère un guide d'entretien pour combler ces lacunes :

${targetEntity ? `CIBLE : ${targetEntity.name} (${targetEntity.type})` : 'GUIDE GÉNÉRAL'}

LACUNES À COMBLER :
${gaps.map(g => `- ${g.description} [${g.severity}]`).join('\n')}

ENTITÉS DU PROJET :
${projectEntities.map(e => `- ${e.name} (${e.type})`).join('\n')}

Retourne un JSON structuré avec titre, introduction et liste de questions priorisées.`
    }]
  });

  // Parse la réponse...
  return parseInterviewGuideResponse(response);
}
```

#### 3.3.3 Routes API

```typescript
// apps/web/app/api/projects/[id]/gaps/route.ts

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const gaps = await analyzeOntologyGaps(params.id);
  return NextResponse.json(gaps);
}

// apps/web/app/api/projects/[id]/interview-guide/route.ts

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { targetEntityId } = await request.json();
  const guide = await generateInterviewGuide(params.id, targetEntityId);
  return NextResponse.json(guide);
}
```

### 3.4 Interface Utilisateur

Dashboard présentant :
- Liste des lacunes triées par sévérité
- Boutons d'action pour chaque lacune
- Générateur de guide d'entretien
- Export PDF du guide
- Suivi de résolution des lacunes

---

## 4. Feature 3 : Parcours Thématique Intelligent

### 4.1 Description Fonctionnelle

Création automatique de parcours narratifs navigables à travers la collection documentaire. Les parcours peuvent être :
- **Par thème** : "L'exil" à travers tous les documents
- **Par personne** : Reconstitution de la vie d'un individu
- **Par lieu** : Tous les événements liés à un lieu
- **Chronologique** : Frise interactive
- **Par réseau** : Suivre les connexions entre personnes

### 4.2 Spécifications Techniques

#### 4.2.1 Modèle de Données

```typescript
// packages/database/src/schema.ts

export const thematicPaths = sqliteTable('thematic_paths', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  pathType: text('path_type', {
    enum: ['thematic', 'biographical', 'geographical', 'chronological', 'network']
  }).notNull(),
  configuration: text('configuration', { mode: 'json' }).$type<{
    startEntityId?: string;
    themeKeywords?: string[];
    dateRange?: { start: string; end: string };
    focusEntityTypes?: string[];
  }>(),
  generatedPath: text('generated_path', { mode: 'json' }).$type<Array<{
    stepNumber: number;
    entityId: string;
    documentIds: string[];
    narrative: string;
    transitionText: string;
  }>>(),
  isPublished: integer('is_published', { mode: 'boolean' }).default(false),
  viewCount: integer('view_count').default(0),
  createdBy: text('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
```

#### 4.2.2 Service de Génération de Parcours

```typescript
// apps/web/lib/thematic-path-generator.ts

import { db } from '@archivia/database';
import { entities, entityRelationships, documents } from '@archivia/database/schema';
import Anthropic from '@anthropic-ai/sdk';

interface PathStep {
  stepNumber: number;
  entity: { id: string; name: string; type: string };
  documents: Array<{ id: string; title: string; excerpt: string }>;
  narrative: string;
  transitionText: string;
}

export async function generateThematicPath(
  projectId: string,
  config: {
    pathType: 'thematic' | 'biographical' | 'geographical' | 'chronological' | 'network';
    startEntityId?: string;
    themeKeywords?: string[];
  }
): Promise<PathStep[]> {
  const projectEntities = await db.select().from(entities).where(eq(entities.projectId, projectId));
  const projectRelations = await db.select().from(entityRelationships);
  const projectDocuments = await db.select().from(documents).where(eq(documents.projectId, projectId));

  // Construire le graphe de connaissances
  const knowledgeGraph = buildKnowledgeGraph(projectEntities, projectRelations);

  let pathSteps: PathStep[] = [];

  switch (config.pathType) {
    case 'biographical':
      pathSteps = await generateBiographicalPath(knowledgeGraph, config.startEntityId!, projectDocuments);
      break;
    case 'thematic':
      pathSteps = await generateThematicPathByKeywords(knowledgeGraph, config.themeKeywords!, projectDocuments);
      break;
    case 'geographical':
      pathSteps = await generateGeographicalPath(knowledgeGraph, config.startEntityId!, projectDocuments);
      break;
    case 'chronological':
      pathSteps = await generateChronologicalPath(knowledgeGraph, projectDocuments);
      break;
    case 'network':
      pathSteps = await generateNetworkPath(knowledgeGraph, config.startEntityId!, projectDocuments);
      break;
  }

  // Enrichir avec des narratifs générés par IA
  pathSteps = await enrichPathWithNarratives(pathSteps);

  return pathSteps;
}

async function generateBiographicalPath(
  graph: KnowledgeGraph,
  personEntityId: string,
  documents: Array<{ id: string; title: string; transcription: string | null }>
): Promise<PathStep[]> {
  const personEntity = graph.getEntity(personEntityId);
  if (!personEntity || personEntity.type !== 'person') {
    throw new Error('Entity must be a person for biographical path');
  }

  // Trouver tous les événements liés à cette personne
  const relatedEvents = graph.getRelatedEntities(personEntityId, 'participated_in');
  const relatedPlaces = graph.getRelatedEntities(personEntityId, 'located_in');
  const relatedObjects = graph.getRelatedEntities(personEntityId, 'created_by', 'reverse');

  // Ordonner chronologiquement si possible
  const timeline = [...relatedEvents, ...relatedPlaces, ...relatedObjects]
    .sort((a, b) => extractDate(a) - extractDate(b));

  // Construire les étapes du parcours
  return timeline.map((entity, index) => ({
    stepNumber: index + 1,
    entity,
    documents: findDocumentsMentioning(entity, documents),
    narrative: '', // À remplir par l'IA
    transitionText: '' // À remplir par l'IA
  }));
}

async function enrichPathWithNarratives(steps: PathStep[]): Promise<PathStep[]> {
  const anthropic = new Anthropic();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: `Tu es un narrateur spécialisé dans les récits patrimoniaux.
Enrichis ce parcours avec des textes narratifs engageants et des transitions fluides entre les étapes.`,
    messages: [{
      role: 'user',
      content: `Enrichis ce parcours avec des narratifs :

${JSON.stringify(steps, null, 2)}

Pour chaque étape, fournis :
- Un narratif engageant (2-3 phrases) expliquant l'importance de cette entité
- Un texte de transition vers l'étape suivante

Retourne le JSON enrichi.`
    }]
  });

  // Parse et retourner les étapes enrichies
  return parseEnrichedPath(response);
}
```

#### 4.2.3 Composant de Visualisation

```typescript
// apps/web/app/projects/[id]/paths/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface PathStep {
  stepNumber: number;
  entity: { id: string; name: string; type: string };
  documents: Array<{ id: string; title: string; excerpt: string }>;
  narrative: string;
  transitionText: string;
}

export default function ThematicPathsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [currentPath, setCurrentPath] = useState<PathStep[] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [pathType, setPathType] = useState<'thematic' | 'biographical' | 'geographical'>('biographical');
  const [selectedEntity, setSelectedEntity] = useState<string>('');

  const generatePath = async () => {
    const response = await fetch(`/api/projects/${projectId}/paths`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pathType,
        startEntityId: selectedEntity,
        themeKeywords: pathType === 'thematic' ? ['guerre', 'famille'] : undefined
      })
    });
    const data = await response.json();
    setCurrentPath(data.steps);
    setCurrentStep(0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Parcours Thématiques</h1>

      {/* Sélection du type de parcours */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <label className="block text-sm font-medium mb-2">Type de parcours</label>
        <select
          value={pathType}
          onChange={(e) => setPathType(e.target.value as typeof pathType)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="biographical">Biographique (vie d'une personne)</option>
          <option value="thematic">Thématique (par mots-clés)</option>
          <option value="geographical">Géographique (par lieu)</option>
          <option value="chronological">Chronologique</option>
          <option value="network">Réseau social</option>
        </select>

        <button
          onClick={generatePath}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Générer le parcours
        </button>
      </div>

      {/* Visualisation du parcours */}
      {currentPath && (
        <div className="bg-white rounded-lg shadow">
          {/* Barre de progression */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Étape {currentStep + 1} / {currentPath.length}
              </span>
              <div className="flex gap-1">
                {currentPath.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`w-3 h-3 rounded-full ${
                      idx === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Contenu de l'étape */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">
              {currentPath[currentStep].entity.name}
              <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">
                {currentPath[currentStep].entity.type}
              </span>
            </h2>

            <p className="text-gray-700 mb-4">
              {currentPath[currentStep].narrative}
            </p>

            {/* Documents associés */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">Documents associés</h3>
              <div className="space-y-2">
                {currentPath[currentStep].documents.map(doc => (
                  <div key={doc.id} className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-gray-600">{doc.excerpt}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Transition */}
            {currentStep < currentPath.length - 1 && (
              <div className="italic text-gray-600 border-l-4 border-blue-200 pl-4">
                {currentPath[currentStep].transitionText}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="p-4 border-t flex justify-between">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentStep(prev => Math.min(currentPath.length - 1, prev + 1))}
              disabled={currentStep === currentPath.length - 1}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 4.3 Export HTML Navigable

Extension du service d'export existant (`lib/export-service.ts`) pour générer des mini-sites HTML complets avec :
- Navigation entre étapes
- Timeline interactive
- Carte des lieux (si géographique)
- Galerie des documents par étape

---

## 5. Feature 4 : Détecteur de Patterns & Insights

### 5.1 Description Fonctionnelle

Analyse automatique du graphe de connaissances pour révéler des structures et patterns cachés :
- **Acteurs pivots** : Personnes qui connectent plusieurs réseaux
- **Thèmes émergents** : Concepts récurrents
- **Corrélations temporelles** : Événements liés par période
- **Réseaux sociaux implicites** : Groupes de personnes co-mentionnées
- **Anomalies** : Incohérences ou patterns inhabituels

### 5.2 Spécifications Techniques

#### 5.2.1 Modèle de Données

```typescript
// packages/database/src/schema.ts

export const ontologyInsights = sqliteTable('ontology_insights', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  insightType: text('insight_type', {
    enum: ['pivot_actor', 'emerging_theme', 'temporal_correlation', 'social_network', 'anomaly', 'cluster']
  }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  significance: real('significance').notNull(), // Score 0-1
  metadata: text('metadata', { mode: 'json' }).$type<{
    relatedEntityIds?: string[];
    metrics?: Record<string, number>;
    visualization?: unknown;
  }>(),
  detectedAt: integer('detected_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  isValidated: integer('is_validated', { mode: 'boolean' }).default(false),
});

export const graphMetrics = sqliteTable('graph_metrics', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  entityId: text('entity_id').notNull().references(() => entities.id, { onDelete: 'cascade' }),
  degreeCentrality: real('degree_centrality'),
  betweennessCentrality: real('betweenness_centrality'),
  closenessCentrality: real('closeness_centrality'),
  pageRank: real('page_rank'),
  clusterCoefficient: real('cluster_coefficient'),
  computedAt: integer('computed_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
```

#### 5.2.2 Service d'Analyse de Graphe

```typescript
// apps/web/lib/graph-analyzer.ts

import { db } from '@archivia/database';
import { entities, entityRelationships, ontologyInsights, graphMetrics } from '@archivia/database/schema';

interface GraphAnalysisResult {
  insights: Array<{
    type: string;
    title: string;
    description: string;
    significance: number;
    relatedEntities: string[];
  }>;
  metrics: {
    totalNodes: number;
    totalEdges: number;
    density: number;
    averageDegree: number;
    clusters: number;
  };
  pivotActors: Array<{ entityId: string; name: string; score: number }>;
  emergingThemes: Array<{ concept: string; frequency: number; growth: number }>;
}

export async function analyzeGraphPatterns(projectId: string): Promise<GraphAnalysisResult> {
  const projectEntities = await db.select().from(entities).where(eq(entities.projectId, projectId));
  const projectRelations = await db.select().from(entityRelationships);

  // 1. Calculer les métriques de centralité
  const centralityMetrics = computeCentralityMetrics(projectEntities, projectRelations);

  // 2. Identifier les acteurs pivots (haute betweenness centrality)
  const pivotActors = centralityMetrics
    .sort((a, b) => b.betweenness - a.betweenness)
    .slice(0, 10)
    .map(m => ({
      entityId: m.entityId,
      name: projectEntities.find(e => e.id === m.entityId)?.name || '',
      score: m.betweenness
    }));

  // 3. Détecter les clusters (communautés)
  const clusters = detectCommunities(projectEntities, projectRelations);

  // 4. Analyser les thèmes émergents
  const conceptEntities = projectEntities.filter(e => e.type === 'concept');
  const emergingThemes = analyzeThemeEmergence(conceptEntities, projectRelations);

  // 5. Détecter les anomalies
  const anomalies = detectAnomalies(projectEntities, projectRelations);

  // 6. Générer les insights
  const insights = await generateInsights(pivotActors, clusters, emergingThemes, anomalies);

  // 7. Sauvegarder les métriques et insights
  await saveAnalysisResults(projectId, centralityMetrics, insights);

  return {
    insights,
    metrics: computeGlobalMetrics(projectEntities, projectRelations),
    pivotActors,
    emergingThemes
  };
}

function computeCentralityMetrics(
  entities: Array<{ id: string; name: string; type: string }>,
  relationships: Array<{ sourceId: string; targetId: string }>
): Array<{ entityId: string; degree: number; betweenness: number; closeness: number }> {
  // Implémenter les algorithmes de centralité
  // - Degree centrality : nombre de connexions
  // - Betweenness centrality : fréquence sur les plus courts chemins
  // - Closeness centrality : proximité moyenne aux autres noeuds

  const metrics: Array<{ entityId: string; degree: number; betweenness: number; closeness: number }> = [];

  for (const entity of entities) {
    const degree = relationships.filter(
      r => r.sourceId === entity.id || r.targetId === entity.id
    ).length;

    // Calcul simplifié de betweenness (à optimiser pour grands graphes)
    const betweenness = computeBetweennessCentrality(entity.id, entities, relationships);

    const closeness = computeClosenessCentrality(entity.id, entities, relationships);

    metrics.push({
      entityId: entity.id,
      degree,
      betweenness,
      closeness
    });
  }

  return metrics;
}

function detectCommunities(
  entities: Array<{ id: string }>,
  relationships: Array<{ sourceId: string; targetId: string }>
): Array<{ clusterId: number; memberIds: string[] }> {
  // Algorithme de détection de communautés (ex: Louvain, Label Propagation)
  // Retourne les groupes d'entités fortement connectées

  // Implémentation simplifiée avec union-find ou clustering hiérarchique
  const clusters: Map<number, string[]> = new Map();

  // ... logique de clustering

  return Array.from(clusters.entries()).map(([id, members]) => ({
    clusterId: id,
    memberIds: members
  }));
}

function detectAnomalies(
  entities: Array<{ id: string; type: string; properties: unknown }>,
  relationships: Array<{ sourceId: string; targetId: string; relationType: string }>
): Array<{ type: string; description: string; entityIds: string[] }> {
  const anomalies: Array<{ type: string; description: string; entityIds: string[] }> = [];

  // Détecter les incohérences temporelles
  // Ex: personne participant à un événement après sa mort

  // Détecter les relations contradictoires
  // Ex: A est parent de B et B est parent de A

  // Détecter les entités avec des propriétés inhabituelles
  // Ex: lieu sans coordonnées géographiques

  return anomalies;
}
```

#### 5.2.3 Dashboard de Visualisation

```typescript
// apps/web/app/projects/[id]/insights/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Insight {
  type: string;
  title: string;
  description: string;
  significance: number;
  relatedEntities: string[];
}

interface GraphMetrics {
  totalNodes: number;
  totalEdges: number;
  density: number;
  averageDegree: number;
  clusters: number;
}

export default function InsightsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [metrics, setMetrics] = useState<GraphMetrics | null>(null);
  const [pivotActors, setPivotActors] = useState<Array<{ entityId: string; name: string; score: number }>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    const response = await fetch(`/api/projects/${projectId}/insights`, {
      method: 'POST'
    });
    const data = await response.json();
    setInsights(data.insights);
    setMetrics(data.metrics);
    setPivotActors(data.pivotActors);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    runAnalysis();
  }, [projectId]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Insights & Patterns</h1>
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyse en cours...' : 'Relancer l\'analyse'}
        </button>
      </div>

      {/* Métriques globales */}
      {metrics && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Noeuds</p>
            <p className="text-2xl font-bold">{metrics.totalNodes}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Arêtes</p>
            <p className="text-2xl font-bold">{metrics.totalEdges}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Densité</p>
            <p className="text-2xl font-bold">{(metrics.density * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Degré moyen</p>
            <p className="text-2xl font-bold">{metrics.averageDegree.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Clusters</p>
            <p className="text-2xl font-bold">{metrics.clusters}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Acteurs pivots */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Acteurs Pivots</h2>
          <div className="space-y-3">
            {pivotActors.map((actor, idx) => (
              <div key={actor.entityId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">#{idx + 1}</span>
                  <span className="font-medium">{actor.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${actor.score * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {(actor.score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights détectés */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Insights Détectés</h2>
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-3 py-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{insight.title}</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    insight.significance > 0.7 ? 'bg-red-100 text-red-700' :
                    insight.significance > 0.4 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {insight.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Feature 5 : Assistant de Recherche Contextuel (RAG)

### 6.1 Description Fonctionnelle

Chatbot intelligent qui répond aux questions en s'appuyant sur l'ontologie et les documents :
- Requêtes en langage naturel
- Réponses sourcées avec citations
- Raisonnement explicite basé sur le graphe
- Suggestions proactives
- Support de requêtes complexes (traversée de graphe)

### 6.2 Architecture RAG (Retrieval-Augmented Generation)

```
Question Utilisateur
       ↓
   [1. Intent Detection]
       ↓
   [2. Entity Recognition]
       ↓
   [3. Graph Traversal]  ← Ontologie (entités + relations)
       ↓
   [4. Document Retrieval] ← Base documentaire
       ↓
   [5. Context Assembly]
       ↓
   [6. LLM Generation] ← Claude API
       ↓
   Réponse Sourcée
```

### 6.3 Spécifications Techniques

#### 6.3.1 Service RAG

```typescript
// apps/web/lib/rag-assistant.ts

import Anthropic from '@anthropic-ai/sdk';
import { db } from '@archivia/database';
import { entities, entityRelationships, documents } from '@archivia/database/schema';
import { eq, like, or } from 'drizzle-orm';

interface RAGResponse {
  answer: string;
  sources: Array<{
    type: 'entity' | 'document' | 'relationship';
    id: string;
    name: string;
    relevance: number;
    excerpt?: string;
  }>;
  reasoning: string[];
  suggestions: string[];
  confidence: number;
}

interface RetrievalContext {
  entities: Array<{ id: string; name: string; type: string; properties: unknown }>;
  relationships: Array<{ source: string; target: string; type: string }>;
  documents: Array<{ id: string; title: string; excerpt: string }>;
}

export async function processRAGQuery(
  projectId: string,
  query: string
): Promise<RAGResponse> {
  // 1. Extraire les entités mentionnées dans la question
  const mentionedEntities = await extractQueryEntities(query, projectId);

  // 2. Récupérer le contexte pertinent du graphe
  const graphContext = await retrieveGraphContext(projectId, mentionedEntities);

  // 3. Récupérer les documents pertinents
  const documentContext = await retrieveRelevantDocuments(projectId, query, mentionedEntities);

  // 4. Assembler le contexte pour le LLM
  const fullContext = assembleContext(graphContext, documentContext);

  // 5. Générer la réponse avec Claude
  const response = await generateRAGResponse(query, fullContext);

  // 6. Extraire et formater les sources
  const sourcedResponse = formatSourcedResponse(response, graphContext, documentContext);

  return sourcedResponse;
}

async function extractQueryEntities(
  query: string,
  projectId: string
): Promise<Array<{ id: string; name: string; matchScore: number }>> {
  // Récupérer toutes les entités du projet
  const projectEntities = await db.select().from(entities).where(eq(entities.projectId, projectId));

  // Matching simple (à améliorer avec embeddings)
  const matches: Array<{ id: string; name: string; matchScore: number }> = [];

  for (const entity of projectEntities) {
    const queryLower = query.toLowerCase();
    const nameLower = entity.name.toLowerCase();

    if (queryLower.includes(nameLower)) {
      matches.push({
        id: entity.id,
        name: entity.name,
        matchScore: 1.0
      });
    } else if (nameLower.split(' ').some(word => queryLower.includes(word))) {
      matches.push({
        id: entity.id,
        name: entity.name,
        matchScore: 0.5
      });
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

async function retrieveGraphContext(
  projectId: string,
  seedEntities: Array<{ id: string; name: string }>
): Promise<RetrievalContext['entities' | 'relationships']> {
  // Récupérer les entités et leurs voisins (1-2 hops)
  const relevantEntityIds = new Set(seedEntities.map(e => e.id));

  // Premier hop : relations directes
  const directRelations = await db.select().from(entityRelationships);
  for (const rel of directRelations) {
    if (relevantEntityIds.has(rel.sourceId)) {
      relevantEntityIds.add(rel.targetId);
    }
    if (relevantEntityIds.has(rel.targetId)) {
      relevantEntityIds.add(rel.sourceId);
    }
  }

  // Récupérer les entités
  const relevantEntities = await db.select().from(entities)
    .where(eq(entities.projectId, projectId));

  const filteredEntities = relevantEntities.filter(e => relevantEntityIds.has(e.id));

  // Récupérer les relations entre ces entités
  const filteredRelations = directRelations.filter(
    r => relevantEntityIds.has(r.sourceId) && relevantEntityIds.has(r.targetId)
  );

  return {
    entities: filteredEntities,
    relationships: filteredRelations.map(r => ({
      source: relevantEntities.find(e => e.id === r.sourceId)?.name || r.sourceId,
      target: relevantEntities.find(e => e.id === r.targetId)?.name || r.targetId,
      type: r.relationType
    }))
  };
}

async function retrieveRelevantDocuments(
  projectId: string,
  query: string,
  mentionedEntities: Array<{ id: string; name: string }>
): Promise<Array<{ id: string; title: string; excerpt: string; relevance: number }>> {
  const projectDocuments = await db.select().from(documents).where(eq(documents.projectId, projectId));

  const scoredDocs = projectDocuments.map(doc => {
    let relevance = 0;

    // Score basé sur les mots-clés de la question
    const queryWords = query.toLowerCase().split(' ');
    for (const word of queryWords) {
      if (doc.title.toLowerCase().includes(word)) relevance += 0.3;
      if (doc.transcription?.toLowerCase().includes(word)) relevance += 0.2;
    }

    // Score basé sur les entités mentionnées
    for (const entity of mentionedEntities) {
      if (doc.transcription?.toLowerCase().includes(entity.name.toLowerCase())) {
        relevance += 0.5;
      }
    }

    // Extraire un extrait pertinent
    const excerpt = extractRelevantExcerpt(doc.transcription || '', query);

    return {
      id: doc.id,
      title: doc.title,
      excerpt,
      relevance
    };
  });

  return scoredDocs
    .filter(d => d.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5);
}

function extractRelevantExcerpt(text: string, query: string): string {
  const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 3);
  const sentences = text.split(/[.!?]+/);

  // Trouver la phrase la plus pertinente
  let bestSentence = '';
  let bestScore = 0;

  for (const sentence of sentences) {
    let score = 0;
    for (const word of queryWords) {
      if (sentence.toLowerCase().includes(word)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestSentence = sentence.trim();
    }
  }

  return bestSentence.slice(0, 300) + (bestSentence.length > 300 ? '...' : '');
}

function assembleContext(
  graphContext: any,
  documentContext: Array<{ id: string; title: string; excerpt: string }>
): string {
  return `CONTEXTE ONTOLOGIQUE :
Entités pertinentes :
${graphContext.entities.map((e: any) => `- ${e.name} [${e.type}]`).join('\n')}

Relations :
${graphContext.relationships.map((r: any) => `- ${r.source} --[${r.type}]--> ${r.target}`).join('\n')}

DOCUMENTS PERTINENTS :
${documentContext.map(d => `
Document: ${d.title}
Extrait: "${d.excerpt}"
`).join('\n')}`;
}

async function generateRAGResponse(
  query: string,
  context: string
): Promise<{ text: string; reasoning: string[]; suggestions: string[] }> {
  const anthropic = new Anthropic();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: `Tu es un assistant de recherche spécialisé dans l'exploitation d'archives patrimoniales.
Tu réponds aux questions en te basant UNIQUEMENT sur le contexte fourni (ontologie + documents).

RÈGLES IMPORTANTES :
1. Cite toujours tes sources (entités ou documents)
2. Si l'information n'est pas dans le contexte, dis-le clairement
3. Explique ton raisonnement de manière transparente
4. Propose des pistes de recherche complémentaires

Format de réponse JSON :
{
  "answer": "Réponse détaillée",
  "reasoning": ["Étape 1 du raisonnement", "Étape 2", ...],
  "sources_used": ["Nom d'entité ou titre de document"],
  "suggestions": ["Question de suivi possible", "Autre piste"]
}`,
    messages: [{
      role: 'user',
      content: `CONTEXTE :
${context}

QUESTION :
${query}`
    }]
  });

  const content = response.content[0];
  if (content.type === 'text') {
    try {
      return JSON.parse(content.text);
    } catch {
      return {
        text: content.text,
        reasoning: [],
        suggestions: []
      };
    }
  }

  return { text: '', reasoning: [], suggestions: [] };
}
```

#### 6.3.2 Composant Frontend

```typescript
// apps/web/components/rag-assistant.tsx

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

interface Source {
  type: 'entity' | 'document';
  id: string;
  name: string;
  relevance: number;
  excerpt?: string;
}

interface RAGResult {
  answer: string;
  sources: Source[];
  reasoning: string[];
  suggestions: string[];
  confidence: number;
}

export function RAGAssistant() {
  const { id: projectId } = useParams<{ id: string }>();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<RAGResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  const askQuestion = async () => {
    if (!query.trim()) return;
    setIsLoading(true);

    const response = await fetch(`/api/projects/${projectId}/rag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    setResult(data);
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Assistant de Recherche</h2>

      {/* Zone de question */}
      <div className="mb-4">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Posez votre question... Ex: Qui a participé aux événements de 1918 ?"
          className="w-full border rounded p-3 h-24"
        />
        <button
          onClick={askQuestion}
          disabled={isLoading || !query.trim()}
          className="mt-2 bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {isLoading ? 'Recherche en cours...' : 'Rechercher'}
        </button>
      </div>

      {/* Résultat */}
      {result && (
        <div className="space-y-4">
          {/* Réponse principale */}
          <div className="bg-gray-50 rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Réponse</h3>
              <span className={`text-sm px-2 py-1 rounded ${
                result.confidence > 0.7 ? 'bg-green-100 text-green-700' :
                result.confidence > 0.4 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                Confiance: {Math.round(result.confidence * 100)}%
              </span>
            </div>
            <p className="text-gray-800">{result.answer}</p>
          </div>

          {/* Sources */}
          <div>
            <h3 className="font-medium mb-2">Sources ({result.sources.length})</h3>
            <div className="space-y-2">
              {result.sources.map(source => (
                <div key={source.id} className="border rounded p-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      source.type === 'entity' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {source.type}
                    </span>
                    <span className="font-medium">{source.name}</span>
                    <span className="text-sm text-gray-500">
                      (pertinence: {Math.round(source.relevance * 100)}%)
                    </span>
                  </div>
                  {source.excerpt && (
                    <p className="text-sm text-gray-600 mt-1 italic">"{source.excerpt}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Raisonnement (optionnel) */}
          <div>
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showReasoning ? 'Masquer' : 'Afficher'} le raisonnement
            </button>
            {showReasoning && result.reasoning.length > 0 && (
              <ol className="mt-2 list-decimal list-inside bg-gray-50 rounded p-3">
                {result.reasoning.map((step, idx) => (
                  <li key={idx} className="text-sm text-gray-700">{step}</li>
                ))}
              </ol>
            )}
          </div>

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Questions suggérées</h3>
              <div className="flex flex-wrap gap-2">
                {result.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(suggestion)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 7. Infrastructure Technique Commune

### 7.1 Couche de Services IA Unifiée

```typescript
// apps/web/lib/ai-service-manager.ts

import Anthropic from '@anthropic-ai/sdk';
import { db } from '@archivia/database';
import { appConfig } from '@archivia/database/schema';

interface AIServiceConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}

class AIServiceManager {
  private anthropic: Anthropic | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Récupérer la clé API depuis la configuration
    const config = await db.select().from(appConfig).limit(1);
    const apiKey = config[0]?.settings?.anthropicApiKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    this.anthropic = new Anthropic({ apiKey });
    this.initialized = true;
  }

  async complete(
    systemPrompt: string,
    userMessage: string,
    config: Partial<AIServiceConfig> = {}
  ): Promise<{ text: string; usage: { inputTokens: number; outputTokens: number } }> {
    await this.initialize();

    const response = await this.anthropic!.messages.create({
      model: config.model || 'claude-sonnet-4-20250514',
      max_tokens: config.maxTokens || 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    const content = response.content[0];
    return {
      text: content.type === 'text' ? content.text : '',
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      }
    };
  }

  async completeWithTools(
    systemPrompt: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    tools: Anthropic.Tool[],
    config: Partial<AIServiceConfig> = {}
  ): Promise<Anthropic.Message> {
    await this.initialize();

    return this.anthropic!.messages.create({
      model: config.model || 'claude-sonnet-4-20250514',
      max_tokens: config.maxTokens || 2000,
      system: systemPrompt,
      messages,
      tools
    });
  }
}

export const aiService = new AIServiceManager();
```

### 7.2 Cache et Optimisation

```typescript
// apps/web/lib/cache-service.ts

import { LRUCache } from 'lru-cache';

interface CacheConfig {
  maxSize: number;
  ttl: number; // milliseconds
}

class CacheService {
  private caches: Map<string, LRUCache<string, unknown>> = new Map();

  getCache(name: string, config: CacheConfig = { maxSize: 100, ttl: 3600000 }): LRUCache<string, unknown> {
    if (!this.caches.has(name)) {
      this.caches.set(name, new LRUCache({
        max: config.maxSize,
        ttl: config.ttl
      }));
    }
    return this.caches.get(name)!;
  }

  // Cache pour les résultats d'analyse coûteux
  ontologyAnalysisCache = this.getCache('ontology-analysis', { maxSize: 50, ttl: 86400000 }); // 24h
  ragContextCache = this.getCache('rag-context', { maxSize: 200, ttl: 3600000 }); // 1h
  graphMetricsCache = this.getCache('graph-metrics', { maxSize: 50, ttl: 7200000 }); // 2h
}

export const cacheService = new CacheService();
```

### 7.3 Système de File d'Attente (Jobs Asynchrones)

```typescript
// packages/database/src/schema.ts

export const asyncJobs = sqliteTable('async_jobs', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  jobType: text('job_type', {
    enum: ['gap_analysis', 'pattern_detection', 'path_generation', 'rag_indexing']
  }).notNull(),
  status: text('status', { enum: ['pending', 'processing', 'completed', 'failed'] }).default('pending'),
  payload: text('payload', { mode: 'json' }),
  result: text('result', { mode: 'json' }),
  error: text('error'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});
```

### 7.4 Logging et Monitoring

```typescript
// apps/web/lib/analytics-logger.ts

import { db } from '@archivia/database';
import { sql } from 'drizzle-orm';

interface FeatureUsageEvent {
  feature: 'chatbot' | 'gap_analyzer' | 'path_generator' | 'pattern_detector' | 'rag_assistant';
  projectId: string;
  userId: string;
  action: string;
  metadata?: Record<string, unknown>;
  tokensUsed?: number;
  duration?: number;
}

export async function logFeatureUsage(event: FeatureUsageEvent): Promise<void> {
  // Stocker dans une table d'analytics
  // Utile pour :
  // - Comprendre l'utilisation des features
  // - Monitorer les coûts API
  // - Optimiser les performances
  // - Améliorer l'UX
}
```

---

## 8. Intégration avec la Codebase Existante

### 8.1 Points d'Intégration Backend

| Feature | Service Existant | Type d'Intégration |
|---------|-----------------|-------------------|
| **Chatbot** | `lib/entity-extraction.ts` | Réutilise les patterns de prompts |
| **Gap Analyzer** | `lib/story-generator.ts` | Pattern similaire de contexte |
| **Path Generator** | `lib/export-service.ts` | Extension de l'export HTML |
| **Pattern Detector** | `/api/projects/[id]/entities` | Réutilise les données de graphe |
| **RAG Assistant** | `/api/search` | Améliore la recherche existante |

### 8.2 Évolutions du Schéma de Base

```sql
-- Nouvelles tables à ajouter au schema.ts
ALTER TABLE projects ADD COLUMN ai_features_enabled TEXT; -- JSON: {chatbot: true, rag: true, ...}

-- Index pour optimiser les requêtes
CREATE INDEX idx_entities_project ON entities(project_id);
CREATE INDEX idx_relationships_source ON entity_relationships(source_id);
CREATE INDEX idx_chat_messages_project ON chat_messages(project_id, created_at);
CREATE INDEX idx_insights_project ON ontology_insights(project_id, detected_at);
```

### 8.3 Structure des Dossiers Étendue

```
apps/web/
├── lib/
│   ├── ocr-service.ts          # Existant
│   ├── entity-extraction.ts    # Existant
│   ├── story-generator.ts      # Existant
│   ├── export-service.ts       # Existant
│   │
│   ├── enrichment-chatbot.ts   # NOUVEAU
│   ├── gap-analyzer.ts         # NOUVEAU
│   ├── thematic-path.ts        # NOUVEAU
│   ├── graph-analyzer.ts       # NOUVEAU
│   ├── rag-assistant.ts        # NOUVEAU
│   ├── ai-service-manager.ts   # NOUVEAU
│   └── cache-service.ts        # NOUVEAU
│
├── app/api/projects/[id]/
│   ├── route.ts                # Existant
│   ├── entities/route.ts       # Existant
│   ├── story/route.ts          # Existant
│   │
│   ├── chat/route.ts           # NOUVEAU
│   ├── gaps/route.ts           # NOUVEAU
│   ├── paths/route.ts          # NOUVEAU
│   ├── insights/route.ts       # NOUVEAU
│   └── rag/route.ts            # NOUVEAU
│
└── components/
    ├── enrichment-chatbot.tsx  # NOUVEAU
    ├── gap-dashboard.tsx       # NOUVEAU
    ├── thematic-path-viewer.tsx # NOUVEAU
    ├── insights-dashboard.tsx  # NOUVEAU
    └── rag-assistant.tsx       # NOUVEAU
```

### 8.4 Réutilisation des Patterns Existants

1. **Validation Zod** : Tous les nouveaux endpoints utilisent les patterns de `packages/shared-types/`
2. **Authentification** : Réutilisation de `lib/auth.ts` pour protéger les routes
3. **Gestion d'erreurs** : Pattern `lib/api-utils.ts` pour les réponses standardisées
4. **Thumbnails** : Réutilisation de `lib/thumbnails.ts` pour les exports visuels
5. **i18n** : Intégration avec le système de traduction existant

---

## 9. Schéma d'Architecture Global

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ Chatbot │ │   Gap   │ │  Path   │ │ Insights│ │   RAG   │  │
│  │   UI    │ │Dashboard│ │ Viewer  │ │Dashboard│ │Assistant│  │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘  │
└───────┼──────────┼──────────┼──────────┼──────────┼───────────┘
        │          │          │          │          │
┌───────┴──────────┴──────────┴──────────┴──────────┴───────────┐
│                         API ROUTES                              │
│  /chat      /gaps      /paths     /insights    /rag            │
└───────┬──────────┬──────────┬──────────┬──────────┬───────────┘
        │          │          │          │          │
┌───────┴──────────┴──────────┴──────────┴──────────┴───────────┐
│                      SERVICES LAYER                             │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              AI Service Manager (Claude API)           │    │
│  └────────────────────────┬───────────────────────────────┘    │
│                           │                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │Enrichment│ │   Gap   │ │  Path   │ │  Graph  │ │   RAG   │  │
│  │ Service │ │Analyzer │ │Generator│ │Analyzer │ │ Service │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
└───────┬──────────┬──────────┬──────────┬──────────┬───────────┘
        │          │          │          │          │
┌───────┴──────────┴──────────┴──────────┴──────────┴───────────┐
│                      DATA LAYER (Drizzle ORM)                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   SQLite/libSQL Database                │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │   │
│  │  │ Entities │  │Relations│  │Documents│  │Chat Msgs│   │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │   │
│  │  │  Gaps   │  │ Insights│  │  Paths  │  │ Guides  │   │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## 10. Roadmap d'Implémentation

### Phase 1 : Infrastructure (Semaine 1-2)
- [ ] Étendre le schéma de base de données
- [ ] Créer l'AI Service Manager unifié
- [ ] Mettre en place le système de cache
- [ ] Configurer le logging et monitoring

### Phase 2 : RAG Assistant (Semaine 3-4)
- [ ] Implémenter le service RAG
- [ ] Créer les routes API
- [ ] Développer le composant frontend
- [ ] Tester avec différentes requêtes

### Phase 3 : Chatbot d'Enrichissement (Semaine 5-6)
- [ ] Implémenter le service conversationnel
- [ ] Gérer les suggestions d'enrichissement
- [ ] Créer la FAQ dynamique
- [ ] Interface utilisateur interactive

### Phase 4 : Gap Analyzer & Interview Guide (Semaine 7-8)
- [ ] Algorithmes de détection de lacunes
- [ ] Génération de guides d'entretien
- [ ] Dashboard de visualisation
- [ ] Export PDF

### Phase 5 : Pattern Detector (Semaine 9-10)
- [ ] Algorithmes de centralité
- [ ] Détection de communautés
- [ ] Analyse temporelle
- [ ] Dashboard d'insights

### Phase 6 : Thematic Paths (Semaine 11-12)
- [ ] Générateur de parcours
- [ ] Visualisation interactive
- [ ] Export HTML navigable
- [ ] Timeline interactive

### Phase 7 : Intégration & Tests (Semaine 13-14)
- [ ] Tests unitaires et d'intégration
- [ ] Optimisation des performances
- [ ] Documentation utilisateur
- [ ] Formation et déploiement

---

## Annexes

### A. Dépendances NPM Additionnelles

```json
{
  "dependencies": {
    "lru-cache": "^10.0.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/uuid": "^9.0.0"
  }
}
```

### B. Variables d'Environnement

```bash
# Nouvelles variables
ANTHROPIC_MODEL_DEFAULT=claude-sonnet-4-20250514
RAG_MAX_CONTEXT_TOKENS=4000
CACHE_TTL_HOURS=24
MAX_CHAT_HISTORY=50
```

### C. Métriques de Performance Attendues

| Feature | Temps de Réponse Cible | Tokens/Requête |
|---------|------------------------|----------------|
| Chatbot | < 3s | 1500-3000 |
| Gap Analysis | < 10s | 3000-5000 |
| Path Generation | < 8s | 2000-4000 |
| Pattern Detection | < 15s | 4000-6000 |
| RAG Query | < 5s | 2000-3500 |

---

**Document préparé pour :** Équipe de développement Archivia
**Prochaines étapes :** Revue technique et validation du design avant implémentation
