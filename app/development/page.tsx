"use client";

import { useEffect } from "react";

export default function DevArea() {

  useEffect(() => {
    const data = localStorage.getItem("sigma_user");
    if (!data) {
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(data);

    if (user.role !== "admin") {
      window.location.href = "/dashboard";
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Área de Desenvolvimento</h1>
      <p>Somente administradores podem acessar.</p>

      <ul className="mt-4 list-disc pl-6">
        <li><a href="/development/catalogo">Catálogo Oficial SIGMA-Q</a></li>
        <li><a href="/development/defeitos">Classificação de Defeitos</a></li>
        <li><a href="/development/producao">Classificação de Produção</a></li>
        <li><a href="/development/geral">Classificação Geral</a></li>
        <li><a href="/development/ppm">PPM Engine</a></li>
        <li><a href="/development/acesso">Gerenciamento de Acesso</a></li>
      </ul>
    </div>
  );
}