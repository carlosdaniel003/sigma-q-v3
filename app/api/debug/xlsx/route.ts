import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import * as XLSX from "xlsx";

const DATA_DIR = path.resolve(process.cwd(), "app/development/defeitos/data");

export async function GET() {
  try {
    const file = path.join(DATA_DIR, "defeitos_af.xlsx");
    const buf = await fs.readFile(file);

    const wb = XLSX.read(buf, { type: "buffer" });
    const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

    return NextResponse.json({
      ok: true,
      rows: json.length,
      sample: json.slice(0, 5)
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err.message,
      stack: err.stack
    });
  }
}