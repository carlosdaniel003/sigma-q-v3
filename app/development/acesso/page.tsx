"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { accessService } from "@/services/accessService";

type User = {
  id: number | null;
  username: string;
  role: "admin" | "dev" | "viewer";
  password?: string;
};

export default function AcessoPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null
  );
  const [confirmData, setConfirmData] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [errors, setErrors] = useState<{ username?: string; password?: string }>(
    {}
  );

  // 🔍 BUSCA
  const [search, setSearch] = useState("");

  /* =========================================================
      Toast
  ========================================================= */
  const showToast = useCallback((message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 8000);
  }, []);

  /* =========================================================
      Carregar usuários
  ========================================================= */
  useEffect(() => {
    accessService.list().then(setUsers).catch(console.error);
  }, []);

  /* =========================================================
      Abrir modal criar/editar
  ========================================================= */
  const openEdit = useCallback((user: User) => {
    setModalUser({ ...user });
    setErrors({});
  }, []);

  const openCreate = useCallback(() => {
    setModalUser({ id: null, username: "", role: "viewer" });
    setErrors({});
  }, []);

  const closeModal = useCallback(() => {
    setModalUser(null);
    setErrors({});
  }, []);

  /* =========================================================
      Validação inteligente
  ========================================================= */
  const validate = useCallback(() => {
    if (!modalUser) return false;

    const newErrors: any = {};

    if (!modalUser.username.trim()) {
      newErrors.username = "O nome de usuário é obrigatório.";
    } else if (modalUser.username.length < 3) {
      newErrors.username = "O nome deve ter ao menos 3 caracteres.";
    } else if (modalUser.username.includes(" ")) {
      newErrors.username = "O nome de usuário não pode conter espaços.";
    } else {
      const exists = users.some(
        (u) => u.username === modalUser.username && u.id !== modalUser.id
      );
      if (exists) newErrors.username = "Já existe um usuário com este nome.";
    }

    if (!modalUser.id) {
      if (!modalUser.password || modalUser.password.trim().length < 4) {
        newErrors.password = "A senha deve ter ao menos 4 caracteres.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [modalUser, users]);

  /* =========================================================
      Atualizar campo
  ========================================================= */
  const updateField = useCallback(
    (field: keyof User, value: any) => {
      setModalUser((prev) => (prev ? { ...prev, [field]: value } : prev));
      setTimeout(() => validate(), 0);
    },
    [validate]
  );

  /* =========================================================
      Criar / Editar
  ========================================================= */
  const saveUser = useCallback(async () => {
    if (!modalUser) return;

    if (!validate()) {
      showToast("Verifique os campos e tente novamente.", "error");
      return;
    }

    // Criar
    if (!modalUser.id) {
      const created = await accessService.create({
        username: modalUser.username,
        role: modalUser.role,
        password: modalUser.password || "1234",
      });

      setUsers((prev) => [...prev, created]);
      showToast(`Usuário ${created.username} criado com sucesso!`);
      closeModal();
      return;
    }

    // Editar
    const updated = await accessService.update(modalUser.id, {
      username: modalUser.username,
      role: modalUser.role,
      ...(modalUser.password ? { password: modalUser.password } : {}),
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === updated.id ? updated : u))
    );

    showToast(`Usuário ${updated.username} atualizado!`);
    closeModal();
  }, [modalUser, validate, showToast, closeModal]);

  /* =========================================================
      Remover
  ========================================================= */
  function openConfirm(message: string, onConfirm: () => void) {
    setConfirmData({ message, onConfirm });
  }

  const deleteUser = useCallback(
    (id: number) => {
      const username = users.find((u) => u.id === id)?.username;

      openConfirm(
        `Tem certeza que deseja remover o usuário "${username}" permanentemente?`,
        async () => {
          await accessService.remove(id);
          setUsers((prev) => prev.filter((u) => u.id !== id));
          showToast(`Usuário ${username} removido!`, "error");
          setConfirmData(null);
        }
      );
    },
    [users, showToast]
  );

  /* =========================================================
      Render Linhas (com busca)
  ========================================================= */
  const renderedRows = useMemo(() => {
    const filtered = users.filter((u) =>
      u.username.toLowerCase().includes(search.toLowerCase())
    );

    return filtered.map((u) => (
      <tr key={u.id} className="fade-in-row">
        <td>{u.id}</td>
        <td>{u.username}</td>
        <td>
          <span className={`badge ${u.role}`}>{u.role}</span>
        </td>
        <td className="user-actions">
          <button className="btn-edit" onClick={() => openEdit(u)}>
            Editar
          </button>
          <button className="btn-delete" onClick={() => deleteUser(u.id!)}>
            Remover
          </button>
        </td>
      </tr>
    ));
  }, [users, search, openEdit, deleteUser]);

  /* =========================================================
      JSX FINAL
  ========================================================= */
  return (
    <div className="acesso-wrapper">
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      <div className="access-container">
        <div className="access-title">Gerenciamento de Acesso</div>

        {/* 🔹 TOOLBAR Premium com Busca SIGMA-Q */}
        <div className="toolbar">
          <button className="btn-create" onClick={openCreate}>
            + Criar Usuário
          </button>

          <div className="search-box">
            <div className="search-icon">🔍</div>
            <input
              className="search-input"
              placeholder="Buscar usuário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tabela */}
        <table className="access-table fade-in">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuário</th>
              <th>Regra</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>{renderedRows}</tbody>
        </table>
      </div>

      {/* Modal Criar/Editar */}
      {modalUser && (
        <div className="modal">
          <div className="modal-content fade-in">
            <h2>{modalUser.id ? "Editar Usuário" : "Criar Usuário"}</h2>

            <label>Usuário</label>
            <input
              className="input"
              value={modalUser.username}
              onChange={(e) => updateField("username", e.target.value)}
            />
            {errors.username && (
              <div className="field-error">{errors.username}</div>
            )}

            <label>Papel</label>
            <select
              className="input"
              value={modalUser.role}
              onChange={(e) => updateField("role", e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="dev">Dev</option>
              <option value="viewer">Viewer</option>
            </select>

            <label>{modalUser.id ? "Nova Senha" : "Senha"}</label>
            <input
              className="input"
              type="password"
              onChange={(e) => updateField("password", e.target.value)}
            />
            {errors.password && (
              <div className="field-error">{errors.password}</div>
            )}

            <div className="modal-actions">
              <button
                onClick={saveUser}
                disabled={Object.keys(errors).length > 0}
                className={Object.keys(errors).length > 0 ? "btn-disabled" : ""}
              >
                Salvar
              </button>

              <button className="secondary" onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação */}
      {confirmData && (
        <div className="modal">
          <div className="confirm-modal-content fade-in">
            <p className="confirm-text">{confirmData.message}</p>

            <div className="confirm-actions">
              <button
                className="confirm-btn danger"
                onClick={confirmData.onConfirm}
              >
                Remover
              </button>

              <button
                className="confirm-btn secondary"
                onClick={() => setConfirmData(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}