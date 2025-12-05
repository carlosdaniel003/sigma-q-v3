import { loginUser, loginAsGuest } from "@/services/authService";
import { saveUser } from "@/services/userStorage";

// Função chamada pelo botão "Sair" da Sidebar
export function logout() {
  // 1. Limpa Frontend
  localStorage.removeItem("sigma_user");

  // 2. Limpa Backend (Cookie) - Define data no passado para expirar
  document.cookie = "sigma_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

  // 3. Redireciona
  window.location.href = "/login";
}

export async function login(username: string, password: string) {
  const result = await loginUser(username, password);

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const user = result.user;

  // 1. Salva no LocalStorage (Para a Sidebar exibir o nome, etc)
  saveUser(user);

  // 2. Salva no Cookie (Para o Middleware liberar a rota)
  // max-age=86400 (1 dia)
  document.cookie = `sigma_auth=${JSON.stringify(user)}; path=/; max-age=86400; SameSite=Strict`;

  return { ok: true, user };
}

export function loginGuest() {
  const result = loginAsGuest();
  const user = result.user;

  saveUser(user);
  
  // Convidado expira em 1 hora (3600s) opcionalmente
  document.cookie = `sigma_auth=${JSON.stringify(user)}; path=/; max-age=3600; SameSite=Strict`;

  return { ok: true, user };
}