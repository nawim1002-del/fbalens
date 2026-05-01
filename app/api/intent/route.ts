import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { keywords } = await req.json() as { keywords: string[] };

  if (!Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json({ error: "keywords required" }, { status: 400 });
  }

  const keywordList = keywords.map((k, i) => `${i + 1}. ${k}`).join("\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2048,
    system: [
      {
        type: "text",
        text: `Tu es un expert en e-commerce Amazon.fr. Pour chaque mot-clé donné, analyse l'intention d'achat et réponds UNIQUEMENT en JSON valide.

Règles de scoring :
- 25 : mot-clé désigne UN SEUL produit précis (ex: "réveil simulateur d'aube" = oui, c'est un seul produit)
- 15 : globalement clair mais légèrement générique
- 10 : ambigu mais orienté produit
- 0 : totalement ambigu, plusieurs catégories possibles (ex: "support", "brosse" seuls)

Format de réponse — tableau JSON :
[
  {
    "keyword": "...",
    "score": 0 ou 10 ou 15 ou 25,
    "verdict": "Net" ou "Ambigu",
    "raisonnement": "explication courte en 1 phrase",
    "produit_identifie": "nom du produit précis ou vide si ambigu"
  }
]`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Analyse ces ${keywords.length} mots-clés Amazon.fr :\n\n${keywordList}`,
      },
    ],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "";

  // Remove all code fence lines (``` or ```json) wherever they appear
  const cleaned = raw
    .split("\n")
    .filter((line) => !/^\s*```/.test(line))
    .join("\n")
    .trim();

  // Extract first JSON array or object block
  const jsonMatch = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);

  if (!jsonMatch) {
    return NextResponse.json({ error: "no json found", raw }, { status: 500 });
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    // Normalize: if Claude returned a single object, wrap it
    const results = Array.isArray(parsed) ? parsed : [parsed];
    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json({ error: "json parse failed", raw, cleaned }, { status: 500 });
  }
}
