import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const APP_URL = "https://goservi.ch";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all approved artisan profiles for dynamic URLs
  const artisans = await prisma.artisanProfile.findMany({
    where: { isApproved: true },
    select: { slug: true, createdAt: true },
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${APP_URL}/services`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/artisans`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/comment-ca-marche`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/devenir-artisan`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/a-propos`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${APP_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${APP_URL}/mentions-legales`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${APP_URL}/confidentialite`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const artisanPages: MetadataRoute.Sitemap = artisans
    .filter((a) => a.slug)
    .map((a) => ({
      url: `${APP_URL}/artisans/${a.slug}`,
      lastModified: a.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  // Pages SEO par métier
  const TRADE_SLUGS = ["plombier", "electricien", "serrurier", "chauffagiste", "couvreur", "menuisier", "peintre", "nettoyage"];
  const tradePages: MetadataRoute.Sitemap = TRADE_SLUGS.map((slug) => ({
    url: `${APP_URL}/devenir-artisan/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Pages SEO par ville
  const CITY_SLUGS = ["geneve", "lausanne", "fribourg", "neuchatel", "sion", "bienne", "yverdon", "montreux", "nyon", "morges", "la-chaux-de-fonds", "martigny"];
  const cityPages: MetadataRoute.Sitemap = CITY_SLUGS.map((slug) => ({
    url: `${APP_URL}/trouver-artisan/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...staticPages, ...tradePages, ...cityPages, ...artisanPages];
}
