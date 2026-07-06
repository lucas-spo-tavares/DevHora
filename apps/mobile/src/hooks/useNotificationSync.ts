import { useEffect } from "react";
import { AppState } from "react-native";
import { todayKey } from "../lib/dates";
import { configureNotificationSystem, syncWorkNotifications } from "../services/notificationService";
import { getAppDataSnapshot, useWorkStore } from "../store/workStore";

function syncCurrentDayNotifications() {
  const { entries, settings } = getAppDataSnapshot();
  const dateKey = todayKey();

  void syncWorkNotifications({
    events: entries[dateKey]?.events ?? [],
    settings
  });
}

export function useNotificationSync() {
  useEffect(() => {
    void configureNotificationSystem();
    syncCurrentDayNotifications();

    const unsubscribe = useWorkStore.subscribe((state, previousState) => {
      const dateKey = todayKey();
      const currentEvents = state.entries[dateKey]?.events ?? [];
      const previousEvents = previousState.entries[dateKey]?.events ?? [];

      if (state.settings === previousState.settings && currentEvents === previousEvents) {
        return;
      }

      syncCurrentDayNotifications();
    });

    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        syncCurrentDayNotifications();
      }
    });

    return () => {
      unsubscribe();
      appStateSubscription.remove();
    };
  }, []);
}
