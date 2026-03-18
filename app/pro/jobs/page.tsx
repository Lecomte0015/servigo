"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { JobStatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Chat from "@/components/ui/Chat";
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
  category: { name: string; icon: string | null };
  client: { firstName: string; lastName: string; phone: string | null };
  payment?: { status: string } | null;
  assignment?: {
    finalPrice: number | null;
    startedAt: string | null;
    completedAt: string | null;
  } | null;
}

const STATUS_FILTERS = [
  { value: "", label: "Toutes" },
  { value: "MATCHING", label: "Disponibles" },
  { value: "ASSIGNED", label: "À démarrer" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "COMPLETED", label: "Terminées" },
];

export default function ProJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [actioning, setActioning] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [hasServices, setHasServices] = useState<boolean | null>(null);
  const [hasCity, setHasCity] = useState<boolean | null>(null);
  const limit = 10;

  useEffect(() => {
    fetch("/api/artisan/profile")
      .then((r) => r.json())
      .then((j) => {
        const profile = j.data;
        setHasServices(profile?.services?.some((s: { isActive: boolean }) => s.isActive) ?? false);
        setHasCity(!!profile?.city);
      })
      .catch(() => {});
  }, []);

  const fetchJobs = () => {
    setLoading(true);
    const params = new URLSearchParams({
      limit: String(limit),
      page: String(page),
    });
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/jobs?${params}`)
      .then((r) => r.json())
      .then((j) => {
        setJobs(j.data?.jobs ?? []);
        setTotal(j.data?.total ?? 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, page]);

  const handleAction = async (jobId: string, action: "accept" | "start" | "complete") => {
    setActioning(jobId);
    try {
      const endpoint =
        action === "accept"
          ? `/api/jobs/${jobId}/accept`
          : action === "start"
          ? `/api/jobs/${jobId}/start`
          : `/api/jobs/${jobId}/complete`;

      await fetch(endpoint, { method: "POST" });
      fetchJobs();
    } finally {
      setActioning(null);
    }
  };

  const isPending = !user?.isApproved;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#1F2937]">Mes missions</h1>
        <p className="text-sm text-gray-500 mt-0.5">{total} mission{total !== 1 ? "s" : ""} au total</p>
      </div>

      {isPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-[10px] px-4 py-3 flex items-center gap-3">
          <div className="shrink-0 text-amber-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">Profil en attente de validation</p>
            <p className="text-xs text-amber-600">Vous pourrez accepter des missions une fois validé.</p>
          </div>
        </div>
      )}

      {!isPending && hasServices === false && (
        <div className="bg-blue-50 border border-blue-200 rounded-[10px] px-4 py-3 flex items-start gap-3">
          <div className="shrink-0 text-blue-500 mt-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800">Aucun service configuré</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Vous devez ajouter vos spécialités dans votre profil pour voir les missions disponibles.
            </p>
            <a href="/pro/profile" className="inline-block mt-2 text-xs font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900">
              Configurer mon profil →
            </a>
          </div>
        </div>
      )}

      {!isPending && hasServices === true && hasCity === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-[10px] px-4 py-3 flex items-start gap-3">
          <div className="shrink-0 text-amber-500 mt-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">Ville non renseignée</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Ajoutez votre ville dans votre profil pour voir les missions disponibles dans votre secteur.
            </p>
            <a href="/pro/profile" className="inline-block mt-2 text-xs font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900">
              Configurer mon profil →
            </a>
          </div>
        </div>
      )}

      {/* Filters */}
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

      {/* List + Detail */}
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 min-w-0">
          <Card padding="none">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
              </div>
            ) : !jobs.length ? (
              <div className="text-center py-12 px-4">
                <p className="text-gray-500 text-sm">Aucune mission trouvée</p>
                {!statusFilter && hasServices && hasCity && (
                  <p className="text-gray-400 text-xs mt-1">
                    Les nouvelles demandes dans votre ville et votre spécialité apparaîtront ici.
                  </p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[#E6F2F2]">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className={`p-4 cursor-pointer hover:bg-[#F4F7F7] transition-colors ${
                      selectedJob?.id === job.id ? "bg-[#E6F2F2]" : ""
                    }`}
                    onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-[#1F2937]">
                            {job.category.name}
                          </span>
                          {job.urgencyLevel === "URGENT" && (
                            <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-md font-medium">
                              Urgent
                            </span>
                          )}
                          <JobStatusBadge status={job.status} />
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1">{job.description}</p>
                        <p className="text-xs text-gray-400">
                          {job.city} · {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: fr })}
                        </p>
                        {job.estimatedPrice && (
                          <p className="text-sm font-semibold text-[#1CA7A6]">
                            ~{job.estimatedPrice.toFixed(0)} CHF
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {(job.status === "MATCHING" || job.status === "PENDING") && !isPending && (
                          <Button
                            size="sm"
                            loading={actioning === job.id}
                            onClick={() => handleAction(job.id, "accept")}
                          >
                            Accepter
                          </Button>
                        )}
                        {job.status === "ASSIGNED" && job.payment?.status === "CAPTURED" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={actioning === job.id}
                            onClick={() => handleAction(job.id, "start")}
                          >
                            Démarrer
                          </Button>
                        )}
                        {job.status === "ASSIGNED" && job.payment?.status !== "CAPTURED" && (
                          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 whitespace-nowrap">
                            ⏳ Paiement en attente
                          </span>
                        )}
                        {job.status === "IN_PROGRESS" && (
                          <Button
                            size="sm"
                            variant="outline"
                            loading={actioning === job.id}
                            onClick={() => handleAction(job.id, "complete")}
                          >
                            Terminé
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#E6F2F2]">
                <span className="text-xs text-gray-500">
                  Page {page} / {totalPages}
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

        {/* Detail */}
        {selectedJob && (
          <div className="w-full lg:w-72 lg:shrink-0">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm">{selectedJob.category.name}</CardTitle>
                  <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                </div>
                <JobStatusBadge status={selectedJob.status} />
              </CardHeader>

              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Description</p>
                  <p className="text-[#1F2937]">{selectedJob.description}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Adresse</p>
                  <p className="text-[#1F2937]">{selectedJob.address}, {selectedJob.city}</p>
                </div>
                {selectedJob.estimatedPrice && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Prix estimé</p>
                    <p className="text-[#1CA7A6] font-semibold">{selectedJob.estimatedPrice.toFixed(0)} CHF</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Demandée le</p>
                  <p className="text-[#1F2937]">
                    {format(new Date(selectedJob.createdAt), "d MMM yyyy à HH:mm", { locale: fr })}
                  </p>
                </div>

                <div className="border-t border-[#E6F2F2] pt-3">
                  <p className="text-xs text-gray-400 mb-1.5">Client</p>
                  <div className="bg-[#F4F7F7] rounded-[8px] p-2.5">
                    <p className="font-semibold text-[#1F2937] text-xs">
                      {selectedJob.client.firstName} {selectedJob.client.lastName}
                    </p>
                    {selectedJob.client.phone && (
                      <a
                        href={`tel:${selectedJob.client.phone}`}
                        className="text-xs text-[#1CA7A6] hover:underline mt-0.5 block"
                      >
                        📞 {selectedJob.client.phone}
                      </a>
                    )}
                  </div>
                </div>

                {selectedJob.assignment?.completedAt && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Terminée le</p>
                    <p className="text-[#1F2937]">
                      {format(new Date(selectedJob.assignment.completedAt), "d MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                )}

                {selectedJob.assignment?.finalPrice && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Prix final</p>
                    <p className="text-[#1CA7A6] font-semibold">{selectedJob.assignment.finalPrice.toFixed(0)} CHF</p>
                  </div>
                )}

                {/* Messagerie in-app */}
                {user && ["ASSIGNED", "IN_PROGRESS", "MATCHING", "PENDING"].includes(selectedJob.status) && (
                  <div className="border-t border-[#E6F2F2] pt-3 -mx-4 -mb-4">
                    <div style={{ height: "360px", display: "flex", flexDirection: "column" }}>
                      <Chat
                        jobId={selectedJob.id}
                        currentUserId={user.id}
                        jobStatus={selectedJob.status}
                      />
                    </div>
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
