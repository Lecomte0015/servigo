"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { JobStatusBadge, Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Job {
  id: string;
  status: string;
  description: string;
  address: string;
  city: string;
  urgencyLevel: string;
  estimatedPrice: number | null;
  createdAt: string;
  updatedAt: string;
  category: { name: string };
  client: { firstName: string; lastName: string; email: string };
  assignment: {
    artisan: {
      companyName: string;
      user: { firstName: string; lastName: string };
    };
    finalPrice: number | null;
    startedAt: string | null;
    completedAt: string | null;
  } | null;
  payment: {
    amount: number;
    status: string;
    platformFee: number;
  } | null;
}

const STATUS_FILTERS = [
  { value: "", label: "Toutes" },
  { value: "PENDING", label: "En attente" },
  { value: "MATCHING", label: "En recherche" },
  { value: "ASSIGNED", label: "Assignées" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "COMPLETED", label: "Terminées" },
  { value: "CANCELLED", label: "Annulées" },
];

const PAYMENT_STATUS_MAP: Record<string, { label: string; variant: "success" | "warning" | "info" | "neutral" | "danger" }> = {
  CAPTURED: { label: "Encaissé", variant: "success" },
  AUTHORIZED: { label: "Autorisé", variant: "info" },
  PENDING: { label: "En attente", variant: "warning" },
  RELEASED: { label: "Libéré", variant: "success" },
  REFUNDED: { label: "Remboursé", variant: "neutral" },
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const limit = 15;

  const fetchJobs = () => {
    setLoading(true);
    const params = new URLSearchParams({
      limit: String(limit),
      page: String(page),
    });
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/admin/jobs?${params}`)
      .then((r) => r.json())
      .then((j) => {
        setJobs(j.data?.jobs ?? []);
        setTotal(j.data?.total ?? 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); }, [statusFilter]);
  useEffect(() => { fetchJobs(); }, [statusFilter, page]);

  const totalPages = Math.ceil(total / limit);

  // Compute summary from all loaded jobs
  const summaryMap = jobs.reduce(
    (acc, j) => {
      acc[j.status] = (acc[j.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1F2937]">Gestion des demandes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} demande{total !== 1 ? "s" : ""} au total</p>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex gap-2 flex-wrap">
        {[
          { status: "PENDING", label: "En attente", color: "bg-amber-50 text-amber-700 border-amber-200" },
          { status: "MATCHING", label: "Matching", color: "bg-blue-50 text-blue-700 border-blue-200" },
          { status: "IN_PROGRESS", label: "En cours", color: "bg-amber-50 text-amber-700 border-amber-200" },
          { status: "COMPLETED", label: "Terminées", color: "bg-green-50 text-green-700 border-green-200" },
          { status: "CANCELLED", label: "Annulées", color: "bg-red-50 text-red-700 border-red-200" },
        ].map((s) =>
          summaryMap[s.status] ? (
            <span
              key={s.status}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${s.color}`}
            >
              {s.label}
              <span className="font-bold">{summaryMap[s.status]}</span>
            </span>
          ) : null
        )}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === f.value
                ? "bg-[#1CA7A6] text-white border-[#1CA7A6]"
                : "bg-white text-gray-600 border-[#D1E5E5] hover:border-[#1CA7A6] hover:text-[#1CA7A6]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table + Detail */}
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 min-w-0 overflow-hidden">
          <Card padding="none">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
              </div>
            ) : !jobs.length ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-gray-400 text-sm">Aucune demande</p>
              </div>
            ) : (
              <div className="overflow-x-auto"><div className="min-w-[500px]">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-3 px-4 py-2 border-b border-[#E6F2F2] bg-[#F4F7F7]">
                  <span className="text-xs text-gray-400 font-medium">Demande</span>
                  <span className="text-xs text-gray-400 font-medium">Client</span>
                  <span className="text-xs text-gray-400 font-medium">Statut</span>
                  <span className="text-xs text-gray-400 font-medium">Prix</span>
                  <span className="text-xs text-gray-400 font-medium">Date</span>
                </div>
                <div className="divide-y divide-[#E6F2F2]">
                  {jobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                      className={`w-full grid grid-cols-[1fr_1fr_auto_auto_auto] gap-3 items-center px-4 py-3 hover:bg-[#F4F7F7] transition-colors text-left ${
                        selectedJob?.id === job.id ? "bg-[#E6F2F2]" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-[#1F2937] truncate">
                            {job.category.name}
                          </span>
                          {job.urgencyLevel === "URGENT" && (
                            <span className="text-xs text-red-500 shrink-0">⚡</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">📍 {job.city}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600 truncate">
                          {job.client.firstName} {job.client.lastName}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{job.client.email}</p>
                      </div>
                      <JobStatusBadge status={job.status} />
                      <span className="text-sm font-medium text-[#1CA7A6] shrink-0">
                        {job.estimatedPrice ? `${job.estimatedPrice.toFixed(0)} CHF` : "—"}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: fr })}
                      </span>
                    </button>
                  ))}
                </div>
              </div></div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#E6F2F2]">
                <span className="text-xs text-gray-500">
                  Page {page} / {totalPages} · {total} demandes
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                    ← Précédent
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    Suivant →
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Detail panel */}
        {selectedJob && (
          <div className="w-full lg:w-72 lg:shrink-0">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm">{selectedJob.category.name}</CardTitle>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <JobStatusBadge status={selectedJob.status} />
                  {selectedJob.urgencyLevel === "URGENT" && (
                    <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-md font-medium">
                      ⚡ Urgent
                    </span>
                  )}
                </div>
              </CardHeader>

              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">ID</p>
                  <p className="text-xs font-mono text-gray-500 break-all">{selectedJob.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Description</p>
                  <p className="text-[#1F2937]">{selectedJob.description}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Adresse</p>
                  <p className="text-[#1F2937]">{selectedJob.address}, {selectedJob.city}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Créée le</p>
                  <p className="text-[#1F2937]">
                    {format(new Date(selectedJob.createdAt), "d MMM yyyy à HH:mm", { locale: fr })}
                  </p>
                </div>

                {/* Client */}
                <div className="border-t border-[#E6F2F2] pt-3">
                  <p className="text-xs text-gray-400 mb-1.5">Client</p>
                  <div className="bg-[#F4F7F7] rounded-[8px] p-2.5">
                    <p className="font-medium text-[#1F2937] text-xs">
                      {selectedJob.client.firstName} {selectedJob.client.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{selectedJob.client.email}</p>
                  </div>
                </div>

                {/* Artisan */}
                {selectedJob.assignment && (
                  <div className="border-t border-[#E6F2F2] pt-3">
                    <p className="text-xs text-gray-400 mb-1.5">Artisan</p>
                    <div className="bg-[#F4F7F7] rounded-[8px] p-2.5">
                      <p className="font-medium text-[#1F2937] text-xs">
                        {selectedJob.assignment.artisan.companyName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {selectedJob.assignment.artisan.user.firstName}{" "}
                        {selectedJob.assignment.artisan.user.lastName}
                      </p>
                    </div>
                    {selectedJob.assignment.finalPrice && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400 mb-0.5">Prix final</p>
                        <p className="text-[#1CA7A6] font-semibold">
                          {selectedJob.assignment.finalPrice.toFixed(0)} CHF
                        </p>
                      </div>
                    )}
                    {selectedJob.assignment.completedAt && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400 mb-0.5">Terminée le</p>
                        <p className="text-xs text-[#1F2937]">
                          {format(new Date(selectedJob.assignment.completedAt), "d MMM yyyy", { locale: fr })}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment */}
                {selectedJob.payment && (
                  <div className="border-t border-[#E6F2F2] pt-3">
                    <p className="text-xs text-gray-400 mb-1.5">Paiement</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Montant</span>
                        <span className="text-xs font-medium text-[#1F2937]">
                          {selectedJob.payment.amount.toFixed(0)} CHF
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Commission</span>
                        <span className="text-xs font-medium text-[#1CA7A6]">
                          {selectedJob.payment.platformFee.toFixed(0)} CHF
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">Statut</span>
                        <Badge
                          variant={
                            PAYMENT_STATUS_MAP[selectedJob.payment.status]?.variant ?? "neutral"
                          }
                        >
                          {PAYMENT_STATUS_MAP[selectedJob.payment.status]?.label ??
                            selectedJob.payment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {selectedJob.estimatedPrice && !selectedJob.payment && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Prix estimé</p>
                    <p className="text-[#1CA7A6] font-semibold">
                      {selectedJob.estimatedPrice.toFixed(0)} CHF
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
