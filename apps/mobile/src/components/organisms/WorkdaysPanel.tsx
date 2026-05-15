import { StyleSheet, View } from "react-native";
import { WeekdayToggle } from "../molecules/WeekdayToggle";
import { Panel } from "./Panel";

type WorkdaysPanelProps = {
  onToggleWorkday: (day: number) => void;
  workdays: number[];
};

const weekdayTopRow = [1, 2, 3, 4, 5];
const weekendBottomRow = [6, 0];

export function WorkdaysPanel({ onToggleWorkday, workdays }: WorkdaysPanelProps) {
  return (
    <Panel title="Dias de trabalho">
      <View style={styles.grid}>
        <View style={styles.row}>
          {weekdayTopRow.map((day) => (
            <WeekdayToggle day={day} key={day} onPress={() => onToggleWorkday(day)} selected={workdays.includes(day)} />
          ))}
        </View>
        <View style={styles.weekendRow}>
          {weekendBottomRow.map((day) => (
            <WeekdayToggle day={day} key={day} onPress={() => onToggleWorkday(day)} selected={workdays.includes(day)} />
          ))}
        </View>
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 8
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center"
  },
  weekendRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center"
  }
});
