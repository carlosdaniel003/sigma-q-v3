  "use client";

  import { useEffect, useState, useCallback, useMemo } from "react";
  import { accessService } from "@/services/accessService";

  // Usando os ícones que você JÁ TEM no projeto (Heroicons)
  import { 
    ShieldCheckIcon, 
    MagnifyingGlassIcon, 
    PlusIcon, 
    PencilSquareIcon, 
    TrashIcon, 
    UserIcon, 
    KeyIcon, 
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
  } from "@heroicons/react/24/outline";

  // Mantendo o tipo original para não quebrar seu Service
  type User = {
    id: number | null;
    username: string;
    role: "admin" | "dev" | "viewer";
    password?: string;
  };

  export default function AcessoPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [modalUser, setModalUser] = useState<User | null>(null);
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
    const [confirmData, setConfirmData] = useState<{ message: string; onConfirm: () => void } | null>(null);
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
    const [search, setSearch] = useState("");

    // --- TOAST ---
    const showToast = useCallback((message: string, type = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    }, []);

    // --- CARREGAR DADOS ---
    useEffect(() => {
      accessService.list().then(setUsers).catch(console.error);
    }, []);

    // --- AÇÕES ---
    const openEdit = (user: User) => { setModalUser({ ...user }); setErrors({}); };
    const openCreate = () => { setModalUser({ id: null, username: "", role: "viewer" }); setErrors({}); };
    const closeModal = () => { setModalUser(null); setErrors({}); };

    // --- VALIDAÇÃO ---
    const validate = useCallback(() => {
      if (!modalUser) return false;
      const newErrors: any = {};

      if (!modalUser.username.trim()) newErrors.username = "Nome obrigatório.";
      else if (modalUser.username.length < 3) newErrors.username = "Mínimo 3 caracteres.";
      else if (modalUser.username.includes(" ")) newErrors.username = "Sem espaços.";
      else {
        const exists = users.some(u => u.username === modalUser.username && u.id !== modalUser.id);
        if (exists) newErrors.username = "Usuário já existe.";
      }

      if (!modalUser.id && (!modalUser.password || modalUser.password.length < 4)) {
        newErrors.password = "Senha min. 4 caracteres.";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [modalUser, users]);

    // --- SALVAR ---
    const saveUser = async () => {
      if (!validate() || !modalUser) return;

      try {
        if (!modalUser.id) {
          const created = await accessService.create({ ...modalUser, password: modalUser.password || "1234" });
          setUsers(prev => [...prev, created]);
          showToast(`Usuário ${created.username} criado!`);
        } else {
          const updated = await accessService.update(modalUser.id, modalUser);
          setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
          showToast(`Usuário atualizado!`);
        }
        closeModal();
      } catch (e) {
        console.error(e);
        showToast("Erro ao salvar.", "error");
      }
    };

    // --- REMOVER ---
    const deleteUser = (id: number) => {
      const u = users.find(u => u.id === id);
      setConfirmData({
        message: `Remover acesso de "${u?.username}"?`,
        onConfirm: async () => {
          await accessService.remove(id);
          setUsers(prev => prev.filter(x => x.id !== id));
          showToast("Acesso revogado.", "error");
          setConfirmData(null);
        }
      });
    };

    const filteredUsers = useMemo(() => 
      users.filter(u => u.username.toLowerCase().includes(search.toLowerCase())),
    [users, search]);

    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: "24px", color: "#e2e8f0" }}>
        
        {/* TOAST */}
        {toast && (
          <div style={{
            position: "fixed", top: 20, right: 20, zIndex: 9999,
            background: toast.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(34,197,94,0.9)',
            padding: "12px 24px", borderRadius: "8px", color: "#fff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)", backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", gap: 10, animation: "fadeIn 0.3s ease"
          }}>
            {toast.type === 'error' ? <ExclamationTriangleIcon width={20}/> : <CheckCircleIcon width={20}/>}
            {toast.message}
          </div>
        )}

        {/* HEADER */}
        <header style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "16px" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "12px" }}>
            <ShieldCheckIcon width={32} style={{ color: "#5fb4ff" }} />
            Gerenciamento de Acesso
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", marginTop: "4px" }}>
            Controle de credenciais e níveis de permissão do sistema.
          </p>
        </header>

        {/* TOOLBAR */}
        <div style={{ 
          padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px"
        }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
            <MagnifyingGlassIcon width={18} style={{ position: "absolute", left: 12, top: 12, color: "rgba(255,255,255,0.4)" }} />
            <input 
              type="text" placeholder="Buscar usuário..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "10px 10px 10px 38px", background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", outline: "none", boxSizing: "border-box"
              }}
            />
          </div>
          <button onClick={openCreate} style={{
            background: "#3b82f6", color: "#fff", border: "none", padding: "10px 16px",
            borderRadius: "8px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
          }}>
            <PlusIcon width={18} /> Novo Usuário
          </button>
        </div>

        {/* TABELA */}
        <div style={{ flex: 1, overflow: "hidden", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", display: "flex", flexDirection: "column" }}>
          <div style={{ overflowY: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead style={{ background: "rgba(255,255,255,0.05)", position: "sticky", top: 0 }}>
                <tr>
                  <th style={{ textAlign: "left", padding: "16px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", fontSize: "0.75rem" }}>Usuário</th>
                  <th style={{ textAlign: "left", padding: "16px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", fontSize: "0.75rem" }}>Regra</th>
                  <th style={{ textAlign: "right", padding: "16px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", fontSize: "0.75rem" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "16px", color: "#fff", fontWeight: 500 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <UserIcon width={18} color="rgba(255,255,255,0.8)" />
                        </div>
                        <div>
                          <div>{user.username}</div>
                          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{
                        padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700,
                        background: user.role === "admin" ? "rgba(59, 130, 246, 0.15)" : user.role === "dev" ? "rgba(168, 85, 247, 0.15)" : "rgba(255, 255, 255, 0.1)",
                        color: user.role === "admin" ? "#60a5fa" : user.role === "dev" ? "#a855f7" : "#94a3b8",
                        border: `1px solid ${user.role === "admin" ? "rgba(59, 130, 246, 0.3)" : user.role === "dev" ? "rgba(168, 85, 247, 0.3)" : "rgba(255, 255, 255, 0.2)"}`
                      }}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button onClick={() => openEdit(user)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "8px", cursor: "pointer", color: "rgba(255,255,255,0.8)" }}>
                          <PencilSquareIcon width={18} />
                        </button>
                        <button onClick={() => deleteUser(user.id!)} style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "6px", padding: "8px", cursor: "pointer", color: "#f87171" }}>
                          <TrashIcon width={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
                Nenhum usuário encontrado.
              </div>
            )}
          </div>
        </div>

        {/* MODAL */}
        {(modalUser || confirmData) && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "24px", width: "400px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
              
              {confirmData ? (
                <>
                  <h3 style={{ marginBottom: "16px", color: "#fff" }}>Confirmação</h3>
                  <p style={{ color: "#cbd5e1", marginBottom: "24px" }}>{confirmData.message}</p>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button onClick={() => setConfirmData(null)} style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: "8px", cursor: "pointer" }}>Cancelar</button>
                    <button onClick={confirmData.onConfirm} style={{ padding: "8px 16px", background: "#ef4444", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Confirmar</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                    <h3 style={{ margin: 0, color: "#fff" }}>{modalUser?.id ? "Editar Usuário" : "Novo Usuário"}</h3>
                    <button onClick={closeModal} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}><XMarkIcon width={20}/></button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", marginBottom: "6px" }}>Usuário</label>
                      <div style={{ position: "relative" }}>
                        <UserIcon width={16} style={{ position: "absolute", left: 12, top: 12, color: "rgba(255,255,255,0.3)" }}/>
                        <input 
                          value={modalUser!.username} 
                          onChange={e => setModalUser({...modalUser!, username: e.target.value})}
                          style={{ width: "100%", padding: "10px 10px 10px 36px", background: "rgba(0,0,0,0.3)", border: errors.username ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", outline: "none", boxSizing: "border-box" }}
                        />
                      </div>
                      {errors.username && <span style={{ color: "#ef4444", fontSize: "0.75rem" }}>{errors.username}</span>}
                    </div>

                    <div>
                      <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", marginBottom: "6px" }}>Regra</label>
                      <select 
                        value={modalUser!.role}
                        onChange={e => setModalUser({...modalUser!, role: e.target.value as any})}
                        style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", outline: "none", boxSizing: "border-box" }}
                      >
                        <option value="viewer" style={{color: "black"}}>Viewer (Visualização)</option>
                        <option value="dev" style={{color: "black"}}>Developer</option>
                        <option value="admin" style={{color: "black"}}>Admin (Acesso Total)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", marginBottom: "6px" }}>{modalUser!.id ? "Nova Senha (Opcional)" : "Senha"}</label>
                      <div style={{ position: "relative" }}>
                        <KeyIcon width={16} style={{ position: "absolute", left: 12, top: 12, color: "rgba(255,255,255,0.3)" }}/>
                        <input 
                          type="password"
                          onChange={e => setModalUser({...modalUser!, password: e.target.value})}
                          style={{ width: "100%", padding: "10px 10px 10px 36px", background: "rgba(0,0,0,0.3)", border: errors.password ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", outline: "none", boxSizing: "border-box" }}
                        />
                      </div>
                      {errors.password && <span style={{ color: "#ef4444", fontSize: "0.75rem" }}>{errors.password}</span>}
                    </div>

                    <button onClick={saveUser} style={{ marginTop: "10px", padding: "12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>
                      Salvar Usuário
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }