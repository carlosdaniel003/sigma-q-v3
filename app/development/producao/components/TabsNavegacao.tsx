"use client";

import React from "react";

export default function TabsNavegacao({
  activeTab,
  setActiveTab,
  selectedCategory,
}: any) {
  return (
    <div className="tabs-header tabs-spaced">
      <button
        className={`tab-item ${activeTab === "problemas" ? "active" : ""}`}
        onClick={() => setActiveTab("problemas")}
      >
        Problemas
      </button>

      <button
        className={`tab-item ${
          activeTab === "divergencias" ? "active" : ""
        } ${!selectedCategory ? "disabled" : ""}`}
        onClick={() => {
          if (!selectedCategory) return;
          setActiveTab("divergencias");
        }}
      >
        Divergências
      </button>

      <button
        className={`tab-item ${
          activeTab === "diagnostico" ? "active" : ""
        } ${!selectedCategory ? "disabled" : ""}`}
        onClick={() => {
          if (!selectedCategory) return;
          setActiveTab("diagnostico");
        }}
      >
        Diagnóstico
      </button>
    </div>
  );
}