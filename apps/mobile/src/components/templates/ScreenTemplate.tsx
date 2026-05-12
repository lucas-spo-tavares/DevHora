import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/metrics";

type ScreenTemplateProps = {
  action?: ReactNode;
  children: ReactNode;
  eyebrow: string;
  title: string;
};

export function ScreenTemplate({ action, children, eyebrow, title }: ScreenTemplateProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        {action}
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    padding: spacing.screen,
    paddingBottom: 28
  },
  eyebrow: {
    color: colors.mutedDark,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 4
  }
});

