import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
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

