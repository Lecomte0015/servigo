"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
}

interface JobsData {
  jobs: Job[];
  total: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<JobsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs?limit=5")
      .then((r) => r.json())
      .then((j) => setData(j.data))
      .finally(() => setLoading(false));
  }, []);

  const stats = data
    ? {
        total: data.total,
        completed: data.jobs.filter((j) => j.status === "COMPLETED").length,
        active: data.jobs.filter((j) =>
          ["MATCHING", "ASSIGNED", "IN_PROGRESS"].includes(j.status)
        ).length,
      }
    : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-[#1F2937]">
            Bonjour, {user?.firstName} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gérez vos demandes d&apos;intervention
          </p>
        </div>
        <Link href="/dashboard/new-job" className="shrink-0">
          <Button size="sm">+ Nouvelle demande</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: "Total demandes", value: stats?.total ?? "—", color: "text-[#1CA7A6]" },
          { label: "En cours", value: stats?.active ?? "—", color: "text-amber-600" },
          { label: "Terminées", value: stats?.completed ?? "—", color: "text-green-600" },
        ].map((s) => (
          <Card key={s.label} padding="md">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Recent jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dernières demandes</CardTitle>
            <Link
              href="/dashboard/history"
              className="text-xs text-[#1CA7A6] hover:underline"
            >
              Voir tout
            </Link>
          </div>
        </CardHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
          </div>
        ) : !data?.jobs.length ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Aucune demande pour l&apos;instant</p>
            <Link href="/dashboard/new-job" className="mt-3 inline-block">
              <Button variant="outline" size="sm">
                Créer ma première demande
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#E6F2F2]">
            {data.jobs.map((job) => (
              <Link
                key={job.id}
                href={`/dashboard/history?job=${job.id}`}
                className="flex items-center justify-between py-3 hover:bg-[#F4F7F7] -mx-5 px-5 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-[#1F2937]">
                    {job.category.name}
                  </span>
                  <span className="text-xs text-gray-400 line-clamp-1">
                    {job.description}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
                  {job.estimatedPrice && (
                    <span className="text-sm font-medium text-[#1CA7A6]">
                      {job.estimatedPrice.toFixed(0)} CHF
                    </span>
                  )}
                  <JobStatusBadge status={job.status} />
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {formatDistanceToNow(new Date(job.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/dashboard/new-job">
            <div className="flex items-center gap-3 p-3 bg-[#E6F2F2] rounded-[8px] hover:bg-[#d0e8e8] transition-colors cursor-pointer">
              <span className="text-2xl">🔧</span>
              <div>
                <p className="text-sm font-medium text-[#178F8E]">Demande urgente</p>
                <p className="text-xs text-gray-500">Artisan en moins de 30 min</p>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/profile">
            <div className="flex items-center gap-3 p-3 bg-[#F4F7F7] rounded-[8px] hover:bg-[#e8edf0] transition-colors cursor-pointer border border-[#D1E5E5]">
              <span className="text-2xl">👤</span>
              <div>
                <p className="text-sm font-medium text-[#1F2937]">Mon profil</p>
                <p className="text-xs text-gray-500">Gérer mes informations</p>
              </div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
