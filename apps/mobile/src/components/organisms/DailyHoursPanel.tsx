import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Check } from "lucide-react-native";
import { decimalHoursToMinutes, minutesToDecimalHours } from "../../lib/time";
import { colors } from "../../theme/colors";
import { IconOnlyButton } from "../atoms/IconOnlyButton";
import { TextField } from "../atoms/TextField";
import { Panel } from "./Panel";

type DailyHoursPanelProps = {
  dailyMinutes: number;
  onSaveDailyMinutes: (dailyMinutes: number) => void;
};

export function DailyHoursPanel({ dailyMinutes, onSaveDailyMinutes }: DailyHoursPanelProps) {
  const [dailyHours, setDailyHours] = useState(minutesToDecimalHours(dailyMinutes));

  useEffect(() => {
    setDailyHours(minutesToDecimalHours(dailyMinutes));
  }, [dailyMinutes]);

  function saveDailyHours() {
    const minutes = decimalHoursToMinutes(dailyHours);

    if (!minutes) {
      Alert.alert("Horas por dia", "Informe uma quantidade maior que zero.");
      return;
    }

    onSaveDailyMinutes(minutes);
  }

  return (
    <Panel title="Horas por dia">
      <View style={styles.row}>
        <TextField inputMode="decimal" onChangeText={setDailyHours} style={styles.input} value={dailyHours} />
        <IconOnlyButton
          accessibilityLabel="Salvar horas por dia"
          icon={<Check size={20} color={colors.primaryText} />}
          onPress={saveDailyHours}
        />
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  }
});
