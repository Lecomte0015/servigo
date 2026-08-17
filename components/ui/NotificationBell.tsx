"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Notification {
  id: string;
  type: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

// Colored dot per notification category — replaces emoji
const TYPE_DOT: Record<string, string> = {
  JOB_MATCHED:             "bg-[#1CA7A6]",
  JOB_ASSIGNED:            "bg-[#1CA7A6]",
  JOB_STARTED:             "bg-blue-500",
  JOB_COMPLETED:           "bg-green-500",
  JOB_CANCELLED:           "bg-red-400",
  PROFILE_APPROVED:        "bg-green-500",
  PROFILE_REJECTED:        "bg-red-400",
  REVIEW_RECEIVED:         "bg-yellow-400",
  PAYMENT_CAPTURED:        "bg-green-500",
  PAYOUT_REQUESTED:        "bg-blue-500",
  PAYOUT_PROCESSING:       "bg-blue-400",
  PAYOUT_COMPLETED:        "bg-green-500",
  PAYOUT_FAILED:           "bg-red-400",
  INSURANCE_CERT_UPLOADED: "bg-gray-400",
  INSURANCE_VERIFIED:      "bg-green-500",
  INSURANCE_UNVERIFIED:    "bg-orange-400",
  MESSAGE_RECEIVED:        "bg-[#1CA7A6]",
  FILE_SHARED_IN_CHAT:     "bg-gray-400",
};

export function NotificationBell({ align = "right" }: { align?: "left" | "right" }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.data) setNotifications(json.data);
    } catch {}
  };

  const markRead = async (ids: string[]) => {
    if (!ids.length) return;
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
      );
    } catch {}
  };

  const markAllRead = () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    markRead(unreadIds);
  };

  // Poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click — check both button and portal dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedButton = buttonRef.current?.contains(target);
      const clickedDrop = dropRef.current?.contains(target);
      if (!clickedButton && !clickedDrop) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    const willOpen = !open;
    if (willOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropWidth = 320; // w-80 = 20rem = 320px
      setDropPos({
        top: rect.bottom + 8,
        left: align === "left"
          ? Math.max(4, rect.left)
          : Math.max(4, rect.right - dropWidth),
      });
    }
    setOpen(willOpen);
    if (willOpen && unreadCount > 0) {
      setTimeout(markAllRead, 1500);
    }
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) markRead([n.id]);
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  const dropdown = open ? (
    <div
      ref={dropRef}
      style={{
        position: "fixed",
        top: dropPos.top,
        left: dropPos.left,
        width: 320,
        zIndex: 9999,
      }}
      className="bg-white border border-[#D1E5E5] rounded-[12px] shadow-xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E6F2F2]">
        <p className="text-sm font-semibold text-[#1F2937]">Notifications</p>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs text-[#1CA7A6] hover:underline">
            Tout marquer lu
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-8 h-8 rounded-full bg-[#E6F2F2] flex items-center justify-center mx-auto mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1CA7A6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <p className="text-sm text-gray-400">Aucune notification</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={[
                "flex items-start gap-3 px-4 py-3 border-b border-[#F4F7F7] last:border-0 transition-colors select-none",
                !n.read ? "bg-[#F4FBFB]" : "",
                n.link ? "cursor-pointer hover:bg-[#EFF9F9] active:bg-[#E6F2F2]" : "",
              ].join(" ")}
            >
              <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${TYPE_DOT[n.type] ?? "bg-gray-300"}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[#1F2937] leading-snug">{n.message}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-400">
                    {format(new Date(n.createdAt), "d MMM à HH:mm", { locale: fr })}
                  </p>
                  {n.link && (
                    <span className="text-xs text-[#1CA7A6] font-medium">Voir →</span>
                  )}
                </div>
              </div>
              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-[#1CA7A6] shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
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

      {mounted && createPortal(dropdown, document.body)}
    </>
  );
}
