import { PunchEvent, PunchType } from "../types/app";
import { parseDateKey } from "./dates";

export type DraftPunchEvent = {
  id: string;
  time: Date;
  type: PunchType;
};

export function createDraftTime(dateKey: string, hours = 8, minutes = 0): Date {
  const date = parseDateKey(dateKey);
  date.setHours(hours, minutes, 0, 0);

  return date;
}

export function formatTimeInput(value: string | Date): string {
  const date = new Date(value);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function parseTimeInput(dateKey: string, time: Date): string | null {
  if (!(time instanceof Date) || Number.isNaN(time.getTime())) {
    return null;
  }

  const date = parseDateKey(dateKey);
  date.setHours(time.getHours(), time.getMinutes(), 0, 0);

  return date.toISOString();
}

export function sortPunchEvents(events: PunchEvent[]): PunchEvent[] {
  return [...events].sort((left, right) => {
    const leftTime = new Date(left.timestamp).getTime();
    const rightTime = new Date(right.timestamp).getTime();

    return leftTime - rightTime || left.id.localeCompare(right.id);
  });
}

export function validatePunchEvents(events: PunchEvent[]): string | null {
  const sorted = sortPunchEvents(events);
  const startCount = sorted.filter((event) => event.type === "start").length;
  const endCount = sorted.filter((event) => event.type === "end").length;
  const pauseStartCount = sorted.filter((event) => event.type === "pauseStart").length;
  const pauseEndCount = sorted.filter((event) => event.type === "pauseEnd").length;

  if (startCount !== 1 || endCount !== 1) {
    return "O dia precisa ter exatamente uma entrada e uma saída.";
  }

  if (pauseStartCount !== pauseEndCount) {
    return "As pausas precisam estar em pares: início e volta.";
  }

  let hasStarted = false;
  let pauseOpen = false;

  for (let index = 0; index < sorted.length; index += 1) {
    const event = sorted[index];

    if (!event) {
      return "Nao consegui validar os pontos deste dia.";
    }

    if (event.type === "start") {
      if (hasStarted) {
        return "Só é permitida uma entrada por dia.";
      }

      hasStarted = true;
      continue;
    }

    if (!hasStarted) {
      return "O dia precisa começar com uma entrada antes de registrar pausas ou saída.";
    }

    if (event.type === "pauseStart") {
      if (pauseOpen) {
        return "Existe uma pausa sem volta antes de registrar outra pausa.";
      }

      pauseOpen = true;
      continue;
    }

    if (event.type === "pauseEnd") {
      if (!pauseOpen) {
        return "Existe uma volta de pausa sem início correspondente.";
      }

      pauseOpen = false;
      continue;
    }

    if (event.type === "end") {
      if (pauseOpen) {
        return "Existe uma pausa sem volta antes da saída.";
      }

      if (index !== sorted.length - 1) {
        return "A saída precisa ser o último ponto do dia.";
      }
    }
  }

  return null;
}

export function toDraftPunchEvent(event: PunchEvent): DraftPunchEvent {
  return {
    id: event.id,
    time: new Date(event.timestamp),
    type: event.type
  };
}
