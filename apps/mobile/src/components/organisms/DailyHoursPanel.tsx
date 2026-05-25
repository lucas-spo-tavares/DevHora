import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Check, Minus, Plus } from "lucide-react-native";
import { formatMinutes } from "../../lib/time";
import { colors } from "../../theme/colors";
import { IconOnlyButton } from "../atoms/IconOnlyButton";
import { TextButton } from "../atoms/TextButton";
import { StepperField } from "../molecules/StepperField";
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

  function adjustDraftMinutes(delta: number) {
    setDraftMinutes((current) => clampMinutes(current + delta));
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
            <StepperField
              accessibilityLabelDecrease="Diminuir horas"
              accessibilityLabelIncrease="Aumentar horas"
              iconDecrease={<Minus size={16} color={colors.primaryText} />}
              iconIncrease={<Plus size={16} color={colors.primaryText} />}
              label="Horas"
              onDecrease={() => adjustDraftMinutes(-60)}
              onIncrease={() => adjustDraftMinutes(60)}
              value={formatDurationValue(draftMinutes).hours}
            />
            <StepperField
              accessibilityLabelDecrease="Diminuir minutos"
              accessibilityLabelIncrease="Aumentar minutos"
              iconDecrease={<Minus size={16} color={colors.primaryText} />}
              iconIncrease={<Plus size={16} color={colors.primaryText} />}
              label="Minutos"
              onDecrease={() => adjustDraftMinutes(-1)}
              onDecreaseHold={() => adjustDraftMinutes(-1)}
              onIncrease={() => adjustDraftMinutes(1)}
              onIncreaseHold={() => adjustDraftMinutes(1)}
              value={formatDurationValue(draftMinutes).minutes}
            />
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
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  }
});
