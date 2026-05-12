import { StyleSheet, Text, View } from "react-native";
import { actionLabel } from "../../lib/calculations";
import { formatClock } from "../../lib/dates";
import { colors } from "../../theme/colors";
import { PunchEvent } from "../../types/app";

type EventRowProps = {
  event: PunchEvent;
};

export function EventRow({ event }: EventRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.name}>{actionLabel(event.type)}</Text>
      <Text style={styles.time}>{formatClock(event.timestamp)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700"
  },
  row: {
    alignItems: "center",
    borderTopColor: colors.borderSoft,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12
  },
  time: {
    color: "#5a6659",
    fontSize: 15,
    fontWeight: "700"
  }
});

