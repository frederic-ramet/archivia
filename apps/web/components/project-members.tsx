"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n/context";

interface Member {
  id: string;
  userId: string;
  role: "owner" | "editor" | "viewer";
  addedAt: string;
  userName: string | null;
  userEmail: string;
}

interface ProjectMembersProps {
  projectId: string;
  currentUserRole: "owner" | "editor" | "viewer" | "admin";
}

export function ProjectMembers({ projectId, currentUserRole }: ProjectMembersProps) {
  const { t } = useTranslation();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("viewer");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const canManage = currentUserRole === "owner" || currentUserRole === "admin";

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members`);
      const data = await res.json();
      if (data.success) {
        setMembers(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();
      if (data.success) {
        setMembers([...members, data.data]);
        setEmail("");
        setRole("viewer");
        setShowForm(false);
      } else {
        setError(data.message || "Failed to add member");
      }
    } catch (err) {
      setError("Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm(t("msg.confirmDelete") + " ce membre ?")) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}/members?memberId=${memberId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        setMembers(members.filter((m) => m.id !== memberId));
      } else {
        alert(data.message || "Failed to remove member");
      }
    } catch (err) {
      alert("Failed to remove member");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "editor":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Propriétaire";
      case "editor":
        return "Éditeur";
      case "viewer":
        return "Lecteur";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold">Membres du projet</h3>
        {canManage && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1 text-sm bg-violet-600 text-white rounded hover:bg-violet-700 transition-colors"
          >
            {showForm ? "Annuler" : "Ajouter un membre"}
          </button>
        )}
      </div>

      {showForm && canManage && (
        <div className="p-4 bg-gray-50 border-b">
          <form onSubmit={addMember} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de l&apos;utilisateur
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="utilisateur@example.com"
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="viewer">Lecteur</option>
                <option value="editor">Éditeur</option>
              </select>
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={adding}
              className="w-full px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {adding ? "Ajout en cours..." : "Ajouter"}
            </button>
          </form>
        </div>
      )}

      <div className="divide-y">
        {members.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">
            Aucun membre
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {member.userName || "Utilisateur"}
                </div>
                <div className="text-sm text-gray-600">{member.userEmail}</div>
                <div className="text-xs text-gray-400 mt-1">
                  Ajouté le {new Date(member.addedAt).toLocaleDateString("fr-FR")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(member.role)}`}
                >
                  {getRoleLabel(member.role)}
                </span>
                {canManage && member.role !== "owner" && (
                  <button
                    onClick={() => removeMember(member.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Retirer ce membre"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
