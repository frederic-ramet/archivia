"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface UploadModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

interface UploadFile {
  file: File;
  title: string;
  category: string;
  period: string;
  tags: string;
  preview?: string;
}

export function UploadModal({
  projectId,
  isOpen,
  onClose,
  onUploadComplete,
}: UploadModalProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const uploadFiles = newFiles.map((file) => {
      const uploadFile: UploadFile = {
        file,
        title: file.name.replace(/\.[^/.]+$/, ""),
        category: "",
        period: "",
        tags: "",
      };

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? { ...f, preview: reader.result as string }
                : f
            )
          );
        };
        reader.readAsDataURL(file);
      }

      return uploadFile;
    });

    setFiles((prev) => [...prev, ...uploadFiles]);
  };

  const updateFile = (index: number, updates: Partial<UploadFile>) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const totalFiles = files.length;
      let completed = 0;

      for (const uploadFile of files) {
        const formData = new FormData();
        formData.append("file", uploadFile.file);
        formData.append("projectId", projectId);
        formData.append("title", uploadFile.title);
        if (uploadFile.category)
          formData.append("category", uploadFile.category);
        if (uploadFile.period) formData.append("period", uploadFile.period);
        if (uploadFile.tags) formData.append("tags", uploadFile.tags);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.error || `Failed to upload ${uploadFile.file.name}`
          );
        }

        completed++;
        setUploadProgress(Math.round((completed / totalFiles) * 100));
      }

      onUploadComplete();
      setFiles([]);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-heritage-900">
              Ajouter des documents
            </h2>
            <button
              onClick={onClose}
              disabled={uploading}
              className="text-heritage-500 hover:text-heritage-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-heritage-500 bg-heritage-50"
                : "border-heritage-300 hover:border-heritage-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/tiff,image/webp,application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="text-heritage-500 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-heritage-700 mb-2">
              Glissez-déposez vos fichiers ici
            </p>
            <p className="text-heritage-500 text-sm mb-4">ou</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-heritage-600 hover:bg-heritage-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Parcourir les fichiers
            </button>
            <p className="text-heritage-500 text-xs mt-4">
              Formats acceptés : JPG, PNG, TIFF, WebP, PDF (max 50MB)
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-heritage-900">
                Fichiers sélectionnés ({files.length})
              </h3>

              {files.map((uploadFile, index) => (
                <div
                  key={index}
                  className="bg-heritage-50 rounded-lg p-4 border border-heritage-200"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-heritage-100 rounded flex-shrink-0 overflow-hidden relative">
                      {uploadFile.preview ? (
                        <Image
                          src={uploadFile.preview}
                          alt={uploadFile.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-heritage-400">
                          <svg
                            className="w-8 h-8"
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
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-heritage-600 mb-1">
                          Titre
                        </label>
                        <input
                          type="text"
                          value={uploadFile.title}
                          onChange={(e) =>
                            updateFile(index, { title: e.target.value })
                          }
                          className="w-full px-3 py-1.5 text-sm border border-heritage-300 rounded focus:ring-1 focus:ring-heritage-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-heritage-600 mb-1">
                          Catégorie
                        </label>
                        <input
                          type="text"
                          value={uploadFile.category}
                          onChange={(e) =>
                            updateFile(index, { category: e.target.value })
                          }
                          placeholder="Ex: Correspondance"
                          className="w-full px-3 py-1.5 text-sm border border-heritage-300 rounded focus:ring-1 focus:ring-heritage-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-heritage-600 mb-1">
                          Période
                        </label>
                        <input
                          type="text"
                          value={uploadFile.period}
                          onChange={(e) =>
                            updateFile(index, { period: e.target.value })
                          }
                          placeholder="Ex: 1918"
                          className="w-full px-3 py-1.5 text-sm border border-heritage-300 rounded focus:ring-1 focus:ring-heritage-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-heritage-600 mb-1">
                          Tags (séparés par virgules)
                        </label>
                        <input
                          type="text"
                          value={uploadFile.tags}
                          onChange={(e) =>
                            updateFile(index, { tags: e.target.value })
                          }
                          placeholder="Ex: lettre, famille"
                          className="w-full px-3 py-1.5 text-sm border border-heritage-300 rounded focus:ring-1 focus:ring-heritage-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg
                        className="w-5 h-5"
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
                    </button>
                  </div>
                  <div className="text-xs text-heritage-500 mt-2">
                    {uploadFile.file.name} •{" "}
                    {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-heritage-50">
          {uploading && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-heritage-600 mb-1">
                <span>Upload en cours...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-heritage-200 rounded-full h-2">
                <div
                  className="bg-heritage-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 border border-heritage-300 rounded-lg text-heritage-700 hover:bg-heritage-100 disabled:opacity-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="px-4 py-2 bg-heritage-600 text-white rounded-lg hover:bg-heritage-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading
                ? "Upload en cours..."
                : `Uploader ${files.length} fichier${files.length > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
