import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/metrics";

type TextButtonVariant = "secondary" | "warning" | "primary";

type TextButtonProps = {
  icon?: ReactNode;
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  variant?: TextButtonVariant;
};

export function TextButton({ icon, label, onPress, style, variant = "secondary" }: TextButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.button, styles[variant], style]}>
      {icon}
      <Text style={[styles.label, variant === "warning" && styles.warningLabel, variant === "primary" && styles.primaryLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radii.panel,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  primary: {
    backgroundColor: colors.primary
  },
  primaryLabel: {
    color: colors.primaryText
  },
  secondary: {
    backgroundColor: colors.primarySoft
  },
  warning: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerSoftBorder,
    borderWidth: 1
  },
  warningLabel: {
    color: colors.dangerSoftText
  }
});

