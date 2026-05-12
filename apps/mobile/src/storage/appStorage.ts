import { AppData } from "../types/app";
import { todayKey } from "../lib/dates";

export const defaultData: AppData = {
  settings: {
    dailyMinutes: 8 * 60,
    workdays: [1, 2, 3, 4, 5],
    periodStart: todayKey()
  },
  entries: {}
};

export function sanitizeAppData(value: unknown): AppData {
  const candidate = value as Partial<AppData>;

  return {
    settings: {
      dailyMinutes:
        typeof candidate.settings?.dailyMinutes === "number"
          ? candidate.settings.dailyMinutes
          : defaultData.settings.dailyMinutes,
      workdays: Array.isArray(candidate.settings?.workdays)
        ? candidate.settings.workdays.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
        : defaultData.settings.workdays,
      periodStart:
        typeof candidate.settings?.periodStart === "string"
          ? candidate.settings.periodStart
          : defaultData.settings.periodStart
    },
    entries:
      candidate.entries && typeof candidate.entries === "object"
        ? candidate.entries
        : defaultData.entries
  };
}
