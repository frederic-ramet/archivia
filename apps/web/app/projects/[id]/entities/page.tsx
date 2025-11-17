"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Node {
  id: string;
  name: string;
  type: "person" | "place" | "event" | "object" | "concept";
  description?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  relationType: string;
}

interface Stats {
  totalEntities: number;
  byType: {
    person: number;
    place: number;
    event: number;
    object: number;
    concept: number;
  };
  totalRelationships: number;
}

const typeColors: Record<string, string> = {
  person: "#3B82F6", // blue
  place: "#10B981", // green
  event: "#F59E0B", // amber
  object: "#8B5CF6", // purple
  concept: "#EC4899", // pink
};

const typeLabels: Record<string, string> = {
  person: "Personne",
  place: "Lieu",
  event: "Événement",
  object: "Objet",
  concept: "Concept",
};

export default function EntitiesGraphPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    async function fetchEntities() {
      try {
        const response = await fetch(`/api/projects/${projectId}/entities`);
        const data = await response.json();

        if (data.success && data.data) {
          // Initialize node positions
          const initializedNodes = data.data.nodes.map((node: Node, i: number) => ({
            ...node,
            x: dimensions.width / 2 + Math.cos((i * 2 * Math.PI) / data.data.nodes.length) * 200,
            y: dimensions.height / 2 + Math.sin((i * 2 * Math.PI) / data.data.nodes.length) * 200,
            vx: 0,
            vy: 0,
          }));
          setNodes(initializedNodes);
          setEdges(data.data.edges);
          setStats(data.data.stats);
        } else {
          setError(data.error || "Failed to load entities");
        }
      } catch (err) {
        console.error("Failed to fetch entities:", err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }

    fetchEntities();
  }, [projectId, dimensions.width, dimensions.height]);

  // Simple force simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    const simulation = setInterval(() => {
      setNodes((currentNodes) => {
        const newNodes = currentNodes.map((node) => ({ ...node }));

        // Apply forces
        for (let i = 0; i < newNodes.length; i++) {
          let fx = 0;
          let fy = 0;

          // Repulsion between nodes
          for (let j = 0; j < newNodes.length; j++) {
            if (i !== j) {
              const dx = newNodes[i].x! - newNodes[j].x!;
              const dy = newNodes[i].y! - newNodes[j].y!;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const force = 1000 / (dist * dist);
              fx += (dx / dist) * force;
              fy += (dy / dist) * force;
            }
          }

          // Attraction along edges
          edges.forEach((edge) => {
            if (edge.source === newNodes[i].id || edge.target === newNodes[i].id) {
              const otherId = edge.source === newNodes[i].id ? edge.target : edge.source;
              const other = newNodes.find((n) => n.id === otherId);
              if (other) {
                const dx = other.x! - newNodes[i].x!;
                const dy = other.y! - newNodes[i].y!;
                fx += dx * 0.01;
                fy += dy * 0.01;
              }
            }
          });

          // Center gravity
          fx += (dimensions.width / 2 - newNodes[i].x!) * 0.001;
          fy += (dimensions.height / 2 - newNodes[i].y!) * 0.001;

          // Update velocity with damping
          newNodes[i].vx = (newNodes[i].vx! + fx) * 0.9;
          newNodes[i].vy = (newNodes[i].vy! + fy) * 0.9;

          // Update position
          newNodes[i].x = newNodes[i].x! + newNodes[i].vx!;
          newNodes[i].y = newNodes[i].y! + newNodes[i].vy!;

          // Keep within bounds
          newNodes[i].x = Math.max(50, Math.min(dimensions.width - 50, newNodes[i].x!));
          newNodes[i].y = Math.max(50, Math.min(dimensions.height - 50, newNodes[i].y!));
        }

        return newNodes;
      });
    }, 50);

    // Stop after 3 seconds
    const timeout = setTimeout(() => clearInterval(simulation), 3000);

    return () => {
      clearInterval(simulation);
      clearTimeout(timeout);
    };
  }, [nodes.length, edges, dimensions.width, dimensions.height]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href={`/projects/${projectId}`}
        className="text-heritage-600 hover:text-heritage-700 mb-4 inline-block"
      >
        &larr; Retour au projet
      </Link>

      <h1 className="text-3xl font-bold text-heritage-900 mb-2">
        Graphe d&apos;entités
      </h1>
      <p className="text-heritage-600 mb-6">
        Visualisation des entités et leurs relations
      </p>

      {stats && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div>
              <div className="text-2xl font-bold text-heritage-900">
                {stats.totalEntities}
              </div>
              <div className="text-sm text-heritage-600">Total entités</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-heritage-900">
                {stats.totalRelationships}
              </div>
              <div className="text-sm text-heritage-600">Relations</div>
            </div>
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type}>
                <div
                  className="text-2xl font-bold"
                  style={{ color: typeColors[type] }}
                >
                  {count}
                </div>
                <div className="text-sm text-heritage-600">
                  {typeLabels[type]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-4 mb-4">
          {Object.entries(typeLabels).map(([type, label]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: typeColors[type] }}
              />
              <span className="text-sm text-heritage-700">{label}</span>
            </div>
          ))}
        </div>

        {nodes.length === 0 ? (
          <div className="text-center py-16 text-heritage-600">
            Aucune entité trouvée. Lancez l&apos;extraction d&apos;entités sur vos
            documents.
          </div>
        ) : (
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="border border-heritage-200 rounded-lg bg-heritage-50"
          >
            {/* Edges */}
            {edges.map((edge) => {
              const source = nodes.find((n) => n.id === edge.source);
              const target = nodes.find((n) => n.id === edge.target);
              if (!source || !target) return null;

              return (
                <g key={edge.id}>
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                  />
                  <text
                    x={(source.x! + target.x!) / 2}
                    y={(source.y! + target.y!) / 2}
                    fontSize="10"
                    fill="#94A3B8"
                    textAnchor="middle"
                  >
                    {edge.relationType}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer"
                onClick={() => setSelectedNode(node)}
              >
                <circle
                  r="20"
                  fill={typeColors[node.type]}
                  stroke={selectedNode?.id === node.id ? "#000" : "white"}
                  strokeWidth="2"
                />
                <text
                  dy=".35em"
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  fontWeight="bold"
                >
                  {node.name.substring(0, 2).toUpperCase()}
                </text>
                <text
                  dy="35"
                  textAnchor="middle"
                  fontSize="11"
                  fill="#374151"
                >
                  {node.name.length > 15
                    ? node.name.substring(0, 15) + "..."
                    : node.name}
                </text>
              </g>
            ))}
          </svg>
        )}

        {selectedNode && (
          <div className="mt-4 p-4 bg-heritage-50 rounded-lg">
            <h3 className="font-semibold text-heritage-900 mb-2">
              {selectedNode.name}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-heritage-600">Type:</span>{" "}
                <span
                  className="font-medium"
                  style={{ color: typeColors[selectedNode.type] }}
                >
                  {typeLabels[selectedNode.type]}
                </span>
              </div>
              {selectedNode.description && (
                <div className="col-span-2">
                  <span className="text-heritage-600">Description:</span>{" "}
                  <span className="text-heritage-900">
                    {selectedNode.description}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
