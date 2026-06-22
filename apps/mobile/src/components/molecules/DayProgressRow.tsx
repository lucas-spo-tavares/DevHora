import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDateLabel, parseDateKey, weekdayLabel } from "../../lib/dates";
import { formatSignedMinutes } from "../../lib/time";
import { colors } from "../../theme/colors";
import { DaySummary } from "../../types/app";

type DayProgressRowProps = {
  day: DaySummary;
  onPress?: (dateKey: string) => void;
};

export function DayProgressRow({ day, onPress }: DayProgressRowProps) {
  const weekday = weekdayLabel(parseDateKey(day.date).getDay());
  const metaLabel = day.excludeFromBalance ? "Dia abatido do saldo" : day.isMissing ? "Ponto pendente" : "Saldo do dia";

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={() => onPress(day.date)} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
        <View>
          <Text style={styles.title}>{`${weekday} · ${formatDateLabel(day.date)}`}</Text>
          <Text style={styles.meta}>{metaLabel}</Text>
        </View>
        <Text style={[styles.balance, day.balanceMinutes >= 0 ? styles.positive : styles.negative]}>
          {formatSignedMinutes(day.balanceMinutes)}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.title}>{`${weekday} · ${formatDateLabel(day.date)}`}</Text>
        <Text style={styles.meta}>{metaLabel}</Text>
      </View>
      <Text style={[styles.balance, day.balanceMinutes >= 0 ? styles.positive : styles.negative]}>
        {formatSignedMinutes(day.balanceMinutes)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  balance: {
    fontSize: 18,
    fontWeight: "800"
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2
  },
  negative: {
    color: colors.danger
  },
  positive: {
    color: colors.primary
  },
  row: {
    alignItems: "center",
    borderTopColor: colors.borderSoft,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14
  },
  rowPressed: {
    opacity: 0.75
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  }
});
