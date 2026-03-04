"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useCallback } from "react";

export interface ArtisanForMap {
  id: string;
  companyName: string;
  city: string;
  description: string | null;
  ratingAverage: number;
  ratingCount: number;
  photoUrl: string | null;
  slug: string | null;
  latitude: number;
  longitude: number;
  emergencyAvailable: boolean;
  user: { firstName: string; lastName: string };
  services: Array<{
    basePrice: number;
    emergencyFee: number;
    category: { id: string; name: string; slug: string; icon: string | null };
  }>;
}

interface Props {
  artisans: ArtisanForMap[];
  selectedId: string | null;
  onSelect: (artisan: ArtisanForMap) => void;
  onContact: (artisan: ArtisanForMap) => void;
}

function makeIcon(L: typeof import("leaflet"), artisan: ArtisanForMap, isSelected: boolean) {
  const size = isSelected ? 52 : 42;
  const border = isSelected ? "3px solid #159895" : "2px solid white";
  const shadow = isSelected
    ? "0 4px 16px rgba(0,0,0,0.45)"
    : "0 2px 8px rgba(0,0,0,0.3)";

  const inner = artisan.photoUrl
    ? `<img src="${artisan.photoUrl}" style="width:100%;height:100%;object-fit:cover;display:block;" />`
    : `<div style="width:100%;height:100%;background:#1CA7A6;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:${isSelected ? 16 : 14}px;">${(artisan.user.firstName[0] ?? "").toUpperCase()}${(artisan.user.lastName[0] ?? "").toUpperCase()}</div>`;

  const badge = `<div style="position:absolute;bottom:-2px;right:-2px;background:${isSelected ? "#159895" : "#1CA7A6"};color:white;border-radius:8px;padding:1px 4px;font-size:9px;font-weight:700;line-height:1.4;white-space:nowrap;border:1.5px solid white;">⭐${artisan.ratingAverage.toFixed(1)}</div>`;

  return L.divIcon({
    className: "",
    html: `<div style="position:relative;border-radius:50%;width:${size}px;height:${size}px;overflow:hidden;border:${border};box-shadow:${shadow};cursor:pointer;">${inner}</div>${badge}`,
    iconSize: [size + 12, size + 12],
    iconAnchor: [(size + 12) / 2, (size + 12) / 2],
    popupAnchor: [0, -((size + 12) / 2) - 4],
  });
}

function makePopupHtml(artisan: ArtisanForMap): string {
  const minPrice =
    artisan.services.length > 0
      ? Math.min(...artisan.services.map((s) => s.basePrice))
      : null;

  const avatar = artisan.photoUrl
    ? `<img src="${artisan.photoUrl}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid #E6F2F2;shrink:0;" />`
    : `<div style="width:48px;height:48px;border-radius:50%;background:#1CA7A6;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:16px;shrink:0;">${(artisan.user.firstName[0] ?? "").toUpperCase()}${(artisan.user.lastName[0] ?? "").toUpperCase()}</div>`;

  return `
    <div style="min-width:220px;font-family:Inter,system-ui,sans-serif;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        ${avatar}
        <div style="flex:1;min-width:0;">
          <p style="font-weight:700;font-size:13px;margin:0 0 1px;color:#1F2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${artisan.companyName}</p>
          <p style="color:#6B7280;font-size:11px;margin:0;">📍 ${artisan.city}</p>
          <p style="font-size:11px;margin:2px 0 0;color:#374151;">⭐ ${artisan.ratingAverage.toFixed(1)} <span style="color:#9CA3AF">(${artisan.ratingCount} avis)</span></p>
        </div>
      </div>
      ${artisan.services.length > 0 ? `<p style="font-size:11px;color:#374151;margin:0 0 4px;padding-top:4px;border-top:1px solid #F3F4F6;">${artisan.services.map((s) => s.category.icon ? s.category.icon + " " + s.category.name : s.category.name).join(" · ")}</p>` : ""}
      ${minPrice ? `<p style="font-size:12px;color:#1CA7A6;font-weight:600;margin:0 0 4px;">Dès ${minPrice} CHF</p>` : ""}
      ${artisan.emergencyAvailable ? `<p style="font-size:11px;color:#EF4444;margin:0 0 8px;">⚡ Urgences disponibles</p>` : ""}
      <button id="contact-${artisan.id}" style="background:#1CA7A6;color:white;border:none;border-radius:6px;padding:7px 12px;font-size:12px;font-weight:600;cursor:pointer;width:100%;margin-top:4px;">
        Contacter ce pro
      </button>
    </div>
  `;
}

