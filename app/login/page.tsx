"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error);

    localStorage.setItem("sigma_user", JSON.stringify(data.user));
    window.location.href = "/dashboard";
  }

  function enterGuest() {
    const guest = { username: "guest", role: "guest" };
    localStorage.setItem("sigma_user", JSON.stringify(guest));
    window.location.href = "/dashboard";
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* TÍTULOS */}
        <div className="login-title">SIGMA-Q</div>
        <div className="login-subtitle">Área restrita — autentique-se</div>

        {/* FORM */}
        <form onSubmit={handleLogin}>
          
          {/* LOGIN */}
          <div className="field-label">Login</div>
          <input
            className="login-input"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* SENHA */}
          <div className="field-label" style={{ marginTop: "18px" }}>
            Acesso
          </div>

          <div className="password-wrapper">
            <input
              className="login-input"
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            
          </div>

          {/* ERRO */}
          {error && (
            <div style={{ color: "#f87171", marginTop: "10px" }}>
              {error}
            </div>
          )}

          {/* BOTÕES */}
          <div className="btn-row">
            <button className="login-btn" type="submit">
              Entrar
            </button>

            <button
              type="button"
              className="login-btn btn-secondary"
              onClick={enterGuest}
            >
              Entrar como convidado
            </button>
          </div>

          {/* RODAPÉ */}
          <div className="footer-text">
            Esqueceu a senha? Contacte o administrador.
          </div>

        </form>
      </div>
    </div>
  );
}