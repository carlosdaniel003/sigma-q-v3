"use client";

import React from "react";

interface KpiCardProps {
  label: string;
  value: number | string;
}

export default function KpiCard({
  label,
  value,
}: KpiCardProps) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 20,
      }}
    >
      <div style={{ opacity: 0.7, fontSize: 13 }}>
        {label}
      </div>

      <div
        style={{
          fontSize: "1.8rem",
          fontWeight: 700,
          marginTop: 6,
        }}
      >
        {value}
      </div>
    </div>
  );
}