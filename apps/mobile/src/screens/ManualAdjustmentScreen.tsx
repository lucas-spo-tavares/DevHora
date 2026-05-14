import { useEffect, useState } from "react";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Calendar, Clock3, Plus, Trash2 } from "lucide-react-native";
import { createEmptyEntry, nextPunchType, summarizeDay } from "../lib/calculations";
import { formatDateLabel, parseDateKey, todayKey, toDateKey } from "../lib/dates";
import {
  createDraftTime,
  DraftPunchEvent,
  formatTimeInput,
  parseTimeInput,
  sortPunchEvents,
  toDraftPunchEvent,
  validatePunchEvents
} from "../lib/manualEntry";
import { formatMinutes, formatSignedMinutes } from "../lib/time";
import { useWorkStore } from "../store/workStore";
import { colors } from "../theme/colors";
import { PunchType, WorkEntry } from "../types/app";
import { TextButton } from "../components/atoms/TextButton";
import { TextField } from "../components/atoms/TextField";
import { ScreenTemplate } from "../components/templates/ScreenTemplate";

type PunchOption = {
  label: string;
  value: PunchType;
};

type TimePickerTarget = {
  index: number;
  kind: "draft";
} | {
  kind: "new";
} | null;

const PUNCH_OPTIONS: PunchOption[] = [
  { label: "Entrada", value: "start" },
  { label: "Início pausa", value: "pauseStart" },
  { label: "Fim pausa", value: "pauseEnd" },
  { label: "Saída", value: "end" }
];

function createEmptyDraftEvent(dateKey: string, type: PunchType = "start"): DraftPunchEvent {
  return {
    id: `${Date.now()}-${Math.random()}`,
    time: createDraftTime(dateKey, 8, 0),
    type
  };
}

function isValidDateKey(dateKey: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey);
}

function normalizeDraftEvents(dateKey: string, events: DraftPunchEvent[]): WorkEntry["events"] | null {
  const builtEvents = events.map((event) => {
    const timestamp = parseTimeInput(dateKey, event.time);

    if (!timestamp) {
      return null;
    }

    return {
      id: event.id,
      timestamp,
      type: event.type
    };
  });

  if (builtEvents.some((event) => !event)) {
    return null;
  }

  return sortPunchEvents(builtEvents as WorkEntry["events"]);
}

type DraftEventRowProps = {
  event: DraftPunchEvent;
  index: number;
  onEditTime: (index: number) => void;
  onChange: (index: number, patch: Partial<DraftPunchEvent>) => void;
  onRemove: (index: number) => void;
};

