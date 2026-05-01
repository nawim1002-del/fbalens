"use client";

import { useState, useMemo } from "react";

// ── Amazon FR referral fees by category ──────────────────────────────────────

const CATEGORIES = [
  { label: "Électronique & Informatique",  fee: 0.08 },
  { label: "Jeux vidéo & Consoles",        fee: 0.08 },
  { label: "Maison, cuisine & jardin",     fee: 0.15 },
  { label: "Sport & Loisirs",              fee: 0.15 },
  { label: "Vêtements & Chaussures",       fee: 0.15 },
  { label: "Beauté & Hygiène",             fee: 0.08 },
  { label: "Santé",                        fee: 0.08 },
  { label: "Jouets & Jeux",               fee: 0.15 },
  { label: "Livres",                       fee: 0.15 },
  { label: "Auto & Moto",                  fee: 0.12 },
  { label: "Bricolage & Outillage",        fee: 0.12 },
  { label: "Animalerie",                   fee: 0.15 },
  { label: "Épicerie & Gourmet",           fee: 0.15 },
  { label: "Musique, Films & Séries",      fee: 0.15 },
  { label: "Autre",                        fee: 0.15 },
] as const;

// ── FBA fulfillment fee tiers (Amazon FR, plan Pro — sans frais 0,99 €/vente) ─

const FBA_TIERS = [
  { label: "Petit standard (≤ 200g)",   maxG: 200,  fee: 2.41 },
  { label: "Standard (200–400g)",       maxG: 400,  fee: 2.55 },
  { label: "Standard (400–900g)",       maxG: 900,  fee: 2.71 },
  { label: "Standard (900g–1,5kg)",     maxG: 1500, fee: 3.20 },
  { label: "Standard (1,5–3kg)",        maxG: 3000, fee: 4.00 },
  { label: "Grand (3–6kg)",             maxG: 6000, fee: 5.50 },
  { label: "Grand (6–12kg)",            maxG: 12000,fee: 7.50 },
  { label: "Très grand (12–30kg)",      maxG: 30000,fee: 11.00 },
] as const;

function getFbaFee(weightG: number): { label: string; fee: number } {
  for (const tier of FBA_TIERS) {
    if (weightG <= tier.maxG) return tier;
  }
  return { label: "> 30kg — contacter Amazon", fee: 15 };
}

// ── helpers ───────────────────────────────────────────────────────────────────

function num(s: string) { return parseFloat(s.replace(",", ".")) || 0; }
function eur(n: number) { return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }); }
function pct(n: number) { return `${n >= 0 ? "+" : ""}${n.toFixed(1)} %`; }

