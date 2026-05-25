import { ReactNode, useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";

type StepperFieldProps = {
  accessibilityLabelDecrease: string;
  accessibilityLabelIncrease: string;
  label: string;
  onDecreaseHold?: () => void;
  onIncreaseHold?: () => void;
  onDecrease: () => void;
  onIncrease: () => void;
  value: string;
  iconDecrease: ReactNode;
  iconIncrease: ReactNode;
};

export function StepperField({
  accessibilityLabelDecrease,
  accessibilityLabelIncrease,
  iconDecrease,
  iconIncrease,
  label,
  onDecreaseHold,
  onIncreaseHold,
  onDecrease,
  onIncrease,
  value
}: StepperFieldProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.stepperRow}>
        <StepperButton
          accessibilityLabel={accessibilityLabelDecrease}
          icon={iconDecrease}
          onPress={onDecrease}
          onRepeat={onDecreaseHold}
        />
        <Text style={styles.stepperValue}>{value}</Text>
        <StepperButton
          accessibilityLabel={accessibilityLabelIncrease}
          icon={iconIncrease}
          onPress={onIncrease}
          onRepeat={onIncreaseHold}
        />
      </View>
    </View>
  );
}

type StepperButtonProps = {
  accessibilityLabel: string;
  icon: ReactNode;
  onPress: () => void;
  onRepeat?: () => void;
};

const HOLD_DELAY_MS = 200;
const HOLD_REPEAT_MS = 200;

function StepperButton({ accessibilityLabel, icon, onPress, onRepeat }: StepperButtonProps) {
  const repeatTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didRepeatRef = useRef(false);

  function clearRepeatTimers() {
    if (repeatTimeoutRef.current) {
      clearTimeout(repeatTimeoutRef.current);
      repeatTimeoutRef.current = null;
    }

    if (repeatIntervalRef.current) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
  }

  useEffect(() => clearRepeatTimers, []);

  function startRepeating() {
    if (!onRepeat) {
      return;
    }

    didRepeatRef.current = false;
    clearRepeatTimers();
    repeatTimeoutRef.current = setTimeout(() => {
      didRepeatRef.current = true;
      onRepeat();
      repeatIntervalRef.current = setInterval(onRepeat, HOLD_REPEAT_MS);
    }, HOLD_DELAY_MS);
  }

  function handlePress() {
    if (didRepeatRef.current) {
      return;
    }

    onPress();
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={handlePress}
      onPressIn={startRepeating}
      onPressOut={clearRepeatTimers}
      style={styles.stepperButton}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  stepperButton: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  stepperRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between"
  },
  stepperValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    minWidth: 52,
    textAlign: "center"
  }
});
