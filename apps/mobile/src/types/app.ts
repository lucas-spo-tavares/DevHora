export type PunchType = "start" | "pauseStart" | "pauseEnd" | "end";

export type PunchEvent = {
  id: string;
  type: PunchType;
  timestamp: string;
};

export type WorkEntry = {
  date: string;
  events: PunchEvent[];
  adjustmentMinutes: number;
  excludeFromBalance: boolean;
  note: string;
};

export type NotificationRule = {
  enabled: boolean;
  leadMinutes: number;
};

export type NotificationAlert = {
  id: string;
  enabled: boolean;
  label: string;
  time: string;
};

export type SpecialNotificationTarget = "returnReminder" | "overtimeReminder";

export type SpecialNotificationAlert = {
  enabled: boolean;
  id: string;
  label: string;
  leadMinutes: number;
  target: SpecialNotificationTarget;
};

export type NotificationSettings = {
  alerts: NotificationAlert[];
  specialAlerts: SpecialNotificationAlert[];
  pauseDurationMinutes: number;
};

export type Settings = {
  dailyMinutes: number;
  // Stored as YYYY-MM-DD and used as a lower bound for calculations.
  installationDate: string;
  notifications: NotificationSettings;
  workdays: number[];
  // Stored as YYYY-MM-DD for calculation and backup compatibility.
  periodStart: string;
};

export type AppData = {
  settings: Settings;
  entries: Record<string, WorkEntry>;
};

export type DaySummary = {
  date: string;
  expectedMinutes: number;
  workedMinutes: number;
  adjustmentMinutes: number;
  balanceMinutes: number;
  excludeFromBalance: boolean;
  isMissing: boolean;
};
