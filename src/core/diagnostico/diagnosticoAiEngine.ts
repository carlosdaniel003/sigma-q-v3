// src\core\diagnostico\diagnosticoAiEngine.ts
import {
  DiagnosticoIaTexto,
  PrincipalCausa,
  PrincipalDefeito,
  DefeitoCritico
} from "./diagnosticoTypes";

/* ======================================================
   TIPOS DE ENTRADA — IA (DEFINIÇÃO LOCAL)
====================================================== */
export interface DiagnosticoAiInput {
  periodoAtual: {
    semanaInicio: number;
    semanaFim: number;
    principalCausa: PrincipalCausa;
    principalDefeito: PrincipalDefeito;
    defeitoCritico: DefeitoCritico;
  };
  
  // ✅ Contexto PPM
  ppmContext: {
    atual: number;    
    anterior: number; 
    producaoAtual: number;
  };

  // ✅ Contexto de Análise de Sustentação (Efeito V)
  analiseSustentacao?: {
      nome: string;   // Nome do defeito que fez o V
      ppmT: number;   
      ppmT1: number;  
      ppmT2: number; 
      qtdT: number;   // Qtd Absoluta T (Atual)
      qtdT1: number;  // Qtd Absoluta T-1
      qtdT2: number;  // Qtd Absoluta T-2 
  };

  // ✅ Mudança Brusca (Spike)
  mudancaBrusca?: {
      nome: string;
      ppmAtual: number;
      ppmAnterior: number;
      delta: number;
  } | null;

  // ✅ Contexto de Reincidência
  reincidencia?: {
    isReincidente: boolean;         
    periodosConsecutivos: number;   
    principalCausaAnterior: string; 
  };

  contexto?: {
    turnoMaisAfetado?: string;
    modeloMaisAfetado?: string;
    tendenciasAlertas?: {
        agrupamento: string;
        crescimento: number;
        ppmInicial: number;
        ppmFinal: number;
        qtdInicial: number;
        qtdFinal: number;
    }[];
  };
}

