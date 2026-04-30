import Navbar from "../components/Navbar";
import SearchForm from "./SearchForm";

export const metadata = {
  title: "Recherche de mots-clés — FbaLens",
  description: "Analysez les mots-clés pour vos campagnes Facebook Ads.",
};

export default function AppPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50">
        {/* En-tête de page */}
        <div className="bg-white border-b border-gray-200 py-8 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-magnifying-glass-chart text-blue-600 text-lg" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Recherche de mots-clés</h1>
            </div>
            <p className="text-gray-500 ml-13">
              Entrez un mot-clé ou une thématique pour obtenir des données de volume, CPC et
              concurrence adaptées aux campagnes Facebook Ads.
            </p>
            <div className="flex gap-6 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-database text-blue-400" />
                2M+ mots-clés
              </span>
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-clock-rotate-left text-blue-400" />
                Données mises à jour quotidiennement
              </span>
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-lock-open text-green-400" />
                Accès gratuit
              </span>
            </div>
          </div>
        </div>

        {/* Corps */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <SearchForm />
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="bg-white border-t border-gray-100 py-4 px-6 text-center text-sm text-gray-400">
        FbaLens © {new Date().getFullYear()} —{" "}
        <span className="text-gray-500">Données à titre indicatif uniquement</span>
      </footer>
    </>
  );
}
