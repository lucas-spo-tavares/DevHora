import { StyleSheet, View } from "react-native";
import { Download, Share2 } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { TextButton } from "../atoms/TextButton";
import { Panel } from "./Panel";

type SharePanelProps = {
  onShareCsv: () => void;
  onSaveCsv: () => void;
};

export function SharePanel({ onSaveCsv, onShareCsv }: SharePanelProps) {
  return (
    <Panel title="Compartilhar">
      <View style={styles.actions}>
        <TextButton icon={<Share2 size={18} color={colors.text} />} label="Compartilhar CSV" onPress={onShareCsv} style={styles.action} />
        <TextButton icon={<Download size={18} color={colors.text} />} label="Salvar no aparelho" onPress={onSaveCsv} style={styles.action} />
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
