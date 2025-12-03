// app/api/defeitos/stats/route.ts
import { NextResponse } from "next/server";
import { getDefeitosCache } from "@/core/defeitos/defeitosCache";

type CatalogosFlags = {
  usarCodigos?: boolean;
  usarFalhas?: boolean;
  usarResponsabilidades?: boolean;
};

// Classificador que transforma textos de erros em categorias
function issueCategoryKey(issue: string) {
  const s = String(issue || "").toLowerCase();

  if (s.includes("modelo")) return "modelos";
  if (s.includes("falha")) return "falhas";
  if (s.includes("respons")) return "responsabilidades";
  if (s.includes("índice") || s.includes("indice")) return "naoMostrar";

  // fallback
  if (s.includes("codigo") && !s.includes("falha")) return "modelos";
  return "outros";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const fonte = (url.searchParams.get("fonte") || "todas").toUpperCase();

    const catalogosRaw = url.searchParams.get("catalogos") || "";
    const catalogos: CatalogosFlags = {
      usarCodigos: catalogosRaw.includes("modelos"),
      usarFalhas: catalogosRaw.includes("falhas"),
      usarResponsabilidades: catalogosRaw.includes("responsabilidades")
    };

    // ⚡ Pega TUDO do cache enriquecido
    const cache = await getDefeitosCache(catalogos);

    // Seleção da fonte
    const lista =
      fonte === "TODAS"
        ? cache.enriched
        : (cache as any)[fonte.toLowerCase()] ?? [];

    const totalItems = lista.length;

    const totalDefeitos = lista.reduce((acc, r) => {
      const v = Number(r["QUANTIDADE"] ?? r.QUANTIDADE ?? r["Quantidade"] ?? 0);
      return acc + (isFinite(v) ? v : 0);
    }, 0);

    const identified = lista.filter(r => (r._issues || []).length === 0).length;
    const notIdentified = totalItems - identified;
    const percentIdentified = totalItems
      ? Number(((identified / totalItems) * 100).toFixed(2))
      : 0;

    // =====================================================
    // 🔥 DETALHAMENTO DOS ERROS
    // =====================================================

    const notIdentifiedBreakdown = {
      modelos: 0,
      falhas: 0,
      responsabilidades: 0,
      naoMostrar: 0,
      outros: 0
    };

    const examplesLimit = 20;

    const issuesSummary: Record<
      string,
      { count: number; examples: any[] }
    > = {
      modelos: { count: 0, examples: [] },
      falhas: { count: 0, examples: [] },
      responsabilidades: { count: 0, examples: [] },
      naoMostrar: { count: 0, examples: [] },
      outros: { count: 0, examples: [] }
    };

    const divergencias: Record<string, number> = {};

    for (const r of lista) {
      const issues = r._issues || [];

      // Divergências totais
      for (const issue of issues) {
        divergencias[issue] = (divergencias[issue] || 0) + 1;
      }

      if (issues.length === 0) continue;

      // classificar categorias
      const cats = new Set<string>();
      for (const issue of issues) {
        const cat = issueCategoryKey(issue);
        cats.add(cat);
      }

      for (const c of cats) {
        notIdentifiedBreakdown[c]++;
        issuesSummary[c].count++;

        if (issuesSummary[c].examples.length < examplesLimit) {
          issuesSummary[c].examples.push({
            fonte: r.fonte,
            MODELO: r.MODELO ?? null,
            CODIGO_DA_FALHA: r["CÓDIGO DA FALHA"] ?? null,
            QUANTIDADE: r["QUANTIDADE"] ?? 0,
            _issues: r._issues,
            _confidence: r._confidence
          });
        }
      }
    }

    // =====================================================
    // 🔥 MÉTRICAS POR BASE
    // =====================================================

    function computeBaseMetrics(arr: any[]) {
      const total = arr.length;
      const totalDef = arr.reduce((a, b) => {
        const v = Number(b["QUANTIDADE"] ?? b.QUANTIDADE ?? 0);
        return a + (isFinite(v) ? v : 0);
      }, 0);

      const ident = arr.filter(r => (r._issues || []).length === 0).length;

      const avgConf = total
        ? Number(
            (
              arr.reduce((a, b) => a + (Number(b._confidence) || 0), 0) /
              total
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
        avgConfidence: avgConf
      };
    }

    const perBase = {
      af: computeBaseMetrics(cache.af),
      lcm: computeBaseMetrics(cache.lcm),
      produto: computeBaseMetrics(cache.produto),
      pth: computeBaseMetrics(cache.pth)
    };

    const heatmapConf = {
      af: perBase.af.avgConfidence,
      lcm: perBase.lcm.avgConfidence,
      produto: perBase.produto.avgConfidence,
      pth: perBase.pth.avgConfidence
    };

    // confiança média global
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

    // =====================================================
    // 🔥 RESPOSTA FINAL COMPLETA
    // =====================================================

    return NextResponse.json({
      ok: true,

      // totals
      totalItems,
      totalDefeitos,
      identified,
      notIdentified,
      percentIdentified,

      // detalhamento
      notIdentifiedBreakdown,
      issuesSummary,
      divergencias,

      // por base
      perBase,
      heatmapConf,

      // geral
      avgConfidenceTotal
    });

  } catch (err: any) {
    console.error("stats error", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}