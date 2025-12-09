import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import * as XLSX from "xlsx";
import { getDefeitosCache } from "@/core/defeitos/defeitosCache";

/** normalize */
function norm(v: any) {
  return String(v ?? "")
    .normalize?.("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

/** Levenshtein similarity (0..1) */
function levenshteinSimilarity(a: string, b: string) {
  if (!a || !b) return 0;
  const m = a.length, n = b.length;
  if (m === 0 || n === 0) return 0;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  const dist = dp[m][n];
  return 1 - dist / Math.max(m, n);
}

/**
 * Explicador Inteligente
 */
function explainMismatch(prod: any, defeitosLista: any[]) {
  const modelo = prod.MODELO;
  const categoria = norm(prod.CATEGORIA || "");

  const modeloDefeitos = defeitosLista.map(
    (d) => norm(d.MODELO ?? d._model?.modelo ?? "")
  );

  const existsExact = modeloDefeitos.includes(modelo);
  if (!existsExact) {
    let best = { score: 0, candidato: null as any };
    const unicos = Array.from(new Set(modeloDefeitos));

    for (const nome of unicos) {
      const score = levenshteinSimilarity(modelo, nome);
      if (score > best.score) best = { score, candidato: nome };
    }

    if (best.score < 0.45) {
      return {
        motivo: "MODELO_INEXISTENTE",
        explicacao: `O modelo "${modelo}" não aparece na base de defeitos e nenhum modelo semelhante foi encontrado (similaridade ${best.score.toFixed(
          2
        )}).`
      };
    }

    return {
      motivo: "NOME_DIVERGENTE",
      explicacao: `O modelo "${modelo}" não existe na base oficial, mas existe o semelhante "${best.candidato}" (similaridade ${best.score.toFixed(
        2
      )}) abaixo do mínimo requerido (0.75).`
    };
  }

  const existeObj = defeitosLista.find(
    (d) => norm(d.MODELO ?? d._model?.modelo ?? "") === modelo
  );
  const categoriaDef = norm(existeObj?.CATEGORIA ?? existeObj?._model?.categoria ?? "");

  if (categoria && categoriaDef && categoria !== categoriaDef) {
    return {
      motivo: "CATEGORIA_DIVERGENTE",
      explicacao: `O modelo "${modelo}" existe na base oficial mas está cadastrado como categoria "${categoriaDef}" enquanto a produção informou "${categoria}".`
    };
  }

  return {
    motivo: "SEM_DEFEITOS",
    explicacao: `O modelo "${modelo}" foi produzido (${prod.QTY_GERAL} unidades), mas nenhum defeito foi registrado para ele.`
  };
}

/** Carrega planilha de produção */
async function readProductionDefault(filename = "producao.xlsx") {
  const p = path.join(process.cwd(), "public", "productions", filename);
  const buf = await fs.readFile(p);
  const wb = XLSX.read(buf, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet) as Array<any>;
}

/**
 * ROTA PRINCIPAL
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const file = url.searchParams.get("file") || "producao.xlsx";

    // 1) Carrega defeitos enriquecidos
    const cache = await getDefeitosCache({});
    const listaDef = cache.enriched || [];

    // 2) Índices rápidos
    const indexByModel = new Map<string, any[]>();
    const indexByCodigo = new Map<string, any[]>();

    for (const r of listaDef) {
      const modelo = norm(r.MODELO ?? r._model?.modelo ?? "");
      const codigo = norm(r.CÓDIGO ?? r._model?.codigo ?? "");

      if (modelo) indexByModel.set(modelo, [...(indexByModel.get(modelo) || []), r]);
      if (codigo) indexByCodigo.set(codigo, [...(indexByCodigo.get(codigo) || []), r]);
    }

    // 3) Carrega produção
    const prodRaw = await readProductionDefault(file);

    const rows = prodRaw.map((r, idx) => ({
      __row: idx,
      raw: r,
      DATA: r.DATA ?? r.Date ?? null,
      QTY_GERAL: Number(r.QTY_GERAL ?? r.QTY ?? r.QUANTIDADE ?? 0) || 0,
      MODELO: norm(r.MODELO ?? r.MODEL ?? ""),
      CATEGORIA: String(r.CATEGORIA ?? r.CATEG ?? r.CATEGORY ?? "").trim()
    }));

    const totalRows = rows.length;
    const totalVolume = rows.reduce((s, r) => s + (r.QTY_GERAL || 0), 0);

    // 4) Acumuladores — agora TIPADOS (soluciona o erro)
    const categories: Map<
      string,
      {
        rows: number;
        volume: number;
        identifiedRows: number;
        identifiedVolume: number;
        notIdentifiedRows: number;
        notIdentifiedVolume: number;
        models: Map<
          string,
          {
            identifiedRows: number;
            notIdentifiedRows: number;
            identifiedVolume: number;
            notIdentifiedVolume: number;
          }
        >;
      }
    > = new Map();

    const notIdentifiedExamplesByModel: Map<
      string,
      { count: number; samples: any[]; explicacoes: any[] }
    > = new Map();

    function ensureCat(cat: string) {
      if (!categories.has(cat)) {
        categories.set(cat, {
          rows: 0,
          volume: 0,
          identifiedRows: 0,
          identifiedVolume: 0,
          notIdentifiedRows: 0,
          notIdentifiedVolume: 0,
          models: new Map()
        });
      }
      return categories.get(cat)!;
    }

    // 5) Loop de matching
    for (const r of rows) {
      const cat = ensureCat(r.CATEGORIA || "UNDEF");
      cat.rows++;
      cat.volume += r.QTY_GERAL || 0;

      let matched = false;
      const codigoTry = r.MODELO;

      if (codigoTry && indexByCodigo.has(codigoTry)) matched = true;
      if (!matched && indexByModel.has(r.MODELO)) matched = true;

      let bestModelKey = "";
      let bestScore = 0;

      if (!matched && r.MODELO) {
        for (const m of indexByModel.keys()) {
          const sim = levenshteinSimilarity(r.MODELO, m);
          if (sim > bestScore) {
            bestScore = sim;
            bestModelKey = m;
          }
        }
        if (bestScore > 0.75) matched = true;
      }

      if (matched) {
        cat.identifiedRows++;
        cat.identifiedVolume += r.QTY_GERAL || 0;

        const mk = bestModelKey || r.MODELO || codigoTry || "UNKNOWN";
        const m = cat.models.get(mk) || {
          identifiedRows: 0, notIdentifiedRows: 0, identifiedVolume: 0, notIdentifiedVolume: 0
        };

        m.identifiedRows++;
        m.identifiedVolume += r.QTY_GERAL || 0;

        cat.models.set(mk, m);
      } 
      else {
        cat.notIdentifiedRows++;
        cat.notIdentifiedVolume += r.QTY_GERAL || 0;

        const mk = r.MODELO || "UNKNOWN";
        const m = cat.models.get(mk) || {
          identifiedRows: 0, notIdentifiedRows: 0, identifiedVolume: 0, notIdentifiedVolume: 0
        };

        m.notIdentifiedRows++;
        m.notIdentifiedVolume += r.QTY_GERAL || 0;

        cat.models.set(mk, m);

        const prev = notIdentifiedExamplesByModel.get(mk) || { count: 0, samples: [], explicacoes: [] };
        prev.count++;
        if (prev.samples.length < 5) prev.samples.push(r.raw);

        if (prev.explicacoes.length < 1) {
          prev.explicacoes.push(explainMismatch(r, listaDef));
        }

        notIdentifiedExamplesByModel.set(mk, prev);
      }
    }

    // 6) Construir diagnóstico inteligente
    const defeitosPorModelo = new Map<string, number>();
    for (const d of listaDef) {
      const m = norm(d.MODELO ?? d._model?.modelo ?? "");
      if (!m) continue;
      defeitosPorModelo.set(m, (defeitosPorModelo.get(m) || 0) + 1);
    }

    const producaoPorModelo = new Map<string, any>();
    for (const r of rows) {
      if (!r.MODELO) continue;
      const obj = producaoPorModelo.get(r.MODELO) || { categoria: r.CATEGORIA, volume: 0 };
      obj.volume += r.QTY_GERAL || 0;
      producaoPorModelo.set(r.MODELO, obj);
    }

    const producaoSemDefeitos = [];
    for (const [modelo, info] of producaoPorModelo.entries()) {
      if (!defeitosPorModelo.has(modelo)) {
        producaoSemDefeitos.push({
          modelo,
          categoria: info.categoria,
          produzido: info.volume
        });
      }
    }

    const defeitosSemProducao = [];
    for (const [modelo, qtd] of defeitosPorModelo.entries()) {
      if (!producaoPorModelo.has(modelo)) {
        defeitosSemProducao.push({
          modelo,
          ocorrenciasDefeitos: qtd
        });
      }
    }

    const divergencias = [];
    for (const [modelo, info] of producaoPorModelo.entries()) {
      const defeitos = defeitosPorModelo.get(modelo) || 0;
      if (defeitos !== info.volume) {
        divergencias.push({
          modelo,
          categoria: info.categoria,
          produzido: info.volume,
          defeitosApontados: defeitos,
          diferenca: info.volume - defeitos
        });
      }
    }

    // 7) perCategory FINAL TIPADO (solução do erro)
    const perCategory = Array.from(categories.entries()).map(
      ([categoria, v]) => ({
        categoria,
        rows: v.rows,
        volume: v.volume,

        identifiedRows: v.identifiedRows,
        notIdentifiedRows: v.notIdentifiedRows,

        identifiedVolume: v.identifiedVolume,
        notIdentifiedVolume: v.notIdentifiedVolume,

        identifiedPct:
          v.rows ? Number(((v.identifiedRows / v.rows) * 100).toFixed(2)) : 0,

        models: Array.from(v.models.entries()).map(([modelKey, stats]) => ({
          modelKey,
          ...stats,
          identifyPct:
            stats.identifiedRows + stats.notIdentifiedRows
              ? Number(
                  (
                    (stats.identifiedRows /
                      (stats.identifiedRows + stats.notIdentifiedRows)) *
                    100
                  ).toFixed(2)
                )
              : 0,
        })),
      })
    );

    // 8) Problemas globais
    const topProblemModels = Array.from(notIdentifiedExamplesByModel.entries())
      .map(([modelo, v]) => ({
        modelo,
        count: v.count,
        samples: v.samples,
        explicacoes: v.explicacoes,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 9) KPIs gerais
    const totalIdentRows = perCategory.reduce((s, c) => s + c.identifiedRows, 0);
    const totalNotIdentRows = perCategory.reduce((s, c) => s + c.notIdentifiedRows, 0);

    const totalIdentVol = perCategory.reduce(
      (s, c) => s + (c.identifiedVolume || 0),
      0
    );
    const totalNotIdentVol = perCategory.reduce(
      (s, c) => s + (c.notIdentifiedVolume || 0),
      0
    );

    // 10) Payload final
    const payload = {
      ok: true,
      totals: {
        totalRows,
        totalVolume,
        identifiedRows: totalIdentRows,
        notIdentifiedRows: totalNotIdentRows,
        identifiedVolume: totalIdentVol,
        notIdentifiedVolume: totalNotIdentVol,
        matchRateByRows:
          totalRows ? Number(((totalIdentRows / totalRows) * 100).toFixed(2)) : 0,
        matchRateByVolume:
          totalVolume
            ? Number(((totalIdentVol / totalVolume) * 100).toFixed(2))
            : 0,
      },
      perCategory,
      topProblemModels,
      diagnostico: {
        producaoSemDefeitos,
        defeitosSemProducao,
        divergencias,
      },
    };

    return NextResponse.json(payload);
  } catch (e: any) {
    console.error("Erro validate:", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}