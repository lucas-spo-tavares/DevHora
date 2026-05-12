import { Alert } from "react-native";
import { BackupPanel } from "../components/organisms/BackupPanel";
import { DailyHoursPanel } from "../components/organisms/DailyHoursPanel";
import { WorkdaysPanel } from "../components/organisms/WorkdaysPanel";
import { ScreenTemplate } from "../components/templates/ScreenTemplate";
import { exportBackup, importBackup } from "../services/backupService";
import { getAppDataSnapshot, useWorkStore } from "../store/workStore";

export function SettingsScreen() {
  const dailyMinutes = useWorkStore((state) => state.settings.dailyMinutes);
  const replaceData = useWorkStore((state) => state.replaceData);
  const setDailyMinutes = useWorkStore((state) => state.setDailyMinutes);
  const toggleWorkday = useWorkStore((state) => state.toggleWorkday);
  const workdays = useWorkStore((state) => state.settings.workdays);

  async function handleExportBackup() {
    try {
      const uri = await exportBackup(getAppDataSnapshot());

      if (uri) {
        Alert.alert("Backup exportado", uri);
      }
    } catch {
      Alert.alert("Exportar backup", "Nao consegui gerar o backup neste aparelho.");
    }
  }

  async function handleImportBackup() {
    try {
      const imported = await importBackup();

      if (!imported) {
        return;
      }

      replaceData(imported);
      Alert.alert("Backup importado", "Os dados foram restaurados neste aparelho.");
    } catch {
      Alert.alert("Backup invalido", "Nao consegui ler este arquivo como um backup do DevHora.");
    }
  }

  return (
    <ScreenTemplate eyebrow="Regras do calculo" title="Configuracoes">
      <DailyHoursPanel dailyMinutes={dailyMinutes} onSaveDailyMinutes={setDailyMinutes} />
      <WorkdaysPanel onToggleWorkday={toggleWorkday} workdays={workdays} />
      <BackupPanel onExportBackup={handleExportBackup} onImportBackup={handleImportBackup} />
    </ScreenTemplate>
  );
}
