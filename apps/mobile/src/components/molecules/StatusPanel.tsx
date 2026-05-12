import { StyleSheet, Text, View } from "react-native";
import { statusLabel } from "../../lib/calculations";
import { formatClock } from "../../lib/dates";
import { colors } from "../../theme/colors";
import { PunchEvent } from "../../types/app";

type StatusPanelProps = {
  events: PunchEvent[];
};

export function StatusPanel({ events }: StatusPanelProps) {
  const lastEvent = events.at(-1);

  return (
    <View style={styles.panel}>
      <Text style={styles.status}>{statusLabel(events)}</Text>
      <Text style={styles.subtext}>{lastEvent ? `Ultimo ponto as ${formatClock(lastEvent.timestamp)}` : "Pronto para iniciar"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.primaryDark,
    borderRadius: 8,
    padding: 18
  },
  status: {
    color: colors.textOnDark,
    fontSize: 20,
    fontWeight: "900"
  },
  subtext: {
    color: colors.textOnDarkMuted,
    fontSize: 15,
    marginTop: 6
  }
});

