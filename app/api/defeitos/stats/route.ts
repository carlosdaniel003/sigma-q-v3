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
    const fonteParam = (url.searchParams.get("fonte") || "todas").toLowerCase();

    // === 🛠️ TRADUTOR DE NOMES (De-Para) ===
    // O Frontend manda "produto acabado", mas o cache tem "produto".
    const sourceMap: Record<string, string> = {
        "produto acabado": "produto",
        "produto": "produto",
        "af": "af",
        "lcm": "lcm",
        "pth": "pth"
    };

    // Descobre qual a chave real do arquivo
    const realCacheKey = sourceMap[fonteParam] || fonteParam;

    const catalogosRaw = url.searchParams.get("catalogos") || "";
    const catalogos: CatalogosFlags = {
      usarCodigos: catalogosRaw.includes("modelos"),
      usarFalhas: catalogosRaw.includes("falhas"),
      usarResponsabilidades: catalogosRaw.includes("responsabilidades")
    };

    // ⚡ Carrega o cache
    const cache = await getDefeitosCache(catalogos);

    // Seleção da lista (usando a chave traduzida)
    const lista =
      fonteParam === "todas"
        ? cache.enriched
        : (cache as any)[realCacheKey] || []; 

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

    // === DETALHAMENTO ===
    const notIdentifiedBreakdown = { modelos: 0, falhas: 0, responsabilidades: 0, naoMostrar: 0, outros: 0 };
    const issuesSummary: any = { modelos: {count:0, examples:[]}, falhas: {count:0, examples:[]}, responsabilidades: {count:0, examples:[]}, naoMostrar: {count:0, examples:[]}, outros: {count:0, examples:[]} };
    const divergencias: Record<string, number> = {};

    for (const r of lista) {
        const issues = r._issues || [];
        for (const issue of issues) divergencias[issue] = (divergencias[issue] || 0) + 1;
        if (issues.length === 0) continue;
        
        const cats = new Set<string>();
        for (const issue of issues) cats.add(issueCategoryKey(issue));
        
        for (const c of cats) {
            if (notIdentifiedBreakdown[c as keyof typeof notIdentifiedBreakdown] !== undefined) {
                (notIdentifiedBreakdown as any)[c]++;
                issuesSummary[c].count++;
                if (issuesSummary[c].examples.length < 20) {
                    issuesSummary[c].examples.push({ 
                        fonte: r.fonte, 
                        MODELO: r.MODELO, 
                        CODIGO_DA_FALHA: r["CÓDIGO DA FALHA"], 
                        _issues: r._issues, 
                        _confidence: r._confidence 
                    });
                }
            }
        }
    }

    // === KPI POR BASE ===
    function computeBaseMetrics(arr: any[]) {
      const safeArr = arr || [];
      const total = safeArr.length;
      const totalDef = safeArr.reduce((a, b) => a + (Number(b["QUANTIDADE"]||0) || 0), 0);
      const ident = safeArr.filter(r => (r._issues || []).length === 0).length;
      const avgConf = total ? Number((safeArr.reduce((a, b) => a + (Number(b._confidence) || 0), 0) / total).toFixed(4)) : 0;

      return { 
          total, 
          totalDefeitos: totalDef, 
          identified: ident, 
          notIdentified: total - ident, 
          percentIdentified: total ? Number(((ident / total) * 100).toFixed(2)) : 0, 
          avgConfidence: avgConf 
      };
    }

    // AQUI ESTÁ O PULO DO GATO PARA O GRÁFICO FUNCIONAR:
    // Mapeamos a chave "produto acabado" (que o frontend espera)
    // para ler os dados de "cache.produto" (que o arquivo entrega)
    const perBase = {
      af: computeBaseMetrics(cache.af),
      lcm: computeBaseMetrics(cache.lcm),
      "produto acabado": computeBaseMetrics(cache.produto), // <--- TRADUÇÃO AQUI
      pth: computeBaseMetrics(cache.pth)
    };

    const heatmapConf = {
      af: perBase.af.avgConfidence,
      lcm: perBase.lcm.avgConfidence,
      "produto acabado": perBase["produto acabado"].avgConfidence, // <--- TRADUÇÃO AQUI TAMBÉM
      pth: perBase.pth.avgConfidence
    };

    const avgConfidenceTotal = totalItems ? Number((lista.reduce((a, b) => a + (Number(b._confidence) || 0), 0) / totalItems).toFixed(4)) : 0;

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
      avgConfidenceTotal
    });

  } catch (err: any) {
    console.error("stats error", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}