"use client";

import { useState } from "react";
import { login, loginGuest } from "@/core/auth/login";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
  e.preventDefault();
  setError("");

  const result = await login(username, password);

  if (!result.ok) {
    setError(result.error);
    return;
  }

  window.location.href = "/dashboard";
}

  function enterGuest() {
  loginGuest();
  window.location.href = "/dashboard";
}

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-title">SIGMA-Q</div>
        <div className="login-subtitle">Área restrita — autentique-se</div>

        <form onSubmit={handleLogin}>
          <div className="field-label">Login</div>
          <input
            className="login-input"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <div className="field-label" style={{ marginTop: "18px" }}>
            Acesso
          </div>

          <div className="password-wrapper">
            <input
              className="login-input"
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ color: "#f87171", marginTop: "10px" }}>{error}</div>
          )}

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

          <div className="footer-text">
            Esqueceu a senha? Contacte o administrador.
          </div>
        </form>
      </div>
    </div>
  );
}