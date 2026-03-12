"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Message {
  id: string;
  content: string;
  fileUrl: string | null;
  fileName: string | null;
  createdAt: string;
  readAt: string | null;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface ChatProps {
  jobId: string;
  currentUserId: string;
  jobStatus: string;
}

const ACTIVE_STATUSES = ["MATCHING", "ASSIGNED", "IN_PROGRESS"];
const POLL_INTERVAL = 5000;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "application/pdf"];
const MAX_SIZE_MB = 15;

function isImage(fileUrl: string | null, fileName: string | null): boolean {
  if (!fileUrl) return false;
  const name = fileName ?? fileUrl;
  return /\.(jpg|jpeg|png|webp|gif|heic)$/i.test(name);
}

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
  );
}

export default function Chat({ jobId, currentUserId, jobStatus }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendError, setSendError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isActive = ACTIVE_STATUSES.includes(jobStatus);

  // ── Fetch messages ───────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/messages`);
      if (!res.ok) return;
      const json = await res.json();
      setMessages(json.data ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send text message ────────────────────────────────────────────────────
  const sendMessage = async (content: string, fileUrl?: string, fileName?: string) => {
    const res = await fetch(`/api/jobs/${jobId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        ...(fileUrl ? { fileUrl, fileName } : {}),
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Erreur d'envoi");
    }
    await fetchMessages();
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending || !isActive) return;
    setSending(true);
    setSendError(null);
    setInput("");
    try {
      await sendMessage(content);
    } catch (e) {
      setInput(content);
      setSendError(e instanceof Error ? e.message : "Erreur d'envoi");
    } finally {
      setSending(false);
    }
  };

  // ── File upload (3-step Supabase pattern) ────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!ALLOWED_TYPES.includes(file.type)) {
      setSendError("Format non supporté. Utilisez JPG, PNG, WebP, GIF ou PDF.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setSendError(`Fichier trop volumineux (max ${MAX_SIZE_MB} Mo).`);
      return;
    }

    setSending(true);
    setSendError(null);
    setUploadProgress("Préparation…");

    try {
      // Step 1: Get signed upload URL
      const urlRes = await fetch(
        `/api/jobs/${jobId}/messages/upload-url?type=${encodeURIComponent(file.type)}&name=${encodeURIComponent(file.name)}`
      );
      if (!urlRes.ok) throw new Error("Impossible de préparer l'upload");
      const { data } = await urlRes.json();
      const { signedUrl, publicUrl } = data;

      // Step 2: PUT directly to Supabase (bypass Vercel)
      setUploadProgress("Envoi du fichier…");
      const putRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("Échec de l'upload");

      // Step 3: Save message with file URL
      setUploadProgress("Enregistrement…");
      await sendMessage(input.trim(), publicUrl, file.name);
      setInput("");
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Erreur lors de l'envoi du fichier");
    } finally {
      setSending(false);
      setUploadProgress(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <img
            src={lightboxUrl}
            alt="Aperçu"
            style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 8, objectFit: "contain" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid #E6F2F2",
        background: "#F4F7F7", display: "flex", alignItems: "center", gap: 8,
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1CA7A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1F2937" }}>Messagerie</span>
        {!isActive && (
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#9CA3AF", background: "#F3F4F6", padding: "2px 8px", borderRadius: 99 }}>
            Mission terminée
          </span>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: 16,
        display: "flex", flexDirection: "column", gap: 12,
        minHeight: 200, maxHeight: 320,
      }}>
        {loading ? (
          <p style={{ color: "#9CA3AF", fontSize: 13, textAlign: "center", marginTop: 32 }}>Chargement…</p>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <p style={{ color: "#9CA3AF", fontSize: 13 }}>
              {isActive ? "Aucun message pour l'instant. Démarrez la conversation !" : "Aucun message échangé."}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender.id === currentUserId;
            const hasImage = isImage(msg.fileUrl, msg.fileName);
            const hasFile = msg.fileUrl && !hasImage;

            return (
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                <span style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 3, paddingLeft: isMine ? 0 : 4, paddingRight: isMine ? 4 : 0 }}>
                  {isMine ? "Vous" : `${msg.sender.firstName} ${msg.sender.lastName}`}
                </span>

                <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", gap: 4 }}>
                  {/* Image attachment */}
                  {hasImage && (
                    <img
                      src={msg.fileUrl!}
                      alt={msg.fileName ?? "photo"}
                      onClick={() => setLightboxUrl(msg.fileUrl!)}
                      style={{
                        maxWidth: 200, maxHeight: 200, borderRadius: 10,
                        objectFit: "cover", cursor: "zoom-in",
                        border: "1px solid #E6F2F2",
                      }}
                    />
                  )}

                  {/* PDF / file attachment */}
                  {hasFile && (
                    <a
                      href={msg.fileUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 12px", borderRadius: 10,
                        background: isMine ? "#178F8E" : "#F3F4F6",
                        color: isMine ? "#fff" : "#1F2937",
                        textDecoration: "none", fontSize: 13,
                        border: "1px solid " + (isMine ? "transparent" : "#E5E7EB"),
                      }}
                    >
                      <FileIcon />
                      <span style={{ wordBreak: "break-all" }}>{msg.fileName ?? "Fichier joint"}</span>
                    </a>
                  )}

                  {/* Text content */}
                  {msg.content && (
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: isMine ? "#1CA7A6" : "#F3F4F6",
                      color: isMine ? "#ffffff" : "#1F2937",
                      fontSize: 14, lineHeight: 1.5, wordBreak: "break-word",
                    }}>
                      {msg.content}
                    </div>
                  )}
                </div>

                <span style={{ fontSize: 10, color: "#9CA3AF", marginTop: 3, paddingLeft: isMine ? 0 : 4, paddingRight: isMine ? 4 : 0 }}>
                  {format(new Date(msg.createdAt), "HH:mm", { locale: fr })}
                  {isMine && msg.readAt && " · Lu ✓"}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error + progress */}
      {(sendError || uploadProgress) && (
        <div style={{
          padding: "6px 16px",
          background: sendError ? "#FEF2F2" : "#EFF9F9",
          borderTop: "1px solid " + (sendError ? "#FECACA" : "#D1E5E5"),
        }}>
          <p style={{ fontSize: 12, color: sendError ? "#DC2626" : "#0E7490" }}>
            {sendError ?? uploadProgress}
          </p>
        </div>
      )}

      {/* Input */}
      {isActive && (
        <div style={{ padding: "12px 16px", borderTop: "1px solid #E6F2F2", display: "flex", gap: 8, alignItems: "flex-end" }}>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {/* Paperclip button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            title="Joindre une photo ou un fichier"
            style={{
              flexShrink: 0, width: 38, height: 38,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid #D1E5E5", borderRadius: 10,
              background: "white", cursor: sending ? "not-allowed" : "pointer",
              color: "#1CA7A6", transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => { if (!sending) (e.currentTarget as HTMLButtonElement).style.borderColor = "#1CA7A6"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#D1E5E5"; }}
          >
            <PaperclipIcon />
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrire un message… (Entrée pour envoyer)"
            rows={1}
            disabled={sending}
            style={{
              flex: 1, resize: "none",
              border: "1px solid #D1E5E5", borderRadius: 10,
              padding: "10px 14px", fontSize: 14, color: "#1F2937",
              outline: "none", fontFamily: "inherit", lineHeight: 1.4,
              maxHeight: 100, overflow: "auto",
              opacity: sending ? 0.6 : 1,
            }}
            onFocus={(e) => (e.target.style.borderColor = "#1CA7A6")}
            onBlur={(e) => (e.target.style.borderColor = "#D1E5E5")}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            style={{
              flexShrink: 0,
              padding: "10px 18px",
              background: input.trim() && !sending ? "#1CA7A6" : "#D1E5E5",
              color: "#ffffff", border: "none", borderRadius: 10,
              cursor: input.trim() && !sending ? "pointer" : "not-allowed",
              fontSize: 14, fontWeight: 600, transition: "background 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {sending ? "…" : "Envoyer"}
          </button>
        </div>
      )}
    </div>
  );
}
