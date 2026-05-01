import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es un expert en e-commerce Amazon. Pour chaque mot-clé Amazon.fr, score l'intention d'achat sur une échelle à 4 niveaux :

- 25 : Intention très élevée — requête produit spécifique sans contexte informationnel (ex: "réveil simulateur d'aube", "aspirateur sans fil dyson v15")
- 15 : Intention élevée — signaux d'achat explicites ou requête avec spécification (ex: "acheter réveil", "casque bluetooth pas cher", "machine café grain 2024")
- 10 : Intention modérée — comparatif ou sélection (ex: "meilleur réveil", "comparatif aspirateur", "choisir machine café")
- 0 : Intention faible/informationnelle — question, tutoriel, définition (ex: "comment fonctionne un réveil", "avis réveil simulateur", "réveil simulateur d'aube explication")

Règle clé : une requête produit spécifique sans verbe informatif ni mot comme "avis/comparatif/comment" score TOUJOURS 25, même sans "acheter".

Réponds UNIQUEMENT en JSON valide, tableau d'objets :
[{"keyword": "...", "score": 25, "reason": "explication courte en français (max 8 mots)"}]`;

export async function POST(req: NextRequest) {
  const { keywords } = await req.json() as { keywords: string[] };

  if (!Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json({ error: "keywords required" }, { status: 400 });
  }

  const userMessage = `Score ces ${keywords.length} mots-clés :\n${keywords.map((k, i) => `${i + 1}. ${k}`).join("\n")}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "";

  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "invalid Claude response", raw }, { status: 500 });
  }

  const results = JSON.parse(jsonMatch[0]);
  return NextResponse.json(results);
}
