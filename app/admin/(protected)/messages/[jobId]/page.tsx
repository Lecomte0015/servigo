"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/Badge";

interface MsgSender {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface MessageDetail {
  id: string;
  content: string;
  fileUrl: string | null;
  fileName: string | null;
  readAt: string | null;
  flagged: boolean;
  flaggedAt: string | null;
  createdAt: string;
  sender: MsgSender;
}

interface JobDetail {
  id: string;
  status: string;
  city: string;
  address: string;
  description: string;
  createdAt: string;
  client: { id: string; firstName: string; lastName: string; email: string };
  targetArtisan: { companyName: string; userId: string } | null;
  assignment: { artisan: { companyName: string; userId: string } } | null;
  category: { name: string; slug: string };
  messages: MessageDetail[];
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

function isImage(fileUrl: string | null, fileName: string | null): boolean {
  if (!fileUrl) return false;
  const name = fileName ?? fileUrl;
  return /\.(jpg|jpeg|png|webp|gif|heic)$/i.test(name);
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
      <polyline points="13 2 13 9 20 9"/>
    </svg>
  );
}

export default function AdminMessageDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/messages/${jobId}`)
      .then((r) => r.json())
      .then((j) => setJob(j.data ?? null))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#1CA7A6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20 text-gray-400 text-sm">
        Mission introuvable.{" "}
        <Link href="/admin/messages" className="text-[#1CA7A6] underline">
          Retour
        </Link>
      </div>
    );
  }

  const artisanName =
    job.assignment?.artisan.companyName ?? job.targetArtisan?.companyName ?? "Artisan non assigné";
  const clientId = job.client.id;
  const artisanUserId =
    job.assignment?.artisan.userId ?? job.targetArtisan?.userId ?? null;

  const flaggedCount = job.messages.filter((m) => m.flagged).length;

  return (
    <div className="flex flex-col gap-5">

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center cursor-zoom-out"
        >
          <img
            src={lightboxUrl}
            alt="Aperçu"
            className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/messages"
          className="text-gray-400 hover:text-[#1CA7A6] transition-colors"
          title="Retour aux messages"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-[#1F2937]">
              {job.category.name} — {job.city}
            </h1>
            <Badge variant={STATUS_VARIANTS[job.status] ?? "neutral"}>
              {STATUS_LABELS[job.status] ?? job.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {job.messages.length} message{job.messages.length > 1 ? "s" : ""}
            {flaggedCount > 0 && (
              <span className="ml-2 text-orange-500 font-semibold">· 🚩 {flaggedCount} signalé{flaggedCount > 1 ? "s" : ""}</span>
            )}
          </p>
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white rounded-xl border border-[#D1E5E5] p-4 flex flex-wrap gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Client</p>
          <p className="font-semibold text-[#1F2937]">{job.client.firstName} {job.client.lastName}</p>
          <p className="text-gray-500 text-xs">{job.client.email}</p>
        </div>
        <div className="text-gray-300 self-center text-lg">↔</div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Artisan</p>
          <p className="font-semibold text-[#1F2937]">{artisanName}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Mission</p>
          <p className="text-xs text-gray-500 font-mono">{job.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-xs text-gray-400">{format(new Date(job.createdAt), "dd MMM yyyy", { locale: fr })}</p>
        </div>
      </div>

      {/* Messages timeline */}
      <div className="bg-white rounded-xl border border-[#D1E5E5] p-4 flex flex-col gap-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Conversation (lecture seule)
        </p>

        {job.messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Aucun message échangé.</p>
        ) : (
          job.messages.map((msg) => {
            const isClient = msg.sender.id === clientId;
            const isArtisan = artisanUserId ? msg.sender.id === artisanUserId : !isClient;
            const hasImage = isImage(msg.fileUrl, msg.fileName);
            const hasFile = msg.fileUrl && !hasImage;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isClient ? "items-start" : "items-end"}`}
                style={{ opacity: 1 }}
              >
                {/* Flagged banner */}
                {msg.flagged && (
                  <div className="flex items-center gap-1.5 mb-1 text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-2 py-1">
                    🚩 Signalé
                    {msg.flaggedAt && (
                      <span className="text-orange-400">
                        · {format(new Date(msg.flaggedAt), "dd/MM HH:mm", { locale: fr })}
                      </span>
                    )}
                  </div>
                )}

                <span className="text-xs text-gray-400 mb-1 px-1">
                  <span className="font-medium text-[#1F2937]">
                    {msg.sender.firstName} {msg.sender.lastName}
                  </span>
                  {" · "}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isClient
                      ? "bg-blue-50 text-blue-600"
                      : isArtisan
                      ? "bg-teal-50 text-teal-600"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {isClient ? "Client" : "Artisan"}
                  </span>
                </span>

                <div
                  className="max-w-[70%] flex flex-col gap-2"
                  style={{
                    borderRadius: 12,
                    ...(msg.flagged
                      ? { outline: "2px solid #FED7AA", background: "#FFF7ED" }
                      : {}),
                  }}
                >
                  {/* Image */}
                  {hasImage && (
                    <img
                      src={msg.fileUrl!}
                      alt={msg.fileName ?? "photo"}
                      onClick={() => setLightboxUrl(msg.fileUrl!)}
                      className="max-w-[200px] max-h-[200px] rounded-xl object-cover cursor-zoom-in border border-[#E6F2F2]"
                    />
                  )}

                  {/* File */}
                  {hasFile && (
                    <a
                      href={msg.fileUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm no-underline border"
                      style={{
                        background: isClient ? "#EFF9F9" : "#F3F4F6",
                        borderColor: isClient ? "#D1E5E5" : "#E5E7EB",
                        color: "#1F2937",
                      }}
                    >
                      <FileIcon />
                      <span className="break-all">{msg.fileName ?? "Fichier joint"}</span>
                    </a>
                  )}

                  {/* Text */}
                  {msg.content && (
                    <div
                      className="px-3 py-2 text-sm leading-relaxed break-words rounded-xl"
                      style={{
                        background: msg.flagged
                          ? "transparent"
                          : isClient
                          ? "#E6F2F2"
                          : "#F3F4F6",
                        color: "#1F2937",
                      }}
                    >
                      {msg.content}
                    </div>
                  )}
                </div>

                <span className="text-xs text-gray-400 mt-1 px-1">
                  {format(new Date(msg.createdAt), "dd MMM, HH:mm", { locale: fr })}
                  {msg.readAt && " · Lu ✓"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
