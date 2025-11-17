"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectsResponse {
  success: boolean;
  data?: {
    items: Project[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects?page=${page}&limit=12`);
        const data: ProjectsResponse = await response.json();

        if (data.success && data.data) {
          setProjects(data.data.items);
          setTotalPages(data.data.pagination.totalPages);
        } else {
          setError(data.error || "Failed to fetch projects");
        }
      } catch (err) {
        setError("Network error. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [page]);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      archived: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-heritage-900">Projets</h1>
          <p className="text-heritage-600 mt-2">
            Gérez vos collections patrimoniales
          </p>
        </div>
        <Link
          href="/projects/new"
          className="bg-heritage-600 hover:bg-heritage-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Créer un projet
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-heritage-700 mb-2">
            Aucun projet
          </h3>
          <p className="text-heritage-600 mb-6">
            Commencez par créer votre premier projet patrimonial
          </p>
          <Link
            href="/projects/new"
            className="bg-heritage-600 hover:bg-heritage-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
          >
            Créer un projet
          </Link>
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 block"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-heritage-900">
                    {project.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(project.status)}`}
                  >
                    {project.status}
                  </span>
                </div>
                {project.description && (
                  <p className="text-heritage-600 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>
                )}
                <div className="flex justify-between items-center text-xs text-heritage-500">
                  <span>
                    {project.isPublic ? "Public" : "Privé"}
                  </span>
                  <span>
                    {new Date(project.updatedAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-heritage-100 text-heritage-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-heritage-200 transition-colors"
              >
                Précédent
              </button>
              <span className="px-4 py-2 text-heritage-700">
                Page {page} sur {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-heritage-100 text-heritage-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-heritage-200 transition-colors"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
