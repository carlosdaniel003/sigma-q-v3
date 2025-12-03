import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET() {
  const cwd = process.cwd();

  const expectedDir = path.join(cwd, "app/development/defeitos/data");
  const altDir = path.join(cwd, "src/core/defeitos/data");
  const publicDir = path.join(cwd, "public/defeitos");

  function list(p: string) {
    try {
      return fs.readdirSync(p);
    } catch {
      return null;
    }
  }

  return NextResponse.json({
    ok: true,
    cwd,
    expectedDirExists: fs.existsSync(expectedDir),
    altDirExists: fs.existsSync(altDir),
    publicDirExists: fs.existsSync(publicDir),

    expectedDirFiles: list(expectedDir),
    altDirFiles: list(altDir),
    publicDirFiles: list(publicDir)
  });
}