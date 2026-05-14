import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { periodTotals, summarizePeriod } from "../lib/calculations";
import { formatDateLabel } from "../lib/dates";
import { todayKey } from "../lib/dates";
import { sanitizeAppData } from "../storage/appStorage";
import { AppData } from "../types/app";

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

export async function shareProgressCsv(data: AppData): Promise<string | null> {
  const { contents, filename } = buildProgressCsv(data);
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

export async function saveProgressCsvToDevice(data: AppData): Promise<string | null> {
  const { contents, filename } = buildProgressCsv(data);

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

function buildProgressCsv(data: AppData): { contents: string; filename: string } {
  const filename = `devhora-progresso-${todayKey()}.csv`;
  const dates = summarizePeriod(data);
  const totals = periodTotals(data);
  const csvLines = [
    ["data", "rotulo", "previsto_min", "trabalhado_min", "ajuste_min", "saldo_min", "pendente"].join(","),
    ...dates.map((day) =>
      [
        day.date,
        formatDateLabel(day.date),
        day.expectedMinutes,
        day.workedMinutes,
        day.adjustmentMinutes,
        day.balanceMinutes,
        day.isMissing ? "sim" : "nao"
      ]
        .map(escapeCsvValue)
        .join(",")
    ),
    [
      "TOTAL",
      "TOTAL",
      totals.expectedMinutes,
      totals.workedMinutes,
      0,
      totals.balanceMinutes,
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
