"use client";

import React, { useState } from "react";
import { login, loginGuest } from "@/core/auth/login";

import {
  UserIcon,
  LockClosedIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

import "./login.css"; // <<< ADICIONE ISSO

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
    <div className="login-container fade-in">
      <div className="login-card">

        {/* TÍTULO */}
        <div className="login-header">
          <h1 className="login-title">SIGMA-Q</h1>
          <p className="login-subtitle">Acesso restrito — autentique-se</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="login-form">

          {/* Usuário */}
          <div className="field-block">
            <label className="field-label">Login</label>
            <div className="field-wrapper">
              <UserIcon className="field-icon" />
              <input
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="field-block">
            <label className="field-label">Senha</label>
            <div className="field-wrapper">
              <LockClosedIcon className="field-icon" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
              />

              <button
                type="button"
                className="toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* Botões */}
          <div className="btn-column">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Entrando..." : "Entrar"}
              {!loading && <ArrowRightIcon width={18} />}
            </button>

            <button
              type="button"
              className="btn-outline"
              onClick={enterGuest}
            >
              Entrar como convidado
            </button>
          </div>

          <p className="login-hint">
            Esqueceu a senha? Contacte o administrador.
          </p>
        </form>
      </div>
    </div>
  );
}