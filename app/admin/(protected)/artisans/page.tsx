"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface Artisan {
  id: string;
  companyName: string;
  rcNumber: string;
  city: string;
  isApproved: boolean;
  ratingAverage: number;
  ratingCount: number;
  emergencyAvailable: boolean;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  services: Array<{ category: { name: string } }>;
}

export default function AdminArtisansPage() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  const fetchArtisans = () => {
    setLoading(true);
    const params =
      filter === "pending"
        ? "?approved=false"
        : filter === "approved"
        ? "?approved=true"
        : "";

    fetch(`/api/admin/artisans${params}`)
      .then((r) => r.json())
      .then((j) => setArtisans(j.data?.artisans ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchArtisans(); }, [filter]);

  const handleApprove = async (artisanId: string) => {
    setApproving(artisanId);
    try {
      await fetch(`/api/admin/artisans/${artisanId}/approve`, { method: "POST" });
      fetchArtisans();
    } finally {
      setApproving(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1F2937]">Artisans</h1>
        <p className="text-sm text-gray-500 mt-0.5">Validation et gestion des profils</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-[#E6F2F2] p-1 rounded-[8px] w-fit">
        {(["pending", "approved", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-[6px] font-medium transition-colors ${
              filter === f
                ? "bg-white text-[#1CA7A6] shadow-sm"
                : "text-gray-500 hover:text-[#1F2937]"
            }`}
          >
            {f === "pending" ? "En attente" : f === "approved" ? "Approuvés" : "Tous"}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {artisans.length} artisan{artisans.length > 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
          </div>
        ) : !artisans.length ? (
          <p className="text-center text-sm text-gray-400 py-8">Aucun artisan</p>
        ) : (
          <div className="flex flex-col divide-y divide-[#E6F2F2]">
            {artisans.map((artisan) => (
              <div key={artisan.id} className="py-4 flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/admin/artisans/${artisan.id}`}
                      className="text-sm font-semibold text-[#1F2937] hover:text-[#1CA7A6] transition-colors"
                    >
                      {artisan.companyName}
                    </Link>
                    <Badge variant={artisan.isApproved ? "success" : "warning"}>
                      {artisan.isApproved ? "Approuvé" : "En attente"}
                    </Badge>
                    {artisan.emergencyAvailable && (
                      <Badge variant="info">⚡ Urgences</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {artisan.user.firstName} {artisan.user.lastName} ·{" "}
                    {artisan.user.email}
                  </p>
                  <p className="text-xs text-gray-400">
                    📍 {artisan.city} · RC: {artisan.rcNumber}
                    {artisan.ratingCount > 0 &&
                      ` · ⭐ ${artisan.ratingAverage.toFixed(1)} (${artisan.ratingCount} avis)`}
                  </p>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {artisan.services.map((s) => (
                      <span
                        key={s.category.name}
                        className="text-xs bg-[#E6F2F2] text-[#178F8E] px-2 py-0.5 rounded-md"
                      >
                        {s.category.name}
                      </span>
                    ))}
                  </div>
                </div>

                {!artisan.isApproved && (
                  <Button
                    size="sm"
                    loading={approving === artisan.id}
                    onClick={() => handleApprove(artisan.id)}
                    className="shrink-0"
                  >
                    Valider
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
