"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DocumentViewer from "@/components/documents/DocumentViewer";

interface Document {
  id: string;
  title: string;
  filePath: string;
  transcription?: string | null;
  transcriptionProvider?: string | null;
  category?: string | null;
  period?: string | null;
  tags?: string[];
  description?: string | null;
  transcriptionStatus: string;
}

export default function DocumentDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const docId = params.docId as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [extractingEntities, setExtractingEntities] = useState(false);

  useEffect(() => {
    async function fetchDocument() {
      try {
        setLoading(true);
        const response = await fetch(`/api/documents/${docId}`);
        const data = await response.json();

        if (data.success && data.data) {
          setDocument(data.data);
        } else {
          setError(data.error || "Document not found");
        }
      } catch (err) {
        console.error("Failed to fetch document:", err);
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    }

    fetchDocument();
  }, [docId]);

  const handleOCR = async () => {
    if (!document) return;

    setOcrProcessing(true);
    try {
      const response = await fetch(`/api/documents/${docId}/ocr`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        // Reload document to get transcription
        const docRes = await fetch(`/api/documents/${docId}`);
        const docData = await docRes.json();
        if (docData.success) {
          setDocument(docData.data);
        }
        alert(`OCR terminé ! ${data.data.ocr.textLength} caractères extraits.`);
      } else {
        alert(data.error || "Échec de l'OCR");
      }
    } catch (err) {
      console.error("OCR error:", err);
      alert("Erreur lors de l'OCR");
    } finally {
      setOcrProcessing(false);
    }
  };

  const handleExtractEntities = async () => {
    if (!document || !document.transcription) return;

    setExtractingEntities(true);
    try {
      const response = await fetch(`/api/documents/${docId}/extract-entities`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        alert(
          `Extraction terminée ! ${data.data.entities.length} entités et ${data.data.relationships.length} relations trouvées.`
        );
      } else {
        alert(data.error || "Échec de l'extraction");
      }
    } catch (err) {
      console.error("Entity extraction error:", err);
      alert("Erreur lors de l'extraction");
    } finally {
      setExtractingEntities(false);
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
      {/* Top navigation bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/projects/${projectId}/gallery`}
              className="text-heritage-600 hover:text-heritage-700 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour à la galerie
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href={`/projects/${projectId}`}
              className="text-heritage-600 hover:text-heritage-700"
            >
              Projet
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* OCR Button */}
            {document.transcriptionStatus === "pending" && (
              <button
                onClick={handleOCR}
                disabled={ocrProcessing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {ocrProcessing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    OCR en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Lancer OCR
                  </>
                )}
              </button>
            )}

            {/* Extract Entities Button */}
            {document.transcriptionStatus === "completed" && document.transcription && (
              <button
                onClick={handleExtractEntities}
                disabled={extractingEntities}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {extractingEntities ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Extraction...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Extraire entités
                  </>
                )}
              </button>
            )}

            {/* Annotate Link */}
            <Link
              href={`/projects/${projectId}/documents/${docId}/annotate`}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Annoter
            </Link>

            {/* View Graph Link */}
            <Link
              href={`/projects/${projectId}/entities`}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Graphe
            </Link>
          </div>
        </div>
      </div>

      {/* Document Viewer - takes remaining height */}
      <div className="flex-1 overflow-hidden">
        <DocumentViewer document={document} />
      </div>
    </div>
  );
}
