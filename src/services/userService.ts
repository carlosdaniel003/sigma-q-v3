import fs from "fs";
import path from "path";

// Caminho do JSON
const usersPath = path.join(process.cwd(), "src/data/users.json");

// Lê o arquivo JSON
function readUsers() {
  const data = fs.readFileSync(usersPath, "utf8");
  return JSON.parse(data);
}

// Salva no arquivo JSON
function writeUsers(users: any[]) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

export const userService = {
  getAll() {
    return readUsers();
  },

  getById(id: number) {
    return readUsers().find(u => u.id === id);
  },

  getByUsername(username: string) {
    return readUsers().find(u => u.username === username);
  },

  createUser({ username, passwordHash, role }: any) {
    const users = readUsers();

    const newUser = {
      id: Date.now(),
      username,
      passwordHash,
      role
    };

    users.push(newUser);
    writeUsers(users);
    return newUser;
  },

  updateUser(id: number, data: any) {
    const users = readUsers();
    const index = users.findIndex(u => u.id === id);

    if (index === -1) return null;

    users[index] = { ...users[index], ...data };
    writeUsers(users);

    return users[index];
  },

  deleteUser(id: number) {
    const users = readUsers().filter(u => u.id !== id);
    writeUsers(users);
  }
}