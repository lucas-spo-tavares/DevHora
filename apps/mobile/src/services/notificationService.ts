import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getOpenIntervalStart, workedMinutes } from "../lib/calculations";
import { parseTimeOfDay } from "../lib/timeOfDay";
import { PunchEvent, Settings, SpecialNotificationAlert, SpecialNotificationTarget } from "../types/app";

const NOTIFICATION_CHANNEL_ID = "devhora-reminders";
const NOTIFICATION_KIND = "devhora-work-reminder";

let isConfigured = false;
let latestSyncRequestId = 0;
let syncQueue: Promise<void> = Promise.resolve();

type SyncNotificationSchedulesParams = {
  events: PunchEvent[];
  settings: Settings;
};

type ScheduledNotificationData = {
  alertId?: string;
  kind: typeof NOTIFICATION_KIND;
  rule: string;
};

function buildNotificationContent(
  title: string,
  body: string,
  data: ScheduledNotificationData
): Notifications.NotificationContentInput {
  return {
    body,
    data,
    title,
    ...(Platform.OS === "android" ? { channelId: NOTIFICATION_CHANNEL_ID } : {})
  };
}

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

  const requestId = ++latestSyncRequestId;

  syncQueue = syncQueue.then(async () => {
    if (requestId !== latestSyncRequestId) {
      return;
    }

    await configureNotificationSystem();

    if (requestId !== latestSyncRequestId) {
      return;
    }

    await cancelWorkNotifications();

    if (requestId !== latestSyncRequestId) {
      return;
    }

    if (!(await hasNotificationPermission())) {
      return;
    }

    await scheduleGenericAlerts(settings.notifications.alerts);

    if (requestId !== latestSyncRequestId) {
      await cancelWorkNotifications();
      return;
    }

    await scheduleSpecialAlerts(events, settings);
  });

  await syncQueue;
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
        content: buildNotificationContent("Lembrete", alert.label, {
          alertId: alert.id,
          kind: NOTIFICATION_KIND,
          rule: "generic"
        }),
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
  const pauseStart = getOpenPauseStart(events);

  if (!pauseStart || pauseDurationMinutes <= 0) {
    return;
  }

  const pauseStartedAt = new Date(pauseStart.timestamp).getTime();
  const pauseElapsedMinutes = Math.max(0, Math.floor((Date.now() - pauseStartedAt) / 60_000));
  const minutesUntilReminder = pauseDurationMinutes - alert.leadMinutes - pauseElapsedMinutes;

  if (minutesUntilReminder < 0) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: buildNotificationContent("Voltar da pausa", alert.label, {
      alertId: alert.id,
      kind: NOTIFICATION_KIND,
      rule: "returnReminder"
    }),
    trigger: {
      seconds: Math.max(1, minutesUntilReminder * 60)
    },
  });
}

async function scheduleOvertimeAlert(alert: SpecialNotificationAlert, events: PunchEvent[], dailyMinutes: number) {
  const openIntervalStart = getOpenIntervalStart(events);

  if (!openIntervalStart || dailyMinutes <= 0) {
    return;
  }

  const startDate = new Date(openIntervalStart.timestamp);
  const workedSoFar = workedMinutes(events);
  const activeMinutesElapsed = Math.max(0, Math.floor((Date.now() - startDate.getTime()) / 60_000));
  const totalWorkedMinutes = workedSoFar + activeMinutesElapsed;
  const remainingToTarget = dailyMinutes - totalWorkedMinutes;
  const remainingToReminder = remainingToTarget - alert.leadMinutes;

  if (remainingToReminder <= 0) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: buildNotificationContent("Evitar hora extra", alert.label, {
      alertId: alert.id,
      kind: NOTIFICATION_KIND,
      rule: "overtimeReminder"
    }),
    trigger: {
      seconds: remainingToReminder * 60
    },
  });
}

function getOpenPauseStart(events: PunchEvent[]): PunchEvent | null {
  let openPauseStart: PunchEvent | null = null;

  for (const event of events) {
    if (event.type === "pauseStart") {
      openPauseStart = event;
      continue;
    }

    if (event.type === "pauseEnd" || event.type === "end") {
      openPauseStart = null;
    }
  }

  return openPauseStart;
}
