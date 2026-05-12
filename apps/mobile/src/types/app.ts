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
  note: string;
};

export type Settings = {
  dailyMinutes: number;
  workdays: number[];
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
  isMissing: boolean;
};

