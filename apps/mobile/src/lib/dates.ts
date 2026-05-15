const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export function isValidDateKey(dateKey: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey);
}

export function maxDateKey(first: string, second: string): string {
  return first >= second ? first : second;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function parseDateKey(dateKey: string): Date {
  if (!dateKey || !isValidDateKey(dateKey)) {
    return new Date();
  }

  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);

  return next;
}

export function eachDateKey(startKey: string, endKey: string): string[] {
  const result: string[] = [];
  let cursor = parseDateKey(startKey);
  const end = parseDateKey(endKey);

  while (cursor <= end) {
    result.push(toDateKey(cursor));
    cursor = addDays(cursor, 1);
  }

  return result;
}

export function formatDateLabel(dateKey: string): string {
  const date = parseDateKey(dateKey);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short"
  }).format(date);
}

export function formatLongDate(dateKey: string): string {
  const date = parseDateKey(dateKey);

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  }).format(date);
}

export function formatLongDateWithYear(dateKey: string): string {
  const date = parseDateKey(dateKey);

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}

export function weekdayLabel(day: number): string {
  return WEEKDAY_LABELS[day] ?? "";
}

export function formatClock(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(iso));
}

export function minutesBetween(startIso: string, endIso: string): number {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();

  return Math.max(0, Math.round((end - start) / 60000));
}
