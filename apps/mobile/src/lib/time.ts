export function formatMinutes(minutes: number): string {
  const sign = minutes < 0 ? "-" : "";
  const absolute = Math.abs(minutes);
  const hours = Math.floor(absolute / 60);
  const rest = absolute % 60;

  return `${sign}${hours}h${String(rest).padStart(2, "0")}`;
}

export function formatSignedMinutes(minutes: number): string {
  if (minutes === 0) {
    return "0h00";
  }

  return `${minutes > 0 ? "+" : ""}${formatMinutes(minutes)}`;
}

export function decimalHoursToMinutes(value: string): number | null {
  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed * 60);
}

export function minutesToDecimalHours(minutes: number): string {
  return (minutes / 60).toFixed(2).replace(".", ",");
}

