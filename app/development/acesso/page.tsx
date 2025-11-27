"use client";

import { useEffect, useState } from "react";
// Certifique-se de que este caminho está correto no seu projeto
// Se não tiver o serviço real, o código vai dar erro ao rodar
import { accessService } from "@/services/accessService";

export default function AcessoPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [modalUser, setModalUser] = useState<any | null>(null);

  useEffect(() => {
    // Carrega usuários ao iniciar
    accessService.list().then(setUsers).catch(console.error);
  }, []);

  function openEdit(user: any) {
    setModalUser({ ...user });
  }

  function openCreate() {
    setModalUser({ id: null, username: "", role: "viewer" });
  }

  function closeModal() {
    setModalUser(null);
  }

  async function saveUser() {
    if (!modalUser) return;

    // Criar
    if (!modalUser.id) {
      const created = await accessService.create({
        username: modalUser.username,
        role: modalUser.role,
        password: modalUser.password || "1234", // senha padrão se vazia
      });

      setUsers([...users, created]);
      closeModal();
      return;
    }

    // Editar
    const updated = await accessService.update(modalUser.id, {
      username: modalUser.username,
      role: modalUser.role,
      ...(modalUser.password ? { password: modalUser.password } : {}),
    });

    setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
    closeModal();
  }

  function deleteUser(id: number) {
    if (confirm("Tem certeza que deseja remover este usuário?")) {
      accessService.remove(id).then(() => {
        setUsers(users.filter((u) => u.id !== id));
      });
    }
  }

  // --- FUNÇÃO ADICIONADA ---
  async function saveToDisk() {
    const result = await accessService.saveAll(users);
    if (result.ok) {
      alert("Alterações salvas com sucesso!");
    } else {
      alert("Erro ao salvar alterações.");
    }
  }

  return (
    <div className="access-container">
      <div className="access-title">Gerenciamento de Acesso</div>

      <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
  <button className="login-btn" onClick={openCreate} style={{ width: "auto" }}>
    + Criar Usuário
  </button>

  <button
    className="login-btn"
    onClick={saveToDisk}
    style={{
      width: "auto",
      background: "#22c55e", // verde premium
    }}
  >
    Salvar Alterações
  </button>
</div>

      <table className="access-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuário</th>
            <th>Regra</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>
                <span className={`badge ${u.role}`}>{u.role}</span>
              </td>
              <td className="user-actions">
                <button className="btn-edit" onClick={() => openEdit(u)}>
                  Editar
                </button>
                <button className="btn-delete" onClick={() => deleteUser(u.id)}>
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- INÍCIO DO MODAL --- */}
      {modalUser && (
        <div className="modal">
          <div className="modal-content">
            <h2>{modalUser.id ? "Editar Usuário" : "Criar Usuário"}</h2>

            {/* Campo Usuário */}
            <label>Usuário</label>
            <input
              className="input"
              value={modalUser.username}
              onChange={(e) =>
                setModalUser({ ...modalUser, username: e.target.value })
              }
            />

            {/* Campo Regra (Role) */}
            <label>Papel</label>
            <select
              className="input"
              value={modalUser.role}
              onChange={(e) =>
                setModalUser({ ...modalUser, role: e.target.value })
              }
            >
              <option value="admin">Admin</option>
              <option value="dev">Dev</option>
              <option value="viewer">Viewer</option>
            </select>

            {/* Campo Senha (Opcional na edição) */}
            <label>
              {modalUser.id ? "Nova Senha (opcional)" : "Senha"}
            </label>
            <input
              className="input"
              type="password"
              placeholder={
                modalUser.id ? "Deixar em branco para não alterar" : ""
              }
              onChange={(e) =>
                setModalUser({ ...modalUser, password: e.target.value })
              }
            />

            <div className="modal-actions">
              <button onClick={saveUser}>Salvar</button>
              <button className="secondary" onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- FIM DO MODAL --- */}
    </div>
  );
}