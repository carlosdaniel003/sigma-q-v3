import DiagnosticoLoading from "./components/DiagnosticoLoading";

export default function Loading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100vh",
        // Fundo sólido para cobrir a transição de página
        backgroundColor: "#0f172a", 
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 9999
      }}
    >
      <DiagnosticoLoading />
    </div>
  );
}