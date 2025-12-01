import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

// ------------------------------
//   🔵 Funções auxiliares
// ------------------------------

function getMesExtenso(dataStr: string): string {
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const data = new Date(dataStr);
  if (isNaN(data.getTime())) return "";

  return meses[data.getMonth()];
}

function getSemanaISO(dataStr: string): string {
  const data = new Date(dataStr);
  if (isNaN(data.getTime())) return "";

  const tmp = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()));
  const diaSemana = tmp.getUTCDay();
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (diaSemana === 0 ? 7 : diaSemana));

  const inicioAno = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const semana = Math.ceil(((tmp.getTime() - inicioAno.getTime()) / 86400000 + 1) / 7);

  return semana.toString().padStart(2, "0");
}

// ------------------------------
//   🔵 Carregar JSON genérico
// ------------------------------
async function carregarJSON(nome: string) {
  // 🎯 CORREÇÃO AQUI: Removido "v3" para evitar duplicação no caminho
  const arquivo = path.join(
    process.cwd(),
    "app", // Antes era "v3", "app"... agora vai direto para "app"
    "development",
    "catalogo",
    "data",
    nome
  );

  const conteudo = await fs.readFile(arquivo, "utf-8");
  return JSON.parse(conteudo);
}

// ------------------------------
//         🔵 API GET
// ------------------------------

export async function GET() {
  console.log("➡️ Iniciando API de defeitos...");

  // ---------------------------------------------------------
  // 🔍 BLOCO DE DIAGNÓSTICO (TESTE INDIVIDUAL DE ARQUIVOS)
  // ---------------------------------------------------------
  try {
    await carregarJSON("defeitos_produto_acabado.json");
    console.log("✔ defeitos_produto_acabado.json OK");
  } catch (e) {
    console.log("❌ ERRO em defeitos_produto_acabado.json", e);
  }

  try {
    await carregarJSON("codigos_categorias.json");
    console.log("✔ codigos_categorias.json OK");
  } catch (e) {
    console.log("❌ ERRO em codigos_categorias.json", e);
  }

  try {
    await carregarJSON("defeitos.json");
    console.log("✔ defeitos.json OK");
  } catch (e) {
    console.log("❌ ERRO em defeitos.json", e);
  }

  try {
    await carregarJSON("responsabilidades.json");
    console.log("✔ responsabilidades.json OK");
  } catch (e) {
    console.log("❌ ERRO em responsabilidades.json", e);
  }

  try {
    await carregarJSON("nao_mostrar_indice.json");
    console.log("✔ nao_mostrar_indice.json OK");
  } catch (e) {
    console.log("❌ ERRO em nao_mostrar_indice.json", e);
  }

  // ---------------------------------------------------------
  // 🚀 LÓGICA PRINCIPAL DA API
  // ---------------------------------------------------------
  try {
    // ------------------------------
    //   📌 1 — Carregar planilha base
    // ------------------------------
    const defeitos = await carregarJSON("defeitos_produto_acabado.json");

    // ------------------------------
    //   📌 2 — Carregar catálogos
    // ------------------------------
    const catalogoModelos = await carregarJSON("codigos_categorias.json");
    const catalogoDefeitos = await carregarJSON("defeitos.json");
    const catalogoResp = await carregarJSON("responsabilidades.json");
    const catalogoExcecoes = await carregarJSON("nao_mostrar_indice.json");

    // Criar mapas mais rápidos
    const mapCodToModeloCategoria = new Map(
      catalogoModelos.map((x: any) => [x["CÓDIGO"], x])
    );

    const mapCodToDescricaoFalha = new Map(
      catalogoDefeitos.map((x: any) => [x["CÓDIGO"], x["DESCRIÇÃO DO MATERIAL"]])
    );

    const mapCodToResponsavel = new Map(
      catalogoResp.map((x: any) => [x["CÓDIGO"], x["DESCRIÇÃO DO MATERIAL"]])
    );

    const mapCodToExcecao = new Map(
      catalogoExcecoes.map((x: any) => [x["CÓDIGO"], x["DESCRIÇÃO DO MATERIAL"]])
    );

    // ------------------------------
    //   📌 3 — Preencher linha a linha
    // ------------------------------
    const preenchido = defeitos.map((linha: any) => {
      const cod = linha["CÓDIGO"];

      // --- Mês ---
      if (!linha["MÊS"] && linha["DATA"])
        linha["MÊS"] = getMesExtenso(linha["DATA"]);

      // --- Semana ---
      if (!linha["SEMANA"] && linha["DATA"])
        linha["SEMANA"] = getSemanaISO(linha["DATA"]);

      // --- Modelo & Categoria ---
      if ((!linha["MODELO"] || !linha["CATEGORIA"]) && mapCodToModeloCategoria.has(cod)) {
        const ref = mapCodToModeloCategoria.get(cod);
        linha["MODELO"] = linha["MODELO"] || ref["MODELO"] || "";
        linha["CATEGORIA"] = linha["CATEGORIA"] || ref["CATEGORIA"] || "";
      }

      // --- Descrição da Falha ---
      if (!linha["DESCRIÇÃO DA FALHA"] && mapCodToDescricaoFalha.has(cod)) {
        linha["DESCRIÇÃO DA FALHA"] = mapCodToDescricaoFalha.get(cod);
      }

      // --- Responsabilidade / Classificação Fornecedor ---
      const infoResp = mapCodToResponsavel.get(cod);
      const infoEx = mapCodToExcecao.get(cod);

      if (!linha["RESPONSABILIDADE"] && (infoResp || infoEx)) {
        if (infoResp && infoEx) {
          linha["RESPONSABILIDADE"] = `${infoResp} / ${infoEx}`;
        } else {
          linha["RESPONSABILIDADE"] = infoResp || infoEx || "";
        }
      }

      if (!linha["CLASSIFICAÇÃO DE FORNECEDOR"] && (infoResp || infoEx)) {
        if (infoResp && infoEx) {
          linha["CLASSIFICAÇÃO DE FORNECEDOR"] = `${infoResp} / ${infoEx}`;
        } else {
          linha["CLASSIFICAÇÃO DE FORNECEDOR"] = infoResp || infoEx || "";
        }
      }

      return linha;
    });

    // ------------------------------
    //   📌 4 — Retornar preenchido
    // ------------------------------
    return NextResponse.json(preenchido);

  } catch (error) {
    console.error("Erro na API de defeitos:", error);
    return NextResponse.json(
      { erro: "Erro interno ao processar defeitos" },
      { status: 500 }
    );
  }
}