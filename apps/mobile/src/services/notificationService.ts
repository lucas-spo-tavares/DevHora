import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getOpenIntervalStart, workedMinutes } from "../lib/calculations";
import { parseTimeOfDay } from "../lib/timeOfDay";
import { PunchEvent, Settings, SpecialNotificationAlert, SpecialNotificationTarget } from "../types/app";

const NOTIFICATION_CHANNEL_ID = "devhora-reminders";
const NOTIFICATION_KIND = "devhora-work-reminder";

let isConfigured = false;

type SyncNotificationSchedulesParams = {
  events: PunchEvent[];
  settings: Settings;
};

type ScheduledNotificationData = {
  alertId?: string;
  kind: typeof NOTIFICATION_KIND;
  rule: string;
};

export async function configureNotificationSystem() {
  if (Platform.OS === "web" || isConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true
    })
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      importance: Notifications.AndroidImportance.HIGH,
      name: "Lembretes DevHora",
      vibrationPattern: [0, 250, 250, 250]
    });
  }

  isConfigured = true;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  const current = await Notifications.getPermissionsAsync();

  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();

  return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

async function hasNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  const current = await Notifications.getPermissionsAsync();

  return current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function cancelWorkNotifications() {
  if (Platform.OS === "web") {
    return;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  await Promise.all(
    scheduled
      .filter((notification) => {
        const data = notification.content.data as Partial<ScheduledNotificationData> | undefined;

        return data?.kind === NOTIFICATION_KIND;
      })
      .map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier))
  );
}

export async function syncWorkNotifications({ events, settings }: SyncNotificationSchedulesParams) {
  if (Platform.OS === "web") {
    return;
  }

  await configureNotificationSystem();
  await cancelWorkNotifications();

  if (!(await hasNotificationPermission())) {
    return;
  }

  await scheduleGenericAlerts(settings.notifications.alerts);
  await scheduleSpecialAlerts(events, settings);
}

async function scheduleGenericAlerts(alerts: Settings["notifications"]["alerts"]) {
  await Promise.all(
    alerts.map(async (alert) => {
      if (!alert.enabled) {
        return;
      }

      const minutes = parseTimeOfDay(alert.time);

      if (minutes === null) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          body: alert.label,
          data: {
            alertId: alert.id,
            kind: NOTIFICATION_KIND,
            rule: "generic"
          } satisfies ScheduledNotificationData,
          title: "Lembrete"
        },
        trigger: {
          hour: Math.floor(minutes / 60),
          minute: minutes % 60,
          repeats: true
        }
      });
    })
  );
}

async function scheduleSpecialAlerts(events: PunchEvent[], settings: Settings) {
  await Promise.all(
    settings.notifications.specialAlerts.map(async (alert) => {
      if (!alert.enabled) {
        return;
      }

      if (alert.target === "returnReminder") {
        await scheduleReturnAlert(alert, events, settings.notifications.pauseDurationMinutes);
        return;
      }

      await scheduleOvertimeAlert(alert, events, settings.dailyMinutes);
    })
  );
}

async function scheduleReturnAlert(
  alert: SpecialNotificationAlert,
  events: PunchEvent[],
  pauseDurationMinutes: number
) {
  const lastEvent = events.at(-1);

  if (lastEvent?.type !== "pauseStart" || pauseDurationMinutes <= 0) {
    return;
  }

  const startDate = new Date(lastEvent.timestamp);
  const triggerDate = new Date(startDate.getTime() + (pauseDurationMinutes - alert.leadMinutes) * 60_000);

  if (triggerDate.getTime() <= Date.now()) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      body: alert.label,
      data: {
        alertId: alert.id,
        kind: NOTIFICATION_KIND,
        rule: "returnReminder"
      } satisfies ScheduledNotificationData,
      title: "Voltar do almoço"
    },
    trigger: triggerDate
  });
}

async function scheduleOvertimeAlert(alert: SpecialNotificationAlert, events: PunchEvent[], dailyMinutes: number) {
  const openIntervalStart = getOpenIntervalStart(events);

  if (!openIntervalStart || dailyMinutes <= 0) {
    return;
  }

  const startDate = new Date(openIntervalStart.timestamp);
  const workedSoFar = workedMinutes(events);
  const activeMinutesElapsed = Math.max(0, Math.round((Date.now() - startDate.getTime()) / 60_000));
  const totalWorkedMinutes = workedSoFar + activeMinutesElapsed;
  const remainingToTarget = dailyMinutes - totalWorkedMinutes;
  const remainingToReminder = remainingToTarget - alert.leadMinutes;

  if (remainingToReminder <= 0) {
    return;
  }

  const triggerDate = new Date(Date.now() + remainingToReminder * 60_000);

  await Notifications.scheduleNotificationAsync({
    content: {
      body: alert.label,
      data: {
        alertId: alert.id,
        kind: NOTIFICATION_KIND,
        rule: "overtimeReminder"
      } satisfies ScheduledNotificationData,
      title: "Evitar hora extra"
    },
    trigger: triggerDate
  });
}
