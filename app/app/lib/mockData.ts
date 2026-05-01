import { scoreIntent } from "./intentScore";

export type Competition = "Faible" | "Moyenne" | "Élevée";
export type Trend = "up" | "down" | "stable";

export type KeywordRow = {
  keyword: string;
  volume: number;
  cpc: number;
  competition: Competition;
  trend: Trend;
  intent: ReturnType<typeof scoreIntent>;
  avgReviews: number;
  avgBsr: number;
  avgPrice: number;
  avgSales: number;
};

const SEEDS = [
  (b: string) => b,
  (b: string) => `${b} pas cher`,
  (b: string) => `meilleur ${b}`,
  (b: string) => `${b} avis`,
  (b: string) => `acheter ${b}`,
  (b: string) => `${b} comparatif`,
  (b: string) => `comment choisir ${b}`,
  (b: string) => `${b} 2024`,
  (b: string) => `${b} professionnel`,
  (b: string) => `${b} sans fil`,
];

function rng(seed: string, offset = 0): number {
  let h = offset * 2654435761;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  return ((h >>> 0) / 0xffffffff);
}

function pick<T>(arr: T[], seed: string, offset: number): T {
  return arr[Math.floor(rng(seed, offset) * arr.length)];
}

export function generateKeywords(query: string): KeywordRow[] {
  const base = query.trim().toLowerCase();
  return SEEDS.map((fn, i) => {
    const kw = fn(base);
    const r = (off: number) => rng(kw, off);

    const volume = Math.round((r(1) * 90 + 10) * 1000);
    const cpc = parseFloat((r(2) * 2.8 + 0.15).toFixed(2));
    const competition = pick<Competition>(["Faible", "Moyenne", "Élevée"], kw, 3);
    const trend = pick<Trend>(["up", "down", "stable"], kw, 4);
    const avgReviews = Math.round(r(5) * 3500 + 50);
    const avgBsr = Math.round(r(6) * 90000 + 500);
    const avgPrice = parseFloat((r(7) * 80 + 8).toFixed(2));
    const avgSales = Math.round(r(8) * 900 + 30);
    const intent = scoreIntent(kw);

    return { keyword: kw, volume, cpc, competition, trend, intent, avgReviews, avgBsr, avgPrice, avgSales };
  });
}
