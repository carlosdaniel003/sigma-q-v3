export function CatalogoHeader({ title }: { title: string }) {
  return (
    <h2 style={{ marginBottom: 16, color: "var(--brand)" }}>
      {title}
    </h2>
  );
}