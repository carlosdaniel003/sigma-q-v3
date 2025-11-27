import { getUser } from "@/services/userStorage";

export function requireAdmin() {
  const user = getUser();

  // 1 — Não logado
  if (!user) {
    return { allowed: false, redirect: "/login" };
  }

  // 2 — Se é Guest → bloquear
  if (user.role === "guest") {
    return { allowed: false, redirect: "/dashboard" };
  }

  // 3 — Admin → permitir
  return { allowed: true, redirect: null };
}

export function requireLogin() {
  const user = getUser();

  if (!user) {
    return { allowed: false, redirect: "/login" };
  }

  return { allowed: true, redirect: null };
}