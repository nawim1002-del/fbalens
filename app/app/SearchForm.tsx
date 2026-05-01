"use client";

import { useState } from "react";

type KeywordResult = {
  keyword: string;
  searchVolumeExact: number | null;
  searchVolumeBroad: number | null;
  monthlyTrend: number | null;
  quarterlyTrend: number | null;
  easeOfRanking: number | null;
  ppcBidExact: number | null;
  organicProductCount: number | null;
  avgSales: number | null;
  avgReviews: number | null;
  avgBsr: number | null;
};

function fmt(n: number | null, opts?: Intl.NumberFormatOptions): string {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("fr-FR", opts);
}

function TrendBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-300">—</span>;
  const positive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${positive ? "text-green-600" : "text-red-500"}`}>
      <i className={`fa-solid ${positive ? "fa-arrow-trend-up" : "fa-arrow-trend-down"} text-xs`} />
      {positive ? "+" : ""}{value}%
    </span>
  );
}

function ScoreBar({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-300">—</span>;
  const color = value >= 70 ? "bg-green-500" : value >= 40 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-gray-700 font-semibold text-sm">{value}</span>
    </div>
  );
}

export default function SearchForm() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<KeywordResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(`/api/keywords?keyword=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur API");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Formulaire */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <i className="fa-solid fa-magnifying-glass text-blue-500 mr-1.5" />
          Mot-clé Amazon.fr
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex : chaussures running, aspirateur sans fil, vélo électrique…"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors min-w-[160px] justify-center"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" />
                Analyse…
              </>
            ) : (
              <>
                <i className="fa-brands fa-amazon" />
                Analyser
              </>
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
          <i className="fa-solid fa-circle-info" />
          Données issues de Jungle Scout — marketplace Amazon.fr
        </p>
      </form>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3 text-red-700">
          <i className="fa-solid fa-triangle-exclamation mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Erreur Jungle Scout</p>
            <p className="text-sm mt-0.5">{error}</p>
            {error.includes("KEY_NAME") && (
              <p className="text-sm mt-2 text-red-600">
                Renseigne <code className="bg-red-100 px-1 rounded">JUNGLE_SCOUT_KEY_NAME</code> dans{" "}
                <code className="bg-red-100 px-1 rounded">.env.local</code> avec le nom de ta clé API
                (visible dans <strong>Settings › API</strong> de ton compte Jungle Scout).
              </p>
            )}
          </div>
        </div>
      )}

      {/* Chargement */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-14 flex flex-col items-center gap-4 text-gray-500">
          <i className="fa-solid fa-spinner fa-spin text-blue-500 text-4xl" />
          <p className="font-medium">Interrogation de Jungle Scout…</p>
          <p className="text-sm text-gray-400">Volume de recherche · Ventes · Reviews · BSR</p>
        </div>
      )}

      {/* Résultats */}
      {result && !loading && (
        <div className="space-y-6">
          {/* En-tête résultat */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-lg">
              <i className="fa-brands fa-amazon text-orange-500" />
              Résultats pour{" "}
              <span className="text-blue-600">&ldquo;{result.keyword}&rdquo;</span>
              <span className="text-sm font-normal text-gray-400 ml-1">— Amazon.fr</span>
            </h2>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <i className="fa-solid fa-database text-gray-300" />
              Jungle Scout
            </span>
          </div>

          {/* KPIs principaux — 4 cartes */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <i className="fa-solid fa-magnifying-glass text-sm" />
                <span className="text-xs font-semibold uppercase tracking-wide">Volume exact</span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">
                {fmt(result.searchVolumeExact)}
              </p>
              <p className="text-xs text-gray-400 mt-1">recherches / mois</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <i className="fa-solid fa-box text-sm" />
                <span className="text-xs font-semibold uppercase tracking-wide">Ventes moy. p.1</span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">
                {fmt(result.avgSales)}
              </p>
              <p className="text-xs text-gray-400 mt-1">unités vendues / mois</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 text-yellow-600 mb-2">
                <i className="fa-solid fa-star text-sm" />
                <span className="text-xs font-semibold uppercase tracking-wide">Reviews moy. p.1</span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">
                {fmt(result.avgReviews)}
              </p>
              <p className="text-xs text-gray-400 mt-1">avis clients (moy.)</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <i className="fa-solid fa-ranking-star text-sm" />
                <span className="text-xs font-semibold uppercase tracking-wide">BSR moy. p.1</span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">
                {result.avgBsr !== null ? `#${fmt(result.avgBsr)}` : "—"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Best Seller Rank</p>
            </div>
          </div>

          {/* Métriques secondaires */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <i className="fa-solid fa-chart-bar text-blue-400" />
              Métriques complémentaires
            </div>
            <div className="divide-y divide-gray-50">
              <Row
                icon="fa-solid fa-magnifying-glass-plus"
                label="Volume broad"
                value={result.searchVolumeBroad !== null ? `${fmt(result.searchVolumeBroad)} / mois` : "—"}
              />
              <Row
                icon="fa-solid fa-calendar-days"
                label="Tendance mensuelle"
                value={<TrendBadge value={result.monthlyTrend} />}
              />
              <Row
                icon="fa-solid fa-calendar"
                label="Tendance trimestrielle"
                value={<TrendBadge value={result.quarterlyTrend} />}
              />
              <Row
                icon="fa-solid fa-gauge-high"
                label="Facilité de classement"
                value={<ScoreBar value={result.easeOfRanking} />}
              />
              <Row
                icon="fa-brands fa-amazon"
                label="CPC Amazon (enchère exacte)"
                value={result.ppcBidExact !== null ? `${result.ppcBidExact.toFixed(2)} €` : "—"}
              />
              <Row
                icon="fa-solid fa-store"
                label="Nb de produits organiques"
                value={result.organicProductCount !== null ? fmt(result.organicProductCount) : "—"}
              />
            </div>
          </div>
        </div>
      )}

      {/* État vide */}
      {!result && !loading && !error && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center text-gray-400">
          <i className="fa-brands fa-amazon text-5xl mb-4 block text-gray-200" />
          <p className="font-medium text-gray-500">Entrez un mot-clé pour interroger Jungle Scout</p>
          <p className="text-sm mt-1">
            Volume de recherche · Ventes estimées · Reviews · BSR — Amazon.fr
          </p>
        </div>
      )}
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5">
      <span className="flex items-center gap-2 text-sm text-gray-600">
        <i className={`${icon} text-gray-400 w-4 text-center`} />
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}
