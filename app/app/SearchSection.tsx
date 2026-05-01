"use client";

import { useState, useMemo } from "react";
import { generateKeywords, type KeywordRow, type Competition } from "./lib/mockData";

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, opts?: Intl.NumberFormatOptions) {
  return n.toLocaleString("fr-FR", opts);
}

const COMP_STYLE: Record<Competition, string> = {
  Faible:  "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25",
  Moyenne: "text-yellow-400  bg-yellow-500/10  border border-yellow-500/25",
  Élevée:  "text-red-400     bg-red-500/10     border border-red-500/25",
};

const TREND_ICON: Record<string, string> = {
  up:     "fa-solid fa-arrow-trend-up   text-emerald-400",
  down:   "fa-solid fa-arrow-trend-down text-red-400",
  stable: "fa-solid fa-minus            text-gray-500",
};

type ClaudeIntent = {
  keyword: string;
  score: 0 | 10 | 15 | 25;
  reason: string;
};

type EnrichedRow = KeywordRow & { claudeIntent?: ClaudeIntent };

function IntentBadge({ row }: { row: EnrichedRow }) {
  const ci = row.claudeIntent;
  if (ci) {
    const score = ci.score;
    const color =
      score === 25 ? "text-emerald-400" :
      score === 15 ? "text-green-400" :
      score === 10 ? "text-yellow-400" :
      "text-red-400";
    const bg =
      score === 25 ? "bg-emerald-500/10 border-emerald-500/30" :
      score === 15 ? "bg-green-500/10 border-green-500/30" :
      score === 10 ? "bg-yellow-500/10 border-yellow-500/30" :
      "bg-red-500/10 border-red-500/30";
    const icon = score === 25 ? "★" : score === 15 ? "▲" : score === 10 ? "◆" : "▼";
    return (
      <div className="flex flex-col items-center gap-0.5">
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold ${bg}`}>
          <span className={`text-base leading-none ${color}`}>{icon}</span>
          <span className={color}>{score}/25</span>
        </div>
        <span className="text-[10px] text-gray-500 max-w-[120px] text-center leading-tight hidden lg:block">
          {ci.reason}
        </span>
      </div>
    );
  }

  const { score, label, color, bgColor } = row.intent;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold ${bgColor}`}>
      <span className={`text-base leading-none ${color}`}>
        {score === 25 ? "★" : score >= 17 ? "▲" : score >= 11 ? "◆" : "▼"}
      </span>
      <span className={color}>{score}/25</span>
      <span className="text-gray-500 hidden lg:inline">· {label}</span>
    </div>
  );
}

// ── filter bar ────────────────────────────────────────────────────────────────

type Filters = {
  minVolume: number;
  maxReviews: number;
  maxBsr: number;
  minIntent: number;
  hideOffTarget: boolean;
};

const DEFAULT_FILTERS: Filters = {
  minVolume: 0,
  maxReviews: 999999,
  maxBsr: 999999,
  minIntent: 0,
  hideOffTarget: false,
};

function effectiveIntentScore(row: EnrichedRow): number {
  return row.claudeIntent !== undefined ? row.claudeIntent.score : row.intent.score;
}

