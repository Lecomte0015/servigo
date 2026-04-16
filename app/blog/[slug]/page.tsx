import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { BLOG_POSTS, getBlogPost, getRelatedPosts } from "@/lib/blog-posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} — GoServi`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `https://goservi.ch/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      url: `https://goservi.ch/blog/${post.slug}`,
      siteName: "GoServi",
    },
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  conseils: "bg-blue-50 text-blue-700 border-blue-200",
  tarifs: "bg-green-50 text-green-700 border-green-200",
  metiers: "bg-purple-50 text-purple-700 border-purple-200",
  securite: "bg-orange-50 text-orange-700 border-orange-200",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.relatedSlugs);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      "@type": "Organization",
      name: "GoServi",
      url: "https://goservi.ch",
    },
    publisher: {
      "@type": "Organization",
      name: "GoServi",
      url: "https://goservi.ch",
      logo: {
        "@type": "ImageObject",
        url: "https://goservi.ch/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://goservi.ch/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero article */}
      <div className="bg-gradient-to-br from-[#F4F7F7] to-white border-b border-[#D1E5E5]">
        <div className="max-w-[800px] mx-auto px-4 pt-10 pb-8">
          {/* Breadcrumb */}
          <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
            <Link href="/" className="hover:text-[#1CA7A6] transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#1CA7A6] transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-gray-600 truncate">{post.title}</span>
          </nav>

          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[post.category]}`}>
              {post.categoryLabel}
            </span>
            <span className="text-xs text-gray-400">{post.readTime} min de lecture</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400">{formatDate(post.publishedAt)}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1F2937] leading-tight mb-5">
            {post.title}
          </h1>

          <p className="text-base text-gray-500 leading-relaxed">
            {post.description}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1100px] mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Article body */}
          <article className="flex-1 min-w-0">
            {/* Intro */}
            <p className="text-base text-gray-700 leading-relaxed mb-8 font-medium border-l-4 border-[#1CA7A6] pl-4 bg-[#F4F7F7] py-3 pr-4 rounded-r-[8px]">
              {post.intro}
            </p>

            {/* Table of contents */}
            <nav className="bg-[#F4F7F7] border border-[#D1E5E5] rounded-[12px] p-5 mb-8">
              <p className="text-sm font-bold text-[#1F2937] mb-3">📋 Sommaire</p>
              <ol className="space-y-1.5">
                {post.sections.map((section, i) => (
                  <li key={i}>
                    <a
                      href={`#section-${i}`}
                      className="text-sm text-[#1CA7A6] hover:text-[#178F8E] transition-colors"
                    >
                      {i + 1}. {section.h2}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* Sections */}
            {post.sections.map((section, i) => (
              <section key={i} id={`section-${i}`} className="mb-10">
                <h2 className="text-xl font-bold text-[#1F2937] mb-4 scroll-mt-24">
                  {section.h2}
                </h2>
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-base text-gray-700 leading-relaxed mb-4">
                    {p}
                  </p>
                ))}
                {section.list && (
                  <ul className="mt-3 space-y-2">
                    {section.list.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-[#1CA7A6] mt-0.5 shrink-0">
                          {item.startsWith("✅") || item.startsWith("❌") ? "" : "→"}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* Conclusion */}
            <div className="bg-[#E6F2F2] border border-[#D1E5E5] rounded-[12px] p-6 mb-10">
              <h2 className="text-lg font-bold text-[#1F2937] mb-3">En résumé</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{post.conclusion}</p>
            </div>

            {/* CTA inline */}
            <div className="bg-gradient-to-br from-[#1CA7A6] to-[#178F8E] rounded-[14px] p-6 text-white text-center mb-12">
              <p className="font-bold text-lg mb-2">Prêt à trouver votre artisan ?</p>
              <p className="text-white/80 text-sm mb-4">Artisans vérifiés · Disponibles 24h/24 · Suisse romande</p>
              <Link
                href={post.ctaHref}
                className="inline-block bg-white text-[#1CA7A6] font-semibold px-5 py-2.5 rounded-[10px] hover:bg-[#F4F7F7] transition-colors text-sm shadow-sm"
              >
                {post.ctaText} →
              </Link>
            </div>

            {/* Articles liés */}
            {related.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-[#1F2937] mb-5">Articles liés</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {related.map((rel) => (
                    <Link
                      key={rel.slug}
                      href={`/blog/${rel.slug}`}
                      className="group flex flex-col p-4 border border-[#D1E5E5] rounded-[12px] hover:border-[#1CA7A6] hover:bg-[#F4F7F7] transition-all"
                    >
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border w-fit mb-2 ${CATEGORY_COLORS[rel.category]}`}>
                        {rel.categoryLabel}
                      </span>
                      <p className="text-sm font-semibold text-[#1F2937] group-hover:text-[#1CA7A6] transition-colors leading-snug mb-1">
                        {rel.title}
                      </p>
                      <p className="text-xs text-gray-400">{rel.readTime} min de lecture</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0">
            <div className="sticky top-24 space-y-5">

              {/* CTA box */}
              <div className="bg-gradient-to-br from-[#1CA7A6] to-[#178F8E] rounded-[14px] p-5 text-white">
                <p className="font-bold text-base mb-2">Besoin d&apos;un artisan ?</p>
                <p className="text-white/80 text-sm mb-4">
                  Artisans vérifiés, disponibles 24h/24 partout en Romandie.
                </p>
                <Link
                  href={post.ctaHref}
                  className="block text-center bg-white text-[#1CA7A6] font-semibold px-4 py-2.5 rounded-[10px] hover:bg-[#F4F7F7] transition-colors text-sm shadow-sm"
                >
                  {post.ctaText} →
                </Link>
              </div>

              {/* Tous les articles */}
              <div className="border border-[#D1E5E5] rounded-[14px] p-5">
                <p className="font-bold text-sm text-[#1F2937] mb-3">Tous nos guides</p>
                <ul className="space-y-2">
                  {BLOG_POSTS.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/blog/${p.slug}`}
                        className={`text-xs block py-1 transition-colors ${
                          p.slug === post.slug
                            ? "text-[#1CA7A6] font-semibold"
                            : "text-gray-600 hover:text-[#1CA7A6]"
                        }`}
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pages villes */}
              <div className="border border-[#D1E5E5] rounded-[14px] p-5">
                <p className="font-bold text-sm text-[#1F2937] mb-3">Artisans par ville</p>
                <ul className="space-y-1.5">
                  {[
                    { name: "Genève", slug: "geneve" },
                    { name: "Lausanne", slug: "lausanne" },
                    { name: "Fribourg", slug: "fribourg" },
                    { name: "Neuchâtel", slug: "neuchatel" },
                    { name: "Sion", slug: "sion" },
                  ].map((city) => (
                    <li key={city.slug}>
                      <Link
                        href={`/trouver-artisan/${city.slug}`}
                        className="text-xs text-gray-600 hover:text-[#1CA7A6] transition-colors block"
                      >
                        Artisans à {city.name} →
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/trouver-artisan" className="text-xs text-[#1CA7A6] font-semibold">
                      Voir toutes les villes →
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
