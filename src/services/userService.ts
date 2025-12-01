import { db } from "@/lib/db";

// Converter uma linha do banco para o formato esperado
function mapUser(row: any) {
  return {
    id: row.id,
    username: row.username,
    password: row.password,   // sempre use a coluna real
    role: row.role,
  };
}

export const userService = {
  // Listar todos os usuários
  async getAll() {
    const result = await db.execute("SELECT * FROM users ORDER BY id ASC");
    return result.rows.map(mapUser);
  },

  // Buscar por ID
  async getById(id: number) {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE id = ? LIMIT 1",
      args: [id],
    });
    return result.rows.length ? mapUser(result.rows[0]) : null;
  },

  // Buscar por username
  async getByUsername(username: string) {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE username = ? LIMIT 1",
      args: [username],
    });
    return result.rows.length ? mapUser(result.rows[0]) : null;
  },

  // Criar novo usuário
  async createUser({ username, password, role }: any) {
    const result = await db.execute({
      sql: "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      args: [username, password, role],
    });

    return {
      id: result.lastInsertRowid,
      username,
      password,
      role,
    };
  },

  // Editar usuário
  async updateUser(id: number, data: any) {
    const fields = [];
    const values = [];

    if (data.username) {
      fields.push("username = ?");
      values.push(data.username);
    }

    if (data.password) {
      fields.push("password = ?");
      values.push(data.password);
    }

    if (data.role) {
      fields.push("role = ?");
      values.push(data.role);
    }

    if (fields.length === 0) return null;

    values.push(id);

    await db.execute({
      sql: `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      args: values,
    });

    return this.getById(id);
  },

  // Excluir usuário
  async deleteUser(id: number) {
    await db.execute({
      sql: "DELETE FROM users WHERE id = ?",
      args: [id],
    });
  }
};