"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

interface Stats {
  totalUsers: number;
  totalArtisans: number;
  pendingArtisans: number;
  totalJobs: number;
  completedJobs: number;
  totalRevenue: number;
  platformRevenue: number;
}

// ── Stat icons ────────────────────────────────────────────────────────────────
const IcoUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcoWrench = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);
const IcoClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IcoClipboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
  </svg>
);
const IcoCheckCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IcoTrendingUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((j) => setStats(j.data))
      .finally(() => setLoading(false));
  }, []);

  const kpis = stats
    ? [
        { label: "Clients inscrits", value: stats.totalUsers, icon: <IcoUsers />, bg: "bg-blue-50", color: "text-blue-600", iconColor: "text-blue-500" },
        { label: "Artisans actifs", value: stats.totalArtisans, icon: <IcoWrench />, bg: "bg-[#E6F2F2]", color: "text-[#1CA7A6]", iconColor: "text-[#1CA7A6]" },
        { label: "En attente validation", value: stats.pendingArtisans, icon: <IcoClock />, bg: "bg-amber-50", color: "text-amber-600", iconColor: "text-amber-500" },
        { label: "Missions totales", value: stats.totalJobs, icon: <IcoClipboard />, bg: "bg-gray-100", color: "text-gray-700", iconColor: "text-gray-500" },
        { label: "Missions terminées", value: stats.completedJobs, icon: <IcoCheckCircle />, bg: "bg-green-50", color: "text-green-600", iconColor: "text-green-500" },
        {
          label: "Revenus plateforme",
          value: `${stats.platformRevenue.toFixed(0)} CHF`,
          icon: <IcoTrendingUp />,
          bg: "bg-[#E6F2F2]",
          color: "text-[#1CA7A6]",
          iconColor: "text-[#1CA7A6]",
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1F2937]">Administration GoServi</h1>
        <p className="text-sm text-gray-500 mt-0.5">Vue d&apos;ensemble de la plateforme</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {kpis.map((kpi) => (
              <Card key={kpi.label} padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{kpi.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-[8px] ${kpi.bg} flex items-center justify-center ${kpi.iconColor} shrink-0`}>
                    {kpi.icon}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Taux de complétion</CardTitle>
              </CardHeader>
              {stats && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">Missions terminées</span>
                    <span className="font-semibold text-[#1CA7A6]">
                      {stats.totalJobs > 0
                        ? Math.round((stats.completedJobs / stats.totalJobs) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-[#E6F2F2] rounded-full h-2">
                    <div
                      className="bg-[#1CA7A6] h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          stats.totalJobs > 0
                            ? (stats.completedJobs / stats.totalJobs) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenu total</CardTitle>
              </CardHeader>
              {stats && (
                <div>
                  <p className="text-2xl font-bold text-[#1CA7A6]">
                    {stats.totalRevenue.toFixed(0)} CHF
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Commission plateforme (15%) :{" "}
                    <span className="font-medium text-[#1F2937]">
                      {stats.platformRevenue.toFixed(0)} CHF
                    </span>
                  </p>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
