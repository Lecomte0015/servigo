"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Message {
  id: string;
  content: string;
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
  /** "MATCHING" | "ASSIGNED" | "IN_PROGRESS" | etc. */
  jobStatus: string;
}

const ACTIVE_STATUSES = ["MATCHING", "ASSIGNED", "IN_PROGRESS"];
const POLL_INTERVAL = 5000; // 5 secondes

export default function Chat({ jobId, currentUserId, jobStatus }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isActive = ACTIVE_STATUSES.includes(jobStatus);

  // ── Fetch messages ─────────────────────────────────────────────────────────
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

  // Initial load + polling
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending || !isActive) return;

    setSending(true);
    const optimisticMsg: Message = {
      id: `tmp-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      readAt: null,
      sender: {
        id: currentUserId,
        firstName: "Moi",
        lastName: "",
        role: "CLIENT",
      },
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInput("");

    try {
      const res = await fetch(`/api/jobs/${jobId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        // Refresh to get the real message with correct sender info
        await fetchMessages();
      } else {
        // Rollback optimistic update
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
        setInput(content);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #E6F2F2",
          background: "#F4F7F7",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "16px" }}>💬</span>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#1F2937" }}>
          Messagerie
        </span>
        {!isActive && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: "11px",
              color: "#9CA3AF",
              background: "#F3F4F6",
              padding: "2px 8px",
              borderRadius: "99px",
            }}
          >
            Mission terminée
          </span>
        )}
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          minHeight: "200px",
          maxHeight: "320px",
        }}
      >
        {loading ? (
          <p style={{ color: "#9CA3AF", fontSize: "13px", textAlign: "center", marginTop: "32px" }}>
            Chargement...
          </p>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <p style={{ fontSize: "24px", marginBottom: "8px" }}>💬</p>
            <p style={{ color: "#9CA3AF", fontSize: "13px" }}>
              {isActive
                ? "Aucun message pour l'instant. Démarrez la conversation !"
                : "Aucun message échangé pour cette mission."}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender.id === currentUserId;
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMine ? "flex-end" : "flex-start",
                }}
              >
                {/* Sender label */}
                <span
                  style={{
                    fontSize: "11px",
                    color: "#9CA3AF",
                    marginBottom: "3px",
                    paddingLeft: isMine ? "0" : "4px",
                    paddingRight: isMine ? "4px" : "0",
                  }}
                >
                  {isMine ? "Vous" : `${msg.sender.firstName} ${msg.sender.lastName}`}
                </span>

                {/* Bubble */}
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "10px 14px",
                    borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: isMine ? "#1CA7A6" : "#F3F4F6",
                    color: isMine ? "#ffffff" : "#1F2937",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </div>

                {/* Timestamp + read */}
                <span
                  style={{
                    fontSize: "10px",
                    color: "#9CA3AF",
                    marginTop: "3px",
                    paddingLeft: isMine ? "0" : "4px",
                    paddingRight: isMine ? "4px" : "0",
                  }}
                >
                  {format(new Date(msg.createdAt), "HH:mm", { locale: fr })}
                  {isMine && msg.readAt && " · Lu ✓"}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {isActive && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #E6F2F2",
            display: "flex",
            gap: "8px",
            alignItems: "flex-end",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrire un message… (Entrée pour envoyer)"
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              border: "1px solid #D1E5E5",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "14px",
              color: "#1F2937",
              outline: "none",
              fontFamily: "inherit",
              lineHeight: "1.4",
              maxHeight: "100px",
              overflow: "auto",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#1CA7A6")}
            onBlur={(e) => (e.target.style.borderColor = "#D1E5E5")}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            style={{
              padding: "10px 18px",
              background: input.trim() && !sending ? "#1CA7A6" : "#D1E5E5",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              cursor: input.trim() && !sending ? "pointer" : "not-allowed",
              fontSize: "14px",
              fontWeight: 600,
              transition: "background 0.15s",
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
