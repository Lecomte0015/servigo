import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { BLOG_POSTS } from "@/lib/blog-posts";

const APP_URL = "https://goservi.ch";

const TRADE_SLUGS = [
  "plombier", "electricien", "serrurier", "chauffagiste",
  "couvreur", "menuisier", "peintre", "nettoyage",
];

const CITY_SLUGS = [
  "geneve", "lausanne", "fribourg", "neuchatel", "sion",
  "bienne", "yverdon", "montreux", "nyon", "morges",
  "la-chaux-de-fonds", "martigny",
];

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages statiques — jamais en erreur
  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL,                              lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${APP_URL}/services`,                lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${APP_URL}/artisans`,                lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${APP_URL}/trouver-artisan`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${APP_URL}/comment-ca-marche`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_URL}/devenir-artisan`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_URL}/a-propos`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${APP_URL}/contact`,                 lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${APP_URL}/mentions-legales`,        lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
    { url: `${APP_URL}/confidentialite`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
  ];

  // Pages SEO par métier
  const tradePages: MetadataRoute.Sitemap = TRADE_SLUGS.map((slug) => ({
    url: `${APP_URL}/devenir-artisan/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Pages SEO par ville
  const cityPages: MetadataRoute.Sitemap = CITY_SLUGS.map((slug) => ({
    url: `${APP_URL}/trouver-artisan/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // Pages blog
  const blogIndex: MetadataRoute.Sitemap = [
    { url: `${APP_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
  ];
  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${APP_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Profils artisans — protégé par try/catch pour ne jamais faire crasher le sitemap
  let artisanPages: MetadataRoute.Sitemap = [];
  try {
    const artisans = await prisma.artisanProfile.findMany({
      where: { isApproved: true, slug: { not: null } },
      select: { slug: true, createdAt: true },
    });
    artisanPages = artisans
      .filter((a) => a.slug)
      .map((a) => ({
        url: `${APP_URL}/artisans/${a.slug}`,
        lastModified: a.createdAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch {
    // Prisma indisponible — on continue sans les profils artisans
  }

  return [...staticPages, ...tradePages, ...cityPages, ...blogIndex, ...blogPages, ...artisanPages];
}
