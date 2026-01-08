// app/api/defeitos/stats/route.ts
import { NextResponse } from "next/server";
import { getDefeitosCache } from "@/core/defeitos/defeitosCache";

type CatalogosFlags = {
  usarCodigos?: boolean;
  usarFalhas?: boolean;
  usarResponsabilidades?: boolean;
};

// --------------------------------------------------
// Classificador de issues
// --------------------------------------------------
function issueCategoryKey(issue: string) {
  const s = String(issue || "").toLowerCase();
  if (s.includes("modelo")) return "modelos";
  if (s.includes("falha")) return "falhas";
  if (s.includes("respons")) return "responsabilidades";
  if (s.includes("índice") || s.includes("indice")) return "naoMostrar";
  if (s.includes("codigo") && !s.includes("falha")) return "modelos";
  return "outros";
}

// --------------------------------------------------
// REGRA OFICIAL DO SIGMA-Q (A QUE FUNCIONAVA)
// Identificado ⇔ NÃO EXISTEM ISSUES
// --------------------------------------------------
function isIdentified(r: any): boolean {
  return Array.isArray(r._issues) && r._issues.length === 0;
}

// --------------------------------------------------
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const fonteParam = (url.searchParams.get("fonte") || "todas").toLowerCase();

    // 🔁 De-Para de nomes (frontend x backend)
    const sourceMap: Record<string, string> = {
      "produto acabado": "produto",
      produto: "produto",
      af: "af",
      lcm: "lcm",
      pth: "pth",
    };

    const realCacheKey = sourceMap[fonteParam] || fonteParam;

    const catalogosRaw = url.searchParams.get("catalogos") || "";
    const catalogos: CatalogosFlags = {
      usarCodigos: catalogosRaw.includes("modelos"),
      usarFalhas: catalogosRaw.includes("falhas"),
      usarResponsabilidades: catalogosRaw.includes("responsabilidades"),
    };

    // ==================================================
    // 🔒 BLOQUEIO ABSOLUTO — KPI SEM ENRIQUECIMENTO NÃO EXISTE
    // ==================================================
    if (
      !catalogos.usarCodigos &&
      !catalogos.usarFalhas &&
      !catalogos.usarResponsabilidades
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "KPI inválido: nenhuma regra de validação ativa.",
          hint:
            "Use catalogos=modelos,falhas,responsabilidades para gerar KPI.",
        },
        { status: 400 }
      );
    }

    // ⚡ Cache sempre alinhado às flags
    const cache = await getDefeitosCache(catalogos);

    const lista =
      fonteParam === "todas"
        ? cache.enriched
        : (cache as any)[realCacheKey] || [];

    const totalItems = lista.length;

    const totalDefeitos = lista.reduce((acc, r) => {
      const v = Number(r["QUANTIDADE"] ?? r.QUANTIDADE ?? 0);
      return acc + (isFinite(v) ? v : 0);
    }, 0);

    // ==================================================
    // KPI CENTRAL (REGRA CORRETA)
    // ==================================================
    const identified = lista.filter(isIdentified).length;
    const notIdentified = totalItems - identified;

    const percentIdentified = totalItems
      ? Number(((identified / totalItems) * 100).toFixed(2))
      : 0;

    // --------------------------------------------------
    // Breakdown de não identificados
    // --------------------------------------------------
    const notIdentifiedBreakdown = {
      modelos: 0,
      falhas: 0,
      responsabilidades: 0,
      naoMostrar: 0,
      outros: 0,
    };

    const issuesSummary: any = {
      modelos: { count: 0, examples: [] },
      falhas: { count: 0, examples: [] },
      responsabilidades: { count: 0, examples: [] },
      naoMostrar: { count: 0, examples: [] },
      outros: { count: 0, examples: [] },
    };

    const divergencias: Record<string, number> = {};

    for (const r of lista) {
      if (isIdentified(r)) continue;

      const issues = r._issues || [];
      const cats = new Set<string>();

      for (const issue of issues) {
        divergencias[issue] = (divergencias[issue] || 0) + 1;
        cats.add(issueCategoryKey(issue));
      }

      if (cats.size === 0) {
        notIdentifiedBreakdown.outros++;
        continue;
      }

      for (const c of cats) {
        if (c in notIdentifiedBreakdown) {
          (notIdentifiedBreakdown as any)[c]++;
          issuesSummary[c].count++;

          if (issuesSummary[c].examples.length < 20) {
            issuesSummary[c].examples.push({
              fonte: r.fonte,
              MODELO: r.MODELO,
              CODIGO_DA_FALHA: r["CÓDIGO DA FALHA"],
              _issues: r._issues,
              _confidence: r._confidence,
            });
          }
        }
      }
    }

    // --------------------------------------------------
    // KPI por base
    // --------------------------------------------------
    function computeBaseMetrics(arr: any[]) {
      const safeArr = arr || [];
      const total = safeArr.length;

      const totalDef = safeArr.reduce(
        (a, b) => a + (Number(b["QUANTIDADE"]) || 0),
        0
      );

      const ident = safeArr.filter(isIdentified).length;

      const avgConf = total
        ? Number(
            (
              safeArr.reduce(
                (a, b) => a + (Number(b._confidence) || 0),
                0
              ) / total
            ).toFixed(4)
          )
        : 0;

      return {
        total,
        totalDefeitos: totalDef,
        identified: ident,
        notIdentified: total - ident,
        percentIdentified: total
          ? Number(((ident / total) * 100).toFixed(2))
          : 0,
        avgConfidence: avgConf,
      };
    }

    const perBase = {
      af: computeBaseMetrics(cache.af),
      lcm: computeBaseMetrics(cache.lcm),
      "produto acabado": computeBaseMetrics(cache.produto),
      pth: computeBaseMetrics(cache.pth),
    };

    const heatmapConf = {
      af: perBase.af.avgConfidence,
      lcm: perBase.lcm.avgConfidence,
      "produto acabado": perBase["produto acabado"].avgConfidence,
      pth: perBase.pth.avgConfidence,
    };

    const avgConfidenceTotal = totalItems
      ? Number(
          (
            lista.reduce(
              (a, b) => a + (Number(b._confidence) || 0),
              0
            ) / totalItems
          ).toFixed(4)
        )
      : 0;

    return NextResponse.json({
      ok: true,
      totalItems,
      totalDefeitos,
      identified,
      notIdentified,
      percentIdentified,
      notIdentifiedBreakdown,
      issuesSummary,
      divergencias,
      perBase,
      heatmapConf,
      avgConfidenceTotal,
    });
  } catch (err: any) {
    console.error("stats error", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}