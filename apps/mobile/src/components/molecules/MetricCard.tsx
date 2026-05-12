import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/metrics";

type MetricTone = "neutral" | "positive" | "negative";

type MetricCardProps = {
  label: string;
  tone?: MetricTone;
  value: string;
};

export function MetricCard({ label, value, tone = "neutral" }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, tone === "positive" && styles.positive, tone === "negative" && styles.negative]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radii.panel,
    borderWidth: 1,
    flexBasis: "48%",
    flexGrow: 1,
    padding: 16
  },
  label: {
    color: colors.mutedDark,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  negative: {
    color: colors.danger
  },
  positive: {
    color: colors.primary
  },
  value: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 8
  }
});

