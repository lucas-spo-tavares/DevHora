import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type SummaryGridProps = {
  children: ReactNode;
};

export function SummaryGrid({ children }: SummaryGridProps) {
  return <View style={styles.grid}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  }
});

