const TIME_OF_DAY_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTimeOfDay(value: string): boolean {
  return TIME_OF_DAY_PATTERN.test(value);
}

export function parseTimeOfDay(value: string): number | null {
  const match = TIME_OF_DAY_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours * 60 + minutes;
}

export function formatTimeOfDay(totalMinutes: number): string {
  const safeMinutes = Math.max(0, Math.min(24 * 60 - 1, Math.round(totalMinutes)));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function shiftTimeOfDay(value: string, deltaMinutes: number): string | null {
  const totalMinutes = parseTimeOfDay(value);

  if (totalMinutes === null) {
    return null;
  }

  const nextMinutes = totalMinutes + deltaMinutes;

  if (nextMinutes < 0 || nextMinutes >= 24 * 60) {
    return null;
  }

  return formatTimeOfDay(nextMinutes);
}

export function buildDateFromTimeOfDay(date: Date, value: string): Date | null {
  const totalMinutes = parseTimeOfDay(value);

  if (totalMinutes === null) {
    return null;
  }

  const next = new Date(date);
  next.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0);

  return next;
}
