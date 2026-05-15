import { AppData } from "../types/app";
import { isValidDateKey, todayKey } from "../lib/dates";

export const defaultData: AppData = {
  settings: {
    dailyMinutes: 8 * 60,
    installationDate: todayKey(),
    workdays: [1, 2, 3, 4, 5],
    periodStart: todayKey()
  },
  entries: {}
};

function normalizeSettings(settings: Partial<AppData["settings"]> | undefined): AppData["settings"] {
  const periodStart =
    typeof settings?.periodStart === "string" && isValidDateKey(settings.periodStart) ? settings.periodStart : todayKey();

  return {
    dailyMinutes: typeof settings?.dailyMinutes === "number" ? settings.dailyMinutes : defaultData.settings.dailyMinutes,
    installationDate:
      typeof settings?.installationDate === "string" && isValidDateKey(settings.installationDate)
        ? settings.installationDate
        : periodStart,
    periodStart,
    workdays: Array.isArray(settings?.workdays)
      ? settings.workdays.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
      : defaultData.settings.workdays
  };
}

export function normalizeAppData(value: unknown): AppData {
  const candidate = value as Partial<AppData>;

  return {
    entries:
      candidate.entries && typeof candidate.entries === "object"
        ? candidate.entries
        : defaultData.entries,
    settings: normalizeSettings(candidate.settings)
  };
}

export function sanitizeAppData(value: unknown): AppData {
  return normalizeAppData(value);
}
