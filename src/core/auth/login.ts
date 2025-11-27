import { loginUser, loginAsGuest } from "@/services/authService";
import { saveUser } from "@/services/userStorage";

export async function login(username: string, password: string) {
  const result = await loginUser(username, password);

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  saveUser(result.user);

  return { ok: true, user: result.user };
}

export function loginGuest() {
  const result = loginAsGuest();

  saveUser(result.user);

  return { ok: true, user: result.user };
}