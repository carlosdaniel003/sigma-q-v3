import { loginUser, loginAsGuest } from "@/services/authService";
import { saveUser } from "@/services/userStorage";

export function logout() {
  localStorage.removeItem("sigma_user");
  document.cookie =
    "sigma_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  window.location.href = "/login";
}

export async function login(username: string, password: string) {
  const result = await loginUser(username, password);

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const user = result.user;

  saveUser(user);

  document.cookie = `sigma_auth=${JSON.stringify(user)}; path=/; max-age=86400; SameSite=Strict`;

  return { ok: true, user };
}

export function loginGuest() {
  const result = loginAsGuest();

  // 🔒 força role correto
  const user = {
    ...result.user,
    role: "viewer",
  };

  saveUser(user);

  document.cookie = `sigma_auth=${JSON.stringify(user)}; path=/; max-age=3600; SameSite=Strict`;

  return { ok: true, user };
}