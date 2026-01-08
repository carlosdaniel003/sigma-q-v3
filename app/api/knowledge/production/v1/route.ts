import { NextResponse } from "next/server";

/**
 * Knowledge API — Production v1
 * Junta: Produção + Defeitos + Catálogo
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const productionItems = body.items || [];
    const options = body.options || {};

    // 1️⃣ Chama conhecimento de defeitos
    const defectsRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/knowledge/defects/v1`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: productionItems,
          options,
        }),
      }
    );

    const defectsKnowledge = await defectsRes.json();

    if (!defectsKnowledge.ok) {
      throw new Error("Defects knowledge failed");
    }

    // 2️⃣ Aplica regras de produção
    const enrichedProduction = defectsKnowledge.enriched.map(
      (item: any) => {
        const quantidade = Number(item?.original?.quantidade || 0);
        const defeitos = Number(item?.original?.defeitos || 0);

        const ppm =
          quantidade > 0 ? Math.round((defeitos / quantidade) * 1_000_000) : 0;

        return {
          ...item,
          production: {
            quantidade,
            defeitos,
            ppm,
            status: ppm > 1000 ? "CRITICO" : "OK",
          },
        };
      }
    );

    return NextResponse.json({
      ok: true,
      knowledge: {
        domain: "production",
        version: "v1",
        uses: ["defects:v1"],
      },
      count: enrichedProduction.length,
      enriched: enrichedProduction,
    });
  } catch (err) {
    console.error("KNOWLEDGE PRODUCTION v1 ERROR:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}