import { useState } from "react";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ArrowLeft, Bell, Minus, Plus, RotateCcw, TimerReset } from "lucide-react-native";
import { TextButton } from "../components/atoms/TextButton";
import { TextField } from "../components/atoms/TextField";
import { NotificationAlertCard } from "../components/organisms/NotificationAlertCard";
import { NotificationSpecialAlertCard } from "../components/organisms/NotificationSpecialAlertCard";
import { Panel } from "../components/organisms/Panel";
import { StepperField } from "../components/molecules/StepperField";
import { ToggleField } from "../components/molecules/ToggleField";
import { ScreenTemplate } from "../components/templates/ScreenTemplate";
import { formatTimeOfDay, isValidTimeOfDay, parseTimeOfDay } from "../lib/timeOfDay";
import { ensureNotificationPermission } from "../services/notificationService";
import { useWorkStore } from "../store/workStore";
import { colors } from "../theme/colors";
import type { SettingsStackParamList } from "../navigation/SettingsStackNavigator";
import type { NotificationAlert, SpecialNotificationAlert, SpecialNotificationTarget } from "../types/app";

type GenericDraft = {
  enabled: boolean;
  id: string | null;
  label: string;
  time: string;
};

type SpecialDraft = {
  enabled: boolean;
  id: string | null;
  label: string;
  leadMinutes: string;
  target: SpecialNotificationTarget;
};

