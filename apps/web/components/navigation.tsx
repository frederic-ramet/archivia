"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-heritage-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Archivia
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className={`transition-colors ${
                isActive("/") && pathname === "/"
                  ? "text-heritage-300"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Accueil
            </Link>
            <Link
              href="/projects"
              className={`transition-colors ${
                isActive("/projects")
                  ? "text-heritage-300"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Projets
            </Link>
            <Link
              href="/projects/new"
              className="bg-heritage-600 hover:bg-heritage-500 px-4 py-2 rounded-md transition-colors"
            >
              Nouveau Projet
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
