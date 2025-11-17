"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Gallery from "@/components/gallery/Gallery";

interface Document {
  id: string;
  title: string;
  filePath: string;
  category: string | null;
  period: string | null;
  tags: string[];
  description: string | null;
  transcription: string | null;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
}

export default function ProjectGalleryPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch project
        const projectRes = await fetch(`/api/projects/${projectId}`);
        const projectData = await projectRes.json();
        if (projectData.success) {
          setProject(projectData.data);
        }

        // Fetch documents
        const docsRes = await fetch(`/api/documents?projectId=${projectId}&limit=100`);
        const docsData = await docsRes.json();
        if (docsData.success && docsData.data) {
          // Transform API response to Gallery format
          const galleryDocs = docsData.data.items.map((doc: any) => ({
            id: doc.id,
            title: doc.title,
            filePath: doc.filePath,
            category: doc.category || null,
            period: doc.period || null,
            tags: doc.tags || [],
            description: doc.description || null,
            transcription: doc.transcription || null,
            createdAt: new Date(doc.createdAt),
          }));
          setDocuments(galleryDocs);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load gallery");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [projectId]);

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
        <Link
          href={`/projects/${projectId}`}
          className="text-heritage-600 hover:text-heritage-700 mt-4 inline-block"
        >
          &larr; Retour au projet
        </Link>
      </div>
    );
  }

  // Extract unique categories
  const categories = Array.from(
    new Set(documents.map(d => d.category).filter((c): c is string => c !== null))
  ).sort();

  return (
    <div className="min-h-screen bg-gradient-to-b from-heritage-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-heritage-200">
        <div className="container mx-auto px-4 py-6">
          <Link
            href={`/projects/${projectId}`}
            className="text-heritage-600 hover:text-heritage-700 mb-4 inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au projet
          </Link>
          <div className="mt-4">
            <h1 className="text-4xl font-serif font-bold text-heritage-900">
              {project?.name || "Galerie"}
            </h1>
            {project?.description && (
              <p className="text-lg text-heritage-600 mt-2">{project.description}</p>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex gap-3 mt-6">
            <Link
              href={`/projects/${projectId}`}
              className="px-4 py-2 bg-heritage-100 hover:bg-heritage-200 text-heritage-800 rounded-lg text-sm font-medium transition"
            >
              Vue liste
            </Link>
            <Link
              href={`/projects/${projectId}/entities`}
              className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-sm font-medium transition"
            >
              Graphe d'entités
            </Link>
          </div>
        </div>
      </div>

      {/* Gallery Component */}
      {documents.length === 0 ? (
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-heritage-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-heritage-700 mb-2">
              Aucun document
            </h3>
            <p className="text-heritage-600 mb-6">
              Ajoutez des documents pour commencer à construire votre galerie
            </p>
            <Link
              href={`/projects/${projectId}`}
              className="inline-block bg-heritage-600 hover:bg-heritage-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Aller au projet
            </Link>
          </div>
        </div>
      ) : (
        <Gallery documents={documents} categories={categories} />
      )}
    </div>
  );
}
