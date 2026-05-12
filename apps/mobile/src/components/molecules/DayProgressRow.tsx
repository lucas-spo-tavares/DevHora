import { StyleSheet, Text, View } from "react-native";
import { formatDateLabel } from "../../lib/dates";
import { formatSignedMinutes } from "../../lib/time";
import { colors } from "../../theme/colors";
import { DaySummary } from "../../types/app";

type DayProgressRowProps = {
  day: DaySummary;
};

export function DayProgressRow({ day }: DayProgressRowProps) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.title}>{formatDateLabel(day.date)}</Text>
        <Text style={styles.meta}>{day.isMissing ? "Ponto pendente" : "Saldo do dia"}</Text>
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
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  }
});

