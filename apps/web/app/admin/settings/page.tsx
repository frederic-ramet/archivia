"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ConfigItem {
  key: string;
  value: string;
  encrypted: boolean;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form state for API keys
  const [anthropicKey, setAnthropicKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [ocrProvider, setOcrProvider] = useState("anthropic");
  const [ocrLanguage, setOcrLanguage] = useState("fra");

  useEffect(() => {
    fetchConfigs();
  }, []);

  async function fetchConfigs() {
    try {
      const response = await fetch("/api/admin/config");
      const data = await response.json();

      if (data.success && data.data) {
        setConfigs(data.data);

        // Set form values from existing configs
        const anthropic = data.data.find(
          (c: ConfigItem) => c.key === "ANTHROPIC_API_KEY"
        );
        const openai = data.data.find(
          (c: ConfigItem) => c.key === "OPENAI_API_KEY"
        );
        const provider = data.data.find(
          (c: ConfigItem) => c.key === "OCR_PROVIDER"
        );
        const lang = data.data.find(
          (c: ConfigItem) => c.key === "OCR_LANGUAGE"
        );

        if (anthropic && !anthropic.encrypted)
          setAnthropicKey(anthropic.value);
        if (openai && !openai.encrypted) setOpenaiKey(openai.value);
        if (provider) setOcrProvider(provider.value);
        if (lang) setOcrLanguage(lang.value);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load configuration" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function saveConfig(key: string, value: string, encrypted = false) {
    const response = await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value, encrypted }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to save");
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      // Save all configurations
      const promises = [];

      if (anthropicKey && anthropicKey !== "***ENCRYPTED***") {
        promises.push(
          saveConfig("ANTHROPIC_API_KEY", anthropicKey, true)
        );
      }

      if (openaiKey && openaiKey !== "***ENCRYPTED***") {
        promises.push(saveConfig("OPENAI_API_KEY", openaiKey, true));
      }

      promises.push(saveConfig("OCR_PROVIDER", ocrProvider));
      promises.push(saveConfig("OCR_LANGUAGE", ocrLanguage));

      await Promise.all(promises);

      setMessage({ type: "success", text: "Configuration saved successfully" });
      fetchConfigs();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/projects"
        className="text-heritage-600 hover:text-heritage-700 mb-4 inline-block"
      >
        &larr; Retour
      </Link>

      <h1 className="text-3xl font-bold text-heritage-900 mb-2">
        Configuration Administration
      </h1>
      <p className="text-heritage-600 mb-8">
        Gérez les clés API et les paramètres de l&apos;application
      </p>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-heritage-900 mb-4">
            Clés API Intelligence Artificielle
          </h2>
          <p className="text-sm text-heritage-600 mb-6">
            Ces clés sont nécessaires pour les fonctionnalités OCR et génération
            de contenu IA.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-heritage-700 mb-2">
                Clé API Anthropic (Claude)
              </label>
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-4 py-2 border border-heritage-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 font-mono"
              />
              <p className="text-xs text-heritage-500 mt-1">
                Utilisée pour l&apos;OCR, l&apos;extraction d&apos;entités et
                la génération de contenu
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-heritage-700 mb-2">
                Clé API OpenAI (optionnel)
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2 border border-heritage-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 font-mono"
              />
              <p className="text-xs text-heritage-500 mt-1">
                Alternative pour certaines fonctionnalités IA
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-heritage-900 mb-4">
            Configuration OCR
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-heritage-700 mb-2">
                Fournisseur OCR
              </label>
              <select
                value={ocrProvider}
                onChange={(e) => setOcrProvider(e.target.value)}
                className="w-full px-4 py-2 border border-heritage-300 rounded-lg focus:ring-2 focus:ring-heritage-500"
              >
                <option value="anthropic">Claude (Anthropic)</option>
                <option value="openai">GPT-4 Vision (OpenAI)</option>
                <option value="tesseract">Tesseract (Local)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-heritage-700 mb-2">
                Langue principale
              </label>
              <select
                value={ocrLanguage}
                onChange={(e) => setOcrLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-heritage-300 rounded-lg focus:ring-2 focus:ring-heritage-500"
              >
                <option value="fra">Français</option>
                <option value="eng">Anglais</option>
                <option value="deu">Allemand</option>
                <option value="spa">Espagnol</option>
                <option value="ita">Italien</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-heritage-900 mb-4">
            Configurations actuelles
          </h2>

          {configs.length === 0 ? (
            <p className="text-heritage-600">Aucune configuration sauvegardée</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-heritage-700">Clé</th>
                    <th className="text-left py-2 text-heritage-700">Valeur</th>
                    <th className="text-left py-2 text-heritage-700">
                      Mis à jour
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((config) => (
                    <tr key={config.key} className="border-b">
                      <td className="py-2 font-mono text-heritage-900">
                        {config.key}
                      </td>
                      <td className="py-2 font-mono text-heritage-600">
                        {config.encrypted ? (
                          <span className="text-heritage-400">
                            ••••••••••••
                          </span>
                        ) : (
                          config.value
                        )}
                      </td>
                      <td className="py-2 text-heritage-500">
                        {new Date(config.updatedAt).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-heritage-600 text-white rounded-lg hover:bg-heritage-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Sauvegarde..." : "Sauvegarder la configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}
