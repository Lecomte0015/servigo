import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Nos services — Plomberie, Électricité, Serrurerie & plus",
  description:
    "Découvrez tous les services GoServi : plomberie, électricité, serrurerie, menuiserie, peinture et bien plus. Artisans vérifiés disponibles 24h/24 en Suisse romande.",
  alternates: { canonical: "https://goservi.ch/services" },
  openGraph: {
    url: "https://goservi.ch/services",
    title: "Nos services — Plomberie, Électricité, Serrurerie & plus | GoServi",
    description:
      "Tous les services d'artisanat disponibles sur GoServi. Interventions rapides à Genève et en Suisse romande.",
  },
};

export const revalidate = 60;

export default async function ServicesPage() {
  const categories = await prisma.serviceCategory.findMany({
    where: { isVisible: true },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#E6F2F2] to-white pt-12 pb-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] mb-3">
            Tous nos services
          </h1>
          <p className="text-gray-500 text-lg">
            Des artisans vérifiés disponibles 24h/24 pour toutes vos urgences et travaux.
          </p>

          {/* Mini search bar */}
          <form
            action="/dashboard/new-job"
            method="get"
            className="mt-6 flex rounded-[12px] overflow-hidden border border-[#D1E5E5] bg-white shadow-md max-w-lg mx-auto"
          >
            <input
              type="text"
              name="service"
              placeholder="Ex: plombier, électricien…"
              className="flex-1 px-4 py-3 text-sm text-[#1F2937] placeholder:text-gray-400 focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              className="bg-[#1CA7A6] text-white font-semibold px-6 py-3 text-sm hover:bg-[#178F8E] transition-colors shrink-0"
            >
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* Services grid */}
      <section className="max-w-[1200px] mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/dashboard/new-job?categoryId=${cat.id}`}
              className="group bg-white border border-[#D1E5E5] rounded-[14px] overflow-hidden hover:border-[#1CA7A6] hover:shadow-md transition-all flex flex-col"
            >
              {/* Image ou emoji */}
              {cat.imageUrl ? (
                <div className="relative h-32 overflow-hidden" style={{ backgroundColor: cat.bgColor ?? "#F4F7F7" }}>
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              ) : (
                <div
                  className="h-24 flex items-center justify-center"
                  style={{ backgroundColor: cat.bgColor ?? "#F4F7F7" }}
                >
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300 select-none">
                    {cat.icon ?? "🔧"}
                  </span>
                </div>
              )}

              <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="font-semibold text-[#1F2937] group-hover:text-[#1CA7A6] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm text-gray-500 leading-snug flex-1">
                  {cat.description ?? "Service professionnel disponible"}
                </p>
                <div className="flex items-center justify-between mt-2">
                  {cat.startPrice != null ? (
                    <span className="text-sm font-semibold text-[#1CA7A6]">
                      Dès {cat.startPrice} CHF/h
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-[#1CA7A6] font-medium group-hover:underline">
                    Demander →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="text-gray-500 mb-4 text-lg">Votre problème ne figure pas dans la liste ?</p>
          <Link
            href="/dashboard/new-job"
            className="inline-flex items-center gap-2 bg-[#1CA7A6] text-white font-semibold px-6 py-3 rounded-[10px] hover:bg-[#178F8E] transition-colors shadow-sm"
          >
            Décrivez votre besoin →
          </Link>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-[#F4F7F7] py-8 px-4 text-center border-t border-[#D1E5E5]">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <span className="text-[#1CA7A6]">✓</span> Artisans vérifiés (RC + assurances)
          </span>
          <span className="flex items-center gap-2">
            <span className="text-[#1CA7A6]">✓</span> Paiement sécurisé Stripe
          </span>
          <span className="flex items-center gap-2">
            <span className="text-[#1CA7A6]">✓</span> Intervention en moins de 30 min
          </span>
          <span className="flex items-center gap-2">
            <span className="text-[#1CA7A6]">✓</span> Satisfaction garantie
          </span>
        </div>
      </section>
    </div>
  );
}
