"use client";

import React, { useState } from "react";
import { login, loginGuest } from "@/core/auth/login";
import { 
  UserIcon, 
  LockClosedIcon, 
  ArrowRightIcon,
  EyeIcon,       
  EyeSlashIcon   
} from "@heroicons/react/24/outline";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(username, password);

      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError("Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  }

  function enterGuest() {
    loginGuest();
    window.location.href = "/dashboard";
  }

  return (
    <div style={{ 
      height: "100vh", 
      width: "100vw", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "radial-gradient(circle at 50% 10%, #1e293b 0%, #020617 100%)",
      color: "#e2e8f0"
    }}>
      
      {/* CSS para esconder o olho do Edge e animar entrada */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.6s ease-out forwards; }

        /* Remove o olho nativo do Edge/IE */
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

      <div className="fade-in" style={{
        width: "100%",
        maxWidth: "400px",
        padding: "40px",
        borderRadius: "24px",
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}>
        
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ 
            fontSize: "2rem", 
            fontWeight: "800", 
            marginBottom: "8px",
            color: "#fff",
            letterSpacing: "-1px"
          }}>
            SIGMA-Q
          </h1>
          <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>
            Área restrita — autentique-se
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Input Usuário */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}>
              Login
            </label>
            <div style={{ position: "relative" }}>
              <UserIcon width={20} style={{ position: "absolute", left: 14, top: 12, color: "rgba(255,255,255,0.4)" }} />
              <input
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Input Senha */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}>
              Acesso
            </label>
            <div style={{ position: "relative" }}>
              <LockClosedIcon width={20} style={{ position: "absolute", left: 14, top: 12, color: "rgba(255,255,255,0.4)" }} />
              
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{...inputStyle, paddingRight: "42px"}}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                    position: "absolute",
                    right: 14,
                    top: 12,
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.4)",
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                 {showPassword ? (
                    <EyeSlashIcon width={20} />
                 ) : (
                    <EyeIcon width={20} />
                 )}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ 
              color: "#fca5a5", 
              fontSize: "0.85rem", 
              textAlign: "center",
              background: "rgba(239, 68, 68, 0.1)",
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid rgba(239, 68, 68, 0.2)"
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                color: "#fff",
                fontWeight: "700",
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.4)"
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
              {!loading && <ArrowRightIcon width={18} />}
            </button>

            <button
              type="button"
              onClick={enterGuest}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              }}
            >
              Entrar como convidado
            </button>
          </div>

          <div style={{ textAlign: "center", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", marginTop: "10px" }}>
            Esqueceu a senha? Contacte o administrador.
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px 12px 42px", 
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(0,0,0,0.2)",
  color: "#fff",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box"
};