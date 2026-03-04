"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// ─── Types ─────────────────────────────────────────────────────────────────────

type AuditAction =
  | "ARTISAN_APPROVED"  | "ARTISAN_REJECTED"
  | "PAYOUT_PROCESSING" | "PAYOUT_COMPLETED" | "PAYOUT_FAILED"
  | "CATEGORY_CREATED"  | "CATEGORY_UPDATED" | "CATEGORY_DELETED"
  | "SETTINGS_UPDATED"  | "ADMIN_LOGIN";

interface AuditAdmin {
  firstName: string;
  lastName: string;
  email: string;
}

interface AuditLog {
  id: string;
  action: AuditAction;
  targetId:   string | null;
  targetType: string | null;
  details:    Record<string, unknown> | null;
  ip:         string | null;
  createdAt:  string;
  admin: AuditAdmin;
}

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const ACTION_META: Record<AuditAction, { label: string; variant: "success" | "danger" | "warning" | "info" | "neutral" }> = {
  ARTISAN_APPROVED:  { label: "Artisan approuvé",        variant: "success" },
  ARTISAN_REJECTED:  { label: "Artisan refusé",          variant: "danger"  },
  PAYOUT_PROCESSING: { label: "Retrait → Traitement",    variant: "info"    },
  PAYOUT_COMPLETED:  { label: "Retrait → Complété",      variant: "success" },
  PAYOUT_FAILED:     { label: "Retrait → Échoué",        variant: "danger"  },
  CATEGORY_CREATED:  { label: "Catégorie créée",         variant: "success" },
  CATEGORY_UPDATED:  { label: "Catégorie modifiée",      variant: "warning" },
  CATEGORY_DELETED:  { label: "Catégorie supprimée",     variant: "danger"  },
  SETTINGS_UPDATED:  { label: "Paramètres CMS modifiés", variant: "info"    },
  ADMIN_LOGIN:       { label: "Connexion admin",         variant: "neutral" },
};

const ALL_ACTIONS: AuditAction[] = [
  "ARTISAN_APPROVED", "ARTISAN_REJECTED",
  "PAYOUT_PROCESSING", "PAYOUT_COMPLETED", "PAYOUT_FAILED",
  "CATEGORY_CREATED", "CATEGORY_UPDATED", "CATEGORY_DELETED",
  "SETTINGS_UPDATED", "ADMIN_LOGIN",
];

function actionMeta(action: AuditAction) {
  return ACTION_META[action] ?? { label: action, variant: "neutral" as const };
}

