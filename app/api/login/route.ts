import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password, guest } = await req.json();

  // Se o usuário clicou em "Entrar como convidado"
  if (guest === true) {
    return NextResponse.json({
      ok: true,
      user: {
        username: "guest",
        role: "guest",
      }
    });
  }

  // Login ADM tradicional
  if (username === "admin" && password === "admin") {
    return NextResponse.json({
      ok: true,
      user: {
        username: "admin",
        role: "admin",
      }
    });
  }

  // Erro padrão
  return NextResponse.json(
    { error: "Usuário ou senha incorretos" },
    { status: 401 }
  );
}