import React from "react";

export default function DashboardPage() {
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100%",
      color: "var(--text-primary, #fff)" // Usa cor do tema ou fallback branco
    }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Bem-vindo, admin!
      </h1>
      <p style={{ opacity: 0.7, fontSize: "1.1rem" }}>
        Escolha uma área no menu lateral para iniciar.
      </p>
    </div>
  );
}