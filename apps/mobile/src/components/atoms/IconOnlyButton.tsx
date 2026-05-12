import { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/metrics";

type IconOnlyButtonProps = {
  accessibilityLabel: string;
  icon: ReactNode;
  onPress: () => void;
};

export function IconOnlyButton({ accessibilityLabel, icon, onPress }: IconOnlyButtonProps) {
  return (
    <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" onPress={onPress} style={styles.button}>
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radii.panel,
    height: 44,
    justifyContent: "center",
    width: 44
  }
});