function isOnTarget(row: EnrichedRow, f: Filters): boolean {
  return (
    row.volume >= f.minVolume &&
    row.avgReviews <= f.maxReviews &&
    row.avgBsr <= f.maxBsr &&
    effectiveIntentScore(row) >= f.minIntent
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function SearchSection() {
  const [query, setQuery]             = useState("");
  const [submitted, setSubmitted]     = useState("");
  const [loading, setLoading]         = useState(false);
  const [rows, setRows]               = useState<EnrichedRow[]>([]);
  const [filters, setFilters]         = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [intentLoading, setIntentLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setRows([]);
    setSubmitted(query.trim());

    const baseRows: EnrichedRow[] = await new Promise((resolve) =>
      setTimeout(() => resolve(generateKeywords(query.trim())), 700)
    );
    setRows(baseRows);
    setLoading(false);

    // Call Claude for intent scoring
    setIntentLoading(true);
    try {
      const res = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: baseRows.map((r) => r.keyword) }),
      });
      if (res.ok) {
        const claudeResults: ClaudeIntent[] = await res.json();
        const byKeyword = Object.fromEntries(claudeResults.map((c) => [c.keyword, c]));
        setRows(baseRows.map((r) => ({ ...r, claudeIntent: byKeyword[r.keyword] })));
      }
    } catch {
      // keep mock intent scores on error
    } finally {
      setIntentLoading(false);
    }
  };

  const processed = useMemo(() => {
    if (!rows.length) return [];
    return rows.map((r) => ({ ...r, onTarget: isOnTarget(r, filters) }));
  }, [rows, filters]);

  const visible = filters.hideOffTarget
    ? processed.filter((r) => r.onTarget)
    : processed;

  const offCount = processed.filter((r) => !r.onTarget).length;

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <form
        onSubmit={handleSearch}
        className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 flex flex-col gap-4"
      >
        <div className="flex gap-3">
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mot-clé ou niche — ex: réveil simulateur d'aube"
              className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-xl flex items-center gap-2 text-sm transition-colors shrink-0"
          >
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin" />Analyse…</>
              : <><i className="fa-solid fa-magnifying-glass-chart" />Analyser</>}
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-colors ${
              showFilters
                ? "bg-blue-600/20 border-blue-500/40 text-blue-400"
                : "bg-gray-800 border-gray-600 text-gray-400 hover:text-gray-200"
            }`}
          >
            <i className="fa-solid fa-sliders" />
            Filtres
            {offCount > 0 && (
              <span className="bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                {offCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="border-t border-gray-700 pt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <FilterInput
              label="Volume min."
              icon="fa-solid fa-magnifying-glass"
              value={filters.minVolume}
              onChange={(v) => setFilters((f) => ({ ...f, minVolume: v }))}
              placeholder="0"
            />
            <FilterInput
              label="Reviews max. (p.1)"
              icon="fa-solid fa-star"
              value={filters.maxReviews === 999999 ? "" : filters.maxReviews}
              onChange={(v) => setFilters((f) => ({ ...f, maxReviews: v || 999999 }))}
              placeholder="∞"
            />
            <FilterInput
              label="BSR max. (p.1)"
              icon="fa-solid fa-ranking-star"
              value={filters.maxBsr === 999999 ? "" : filters.maxBsr}
              onChange={(v) => setFilters((f) => ({ ...f, maxBsr: v || 999999 }))}
              placeholder="∞"
            />
            <FilterInput
              label="Score intention min."
              icon="fa-solid fa-bolt"
              value={filters.minIntent}
              onChange={(v) => setFilters((f) => ({ ...f, minIntent: Math.min(v, 25) }))}
              placeholder="0"
              max={25}
            />
            <div className="col-span-2 md:col-span-4 flex items-center gap-6 flex-wrap">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.hideOffTarget}
                  onChange={(e) => setFilters((f) => ({ ...f, hideOffTarget: e.target.checked }))}
                  className="rounded accent-blue-500"
                />
                Masquer les mots-clés hors cible
              </label>
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="text-xs text-gray-500 hover:text-gray-300 underline"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Loading */}
      {loading && (
        <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-14 flex flex-col items-center gap-3 text-gray-500">
          <i className="fa-solid fa-spinner fa-spin text-blue-500 text-3xl" />
          <p className="text-sm">Génération des données…</p>
        </div>
      )}

      {/* Results */}
      {!loading && visible.length > 0 && (
        <div className="bg-gray-800/40 border border-gray-700 rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="px-5 py-3.5 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <i className="fa-solid fa-list-ul text-blue-400" />
              <span>{visible.length} mot{visible.length > 1 ? "s" : ""}-clé{visible.length > 1 ? "s" : ""}</span>
              {offCount > 0 && !filters.hideOffTarget && (
                <span className="text-xs text-orange-400 ml-1">· {offCount} hors cible</span>
              )}
              <span className="text-gray-600 text-xs ml-1">pour «{submitted}»</span>
            </div>
            <div className="flex items-center gap-3">
              {intentLoading && (
                <span className="flex items-center gap-1.5 text-xs text-blue-400">
                  <i className="fa-solid fa-spinner fa-spin" />
                  Analyse Claude en cours…
                </span>
              )}
              <button className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1.5 transition-colors">
                <i className="fa-solid fa-download" />
                Exporter CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <Th>Mot-clé</Th>
                  <Th align="right">Volume/mois</Th>
                  <Th align="right">CPC moy.</Th>
                  <Th align="center">Concurrence</Th>
                  <Th align="center">
                    Intention achat
                    {intentLoading && <i className="fa-solid fa-spinner fa-spin ml-1.5 text-blue-400 text-[10px]" />}
                  </Th>
                  <Th align="right">Reviews p.1</Th>
                  <Th align="right">BSR p.1</Th>
                  <Th align="center">Tendance</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {visible.map((row) => (
                  <tr
                    key={row.keyword}
                    className={`transition-all ${
                      row.onTarget
                        ? "hover:bg-gray-700/20"
                        : "opacity-35 hover:opacity-50"
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {!row.onTarget && (
                          <span className="text-[10px] bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded px-1.5 py-0.5 font-semibold shrink-0">
                            HORS CIBLE
                          </span>
                        )}
                        <span className={`font-medium ${row.onTarget ? "text-gray-100" : "text-gray-400"}`}>
                          {row.keyword}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right text-gray-300">{fmt(row.volume)}</td>
                    <td className="px-5 py-3.5 text-right text-gray-300">{row.cpc.toFixed(2)} €</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${COMP_STYLE[row.competition]}`}>
                        {row.competition}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <IntentBadge row={row} />
                    </td>
                    <td className="px-5 py-3.5 text-right text-gray-300">{fmt(row.avgReviews)}</td>
                    <td className="px-5 py-3.5 text-right text-gray-300">#{fmt(row.avgBsr)}</td>
                    <td className="px-5 py-3.5 text-center">
                      <i className={TREND_ICON[row.trend]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && rows.length === 0 && (
        <div className="border border-dashed border-gray-700 rounded-2xl p-16 text-center">
          <i className="fa-solid fa-magnifying-glass-chart text-4xl text-gray-700 mb-4 block" />
          <p className="text-gray-400 font-medium">Entrez un mot-clé pour lancer l&apos;analyse</p>
          <p className="text-gray-600 text-sm mt-1">
            Score d&apos;intention · Volume · Concurrence · Reviews · BSR
          </p>
        </div>
      )}
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

function Th({ children, align = "left" }: { children: React.ReactNode; align?: string }) {
  const cls = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <th className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${cls}`}>
      {children}
    </th>
  );
}

function FilterInput({
  label, icon, value, onChange, placeholder, max,
}: {
  label: string;
  icon: string;
  value: number | string;
  onChange: (v: number) => void;
  placeholder: string;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
        <i className={`${icon} text-gray-600`} />
        {label}
      </label>
      <input
        type="number"
        value={value === 0 ? "" : value}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={placeholder}
        min={0}
        max={max}
        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}
