"use client";

import { useState } from "react";

type Result = {
  keyword: string;
  volume: string;
  cpc: string;
  competition: "Faible" | "Moyenne" | "Élevée";
  score: number;
  trend: "up" | "down" | "stable";
};

const COMPETITION_COLOR: Record<string, string> = {
  Faible: "bg-green-100 text-green-700",
  Moyenne: "bg-yellow-100 text-yellow-700",
  Élevée: "bg-red-100 text-red-700",
};

const TREND_ICON: Record<string, string> = {
  up: "fa-solid fa-arrow-trend-up text-green-500",
  down: "fa-solid fa-arrow-trend-down text-red-500",
  stable: "fa-solid fa-minus text-gray-400",
};

// Données fictives pour démonstration
function generateResults(query: string): Result[] {
  const base = query.trim().toLowerCase();
  const seeds = [
    base,
    `${base} pas cher`,
    `meilleur ${base}`,
    `${base} en ligne`,
    `acheter ${base}`,
    `${base} avis`,
    `${base} 2024`,
    `${base} comparatif`,
  ];
  return seeds.map((kw, i) => ({
    keyword: kw,
    volume: `${Math.floor(Math.random() * 90 + 10) * 1000}`,
    cpc: `${(Math.random() * 3 + 0.2).toFixed(2)} €`,
    competition: (["Faible", "Moyenne", "Élevée"] as const)[i % 3],
    score: Math.floor(Math.random() * 40 + 60),
    trend: (["up", "down", "stable"] as const)[i % 3],
  }));
}

export default function SearchForm() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ competition: "all", minScore: 0 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResults(null);
    setTimeout(() => {
      setResults(generateResults(query));
      setLoading(false);
    }, 1000);
  };

  const filtered = results?.filter((r) => {
    if (filters.competition !== "all" && r.competition !== filters.competition) return false;
    if (r.score < filters.minScore) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Formulaire de recherche */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <i className="fa-solid fa-magnifying-glass text-blue-500 mr-1.5" />
          Mot-clé ou thématique
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex : chaussures running, formation Python, appartement Paris…"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors min-w-[140px] justify-center"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" />
                Analyse…
              </>
            ) : (
              <>
                <i className="fa-solid fa-magnifying-glass-chart" />
                Analyser
              </>
            )}
          </button>
        </div>

        {/* Filtres */}
        <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <i className="fa-solid fa-filter text-gray-400" />
            <span className="text-gray-600 font-medium">Filtres :</span>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Concurrence :
            <select
              value={filters.competition}
              onChange={(e) => setFilters((f) => ({ ...f, competition: e.target.value }))}
              className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="all">Toutes</option>
              <option value="Faible">Faible</option>
              <option value="Moyenne">Moyenne</option>
              <option value="Élevée">Élevée</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Score min :
            <input
              type="number"
              min={0}
              max={100}
              value={filters.minScore}
              onChange={(e) => setFilters((f) => ({ ...f, minScore: Number(e.target.value) }))}
              className="border border-gray-200 rounded-lg px-2 py-1 w-16 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </label>
        </div>
      </form>

      {/* État de chargement */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex flex-col items-center gap-4 text-gray-500">
          <i className="fa-solid fa-spinner fa-spin text-blue-500 text-4xl" />
          <p className="font-medium">Analyse des données en cours…</p>
          <p className="text-sm text-gray-400">Nous interrogeons 2M+ de mots-clés Facebook Ads</p>
        </div>
      )}

      {/* Résultats */}
      {filtered && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <i className="fa-solid fa-list-check text-blue-500" />
              {filtered.length} résultat{filtered.length !== 1 ? "s" : ""} pour{" "}
              <span className="text-blue-600">&ldquo;{query}&rdquo;</span>
            </h2>
            <button className="text-sm text-blue-600 hover:underline flex items-center gap-1.5">
              <i className="fa-solid fa-download" />
              Exporter CSV
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400">
              <i className="fa-solid fa-circle-xmark text-4xl mb-3 block" />
              Aucun résultat avec ces filtres.
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3.5 text-gray-500 font-semibold">Mot-clé</th>
                    <th className="text-right px-5 py-3.5 text-gray-500 font-semibold">Volume/mois</th>
                    <th className="text-right px-5 py-3.5 text-gray-500 font-semibold">CPC moy.</th>
                    <th className="text-center px-5 py-3.5 text-gray-500 font-semibold">Concurrence</th>
                    <th className="text-center px-5 py-3.5 text-gray-500 font-semibold">Score</th>
                    <th className="text-center px-5 py-3.5 text-gray-500 font-semibold">Tendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((r) => (
                    <tr key={r.keyword} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-900">{r.keyword}</td>
                      <td className="px-5 py-4 text-right text-gray-600">
                        {Number(r.volume).toLocaleString("fr-FR")}
                      </td>
                      <td className="px-5 py-4 text-right text-gray-600">{r.cpc}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${COMPETITION_COLOR[r.competition]}`}>
                          {r.competition}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${r.score}%` }}
                            />
                          </div>
                          <span className="text-gray-700 font-semibold">{r.score}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <i className={TREND_ICON[r.trend]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Placeholder vide */}
      {!results && !loading && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center text-gray-400">
          <i className="fa-solid fa-magnifying-glass-chart text-5xl mb-4 block text-gray-200" />
          <p className="font-medium text-gray-500">Entrez un mot-clé pour démarrer votre analyse</p>
          <p className="text-sm mt-1">Ex : chaussures sport, logiciel comptabilité, cours de yoga…</p>
        </div>
      )}
    </div>
  );
}
