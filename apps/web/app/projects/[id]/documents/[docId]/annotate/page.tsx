"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import AnnotationEditor to avoid SSR issues with Konva
const AnnotationEditor = dynamic(
  () => import("@/components/annotations/AnnotationEditor"),
  { ssr: false }
);

interface Document {
  id: string;
  title: string;
  filePath: string;
}

interface Annotation {
  id: string;
  type: 'note' | 'correction' | 'hotspot' | 'region';
  content?: string | null;
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
  metadata: Record<string, unknown>;
}

export default function DocumentAnnotatePage() {
  const params = useParams();
  const projectId = params.id as string;
  const docId = params.docId as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch document
        const docRes = await fetch(`/api/documents/${docId}`);
        const docData = await docRes.json();

        if (!docData.success) {
          throw new Error(docData.error || "Failed to load document");
        }

        setDocument(docData.data);

        // Fetch annotations
        const annotRes = await fetch(`/api/documents/${docId}/annotations`);
        const annotData = await annotRes.json();

        if (annotData.success && annotData.data) {
          setAnnotations(annotData.data);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [docId]);

  const handleSaveAnnotation = async (annotation: Omit<Annotation, 'id'>) => {
    try {
      const response = await fetch(`/api/documents/${docId}/annotations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(annotation),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setAnnotations([...annotations, data.data]);
      } else {
        throw new Error(data.error || "Failed to save annotation");
      }
    } catch (err) {
      console.error("Failed to save annotation:", err);
      alert(err instanceof Error ? err.message : "Failed to save annotation");
    }
  };

  const handleUpdateAnnotation = async (annotationId: string, updates: Partial<Annotation>) => {
    try {
      const response = await fetch(`/api/documents/${docId}/annotations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ annotationId, ...updates }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setAnnotations(
          annotations.map(a => (a.id === annotationId ? data.data : a))
        );
      } else {
        throw new Error(data.error || "Failed to update annotation");
      }
    } catch (err) {
      console.error("Failed to update annotation:", err);
      alert(err instanceof Error ? err.message : "Failed to update annotation");
    }
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    try {
      const response = await fetch(`/api/documents/${docId}/annotations`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ annotationId }),
      });

      const data = await response.json();

      if (data.success) {
        setAnnotations(annotations.filter(a => a.id !== annotationId));
      } else {
        throw new Error(data.error || "Failed to delete annotation");
      }
    } catch (err) {
      console.error("Failed to delete annotation:", err);
      alert(err instanceof Error ? err.message : "Failed to delete annotation");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-600"></div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || "Document not found"}
        </div>
        <Link
          href={`/projects/${projectId}/documents/${docId}`}
          className="text-heritage-600 hover:text-heritage-700 mt-4 inline-block"
        >
          &larr; Back to document
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/projects/${projectId}/documents/${docId}`}
              className="text-heritage-600 hover:text-heritage-700 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to viewer
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-lg font-semibold text-heritage-900">{document.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Annotation Editor */}
      <div className="flex-1 overflow-hidden">
        <AnnotationEditor
          documentId={docId}
          imageSrc={document.filePath}
          onSave={handleSaveAnnotation}
          onUpdate={handleUpdateAnnotation}
          onDelete={handleDeleteAnnotation}
          initialAnnotations={annotations}
        />
      </div>
    </div>
  );
}
