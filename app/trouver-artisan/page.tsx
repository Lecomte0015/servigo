import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { TradeIcon, IconMapPin } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Trouver un artisan en Suisse romande — GoServi",
  description: "Trouvez un artisan qualifié près de chez vous en Suisse romande. Plombiers, électriciens, serruriers disponibles 24h/24 à Genève, Lausanne, Fribourg et partout en Romandie.",
  alternates: { canonical: "https://goservi.ch/trouver-artisan" },
};

const CITIES = [
  { slug: "geneve", name: "Genève", canton: "GE" },
  { slug: "lausanne", name: "Lausanne", canton: "VD" },
  { slug: "fribourg", name: "Fribourg", canton: "FR" },
  { slug: "neuchatel", name: "Neuchâtel", canton: "NE" },
  { slug: "sion", name: "Sion", canton: "VS" },
  { slug: "bienne", name: "Bienne", canton: "BE" },
  { slug: "yverdon", name: "Yverdon-les-Bains", canton: "VD" },
  { slug: "montreux", name: "Montreux", canton: "VD" },
  { slug: "nyon", name: "Nyon", canton: "VD" },
  { slug: "morges", name: "Morges", canton: "VD" },
  { slug: "la-chaux-de-fonds", name: "La Chaux-de-Fonds", canton: "NE" },
  { slug: "martigny", name: "Martigny", canton: "VS" },
];

const SERVICES = [
  { slug: "plombier", name: "Plombier" },
  { slug: "electricien", name: "Électricien" },
  { slug: "serrurier", name: "Serrurier" },
  { slug: "chauffagiste", name: "Chauffagiste" },
  { slug: "couvreur", name: "Couvreur" },
  { slug: "menuisier", name: "Menuisier" },
  { slug: "peintre", name: "Peintre" },
  { slug: "nettoyage", name: "Nettoyage" },
];

export default function TrouverArtisanPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-br from-[#1CA7A6] to-[#178F8E] text-white pt-14 pb-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Trouvez un artisan en Suisse romande
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Des artisans vérifiés disponibles 24h/24 dans toutes les villes de Romandie.
          </p>
          <Link href="/auth/register" className="bg-white text-[#1CA7A6] font-semibold px-6 py-3 rounded-[10px] hover:bg-[#F4F7F7] transition-colors shadow-sm">
            Faire une demande maintenant →
          </Link>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-[#1F2937] mb-2 text-center">Par ville</h2>
        <p className="text-sm text-gray-500 text-center mb-8">Sélectionnez votre ville pour voir les artisans disponibles</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/trouver-artisan/${city.slug}`}
              className="flex flex-col items-center gap-2 p-4 border border-[#D1E5E5] rounded-[12px] hover:border-[#1CA7A6] hover:bg-[#F4F7F7] transition-all text-center group"
            >
              <span className="w-10 h-10 rounded-full bg-[#E6F2F2] flex items-center justify-center text-[#1CA7A6]">
                <IconMapPin size={18} />
              </span>
              <p className="font-semibold text-[#1F2937] group-hover:text-[#1CA7A6] transition-colors text-sm">{city.name}</p>
              <span className="text-xs text-gray-400">Canton {city.canton}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#F4F7F7] py-12 px-4">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-2 text-center">Par spécialité</h2>
          <p className="text-sm text-gray-500 text-center mb-8">Choisissez le type d&apos;artisan dont vous avez besoin</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SERVICES.map((s) => (
              <Link
                key={s.slug}
                href={`/devenir-artisan/${s.slug}`}
                className="flex items-center gap-3 p-4 bg-white border border-[#D1E5E5] rounded-[12px] hover:border-[#1CA7A6] hover:bg-[#E6F2F2] transition-all group"
              >
                <span className="w-9 h-9 rounded-[8px] bg-[#E6F2F2] flex items-center justify-center text-[#1CA7A6] shrink-0">
                  <TradeIcon slug={s.slug} size={18} />
                </span>
                <p className="font-medium text-[#1F2937] group-hover:text-[#1CA7A6] transition-colors text-sm">{s.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
