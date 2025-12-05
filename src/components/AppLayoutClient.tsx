"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { MainSidebar } from "@/components/MainSidebar";

// ✅ CORREÇÃO: Subindo dois níveis (../../) para sair de 'src' e 'components'
import "../../app/development/dev.css"; 

export default function AppLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // 🚫 LISTA NEGRA: Rotas onde o Sidebar NÃO deve aparecer
  // Adicione outras rotas públicas aqui se necessário
  const isPublicPage = pathname === "/login" || pathname === "/";

  // Se for página pública (Login), renderiza apenas o conteúdo limpo
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Se for sistema interno, renderiza a estrutura com Sidebar persistente
  return (
    <div className={`dev-container ${collapsed ? "collapsed" : ""}`}>
      {/* O Sidebar mora aqui e NUNCA é desmontado na navegação interna */}
      <MainSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className="dev-content">
        {children}
      </main>
    </div>
  );
}