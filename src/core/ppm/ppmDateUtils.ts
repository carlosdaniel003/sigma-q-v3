export function parseDateSafe(value: any): Date | null {
  if (!value) return null;

  // Date real
  if (value instanceof Date && !isNaN(value.getTime())) {
    const d = new Date(value);
    d.setHours(12, 0, 0, 0);
    return d;
  }

  // Excel serial
  if (typeof value === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const d = new Date(excelEpoch.getTime() + value * 86400000);
    d.setHours(12, 0, 0, 0);
    return d;
  }

  // String
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      parsed.setHours(12, 0, 0, 0);
      return parsed;
    }
  }

  return null;
}