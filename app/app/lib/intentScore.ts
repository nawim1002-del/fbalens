/**
 * Scoring d'intention d'achat sur 25 points.
 *
 * Règle clé : une requête produit spécifique sans mot informatif
 * ("réveil simulateur d'aube") score au maximum même sans "acheter".
 * C'est un acheteur qui sait exactement ce qu'il veut.
 */
export type IntentLabel = "Très élevée" | "Élevée" | "Modérée" | "Faible" | "Informationnelle";

export type IntentResult = {
  score: number;      // 0-25
  label: IntentLabel;
  color: string;      // tailwind text color class
  bgColor: string;    // tailwind bg color class
};

const INFO_PATTERN =
  /\b(comment|pourquoi|qu['']est[\s-]ce|c['']est quoi|définition|signification|tutoriel|tuto|guide|expliquer|différence entre)\b/i;

const BUY_PATTERN =
  /\b(acheter|commander|prix|pas cher|bon marché|promo|promotion|soldes|offre|livraison|discount|meilleur prix)\b/i;

const ACTION_VERB_PATTERN =
  /\b(choisir|trouver|voir|comprendre|utiliser|tester|comparer|évaluer|réparer|installer)\b/i;

const SPEC_PATTERN =
  /\d+\s*(kg|g|cm|mm|mah|w|v|l|ml|pouces?|")|sans[\s-]fil|rechargeable|bluetooth|wifi|usb[\s-]?c|led|4k|hd\b/i;

export function scoreIntent(keyword: string): IntentResult {
  const kw = keyword.toLowerCase().trim();
  const words = kw.split(/\s+/).filter(Boolean);
  let score = 0;

  const isInfo = INFO_PATTERN.test(kw);
  const hasBuy = BUY_PATTERN.test(kw);
  const hasActionVerb = ACTION_VERB_PATTERN.test(kw);
  const hasSpec = SPEC_PATTERN.test(kw);

  // ── Pénalité informationnelle ─────────────────────────────────
  if (isInfo) score -= 12;

  // ── Spécificité (longueur de la requête) ──────────────────────
  if (words.length >= 3) score += 10;
  else if (words.length === 2) score += 5;
  // 1 mot = 0 pts de spécificité

  // ── Pas de contexte informationnel → intention produit ────────
  if (!isInfo) score += 8;

  // ── Syntagme nominal pur (requête produit sans verbe) ─────────
  // "réveil simulateur d'aube" = 10 + 8 + 7 = 25 ✓
  if (!isInfo && !hasActionVerb && !hasBuy) score += 7;

  // ── Signal d'achat explicite ──────────────────────────────────
  if (hasBuy) score += 5;

  // ── Spécification technique / niche ──────────────────────────
  if (hasSpec) score += 3;

  const final = Math.max(0, Math.min(25, score));

  if (final >= 23) return { score: final, label: "Très élevée", color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/30" };
  if (final >= 17) return { score: final, label: "Élevée",      color: "text-green-400",   bgColor: "bg-green-500/10 border-green-500/30" };
  if (final >= 11) return { score: final, label: "Modérée",     color: "text-yellow-400",  bgColor: "bg-yellow-500/10 border-yellow-500/30" };
  if (final >= 5)  return { score: final, label: "Faible",      color: "text-orange-400",  bgColor: "bg-orange-500/10 border-orange-500/30" };
  return             { score: final, label: "Informationnelle", color: "text-red-400",    bgColor: "bg-red-500/10 border-red-500/30" };
}
