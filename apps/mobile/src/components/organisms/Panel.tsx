import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/metrics";

type PanelProps = {
  children: ReactNode;
  title: string;
};

export function Panel({ children, title }: PanelProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radii.panel,
    borderWidth: 1,
    gap: 12,
    padding: 16
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  }
});

