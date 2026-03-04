import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const SERVICES = [
  { icon: "🚿", name: "Plomberie", desc: "Fuites, débouchage, canalisation, installation sanitaire.", price: "dès 80 CHF/h", tag: "⚡ Urgence disponible" },
  { icon: "⚡", name: "Électricité", desc: "Dépannage, installation, tableau électrique, prises.", price: "dès 90 CHF/h", tag: "⚡ Urgence disponible" },
  { icon: "🔒", name: "Serrurerie", desc: "Ouverture de porte, blindage, changement de serrure.", price: "dès 120 CHF/h", tag: "⚡ Urgence disponible" },
  { icon: "🏠", name: "Toiture", desc: "Réparation de fuite, étanchéité, tuiles, zinguerie.", price: "dès 150 CHF/h", tag: null },
  { icon: "🌡️", name: "Chauffage", desc: "Chaudière, pompe à chaleur, radiateurs, entretien.", price: "dès 100 CHF/h", tag: "⚡ Urgence disponible" },
  { icon: "🔧", name: "Menuiserie", desc: "Portes, fenêtres, parquet, escaliers, réparations.", price: "dès 70 CHF/h", tag: null },
  { icon: "🏗️", name: "Maçonnerie", desc: "Rénovation, carrelage, enduit, béton, fondations.", price: "dès 85 CHF/h", tag: null },
  { icon: "🎨", name: "Peinture", desc: "Intérieur, extérieur, enduit, papier peint, mise en peinture.", price: "dès 60 CHF/h", tag: null },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#E6F2F2] to-white pt-12 pb-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] mb-3">
            Tous nos services à Genève
          </h1>
          <p className="text-gray-500 text-lg">
            Des artisans vérifiés disponibles 24h/24 pour toutes vos urgences et travaux.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="max-w-[1200px] mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((s) => (
            <Link
              key={s.name}
              href="/auth/register"
              className="group bg-white border border-[#D1E5E5] rounded-[14px] p-5 flex flex-col gap-3 hover:border-[#1CA7A6] hover:shadow-md transition-all"
            >
              <span className="text-4xl">{s.icon}</span>
              <div>
                <h3 className="font-semibold text-[#1F2937] group-hover:text-[#1CA7A6] transition-colors">{s.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5 leading-snug">{s.desc}</p>
              </div>
              <div className="mt-auto flex flex-col gap-1">
                <span className="text-sm font-semibold text-[#1CA7A6]">{s.price}</span>
                {s.tag && <span className="text-xs text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full w-fit">{s.tag}</span>}
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="text-gray-500 mb-4 text-lg">Votre problème ne figure pas dans la liste ?</p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-[#1CA7A6] text-white font-semibold px-6 py-3 rounded-[10px] hover:bg-[#178F8E] transition-colors shadow-sm"
          >
            Décrivez votre besoin →
          </Link>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-[#F4F7F7] py-8 px-4 text-center border-t border-[#D1E5E5]">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-2"><span className="text-[#1CA7A6]">✓</span> Artisans vérifiés (RC + assurances)</span>
          <span className="flex items-center gap-2"><span className="text-[#1CA7A6]">✓</span> Paiement sécurisé Stripe</span>
          <span className="flex items-center gap-2"><span className="text-[#1CA7A6]">✓</span> Intervention en moins de 30 min</span>
          <span className="flex items-center gap-2"><span className="text-[#1CA7A6]">✓</span> Satisfaction garantie</span>
        </div>
      </section>
    </div>
  );
}
