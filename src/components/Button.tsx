// 1. src/components/Button.tsx
"use client";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export default function Button({ variant = "primary", className = "", ...rest }: Props) {
  const base = "px-4 py-2 rounded-md font-medium transition";
  const style =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-700"
      : variant === "secondary"
      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
      : "bg-transparent text-indigo-600 hover:underline";

  return <button className={`${base} ${style} ${className}`} {...rest} />;
}