function Stat({
  label, value, sub, color = "text-gray-100",
}: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── component ─────────────────────────────────────────────────────────────────

export default function FbaCalculator() {
  const [price,    setPrice]    = useState("29.99");
  const [cost,     setCost]     = useState("6.00");
  const [weight,   setWeight]   = useState("350");
  const [catIdx,   setCatIdx]   = useState(0);
  const [shipping, setShipping] = useState("1.50");

  const calc = useMemo(() => {
    const salePrice  = num(price);
    const unitCost   = num(cost);
    const inboundShip = num(shipping);
    const weightG    = num(weight);

    if (salePrice <= 0) return null;

    const referralFee = salePrice * CATEGORIES[catIdx].fee;
    const fbaFee      = getFbaFee(weightG).fee;
    const fbaLabel    = getFbaFee(weightG).label;

    const totalFees   = referralFee + fbaFee;
    const totalCost   = unitCost + inboundShip;
    const profit      = salePrice - totalFees - totalCost;
    const margin      = salePrice > 0 ? (profit / salePrice) * 100 : 0;
    const roi         = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    return {
      salePrice, referralFee, fbaFee, fbaLabel,
      totalFees, totalCost, profit, margin, roi,
      catFee: CATEGORIES[catIdx].fee * 100,
    };
  }, [price, cost, weight, catIdx, shipping]);

  const profitColor = calc
    ? calc.profit > 0 ? "text-emerald-400" : "text-red-400"
    : "text-gray-100";

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-calculator text-blue-400" />
          Paramètres du produit
          <span className="text-xs font-normal text-gray-500 ml-1">
            Plan Professionnel Amazon FR — frais 0,99 €/vente non applicables
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InputField
            label="Prix de vente (€)"
            icon="fa-solid fa-tag"
            value={price}
            onChange={setPrice}
            placeholder="29.99"
            hint="Prix affiché sur Amazon"
          />
          <InputField
            label="Coût d'achat (€)"
            icon="fa-solid fa-boxes-stacked"
            value={cost}
            onChange={setCost}
            placeholder="6.00"
            hint="Prix unitaire fournisseur"
          />
          <InputField
            label="Expédition entrante (€)"
            icon="fa-solid fa-truck"
            value={shipping}
            onChange={setShipping}
            placeholder="1.50"
            hint="Envoi vers entrepôt Amazon"
          />
          <InputField
            label="Poids du produit (g)"
            icon="fa-solid fa-weight-scale"
            value={weight}
            onChange={setWeight}
            placeholder="350"
            hint="Poids unitaire emballé"
          />
        </div>

        {/* Catégorie */}
        <div className="mt-4">
          <label className="block text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
            <i className="fa-solid fa-layer-group text-gray-600" />
            Catégorie Amazon
          </label>
          <select
            value={catIdx}
            onChange={(e) => setCatIdx(Number(e.target.value))}
            className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((c, i) => (
              <option key={c.label} value={i}>
                {c.label} — {(c.fee * 100).toFixed(0)} % de frais de référencement
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {calc && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat
              label="Bénéfice net / unité"
              value={eur(calc.profit)}
              color={profitColor}
            />
            <Stat
              label="Marge nette"
              value={pct(calc.margin)}
              color={calc.margin >= 20 ? "text-emerald-400" : calc.margin >= 10 ? "text-yellow-400" : "text-red-400"}
              sub={calc.margin >= 20 ? "Excellente" : calc.margin >= 10 ? "Correcte" : "Insuffisante"}
            />
            <Stat
              label="ROI"
              value={pct(calc.roi)}
              color={calc.roi >= 30 ? "text-emerald-400" : calc.roi >= 15 ? "text-yellow-400" : "text-red-400"}
            />
            <Stat
              label="Total frais Amazon"
              value={eur(calc.totalFees)}
              sub={`${((calc.totalFees / calc.salePrice) * 100).toFixed(1)} % du prix de vente`}
            />
          </div>

          {/* Breakdown */}
          <div className="bg-gray-800/40 border border-gray-700 rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-700 text-sm font-medium text-gray-400 flex items-center gap-2">
              <i className="fa-solid fa-receipt text-blue-400" />
              Décomposition des coûts
            </div>
            <div className="divide-y divide-gray-700/40">
              <BreakdownRow label="Prix de vente"               value={eur(calc.salePrice)} positive />
              <BreakdownRow
                label={`Frais de référencement (${calc.catFee.toFixed(0)} %)`}
                value={`− ${eur(calc.referralFee)}`}
              />
              <BreakdownRow
                label={`Frais FBA — ${calc.fbaLabel}`}
                value={`− ${eur(calc.fbaFee)}`}
              />
              <BreakdownRow label="Coût produit"                value={`− ${eur(num(cost))}`} />
              <BreakdownRow label="Expédition entrante"         value={`− ${eur(num(shipping))}`} />
              <BreakdownRow
                label="Bénéfice net"
                value={eur(calc.profit)}
                bold
                color={calc.profit >= 0 ? "text-emerald-400" : "text-red-400"}
              />
            </div>
          </div>

          {/* Advice */}
          {calc.margin < 15 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-start gap-3 text-sm text-orange-300">
              <i className="fa-solid fa-triangle-exclamation mt-0.5 shrink-0" />
              <span>
                La marge est inférieure à 15 %. Envisagez de négocier le coût fournisseur, de
                réduire le poids/emballage ou d&apos;augmenter le prix de vente.
              </span>
            </div>
          )}
          {calc.profit < 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 text-sm text-red-300">
              <i className="fa-solid fa-circle-xmark mt-0.5 shrink-0" />
              <span>
                Bénéfice négatif — ce produit n&apos;est pas rentable dans ces conditions.
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── micro-components ──────────────────────────────────────────────────────────

function InputField({
  label, icon, value, onChange, placeholder, hint,
}: {
  label: string; icon: string; value: string;
  onChange: (v: string) => void; placeholder: string; hint: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
        <i className={`${icon} text-gray-600`} />
        {label}
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />
      <p className="text-[11px] text-gray-600 mt-1">{hint}</p>
    </div>
  );
}

function BreakdownRow({
  label, value, positive, bold, color,
}: {
  label: string; value: string; positive?: boolean; bold?: boolean; color?: string;
}) {
  return (
    <div className={`flex justify-between items-center px-5 py-3 ${bold ? "bg-gray-900/40" : ""}`}>
      <span className={`text-sm ${bold ? "font-semibold text-gray-200" : "text-gray-400"}`}>
        {label}
      </span>
      <span className={`text-sm font-semibold ${color ?? (positive ? "text-emerald-400" : "text-gray-300")}`}>
        {value}
      </span>
    </div>
  );
}