export function NotificationSettingsScreen() {
  const navigation = useNavigation<StackNavigationProp<SettingsStackParamList>>();
  const notifications = useWorkStore((state) => state.settings.notifications);
  const addNotificationAlert = useWorkStore((state) => state.addNotificationAlert);
  const addSpecialNotificationAlert = useWorkStore((state) => state.addSpecialNotificationAlert);
  const removeNotificationAlert = useWorkStore((state) => state.removeNotificationAlert);
  const removeSpecialNotificationAlert = useWorkStore((state) => state.removeSpecialNotificationAlert);
  const setNotificationDurationMinutes = useWorkStore((state) => state.setNotificationDurationMinutes);
  const updateNotificationAlert = useWorkStore((state) => state.updateNotificationAlert);
  const updateSpecialNotificationAlert = useWorkStore((state) => state.updateSpecialNotificationAlert);

  const [genericDraft, setGenericDraft] = useState<GenericDraft>({
    enabled: true,
    id: null,
    label: "",
    time: "08:00"
  });
  const [specialDraft, setSpecialDraft] = useState<SpecialDraft>({
    enabled: true,
    id: null,
    label: "",
    leadMinutes: "10",
    target: "returnReminder"
  });
  const [editorKind, setEditorKind] = useState<"generic" | "special" | null>(null);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  function openGenericAlertEditor(alert?: NotificationAlert) {
    setGenericDraft(
      alert
        ? {
            enabled: alert.enabled,
            id: alert.id,
            label: alert.label,
            time: alert.time
          }
        : {
            enabled: true,
            id: null,
            label: `Alerta ${notifications.alerts.length + 1}`,
            time: "08:00"
          }
    );
    setEditorKind("generic");
  }

  function openSpecialAlertEditor(target: SpecialNotificationTarget, alert?: SpecialNotificationAlert) {
    setSpecialDraft(
      alert
        ? {
            enabled: alert.enabled,
            id: alert.id,
            label: alert.label,
            leadMinutes: String(alert.leadMinutes),
            target: alert.target
          }
        : {
            enabled: true,
            id: null,
            label: target === "returnReminder" ? "Lembrete de almoço" : "Lembrete de expediente",
            leadMinutes: target === "returnReminder" ? "10" : "10",
            target
          }
    );
    setEditorKind("special");
  }

  function confirmRemoveGenericAlert(alert: NotificationAlert) {
    Alert.alert("Excluir alerta", `Remover o alerta "${alert.label}"?`, [
      { style: "cancel", text: "Cancelar" },
      {
        style: "destructive",
        text: "Excluir",
        onPress: () => removeNotificationAlert(alert.id)
      }
    ]);
  }

  function confirmRemoveSpecialAlert(alert: SpecialNotificationAlert) {
    Alert.alert("Excluir lembrete", `Remover o lembrete "${alert.label}"?`, [
      { style: "cancel", text: "Cancelar" },
      {
        style: "destructive",
        text: "Excluir",
        onPress: () => removeSpecialNotificationAlert(alert.id)
      }
    ]);
  }

  function openGenericTimePicker() {
    const currentTime = minutesToDate(parseTimeOfDay(genericDraft.time) ?? 8 * 60);

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        is24Hour: true,
        mode: "time",
        onChange: (_, selectedDate) => {
          if (selectedDate) {
            setGenericDraft((current) => ({
              ...current,
              time: formatTimeOfDay(selectedDate.getHours() * 60 + selectedDate.getMinutes())
            }));
          }
        },
        value: currentTime
      });
      return;
    }

    setIsTimePickerOpen(true);
  }

  async function saveGenericAlert() {
    if (!genericDraft.label.trim()) {
      Alert.alert("Alerta", "Escreva um nome para esse alerta.");
      return;
    }

    if (!isValidTimeOfDay(genericDraft.time)) {
      Alert.alert("Alerta", "Escolha um horário válido.");
      return;
    }

    const normalized: NotificationAlert = {
      enabled: genericDraft.enabled,
      id: genericDraft.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      label: genericDraft.label.trim(),
      time: genericDraft.time
    };

    if (genericDraft.id) {
      updateNotificationAlert(normalized.id, normalized);
    } else {
      addNotificationAlert(normalized);
    }

    setEditorKind(null);
  }

  async function saveSpecialAlert() {
    const leadMinutes = Number(specialDraft.leadMinutes);

    if (!specialDraft.label.trim()) {
      Alert.alert("Lembrete", "Escreva um nome para esse lembrete.");
      return;
    }

    if (!Number.isInteger(leadMinutes) || leadMinutes < 0) {
      Alert.alert("Lembrete", "Escolha uma antecedência válida.");
      return;
    }

    if (specialDraft.enabled) {
      const allowed = await ensureNotificationPermission();

      if (!allowed) {
        Alert.alert(
          "Notificações",
          "Preciso da permissão de notificações para ativar esse lembrete. Libere isso nas configurações do aparelho."
        );
        return;
      }
    }

    const normalized: SpecialNotificationAlert = {
      enabled: specialDraft.enabled,
      id: specialDraft.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      label: specialDraft.label.trim(),
      leadMinutes,
      target: specialDraft.target
    };

    if (specialDraft.id) {
      updateSpecialNotificationAlert(normalized.id, normalized);
    } else {
      addSpecialNotificationAlert(normalized);
    }

    setEditorKind(null);
  }

  function setSpecialLeadMinutesSafely(nextLeadMinutes: number) {
    setSpecialDraft((current) => ({
      ...current,
      leadMinutes: String(Math.max(0, Math.round(nextLeadMinutes)))
    }));
  }

  function adjustSpecialLeadMinutes(delta: number) {
    setSpecialDraft((current) => {
      const currentLeadMinutes = Number(current.leadMinutes);
      const safeLeadMinutes = Number.isFinite(currentLeadMinutes) ? currentLeadMinutes : 0;

      return {
        ...current,
        leadMinutes: String(Math.max(0, Math.round(safeLeadMinutes + delta)))
      };
    });
  }

  const lunchAlerts = notifications.specialAlerts.filter((alert) => alert.target === "returnReminder");
  const overtimeAlerts = notifications.specialAlerts.filter((alert) => alert.target === "overtimeReminder");

  return (
    <ScreenTemplate
      action={
        <TextButton
          icon={<ArrowLeft color={colors.text} size={16} />}
          label="Voltar"
          onPress={() => navigation.goBack()}
        />
      }
      eyebrow="Alertas"
      title="Notificacoes"
    >
      <Text style={styles.helperText}>
        Você pode criar alertas livres por horário e também vários lembretes especiais para almoço e fim de
        expediente.
      </Text>

      <Pressable onPress={() => openGenericAlertEditor()} style={styles.addButton}>
        <Plus color={colors.primaryText} size={18} />
        <Text style={styles.addButtonText}>Adicionar alerta livre</Text>
      </Pressable>

      {notifications.alerts.length === 0 ? (
        <Text style={styles.emptyState}>Nenhum alerta livre criado ainda.</Text>
      ) : (
        notifications.alerts.map((alert, index) => (
          <NotificationAlertCard
            key={alert.id}
            enabled={alert.enabled}
            label={alert.label || `Alerta ${index + 1}`}
            onEdit={() => openGenericAlertEditor(alert)}
            onRemove={() => confirmRemoveGenericAlert(alert)}
            onToggleEnabled={async (enabled) => {
              if (enabled) {
                const allowed = await ensureNotificationPermission();

                if (!allowed) {
                  Alert.alert(
                    "Notificações",
                    "Preciso da permissão de notificações para ativar esse alerta. Libere isso nas configurações do aparelho."
                  );
                  return;
                }
              }

              updateNotificationAlert(alert.id, { enabled });
            }}
            time={alert.time}
          />
        ))
      )}

      <Panel title="Almoço">
        <View style={styles.groupHeader}>
          <RotateCcw color={colors.primary} size={18} />
          <Text style={styles.groupTitle}>Lembretes para voltar do almoço</Text>
        </View>
        <Text style={styles.groupHint}>Você pode criar mais de um, por exemplo 20 e 10 minutos antes.</Text>
        <Pressable onPress={() => openSpecialAlertEditor("returnReminder")} style={styles.groupAddButton}>
          <Plus color={colors.primaryText} size={18} />
          <Text style={styles.groupAddText}>Adicionar lembrete de almoço</Text>
        </Pressable>
        {lunchAlerts.length === 0 ? (
          <Text style={styles.emptyState}>Nenhum lembrete de almoço criado ainda.</Text>
        ) : (
          lunchAlerts.map((alert) => (
            <NotificationSpecialAlertCard
              key={alert.id}
              enabled={alert.enabled}
              label={alert.label}
              leadMinutes={alert.leadMinutes}
              onEdit={() => openSpecialAlertEditor("returnReminder", alert)}
              onRemove={() => confirmRemoveSpecialAlert(alert)}
              onToggleEnabled={async (enabled) => {
                if (enabled) {
                  const allowed = await ensureNotificationPermission();

                  if (!allowed) {
                    Alert.alert(
                      "Notificações",
                      "Preciso da permissão de notificações para ativar esse lembrete. Libere isso nas configurações do aparelho."
                    );
                    return;
                  }
                }

                updateSpecialNotificationAlert(alert.id, { enabled });
              }}
              subtitle="Aviso relativo ao tempo de pausa"
            />
          ))
        )}
      </Panel>

      <Panel title="Expediente">
        <View style={styles.groupHeader}>
          <TimerReset color={colors.primary} size={18} />
          <Text style={styles.groupTitle}>Lembretes para fim de expediente</Text>
        </View>
        <Text style={styles.groupHint}>Crie quantos quiser para sair antes de acumular hora extra.</Text>
        <Pressable onPress={() => openSpecialAlertEditor("overtimeReminder")} style={styles.groupAddButton}>
          <Plus color={colors.primaryText} size={18} />
          <Text style={styles.groupAddText}>Adicionar lembrete de expediente</Text>
        </Pressable>
        {overtimeAlerts.length === 0 ? (
          <Text style={styles.emptyState}>Nenhum lembrete de expediente criado ainda.</Text>
        ) : (
          overtimeAlerts.map((alert) => (
            <NotificationSpecialAlertCard
              key={alert.id}
              enabled={alert.enabled}
              label={alert.label}
              leadMinutes={alert.leadMinutes}
              onEdit={() => openSpecialAlertEditor("overtimeReminder", alert)}
              onRemove={() => confirmRemoveSpecialAlert(alert)}
              onToggleEnabled={async (enabled) => {
                if (enabled) {
                  const allowed = await ensureNotificationPermission();

                  if (!allowed) {
                    Alert.alert(
                      "Notificações",
                      "Preciso da permissão de notificações para ativar esse lembrete. Libere isso nas configurações do aparelho."
                    );
                    return;
                  }
                }

                updateSpecialNotificationAlert(alert.id, { enabled });
              }}
              subtitle="Aviso relativo ao total de horas do dia"
            />
          ))
        )}
      </Panel>

      <Modal animationType="fade" onRequestClose={() => setEditorKind(null)} transparent visible={editorKind !== null}>
        <View style={styles.modalBackdrop}>
          <Pressable onPress={() => setEditorKind(null)} style={styles.modalBackdropHitArea} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editorKind === "generic" ? "Novo alerta" : "Novo lembrete especial"}</Text>
            {editorKind === "generic" ? (
              <>
                <View style={styles.editorSection}>
                  <Text style={styles.editorLabel}>Nome</Text>
                  <TextField
                    autoCapitalize="sentences"
                    onChangeText={(label) => setGenericDraft((current) => ({ ...current, label }))}
                    placeholder="Ex.: reunião, remédio..."
                    value={genericDraft.label}
                  />
                </View>
                <View style={styles.editorSection}>
                  <Text style={styles.editorLabel}>Horário</Text>
                  <Pressable onPress={openGenericTimePicker} style={styles.timeField}>
                    <Text style={styles.timeFieldValue}>{genericDraft.time}</Text>
                    <Text style={styles.timeFieldHint}>Tocar para alterar</Text>
                  </Pressable>
                </View>
                <ToggleField
                  label="Ativado"
                  onValueChange={(enabled) => setGenericDraft((current) => ({ ...current, enabled }))}
                  value={genericDraft.enabled}
                />
                <View style={styles.modalActions}>
                  <TextButton label="Cancelar" onPress={() => setEditorKind(null)} style={styles.modalAction} />
                  <TextButton label="Salvar" onPress={saveGenericAlert} variant="primary" style={styles.modalAction} />
                </View>
              </>
            ) : (
              <>
                <View style={styles.editorSection}>
                  <Text style={styles.editorLabel}>Nome</Text>
                  <TextField
                    autoCapitalize="sentences"
                    onChangeText={(label) => setSpecialDraft((current) => ({ ...current, label }))}
                    placeholder="Ex.: aviso 20 min antes"
                    value={specialDraft.label}
                  />
                </View>
                <StepperField
                  accessibilityLabelDecrease="Diminuir antecedência"
                  accessibilityLabelIncrease="Aumentar antecedência"
                  iconDecrease={<Minus size={16} color={colors.primaryText} />}
                  iconIncrease={<Plus size={16} color={colors.primaryText} />}
                  label="Antecedência em minutos"
                  onDecrease={() => adjustSpecialLeadMinutes(-1)}
                  onDecreaseHold={() => adjustSpecialLeadMinutes(-1)}
                  onIncrease={() => adjustSpecialLeadMinutes(1)}
                  onIncreaseHold={() => adjustSpecialLeadMinutes(1)}
                  value={specialDraft.leadMinutes}
                />
                <ToggleField
                  label="Ativado"
                  onValueChange={(enabled) => setSpecialDraft((current) => ({ ...current, enabled }))}
                  value={specialDraft.enabled}
                />
                <View style={styles.modalActions}>
                  <TextButton label="Cancelar" onPress={() => setEditorKind(null)} style={styles.modalAction} />
                  <TextButton label="Salvar" onPress={saveSpecialAlert} variant="primary" style={styles.modalAction} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      <Modal animationType="fade" onRequestClose={() => setIsTimePickerOpen(false)} transparent visible={isTimePickerOpen}>
        <View style={styles.modalBackdrop}>
          <Pressable onPress={() => setIsTimePickerOpen(false)} style={styles.modalBackdropHitArea} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecionar horário</Text>
            <DateTimePicker
              display="spinner"
              is24Hour
              mode="time"
              onChange={(_, selectedDate) => {
                if (selectedDate) {
                  setGenericDraft((current) => ({
                    ...current,
                    time: formatTimeOfDay(selectedDate.getHours() * 60 + selectedDate.getMinutes())
                  }));
                }
              }}
              value={minutesToDate(parseTimeOfDay(genericDraft.time) ?? 8 * 60)}
            />
            <View style={styles.modalActions}>
              <TextButton label="Cancelar" onPress={() => setIsTimePickerOpen(false)} style={styles.modalAction} />
              <TextButton label="Salvar" onPress={() => setIsTimePickerOpen(false)} variant="primary" style={styles.modalAction} />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenTemplate>
  );
}

function minutesToDate(totalMinutes: number): Date {
  const date = new Date();
  date.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0);

  return date;
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 52
  },
  addButtonText: {
    color: colors.primaryText,
    fontSize: 15,
    fontWeight: "900"
  },
  emptyState: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 6
  },
  editorLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  editorSection: {
    gap: 8
  },
  groupAddButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 16,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 46
  },
  groupAddText: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: "900"
  },
  groupHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  groupHint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  },
  groupTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "900"
  },
  helperText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
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
  timeField: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    padding: 14
  },
  timeFieldHint: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  timeFieldValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
});
