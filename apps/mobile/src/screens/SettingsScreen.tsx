import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { BackupPanel } from "../components/organisms/BackupPanel";
import { DailyHoursPanel } from "../components/organisms/DailyHoursPanel";
import { NotificationSettingsPanel } from "../components/organisms/NotificationSettingsPanel";
import { PeriodStartPanel } from "../components/organisms/PeriodStartPanel";
import { WorkdaysPanel } from "../components/organisms/WorkdaysPanel";
import { ScreenTemplate } from "../components/templates/ScreenTemplate";
import { exportBackup, importBackup } from "../services/backupService";
import { getAppDataSnapshot, useWorkStore } from "../store/workStore";
import type { SettingsStackParamList } from "../navigation/SettingsStackNavigator";

export function SettingsScreen() {
  const navigation = useNavigation<StackNavigationProp<SettingsStackParamList>>();
  const dailyMinutes = useWorkStore((state) => state.settings.dailyMinutes);
  const periodStart = useWorkStore((state) => state.settings.periodStart);
  const replaceData = useWorkStore((state) => state.replaceData);
  const setDailyMinutes = useWorkStore((state) => state.setDailyMinutes);
  const setPeriodStart = useWorkStore((state) => state.setPeriodStart);
  const toggleWorkday = useWorkStore((state) => state.toggleWorkday);
  const workdays = useWorkStore((state) => state.settings.workdays);

  async function handleExportBackup() {
    try {
      const uri = await exportBackup(getAppDataSnapshot());

      if (uri) {
        Alert.alert("Backup pronto", uri);
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
      <PeriodStartPanel onSavePeriodStart={setPeriodStart} periodStart={periodStart} />
      <WorkdaysPanel onToggleWorkday={toggleWorkday} workdays={workdays} />
      <NotificationSettingsPanel onPress={() => navigation.navigate("Notifications")} />
      <BackupPanel onExportBackup={handleExportBackup} onImportBackup={handleImportBackup} />
    </ScreenTemplate>
  );
}
