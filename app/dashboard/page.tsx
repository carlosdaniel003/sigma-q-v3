"use client";

import React, { useEffect, useState } from "react";
import { getUser } from "@/services/userStorage";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [isGuest, setIsGuest] = useState<boolean | null>(null);

  useEffect(() => {
    const user = getUser();

    // 🔥 USUÁRIO LOGADO → REDIRECIONA IMEDIATAMENTE
    if (user && user.role !== "viewer") {
      window.location.replace("/development/dashboard");
      return;
    }

    // 🔒 SOMENTE CONVIDADO CHEGA AQUI
    setIsGuest(true);
    setMounted(true);
  }, []);

  // ⛔ Não renderiza nada até decidir
  if (!mounted || !isGuest) return null;

  function handleGoToLogin() {
    // 🔥 LIMPA ESTADO (bug do Vercel)
    localStorage.removeItem("sigma_user");
    document.cookie =
      "sigma_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    window.location.href = "/login";
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        textAlign: "center",
        color: "var(--text-primary, #fff)",
        padding: "24px",
      }}
    >
      {/* TÍTULO */}
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: 700,
          marginBottom: "12px",
        }}
      >
        Bem-vindo, convidado!
      </h1>

      {/* SUBTEXTO */}
      <p
        style={{
          opacity: 0.75,
          fontSize: "1.05rem",
          maxWidth: "520px",
          marginBottom: "28px",
        }}
      >
        Você está usando o sistema como convidado.  
        Algumas funcionalidades estão bloqueadas.
      </p>

      {/* CTA */}
      <button
        onClick={handleGoToLogin}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "14px 36px",
          fontSize: "1rem",
          fontWeight: 600,
          color: "#fff",
          borderRadius: "14px",
          border: "none",
          cursor: "pointer",
          background:
            "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          boxShadow: "0 10px 30px rgba(59,130,246,0.35)",
          transition: "all 0.25s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow =
            "0 14px 40px rgba(59,130,246,0.45)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            "0 10px 30px rgba(59,130,246,0.35)";
        }}
      >
        Fazer login
        <ArrowRightIcon width={18} />
      </button>
    </div>
  );
}