/* ======================================================
   MOTOR DE DIAGNÓSTICO AUTOMÁTICO (IA)
====================================================== */
export function gerarDiagnosticoAutomatico(
  input: DiagnosticoAiInput
): DiagnosticoIaTexto {
  const {
    periodoAtual,
    ppmContext,
    contexto,
    reincidencia,
    analiseSustentacao,
    mudancaBrusca 
  } = input;

  const linhas: string[] = [];
  const indicadores: string[] = [];

  // Helper para formatar números
  const fmt = (n: number) => n.toLocaleString("pt-BR");
  // Mantém 2 casas decimais fixas para PPM
  const fmtPpm = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ======================================================
      🚨 0. CHECK DE SEGURANÇA: SEM PRODUÇÃO OU ZERO DEFEITOS
  ====================================================== */
  
  // 1. Sem Produção: Retorna mensagem amigável para o Empty State
  if (ppmContext.producaoAtual === 0) {
    return {
      titulo: "Sem Produção Registrada",
      texto: `Não identificamos apontamentos de produção para o período (Semana ${periodoAtual.semanaInicio} a ${periodoAtual.semanaFim}) com os filtros selecionados.\n\n` +
             `Para visualizar o diagnóstico de qualidade, selecione um período ou modelo que possua volume produtivo registrado.`,
      tendencia: "indefinido",
      variacaoPercentual: 0,
      indicadoresChave: []
    };
  }

  // 2. Produção > 0 mas Zero Defeitos: Parabéns!
  if (ppmContext.atual === 0 && ppmContext.producaoAtual > 0) {
    return {
      titulo: "Excelência em Qualidade",
      texto: `Parabéns! Houve produção de **${fmt(ppmContext.producaoAtual)} peças** neste período sem nenhum registro de falha.\n\n` +
             `O processo está sob controle total e demonstra robustez nos filtros selecionados.`,
      tendencia: "melhora",
      variacaoPercentual: -100, // Melhoria máxima
      indicadoresChave: ["Zero Defeitos", "PPM 0,00"]
    };
  }

  /* ======================================================
      1️⃣ CÁLCULO DE TENDÊNCIA (BASEADO EM PPM GLOBAL)
  ====================================================== */
  let variacaoPpmPercent = 0;
  let diferencaPpmAbsoluta = 0;
  let tendencia: "melhora" | "piora" | "estavel" | "indefinido" = "indefinido";

  if (ppmContext.anterior > 0) {
    diferencaPpmAbsoluta = ppmContext.atual - ppmContext.anterior;
    variacaoPpmPercent = (diferencaPpmAbsoluta / ppmContext.anterior) * 100;

    if (variacaoPpmPercent <= -5) tendencia = "melhora";
    else if (variacaoPpmPercent >= 5) tendencia = "piora";
    else tendencia = "estavel";
  } else if (ppmContext.atual > 0 && ppmContext.anterior === 0) {
    tendencia = "piora";
    variacaoPpmPercent = 100;
    diferencaPpmAbsoluta = ppmContext.atual;
  }

  /* ======================================================
      2️⃣ CONTEXTO INICIAL
  ====================================================== */
  linhas.push(
    `No período analisado (semanas **${periodoAtual.semanaInicio} a ${periodoAtual.semanaFim}**), ` +
      `o agrupamento **${periodoAtual.principalCausa.nome}** foi o principal ofensor, ` +
      `concentrando **${fmt(periodoAtual.principalCausa.ocorrencias)}** ocorrências.`
  );

  indicadores.push(`PPM Atual: ${fmtPpm(ppmContext.atual)}`);

  /* ======================================================
      3️⃣ ANÁLISE DE CENÁRIO (PPM GLOBAL)
  ====================================================== */
  if (tendencia !== "indefinido") {
    const sinal = diferencaPpmAbsoluta > 0 ? "+" : "";
    const txtPercent = `${sinal}${variacaoPpmPercent.toFixed(1)}%`;
    const txtAbsoluto = `${sinal}${fmtPpm(diferencaPpmAbsoluta)}`;
    const ppmAtualStr = fmtPpm(ppmContext.atual);
    const ppmAntStr = fmtPpm(ppmContext.anterior);

    if (tendencia === "melhora") {
      linhas.push(
        `**Cenário Positivo (Efetividade):** Houve redução expressiva de **${txtAbsoluto} PPM** (${txtPercent}) comparado ao período anterior ` +
        `(${ppmAntStr} ➝ ${ppmAtualStr}). Recomenda-se investigar quais ações deram certo para padronizá-las.`
      );
    } else if (tendencia === "piora") {
      linhas.push(
        `**Atenção (Degradação):** O processo apresentou instabilidade, com aumento de **${txtAbsoluto} PPM** (${txtPercent}) em relação ao histórico ` +
        `(${ppmAntStr} ➝ ${ppmAtualStr}). É urgente revisar as mudanças recentes no processo (4M).`
      );
    } else {
      linhas.push(
        `**Estabilidade:** O PPM manteve-se estável com variação de **${txtAbsoluto} PPM** (${txtPercent}), oscilando de ${ppmAntStr} para ${ppmAtualStr}. ` +
        `O processo demonstra consistência, mas requer novas ações para quebra de nível.`
      );
    }
  } else {
    linhas.push(`O PPM atual do período foi calculado em **${fmtPpm(ppmContext.atual)}**. Estabeleça este valor como linha de base.`);
  }

  /* ======================================================
      4️⃣ PRINCIPAL DEFEITO E CRITICIDADE
  ====================================================== */
  if (periodoAtual.principalDefeito.nome) {
    linhas.push(
      `O defeito específico **${periodoAtual.principalDefeito.nome}** liderou os registros. ` +
        `Foque a análise de causa raiz (Ishikawa/5 Porquês) prioritariamente neste item.`
    );
  }

  linhas.push(
    `O item de maior risco identificado foi **${periodoAtual.defeitoCritico.descricao}** (NPR **${periodoAtual.defeitoCritico.npr}**), exigindo monitoramento rigoroso.`
  );

  /* ======================================================
      ✅ 4B. MUDANÇA BRUSCA (VARREDURA GLOBAL)
      Analisa o defeito que teve a maior variação (Spike)
      Reporta tanto positivo quanto negativo, independente do tamanho
  ====================================================== */
  if (mudancaBrusca) {
      const delta = mudancaBrusca.delta;
      const absDelta = Math.abs(delta);
      const sinal = delta > 0 ? "+" : ""; 
      const txtDelta = fmtPpm(delta);     
      const nomeDefeito = mudancaBrusca.nome;

      // CENÁRIO 1: PIORA (Delta Positivo)
      if (delta > 0) {
          if (absDelta > 100) {
              // CRÍTICO (>100)
              linhas.push(
                  `**Instabilidade Detectada (Mudança Brusca):** O defeito **"${nomeDefeito}"** apresentou a maior variação negativa do período. ` +
                  `Saltou de **${fmtPpm(mudancaBrusca.ppmAnterior)} PPM** para **${fmtPpm(mudancaBrusca.ppmAtual)} PPM** (${sinal}${txtDelta} de variação). ` +
                  `Isso sugere uma quebra de processo recente, entrada de lote defeituoso ou falha de ferramenta.`
              );
              indicadores.push(`Spike: ${nomeDefeito}`);
          } else {
              // MODERADO (<100)
              linhas.push(
                  `**Oscilação de Processo:** A maior variação registrada foi no defeito **"${nomeDefeito}"**, com aumento de **${txtDelta} PPM** ` +
                  `(${fmtPpm(mudancaBrusca.ppmAnterior)} ➝ ${fmtPpm(mudancaBrusca.ppmAtual)} PPM). Embora abaixo do limiar crítico, monitore este item.`
              );
          }
      } 
      // CENÁRIO 2: MELHORIA (Delta Negativo)
      else if (delta < 0) {
          if (absDelta > 100) {
              // EXCELENTE (>100)
              linhas.push(
                  `**Melhoria Significativa:** O defeito **"${nomeDefeito}"** teve a maior redução do período. ` +
                  `Caiu de **${fmtPpm(mudancaBrusca.ppmAnterior)} PPM** para **${fmtPpm(mudancaBrusca.ppmAtual)} PPM** (${txtDelta} de variação). ` +
                  `Verifique se houve mudança positiva no processo para padronizá-la.`
              );
              indicadores.push(`Melhoria: ${nomeDefeito}`);
          } else {
              // BOM (<100)
              linhas.push(
                  `**Tendência de Melhoria:** O defeito **"${nomeDefeito}"** apresentou a redução mais relevante do período, caindo **${txtDelta} PPM** ` +
                  `(${fmtPpm(mudancaBrusca.ppmAnterior)} ➝ ${fmtPpm(mudancaBrusca.ppmAtual)} PPM), contribuindo para a estabilidade geral.`
              );
          }
      }
  }

  /* ======================================================
      5A. ALERTAS DE REINCIDÊNCIA
  ====================================================== */
  if (reincidencia) {
      if (reincidencia.isReincidente) {
          linhas.push(
              `**ALERTA CRÍTICO DE REINCIDÊNCIA:** O agrupamento **"${periodoAtual.principalCausa.nome}"** lidera as falhas por **${reincidencia.periodosConsecutivos} períodos consecutivos**. ` +
              `Isso caracteriza um problema sistêmico. É mandatória a abertura de RNC e revisão profunda do processo.`
          );
          indicadores.push(`Reincidência Crítica: ${reincidencia.periodosConsecutivos}x Top 1`);
      } 
      else if (reincidencia.principalCausaAnterior === periodoAtual.principalCausa.nome) {
          linhas.push(
              `**Atenção:** O grupo **"${periodoAtual.principalCausa.nome}"** repetiu a liderança do ranking em relação ao período anterior. ` +
              `Aja agora para evitar que este problema se torne crônico.`
          );
      } 
      else if (reincidencia.principalCausaAnterior) {
          linhas.push(
              `**Mudança de Cenário:** O perfil de falhas mudou (Anterior: "${reincidencia.principalCausaAnterior}"). ` +
              `Verifique se houve alteração de mix de produto ou setup.`
          );
      }
  }

  /* ======================================================
      ✅ 5B. EFEITO REBOTE (SUSTENTAÇÃO / CURVA V)
      Logica: T-2 Alto -> T-1 Baixo -> T Alto (Formato em V)
      AGORA: Apenas PPM (Sem Qtd)
  ====================================================== */
  if (analiseSustentacao) {
      const { nome, ppmT, ppmT1, ppmT2 } = analiseSustentacao;
      
      linhas.push(
          `**Falha na Sustentação (Efeito Rebote):** Identificamos um padrão crítico no defeito **"${nome}"**. ` +
          `Este item era alto em T-2 (${fmtPpm(ppmT2)} PPM), reduziu significativamente no período anterior (${fmtPpm(ppmT1)} PPM), ` +
          `mas **voltou a subir drasticamente agora** para ${fmtPpm(ppmT)} PPM. ` +
          `Diagnóstico provável: A ação corretiva anterior perdeu eficácia ou houve relaxamento no controle.`
      );
      indicadores.push(`Efeito Rebote: ${nome}`);
  }

  /* ======================================================
      6️⃣ ALERTAS DE TENDÊNCIA OCULTA (QUANTIDADE + PPM)
  ====================================================== */
  if (contexto?.tendenciasAlertas && contexto.tendenciasAlertas.length > 0) {
      const riscoEmergente = contexto.tendenciasAlertas.find(
          t => t.agrupamento !== periodoAtual.principalCausa.nome && t.crescimento > 0
      );
      
      if (riscoEmergente) {
          const ppmIniStr = fmtPpm(riscoEmergente.ppmInicial);
          const ppmFimStr = fmtPpm(riscoEmergente.ppmFinal);
          // ✅ Usamos a quantidade absoluta para tangibilizar o problema
          const qtdIniStr = fmt(riscoEmergente.qtdInicial);
          const qtdFimStr = fmt(riscoEmergente.qtdFinal);

          linhas.push(
              `**Risco Emergente Detectado:** O agrupamento **${riscoEmergente.agrupamento}** não figura como o maior ofensor hoje, mas apresenta uma curva de crescimento contínua nos últimos 3 meses, ` +
              `saltando de **${qtdIniStr}** para **${qtdFimStr} ocorrências** (de ${ppmIniStr} para ${ppmFimStr} PPM). ` +
              `Intervenha antes que ele se torne o Pareto principal.`
          );
          indicadores.push(`Tendência Alta: ${riscoEmergente.agrupamento}`);
      }
  }

  /* ======================================================
      7️⃣ CONTEXTO OPERACIONAL
  ====================================================== */
  if (contexto?.turnoMaisAfetado) {
    linhas.push(
      `A maior concentração dos defeitos ocorreu no turno **${contexto.turnoMaisAfetado}**. ` +
        `Recomenda-se auditoria escalonada de processo neste horário.`
    );
  }

  if (contexto?.modeloMaisAfetado) {
    linhas.push(
      `O modelo **${contexto.modeloMaisAfetado}** foi o mais impactado, ` +
        `indicando possível sensibilidade deste produto ou lote de material.`
    );
  }

  /* ======================================================
      8️⃣ SAÍDA FINAL
  ====================================================== */
  return {
    titulo: "Diagnóstico do SIGMA-Q AI",
    texto: linhas.join("\n\n"),
    tendencia,
    variacaoPercentual: variacaoPpmPercent,
    indicadoresChave: indicadores,
  };
}