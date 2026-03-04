"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { JobStatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Job {
  id: string;
  status: string;
  description: string;
  city: string;
  urgencyLevel: string;
  estimatedPrice: number | null;
  createdAt: string;
  category: { name: string };
  client: { firstName: string; lastName: string; phone: string | null };
}

export default function ProDashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  const fetchJobs = () => {
    setLoading(true);
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((j) => setJobs(j.data?.jobs ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleAction = async (
    jobId: string,
    action: "accept" | "start" | "complete"
  ) => {
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

  const stats = {
    available: jobs.filter((j) => j.status === "MATCHING").length,
    active: jobs.filter((j) => ["ASSIGNED", "IN_PROGRESS"].includes(j.status)).length,
    completed: jobs.filter((j) => j.status === "COMPLETED").length,
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1F2937]">
          Espace Pro — {user?.firstName}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Gérez vos missions</p>
      </div>

      {/* Pending approval banner */}
      {isPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-[10px] px-4 py-3 flex items-center gap-3">
          <span className="text-xl">⏳</span>
          <div>
            <p className="text-sm font-medium text-amber-800">
              Profil en cours de validation
            </p>
            <p className="text-xs text-amber-600">
              Notre équipe vérifie vos informations. Vous recevrez une notification dès validation.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: "Disponibles", value: stats.available, color: "text-[#1CA7A6]" },
          { label: "En cours", value: stats.active, color: "text-amber-600" },
          { label: "Terminées", value: stats.completed, color: "text-green-600" },
        ].map((s) => (
          <Card key={s.label} padding="md">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Jobs list */}
      <Card>
        <CardHeader>
          <CardTitle>Missions disponibles & en cours</CardTitle>
        </CardHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
          </div>
        ) : !jobs.length ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Aucune mission disponible</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="border border-[#D1E5E5] rounded-[8px] p-4 flex items-start justify-between gap-4"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1F2937]">
                      {job.category.name}
                    </span>
                    {job.urgencyLevel === "URGENT" && (
                      <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-md font-medium">
                        ⚡ Urgent
                      </span>
                    )}
                    <JobStatusBadge status={job.status} />
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{job.description}</p>
                  <p className="text-xs text-gray-400">
                    📍 {job.city} ·{" "}
                    {formatDistanceToNow(new Date(job.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                  {job.estimatedPrice && (
                    <p className="text-sm font-semibold text-[#1CA7A6]">
                      ~{job.estimatedPrice.toFixed(0)} CHF
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {job.status === "MATCHING" && !isPending && (
                    <Button
                      size="sm"
                      loading={actioning === job.id}
                      onClick={() => handleAction(job.id, "accept")}
                    >
                      Accepter
                    </Button>
                  )}
                  {job.status === "ASSIGNED" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={actioning === job.id}
                      onClick={() => handleAction(job.id, "start")}
                    >
                      Démarrer
                    </Button>
                  )}
                  {job.status === "IN_PROGRESS" && (
                    <Button
                      size="sm"
                      variant="outline"
                      loading={actioning === job.id}
                      onClick={() => handleAction(job.id, "complete")}
                    >
                      Marquer terminé
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
