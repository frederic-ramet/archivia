"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface SearchResult {
  type: "document" | "entity";
  id: string;
  title: string;
  projectId: string;
  projectName?: string;
  snippet?: string;
  relevance: number;
  metadata?: Record<string, unknown>;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`);
          const data = await response.json();
          if (data.success) {
            setResults(data.data.results);
            setIsOpen(true);
          }
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [query]);

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher..."
          className="w-48 lg:w-64 px-4 py-1.5 pl-9 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
        />
        <svg
          className="absolute left-2.5 top-2 w-4 h-4 text-white/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {loading && (
          <div className="absolute right-2.5 top-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-heritage-200 max-h-96 overflow-auto z-50">
          {results.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              href={
                result.type === "document"
                  ? `/projects/${result.projectId}`
                  : `/projects/${result.projectId}/entities`
              }
              onClick={() => {
                setIsOpen(false);
                setQuery("");
              }}
              className="block px-4 py-3 hover:bg-heritage-50 border-b border-heritage-100 last:border-b-0"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    result.type === "document"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {result.type === "document" ? "Document" : "Entité"}
                </span>
                <span className="text-xs text-heritage-500">
                  {result.projectName}
                </span>
              </div>
              <div className="font-medium text-heritage-900">{result.title}</div>
              {result.snippet && (
                <div className="text-sm text-heritage-600 mt-1 line-clamp-2">
                  {result.snippet}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-heritage-200 p-4 z-50">
          <div className="text-heritage-600 text-sm">Aucun résultat trouvé</div>
        </div>
      )}
    </div>
  );
}
