import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // usa o seu client Turso

export async function POST(req: Request) {
  const { username, password, guest } = await req.json();

  // ✔ LOGIN COMO CONVIDADO
  if (guest === true) {
    return NextResponse.json({
      ok: true,
      user: {
        username: "guest",
        role: "guest",
      },
    });
  }

  // ✔ LOGIN NORMAL: Buscar usuário no banco
  try {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE username = ? AND password = ? LIMIT 1",
      args: [username, password],
    });

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "Usuário ou senha incorretos" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}