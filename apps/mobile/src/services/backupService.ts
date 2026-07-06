import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { formatDateLabel } from "../lib/dates";
import { todayKey } from "../lib/dates";
import { formatClock } from "../lib/dates";
import { sortPunchEvents } from "../lib/manualEntry";
import { sanitizeAppData } from "../storage/appStorage";
import { AppData, DaySummary, PunchType } from "../types/app";

type PauseInterval = {
  end: string;
  start: string;
};

export async function exportBackup(data: AppData): Promise<string | null> {
  const filename = `devhora-backup-${todayKey()}.json`;
  const targetDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

  if (!targetDirectory) {
    throw new Error("missing-target-directory");
  }

  const uri = `${targetDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(data, null, 2));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      dialogTitle: "Exportar backup do DevHora",
      mimeType: "application/json"
    });

    return null;
  }

  return uri;
}

export async function shareProgressCsv(data: AppData, summaries: DaySummary[]): Promise<string | null> {
  const { contents, filename } = buildProgressCsv(data, summaries);
  const targetDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

  if (!targetDirectory) {
    throw new Error("missing-target-directory");
  }

  const uri = `${targetDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, contents);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      dialogTitle: "Compartilhar progresso do DevHora",
      mimeType: "text/csv"
    });

    return null;
  }

  return uri;
}

export async function saveProgressCsvToDevice(data: AppData, summaries: DaySummary[]): Promise<string | null> {
  const { contents, filename } = buildProgressCsv(data, summaries);

  if (!FileSystem.StorageAccessFramework) {
    throw new Error("storage-access-framework-unavailable");
  }

  const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

  if (!permissions.granted) {
    return null;
  }

  const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, filename, "text/csv");
  await FileSystem.writeAsStringAsync(fileUri, contents);

  return fileUri;
}

export async function importBackup(): Promise<AppData | null> {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    type: "application/json"
  });

  if (result.canceled) {
    return null;
  }

  const file = result.assets[0];

  if (!file) {
    return null;
  }

  const content = await FileSystem.readAsStringAsync(file.uri);

  return sanitizeAppData(JSON.parse(content));
}

function escapeCsvValue(value: string | number): string {
  const text = String(value);

  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function buildProgressCsv(data: AppData, summaries: DaySummary[]): { contents: string; filename: string } {
  const filename = `devhora-progresso-${todayKey()}.csv`;
  const totals = summaries.reduce(
    (acc, day) => ({
      balanceMinutes: acc.balanceMinutes + day.balanceMinutes,
      expectedMinutes: acc.expectedMinutes + day.expectedMinutes,
      missingDays: acc.missingDays + (day.isMissing ? 1 : 0),
      workedMinutes: acc.workedMinutes + day.workedMinutes
    }),
    {
      balanceMinutes: 0,
      expectedMinutes: 0,
      missingDays: 0,
      workedMinutes: 0
    }
  );
  const csvLines = [
    [
      "data",
      "rotulo",
      "entrada",
      "pausas",
      "saida",
      "eventos",
      "previsto_min",
      "trabalhado_min",
      "saldo_min",
      "pausa_total_min",
      "pendente"
    ].join(","),
    ...summaries.map((day) =>
      buildDayCsvRow(data, day.date, day.expectedMinutes, day.workedMinutes, day.balanceMinutes, day.isMissing)
    ),
    [
      "TOTAL",
      "",
      "",
      "",
      "",
      "",
      totals.expectedMinutes,
      totals.workedMinutes,
      totals.balanceMinutes,
      "",
      totals.missingDays
    ]
      .map(escapeCsvValue)
      .join(",")
  ];

  return {
    contents: `${csvLines.join("\n")}\n`,
    filename
  };
}

function buildDayCsvRow(
  data: AppData,
  dateKey: string,
  expectedMinutes: number,
  workedMinutes: number,
  balanceMinutes: number,
  isMissing: boolean
): string {
  const entry = data.entries[dateKey];
  const events = entry ? sortPunchEvents(entry.events) : [];
  const pauseIntervals = collectPauseIntervals(events);

  const columns = [
    dateKey,
    formatDateLabel(dateKey),
    formatEventTime(events, "start"),
    formatPauseIntervals(pauseIntervals),
    formatEventTime(events, "end"),
    formatEventSequence(events),
    expectedMinutes,
    workedMinutes,
    balanceMinutes,
    calculatePauseTotalMinutes(pauseIntervals),
    isMissing ? "sim" : "nao"
  ];

  return columns.map(escapeCsvValue).join(",");
}

function formatEventTime(events: { timestamp: string; type: PunchType }[], type: PunchType): string {
  const event = events.find((item) => item.type === type);

  return event ? formatClock(event.timestamp) : "";
}

function formatEventSequence(events: { timestamp: string; type: PunchType }[]): string {
  return events.map((event) => `${formatClock(event.timestamp)}(${event.type})`).join(" | ");
}

function collectPauseIntervals(events: { timestamp: string; type: PunchType }[]): PauseInterval[] {
  const intervals: PauseInterval[] = [];
  let openPauseStart: string | null = null;

  for (const event of events) {
    if (event.type === "pauseStart") {
      openPauseStart = event.timestamp;
      continue;
    }

    if (event.type === "pauseEnd" && openPauseStart) {
      intervals.push({
        end: event.timestamp,
        start: openPauseStart
      });
      openPauseStart = null;
      continue;
    }

    if (event.type === "end") {
      openPauseStart = null;
    }
  }

  return intervals;
}

function formatPauseIntervals(intervals: PauseInterval[]): string {
  if (!intervals.length) {
    return "";
  }

  return intervals.map((interval) => `${formatClock(interval.start)}-${formatClock(interval.end)}`).join(" | ");
}

function calculatePauseTotalMinutes(intervals: PauseInterval[]): number {
  return intervals.reduce((total, interval) => {
    const start = new Date(interval.start).getTime();
    const end = new Date(interval.end).getTime();

    return total + Math.max(0, Math.round((end - start) / 60000));
  }, 0);
}
