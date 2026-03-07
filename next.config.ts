import type { NextConfig } from "next";

// ─── HTTP Security Headers ────────────────────────────────────────────────────
// Applied to every route (pages + API).
// HSTS is only set in production (HTTPS required).
const securityHeaders = [
  // Prevent embedding in iframes (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Legacy XSS filter (IE/Edge)
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Control referrer info sent on navigation
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable unused browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // DNS prefetch (performance + small privacy trade-off)
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Content Security Policy
  // 'unsafe-inline' needed for Next.js inline styles/scripts (Tailwind, RSC)
  // Stripe requires js.stripe.com in script-src and frame-src
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  // HSTS — only in production (localhost is not HTTPS)
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // turbopack.root is dev-only — omit in production to avoid Vercel path issues
  // ─── Prisma: prevent bundling native binaries in serverless functions ─────
  serverExternalPackages: ["@prisma/client", "prisma"],
  // ─── Augmente la limite du corps des Route Handlers (upload photo) ────────
  experimental: {
    serverBodySizeLimit: "8mb",
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
