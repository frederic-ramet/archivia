"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Analytics {
  summary: {
    totalProjects: number;
    totalDocuments: number;
    totalEntities: number;
    totalRelationships: number;
  };
  breakdown: {
    projectsByStatus: Record<string, number>;
    documentsByStatus: Record<string, number>;
    entitiesByType: Record<string, number>;
  };
  storage: {
    totalDocuments: number;
    withThumbnails: number;
    withOCR: number;
  };
  recentActivity: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    createdAt: string;
    projectId: string;
  }>;
}

export default function AnalyticsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      router.push("/");
      return;
    }

    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/analytics");
        const data = await response.json();

        if (data.success) {
          setAnalytics(data.data);
        } else {
          setError(data.message || "Failed to fetch analytics");
        }
      } catch (err) {
        setError("Network error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [session, status, router]);

  if (status === "loading" || loading) {
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

  if (!analytics) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-yellow-500",
      active: "bg-green-500",
      archived: "bg-gray-500",
      pending: "bg-gray-400",
      processing: "bg-blue-500",
      completed: "bg-green-500",
      verified: "bg-purple-500",
    };
    return colors[status] || "bg-gray-400";
  };

  const getEntityColor = (type: string) => {
    const colors: Record<string, string> = {
      person: "bg-blue-500",
      place: "bg-green-500",
      event: "bg-yellow-500",
      object: "bg-orange-500",
      concept: "bg-purple-500",
    };
    return colors[type] || "bg-gray-400";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-heritage-900">
          Dashboard Analytics
        </h1>
        <Link
          href="/admin"
          className="text-heritage-600 hover:text-heritage-700"
        >
          &larr; Retour admin
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-heritage-600">Projets</p>
              <p className="text-3xl font-bold text-heritage-900">
                {analytics.summary.totalProjects}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-heritage-600">Documents</p>
              <p className="text-3xl font-bold text-heritage-900">
                {analytics.summary.totalDocuments}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="w-8 h-8 text-green-600"
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
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-heritage-600">Entités</p>
              <p className="text-3xl font-bold text-heritage-900">
                {analytics.summary.totalEntities}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-heritage-600">Relations</p>
              <p className="text-3xl font-bold text-heritage-900">
                {analytics.summary.totalRelationships}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Projects by Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-heritage-900 mb-4">
            Projets par statut
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.breakdown.projectsByStatus).map(
              ([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getStatusColor(status)} rounded-full h-2`}
                      style={{
                        width: `${(count / analytics.summary.totalProjects) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Documents by Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-heritage-900 mb-4">
            Documents par statut
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.breakdown.documentsByStatus).map(
              ([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getStatusColor(status)} rounded-full h-2`}
                      style={{
                        width: `${(count / analytics.summary.totalDocuments) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Entities by Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-heritage-900 mb-4">
            Entités par type
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.breakdown.entitiesByType).map(
              ([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{type}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getEntityColor(type)} rounded-full h-2`}
                      style={{
                        width: `${(count / analytics.summary.totalEntities) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-heritage-900 mb-4">
            Statistiques de traitement
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Documents avec miniatures</span>
                <span className="font-medium">
                  {analytics.storage.withThumbnails} /{" "}
                  {analytics.storage.totalDocuments}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 rounded-full h-3"
                  style={{
                    width: `${(analytics.storage.withThumbnails / analytics.storage.totalDocuments) * 100 || 0}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Documents avec OCR</span>
                <span className="font-medium">
                  {analytics.storage.withOCR} /{" "}
                  {analytics.storage.totalDocuments}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 rounded-full h-3"
                  style={{
                    width: `${(analytics.storage.withOCR / analytics.storage.totalDocuments) * 100 || 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-heritage-900 mb-4">
            Activité récente
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {analytics.recentActivity.length === 0 ? (
              <p className="text-heritage-500">Aucune activité récente</p>
            ) : (
              analytics.recentActivity.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {doc.title}
                    </p>
                    <p className="text-xs text-heritage-500">
                      {new Date(doc.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${getStatusColor(doc.status)} text-white`}
                  >
                    {doc.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
