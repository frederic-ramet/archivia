'use client';

import { useState } from 'react';
import PhotoZoom from './PhotoZoom';

interface DocumentViewerProps {
  document: {
    id: string;
    title: string;
    filePath: string;
    transcription?: string | null;
    transcriptionProvider?: string | null;
    category?: string | null;
    period?: string | null;
    tags?: string[];
    description?: string | null;
  };
  showTranscription?: boolean;
}

type ViewMode = 'split' | 'image' | 'text';

export default function DocumentViewer({
  document,
  showTranscription = true
}: DocumentViewerProps) {
  const [view, setView] = useState<ViewMode>('split');

  const hasTranscription = showTranscription && document.transcription;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-heritage-900">{document.title}</h2>
          {document.description && (
            <p className="text-sm text-gray-600 mt-1">{document.description}</p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView('split')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              view === 'split'
                ? 'bg-heritage-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${!hasTranscription ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!hasTranscription}
            title={!hasTranscription ? 'Aucune transcription disponible' : ''}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Côte à côte
          </button>
          <button
            onClick={() => setView('image')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              view === 'image'
                ? 'bg-heritage-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Image
          </button>
          {hasTranscription && (
            <button
              onClick={() => setView('text')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === 'text'
                  ? 'bg-heritage-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Texte
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Image Panel */}
        {(view === 'split' || view === 'image') && (
          <div className={`${view === 'split' ? 'w-1/2' : 'w-full'} ${view === 'split' ? 'border-r' : ''} bg-white overflow-hidden`}>
            <PhotoZoom
              src={document.filePath}
              alt={document.title}
            />
          </div>
        )}

        {/* Text Panel */}
        {hasTranscription && (view === 'split' || view === 'text') && (
          <div className={`${view === 'split' ? 'w-1/2' : 'w-full'} bg-white overflow-y-auto`}>
            <div className="p-8 max-w-4xl mx-auto">
              {/* Transcription Header */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="text-2xl font-serif font-bold text-heritage-900 mb-2">Transcription</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {document.transcription.length} caractères
                  </span>
                  {document.transcriptionProvider && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      {document.transcriptionProvider}
                    </span>
                  )}
                </div>
              </div>

              {/* Transcription Text */}
              <div className="prose prose-heritage max-w-none mb-8">
                <div className="font-serif text-lg leading-relaxed whitespace-pre-wrap text-gray-800">
                  {document.transcription}
                </div>
              </div>

              {/* Metadata */}
              {(document.category || document.period || (document.tags && document.tags.length > 0)) && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-lg font-semibold text-heritage-900 mb-4">Métadonnées</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {document.category && (
                      <>
                        <dt className="font-medium text-gray-700">Catégorie</dt>
                        <dd className="text-gray-900">
                          <span className="inline-block px-3 py-1 bg-heritage-100 text-heritage-800 rounded-full text-sm">
                            {document.category}
                          </span>
                        </dd>
                      </>
                    )}
                    {document.period && (
                      <>
                        <dt className="font-medium text-gray-700">Période</dt>
                        <dd className="text-gray-900">
                          <span className="inline-block px-3 py-1 bg-heritage-100 text-heritage-800 rounded-full text-sm">
                            {document.period}
                          </span>
                        </dd>
                      </>
                    )}
                    {document.tags && document.tags.length > 0 && (
                      <>
                        <dt className="font-medium text-gray-700 col-span-2">Tags</dt>
                        <dd className="col-span-2 flex gap-2 flex-wrap">
                          {document.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </dd>
                      </>
                    )}
                  </dl>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No transcription message */}
        {!hasTranscription && view !== 'image' && (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">Aucune transcription disponible</p>
              <p className="text-sm mt-2">Lancez l&apos;OCR pour transcrire ce document</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
