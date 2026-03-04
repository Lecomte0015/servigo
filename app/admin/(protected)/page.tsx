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
        { label: "Clients inscrits", value: stats.totalUsers, icon: "👤", color: "text-blue-600" },
        { label: "Artisans actifs", value: stats.totalArtisans, icon: "🔧", color: "text-[#1CA7A6]" },
        { label: "En attente validation", value: stats.pendingArtisans, icon: "⏳", color: "text-amber-600" },
        { label: "Missions totales", value: stats.totalJobs, icon: "📋", color: "text-gray-700" },
        { label: "Missions terminées", value: stats.completedJobs, icon: "✅", color: "text-green-600" },
        {
          label: "Revenus plateforme",
          value: `${stats.platformRevenue.toFixed(0)} CHF`,
          icon: "💶",
          color: "text-[#1CA7A6]",
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1F2937]">Administration ServiGo</h1>
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
                  <span className="text-2xl">{kpi.icon}</span>
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
                    Commission plateforme (10%) :{" "}
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
