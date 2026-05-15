import { useEffect, useState } from "react";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Calendar } from "lucide-react-native";
import { formatLongDateWithYear, isValidDateKey, parseDateKey, todayKey, toDateKey } from "../../lib/dates";
import { colors } from "../../theme/colors";
import { TextButton } from "../atoms/TextButton";
import { Panel } from "./Panel";

type PeriodStartPanelProps = {
  onSavePeriodStart: (dateKey: string) => void;
  periodStart: string;
};

export function PeriodStartPanel({ onSavePeriodStart, periodStart }: PeriodStartPanelProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const safePeriodStart = isValidDateKey(periodStart) ? periodStart : todayKey();
  const [draftDate, setDraftDate] = useState(parseDateKey(safePeriodStart));

  useEffect(() => {
    if (isValidDateKey(periodStart)) {
      setDraftDate(parseDateKey(periodStart));
    }
  }, [periodStart]);

  function applyDate(date: Date) {
    const dateKey = toDateKey(date);
    setDraftDate(date);
    onSavePeriodStart(dateKey);
  }

  function openDatePicker() {
    const currentDate = parseDateKey(safePeriodStart);

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        mode: "date",
        onChange: (_, selectedDate) => {
          if (selectedDate) {
            applyDate(selectedDate);
          }
        },
        value: currentDate
      });
      return;
    }

    setDraftDate(currentDate);
    setIsPickerOpen(true);
  }

  function confirmDatePicker() {
    applyDate(draftDate);
    setIsPickerOpen(false);
  }

  return (
    <Panel title="Data inicial">
      <Pressable onPress={openDatePicker} style={styles.button}>
        <View style={styles.content}>
          <Calendar color={colors.primary} size={18} />
          <View style={styles.textBlock}>
            <Text style={styles.label}>Início dos cálculos</Text>
            <Text style={styles.value}>{formatLongDateWithYear(safePeriodStart)}</Text>
          </View>
        </View>
      </Pressable>

      <Modal animationType="fade" onRequestClose={() => setIsPickerOpen(false)} transparent visible={isPickerOpen}>
        <View style={styles.modalBackdrop}>
          <Pressable onPress={() => setIsPickerOpen(false)} style={styles.modalBackdropHitArea} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecionar data inicial</Text>
            <DateTimePicker
              display="spinner"
              mode="date"
              onChange={(_, selectedDate) => {
                if (selectedDate) {
                  setDraftDate(selectedDate);
                }
              }}
              value={draftDate}
            />
            <View style={styles.modalActions}>
              <TextButton label="Cancelar" onPress={() => setIsPickerOpen(false)} style={styles.modalAction} />
              <TextButton label="Salvar" onPress={confirmDatePicker} variant="primary" style={styles.modalAction} />
            </View>
          </View>
        </View>
      </Modal>
    </Panel>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
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
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  textBlock: {
    flex: 1,
    gap: 2
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  }
});
