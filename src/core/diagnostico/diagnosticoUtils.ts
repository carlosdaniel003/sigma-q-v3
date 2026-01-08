import {
  StatusGeral,
  DiagnosticoIaTexto,
} from "./diagnosticoTypes";

/* ======================================================
   STATUS GERAL BASEADO NO NPR
====================================================== */
/* ======================================================
   NORMALIZAÇÃO OFICIAL DE TEXTO — DIAGNÓSTICO
====================================================== */
export function norm(value: any): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function calcularStatusGeral(nprMax: number): StatusGeral {
  if (nprMax < 25) {
    return {
      nivel: "ok",
      mensagem: "Processo sob controle",
      nprReferencia: nprMax,
    };
  }

  if (nprMax < 40) {
    return {
      nivel: "alerta",
      mensagem: "Atenção: risco moderado identificado",
      nprReferencia: nprMax,
    };
  }

  return {
    nivel: "critico",
    mensagem: "Situação crítica: ação imediata necessária",
    nprReferencia: nprMax,
  };
}

/* ======================================================
   GERA TEXTO INTELIGENTE DA IA
====================================================== */
export function gerarDiagnosticoIa(params: {
  principalCausa: string;
  principalDefeito: string;
  defeitoMaisCritico: string;
  nprMax: number;
  variacaoPercentual?: number;
  turnoCritico?: string;
}): DiagnosticoIaTexto {
  const {
    principalCausa,
    principalDefeito,
    defeitoMaisCritico,
    nprMax,
    variacaoPercentual,
    turnoCritico,
  } = params;

  let severidade: "informativo" | "alerta" | "critico" = "informativo";

  if (nprMax >= 40) severidade = "critico";
  else if (nprMax >= 25) severidade = "alerta";

  let texto = `No período analisado, o agrupamento ${principalCausa} foi identificado como a principal causa de defeitos, concentrando o maior volume de ocorrências. `;
  texto += `O defeito ${principalDefeito} apresentou o maior número de registros. `;
  texto += `Já o defeito ${defeitoMaisCritico} demonstrou maior criticidade devido ao elevado NPR (${nprMax}). `;

  if (variacaoPercentual !== undefined) {
    texto += `Foi observada uma variação de ${variacaoPercentual > 0 ? "+" : ""}${variacaoPercentual}% em relação ao período anterior. `;
  }

  if (turnoCritico) {
    texto += `Houve maior concentração de falhas no turno ${turnoCritico}, indicando necessidade de ação corretiva direcionada.`;
  }

  return {
    titulo: "Diagnóstico Automático (IA)",
    texto,
    severidade,
    indicadoresChave: [
      `Principal causa: ${principalCausa}`,
      `Defeito mais frequente: ${principalDefeito}`,
      `Maior NPR: ${nprMax}`,
    ],
  };
}