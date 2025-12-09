// src/core/producaomatch.ts
import { getDefeitosCache } from "@/core/defeitos/defeitosCache";

/** normalização (mesma do enrichment) */
export function norm(v: any) {
  return String(v ?? "")
    .normalize?.("NFD")
    .replace?.(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

/** Levenshtein similarity (0..1) */
export function levenshteinSimilarity(a: string, b: string) {
  if (!a || !b) return 0;
  const m = a.length, n = b.length;
  if (m === 0 || n === 0) return 0;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  const dist = dp[m][n];
  return 1 - dist / Math.max(m, n);
}

/** candidato de nomes de campo para produção (tolerante) */
export const PROD_FIELD_CANDIDATES = {
  date: ["DATA", "DATE", "D", "DATA_PRODUCAO"],
  qty: ["QTY_GERAL", "QTY", "QTD", "QUANTIDADE", "QTY_TOTAL", "PRODUCAO"],
  modelo: ["MODELO", "MODEL", "MODELO_PRODUTO", "MODEL_NAME"],
  categoria: ["CATEGORIA", "CATEGORY", "CAT"]
};

/** pega o primeiro field que existir no objeto (candidatos) */
export function getFirstField(obj: any, candidates: string[]) {
  if (!obj) return undefined;
  for (const c of candidates) {
    if (typeof obj[c] !== "undefined") return obj[c];
  }
  return undefined;
}

/**
 * Faz o match de uma única linha de produção contra a base de defeitos (enrichedCache)
 * retorna: { status, matchedModels[], confidence, matchedCount, reason }
 */
export async function matchProductionLine(line: any, defectCache: any) {
  const modeloRaw = getFirstField(line, PROD_FIELD_CANDIDATES.modelo) ?? "";
  const categoriaRaw = getFirstField(line, PROD_FIELD_CANDIDATES.categoria) ?? "";

  const modelo = norm(modeloRaw);
  const categoria = norm(categoriaRaw);

  // escolha da lista de candidatos na base de defeitos (filtra por categoria se possível)
  const pool = (defectCache.enriched || []).filter((d: any) => {
    if (!categoria) return true;
    const cat = norm(d.CATEGORIA ?? d.categoria ?? d._model?.categoria ?? "");
    return !cat || cat === categoria;
  });

  // 1) exact por modelo normalizado
  let matched = pool.filter((d: any) => {
    const m = norm(d.MODELO ?? d._model?.modelo ?? "");
    return m && m === modelo;
  });

  if (matched.length > 0) {
    return {
      status: "exact",
      matchedCount: matched.length,
      matchedModels: Array.from(new Set(matched.map((m: any) => m._model?.codigo ?? m.MODELO ?? ""))).slice(0,5),
      confidence: 1.0,
      reason: "Modelo exato encontrado"
    };
  }

  // 2) substring + categoria
  if (modelo && categoria) {
    matched = pool.filter((d: any) => {
      const m = norm(d.MODELO ?? d._model?.modelo ?? "");
      if (!m) return false;
      // normalize remove spaces to improve substring matches
      const compactA = modelo.replace(/\s+/g, "");
      const compactB = m.replace(/\s+/g, "");
      return compactB.includes(compactA) || compactA.includes(compactB);
    });
    if (matched.length > 0) {
      return {
        status: "partial",
        matchedCount: matched.length,
        matchedModels: Array.from(new Set(matched.map((m: any) => m._model?.codigo ?? m.MODELO ?? ""))).slice(0,5),
        confidence: 0.8,
        reason: "Modelo parcialmente igual (substring) com mesma categoria"
      };
    }
  }

  // 3) fuzzy by modelo
  if (modelo) {
    let bestScore = 0;
    let best: any[] = [];
    for (const d of pool) {
      const m = norm(d.MODELO ?? d._model?.modelo ?? "");
      if (!m) continue;
      const sim = levenshteinSimilarity(modelo, m);
      if (sim > bestScore) {
        bestScore = sim;
        best = [d];
      } else if (sim === bestScore) {
        best.push(d);
      }
    }
    if (bestScore >= 0.65 && best.length > 0) {
      return {
        status: "fuzzy",
        matchedCount: best.length,
        matchedModels: Array.from(new Set(best.map((m: any) => m._model?.codigo ?? m.MODELO ?? ""))).slice(0,5),
        confidence: Number(bestScore.toFixed(3)),
        reason: "Correspondência aproximada por modelo"
      };
    }
  }

  // 4) fallback categoria somente
  if (categoria) {
    const catPool = (defectCache.enriched || []).filter((d: any) => {
      const cat = norm(d.CATEGORIA ?? d.categoria ?? d._model?.categoria ?? "");
      return cat === categoria;
    });
    if (catPool.length > 0) {
      return {
        status: "category",
        matchedCount: catPool.length,
        matchedModels: Array.from(new Set(catPool.map((m: any) => m._model?.codigo ?? m.MODELO ?? ""))).slice(0,5),
        confidence: 0.5,
        reason: "Categoria encontrada, modelo não localizado"
      };
    }
  }

  // none
  return {
    status: "none",
    matchedCount: 0,
    matchedModels: [],
    confidence: 0,
    reason: "Nenhuma correspondência encontrada"
  };
}