"use client";

import Link from "next/link";
import { useState } from "react";
import SearchSection from "./SearchSection";
import FbaCalculator from "./FbaCalculator";

const TABS = [
  { id: "search",  label: "Recherche mots-clés", icon: "fa-solid fa-magnifying-glass-chart" },
  { id: "fba",     label: "Calculatrice FBA Pro", icon: "fa-solid fa-calculator" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AppPage() {
  const [tab, setTab] = useState<TabId>("search");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <span className="bg-blue-600 text-white rounded-lg w-7 h-7 flex items-center justify-center text-sm">
              <i className="fa-brands fa-amazon" />
            </span>
            <span className="text-sm">FbaLens</span>
          </Link>

          {/* Tabs */}
          <nav className="flex items-center gap-1 bg-gray-800 p-1 rounded-xl">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t.id
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <i className={t.icon} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Données simulées
          </div>
        </div>
      </header>

      {/* ── Page header ────────────────────────────────────────────────── */}
      <div className="bg-gray-900/50 border-b border-gray-800 py-6 px-5">
        <div className="max-w-6xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <i className={`${TABS.find((t) => t.id === tab)?.icon} text-blue-400 text-base`} />
              {tab === "search" ? "Recherche de mots-clés" : "Calculatrice FBA Pro"}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {tab === "search"
                ? "Score d'intention d'achat · Volume · Concurrence · Reviews · BSR · Filtre hors-cible"
                : "Frais de référencement + FBA · Bénéfice net · Marge · ROI — Plan Professionnel"}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-database text-gray-700" />
              Amazon.fr
            </span>
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-shield-halved text-gray-700" />
              Plan Pro — sans 0,99 €/vente
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-5 py-7">
        {tab === "search" && <SearchSection />}
        {tab === "fba"    && <FbaCalculator />}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-800 py-4 px-5 flex items-center justify-between text-xs text-gray-700">
        <span>FbaLens © {new Date().getFullYear()}</span>
        <span>Données simulées — Jungle Scout disponible au lancement</span>
        <Link href="/" className="hover:text-gray-500 transition-colors">
          ← Accueil
        </Link>
      </footer>
    </div>
  );
}
