'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface GraphNode {
  id: string;
  name: string;
  type: 'person' | 'place' | 'event' | 'object' | 'concept';
  aliases?: string[];
  description?: string | null;
  properties?: Record<string, unknown>;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphEdge {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  relationType: string;
  weight?: number | null;
  properties?: Record<string, unknown>;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface KnowledgeGraphProps {
  data: GraphData;
}

export default function KnowledgeGraph({ data }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const colors = {
    person: '#8B4513',
    place: '#4A7C59',
    event: '#D4AF37',
    object: '#6B7280',
    concept: '#8B5A8B',
  };

  const typeLabels = {
    person: 'Personne',
    place: 'Lieu',
    event: 'Événement',
    object: 'Objet',
    concept: 'Concept',
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data.nodes.length) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Add zoom behavior
    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    svg.call(zoom);

    // Add arrow markers for directed edges
    svg.append('defs').selectAll('marker')
      .data(['end'])
      .join('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Create simulation
    const simulation = d3.forceSimulation<GraphNode>(data.nodes)
      .force('link', d3.forceLink<GraphNode, GraphEdge>(data.edges)
        .id(d => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody<GraphNode>().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<GraphNode>().radius(35));

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.edges)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrowhead)');

    // Create link labels
    const linkLabels = g.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(data.edges)
      .join('text')
      .attr('font-size', '9px')
      .attr('fill', '#666')
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')
      .text(d => d.relationType);

    // Create nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
      });

    // Add circles to nodes
    node.append('circle')
      .attr('r', 15)
      .attr('fill', d => colors[d.type] || '#ccc')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add labels to nodes
    node.append('text')
      .attr('dy', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#333')
      .attr('font-weight', '500')
      .attr('pointer-events', 'none')
      .text(d => d.name.length > 15 ? d.name.substring(0, 13) + '...' : d.name);

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x || 0)
        .attr('y1', d => (d.source as GraphNode).y || 0)
        .attr('x2', d => (d.target as GraphNode).x || 0)
        .attr('y2', d => (d.target as GraphNode).y || 0);

      linkLabels
        .attr('x', d => ((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2)
        .attr('y', d => ((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Apply filter
    if (filter !== 'all') {
      node.style('opacity', d => d.type === filter ? 1 : 0.2);
      link.style('opacity', e => {
        const source = e.source as GraphNode;
        const target = e.target as GraphNode;
        return (source.type === filter || target.type === filter) ? 0.6 : 0.1;
      });
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, filter]);

  const connectedEdges = selectedNode
    ? data.edges.filter(e =>
        (typeof e.source === 'string' ? e.source : e.source.id) === selectedNode.id ||
        (typeof e.target === 'string' ? e.target : e.target.id) === selectedNode.id
      )
    : [];

  const incomingRels = connectedEdges.filter(e =>
    (typeof e.target === 'string' ? e.target : e.target.id) === selectedNode?.id
  );

  const outgoingRels = connectedEdges.filter(e =>
    (typeof e.source === 'string' ? e.source : e.source.id) === selectedNode?.id
  );

  return (
    <div className="flex h-full gap-4">
      {/* Main graph */}
      <div className="flex-1 relative bg-white rounded-lg shadow-lg overflow-hidden">
        <div ref={containerRef} className="w-full h-full">
          <svg ref={svgRef} className="w-full h-full" />
        </div>

        {/* Legend */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-heritage-900 mb-3">Légende</h3>
          <div className="space-y-2">
            <button
              onClick={() => setFilter('all')}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded text-xs transition ${
                filter === 'all' ? 'bg-heritage-100' : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-heritage-700 font-medium">Tous</span>
            </button>
            {(Object.entries(colors) as [keyof typeof colors, string][]).map(([type, color]) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded text-xs transition ${
                  filter === type ? 'bg-heritage-100' : 'hover:bg-gray-50'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-700">{typeLabels[type]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => {
              const svg = d3.select(svgRef.current);
              svg.transition().call(
                d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
                1.3
              );
            }}
            className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow border border-gray-200 transition"
            title="Zoom in"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button
            onClick={() => {
              const svg = d3.select(svgRef.current);
              svg.transition().call(
                d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
                0.7
              );
            }}
            className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow border border-gray-200 transition"
            title="Zoom out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Info panel */}
      {selectedNode && (
        <div className="w-80 bg-white rounded-lg shadow-lg p-6 border border-gray-200 overflow-y-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-heritage-900">{selectedNode.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[selectedNode.type] }}
                />
                <span className="text-sm text-gray-600">{typeLabels[selectedNode.type]}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {selectedNode.description && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
              <p className="text-sm text-gray-600">{selectedNode.description}</p>
            </div>
          )}

          {selectedNode.aliases && selectedNode.aliases.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Alias</h4>
              <div className="flex flex-wrap gap-1">
                {selectedNode.aliases.map((alias, i) => (
                  <span
                    key={i}
                    className="text-xs bg-heritage-100 text-heritage-700 px-2 py-1 rounded"
                  >
                    {alias}
                  </span>
                ))}
              </div>
            </div>
          )}

          {outgoingRels.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Relations sortantes</h4>
              <ul className="space-y-1">
                {outgoingRels.map(rel => {
                  const target = typeof rel.target === 'string'
                    ? data.nodes.find(n => n.id === rel.target)
                    : rel.target;
                  return (
                    <li key={rel.id} className="text-sm text-gray-600">
                      <span className="font-medium text-heritage-600">{rel.relationType}</span>
                      {' → '}
                      <span>{target?.name}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {incomingRels.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Relations entrantes</h4>
              <ul className="space-y-1">
                {incomingRels.map(rel => {
                  const source = typeof rel.source === 'string'
                    ? data.nodes.find(n => n.id === rel.source)
                    : rel.source;
                  return (
                    <li key={rel.id} className="text-sm text-gray-600">
                      <span>{source?.name}</span>
                      {' → '}
                      <span className="font-medium text-heritage-600">{rel.relationType}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{connectedEdges.length}</span> connexion{connectedEdges.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
