import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createEmptyEntry, nextPunchType } from "../lib/calculations";
import { todayKey } from "../lib/dates";
import { sortPunchEvents } from "../lib/manualEntry";
import { defaultData } from "../storage/appStorage";
import { AppData, WorkEntry } from "../types/app";

type WorkStore = AppData & {
  punchToday: () => void;
  replaceData: (data: AppData) => void;
  setDailyMinutes: (dailyMinutes: number) => void;
  setManualAdjustment: (date: string, adjustmentMinutes: number, note: string) => void;
  saveEntry: (date: string, entry: WorkEntry) => void;
  startNewPeriod: () => void;
  toggleWorkday: (day: number) => void;
};

export const useWorkStore = create<WorkStore>()(
  persist(
    (set) => ({
      ...defaultData,
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
      replaceData: (data) =>
        set({
          entries: data.entries,
          settings: data.settings
        }),
      setDailyMinutes: (dailyMinutes) =>
        set((state) => ({
          settings: {
            ...state.settings,
            dailyMinutes
          }
        })),
      setManualAdjustment: (date, adjustmentMinutes, note) =>
        set((state) => {
          const entry = state.entries[date] ?? createEmptyEntry(date);

          return {
            entries: {
              ...state.entries,
              [date]: {
                ...entry,
                adjustmentMinutes,
                note
              }
            }
          };
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
      startNewPeriod: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            periodStart: todayKey()
          }
        })),
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
        })
    }),
    {
      name: "devhora:work-store:v1",
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
