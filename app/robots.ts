import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Tous les bots — accès aux pages publiques
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/admin/", "/pro/", "/api/", "/auth/"],
      },
      // Crawlers IA — autorisés explicitement sur tout le contenu public
      { userAgent: "GPTBot",           allow: "/" },
      { userAgent: "Google-Extended",  allow: "/" },
      { userAgent: "PerplexityBot",    allow: "/" },
      { userAgent: "ClaudeBot",        allow: "/" },
      { userAgent: "anthropic-ai",     allow: "/" },
      { userAgent: "CCBot",            allow: "/" },
      { userAgent: "Applebot-Extended",allow: "/" },
      { userAgent: "Amazonbot",        allow: "/" },
      { userAgent: "YouBot",           allow: "/" },
    ],
    sitemap: "https://goservi.ch/sitemap.xml",
  };
}
