import { StyleSheet, View } from "react-native";
import { Download, Upload } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { TextButton } from "../atoms/TextButton";
import { Panel } from "./Panel";

type BackupPanelProps = {
  onExportBackup: () => void;
  onImportBackup: () => void;
};

export function BackupPanel({ onExportBackup, onImportBackup }: BackupPanelProps) {
  return (
    <Panel title="Backup">
      <View style={styles.actions}>
        <TextButton icon={<Download size={18} color={colors.text} />} label="Exportar" onPress={onExportBackup} style={styles.action} />
        <TextButton icon={<Upload size={18} color={colors.text} />} label="Importar" onPress={onImportBackup} style={styles.action} />
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  action: {
    flex: 1
  },
  actions: {
    flexDirection: "row",
    gap: 10
  }
});
