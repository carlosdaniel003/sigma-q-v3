import { users } from "@/lib/db/users";

let userDB = [...users]; // banco em memória

function fakeHash(str: string) {
  return btoa(str); // apenas para simular — depois trocamos por bcrypt
}

// Definição da função list antes do export para ser usada internamente se necessário
async function list() {
  return [...userDB];
}

async function create(data: {
  username: string;
  role: string;
  password: string;
}) {
  const newUser = {
    id: Date.now(),
    username: data.username,
    passwordHash: fakeHash(data.password),
    role: data.role,
  };

  userDB.push(newUser);
  return newUser;
}

async function update(id: number, data: any) {
  const index = userDB.findIndex((u) => u.id === id);
  if (index === -1) throw new Error("Usuário não encontrado");

  const updated = { ...userDB[index] };

  if (data.username !== undefined) updated.username = data.username;
  if (data.role !== undefined) updated.role = data.role;
  if (data.password !== undefined)
    updated.passwordHash = fakeHash(data.password);

  userDB[index] = updated;

  return updated;
}

async function remove(id: number) {
  userDB = userDB.filter((u) => u.id !== id);
  return true;
}

// Nova função adicionada conforme solicitado
async function saveToDisk() {
  // A função saveAll precisa ser implementada ou acessível aqui.
  // Assumindo que accessService.saveAll se refere a uma chamada interna ou externa:
  
  // Se saveAll for um método deste mesmo serviço que você quer chamar:
  const result = await saveAll(userDB); 
  
  if (result.ok) {
    alert("Alterações salvas com sucesso!");
  } else {
    alert("Erro ao salvar alterações.");
  }
}

// Função auxiliar saveAll necessária para saveToDisk funcionar
async function saveAll(users: any[]) {
  const res = await fetch("/api/users/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(users),
  });

  return res.json();
}

export const accessService = {
  list,
  create,
  update,
  remove,
  saveAll,
  saveToDisk, // Adicionei saveToDisk na exportação também
};