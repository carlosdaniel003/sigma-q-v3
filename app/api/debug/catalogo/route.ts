import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  const dir = path.resolve(process.cwd(), "src/core/catalogo");

  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, dir });
  }

  const results: any[] = [];
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = await fs.stat(full);
    results.push({
      name: f,
      isFile: stat.isFile(),
      size: stat.size,
    });
  }

  return NextResponse.json({ ok: true, dir, files: results });
}