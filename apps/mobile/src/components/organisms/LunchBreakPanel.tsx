import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import { formatMinutes } from "../../lib/time";
import { colors } from "../../theme/colors";
import { StepperField } from "../molecules/StepperField";
import { Panel } from "./Panel";

type LunchBreakPanelProps = {
  pauseDurationMinutes: number;
  onSavePauseDurationMinutes: (pauseDurationMinutes: number) => void;
};

const MIN_PAUSE_DURATION_MINUTES = 1;

export function LunchBreakPanel({ pauseDurationMinutes, onSavePauseDurationMinutes }: LunchBreakPanelProps) {
  const [draftMinutes, setDraftMinutes] = useState(clampPauseMinutes(pauseDurationMinutes));
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    setDraftMinutes(clampPauseMinutes(pauseDurationMinutes));
  }, [pauseDurationMinutes]);

  function openDurationPicker() {
    setDraftMinutes(clampPauseMinutes(pauseDurationMinutes));
    setIsPickerOpen(true);
  }

  function adjustPauseDurationMinutes(delta: number) {
    setDraftMinutes((current) => clampPauseMinutes(current + delta));
  }

  function savePauseDurationMinutes() {
    const minutes = clampPauseMinutes(draftMinutes);

    if (!minutes) {
      Alert.alert("Intervalo de pausa", "Escolha um valor maior que zero.");
      return;
    }

    onSavePauseDurationMinutes(minutes);
    setIsPickerOpen(false);
  }

  return (
    <Panel title="Intervalo de pausa">
      <View style={styles.row}>
        <Pressable onPress={openDurationPicker} style={styles.durationButton}>
          <Text style={styles.value}>{formatMinutes(pauseDurationMinutes)}</Text>
        </Pressable>
      </View>
      <Text style={styles.hint}>Esse tempo define quando os lembretes para voltar da pausa devem aparecer.</Text>

      <Modal animationType="fade" onRequestClose={() => setIsPickerOpen(false)} transparent visible={isPickerOpen}>
        <View style={styles.modalBackdrop}>
          <Pressable onPress={() => setIsPickerOpen(false)} style={styles.modalBackdropHitArea} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tempo padrão de pausa</Text>
            <Text style={styles.modalHint}>Ajuste a duração em minutos.</Text>
            <StepperField
              accessibilityLabelDecrease="Diminuir duração da pausa"
              accessibilityLabelIncrease="Aumentar duração da pausa"
              iconDecrease={<Minus size={16} color={colors.primaryText} />}
              iconIncrease={<Plus size={16} color={colors.primaryText} />}
              label="Duração"
              onDecrease={() => adjustPauseDurationMinutes(-1)}
              onDecreaseHold={() => adjustPauseDurationMinutes(-1)}
              onIncrease={() => adjustPauseDurationMinutes(1)}
              onIncreaseHold={() => adjustPauseDurationMinutes(1)}
              value={formatMinutes(draftMinutes)}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setIsPickerOpen(false)} style={styles.modalAction}>
                <Text style={styles.modalActionText}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={savePauseDurationMinutes} style={[styles.modalAction, styles.modalActionPrimary]}>
                <Text style={styles.modalActionPrimaryText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Panel>
  );
}

function clampPauseMinutes(minutes: number): number {
  if (!Number.isFinite(minutes)) {
    return MIN_PAUSE_DURATION_MINUTES;
  }

  return Math.max(MIN_PAUSE_DURATION_MINUTES, Math.round(minutes));
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
  hint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  },
  modalAction: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14
  },
  modalActionPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  modalActionPrimaryText: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: "900"
  },
  modalActionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800"
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
