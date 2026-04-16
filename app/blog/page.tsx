import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog GoServi — Conseils artisans, tarifs, urgences en Suisse romande",
  description:
    "Guides pratiques, grilles tarifaires et conseils pour trouver un artisan de confiance en Suisse romande. Plomberie, électricité, serrurerie et plus.",
  alternates: { canonical: "https://goservi.ch/blog" },
};

const CATEGORY_COLORS: Record<string, string> = {
  conseils: "bg-blue-50 text-blue-700 border-blue-200",
  tarifs: "bg-green-50 text-green-700 border-green-200",
  metiers: "bg-purple-50 text-purple-700 border-purple-200",
  securite: "bg-orange-50 text-orange-700 border-orange-200",
};

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1CA7A6] to-[#178F8E] text-white pt-14 pb-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-3">
            Conseils &amp; Guides
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Le blog GoServi
          </h1>
          <p className="text-white/80 text-lg">
            Guides pratiques, tarifs et conseils pour vos travaux en Suisse romande.
          </p>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 py-14">

        {/* Article à la une */}
        <div className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1CA7A6] mb-4">
            À la une
          </p>
          <Link
            href={`/blog/${featured.slug}`}
            className="group flex flex-col md:flex-row gap-0 bg-[#F4F7F7] border border-[#D1E5E5] rounded-[16px] overflow-hidden hover:border-[#1CA7A6] hover:shadow-md transition-all"
          >
            {/* Image placeholder */}
            <div className="md:w-2/5 h-48 md:h-auto bg-gradient-to-br from-[#1CA7A6] to-[#178F8E] flex items-center justify-center shrink-0">
              <span className="text-6xl">🚿</span>
            </div>
            {/* Content */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[featured.category]}`}>
                  {featured.categoryLabel}
                </span>
                <span className="text-xs text-gray-400">{featured.readTime} min de lecture</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1F2937] group-hover:text-[#1CA7A6] transition-colors mb-3 leading-snug">
                {featured.title}
              </h2>
              <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                {featured.description}
              </p>
              <span className="text-sm font-semibold text-[#1CA7A6] group-hover:text-[#178F8E] transition-colors">
                Lire l&apos;article →
              </span>
            </div>
          </Link>
        </div>

        {/* Grille des articles */}
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937] mb-8">Tous les articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-white border border-[#D1E5E5] rounded-[14px] overflow-hidden hover:border-[#1CA7A6] hover:shadow-md transition-all"
              >
                {/* Color band */}
                <div className="h-32 bg-gradient-to-br from-[#E6F2F2] to-[#D1E5E5] flex items-center justify-center">
                  <span className="text-5xl">
                    {post.category === "tarifs" ? "💰" : post.category === "metiers" ? "🔧" : post.category === "securite" ? "🔒" : "💡"}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[post.category]}`}>
                      {post.categoryLabel}
                    </span>
                    <span className="text-xs text-gray-400">{post.readTime} min</span>
                  </div>
                  <h3 className="font-bold text-[#1F2937] group-hover:text-[#1CA7A6] transition-colors text-sm leading-snug mb-2 flex-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4">
                    {post.description}
                  </p>
                  <span className="text-xs font-semibold text-[#1CA7A6]">Lire →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA bas de page */}
        <div className="mt-16 bg-gradient-to-br from-[#1CA7A6] to-[#178F8E] rounded-[16px] p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Besoin d&apos;un artisan maintenant ?</h2>
          <p className="text-white/80 mb-6">
            Des professionnels vérifiés disponibles 24h/24 dans toute la Suisse romande.
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-white text-[#1CA7A6] font-semibold px-6 py-3 rounded-[10px] hover:bg-[#F4F7F7] transition-colors shadow-sm"
          >
            Faire une demande gratuitement →
          </Link>
        </div>
      </div>
    </div>
  );
}
