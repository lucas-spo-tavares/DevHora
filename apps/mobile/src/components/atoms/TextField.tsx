import { ComponentProps } from "react";
import { StyleSheet, TextInput } from "react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/metrics";

type TextFieldProps = ComponentProps<typeof TextInput>;

export function TextField({ style, ...props }: TextFieldProps) {
  return <TextInput placeholderTextColor={colors.muted} style={[styles.input, style]} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.primaryText,
    borderColor: colors.border,
    borderRadius: radii.panel,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 14
  }
});

