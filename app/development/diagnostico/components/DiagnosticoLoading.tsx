"use client";

import { useState, useEffect } from "react";

export default function DiagnosticoLoading() {
  const [messageIndex, setMessageIndex] = useState(0);

  // Mensagens que vão alternar para dar sensação de progresso real
  const messages = [
    "Acessando base de dados...",
    "Calculando indicadores de PPM...",
    "Verificando histórico de falhas...",
    "Identificando padrões de reincidência...",
    "Gerando insights de melhoria...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1500); // Troca de mensagem a cada 1.5 segundos

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "400px", // Altura mínima para ocupar espaço na tela
        width: "100%",
        color: "#ffffff",
        gap: 24,
      }}
    >
      {/* --- ROBOT SVG ANIMADO --- */}
      <div className="relative">
        {/* Efeito de brilho atrás do robo */}
        <div 
          className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse" 
          style={{ transform: "scale(1.5)" }}
        />
        
        {/* SVG do Robô */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 animate-bounce-slow" // Animação suave
          style={{ animationDuration: "3s" }}
        >
          {/* Cabeça */}
          <rect x="3" y="6" width="18" height="14" rx="4" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
          {/* Olhos */}
          <circle cx="8.5" cy="11.5" r="1.5" fill="#3b82f6" className="animate-pulse" />
          <circle cx="15.5" cy="11.5" r="1.5" fill="#3b82f6" className="animate-pulse" />
          {/* Boca (onda) */}
          <path d="M9 16C9 16 10 17 12 17C14 17 15 16 15 16" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          {/* Antena */}
          <path d="M12 2V6" stroke="#60a5fa" strokeWidth="1.5" />
          <circle cx="12" cy="2" r="1.5" fill="#60a5fa" className="animate-ping" style={{ animationDuration: '2s' }} />
          {/* Orelhas */}
          <path d="M1 10V14" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <path d="M23 10V14" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* --- TEXTOS --- */}
      <div style={{ textAlign: "center" }}>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#e2e8f0",
            marginBottom: 8,
          }}
        >
          Diagnóstico Inteligente
        </h3>
        
        {/* Mensagem dinâmica com fade effect (simples) */}
        <p
          key={messageIndex} // Key ajuda a react a animar a troca se usar framer-motion, aqui reseta o DOM
          style={{
            fontSize: 14,
            color: "#94a3b8",
            minHeight: "20px",
            animation: "fadeIn 0.5s ease-in-out"
          }}
        >
          {messages[messageIndex]}
        </p>
      </div>

      {/* Estilos inline para animação simples se não tiver tailwind config completa */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-bounce-slow {
            animation: bounce-slow 3s infinite;
        }
        @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}