import { Alert, Linking, Platform, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import Constants from "expo-constants";
import { BackupPanel } from "../components/organisms/BackupPanel";
import { DailyHoursPanel } from "../components/organisms/DailyHoursPanel";
import { LunchBreakPanel } from "../components/organisms/LunchBreakPanel";
import { NotificationSettingsPanel } from "../components/organisms/NotificationSettingsPanel";
import { PeriodStartPanel } from "../components/organisms/PeriodStartPanel";
import { PrivacyPolicyPanel } from "../components/organisms/PrivacyPolicyPanel";
import { WorkdaysPanel } from "../components/organisms/WorkdaysPanel";
import { ScreenTemplate } from "../components/templates/ScreenTemplate";
import { exportBackup, importBackup } from "../services/backupService";
import { getAppDataSnapshot, useWorkStore } from "../store/workStore";
import { colors } from "../theme/colors";
import type { SettingsStackParamList } from "../navigation/SettingsStackNavigator";

const PRIVACY_POLICY_URL = "https://devhora.lucas-tavares.com/privacy";

export function SettingsScreen() {
  const appVersion = Constants.expoConfig?.version ?? "desconhecida";
  const androidVersionCode = Constants.expoConfig?.android?.versionCode;
  const versionLabel =
    Platform.OS === "android" && typeof androidVersionCode === "number"
      ? `${appVersion} (${androidVersionCode})`
      : appVersion;
  const navigation = useNavigation<StackNavigationProp<SettingsStackParamList>>();
  const dailyMinutes = useWorkStore((state) => state.settings.dailyMinutes);
  const periodStart = useWorkStore((state) => state.settings.periodStart);
  const replaceData = useWorkStore((state) => state.replaceData);
  const setDailyMinutes = useWorkStore((state) => state.setDailyMinutes);
  const pauseDurationMinutes = useWorkStore((state) => state.settings.notifications.pauseDurationMinutes);
  const setNotificationDurationMinutes = useWorkStore((state) => state.setNotificationDurationMinutes);
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

  async function handleOpenPrivacyPolicy() {
    try {
      const supported = await Linking.canOpenURL(PRIVACY_POLICY_URL);

      if (!supported) {
        throw new Error("unsupported");
      }

      await Linking.openURL(PRIVACY_POLICY_URL);
    } catch {
      Alert.alert("Privacidade", "Nao consegui abrir a politica de privacidade neste aparelho.");
    }
  }

  return (
    <ScreenTemplate eyebrow="Regras do calculo" title="Configuracoes">
      <DailyHoursPanel dailyMinutes={dailyMinutes} onSaveDailyMinutes={setDailyMinutes} />
      <LunchBreakPanel
        onSavePauseDurationMinutes={setNotificationDurationMinutes}
        pauseDurationMinutes={pauseDurationMinutes}
      />
      <PeriodStartPanel onSavePeriodStart={setPeriodStart} periodStart={periodStart} />
      <WorkdaysPanel onToggleWorkday={toggleWorkday} workdays={workdays} />
      <NotificationSettingsPanel onPress={() => navigation.navigate("Notifications")} />
      <BackupPanel onExportBackup={handleExportBackup} onImportBackup={handleImportBackup} />
      <PrivacyPolicyPanel onOpenPrivacyPolicy={handleOpenPrivacyPolicy} />
      <Text style={styles.versionText}>Versao {versionLabel}</Text>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  versionText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center"
  }
});
