import Link from "next/link";
import Navbar from "./components/Navbar";

const features = [
  {
    icon: "fa-solid fa-magnifying-glass-chart",
    title: "Analyse de mots-clés",
    desc: "Découvrez le volume, la concurrence et le CPC estimé de chaque mot-clé pour vos campagnes Facebook Ads.",
  },
  {
    icon: "fa-solid fa-users",
    title: "Ciblage d'audience",
    desc: "Identifiez les audiences les plus pertinentes et évaluez leur taille avant de lancer vos publicités.",
  },
  {
    icon: "fa-solid fa-chart-line",
    title: "Tendances en temps réel",
    desc: "Suivez l'évolution des tendances pour anticiper les pics et optimiser votre budget publicitaire.",
  },
  {
    icon: "fa-solid fa-bolt",
    title: "Suggestions intelligentes",
    desc: "Obtenez des recommandations de mots-clés connexes générées automatiquement pour élargir votre portée.",
  },
  {
    icon: "fa-solid fa-shield-halved",
    title: "Score de pertinence",
    desc: "Un indicateur propriétaire qui évalue l'adéquation entre un mot-clé et votre audience cible.",
  },
  {
    icon: "fa-solid fa-file-export",
    title: "Export CSV / JSON",
    desc: "Exportez vos analyses en un clic pour les intégrer dans vos rapports ou outils tiers.",
  },
];

const stats = [
  { value: "2M+", label: "Mots-clés indexés" },
  { value: "98%", label: "Précision des données" },
  { value: "500+", label: "Campagnes optimisées" },
  { value: "12s", label: "Temps moyen d'analyse" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <i className="fa-solid fa-star" />
            Outil #1 d&apos;analyse Facebook Ads
          </span>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Trouvez les mots-clés qui font{" "}
            <span className="underline decoration-yellow-400">performer</span> vos Facebook Ads
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            FbaLens analyse des millions de signaux publicitaires pour vous fournir les meilleurs
            mots-clés, audiences et insights pour maximiser votre ROI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg shadow-lg"
            >
              <i className="fa-solid fa-magnifying-glass" />
              Lancer une recherche
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 border-2 border-white/50 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-lg"
            >
              <i className="fa-solid fa-circle-play" />
              Voir comment ça marche
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold text-blue-600">{s.value}</p>
              <p className="text-gray-500 mt-1 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin pour vos campagnes
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Un ensemble d&apos;outils puissants conçus spécifiquement pour les annonceurs Facebook Ads.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <i className={`${f.icon} text-blue-600 text-xl`} />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-700 text-white py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <i className="fa-solid fa-rocket text-5xl text-indigo-300 mb-6 block" />
          <h2 className="text-3xl font-bold mb-4">Prêt à optimiser vos campagnes ?</h2>
          <p className="text-indigo-200 mb-8 text-lg">
            Commencez votre analyse gratuitement, sans inscription requise.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors text-lg shadow-lg"
          >
            <i className="fa-solid fa-magnifying-glass" />
            Rechercher un mot-clé
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-sm py-8 px-6 text-center">
        <div className="flex justify-center gap-4 mb-3 text-xl">
          <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-facebook" /></a>
          <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-twitter" /></a>
          <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-linkedin" /></a>
        </div>
        <p>© {new Date().getFullYear()} FbaLens. Tous droits réservés.</p>
      </footer>
    </>
  );
}
