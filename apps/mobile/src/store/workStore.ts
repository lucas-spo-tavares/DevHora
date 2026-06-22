import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createEmptyEntry, nextPunchType } from "../lib/calculations";
import { isValidDateKey, todayKey } from "../lib/dates";
import { sortPunchEvents } from "../lib/manualEntry";
import { defaultData, normalizeAppData } from "../storage/appStorage";
import {
  AppData,
  NotificationAlert,
  NotificationSettings,
  SpecialNotificationAlert,
  SpecialNotificationTarget,
  WorkEntry
} from "../types/app";

export type NotificationRuleKey = SpecialNotificationTarget;

type WorkStore = AppData & {
  addNotificationAlert: (alert: NotificationAlert) => void;
  addPunchEventToday: (type: WorkEntry["events"][number]["type"]) => void;
  addSpecialNotificationAlert: (alert: SpecialNotificationAlert) => void;
  punchToday: () => void;
  removeNotificationAlert: (alertId: string) => void;
  removeSpecialNotificationAlert: (alertId: string) => void;
  replaceData: (data: AppData) => void;
  saveEntry: (date: string, entry: WorkEntry) => void;
  setDailyMinutes: (dailyMinutes: number) => void;
  setNotificationDurationMinutes: (pauseDurationMinutes: number) => void;
  setPeriodStart: (dateKey: string) => void;
  toggleWorkday: (day: number) => void;
  updateNotificationAlert: (alertId: string, patch: Partial<NotificationAlert>) => void;
  updateSpecialNotificationAlert: (alertId: string, patch: Partial<SpecialNotificationAlert>) => void;
};

export const useWorkStore = create<WorkStore>()(
  persist(
    (set) => ({
      ...defaultData,
      addNotificationAlert: (alert) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              alerts: [...state.settings.notifications.alerts, alert]
            }
          }
        })),
      addPunchEventToday: (type) =>
        set((state) => {
          const date = todayKey();
          const entry = state.entries[date] ?? createEmptyEntry(date);

          return {
            entries: {
              ...state.entries,
              [date]: {
                ...entry,
                events: [
                  ...entry.events,
                  {
                    id: `${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    type
                  }
                ]
              }
            }
          };
        }),
      addSpecialNotificationAlert: (alert) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              specialAlerts: [...state.settings.notifications.specialAlerts, alert]
            }
          }
        })),
      punchToday: () =>
        set((state) => {
          const date = todayKey();
          const entry = state.entries[date] ?? createEmptyEntry(date);
          const type = nextPunchType(entry.events);

          if (!type) {
            return {};
          }

          return {
            entries: {
              ...state.entries,
              [date]: {
                ...entry,
                events: [
                  ...entry.events,
                  {
                    id: `${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    type
                  }
                ]
              }
            }
          };
        }),
      removeNotificationAlert: (alertId) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              alerts: state.settings.notifications.alerts.filter((alert) => alert.id !== alertId)
            }
          }
        })),
      removeSpecialNotificationAlert: (alertId) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              specialAlerts: state.settings.notifications.specialAlerts.filter((alert) => alert.id !== alertId)
            }
          }
        })),
      replaceData: (data) =>
        set({
          entries: data.entries,
          settings: data.settings
        }),
      saveEntry: (date, entry) =>
        set((state) => ({
          entries: {
            ...state.entries,
            [date]: {
              ...entry,
              date,
              events: sortPunchEvents(entry.events)
            }
          }
        })),
      setDailyMinutes: (dailyMinutes) =>
        set((state) => ({
          settings: {
            ...state.settings,
            dailyMinutes
          }
        })),
      setNotificationDurationMinutes: (pauseDurationMinutes) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              pauseDurationMinutes
            }
          }
        })),
      setPeriodStart: (dateKey) =>
        set((state) => {
          if (!isValidDateKey(dateKey)) {
            return {};
          }

          return {
            settings: {
              ...state.settings,
              periodStart: dateKey
            }
          };
        }),
      toggleWorkday: (day) =>
        set((state) => {
          const exists = state.settings.workdays.includes(day);
          const workdays = exists
            ? state.settings.workdays.filter((item) => item !== day)
            : [...state.settings.workdays, day].sort();

          return {
            settings: {
              ...state.settings,
              workdays
            }
          };
        }),
      updateNotificationAlert: (alertId, patch) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              alerts: state.settings.notifications.alerts.map((alert) =>
                alert.id === alertId ? { ...alert, ...patch } : alert
              )
            }
          }
        })),
      updateSpecialNotificationAlert: (alertId, patch) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              specialAlerts: state.settings.notifications.specialAlerts.map((alert) =>
                alert.id === alertId ? { ...alert, ...patch } : alert
              )
            }
          }
        }))
    }),
    {
      name: "devhora:work-store:v1",
      version: 6,
      migrate: (persistedState) => normalizeAppData(persistedState),
      partialize: (state) => ({
        entries: state.entries,
        settings: state.settings
      }),
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);

export function getAppDataSnapshot(): AppData {
  const { entries, settings } = useWorkStore.getState();

  return { entries, settings };
}