export default function ArtisanMap({ artisans, selectedId, onSelect, onContact }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Map<string, import("leaflet").Marker>>(new Map());
  const LRef = useRef<typeof import("leaflet") | null>(null);
  const mapReadyRef = useRef(false);

  // ── 1. Initialize map once ────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      LRef.current = L;

      const map = L.map(containerRef.current!, {
        center: [46.5197, 6.6323],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;
      mapReadyRef.current = true;

      window.dispatchEvent(new CustomEvent("artisanmap:ready"));
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.clear();
        mapReadyRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helper: add a single marker ───────────────────────────────────────────
  const addMarker = useCallback(
    (L: typeof import("leaflet"), map: import("leaflet").Map, artisan: ArtisanForMap) => {
      if (markersRef.current.has(artisan.id)) return;

      const marker = L.marker([artisan.latitude, artisan.longitude], {
        icon: makeIcon(L, artisan, artisan.id === selectedId),
      }).addTo(map);

      marker.bindPopup(makePopupHtml(artisan), { maxWidth: 260 });
      marker.on("mouseover", () => marker.openPopup());
      marker.on("click", () => onSelect(artisan));
      marker.on("popupopen", () => {
        setTimeout(() => {
          const btn = document.getElementById(`contact-${artisan.id}`);
          if (btn) btn.onclick = () => onContact(artisan);
        }, 50);
      });

      markersRef.current.set(artisan.id, marker);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedId]
  );

  // ── 2. Sync markers when artisans change ──────────────────────────────────
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    // Remove stale markers
    const newIds = new Set(artisans.map((a) => a.id));
    markersRef.current.forEach((marker, id) => {
      if (!newIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add new markers
    artisans.forEach((artisan) => addMarker(L, map, artisan));

    // Fit bounds
    if (artisans.length > 0) {
      try {
        const bounds = L.latLngBounds(
          artisans.map((a) => [a.latitude, a.longitude] as [number, number])
        );
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artisans]);

  // ── Listen for map:ready (Leaflet init may finish after artisans load) ────
  useEffect(() => {
    const handler = () => {
      const L = LRef.current;
      const map = mapRef.current;
      if (!L || !map || artisans.length === 0) return;

      artisans.forEach((artisan) => addMarker(L, map, artisan));

      if (artisans.length > 0) {
        try {
          const bounds = L.latLngBounds(
            artisans.map((a) => [a.latitude, a.longitude] as [number, number])
          );
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
        } catch { /* ignore */ }
      }
    };

    window.addEventListener("artisanmap:ready", handler);
    return () => window.removeEventListener("artisanmap:ready", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artisans, selectedId]);

  // ── 3. Update icons on selection change ───────────────────────────────────
  useEffect(() => {
    const L = LRef.current;
    if (!L) return;
    markersRef.current.forEach((marker, id) => {
      const artisan = artisans.find((a) => a.id === id);
      if (artisan) marker.setIcon(makeIcon(L, artisan, id === selectedId));
    });
  }, [selectedId, artisans]);

  // ── 4. Fly to selected artisan ────────────────────────────────────────────
  const flyToSelected = useCallback(() => {
    if (!mapRef.current || !selectedId) return;
    const artisan = artisans.find((a) => a.id === selectedId);
    if (artisan) {
      mapRef.current.flyTo([artisan.latitude, artisan.longitude], 14, { duration: 0.8 });
      setTimeout(() => {
        const marker = markersRef.current.get(selectedId);
        if (marker) marker.openPopup();
      }, 900);
    }
  }, [selectedId, artisans]);

  useEffect(() => { flyToSelected(); }, [flyToSelected]);

  return (
    <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
  );
}