function DraftEventRow({ event, index, onEditTime, onChange, onRemove }: DraftEventRowProps) {
  return (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>Ponto {index + 1}</Text>
        <Pressable accessibilityLabel={`Excluir ponto ${index + 1}`} onPress={() => onRemove(index)} style={styles.iconButton}>
          <Trash2 color={colors.dangerSoftText} size={16} />
        </Pressable>
      </View>
      <View style={styles.chips}>
        {PUNCH_OPTIONS.map((option) => {
          const selected = event.type === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(index, { type: option.value })}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable onPress={() => onEditTime(index)} style={styles.timeButton}>
        <Clock3 color={colors.primary} size={18} />
        <View>
          <Text style={styles.timeButtonLabel}>Hora</Text>
          <Text style={styles.timeButtonValue}>{formatTimeInput(event.time)}</Text>
        </View>
      </Pressable>
    </View>
  );
}

export function ManualAdjustmentScreen() {
  const entries = useWorkStore((state) => state.entries);
  const settings = useWorkStore((state) => state.settings);
  const saveEntry = useWorkStore((state) => state.saveEntry);

  const [loadedDate, setLoadedDate] = useState(todayKey());
  const [draftEvents, setDraftEvents] = useState<DraftPunchEvent[]>([]);
  const [adjustmentMinutes, setAdjustmentMinutes] = useState("0");
  const [note, setNote] = useState("");
  const [newEventTime, setNewEventTime] = useState(createDraftTime(todayKey(), 8, 0));
  const [newEventType, setNewEventType] = useState<PunchType>("start");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [draftPickerDate, setDraftPickerDate] = useState(parseDateKey(todayKey()));
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [draftPickerTime, setDraftPickerTime] = useState(createDraftTime(todayKey(), 8, 0));
  const [timePickerTarget, setTimePickerTarget] = useState<TimePickerTarget>(null);

  useEffect(() => {
    loadDay(todayKey());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadDay(targetDate: string) {
    if (!isValidDateKey(targetDate)) {
      Alert.alert("Edição manual", "Use uma data no formato AAAA-MM-DD.");
      return;
    }

    const entry = entries[targetDate] ?? createEmptyEntry(targetDate);

    setLoadedDate(targetDate);
    setDraftEvents(entry.events.map(toDraftPunchEvent));
    setAdjustmentMinutes(String(entry.adjustmentMinutes));
    setNote(entry.note);
    setNewEventTime(entry.events.at(-1) ? new Date(entry.events.at(-1)!.timestamp) : createDraftTime(targetDate, 8, 0));
    setNewEventType(nextPunchType(entry.events) ?? "start");
  }

  function openDatePicker() {
    const currentDate = parseDateKey(loadedDate);

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        mode: "date",
        onChange: (_, selectedDate) => {
          if (selectedDate) {
            setDraftPickerDate(selectedDate);
            loadDay(toDateKey(selectedDate));
          }
        },
        value: currentDate
      });
      return;
    }

    setDraftPickerDate(currentDate);
    setIsDatePickerOpen(true);
  }

  function confirmDatePicker() {
    loadDay(toDateKey(draftPickerDate));
    setIsDatePickerOpen(false);
  }

  function applySelectedTime(target: TimePickerTarget, selectedTime: Date) {
    if (!target) {
      return;
    }

    if (target.kind === "new") {
      setNewEventTime(selectedTime);
      return;
    }

    setDraftEvents((current) => current.map((event, currentIndex) => (currentIndex === target.index ? { ...event, time: selectedTime } : event)));
  }

  function openTimePicker(target: TimePickerTarget, initialTime: Date) {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        is24Hour: true,
        mode: "time",
        onChange: (_, selectedTime) => {
          if (selectedTime) {
            applySelectedTime(target, selectedTime);
          }
        },
        value: initialTime
      });
      return;
    }

    setDraftPickerTime(initialTime);
    setTimePickerTarget(target);
    setIsTimePickerOpen(true);
  }

  function confirmTimePicker() {
    applySelectedTime(timePickerTarget, draftPickerTime);
    setIsTimePickerOpen(false);
    setTimePickerTarget(null);
  }

  function updateDraftEvent(index: number, patch: Partial<DraftPunchEvent>) {
    setDraftEvents((current) => current.map((event, currentIndex) => (currentIndex === index ? { ...event, ...patch } : event)));
  }

  function removeDraftEvent(index: number) {
    setDraftEvents((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function addDraftEvent() {
    if (!isValidDateKey(loadedDate)) {
      Alert.alert("Edição manual", "Carregue uma data válida antes de adicionar um ponto.");
      return;
    }

    setDraftEvents((current) => [
      ...current,
      {
        ...createEmptyDraftEvent(loadedDate, newEventType),
        time: newEventTime
      }
    ]);
  }

  function saveDraft() {
    if (!isValidDateKey(loadedDate)) {
      Alert.alert("Edição manual", "Use uma data no formato AAAA-MM-DD.");
      return;
    }

    const minutes = Number(adjustmentMinutes.replace(",", "."));

    if (!Number.isFinite(minutes)) {
      Alert.alert("Edição manual", "Use minutos validos para o ajuste.");
      return;
    }

    const events = normalizeDraftEvents(loadedDate, draftEvents);

    if (!events) {
      Alert.alert("Edição manual", "Revise os horários dos pontos. Use o formato HH:MM em todos eles.");
      return;
    }

    const validationError = validatePunchEvents(events);

    if (validationError) {
      Alert.alert("Edição manual", validationError);
      return;
    }

    saveEntry(loadedDate, {
      adjustmentMinutes: Math.round(minutes),
      date: loadedDate,
      events,
      note
    });

    Alert.alert("Dia salvo", "Os pontos e o ajuste manual foram atualizados.");
  }

  const currentEntry = entries[loadedDate] ?? createEmptyEntry(loadedDate);
  const previewAdjustment = Number(adjustmentMinutes.replace(",", "."));
  const previewEvents = normalizeDraftEvents(loadedDate, draftEvents) ?? currentEntry.events;
  const preview = summarizeDay(
    {
      entries: {
        ...entries,
        [loadedDate]: {
          ...currentEntry,
          adjustmentMinutes: Number.isFinite(previewAdjustment) ? Math.round(previewAdjustment) : currentEntry.adjustmentMinutes,
          events: previewEvents,
          note
        }
      },
      settings
    },
    loadedDate
  );

  return (
    <ScreenTemplate eyebrow="Lançamentos e ajustes" title="Edição manual">
      <Text style={styles.description}>
        Aqui você pode lançar entrada, pausas e saída, além de corrigir horários de dias já registrados.
      </Text>
      <View style={styles.fieldGroup}>
        <Text style={styles.sectionLabel}>Carregar dia</Text>
        <Pressable onPress={openDatePicker} style={styles.datePickerButton}>
          <View style={styles.datePickerButtonContent}>
            <Calendar color={colors.primary} size={18} />
            <View style={styles.datePickerTextBlock}>
              <Text style={styles.datePickerLabel}>Selecionar dia</Text>
              <Text style={styles.datePickerValue}>{formatDateLabel(loadedDate)}</Text>
            </View>
          </View>
        </Pressable>
      </View>

      <Modal animationType="fade" onRequestClose={() => setIsDatePickerOpen(false)} transparent visible={isDatePickerOpen}>
        <View style={styles.modalBackdrop}>
          <Pressable onPress={() => setIsDatePickerOpen(false)} style={styles.modalBackdropHitArea} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecionar data</Text>
            <DateTimePicker
              display="spinner"
              mode="date"
              onChange={(_, selectedDate) => {
                if (selectedDate) {
                  setDraftPickerDate(selectedDate);
                }
              }}
              value={draftPickerDate}
            />
            <View style={styles.modalActions}>
              <TextButton label="Cancelar" onPress={() => setIsDatePickerOpen(false)} style={styles.modalAction} />
              <TextButton label="Carregar" onPress={confirmDatePicker} variant="primary" style={styles.modalAction} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" onRequestClose={() => setIsTimePickerOpen(false)} transparent visible={isTimePickerOpen}>
        <View style={styles.modalBackdrop}>
          <Pressable onPress={() => setIsTimePickerOpen(false)} style={styles.modalBackdropHitArea} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecionar hora</Text>
            <DateTimePicker
              display="spinner"
              is24Hour
              mode="time"
              onChange={(_, selectedTime) => {
                if (selectedTime) {
                  setDraftPickerTime(selectedTime);
                }
              }}
              value={draftPickerTime}
            />
            <View style={styles.modalActions}>
              <TextButton label="Cancelar" onPress={() => setIsTimePickerOpen(false)} style={styles.modalAction} />
              <TextButton label="Carregar" onPress={confirmTimePicker} variant="primary" style={styles.modalAction} />
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>{formatDateLabel(loadedDate)}</Text>
        <Text style={styles.summaryValue}>{currentEntry.events.length ? `${currentEntry.events.length} ponto(s)` : "Sem pontos registrados"}</Text>
        <Text style={styles.summaryMeta}>
          Feito: {formatMinutes(preview.workedMinutes)} | Saldo: {formatSignedMinutes(preview.balanceMinutes)}
        </Text>
      </View>

      {draftEvents.length ? (
        <View style={styles.eventsList}>
          {draftEvents.map((event, index) => (
            <DraftEventRow
              event={event}
              index={index}
              key={event.id}
              onChange={updateDraftEvent}
              onEditTime={(draftIndex) => openTimePicker({ index: draftIndex, kind: "draft" }, event.time)}
              onRemove={removeDraftEvent}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>Nenhum ponto neste dia ainda. Use o bloco abaixo para adicionar um novo evento.</Text>
      )}

      <View style={styles.addBox}>
        <Text style={styles.sectionLabel}>Adicionar ponto</Text>
        <View style={styles.chips}>
          {PUNCH_OPTIONS.map((option) => {
            const selected = newEventType === option.value;

            return (
              <Pressable
                key={option.value}
                onPress={() => setNewEventType(option.value)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={() => openTimePicker({ kind: "new" }, newEventTime)} style={styles.timeButton}>
          <Clock3 color={colors.primary} size={18} />
          <View>
            <Text style={styles.timeButtonLabel}>Hora do novo ponto</Text>
            <Text style={styles.timeButtonValue}>{formatTimeInput(newEventTime)}</Text>
          </View>
        </Pressable>
        <TextButton icon={<Plus color={colors.text} size={18} />} label="Adicionar" onPress={addDraftEvent} />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.sectionLabel}>Ajuste do dia</Text>
        <TextField inputMode="numeric" onChangeText={setAdjustmentMinutes} placeholder="Minutos, ex: 30 ou -15" value={adjustmentMinutes} />
        <TextField onChangeText={setNote} placeholder="Observação" value={note} />
      </View>

      <TextButton label="Salvar alterações" onPress={saveDraft} variant="primary" />
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  addBox: {
    gap: 10
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  chipLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800"
  },
  chipLabelSelected: {
    color: colors.primaryText
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21
  },
  empty: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21
  },
  eventCard: {
    backgroundColor: colors.primaryText,
    borderColor: colors.borderSoft,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 12
  },
  eventHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  eventTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800"
  },
  eventsList: {
    gap: 10
  },
  fieldGroup: {
    gap: 10
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderRadius: 999,
    height: 32,
    justifyContent: "center",
    width: 32
  },
  datePickerButton: {
    backgroundColor: colors.primaryText,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14
  },
  datePickerButtonContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  datePickerLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  datePickerTextBlock: {
    gap: 2
  },
  datePickerValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 12
  },
  modalAction: {
    minWidth: 120
  },
  modalBackdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    flex: 1,
    justifyContent: "center",
    padding: 20
  },
  modalBackdropHitArea: {
    ...StyleSheet.absoluteFillObject
  },
  modalCard: {
    backgroundColor: colors.background,
    borderRadius: 22,
    elevation: 4,
    maxWidth: 420,
    position: "relative",
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    width: "100%"
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10
  },
  timeButton: {
    alignItems: "center",
    backgroundColor: colors.primaryText,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  timeButtonLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  timeButtonValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800"
  },
  summaryBox: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    padding: 12
  },
  summaryLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  summaryMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  summaryValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700"
  }
});
