/* ======================================================
   TIPOS OFICIAIS — DIAGNÓSTICO DE IA
   (CONTRATO ÚNICO DO SISTEMA)
====================================================== */

/* =========================
   PRINCIPAL CAUSA
========================= */
export interface PrincipalCausa {
  nome: string;
  ocorrencias: number;
}

/* =========================
   PRINCIPAL DEFEITO
========================= */
export interface PrincipalDefeito {
  nome: string;
  ocorrencias: number;
}

/* =========================
   DEFEITO CRÍTICO (NPR)
========================= */
export interface DefeitoCritico {
  codigo: string;
  descricao: string;
  npr: number;
}

/* =========================
   STATUS GERAL
========================= */
export interface StatusGeral {
  nivel: "ok" | "alerta" | "critico";
  mensagem: string;
  nprReferencia: number;
}

/* =========================
   DEFEITOS CRÍTICOS (TOP 5)
========================= */
export interface DefeitoCriticoDetalhado {
  codigo: string;
  descricao: string;
  severidade: number;
  ocorrencia: number;
  deteccao: number;
  npr: number;
}

/* =========================
   PRINCIPAIS CAUSAS (TOP 3)
========================= */
export interface CausaCritica {
  nome: string;
  ocorrencias: number;
  
  // ✅ Lista para o Drill-down (detalhes do agrupamento)
  detalhes?: {
    nome: string;
    ocorrencias: number;
    // ✅ Lista de modelos com quantidade (para o Tooltip)
    modelos?: {
        nome: string;
        ocorrencias: number;
    }[];
  }[];
}

/* =========================
   INPUT DO MOTOR DE IA
========================= */
export interface DiagnosticoAiInput {
  periodoAtual: {
    semanaInicio: number;
    semanaFim: number;
    principalCausa: PrincipalCausa;
    principalDefeito: PrincipalDefeito;
    defeitoCritico: DefeitoCritico;
  };
  
  // ✅ Contexto de PPM
  ppmContext: {
    atual: number;    // PPM do período selecionado
    anterior: number; // PPM do período anterior
    producaoAtual: number;
  };

  contexto?: {
    turnoMaisAfetado?: string;
    modeloMaisAfetado?: string;
    tendenciasAlertas?: {
        agrupamento: string;
        crescimento: number;
    }[];
  };
}

/* =========================
   SAÍDA DE TEXTO DA IA
========================= */
export interface DiagnosticoIaTexto {
  titulo: string;
  texto: string;
  
  // ✅ Campos visuais de Tendência (baseados em PPM)
  tendencia?: "melhora" | "piora" | "estavel" | "indefinido";
  variacaoPercentual?: number;

  severidade?: "informativo" | "alerta" | "critico";
  indicadoresChave: string[];
}

/* =========================
   RESPONSE FINAL DA API
========================= */
export interface DiagnosticoIaResponse {
  principalCausa: PrincipalCausa;
  principalDefeito: PrincipalDefeito;
  defeitoCritico: DefeitoCritico;
  statusGeral: StatusGeral;

  defeitosCriticos: DefeitoCriticoDetalhado[];
  principaisCausas: CausaCritica[];

  diagnosticoIa: DiagnosticoIaTexto;
}