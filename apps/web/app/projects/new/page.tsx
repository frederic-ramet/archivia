"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormData {
  name: string;
  slug: string;
  description: string;
  isPublic: boolean;
  primaryLanguage: string;
  institution: string;
  curator: string;
  periodStart: string;
  periodEnd: string;
  themes: string;
  features: {
    ocr: boolean;
    annotations: boolean;
    hotspots: boolean;
    stories: boolean;
    timeline: boolean;
    map: boolean;
    ontology: boolean;
    aiGeneration: boolean;
  };
}

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    description: "",
    isPublic: false,
    primaryLanguage: "fr",
    institution: "",
    curator: "",
    periodStart: "",
    periodEnd: "",
    themes: "",
    features: {
      ocr: true,
      annotations: true,
      hotspots: false,
      stories: false,
      timeline: false,
      map: false,
      ontology: false,
      aiGeneration: false,
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        isPublic: formData.isPublic,
        config: {
          features: {
            ...formData.features,
            publicReader: true,
            collaboration: false,
          },
          primaryLanguage: formData.primaryLanguage,
          acceptedFormats: ["jpg", "png", "tiff"],
        },
        metadata: {
          institution: formData.institution || undefined,
          curator: formData.curator || undefined,
          periodStart: formData.periodStart || undefined,
          periodEnd: formData.periodEnd || undefined,
          themes: formData.themes
            ? formData.themes.split(",").map((t) => t.trim())
            : [],
          contributors: [],
          license: "CC BY-NC-SA 4.0",
        },
      };

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success && data.data) {
        router.push(`/projects/${data.data.id}`);
      } else {
        setError(data.error || "Failed to create project");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link
          href="/projects"
          className="text-heritage-600 hover:text-heritage-700 mb-4 inline-block"
        >
          &larr; Retour aux projets
        </Link>
        <h1 className="text-3xl font-bold text-heritage-900">
          Nouveau Projet
        </h1>
        <p className="text-heritage-600 mt-2">
          Créez une nouvelle collection patrimoniale
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-heritage-900 mb-4">
            Informations générales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-heritage-700 mb-2">
                Nom du projet *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                required
                className="w-full px-4 py-2 border border-heritage-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500"
                placeholder="Journal de Guerre 1918"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-heritage-700 mb-2">
                Identifiant (slug) *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                required
                pattern="^[a-z0-9-]+$"
                className="w-full px-4 py-2 border border-heritage-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500"
                placeholder="journal-de-guerre-1918"
              />
              <p className="text-xs text-heritage-500 mt-1">
                Lettres minuscules, chiffres et tirets uniquement
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-heritage-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-4 py-2 border border-heritage-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500"
              placeholder="Décrivez votre projet patrimonial..."
            />
          </div>

          <div className="mt-6 flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isPublic: e.target.checked,
                }))
              }
              className="h-4 w-4 text-heritage-600 focus:ring-heritage-500 border-heritage-300 rounded"
            />
            <label
              htmlFor="isPublic"
              className="ml-2 text-sm text-heritage-700"
            >
              Rendre ce projet public
            </label>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-heritage-900 mb-4">
            Métadonnées
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-heritage-700 mb-2">
                Institution
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    institution: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-heritage-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500"
                placeholder="Archives départementales"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-heritage-700 mb-2">
                Conservateur / Responsable
              </label>
              <input
                type="text"
                value={formData.curator}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, curator: e.target.value }))
                }
                className="w-full px-4 py-2 border border-heritage-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500"
                placeholder="Nom du responsable"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-heritage-700 mb-2">
                Période de début
              </label>
              <input
                type="text"
                value={formData.periodStart}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    periodStart: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-heritage-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500"
                placeholder="1914"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-heritage-700 mb-2">
                Période de fin
              </label>
              <input
                type="text"
                value={formData.periodEnd}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    periodEnd: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-heritage-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500"
                placeholder="1918"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-heritage-700 mb-2">
              Thèmes (séparés par des virgules)
            </label>
            <input
              type="text"
              value={formData.themes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, themes: e.target.value }))
              }
              className="w-full px-4 py-2 border border-heritage-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500"
              placeholder="Première Guerre Mondiale, Correspondance, Vie quotidienne"
            />
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-heritage-900 mb-4">
            Fonctionnalités
          </h2>
          <p className="text-sm text-heritage-600 mb-4">
            Sélectionnez les fonctionnalités à activer pour ce projet
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: "ocr", label: "OCR (Transcription)" },
              { key: "annotations", label: "Annotations" },
              { key: "hotspots", label: "Points d'intérêt" },
              { key: "stories", label: "Récits narratifs" },
              { key: "timeline", label: "Frise chronologique" },
              { key: "map", label: "Carte géographique" },
              { key: "ontology", label: "Ontologie progressive" },
              { key: "aiGeneration", label: "Génération IA" },
            ].map((feature) => (
              <div key={feature.key} className="flex items-center">
                <input
                  type="checkbox"
                  id={feature.key}
                  checked={
                    formData.features[
                      feature.key as keyof typeof formData.features
                    ]
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      features: {
                        ...prev.features,
                        [feature.key]: e.target.checked,
                      },
                    }))
                  }
                  className="h-4 w-4 text-heritage-600 focus:ring-heritage-500 border-heritage-300 rounded"
                />
                <label
                  htmlFor={feature.key}
                  className="ml-2 text-sm text-heritage-700"
                >
                  {feature.label}
                </label>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end space-x-4">
          <Link
            href="/projects"
            className="px-6 py-3 border border-heritage-300 rounded-lg text-heritage-700 hover:bg-heritage-50 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-heritage-600 text-white rounded-lg hover:bg-heritage-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Création..." : "Créer le projet"}
          </button>
        </div>
      </form>
    </div>
  );
}
