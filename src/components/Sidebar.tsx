// 3. src/components/Sidebar.tsx
"use client";
import React from "react";
import Link from "next/link";

export default function Sidebar({ session }: { session?: { username?: string; role?: string } }) {
  const isAdmin = session?.role === "admin";
  return (
    <aside className="w-64 bg-neutral-800 text-white p-4 min-h-[calc(100vh-64px)]">
      <div className="mb-6">
        <div className="font-bold">{session?.username ?? "Convidado"}</div>
        <div className="text-sm text-neutral-300">{session?.role ?? "guest"}</div>
      </div>

      <nav className="flex flex-col gap-2">
        <Link href="/dashboard" className="px-3 py-2 rounded hover:bg-white/5">Dashboard</Link>
        {isAdmin && <Link href="/dev" className="px-3 py-2 rounded hover:bg-white/5">Área de Desenvolvimento</Link>}
      </nav>
    </aside>
  );
}