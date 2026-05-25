import { Switch, StyleSheet, Text, View } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import { formatMinutes } from "../../lib/time";
import { colors } from "../../theme/colors";
import { IconOnlyButton } from "../atoms/IconOnlyButton";
import { Panel } from "./Panel";

type NotificationRuleCardProps = {
  description: string;
  enabled: boolean;
  leadMinutes: number;
  onChangeLeadMinutes: (leadMinutes: number) => void;
  onToggleEnabled: (enabled: boolean) => void;
  stepMinutes?: number;
  title: string;
};

export function NotificationRuleCard({
  description,
  enabled,
  leadMinutes,
  onChangeLeadMinutes,
  onToggleEnabled,
  stepMinutes = 5,
  title
}: NotificationRuleCardProps) {
  function changeLeadMinutes(delta: number) {
    onChangeLeadMinutes(Math.max(0, leadMinutes + delta));
  }

  return (
    <Panel title={title}>
      <View style={styles.headerRow}>
        <Text style={styles.description}>{description}</Text>
        <Switch
          trackColor={{ false: colors.borderSoft, true: colors.primarySoft }}
          thumbColor={enabled ? colors.primary : "#f2f2f2"}
          value={enabled}
          onValueChange={onToggleEnabled}
        />
      </View>
      <View style={styles.controls}>
        <IconOnlyButton accessibilityLabel={`Diminuir ${title}`} icon={<Minus size={18} color={colors.primaryText} />} onPress={() => changeLeadMinutes(-stepMinutes)} />
        <View style={styles.valueBlock}>
          <Text style={styles.valueLabel}>Antecedência</Text>
          <Text style={[styles.value, !enabled && styles.valueDisabled]}>{formatMinutes(leadMinutes)}</Text>
        </View>
        <IconOnlyButton accessibilityLabel={`Aumentar ${title}`} icon={<Plus size={18} color={colors.primaryText} />} onPress={() => changeLeadMinutes(stepMinutes)} />
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  controls: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between"
  },
  description: {
    color: colors.muted,
    flex: 1,
    fontSize: 13,
    lineHeight: 19
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  value: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  valueBlock: {
    alignItems: "center",
    flex: 1,
    gap: 2
  },
  valueDisabled: {
    color: colors.muted
  },
  valueLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  }
});
