export async function loginUser(username: string, password: string) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { ok: false, error: data.error };
  }

  return { ok: true, user: data.user };
}

export function loginAsGuest() {
  return {
    ok: true,
    user: {
      id: "guest",
      username: "Convidado",
      role: "viewer", // ✅ ROLE CORRETO (ANTES ESTAVA "guest")
    },
  };
}