import { Pressable, StyleSheet, Text } from "react-native";
import { Check, Coffee, Play, Square } from "lucide-react-native";
import { actionLabel } from "../../lib/calculations";
import { colors } from "../../theme/colors";
import { PunchType } from "../../types/app";

type PunchActionProps = {
  nextAction: PunchType | null;
  onPunch: () => void;
};

const punchIcons: Record<PunchType, JSX.Element> = {
  end: <Square size={34} color={colors.primaryText} strokeWidth={2.4} />,
  pauseEnd: <Play size={34} color={colors.primaryText} strokeWidth={2.4} />,
  pauseStart: <Coffee size={34} color={colors.primaryText} strokeWidth={2.4} />,
  start: <Play size={34} color={colors.primaryText} strokeWidth={2.4} />
};

export function PunchAction({ nextAction, onPunch }: PunchActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={!nextAction}
      onPress={onPunch}
      style={({ pressed }) => [styles.button, !nextAction && styles.done, pressed && styles.pressed]}
    >
      {nextAction ? punchIcons[nextAction] : <Check size={34} color={colors.primaryText} strokeWidth={2.4} />}
      <Text style={styles.text}>{actionLabel(nextAction)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.primary,
    borderRadius: 120,
    height: 210,
    justifyContent: "center",
    shadowColor: "#244531",
    shadowOffset: { height: 18, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    width: 210
  },
  done: {
    backgroundColor: "#6b7668"
  },
  pressed: {
    opacity: 0.78
  },
  text: {
    color: colors.primaryText,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 12,
    textAlign: "center",
    width: 160
  }
});

