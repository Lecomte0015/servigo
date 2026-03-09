import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/dashboard/",
        "/pro/",
        "/auth/",
      ],
    },
    sitemap: "https://goservi.ch/sitemap.xml",
  };
}
