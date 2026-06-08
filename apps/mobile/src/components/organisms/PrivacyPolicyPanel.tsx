import { StyleSheet, Text, View } from "react-native";
import { Shield } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { TextButton } from "../atoms/TextButton";
import { Panel } from "./Panel";

type PrivacyPolicyPanelProps = {
  onOpenPrivacyPolicy: () => void;
};

export function PrivacyPolicyPanel({ onOpenPrivacyPolicy }: PrivacyPolicyPanelProps) {
  async function handleOpenPrivacyPolicy() {
    await onOpenPrivacyPolicy();
  }

  return (
    <Panel title="Privacidade">
      <Text style={styles.copy}>
        Leia como o DevHora trata dados locais, backups, notificacoes e o download do APK no site oficial.
      </Text>
      <View style={styles.actions}>
        <TextButton
          icon={<Shield color={colors.text} size={18} />}
          label="Abrir politica de privacidade"
          onPress={handleOpenPrivacyPolicy}
        />
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 10
  },
  copy: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  }
});
