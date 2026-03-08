import { Metadata } from "next";
import CopyLinkButton from "@/components/ui/CopyLinkButton";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ArtisanPublicProfile {
  id: string;
  slug: string | null;
  companyName: string;
  city: string;
  description: string | null;
  photoUrl: string | null;
  ratingAverage: number;
  ratingCount: number;
  emergencyAvailable: boolean;
  insuranceVerified: boolean;
  completedJobs: number;
  memberSince: Date;
  services: {
    categoryId: string;
    categoryName: string;
    categoryIcon: string | null;
    categorySlug: string;
    basePrice: number;
    emergencyFee: number;
  }[];
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    clientFirstName: string;
    createdAt: Date;
  }[];
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getArtisan(slug: string): Promise<ArtisanPublicProfile | null> {
  const artisan = await prisma.artisanProfile.findUnique({
    where: { slug },
    include: {
      user: { select: { firstName: true, lastName: true, createdAt: true } },
      services: {
        where: { isActive: true },
        include: { category: { select: { id: true, name: true, icon: true, slug: true } } },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { client: { select: { firstName: true } } },
      },
    },
  });

  if (!artisan || !artisan.isApproved) return null;

  const completedJobs = await prisma.jobAssignment.count({
    where: { artisanId: artisan.id, job: { status: "COMPLETED" } },
  });

  return {
    id: artisan.id,
    slug: artisan.slug,
    companyName: artisan.companyName,
    city: artisan.city,
    description: artisan.description,
    photoUrl: artisan.photoUrl,
    ratingAverage: artisan.ratingAverage,
    ratingCount: artisan.ratingCount,
    emergencyAvailable: artisan.emergencyAvailable,
    insuranceVerified: artisan.insuranceVerified,
    completedJobs,
    memberSince: artisan.user.createdAt,
    services: artisan.services.map((s) => ({
      categoryId: s.category.id,
      categoryName: s.category.name,
      categoryIcon: s.category.icon,
      categorySlug: s.category.slug,
      basePrice: s.basePrice,
      emergencyFee: s.emergencyFee,
    })),
    reviews: artisan.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      clientFirstName: r.client.firstName,
      createdAt: r.createdAt,
    })),
  };
}

