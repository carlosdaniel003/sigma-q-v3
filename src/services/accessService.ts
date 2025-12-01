export const accessService = {
  async list() {
    const res = await fetch("/api/users");
    return res.json();
  },

  async create(data: {
    username: string;
    role: string;
    password: string;
  }) {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.username,
        password: data.password,
        role: data.role,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erro ao criar usuário");
    }

    return res.json(); // retorna ID real do Turso
  },

  async update(id: number, data: any) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erro ao atualizar usuário");
    }

    return res.json();
  },

  async remove(id: number) {
    const res = await fetch(`/api/users/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erro ao remover usuário");
    }

    return res.json();
  },
};