"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { UploadModal } from "@/components/upload-modal";

interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  config: {
    features: {
      ocr: boolean;
      annotations: boolean;
      hotspots: boolean;
      stories: boolean;
      timeline: boolean;
      map: boolean;
      ontology: boolean;
      aiGeneration: boolean;
      publicReader: boolean;
      collaboration: boolean;
    };
    primaryLanguage: string;
    acceptedFormats: string[];
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    heroTitle?: string;
    heroSubtitle?: string;
    footerText?: string;
  };
  metadata: {
    institution?: string;
    curator?: string;
    contributors: string[];
    periodStart?: string;
    periodEnd?: string;
    themes: string[];
    license: string;
  };
  status: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Document {
  id: string;
  title: string;
  type: string;
  filePath: string;
  thumbnailPath?: string;
  transcriptionStatus: string;
  category?: string;
  period?: string;
  tags: string[];
  createdAt: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);
  const [ocrProcessing, setOcrProcessing] = useState<string | null>(null);

  const handleOCR = async (docId: string) => {
    setOcrProcessing(docId);
    try {
      const response = await fetch(`/api/documents/${docId}/ocr`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        // Update the document in local state
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === docId
              ? { ...d, transcriptionStatus: "completed" }
              : d
          )
        );
        alert(`OCR terminé ! ${data.data.ocr.textLength} caractères extraits.`);
      } else {
        alert(data.error || "Échec de l'OCR");
      }
    } catch (err) {
      console.error("OCR error:", err);
      alert("Erreur lors de l'OCR");
    } finally {
      setOcrProcessing(null);
    }
  };

  const handleDeleteDocument = async (docId: string, docTitle: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${docTitle}" ?`)) {
      return;
    }

    setDeletingDoc(docId);
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
      } else {
        alert(data.error || "Échec de la suppression");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Erreur lors de la suppression");
    } finally {
      setDeletingDoc(null);
    }
  };

  const fetchDocuments = useCallback(async () => {
    try {
      setLoadingDocs(true);
      const response = await fetch(
        `/api/documents?projectId=${projectId}&limit=50`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setDocuments(data.data.items);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  }, [projectId]);

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        const data = await response.json();

        if (data.success && data.data) {
          setProject(data.data);
        } else {
          setError(data.error || "Project not found");
        }
      } catch (err) {
        setError("Network error. Please try again.");
        console.error(err);
      } finally {
        setLoadingProject(false);
      }
    }

    fetchProject();
    fetchDocuments();
  }, [projectId, fetchDocuments]);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      archived: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getTranscriptionBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-gray-100 text-gray-600",
      processing: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      verified: "bg-purple-100 text-purple-700",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  if (loadingProject) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || "Project not found"}
        </div>
        <Link
          href="/projects"
          className="text-heritage-600 hover:text-heritage-700 mt-4 inline-block"
        >
          &larr; Retour aux projets
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/projects"
        className="text-heritage-600 hover:text-heritage-700 mb-4 inline-block"
      >
        &larr; Retour aux projets
      </Link>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-heritage-900">
              {project.name}
            </h1>
            <p className="text-heritage-600 mt-2">{project.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(project.status)}`}
            >
              {project.status}
            </span>
            <span className="text-sm text-heritage-500">
              {project.isPublic ? "Public" : "Privé"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <h3 className="text-sm font-semibold text-heritage-700 mb-2">
              Métadonnées
            </h3>
            <dl className="space-y-2 text-sm">
              {project.metadata.institution && (
                <div>
                  <dt className="text-heritage-500">Institution</dt>
                  <dd className="text-heritage-900">
                    {project.metadata.institution}
                  </dd>
                </div>
              )}
              {project.metadata.curator && (
                <div>
                  <dt className="text-heritage-500">Conservateur</dt>
                  <dd className="text-heritage-900">
                    {project.metadata.curator}
                  </dd>
                </div>
              )}
              {project.metadata.periodStart && (
                <div>
                  <dt className="text-heritage-500">Période</dt>
                  <dd className="text-heritage-900">
                    {project.metadata.periodStart}
                    {project.metadata.periodEnd &&
                      ` - ${project.metadata.periodEnd}`}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-heritage-700 mb-2">
              Thèmes
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.metadata.themes.map((theme) => (
                <span
                  key={theme}
                  className="px-2 py-1 bg-heritage-100 text-heritage-700 rounded text-xs"
                >
                  {theme}
                </span>
              ))}
              {project.metadata.themes.length === 0 && (
                <span className="text-heritage-500 text-sm">Aucun thème</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-heritage-700 mb-2">
              Fonctionnalités actives
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(project.config.features)
                .filter(([, enabled]) => enabled)
                .map(([feature]) => (
                  <span
                    key={feature}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                  >
                    {feature}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-heritage-900">Documents</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-heritage-600 hover:bg-heritage-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Ajouter des documents
        </button>
      </div>

      {loadingDocs && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-heritage-600"></div>
        </div>
      )}

      {!loadingDocs && documents.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-heritage-700 mb-2">
            Aucun document
          </h3>
          <p className="text-heritage-600 mb-6">
            Commencez par ajouter des documents à votre projet
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-heritage-600 hover:bg-heritage-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Ajouter des documents
          </button>
        </div>
      )}

      {!loadingDocs && documents.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative"
            >
              <div className="aspect-square bg-heritage-100 flex items-center justify-center relative">
                {doc.thumbnailPath ? (
                  <Image
                    src={doc.thumbnailPath}
                    alt={doc.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="text-heritage-400">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDocument(doc.id, doc.title);
                  }}
                  disabled={deletingDoc === doc.id}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  title="Supprimer"
                >
                  {deletingDoc === doc.id ? (
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </button>
                {doc.type === "image" && doc.transcriptionStatus === "pending" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOCR(doc.id);
                    }}
                    disabled={ocrProcessing === doc.id}
                    className="absolute top-2 left-2 bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    title="Lancer OCR"
                  >
                    {ocrProcessing === doc.id ? (
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </div>
              <div className="p-3">
                <h4 className="text-sm font-medium text-heritage-900 truncate">
                  {doc.title}
                </h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-heritage-500">{doc.type}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${getTranscriptionBadge(doc.transcriptionStatus)}`}
                  >
                    {doc.transcriptionStatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <UploadModal
        projectId={projectId}
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={fetchDocuments}
      />
    </div>
  );
}
