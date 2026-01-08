import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

export interface FmeaRow {
  CÓDIGO: string;
  DESCRIÇÃO: string;
  SEVERIDADE: number;
  OCORRÊNCIA: number;
  DETECÇÃO: number;
  NPR: number;
}

export function loadFmea(): FmeaRow[] {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "suporte",
      "fmea.xlsx"
    );

    const buffer = fs.readFileSync(filePath);
    const wb = XLSX.read(buffer, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];

    const rawData = XLSX.utils.sheet_to_json(sheet) as any[];

    // Mapeamento robusto (com ou sem acento, maiúsculo ou minúsculo)
    return rawData.map((r) => ({
      CÓDIGO: String(r["CÓDIGO"] || r["CODIGO"] || r["Código"] || "").trim(),
      DESCRIÇÃO: String(r["DESCRIÇÃO"] || r["DESCRICAO"] || r["Descrição"] || "").trim(),
      
      // Garante que sejam números e corrige redundância na leitura
      SEVERIDADE: Number(r["SEVERIDADE"] || r["Severidade"] || 0),
      OCORRÊNCIA: Number(r["OCORRÊNCIA"] || r["OCORRENCIA"] || r["Ocorrência"] || 0),
      DETECÇÃO: Number(r["DETECÇÃO"] || r["DETECCAO"] || r["Detecção"] || 0),
      NPR: Number(r["NPR"] || 0),
    }));
  } catch (error) {
    console.error("❌ Erro ao carregar fmea.xlsx:", error);
    return [];
  }
}