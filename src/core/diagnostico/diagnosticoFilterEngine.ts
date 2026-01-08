import { parseDateSafe } from "@/core/ppm/ppmDateUtils";
import { norm } from "./diagnosticoUtils";
import { DefeitoRaw } from "@/core/data/loadDefeitos";

/* ======================================================
   TIPOS
====================================================== */
export interface DiagnosticoFiltros {
  periodo: {
    semanas: { semana: number; ano: number }[];
  };
  modelo?: string[];
  categoria?: string[];
  responsabilidade?: string[];
  turno?: string[];
}

export interface DefeitoFiltrado {
  DATA: Date;
  SEMANA: number;
  ANO: number;
  MODELO: string;
  CATEGORIA: string;
  RESPONSABILIDADE: string;
  TURNO: string;
  ANALISE: string;
  CODIGO_FALHA: string;
  DESCRICAO_FALHA: string;
  QUANTIDADE: number;
}

/* ======================================================
   UTIL — SEMANA ISO
====================================================== */
function getSemanaAno(date: Date): { semana: number; ano: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const semana = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { semana, ano: d.getUTCFullYear() };
}

/* ======================================================
   MOTOR DE FILTRO
====================================================== */
export function filtrarDefeitosDiagnostico(
  defeitosRaw: DefeitoRaw[],
  filtros: DiagnosticoFiltros,
  ocorrenciasIgnorar: Set<string>
): DefeitoFiltrado[] {
  console.log("\n========================================");
  console.log("🟦 [AUDITORIA] FILTRANDO BASE DE DADOS...");
  console.log(`   - Base Total: ${defeitosRaw.length} linhas`);

  // Validação do Período
  if (!filtros.periodo?.semanas || filtros.periodo.semanas.length < 2) {
    return [];
  }

  const inicio = filtros.periodo.semanas[0];
  const fim = filtros.periodo.semanas[1];
  
  const valorInicio = inicio.ano * 100 + inicio.semana;
  const valorFim = fim.ano * 100 + fim.semana;

  console.log(`   - Período Alvo: ${valorInicio} até ${valorFim}`);
  
  const filtrados: DefeitoFiltrado[] = [];
  
  // Contadores de Exclusão
  let excluidosOcorrencia = 0;
  let excluidosResponsabilidade = 0; // Novo contador para "NÃO MOSTRAR"
  let excluidosData = 0;
  let excluidosPeriodo = 0;
  let excluidosFiltro = 0;

  for (const r of defeitosRaw) {
    // 1. Filtro de Ocorrência (Lista Negra - Código Fornecedor)
    const codigoFornecedor = norm(r["CÓDIGO DO FORNECEDOR"]);
    if (codigoFornecedor && ocorrenciasIgnorar.has(codigoFornecedor)) {
      excluidosOcorrencia++;
      continue;
    }

    // 2. ✅ NOVO FILTRO: Responsabilidade "NÃO MOSTRAR NO ÍNDICE"
    const respCheck = norm(r.RESPONSABILIDADE);
    if (respCheck === "NAO MOSTRAR NO INDICE" || respCheck.includes("NAO MOSTRAR")) {
        excluidosResponsabilidade++;
        continue;
    }

    // 3. Validação de Data
    const date = parseDateSafe(r.DATA);
    if (!date) {
      excluidosData++;
      continue;
    }

    const { semana, ano } = getSemanaAno(date);
    const valorRegistro = ano * 100 + semana;

    // 4. Filtro Temporal
    if (valorRegistro < valorInicio || valorRegistro > valorFim) {
      excluidosPeriodo++;
      continue;
    }

    // 5. Filtros de Atributo (Categoria, Modelo, Resp, Turno)
    let passou = true;

    if (filtros.modelo?.length && !filtros.modelo.includes(norm(r.MODELO))) passou = false;
    if (filtros.categoria?.length && !filtros.categoria.includes(norm(r.CATEGORIA))) passou = false;
    
    // Obs: Se o usuário filtrar por "Responsabilidade", aplicamos. 
    // Mas a regra de exclusão "NÃO MOSTRAR" já rodou antes, garantindo limpeza.
    if (filtros.responsabilidade?.length && !filtros.responsabilidade.includes(norm(r.RESPONSABILIDADE))) passou = false;
    
    if (filtros.turno?.length && !filtros.turno.includes(norm(r.TURNO))) passou = false;

    if (!passou) {
      excluidosFiltro++;
      continue;
    }

    // ✅ Adiciona registro válido
    filtrados.push({
      DATA: date,
      SEMANA: semana,
      ANO: ano,
      MODELO: norm(r.MODELO),
      CATEGORIA: norm(r.CATEGORIA),
      RESPONSABILIDADE: norm(r.RESPONSABILIDADE),
      TURNO: norm(r.TURNO),
      ANALISE: norm(r["ANÁLISE"]),
      CODIGO_FALHA: norm(r["CÓDIGO DA FALHA"]),
      DESCRICAO_FALHA: norm(r["DESCRIÇÃO DA FALHA"]),
      QUANTIDADE: Number(r.QUANTIDADE) || 0,
    });
  }

  console.log("\n📊 RESUMO DO FUNIL:");
  console.log(`   ❌ Excluídos por Lista Negra (Cód. Fornecedor): ${excluidosOcorrencia}`);
  console.log(`   ❌ Excluídos por 'NÃO MOSTRAR NO ÍNDICE': ${excluidosResponsabilidade}`);
  console.log(`   ❌ Excluídos por Data Inválida: ${excluidosData}`);
  console.log(`   ❌ Excluídos por Período: ${excluidosPeriodo}`);
  console.log(`   ❌ Excluídos por Filtros (Cat/Resp...): ${excluidosFiltro}`);
  console.log(`   ✅ ITENS RESTANTES: ${filtrados.length}`);
  console.log("========================================\n");

  return filtrados;
}