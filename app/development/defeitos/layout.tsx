import React from "react";
import "./defeitos.css";

export const metadata = {
  title: "Classificação de Defeitos - SIGMA-Q",
};

export default function DefeitosLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="defeitos-wrapper">
      {children}
    </div>
  );
}