// app/api/defeitos/diagnose/route.ts
import { NextResponse } from "next/server";
import { getDefeitosCache } from "@/core/defeitos/defeitosCache";

/* ------------------ HELPERS ------------------ */
function resolveCategoria(issues: string[]): string {
  const s = issues.join(" ").toLowerCase();

  if (s.includes("respons")) return "responsabilidades";
  if (s.includes("falha")) return "falhas";
  if (s.includes("modelo") || s.includes("produto") || s.includes("código"))
    return "modelos";
  if (s.includes("índice") || s.includes("indice")) return "naoMostrar";

  return "outros";
}

/* ------------------ CACHE ------------------ */
const DIAG_CACHE = new Map<string, { ts: number; data: any }>();
const DIAG_TTL = 1000 * 60 * 2; // 2 minutos

// =================================================
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const fonteParam = (url.searchParams.get("fonte") || "todas").toLowerCase();

    /* --------------------------------------------------
       De-Para oficial de fontes
    -------------------------------------------------- */
    const sourceMap: Record<string, string> = {
      "produto acabado": "produto",
      produto: "produto",
      af: "af",
      lcm: "lcm",
      pth: "pth",
    };

    const realCacheKey = sourceMap[fonteParam] || fonteParam;
    const cacheKey = `diag_v14:${realCacheKey}`;

    const cached = DIAG_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.ts < DIAG_TTL) {
      return NextResponse.json({ ok: true, cached: true, ...cached.data });
    }

    /* --------------------------------------------------
       Sempre usa defeitos enriquecidos COMPLETOS
    -------------------------------------------------- */
    const cache = await getDefeitosCache({
      usarCodigos: true,
      usarFalhas: true,
      usarResponsabilidades: true,
    });

    const lista =
      fonteParam === "todas"
        ? cache.enriched
        : (cache as any)[realCacheKey] ?? [];

    const problemItems = lista.filter(
      (r: any) => Array.isArray(r._issues) && r._issues.length > 0
    );

    /* --------------------------------------------------
       AGRUPAMENTO (SEM FILTRO)
    -------------------------------------------------- */
    const groups = new Map<string, any>();

    for (const item of problemItems) {
      const categoria = resolveCategoria(item._issues);

      const m = item.MODELO || "N/A";
      const f = item["CÓDIGO DA FALHA"] || "N/A";
      const r = item["CÓDIGO DO FORNECEDOR"] || "N/A";

      const fonte = String(item.fonte || "").toLowerCase();

      const key = `${fonte}|${categoria}|${m}|${f}|${r}`;

      if (!groups.has(key)) {
        groups.set(key, {
          fonte,                 // 🔑 frontend filtra por isso
          categoria,
          modelo: m,
          falha: f,
          resp: r,
          issues: new Set<string>(),
          count: 0,
        });
      }

      const g = groups.get(key);
      g.count++;
      item._issues.forEach((i: string) => g.issues.add(i));
    }

    /* --------------------------------------------------
       NORMALIZAÇÃO PARA O FRONTEND
    -------------------------------------------------- */
    const diagnosisList = Array.from(groups.values()).map((g) => ({
      categoria: g.categoria,
      fonte: g.fonte,
      modelo: g.modelo,
      falha: g.falha,
      resp: g.resp,
      count: g.count,
      issues: Array.from(g.issues), // 🔑 frontend usa isso direto
      severity: g.count > 10 ? "high" : "medium",
    }));

    diagnosisList.sort((a, b) => b.count - a.count);

    const payload = {
      items: diagnosisList.slice(0, 20),
    };

    DIAG_CACHE.set(cacheKey, { ts: Date.now(), data: payload });

    return NextResponse.json({ ok: true, ...payload });
  } catch (err: any) {
    console.error("DIAG ERROR:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}