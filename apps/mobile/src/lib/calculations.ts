import { AppData, DaySummary, PunchEvent, PunchType, WorkEntry } from "../types/app";
import { eachDateKey, maxDateKey, parseDateKey, todayKey } from "./dates";

export function createEmptyEntry(date: string): WorkEntry {
  return {
    date,
    events: [],
    adjustmentMinutes: 0,
    note: ""
  };
}

export function nextPunchType(events: PunchEvent[]): PunchType | null {
  const last = events.at(-1)?.type;

  if (!last) {
    return "start";
  }

  if (last === "start") {
    return "pauseStart";
  }

  if (last === "pauseStart") {
    return "pauseEnd";
  }

  if (last === "pauseEnd") {
    return "end";
  }

  return null;
}

export function actionLabel(type: PunchType | null): string {
  if (type === "start") {
    return "Iniciar jornada";
  }

  if (type === "pauseStart") {
    return "Iniciar pausa";
  }

  if (type === "pauseEnd") {
    return "Voltar da pausa";
  }

  if (type === "end") {
    return "Encerrar dia";
  }

  return "Dia encerrado";
}

export function statusLabel(events: PunchEvent[]): string {
  const last = events.at(-1)?.type;

  if (!last) {
    return "Ainda nao iniciado";
  }

  if (last === "start" || last === "pauseEnd") {
    return "Jornada em andamento";
  }

  if (last === "pauseStart") {
    return "Em pausa";
  }

  return "Jornada encerrada";
}

export function workedMinutes(events: PunchEvent[]): number {
  let total = 0;
  let openStart: PunchEvent | null = null;

  for (const event of events) {
    if (event.type === "start" || event.type === "pauseEnd") {
      openStart = event;
    }

    if ((event.type === "pauseStart" || event.type === "end") && openStart) {
      total += minutesBetweenSafe(openStart.timestamp, event.timestamp);
      openStart = null;
    }
  }

  return total;
}

export function getOpenIntervalStart(events: PunchEvent[]): PunchEvent | null {
  let openStart: PunchEvent | null = null;

  for (const event of events) {
    if (event.type === "start" || event.type === "pauseEnd") {
      openStart = event;
    }

    if (event.type === "pauseStart" || event.type === "end") {
      openStart = null;
    }
  }

  return openStart;
}

function minutesBetweenSafe(startIso: string, endIso: string): number {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();

  return Math.max(0, Math.round((end - start) / 60000));
}

export function isWorkday(dateKey: string, workdays: number[]): boolean {
  return workdays.includes(parseDateKey(dateKey).getDay());
}

export function summarizeDay(data: AppData, dateKey: string): DaySummary {
  const entry = data.entries[dateKey] ?? createEmptyEntry(dateKey);
  const expectedMinutes = isWorkday(dateKey, data.settings.workdays)
    ? data.settings.dailyMinutes
    : 0;
  const worked = workedMinutes(entry.events);
  const adjustment = entry.adjustmentMinutes;
  const ended = entry.events.at(-1)?.type === "end";
  const isPast = dateKey < todayKey();
  const isMissing = expectedMinutes > 0 && isPast && (!entry.events.length || !ended);

  return {
    date: dateKey,
    expectedMinutes,
    workedMinutes: worked,
    adjustmentMinutes: adjustment,
    balanceMinutes: worked + adjustment - expectedMinutes,
    isMissing
  };
}

export function getCalculationStartDate(data: AppData): string {
  const configuredStart = data.settings.periodStart;
  const installationStart = data.settings.installationDate;

  return maxDateKey(configuredStart, installationStart);
}

export function summarizePeriod(data: AppData): DaySummary[] {
  const dates = eachDateKey(getCalculationStartDate(data), todayKey());

  return dates.map((date) => summarizeDay(data, date));
}

export function periodTotals(data: AppData) {
  const days = summarizePeriod(data);

  return days.reduce(
    (totals, day) => ({
      expectedMinutes: totals.expectedMinutes + day.expectedMinutes,
      workedMinutes: totals.workedMinutes + day.workedMinutes + day.adjustmentMinutes,
      balanceMinutes: totals.balanceMinutes + day.balanceMinutes,
      missingDays: totals.missingDays + (day.isMissing ? 1 : 0)
    }),
    {
      expectedMinutes: 0,
      workedMinutes: 0,
      balanceMinutes: 0,
      missingDays: 0
    }
  );
}
