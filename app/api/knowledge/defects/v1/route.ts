import { NextResponse } from "next/server";
import { loadCatalogo } from "@/core/catalogo/catalogoLoader";
import { enrichDefeito } from "@/core/defeitos/defeitosEnrichment";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const items = body.items || [];
    const opts = body.options || {
      usarCodigos: true,
      usarFalhas: true,
      usarResponsabilidades: true,
    };

    // 🔹 Conhecimento base (catálogo oficial)
    const catalogo = await loadCatalogo();

    const enriched = [];

    for (const raw of items) {
      const result = await enrichDefeito(raw, opts, catalogo);
      enriched.push(result);
    }

    return NextResponse.json({
      ok: true,
      knowledge: {
        domain: "defects",
        version: "v1",
      },
      count: enriched.length,
      enriched,
    });
  } catch (err) {
    console.error("KNOWLEDGE DEFECTS v1 ERROR:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}