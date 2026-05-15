import { useEffect, useState, type ReactNode } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Check, Minus, Plus } from "lucide-react-native";
import { formatMinutes } from "../../lib/time";
import { colors } from "../../theme/colors";
import { IconOnlyButton } from "../atoms/IconOnlyButton";
import { TextButton } from "../atoms/TextButton";
import { Panel } from "./Panel";

type DailyHoursPanelProps = {
  dailyMinutes: number;
  onSaveDailyMinutes: (dailyMinutes: number) => void;
};

export function DailyHoursPanel({ dailyMinutes, onSaveDailyMinutes }: DailyHoursPanelProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [draftMinutes, setDraftMinutes] = useState(clampMinutes(dailyMinutes));

  useEffect(() => {
    setDraftMinutes(clampMinutes(dailyMinutes));
  }, [dailyMinutes]);

  function saveDailyHours() {
    const minutes = clampMinutes(draftMinutes);

    if (!minutes || minutes > MAX_DAILY_MINUTES) {
      Alert.alert("Horas por dia", "Escolha um valor entre 00:01 e 24:00.");
      return;
    }

    onSaveDailyMinutes(minutes);
    setIsPickerOpen(false);
  }

  function openDurationPicker() {
    setDraftMinutes(clampMinutes(dailyMinutes));
    setIsPickerOpen(true);
  }

  function setDraftMinutesSafely(nextMinutes: number) {
    setDraftMinutes(clampMinutes(nextMinutes));
  }

  return (
    <Panel title="Horas por dia">
      <View style={styles.row}>
        <Pressable onPress={openDurationPicker} style={styles.durationButton}>
          <Text style={styles.value}>{formatMinutes(dailyMinutes)}</Text>
        </Pressable>
        <IconOnlyButton
          accessibilityLabel="Salvar horas por dia"
          icon={<Check size={20} color={colors.primaryText} />}
          onPress={saveDailyHours}
        />
      </View>

      <Modal animationType="fade" onRequestClose={() => setIsPickerOpen(false)} transparent visible={isPickerOpen}>
        <View style={styles.modalBackdrop}>
          <Pressable onPress={() => setIsPickerOpen(false)} style={styles.modalBackdropHitArea} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Horas por dia</Text>
            <Text style={styles.modalHint}>Ajuste com hora e minuto. O máximo permitido é 24 horas.</Text>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Horas</Text>
              <View style={styles.stepperRow}>
                <StepperButton accessibilityLabel="Diminuir horas" onPress={() => setDraftMinutesSafely(draftMinutes - 60)} icon={<Minus size={16} color={colors.primaryText} />} />
                <Text style={styles.stepperValue}>{formatDurationValue(draftMinutes).hours}</Text>
                <StepperButton accessibilityLabel="Aumentar horas" onPress={() => setDraftMinutesSafely(draftMinutes + 60)} icon={<Plus size={16} color={colors.primaryText} />} />
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Minutos</Text>
              <View style={styles.stepperRow}>
                <StepperButton accessibilityLabel="Diminuir minutos" onPress={() => setDraftMinutesSafely(draftMinutes - 1)} icon={<Minus size={16} color={colors.primaryText} />} />
                <Text style={styles.stepperValue}>{formatDurationValue(draftMinutes).minutes}</Text>
                <StepperButton accessibilityLabel="Aumentar minutos" onPress={() => setDraftMinutesSafely(draftMinutes + 1)} icon={<Plus size={16} color={colors.primaryText} />} />
              </View>
            </View>
            <TextButton label="Definir 8h" onPress={() => setDraftMinutes(8 * 60)} variant="secondary" />
            <View style={styles.modalActions}>
              <TextButton label="Cancelar" onPress={() => setIsPickerOpen(false)} style={styles.modalAction} />
              <TextButton label="Salvar" onPress={saveDailyHours} variant="primary" style={styles.modalAction} />
            </View>
          </View>
        </View>
      </Modal>
    </Panel>
  );
}

const MAX_DAILY_MINUTES = 24 * 60;
const MIN_DAILY_MINUTES = 1;

function clampMinutes(minutes: number): number {
  if (!Number.isFinite(minutes)) {
    return MIN_DAILY_MINUTES;
  }

  return Math.max(MIN_DAILY_MINUTES, Math.min(Math.round(minutes), MAX_DAILY_MINUTES));
}

function formatDurationValue(minutes: number): { hours: string; minutes: string } {
  const safeMinutes = clampMinutes(minutes);
  const hours = Math.floor(safeMinutes / 60);
  const restMinutes = safeMinutes % 60;

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(restMinutes).padStart(2, "0")
  };
}

type StepperButtonProps = {
  accessibilityLabel: string;
  icon: ReactNode;
  onPress: () => void;
};

function StepperButton({ accessibilityLabel, icon, onPress }: StepperButtonProps) {
  return (
    <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" onPress={onPress} style={styles.stepperButton}>
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  durationButton: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    padding: 14
  },
  modalAction: {
    flex: 1
  },
  modalActions: {
    flexDirection: "row",
    gap: 10
  },
  modalBackdrop: {
    backgroundColor: "rgba(13, 17, 26, 0.55)",
    flex: 1,
    justifyContent: "center",
    padding: 20
  },
  modalBackdropHitArea: {
    ...StyleSheet.absoluteFillObject
  },
  modalCard: {
    backgroundColor: colors.panel,
    borderRadius: 24,
    gap: 14,
    padding: 18
  },
  modalHint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
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
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  }
});
