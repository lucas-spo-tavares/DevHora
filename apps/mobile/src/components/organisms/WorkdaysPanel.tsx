import { StyleSheet, View } from "react-native";
import { WeekdayToggle } from "../molecules/WeekdayToggle";
import { Panel } from "./Panel";

type WorkdaysPanelProps = {
  onToggleWorkday: (day: number) => void;
  workdays: number[];
};

const week = [0, 1, 2, 3, 4, 5, 6];

export function WorkdaysPanel({ onToggleWorkday, workdays }: WorkdaysPanelProps) {
  return (
    <Panel title="Dias de trabalho">
      <View style={styles.grid}>
        {week.map((day) => (
          <WeekdayToggle day={day} key={day} onPress={() => onToggleWorkday(day)} selected={workdays.includes(day)} />
        ))}
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  }
});
