// app/api/defeitos/diagnose/route.ts
import { NextResponse } from "next/server";
import { getDefeitosCache } from "@/core/defeitos/defeitosCache";
import { loadCatalogo } from "@/core/catalogo/catalogoLoader";

/* ------------------ HELPERS ------------------ */
function norm(v: any) {
  return String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
}

function formatPercent(val: number) {
  return (val * 100).toFixed(0) + "%";
}

// Algoritmo de similaridade (Levenshtein)
function getSimilarity(s1: string, s2: string) {
  if (!s1 || !s2) return 0;
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  
  const costs = new Array();
  for (let i = 0; i <= shorter.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= longer.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) 
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[longer.length] = lastValue;
  }
  return (longerLength - costs[longer.length]) / longerLength;
}

// Cache 
const DIAG_CACHE = new Map<string, { ts: number; data: any }>();
const DIAG_TTL = 1000 * 60 * 2; 

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const fonteParam = (url.searchParams.get("fonte") || "todas").toLowerCase();
    const catalogosRaw = url.searchParams.get("catalogos") || "";
    const filterType = url.searchParams.get("filter") || "todos"; 

    // === TRADUTOR DE NOMES ===
    const sourceMap: Record<string, string> = {
        "produto acabado": "produto",
        "produto": "produto",
        "af": "af",
        "lcm": "lcm",
        "pth": "pth"
    };
    
    // Converte "produto acabado" para "produto"
    const realCacheKey = sourceMap[fonteParam] || fonteParam;

    const cacheKey = `diag_v11:${realCacheKey}:${catalogosRaw}:${filterType}`;
    const cached = DIAG_CACHE.get(cacheKey);
    
    if (cached && Date.now() - cached.ts < DIAG_TTL) {
      return NextResponse.json({ ok: true, cached: true, ...cached.data });
    }

    const catalogosFlags = {
      usarCodigos: catalogosRaw.includes("modelos"),
      usarFalhas: catalogosRaw.includes("falhas"),
      usarResponsabilidades: catalogosRaw.includes("responsabilidades")
    };

    const cache = await getDefeitosCache(catalogosFlags); 
    const catalogo = await loadCatalogo();
    
    const refModelos = (catalogo.codigos || []).map((c:any) => ({ val: norm(c["CÓDIGO"] || c["MODELO"]), raw: c["CÓDIGO"] }));
    const refFalhas = (catalogo.falhas || []).map((c:any) => ({ val: norm(c["CÓDIGO DA FALHA"]), desc: norm(c["DESCRIÇÃO DA FALHA"]), raw: c["CÓDIGO DA FALHA"] }));

    // APLICA O MAPA AQUI
    const listaCrua = fonteParam === "todas" 
        ? cache.enriched 
        : (cache as any)[realCacheKey] ?? [];

    let problemItems = listaCrua.filter((r: any) => (r._issues || []).length > 0);

    const groups = new Map<string, any>();

    for (const item of problemItems) {
      const issues = item._issues || [];
      const itemTypes = new Set<string>();
      
      for (const issue of issues) {
        const s = issue.toLowerCase();
        if (s.includes("respons") || s.includes("fornecedor") || s.includes("resp")) itemTypes.add("responsabilidades");
        else if (s.includes("falha")) itemTypes.add("falhas");
        else if (s.includes("índice") || s.includes("indice")) itemTypes.add("naoMostrar");
        else if (s.includes("modelo") || s.includes("produto") || s.includes("código")) itemTypes.add("modelos");
        else itemTypes.add("outros");
      }

      if (filterType !== 'todos') {
         if (!itemTypes.has(filterType)) continue;
      }

      const m = item.MODELO || item.original?.MODELO || "N/A";
      const f = item["CÓDIGO DA FALHA"] || item.original?.["CÓDIGO DA FALHA"] || "N/A";
      const r = item["CÓDIGO DO FORNECEDOR"] || item.original?.["CÓDIGO DO FORNECEDOR"] || "N/A";
      
      const key = `${item.fonte}|${m}|${f}|${r}`;

      if (!groups.has(key)) {
        groups.set(key, { count: 0, sample: item, values: { m, f, r }, rawIssues: issues });
      }
      groups.get(key).count++;
    }

    const diagnosisList = Array.from(groups.values()).map(group => {
      const { m, f, r } = group.values;
      const issuesStr = group.rawIssues.join(" ").toLowerCase();
      
      const analysis = { explicacao: [] as string[], sugestao: [] as string[], severity: "medium" };

      // --- MODELO ---
      if (issuesStr.includes("modelo") || issuesStr.includes("produto") || (issuesStr.includes("código") && !issuesStr.includes("falha") && !issuesStr.includes("fornecedor"))) {
        let best = { score: 0, match: "" };
        if (m.length > 2) {
            for(const ref of refModelos) {
                const sim = getSimilarity(norm(m), ref.val);
                if (sim > best.score) best = { score: sim, match: ref.raw };
                if (sim === 1) break; 
            }
        }
        if (best.score > 0.85) {
            analysis.explicacao.push(`O modelo '${m}' não existe, mas é similar (${formatPercent(best.score)}) a '${best.match}'.`);
            analysis.sugestao.push(`Provável erro de digitação ou sufixo. Validar se o correto é '${best.match}'.`);
        } else {
            analysis.explicacao.push(`O modelo '${m}' não consta no catálogo oficial.`);
            analysis.sugestao.push(`Verificar se é um novo produto ou erro de cadastro.`);
        }
      }

      // --- FALHA ---
      if (issuesStr.includes("falha")) {
        const foundDesc = refFalhas.find(rf => rf.desc === norm(f) || rf.desc.includes(norm(f)) && norm(f).length > 4);
        if (foundDesc) {
            analysis.explicacao.push(`O valor '${f}' parece ser uma descrição textual, não um código.`);
            analysis.sugestao.push(`Substituir pelo código oficial '${foundDesc.raw}'.`);
        } else {
            let best = { score: 0, match: "" };
            if (f.length > 1) {
                for(const ref of refFalhas) {
                    const sim = getSimilarity(norm(f), ref.val);
                    if (sim > best.score) best = { score: sim, match: ref.raw };
                }
            }
            if (best.score > 0.75) {
                analysis.explicacao.push(`Código '${f}' desconhecido. Semelhante a '${best.match}'.`);
                analysis.sugestao.push(`Verificar se houve erro ao digitar '${best.match}'.`);
            } else {
                analysis.explicacao.push(`O código de falha '${f}' não existe no catálogo.`);
                analysis.sugestao.push(`Consultar engenharia sobre este código.`);
            }
        }
      }

      // --- RESPONSABILIDADE ---
      if (issuesStr.includes("respons") || issuesStr.includes("fornecedor") || issuesStr.includes("resp")) {
        if (r.length > 3 && !r.match(/^[A-Z0-9]+$/)) { 
             analysis.explicacao.push(`A responsabilidade '${r}' foi preenchida como texto descritivo.`);
             if (norm(r).includes("CHINA") || norm(r).includes("IMPORTADO")) {
                 analysis.sugestao.push(`Converter ocorrências de '${r}' para o código 'F' (Fornecedor).`);
             } else {
                 analysis.sugestao.push(`Identificar o código correto e padronizar.`);
             }
        } else {
             analysis.explicacao.push(`O código de responsabilidade '${r}' não existe no catálogo.`);
             analysis.sugestao.push(`Revisar se '${r}' é uma sigla interna que precisa ser oficializada.`);
        }
      }

      // --- ÍNDICE ---
      if (issuesStr.includes("índice") || issuesStr.includes("indice")) {
         analysis.explicacao.push("Este registro foi marcado como 'Não Mostrar Índice' pelo catálogo.");
         analysis.sugestao.push("Verificar se este item deveria estar visível nos relatórios.");
      }

      if (analysis.explicacao.length === 0) {
         analysis.explicacao.push(`Erro não classificado: ${group.rawIssues[0]}`);
         analysis.sugestao.push("Verificar consistência deste campo manualmente.");
      }

      return { fonte: group.sample.fonte, count: group.count, modelo: m, falha: f, resp: r, issues: group.rawIssues, explicacao: analysis.explicacao, sugestao: analysis.sugestao, severity: analysis.explicacao.length > 1 ? "high" : "medium", confidence: 0 };
    });

    diagnosisList.sort((a, b) => b.count - a.count);
    const finalResult = diagnosisList.slice(0, 10);
    const payload = { items: finalResult };
    DIAG_CACHE.set(cacheKey, { ts: Date.now(), data: payload });

    return NextResponse.json({ ok: true, ...payload });

  } catch (err: any) {
    console.error("DIAG ERROR:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}