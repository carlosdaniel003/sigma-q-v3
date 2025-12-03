/* =====================================================================
   SIGMA-Q V3 — Motor Inteligente de Enriquecimento de Defeitos
   Versão 2 — Matching avançado para PTH, AF, LCM e Produto Acabado.
   - Normalização profunda
   - Comparação flexível (modelo, código)
   - Logs de rastreamento
===================================================================== */

import { loadCatalogo } from "@/core/catalogo/catalogoLoader";

export type EnrichmentOptions = {
  usarCodigos?: boolean;
  usarFalhas?: boolean;
  usarResponsabilidades?: boolean;
};

/* ============================================================
   NORMALIZAÇÃO AVANÇADA
============================================================ */
function norm(v: any) {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // remove acentos
    .replace(/\s+/g, " ")              // remove espaços repetidos
    .trim()
    .toUpperCase();
}

/* ============================================================
   OBTÉM CAMPO POR ALTERNATIVAS
============================================================ */
function getField(obj: any, candidates: string[]) {
  if (!obj) return undefined;
  for (const c of candidates) {
    if (typeof obj[c] !== "undefined") return obj[c];
  }
  return undefined;
}

/* ============================================================
   NORMALIZAÇÃO DO CATALOGO DE MODELOS / CÓDIGOS
============================================================ */
function unifyCodigoEntry(e: any) {
  return {
    codigoRaw: getField(e, ["CÓDIGO", "CODIGO", "codigo", "ID", "ITEM_CODE"]) ?? "",
    modeloRaw: getField(e, ["MODELO", "MODELOS", "MODELO DO PRODUTO", "MODELO_DO_PRODUTO"]) ?? "",
    categoriaRaw: getField(e, ["CATEGORIA", "categoria", "Categoria"]) ?? "",
    __raw: e
  };
}

/* ============================================================
   NORMALIZAÇÃO DO CATALOGO DE FALHAS
============================================================ */
function unifyFalhaEntry(e: any) {
  return {
    codigoFalhaRaw: getField(e, ["CÓDIGO DA FALHA","CODIGO DA FALHA","CODIGO_FALHA","CÓDIGO_FALHA"]) ?? "",
    descricaoRaw: getField(e, ["DESCRIÇÃO DA FALHA","DESCRICAO DA FALHA","DESCRIÇÃO","DESCRICAO"]) ?? "",
    __raw: e
  };
}

/* ============================================================
   NORMALIZAÇÃO DO CATALOGO DE RESPONSABILIDADE
============================================================ */
function unifyRespEntry(e: any) {
  return {
    codigoFornecedorRaw: getField(e, ["CÓDIGO DO FORNECEDOR","CODIGO DO FORNECEDOR","CODIGO_FORNECEDOR","FORNECEDOR"]) ?? "",
    classificacaoRaw: getField(e, ["CLASSIFICAÇÃO DO FORNECEDOR","CLASSIFICACAO DO FORNECEDOR","CLASSIFICAÇÃO"]) ?? "",
    responsabilidadeRaw: getField(e, ["RESPONSABILIDADE","RESPONSABILIDADE DO FORNECEDOR"]) ?? "",
    __raw: e
  };
}

/* =====================================================================
   ⭐ MATCH INTELIGENTE PARA MODELOS E CODIGOS
   Suporta:
   - Código exato (mais importante)
   - Modelo igual
   - Modelo no final (caso PTH venha com prefixos ou descrições extras)
===================================================================== */
function matchModeloOuCodigo(uCodigo: string, uModelo: string, codigoProduto: string, modelo: string) {

  // PRIORIDADE 1 — código do produto (exato)
  if (codigoProduto && uCodigo && uCodigo === codigoProduto) return true;

  // PRIORIDADE 2 — modelo exato
  if (modelo && uModelo && uModelo === modelo) return true;

  // PRIORIDADE 3 — modelo no final do texto
  if (modelo && uModelo && modelo.endsWith(uModelo)) return true;

  // PRIORIDADE 4 — catálogo contém parte final
  if (modelo && uModelo && uModelo.endsWith(modelo)) return true;

  return false;
}

