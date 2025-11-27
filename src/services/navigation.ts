export function goTo(path: string) {
  if (typeof window !== "undefined") {
    window.location.href = path;
  }
}