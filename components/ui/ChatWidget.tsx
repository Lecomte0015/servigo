"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Bonjour ! 👋 Je suis l'assistant GoServi. Je peux vous aider à trouver un artisan, comprendre comment fonctionne la plateforme, ou répondre à toutes vos questions. Comment puis-je vous aider ?",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Scroll au bas lors de nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input quand le chat s'ouvre
  useEffect(() => {
    if (open) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Limiter à 20 échanges (reset si dépassé)
    if (messages.length >= 40) {
      setMessages([WELCOME_MESSAGE]);
      return;
    }

    const userMessage: Message = { role: "user", content: text };
    const allMessages = [...messages, userMessage];

    setMessages(allMessages);
    setInput("");
    setLoading(true);

    // Placeholder de la réponse en cours
    const assistantPlaceholder: Message = { role: "assistant", content: "", streaming: true };
    setMessages([...allMessages, assistantPlaceholder]);

    try {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Erreur inconnue" }));
        setMessages([
          ...allMessages,
          { role: "assistant", content: err.error ?? "Une erreur s'est produite. Réessayez." },
        ]);
        return;
      }

      // Lire le stream
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });

        setMessages([
          ...allMessages,
          { role: "assistant", content: accumulated, streaming: true },
        ]);
      }

      // Message final (sans streaming indicator)
      setMessages([
        ...allMessages,
        { role: "assistant", content: accumulated || "Je n'ai pas pu générer de réponse." },
      ]);

      // Notification si chat fermé
      if (!open) setHasUnread(true);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setMessages([
        ...allMessages,
        { role: "assistant", content: "Erreur de connexion. Réessayez dans un instant." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setLoading(false);
  };

  return (
    <>
      {/* ── Bouton flottant ─────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[1500] flex items-center gap-2 px-4 py-3 rounded-full shadow-xl text-white font-semibold text-sm transition-all duration-200 ${
          open ? "scale-95 opacity-90" : "hover:scale-105"
        }`}
        style={{ backgroundColor: "#1CA7A6" }}
        aria-label="Ouvrir le chat GoServi"
      >
        {open ? (
          <span className="text-base">✕</span>
        ) : (
          <>
            <span className="text-xl">💬</span>
            <span className="hidden sm:inline">Besoin d&apos;aide ?</span>
            {hasUnread && (
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full absolute top-1 right-1" />
            )}
          </>
        )}
      </button>

      {/* ── Fenêtre de chat ─────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed bottom-[152px] md:bottom-[84px] right-4 md:right-6 z-[1500] w-[340px] max-w-[calc(100vw-2rem)] bg-white rounded-[20px] shadow-2xl flex flex-col overflow-hidden border border-[#D1E5E5]"
          style={{ height: "min(480px, calc(100vh - 11rem))" }}
        >
          {/* Header */}
          <div
            className="shrink-0 px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: "#1CA7A6" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">
                ⚡
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Assistant GoServi</p>
                <p className="text-white/70 text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  En ligne
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-white/60 hover:text-white text-[10px] font-medium transition-colors"
              title="Nouvelle conversation"
            >
              Réinitialiser
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5 bg-[#F9FBFB]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-[#1CA7A6] flex items-center justify-center text-white text-[10px] font-bold shrink-0 mr-1.5 mt-0.5">
                    ⚡
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-[14px] text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#1CA7A6] text-white rounded-br-[4px]"
                      : "bg-white text-gray-700 shadow-sm border border-[#E6F2F2] rounded-bl-[4px]"
                  }`}
                >
                  {msg.content}
                  {msg.streaming && (
                    <span className="inline-flex gap-0.5 ml-1 align-middle">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="w-1 h-1 bg-[#1CA7A6]/50 rounded-full animate-bounce"
                          style={{ animationDelay: `${d * 0.15}s` }}
                        />
                      ))}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Indicateur de chargement (avant première réponse) */}
            {loading && messages[messages.length - 1]?.content === "" && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-[#1CA7A6] flex items-center justify-center text-white text-[10px] font-bold shrink-0 mr-1.5 mt-0.5">
                  ⚡
                </div>
                <div className="bg-white shadow-sm border border-[#E6F2F2] rounded-[14px] rounded-bl-[4px] px-4 py-3">
                  <span className="inline-flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 bg-[#1CA7A6] rounded-full animate-bounce"
                        style={{ animationDelay: `${d * 0.2}s` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-[#E6F2F2] bg-white px-3 py-2.5 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question…"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none max-h-20 leading-relaxed"
              style={{ minHeight: "24px" }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
              style={{ backgroundColor: "#1CA7A6" }}
              aria-label="Envoyer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div className="shrink-0 px-3 py-1.5 bg-[#F4F7F7] border-t border-[#E6F2F2] text-center">
            <p className="text-[10px] text-gray-400">
              Propulsé par{" "}
              <span className="font-semibold text-gray-500">GoServi IA</span>
              {" · "}
              <a href="/contact" className="text-[#1CA7A6] hover:underline">
                Contacter le support
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
