"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function NotificationBell({ align = "right" }: { align?: "left" | "right" }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.data) setNotifications(json.data);
    } catch {}
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (!unreadIds.length) return;
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: unreadIds }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  // Poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) {
      setTimeout(markAllRead, 1500);
    }
  };

  const typeIcon: Record<string, string> = {
    JOB_MATCHED: "🔔",
    JOB_ASSIGNED: "✅",
    JOB_STARTED: "🔧",
    JOB_COMPLETED: "🎉",
    JOB_CANCELLED: "❌",
    PROFILE_APPROVED: "✅",
    PROFILE_REJECTED: "⚠️",
    NEW_REVIEW: "⭐",
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-[8px] hover:bg-[#F4F7F7] transition-colors text-gray-500"
        aria-label="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#1CA7A6] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute ${align === "left" ? "left-0" : "right-0"} top-11 w-80 bg-white border border-[#D1E5E5] rounded-[12px] shadow-xl z-50 overflow-hidden`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E6F2F2]">
            <p className="text-sm font-semibold text-[#1F2937]">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[#1CA7A6] hover:underline"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-2xl mb-1">🔔</p>
                <p className="text-sm text-gray-400">Aucune notification</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-[#F4F7F7] last:border-0 transition-colors ${
                    !n.read ? "bg-[#F4FBFB]" : ""
                  }`}
                >
                  <span className="text-lg leading-none mt-0.5 shrink-0">
                    {typeIcon[n.type] ?? "📌"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#1F2937] leading-snug">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(new Date(n.createdAt), "d MMM à HH:mm", { locale: fr })}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[#1CA7A6] shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