// ── SEO Metadata ──────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artisan = await getArtisan(slug);

  if (!artisan) {
    return { title: "Artisan introuvable | GoServi" };
  }

  const title = `${artisan.companyName} — ${artisan.city} | GoServi`;
  const description =
    artisan.description ??
    `${artisan.companyName} est un artisan professionnel basé à ${artisan.city}. ${artisan.ratingCount > 0 ? `Note : ${artisan.ratingAverage.toFixed(1)}/5 sur ${artisan.ratingCount} avis.` : ""} Trouvez et réservez rapidement sur GoServi.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: artisan.photoUrl ? [{ url: artisan.photoUrl, width: 400, height: 400 }] : [],
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `/artisans/${slug}`,
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "1px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            fontSize: `${size}px`,
            color: i <= Math.round(rating) ? "#F59E0B" : "#E5E7EB",
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ArtisanPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artisan = await getArtisan(slug);

  if (!artisan) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // JSON-LD structured data (LocalBusiness)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: artisan.companyName,
    description: artisan.description,
    image: artisan.photoUrl,
    address: { "@type": "PostalAddress", addressLocality: artisan.city, addressCountry: "CH" },
    aggregateRating:
      artisan.ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: artisan.ratingAverage.toFixed(1),
            reviewCount: artisan.ratingCount,
            bestRating: "5",
          }
        : undefined,
    url: `${appUrl}/artisans/${artisan.slug}`,
  };

  const memberYear = new Date(artisan.memberSince).getFullYear();

  // URL de contact pré-remplie : artisanId + nom + ville + 1ère catégorie → passe directement à l'étape 2
  const contactParams = new URLSearchParams({
    artisanId: artisan.id,
    artisanName: artisan.companyName,
    city: artisan.city,
  });
  if (artisan.services.length > 0) {
    contactParams.set("categoryId", artisan.services[0].categoryId);
  }
  const contactUrl = `/dashboard/new-job?${contactParams.toString()}`;

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ background: "#F4F7F7", minHeight: "100vh" }}>
        {/* Breadcrumb nav */}
        <div style={{ background: "#ffffff", borderBottom: "1px solid #E6F2F2" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "12px 24px" }}>
            <nav style={{ fontSize: "13px", color: "#6B7280" }}>
              <Link href="/" style={{ color: "#1CA7A6", textDecoration: "none" }}>GoServi</Link>
              {" / "}
              <Link href="/services" style={{ color: "#1CA7A6", textDecoration: "none" }}>Artisans</Link>
              {" / "}
              <span style={{ color: "#1F2937" }}>{artisan.companyName}</span>
            </nav>
          </div>
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "28px", alignItems: "start" }}>

            {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Profile card */}
              <div style={{ background: "#ffffff", borderRadius: "12px", padding: "28px", border: "1px solid #D1E5E5" }}>
                <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: "88px",
                      height: "88px",
                      borderRadius: "50%",
                      background: artisan.photoUrl ? "transparent" : "linear-gradient(135deg, #1CA7A6, #159895)",
                      overflow: "hidden",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "32px",
                    }}
                  >
                    {artisan.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={artisan.photoUrl} alt={artisan.companyName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      "🔨"
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700, color: "#1F2937" }}>
                      {artisan.companyName}
                    </h1>
                    <p style={{ margin: "0 0 8px", color: "#6B7280", fontSize: "14px" }}>
                      📍 {artisan.city} · Membre depuis {memberYear}
                    </p>

                    {/* Badges */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <span style={{ background: "#D1FAE5", color: "#065F46", padding: "3px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: 500 }}>
                        ✅ Profil vérifié
                      </span>
                      {artisan.insuranceVerified && (
                        <span style={{ background: "#EFF6FF", color: "#1E40AF", padding: "3px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: 500 }}>
                          🛡️ RC vérifiée
                        </span>
                      )}
                      {artisan.emergencyAvailable && (
                        <span style={{ background: "#FEF3C7", color: "#92400E", padding: "3px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: 500 }}>
                          ⚡ Disponible en urgence
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating + stats */}
                {artisan.ratingCount > 0 && (
                  <div style={{ marginTop: "20px", display: "flex", gap: "24px", paddingTop: "20px", borderTop: "1px solid #E6F2F2" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "24px", fontWeight: 700, color: "#1F2937" }}>
                        {artisan.ratingAverage.toFixed(1)}
                      </div>
                      <Stars rating={artisan.ratingAverage} />
                      <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
                        {artisan.ratingCount} avis
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "24px", fontWeight: 700, color: "#1F2937" }}>
                        {artisan.completedJobs}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
                        Missions terminées
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                {artisan.description && (
                  <p style={{ margin: "20px 0 0", color: "#4B5563", fontSize: "14px", lineHeight: "1.7", paddingTop: "20px", borderTop: "1px solid #E6F2F2" }}>
                    {artisan.description}
                  </p>
                )}
              </div>

              {/* Services */}
              {artisan.services.length > 0 && (
                <div style={{ background: "#ffffff", borderRadius: "12px", padding: "24px", border: "1px solid #D1E5E5" }}>
                  <h2 style={{ margin: "0 0 16px", fontSize: "17px", fontWeight: 700, color: "#1F2937" }}>
                    🛠️ Services proposés
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {artisan.services.map((s) => (
                      <div
                        key={s.categorySlug}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          background: "#F4F7F7",
                          borderRadius: "8px",
                        }}
                      >
                        <span style={{ fontSize: "14px", color: "#1F2937", fontWeight: 500 }}>
                          {s.categoryIcon && <span style={{ marginRight: "8px" }}>{s.categoryIcon}</span>}
                          {s.categoryName}
                        </span>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: "#1CA7A6" }}>
                            dès {s.basePrice.toFixed(0)} CHF
                          </div>
                          {s.emergencyFee > 0 && (
                            <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                              Urgence: +{s.emergencyFee.toFixed(0)} CHF
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {artisan.reviews.length > 0 && (
                <div style={{ background: "#ffffff", borderRadius: "12px", padding: "24px", border: "1px solid #D1E5E5" }}>
                  <h2 style={{ margin: "0 0 16px", fontSize: "17px", fontWeight: 700, color: "#1F2937" }}>
                    ⭐ Avis clients ({artisan.ratingCount})
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {artisan.reviews.map((r) => (
                      <div key={r.id} style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <Stars rating={r.rating} size={14} />
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#1F2937" }}>
                            {r.clientFirstName}
                          </span>
                          <span style={{ fontSize: "12px", color: "#9CA3AF", marginLeft: "auto" }}>
                            {new Date(r.createdAt).toLocaleDateString("fr-CH", { month: "short", year: "numeric" })}
                          </span>
                        </div>
                        {r.comment && (
                          <p style={{ margin: 0, fontSize: "13px", color: "#4B5563", lineHeight: "1.5" }}>
                            {r.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN — CTA ───────────────────────────────────────── */}
            <div style={{ position: "sticky", top: "24px" }}>
              <div style={{ background: "#ffffff", borderRadius: "12px", padding: "24px", border: "1px solid #D1E5E5", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 700, color: "#1F2937" }}>
                  Besoin d&apos;un artisan ?
                </h3>
                <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#6B7280", lineHeight: "1.5" }}>
                  Réservez {artisan.companyName} en quelques clics. Paiement sécurisé, satisfaction garantie.
                </p>

                <Link
                  href={contactUrl}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "14px",
                    background: "#1CA7A6",
                    color: "#ffffff",
                    textDecoration: "none",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "15px",
                    marginBottom: "12px",
                  }}
                >
                  Demander un devis gratuit
                </Link>

                {artisan.emergencyAvailable && (
                  <Link
                    href={`${contactUrl}&urgencyLevel=URGENT`}
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "12px",
                      background: "#FEF3C7",
                      color: "#92400E",
                      textDecoration: "none",
                      borderRadius: "10px",
                      fontWeight: 600,
                      fontSize: "14px",
                      marginBottom: "20px",
                    }}
                  >
                    ⚡ Mission urgente
                  </Link>
                )}

                {/* Trust signals */}
                <div style={{ borderTop: "1px solid #E6F2F2", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    "✅ Paiement 100% sécurisé",
                    "🔒 Données protégées",
                    "⭐ Artisan évalué par la communauté",
                    "🇨🇭 Plateforme suisse",
                  ].map((t) => (
                    <p key={t} style={{ margin: 0, fontSize: "12px", color: "#6B7280" }}>{t}</p>
                  ))}
                </div>
              </div>

              {/* Share */}
              <p style={{ margin: "12px 0 0", textAlign: "center", fontSize: "12px", color: "#9CA3AF" }}>
                Partager ce profil :{" "}
              <CopyLinkButton />
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
