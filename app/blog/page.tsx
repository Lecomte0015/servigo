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
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
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
                <div className="h-32 bg-gradient-to-br from-[#E6F2F2] to-[#D1E5E5] flex items-center justify-center text-[#1CA7A6]">
                  {post.category === "tarifs" ? (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  ) : post.category === "metiers" ? (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                  ) : post.category === "securite" ? (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  ) : (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                  )}
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
