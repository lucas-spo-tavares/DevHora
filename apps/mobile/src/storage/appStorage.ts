import { AppData, NotificationAlert, NotificationRule, NotificationSettings, SpecialNotificationAlert, SpecialNotificationTarget } from "../types/app";
import { isValidDateKey, todayKey } from "../lib/dates";
import { isValidTimeOfDay } from "../lib/timeOfDay";

const MAX_NOTIFICATION_LEAD_MINUTES = 120;
const MAX_NOTIFICATION_DURATION_MINUTES = 12 * 60;

function createNotificationRule(enabled: boolean, leadMinutes: number): NotificationRule {
  return {
    enabled,
    leadMinutes
  };
}

function createDefaultNotificationSettings(): NotificationSettings {
  return {
    alerts: [],
    specialAlerts: [],
    pauseDurationMinutes: 60,
  };
}

export const defaultData: AppData = {
  settings: {
    dailyMinutes: 8 * 60,
    installationDate: todayKey(),
    notifications: createDefaultNotificationSettings(),
    workdays: [1, 2, 3, 4, 5],
    periodStart: todayKey()
  },
  entries: {}
};

function normalizeSettings(settings: Partial<AppData["settings"]> | undefined): AppData["settings"] {
  const periodStart =
    typeof settings?.periodStart === "string" && isValidDateKey(settings.periodStart) ? settings.periodStart : todayKey();
  const candidateNotifications = settings && typeof settings === "object" ? (settings as { notifications?: unknown }).notifications : undefined;
  const notifications = normalizeNotificationSettings(candidateNotifications);

  return {
    dailyMinutes: typeof settings?.dailyMinutes === "number" ? settings.dailyMinutes : defaultData.settings.dailyMinutes,
    installationDate:
      typeof settings?.installationDate === "string" && isValidDateKey(settings.installationDate)
        ? settings.installationDate
        : periodStart,
    notifications,
    periodStart,
    workdays: Array.isArray(settings?.workdays)
      ? settings.workdays.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
      : defaultData.settings.workdays
  };
}

function normalizeNotificationSettings(value: unknown): NotificationSettings {
  const fallback = createDefaultNotificationSettings();
  const candidate = value as Partial<NotificationSettings> & {
    overtimeReminder?: Partial<NotificationRule>;
    returnReminder?: Partial<NotificationRule>;
  };
  const specialAlertsFromLegacy = normalizeLegacySpecialAlerts(candidate);

  return {
    alerts: Array.isArray(candidate?.alerts)
      ? candidate.alerts
          .map(normalizeAlert)
          .filter((alert): alert is NotificationAlert => Boolean(alert))
      : fallback.alerts,
    specialAlerts: Array.isArray(candidate?.specialAlerts)
      ? candidate.specialAlerts
          .map(normalizeSpecialAlert)
          .filter((alert): alert is SpecialNotificationAlert => Boolean(alert))
      : specialAlertsFromLegacy,
    pauseDurationMinutes:
      typeof candidate?.pauseDurationMinutes === "number" &&
      Number.isInteger(candidate.pauseDurationMinutes) &&
      candidate.pauseDurationMinutes > 0 &&
      candidate.pauseDurationMinutes <= MAX_NOTIFICATION_DURATION_MINUTES
        ? candidate.pauseDurationMinutes
        : fallback.pauseDurationMinutes,
  };
}

function normalizeRule(value: Partial<NotificationRule> | undefined, fallback: NotificationRule): NotificationRule {
  return {
    enabled: typeof value?.enabled === "boolean" ? value.enabled : fallback.enabled,
    leadMinutes: normalizeLeadMinutes(value?.leadMinutes) ?? fallback.leadMinutes
  };
}

function normalizeSpecialAlert(value: Partial<SpecialNotificationAlert> | undefined): SpecialNotificationAlert | null {
  if (!value || typeof value.id !== "string" || !value.id) {
    return null;
  }

  const target = value.target;

  if (target !== "returnReminder" && target !== "overtimeReminder") {
    return null;
  }

  return {
    enabled: typeof value.enabled === "boolean" ? value.enabled : true,
    id: value.id,
    label: typeof value.label === "string" && value.label.trim() ? value.label.trim() : defaultSpecialLabel(target),
    leadMinutes: normalizeLeadMinutes(value.leadMinutes) ?? 10,
    target
  };
}

function normalizeLegacySpecialAlerts(
  candidate: Partial<NotificationSettings> & {
    overtimeReminder?: Partial<NotificationRule>;
    returnReminder?: Partial<NotificationRule>;
  }
): SpecialNotificationAlert[] {
  const result: SpecialNotificationAlert[] = [];
  const legacyReturn = normalizeRule(candidate.returnReminder, {
    enabled: true,
    leadMinutes: 10
  });
  const legacyOvertime = normalizeRule(candidate.overtimeReminder, {
    enabled: true,
    leadMinutes: 10
  });

  if (legacyReturn.enabled) {
    result.push({
      enabled: legacyReturn.enabled,
      id: `${Date.now()}-legacy-return`,
      label: defaultSpecialLabel("returnReminder"),
      leadMinutes: legacyReturn.leadMinutes,
      target: "returnReminder"
    });
  }

  if (legacyOvertime.enabled) {
    result.push({
      enabled: legacyOvertime.enabled,
      id: `${Date.now()}-legacy-overtime`,
      label: defaultSpecialLabel("overtimeReminder"),
      leadMinutes: legacyOvertime.leadMinutes,
      target: "overtimeReminder"
    });
  }

  return result;
}

function defaultSpecialLabel(target: SpecialNotificationTarget): string {
  return target === "returnReminder" ? "Voltar do almoço" : "Fim de expediente";
}

function normalizeAlert(value: Partial<NotificationAlert> | undefined): NotificationAlert | null {
  if (!value || typeof value.id !== "string" || !value.id) {
    return null;
  }

  if (typeof value.time !== "string" || !isValidTimeOfDay(value.time)) {
    return null;
  }

  return {
    enabled: typeof value.enabled === "boolean" ? value.enabled : true,
    id: value.id,
    label: typeof value.label === "string" && value.label.trim() ? value.label.trim() : "Alerta",
    time: value.time
  };
}

function normalizeLeadMinutes(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > MAX_NOTIFICATION_LEAD_MINUTES) {
    return null;
  }

  return value;
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
