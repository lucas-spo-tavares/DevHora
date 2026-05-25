import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { PencilLine, Trash2 } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { Panel } from "./Panel";

type NotificationAlertCardProps = {
  label: string;
  onEdit: () => void;
  onRemove: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  time: string;
  enabled: boolean;
};

export function NotificationAlertCard({ enabled, label, onEdit, onRemove, onToggleEnabled, time }: NotificationAlertCardProps) {
  return (
    <Panel title={label}>
      <View style={styles.row}>
        <View style={styles.textBlock}>
          <Text style={styles.time}>{time}</Text>
          <Text style={styles.label}>{enabled ? "Ativado" : "Desativado"}</Text>
        </View>
        <Switch
          trackColor={{ false: colors.borderSoft, true: colors.primarySoft }}
          thumbColor={enabled ? colors.primary : "#f2f2f2"}
          value={enabled}
          onValueChange={onToggleEnabled}
        />
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onEdit} style={styles.actionButton}>
          <PencilLine color={colors.primary} size={16} />
          <Text style={styles.actionText}>Editar</Text>
        </Pressable>
        <Pressable onPress={onRemove} style={[styles.actionButton, styles.removeButton]}>
          <Trash2 color={colors.dangerSoftText} size={16} />
          <Text style={[styles.actionText, styles.removeText]}>Excluir</Text>
        </Pressable>
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 12
  },
  actionText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800"
  },
  actions: {
    flexDirection: "row",
    gap: 10
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  removeButton: {
    backgroundColor: colors.dangerSoft
  },
  removeText: {
    color: colors.dangerSoftText
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  textBlock: {
    flex: 1,
    gap: 2
  },
  time: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  }
});
