"use client";

import React, { useEffect, useState } from "react";
import { getUser } from "@/services/userStorage";
import { useDashboard } from "./hooks/useDashboard";

import KpiCard from "./components/KpiCard";
import IndiceDefeitosCard from "./components/IndiceDefeitosCard";
import TendenciaPpm from "./components/TendenciaPpm";
import ResponsabilidadePorMes from "./components/ResponsabilidadePorMes";
import CategoriaPorMes from "./components/CategoriaPorMes";

/* ======================================================
   CONSTANTES DO NEGÓCIO
====================================================== */
const META_PPM = 6200;

export default function DevelopmentDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  const { data, loading, error } = useDashboard();

  /* ======================================================
     AUTH / BOOTSTRAP
  ====================================================== */
  useEffect(() => {
    const storedUser = getUser();
    setUser(storedUser);
    setMounted(true);

    if (!storedUser || storedUser.role === "viewer") {
      localStorage.removeItem("sigma_user");
      document.cookie =
        "sigma_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      window.location.href = "/login";
    }
  }, []);

  if (!mounted || !user) return null;

  if (loading) {
    return (
      <div style={{ padding: 24, color: "#fff", opacity: 0.7 }}>
        Carregando dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: "red" }}>
        Erro: {error}
      </div>
    );
  }

  if (!data) return null;

  /* ======================================================
     TENDÊNCIA (ÚLTIMOS 2 MESES VÁLIDOS)
  ====================================================== */
  const validTrend = (data.ppmMonthlyTrend ?? [])
    .filter((m) => m.production > 0 && m.ppm !== null)
    .sort((a, b) => a.month.localeCompare(b.month));

  const anterior =
    validTrend.length >= 2
      ? validTrend[validTrend.length - 2]
      : null;

  const atual =
    validTrend.length >= 1
      ? validTrend[validTrend.length - 1]
      : null;

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <div
      style={{
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* HEADER */}
      <h1 style={{ fontSize: "2.2rem", fontWeight: 700 }}>
        SIGMA-Q | Dashboard Técnico de Qualidade
      </h1>

      {/* ===============================
          KPIs TOPO (LINHA ÚNICA)
      =============================== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        {/* Índice de Defeitos */}
        <IndiceDefeitosCard
          meta={META_PPM}
          real={data.meta.ppmGeral}
        />

        {/* Quantidade de Defeitos */}
        <KpiCard
          label="Quantidade de Defeitos"
          value={data.meta.totalDefects}
        />

        {/* Produção Total */}
        <KpiCard
          label="Produção Total"
          value={data.meta.totalProduction}
        />

        {/* Tendência */}
        {anterior && atual ? (
          <TendenciaPpm
            anterior={anterior.ppm!}
            atual={atual.ppm!}
            labelAnterior={anterior.month}
            labelAtual={atual.month}
          />
        ) : (
          <div />
        )}
      </div>

      {/* ===============================
          RESPONSABILIDADE POR MÊS
      =============================== */}
      <ResponsabilidadePorMes
  data={data.responsabilidadeMensal}
  ppmMonthlyTrend={data.ppmMonthlyTrend}
/>

      {/* ===============================
          CATEGORIA POR MÊS
      =============================== */}
      <CategoriaPorMes
        data={data.categoriaMensal}
        ppmMonthlyTrend={data.ppmMonthlyTrend}
      />
    </div>
  );
}