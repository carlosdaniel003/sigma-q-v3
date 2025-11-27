import { getUser, saveUser, clearUser } from "@/services/userStorage";

export function getSessionUser() {
  return getUser();  
}

export function isGuestUser() {
  const user = getUser();
  return user?.role === "guest";
}

export function isAdminUser() {
  const user = getUser();
  return user?.role === "admin";
}

export function logout() {
  clearUser();
}