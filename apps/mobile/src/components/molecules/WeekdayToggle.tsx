import { Pressable, StyleSheet, Text } from "react-native";
import { weekdayLabel } from "../../lib/dates";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/metrics";

type WeekdayToggleProps = {
  day: number;
  onPress: () => void;
  selected: boolean;
};

export function WeekdayToggle({ day, onPress, selected }: WeekdayToggleProps) {
  return (
    <Pressable onPress={onPress} style={[styles.button, selected && styles.selectedButton]}>
      <Text style={[styles.text, selected && styles.selectedText]}>{weekdayLabel(day)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primaryText,
    borderColor: colors.border,
    borderRadius: radii.panel,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 56
  },
  selectedButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  selectedText: {
    color: colors.primaryText
  },
  text: {
    color: "#5a6659",
    fontSize: 14,
    fontWeight: "900"
  }
});