/* =====================================================================
   ⭐ ENRIQUECIMENTO PRINCIPAL
===================================================================== */
export async function enrichDefeito(
  item: any,
  opts: EnrichmentOptions = {},
  catalogo?: { codigos: any[]; falhas: any[]; responsabilidades: any[] }
) {
  const cat = catalogo ?? (await loadCatalogo());

  const usarCodigos = !!opts.usarCodigos;
  const usarFalhas = !!opts.usarFalhas;
  const usarResponsabilidades = !!opts.usarResponsabilidades;

  const issues: string[] = [];
  const confidenceParts: number[] = [];

  // Dados brutos normalizados
  const modeloRaw     = getField(item, ["MODELO", "MODEL", "MODELOS"]);
  const codigoProdRaw = getField(item, ["CÓDIGO", "CODIGO", "ID", "ITEM_CODE"]);
  const falhaRaw      = getField(item, ["CÓDIGO DA FALHA","CODIGO DA FALHA","CODIGO_FALHA"]);
  const fornecedorRaw = getField(item, ["CÓDIGO DO FORNECEDOR","CODIGO_FORNECEDOR","FORNECEDOR"]);

  const modelo        = norm(modeloRaw);
  const codigoProduto = norm(codigoProdRaw);
  const codigoFalha   = norm(falhaRaw);
  const codigoForn    = norm(fornecedorRaw);

  let _model: any = null;
  let _codigoFalha: any = null;
  let _responsabilidade: any = null;

  /* ============================================================
       MATCH — MODELO / CODIGO DO PRODUTO
  ============================================================ */
  if (usarCodigos) {
    const lista = (cat.codigos || []) as any[];

    const found = lista.find((c) => {
      const u = unifyCodigoEntry(c);
      const uCodigo = norm(u.codigoRaw);
      const uModelo = norm(u.modeloRaw);
      return matchModeloOuCodigo(uCodigo, uModelo, codigoProduto, modelo);
    });

    if (!found) {
      issues.push("Modelo/código não encontrado no catálogo");
      confidenceParts.push(0);
    } else {
      const u = unifyCodigoEntry(found);
      _model = {
        codigo: norm(u.codigoRaw),
        modelo: u.modeloRaw,
        categoria: u.categoriaRaw,
        raw: found
      };
      confidenceParts.push(1);
    }
  }

  /* ============================================================
       MATCH — CODIGO DE FALHA
  ============================================================ */
  if (usarFalhas) {
    const lista = (cat.falhas || []) as any[];

    const found = lista.find((f) => {
      const u = unifyFalhaEntry(f);
      const uCod = norm(u.codigoFalhaRaw);
      const uDesc = norm(u.descricaoRaw);

      if (codigoFalha && uCod === codigoFalha) return true;
      if (codigoFalha && codigoFalha === uDesc) return true;

      const descricaoItem = norm(
        getField(item, ["DESCRIÇÃO DA FALHA","DESCRICAO DA FALHA","DESCRIÇÃO"])
      );

      if (descricaoItem && uDesc && descricaoItem.includes(uDesc)) return true;

      return false;
    });

    if (!found) {
      issues.push("Código de falha não encontrado no catálogo");
      confidenceParts.push(0);
    } else {
      const u = unifyFalhaEntry(found);
      _codigoFalha = {
        codigo: norm(u.codigoFalhaRaw),
        descricao: u.descricaoRaw,
        raw: found
      };
      confidenceParts.push(1);
    }
  }

  /* ============================================================
       MATCH — RESPONSABILIDADE
  ============================================================ */
  if (usarResponsabilidades) {
    const lista = (cat.responsabilidades || []) as any[];

    const found = lista.find((r) => {
      const u = unifyRespEntry(r);
      const uCod = norm(u.codigoFornecedorRaw);
      const uClass = norm(u.classificacaoRaw);

      if (codigoForn && uCod && uCod === codigoForn) return true;
      if (codigoForn && uClass && uClass === codigoForn) return true;

      return false;
    });

    if (!found) {
      issues.push("Responsabilidade não encontrada no catálogo");
      confidenceParts.push(0);
    } else {
      const u = unifyRespEntry(found);
      _responsabilidade = {
        codigoFornecedor: norm(u.codigoFornecedorRaw),
        classificacao: u.classificacaoRaw,
        responsabilidade: u.responsabilidadeRaw,
        raw: found
      };
      confidenceParts.push(1);
    }
  }

  /* ============================================================
       CÁLCULO DA CONFIANÇA
  ============================================================ */
  const _confidence =
    confidenceParts.length === 0
      ? 0
      : Number(
          (confidenceParts.reduce((a, b) => a + b, 0) / confidenceParts.length).toFixed(2)
        );

  /* ============================================================
       RETORNO FINAL
  ============================================================ */
  return {
    ...item,
    _model,
    _codigoFalha,
    _responsabilidade,
    _issues: issues,
    _confidence
  };
}