import { ImageResponse } from "next/og";

// Taille Apple Touch Icon recommandée
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple Touch Icon GoServi — utilisé quand l'utilisateur ajoute goservi.ch
 * à l'écran d'accueil de son iPhone/iPad.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "linear-gradient(135deg, #1CA7A6 0%, #159895 100%)",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 110,
            fontWeight: 800,
            fontFamily: "sans-serif",
            lineHeight: 1,
            letterSpacing: "-4px",
            marginTop: 6,
          }}
        >
          G
        </span>
      </div>
    ),
    { ...size }
  );
}
