"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface EarningsJob {
  jobId: string;
  category: string;
  client: string;
  completedAt: string | null;
  amount: number;
  platformFee: number;
  net: number;
  paymentStatus: string;
}

interface MonthlyData {
  month: string;
  gross: number;
  net: number;
  count: number;
}

interface EarningsData {
  summary: {
    totalGross: number;
    totalFees: number;
    totalNet: number;
    completedCount: number;
  };
  monthlyBreakdown: MonthlyData[];
  jobs: EarningsJob[];
}

const PAYMENT_STATUS_MAP: Record<string, { label: string; variant: "success" | "warning" | "info" | "neutral" }> = {
  CAPTURED: { label: "Encaissé", variant: "success" },
  AUTHORIZED: { label: "Autorisé", variant: "info" },
  PENDING: { label: "En attente", variant: "warning" },
  RELEASED: { label: "Libéré", variant: "success" },
  REFUNDED: { label: "Remboursé", variant: "neutral" },
};

function formatMonth(monthStr: string) {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return format(date, "MMMM yyyy", { locale: fr });
}

export default function ProEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/artisan/earnings")
      .then((r) => r.json())
      .then((j) => setData(j.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin w-6 h-6 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
      </div>
    );
  }

  const maxMonthly = data?.monthlyBreakdown.reduce((m, b) => Math.max(m, b.net), 1) ?? 1;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#1F2937]">Mes revenus</h1>
        <p className="text-sm text-gray-500 mt-0.5">Suivi de vos gains GoServi</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Revenus bruts",
            value: `${(data?.summary.totalGross ?? 0).toFixed(0)} CHF`,
            sub: "Total encaissé",
            color: "text-[#1CA7A6]",
            iconBg: "bg-[#E6F2F2]",
            iconColor: "text-[#1CA7A6]",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
            ),
          },
          {
            label: "Frais plateforme",
            value: `${(data?.summary.totalFees ?? 0).toFixed(0)} CHF`,
            sub: "15% GoServi",
            color: "text-red-500",
            iconBg: "bg-red-50",
            iconColor: "text-red-400",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
              </svg>
            ),
          },
          {
            label: "Revenus nets",
            value: `${(data?.summary.totalNet ?? 0).toFixed(0)} CHF`,
            sub: "Après frais",
            color: "text-green-600",
            iconBg: "bg-green-50",
            iconColor: "text-green-500",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            ),
          },
          {
            label: "Missions terminées",
            value: data?.summary.completedCount ?? 0,
            sub: "Au total",
            color: "text-[#1F2937]",
            iconBg: "bg-gray-100",
            iconColor: "text-gray-500",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            ),
          },
        ].map((kpi) => (
          <Card key={kpi.label} padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
              </div>
              <div className={`w-9 h-9 rounded-[8px] ${kpi.iconBg} ${kpi.iconColor} flex items-center justify-center shrink-0`}>
                {kpi.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Monthly bar chart */}
      {data?.monthlyBreakdown.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Revenus par mois (6 derniers)</CardTitle>
          </CardHeader>
          <div className="flex items-end gap-3 h-32">
            {data.monthlyBreakdown.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-[#1CA7A6]">{m.net.toFixed(0)}</span>
                <div
                  className="w-full bg-[#1CA7A6] rounded-t-[4px] min-h-[4px] transition-all"
                  style={{ height: `${(m.net / maxMonthly) * 96}px` }}
                />
                <span className="text-xs text-gray-400 text-center leading-tight">
                  {formatMonth(m.month).split(" ")[0].slice(0, 3)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-gray-400">
            <span>Missions : {data.monthlyBreakdown.reduce((s, m) => s + m.count, 0)}</span>
            <span>Brut total : {data.monthlyBreakdown.reduce((s, m) => s + m.gross, 0).toFixed(0)} CHF</span>
          </div>
        </Card>
      ) : null}

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Dernières transactions</CardTitle>
        </CardHeader>

        {!data?.jobs.length ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">
              Aucune transaction pour le moment.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Vos revenus apparaîtront ici après vos premières missions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E6F2F2]">
                  <th className="text-left text-xs text-gray-400 font-medium pb-2">Mission</th>
                  <th className="text-left text-xs text-gray-400 font-medium pb-2">Client</th>
                  <th className="text-left text-xs text-gray-400 font-medium pb-2">Date</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-2">Brut</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-2">Frais</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-2">Net</th>
                  <th className="text-center text-xs text-gray-400 font-medium pb-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.jobs.map((job) => {
                  const ps = PAYMENT_STATUS_MAP[job.paymentStatus] ?? { label: job.paymentStatus, variant: "neutral" as const };
                  return (
                    <tr key={job.jobId} className="border-b border-[#F4F7F7] hover:bg-[#F4F7F7] transition-colors">
                      <td className="py-2.5 text-[#1F2937] font-medium">{job.category}</td>
                      <td className="py-2.5 text-gray-500">{job.client}</td>
                      <td className="py-2.5 text-gray-400 text-xs">
                        {job.completedAt
                          ? format(new Date(job.completedAt), "d MMM yyyy", { locale: fr })
                          : "—"}
                      </td>
                      <td className="py-2.5 text-right text-gray-600">{job.amount.toFixed(0)} CHF</td>
                      <td className="py-2.5 text-right text-red-400 text-xs">-{job.platformFee.toFixed(0)}</td>
                      <td className="py-2.5 text-right font-semibold text-[#1CA7A6]">{job.net.toFixed(0)} CHF</td>
                      <td className="py-2.5 text-center">
                        <Badge variant={ps.variant}>{ps.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Fee info */}
      <Card padding="md">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-[#E6F2F2] flex items-center justify-center text-[#1CA7A6] shrink-0 mt-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-[#1F2937]">Frais de plateforme</p>
            <p className="text-xs text-gray-500 mt-0.5">
              GoServi prélève 15% de commission sur chaque mission pour vous mettre en relation avec des clients qualifiés.
              Le paiement est sécurisé via Stripe avec pré-autorisation et capture à la completion.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
