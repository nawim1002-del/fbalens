import { NextRequest, NextResponse } from "next/server";

const JS_BASE = "https://developer.junglescout.com/api";
const MARKETPLACE = "fr";

function jsHeaders(): HeadersInit {
  const keyName = process.env.JUNGLE_SCOUT_KEY_NAME;
  const apiKey = process.env.JUNGLE_SCOUT_API_KEY;
  if (!keyName || !apiKey || keyName === "your_key_name_here") {
    throw new Error("JUNGLE_SCOUT_KEY_NAME non configuré dans .env.local");
  }
  return {
    Authorization: `${keyName}:${apiKey}`,
    "X-API-Type": "junglescout",
    Accept: "application/vnd.junglescout.v1+json",
    "Content-Type": "application/vnd.api+json",
  };
}

// Keyword metrics : volume de recherche, tendances, enchères PPC
async function fetchKeywordData(keyword: string) {
  const url = `${JS_BASE}/keywords/keywords_by_keyword_query?marketplace=${MARKETPLACE}&page_size=1`;
  const res = await fetch(url, {
    method: "POST",
    headers: jsHeaders(),
    body: JSON.stringify({
      data: {
        type: "keywords_by_keyword_query",
        attributes: {
          search_terms: keyword,
          categories: [],
        },
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jungle Scout keywords [${res.status}]: ${text}`);
  }
  const json = await res.json();
  const attrs = json?.data?.[0]?.attributes ?? {};
  return {
    searchVolumeExact: (attrs.monthly_search_volume_exact as number) ?? null,
    searchVolumeBroad: (attrs.monthly_search_volume_broad as number) ?? null,
    monthlyTrend: (attrs.monthly_trend as number) ?? null,
    quarterlyTrend: (attrs.quarterly_trend as number) ?? null,
    easeOfRanking: (attrs.ease_of_ranking_score as number) ?? null,
    ppcBidExact: (attrs.ppc_bid_exact as number) ?? null,
    organicProductCount: (attrs.organic_product_count as number) ?? null,
  };
}

// Product database : 10 premiers produits → moyennes ventes, reviews, BSR
async function fetchProductData(keyword: string) {
  const url = `${JS_BASE}/product_database_query?marketplace=${MARKETPLACE}&page_size=10`;
  const res = await fetch(url, {
    method: "POST",
    headers: jsHeaders(),
    body: JSON.stringify({
      data: {
        type: "product_database_query",
        attributes: {
          include_keywords: [keyword],
          categories: [],
          product_tiers: [],
          seller_types: [],
        },
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jungle Scout products [${res.status}]: ${text}`);
  }
  const json = await res.json();
  const products: Array<{ attributes: Record<string, unknown> }> = json?.data ?? [];
  if (products.length === 0) return { avgSales: null, avgReviews: null, avgBsr: null };

  const sum = products.reduce(
    (acc, p) => {
      const a = p.attributes;
      acc.sales += (a.approximate_30_day_units_sold as number) ?? 0;
      acc.reviews += (a.reviews as number) ?? 0;
      acc.bsr += (a.product_rank as number) ?? 0;
      return acc;
    },
    { sales: 0, reviews: 0, bsr: 0 },
  );
  const count = products.length;
  return {
    avgSales: Math.round(sum.sales / count),
    avgReviews: Math.round(sum.reviews / count),
    avgBsr: Math.round(sum.bsr / count),
  };
}

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword")?.trim();
  if (!keyword) {
    return NextResponse.json({ error: "Paramètre keyword manquant" }, { status: 400 });
  }

  try {
    const [kwData, productData] = await Promise.all([
      fetchKeywordData(keyword),
      fetchProductData(keyword),
    ]);
    return NextResponse.json({ keyword, ...kwData, ...productData });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
