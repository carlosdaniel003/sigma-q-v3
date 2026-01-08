import { PpmCalculatedRow } from "./ppmCalculatedTypes";
import { ValidatedPpmRow } from "./ppmEngineResultTypes";

/* ======================================================
   VALIDAÇÃO FINAL — COM SUPORTE A OCORRÊNCIAS
====================================================== */
export function validatePpm(
  rows: PpmCalculatedRow[]
): ValidatedPpmRow[] {
  return rows.map((r) => {
    /* ======================================================
       🔶 OCORRÊNCIAS (NÃO MOSTRAR NO ÍNDICE)
       - NÃO influenciam PPM
       - NÃO geram erro
       - NÃO afetam precisão
    ====================================================== */
    if (r.naoMostrarIndice === true || r.tipoRegistro === "OCORRENCIA") {
      return {
        ...r,
        validationStatus: "VALID",
        validationReason: "Ocorrência — item ignorado nos índices e PPM",
        naoMostrarIndice: true,
      };
    }

    /* ======================================================
       ✅ CÁLCULO NORMAL
    ====================================================== */
    if (r.calculationStatus === "OK") {
      return {
        ...r,
        validationStatus: "VALID",
      };
    }

    if (r.calculationStatus === "NO_DEFECT") {
  return {
    ...r,
    validationStatus: "VALID",
    validationReason: "Produção sem defeitos — cenário ideal",
  };
}

    /* ======================================================
       ❌ INVÁLIDO
    ====================================================== */
    return {
      ...r,
      validationStatus: "INVALID",
      validationReason: "Dados insuficientes para cálculo de PPM",
    };
  });
}