"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/Badge";
import { getCategoryIcon } from "@/components/ui/CategoryIcon";

interface LastMessage {
  content: string;
  fileUrl: string | null;
  createdAt: string;
  sender: { firstName: string; lastName: string; role: string };
}

interface Conversation {
  id: string;
  status: string;
  city: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  client: { id: string; firstName: string; lastName: string; email: string };
  targetArtisan: { companyName: string } | null;
  assignment: { artisan: { companyName: string } } | null;
  category: { name: string; slug: string };
  _count: { messages: number };
  messages: LastMessage[];
  flaggedCount: number;
  fileCount: number;
}

const STATUS_LABELS: Record<string, string> = {
  MATCHING: "En recherche",
  ASSIGNED: "Assignée",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

const STATUS_VARIANTS: Record<string, "warning" | "info" | "success" | "neutral"> = {
  MATCHING: "warning",
  ASSIGNED: "info",
  IN_PROGRESS: "success",
  COMPLETED: "neutral",
  CANCELLED: "neutral",
};

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filter, setFilter] = useState<"all" | "flagged" | "MATCHING" | "ASSIGNED" | "IN_PROGRESS">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter === "flagged") params.set("flagged", "true");
    else if (filter !== "all") params.set("status", filter);

    fetch(`/api/admin/messages?${params}`)
      .then((r) => r.json())
      .then((j) => setConversations(j.data ?? []))
      .finally(() => setLoading(false));
  }, [filter]);

  const artisanName = (conv: Conversation) =>
    conv.assignment?.artisan.companyName ??
    conv.targetArtisan?.companyName ??
    "Artisan non assigné";

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1F2937]">Messages</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Modération des échanges client ↔ artisan
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-[#E6F2F2] p-1 rounded-[8px] w-fit flex-wrap">
        {(["all", "flagged", "MATCHING", "ASSIGNED", "IN_PROGRESS"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-[6px] font-medium transition-colors ${
              filter === f
                ? "bg-white text-[#1CA7A6] shadow-sm"
                : "text-gray-500 hover:text-[#1F2937]"
            }`}
          >
            {f === "all" ? "Toutes"
              : f === "flagged" ? "🚩 Signalements"
              : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#1CA7A6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Aucune conversation trouvée.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {conversations.map((conv) => {
            const lastMsg = conv.messages[0] ?? null;
            const preview = lastMsg
              ? lastMsg.fileUrl
                ? `📎 ${lastMsg.sender.firstName} a partagé un fichier`
                : lastMsg.content.slice(0, 80) || "…"
              : "Aucun message";

            return (
              <Link
                key={conv.id}
                href={`/admin/messages/${conv.id}`}
                className="block bg-white rounded-xl border border-[#D1E5E5] p-4 hover:border-[#1CA7A6] hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: category icon + info */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="shrink-0 w-9 h-9 bg-[#E6F2F2] rounded-lg flex items-center justify-center text-[#1CA7A6]">
                      {getCategoryIcon(conv.category.slug, 18)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[#1F2937]">
                          {conv.category.name}
                        </span>
                        <Badge variant={STATUS_VARIANTS[conv.status] ?? "neutral"}>
                          {STATUS_LABELS[conv.status] ?? conv.status}
                        </Badge>
                        {conv.flaggedCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full border border-orange-200">
                            🚩 {conv.flaggedCount}
                          </span>
                        )}
                        {conv.fileCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-200">
                            📎 {conv.fileCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {conv.city} ·{" "}
                        <span className="text-[#1F2937]">
                          {conv.client.firstName} {conv.client.lastName}
                        </span>{" "}
                        ↔{" "}
                        <span className="text-[#1F2937]">{artisanName(conv)}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1.5 truncate">{preview}</p>
                    </div>
                  </div>

                  {/* Right: stats + date */}
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-[#1CA7A6]">
                      {conv._count.messages} msg
                    </p>
                    {lastMsg && (
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(lastMsg.createdAt), "dd MMM, HH:mm", { locale: fr })}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
