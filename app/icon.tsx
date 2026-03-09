import { ImageResponse } from "next/og";

// Taille favicon standard (navigateurs desktop)
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Favicon GoServi — généré dynamiquement par Next.js (app/icon.tsx)
 * Rendu : carré arrondi teal #1CA7A6 avec éclair ⚡ blanc centré
 * Accessible via /icon (référencé automatiquement dans <head>)
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "linear-gradient(135deg, #1CA7A6 0%, #159895 100%)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.2)",
        }}
      >
        {/* Lettre G stylisée */}
        <span
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: 800,
            fontFamily: "sans-serif",
            lineHeight: 1,
            letterSpacing: "-1px",
            marginTop: 1,
          }}
        >
          G
        </span>
      </div>
    ),
    { ...size }
  );
}
