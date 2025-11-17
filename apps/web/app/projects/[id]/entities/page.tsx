"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import KnowledgeGraph to avoid SSR issues with D3
const KnowledgeGraph = dynamic(
  () => import("@/components/graph/KnowledgeGraph"),
  { ssr: false }
);

interface GraphNode {
  id: string;
  name: string;
  type: 'person' | 'place' | 'event' | 'object' | 'concept';
  aliases?: string[];
  description?: string | null;
  properties?: Record<string, unknown>;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationType: string;
  weight?: number | null;
  properties?: Record<string, unknown>;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    totalEntities: number;
    byType: {
      person: number;
      place: number;
      event: number;
      object: number;
      concept: number;
    };
    totalRelationships: number;
  };
}

interface Project {
  id: string;
  name: string;
  description?: string | null;
}

export default function EntitiesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch project info
        const projectRes = await fetch(`/api/projects/${projectId}`);
        const projectData = await projectRes.json();
        if (projectData.success) {
          setProject(projectData.data);
        }

        // Fetch graph data
        const graphRes = await fetch(`/api/projects/${projectId}/entities`);
        const data = await graphRes.json();

        if (data.success) {
          setGraphData(data.data);
        } else {
          throw new Error(data.error || "Failed to load graph data");
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du graphe...</p>
        </div>
      </div>
    );
  }

  if (error || !graphData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || "Failed to load graph"}
        </div>
        <Link
          href={`/projects/${projectId}`}
          className="text-heritage-600 hover:text-heritage-700 mt-4 inline-block"
        >
          &larr; Retour au projet
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/projects/${projectId}`}
                className="text-heritage-600 hover:text-heritage-700 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour au projet
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-xl font-semibold text-heritage-900">
                Graphe de connaissances
              </h1>
              {project && (
                <span className="text-gray-600">· {project.name}</span>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-heritage-600">
                    {graphData.stats.totalEntities}
                  </div>
                  <div className="text-xs text-gray-600">Entités</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-heritage-600">
                    {graphData.stats.totalRelationships}
                  </div>
                  <div className="text-xs text-gray-600">Relations</div>
                </div>
              </div>

              {/* Navigation */}
              <Link
                href={`/projects/${projectId}/gallery`}
                className="px-4 py-2 bg-heritage-100 hover:bg-heritage-200 text-heritage-800 rounded-lg text-sm font-medium transition"
              >
                Galerie
              </Link>
            </div>
          </div>

          {/* Type breakdown */}
          {graphData.stats.totalEntities > 0 && (
            <div className="flex gap-4 mt-4 text-xs">
              {graphData.stats.byType.person > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8B4513]"></span>
                  <span className="text-gray-600">{graphData.stats.byType.person} personnes</span>
                </div>
              )}
              {graphData.stats.byType.place > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4A7C59]"></span>
                  <span className="text-gray-600">{graphData.stats.byType.place} lieux</span>
                </div>
              )}
              {graphData.stats.byType.event > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                  <span className="text-gray-600">{graphData.stats.byType.event} événements</span>
                </div>
              )}
              {graphData.stats.byType.object > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6B7280]"></span>
                  <span className="text-gray-600">{graphData.stats.byType.object} objets</span>
                </div>
              )}
              {graphData.stats.byType.concept > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8B5A8B]"></span>
                  <span className="text-gray-600">{graphData.stats.byType.concept} concepts</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Graph Container */}
      <div className="flex-1 overflow-hidden p-4">
        {graphData.nodes.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-lg">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Aucune entité
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Extrayez des entités depuis vos documents pour visualiser le graphe de connaissances
              </p>
              <Link
                href={`/projects/${projectId}`}
                className="inline-block bg-heritage-600 hover:bg-heritage-700 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                Voir les documents
              </Link>
            </div>
          </div>
        ) : (
          <KnowledgeGraph data={{ nodes: graphData.nodes, edges: graphData.edges }} />
        )}
      </div>
    </div>
  );
}
