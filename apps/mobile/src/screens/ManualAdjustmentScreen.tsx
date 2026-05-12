import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Plus, Trash2 } from "lucide-react-native";
import { createEmptyEntry, nextPunchType, summarizeDay } from "../lib/calculations";
import { formatDateLabel, todayKey } from "../lib/dates";
import { DraftPunchEvent, formatTimeInput, parseTimeInput, sortPunchEvents, toDraftPunchEvent, validatePunchEvents } from "../lib/manualEntry";
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

const PUNCH_OPTIONS: PunchOption[] = [
  { label: "Entrada", value: "start" },
  { label: "Início pausa", value: "pauseStart" },
  { label: "Fim pausa", value: "pauseEnd" },
  { label: "Saída", value: "end" }
];

function createEmptyDraftEvent(type: PunchType = "start"): DraftPunchEvent {
  return {
    id: `${Date.now()}-${Math.random()}`,
    time: "08:00",
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
  onChange: (index: number, patch: Partial<DraftPunchEvent>) => void;
  onRemove: (index: number) => void;
};

function DraftEventRow({ event, index, onChange, onRemove }: DraftEventRowProps) {
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
      <TextField inputMode="numeric" onChangeText={(time) => onChange(index, { time })} placeholder="HH:MM" value={event.time} />
    </View>
  );
}

export function ManualAdjustmentScreen() {
  const entries = useWorkStore((state) => state.entries);
  const settings = useWorkStore((state) => state.settings);
  const saveEntry = useWorkStore((state) => state.saveEntry);

  const [dateInput, setDateInput] = useState(todayKey());
  const [loadedDate, setLoadedDate] = useState(todayKey());
  const [draftEvents, setDraftEvents] = useState<DraftPunchEvent[]>([]);
  const [adjustmentMinutes, setAdjustmentMinutes] = useState("0");
  const [note, setNote] = useState("");
  const [newEventTime, setNewEventTime] = useState("08:00");
  const [newEventType, setNewEventType] = useState<PunchType>("start");

  useEffect(() => {
    loadDay(todayKey());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadDay(targetDate = dateInput) {
    if (!isValidDateKey(targetDate)) {
      Alert.alert("Edição manual", "Use uma data no formato AAAA-MM-DD.");
      return;
    }

    const entry = entries[targetDate] ?? createEmptyEntry(targetDate);

    setLoadedDate(targetDate);
    setDateInput(targetDate);
    setDraftEvents(entry.events.map(toDraftPunchEvent));
    setAdjustmentMinutes(String(entry.adjustmentMinutes));
    setNote(entry.note);
    setNewEventTime(entry.events.at(-1) ? formatTimeInput(entry.events.at(-1)!.timestamp) : "08:00");
    setNewEventType(nextPunchType(entry.events) ?? "start");
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
        ...createEmptyDraftEvent(newEventType),
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
      <View style={styles.loadRow}>
        <TextField onChangeText={setDateInput} placeholder="AAAA-MM-DD" style={styles.dateField} value={dateInput} />
        <TextButton label="Carregar dia" onPress={() => loadDay()} style={styles.loadButton} />
      </View>

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
            <DraftEventRow event={event} index={index} key={event.id} onChange={updateDraftEvent} onRemove={removeDraftEvent} />
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
        <TextField inputMode="numeric" onChangeText={setNewEventTime} placeholder="HH:MM" value={newEventTime} />
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
  dateField: {
    flex: 1
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
  loadButton: {
    alignSelf: "stretch"
  },
  loadRow: {
    alignItems: "stretch",
    flexDirection: "row",
    gap: 10
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
