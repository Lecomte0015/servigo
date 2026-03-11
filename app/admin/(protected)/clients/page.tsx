"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isBlocked: boolean;
  createdAt: string;
  _count: { jobRequests: number };
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchClients = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    fetch(`/api/admin/clients?${params}`)
      .then((r) => r.json())
      .then((j) => { setClients(j.data?.clients ?? []); setTotal(j.data?.total ?? 0); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { fetchClients(); }, [search, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1F2937]">Clients</h1>
        <p className="text-sm text-gray-500 mt-0.5">{total} client{total > 1 ? "s" : ""} inscrits</p>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Rechercher par nom ou email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card padding="none">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
          </div>
        ) : !clients.length ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">Aucun client trouvé</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-3 px-4 py-2.5 border-b border-[#E6F2F2] bg-[#F4F7F7]">
              <span className="text-xs text-gray-400 font-medium">Client</span>
              <span className="text-xs text-gray-400 font-medium">Email</span>
              <span className="text-xs text-gray-400 font-medium">Missions</span>
              <span className="text-xs text-gray-400 font-medium">Inscrit</span>
            </div>
            <div className="divide-y divide-[#E6F2F2]">
              {clients.map((client) => (
                <Link
                  key={client.id}
                  href={`/admin/clients/${client.id}`}
                  className="grid grid-cols-[1fr_1fr_auto_auto] gap-3 items-center px-4 py-3 hover:bg-[#F4F7F7] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#E6F2F2] flex items-center justify-center text-[#1CA7A6] text-xs font-bold shrink-0">
                      {client.firstName[0]}{client.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-medium text-[#1F2937] truncate">
                          {client.firstName} {client.lastName}
                        </p>
                        {client.isBlocked && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                            Suspendu
                          </span>
                        )}
                      </div>
                      {client.phone && (
                        <p className="text-xs text-gray-400 truncate">{client.phone}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{client.email}</p>
                  <span className="text-sm font-semibold text-[#1CA7A6] text-center">
                    {client._count.jobRequests}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#E6F2F2]">
                <span className="text-xs text-gray-500">Page {page} / {totalPages} · {total} clients</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs border border-[#D1E5E5] rounded-[6px] disabled:opacity-40 hover:border-[#1CA7A6] transition-colors"
                  >← Précédent</button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs border border-[#D1E5E5] rounded-[6px] disabled:opacity-40 hover:border-[#1CA7A6] transition-colors"
                  >Suivant →</button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