function formatDetails(details: Record<string, unknown> | null): string {
  if (!details) return "—";
  return Object.entries(details)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
    .join(" · ");
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AdminAuditPage() {
  const [logs,    setLogs]    = useState<AuditLog[]>([]);
  const [admins,  setAdmins]  = useState<AdminUser[]>([]);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [filterAction,  setFilterAction]  = useState("");
  const [filterAdmin,   setFilterAdmin]   = useState("");
  const [filterFrom,    setFilterFrom]    = useState("");
  const [filterTo,      setFilterTo]      = useState("");

  // Ligne détail ouverte
  const [expanded, setExpanded] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchLogs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "30" });
      if (filterAction) params.set("action",  filterAction);
      if (filterAdmin)  params.set("adminId", filterAdmin);
      if (filterFrom)   params.set("from",    filterFrom);
      if (filterTo)     params.set("to",      filterTo);

      const res = await fetch(`/api/admin/audit?${params}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data.logs);
        setTotal(json.data.total);
        setPages(json.data.pages);
        setAdmins(json.data.admins);
        setPage(p);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterAction, filterAdmin, filterFrom, filterTo]);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const resetFilters = () => {
    setFilterAction("");
    setFilterAdmin("");
    setFilterFrom("");
    setFilterTo("");
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Journal d&apos;audit</h1>
        <p className="text-gray-500 mt-1">
          Historique des actions administrateurs — {total.toLocaleString("fr-CH")} entrée{total > 1 ? "s" : ""}
        </p>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Filtres</CardTitle>
        </CardHeader>
        <form onSubmit={handleFilter} className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Action */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Action</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1CA7A6]/30"
            >
              <option value="">Toutes les actions</option>
              {ALL_ACTIONS.map((a) => (
                <option key={a} value={a}>{actionMeta(a as AuditAction).label}</option>
              ))}
            </select>
          </div>

          {/* Admin */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Administrateur</label>
            <select
              value={filterAdmin}
              onChange={(e) => setFilterAdmin(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1CA7A6]/30"
            >
              <option value="">Tous les admins</option>
              {admins.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.firstName} {a.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Date de */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Du</label>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1CA7A6]/30"
            />
          </div>

          {/* Date au */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Au</label>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1CA7A6]/30"
            />
          </div>

          {/* Boutons */}
          <div className="sm:col-span-2 lg:col-span-4 flex gap-2 justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Réinitialiser
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-[#1CA7A6] text-white rounded-lg hover:bg-[#178F8E] transition-colors"
            >
              Filtrer
            </button>
          </div>
        </form>
      </Card>

      {/* Tableau */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <svg className="animate-spin h-6 w-6 mr-2 text-[#1CA7A6]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Chargement…
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-4xl mb-3">📋</span>
            <p>Aucune entrée trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Date / Heure</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Admin</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Action</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Cible</th>
                  <th className="px-4 py-3 font-medium text-gray-500">IP</th>
                  <th className="px-4 py-3 font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => {
                  const meta = actionMeta(log.action as AuditAction);
                  const isExpanded = expanded === log.id;
                  return (
                    <>
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setExpanded(isExpanded ? null : log.id)}
                      >
                        {/* Date */}
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600 font-mono text-xs">
                          <div>{format(new Date(log.createdAt), "dd MMM yyyy", { locale: fr })}</div>
                          <div className="text-gray-400">{format(new Date(log.createdAt), "HH:mm:ss")}</div>
                        </td>

                        {/* Admin */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">
                            {log.admin.firstName} {log.admin.lastName}
                          </div>
                          <div className="text-xs text-gray-400">{log.admin.email}</div>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3">
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        </td>

                        {/* Cible */}
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {log.targetType && (
                            <span className="font-medium text-gray-700">{log.targetType}</span>
                          )}
                          {log.targetId && (
                            <div className="font-mono text-gray-400 truncate max-w-[120px]">{log.targetId}</div>
                          )}
                          {!log.targetType && "—"}
                        </td>

                        {/* IP */}
                        <td className="px-4 py-3 font-mono text-xs text-gray-400">
                          {log.ip ?? "—"}
                        </td>

                        {/* Toggle */}
                        <td className="px-4 py-3 text-right">
                          <span className="text-gray-400 text-xs">
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </td>
                      </tr>

                      {/* Ligne détails (expandable) */}
                      {isExpanded && (
                        <tr key={`${log.id}-detail`} className="bg-gray-50">
                          <td colSpan={6} className="px-4 pb-4 pt-2">
                            <div className="bg-white border border-gray-100 rounded-lg p-3">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Détails
                              </p>
                              {log.details ? (
                                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                                  {Object.entries(log.details).map(([k, v]) => (
                                    <div key={k}>
                                      <dt className="text-xs text-gray-400">{k}</dt>
                                      <dd className="font-medium text-gray-800 truncate">
                                        {Array.isArray(v)
                                          ? v.join(", ")
                                          : v === null || v === undefined
                                            ? <span className="text-gray-300">null</span>
                                            : String(v)}
                                      </dd>
                                    </div>
                                  ))}
                                </dl>
                              ) : (
                                <p className="text-sm text-gray-400">Aucun détail disponible</p>
                              )}
                              {log.targetId && (
                                <p className="text-xs text-gray-400 mt-2">
                                  ID cible : <span className="font-mono">{log.targetId}</span>
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {page} / {pages} — {total} entrée{total > 1 ? "s" : ""}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchLogs(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                ← Précédent
              </button>
              <button
                onClick={() => fetchLogs(page + 1)}
                disabled={page >= pages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
