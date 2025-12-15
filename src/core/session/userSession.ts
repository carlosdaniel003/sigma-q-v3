import { getUser, saveUser, clearUser } from "@/services/userStorage";

// Função para pegar o usuário da sessão
export function getSessionUser() {
  const user = getUser();

  // Se o usuário não estiver logado, devolve o 'convidado' como default
  if (!user) {
    return {
      username: "Convidado",
      role: "viewer",  // "viewer" é o papel padrão para convidados
    };
  }

  // Retorna o usuário logado, se for admin, mantém como admin, senão é "viewer"
  if (user.role === "admin") {
    return user;
  }

  return {
    ...user,
    role: "viewer",  // Se for um convidado, garante o papel "viewer"
  };
}

// Função para verificar se o usuário é um convidado
export function isGuestUser() {
  const user = getSessionUser();
  return user.role === "viewer";  // "viewer" é o papel de convidado
}

// Função para verificar se o usuário é um administrador
export function isAdminUser() {
  const user = getSessionUser();
  return user.role === "admin";  // Verifica se o papel é "admin"
}

// Função para fazer logout e limpar a sessão
export function logout() {
  clearUser();  // Limpa o usuário armazenado no localStorage
}