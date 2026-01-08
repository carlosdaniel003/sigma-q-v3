import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

export interface ProducaoRaw {
  DATA: any;
  MODELO: string;
  CATEGORIA: string;
  QTY_GERAL: number;
}

export function loadProducao(): ProducaoRaw[] {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "productions",
      "producao.xlsx"
    );

    const buffer = fs.readFileSync(filePath);
    const wb = XLSX.read(buffer, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];

    const rawData = XLSX.utils.sheet_to_json(sheet) as any[];

    return rawData.map((r) => ({
      DATA: r["DATA"],
      MODELO: String(r["MODELO"] || "").trim().toUpperCase(),
      CATEGORIA: String(r["CATEGORIA"] || "").trim().toUpperCase(),
      QTY_GERAL: Number(r["QTY_GERAL"] || 0),
    }));
  } catch (error) {
    console.error("❌ Erro ao carregar producao.xlsx:", error);
    return [];
  }
}