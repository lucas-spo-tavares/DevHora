import { Switch, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";

type ToggleFieldProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
};

export function ToggleField({ description, label, onValueChange, value }: ToggleFieldProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Switch
        trackColor={{ false: colors.borderSoft, true: colors.primarySoft }}
        thumbColor={value ? colors.primary : "#f2f2f2"}
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  description: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800"
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  textBlock: {
    flex: 1,
    gap: 2
  }
});
