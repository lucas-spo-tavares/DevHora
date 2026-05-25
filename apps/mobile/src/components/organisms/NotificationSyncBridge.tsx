import { useEffect } from "react";
import { todayKey } from "../../lib/dates";
import { configureNotificationSystem, syncWorkNotifications } from "../../services/notificationService";
import { useWorkStore } from "../../store/workStore";

export function NotificationSyncBridge() {
  const dateKey = todayKey();
  const todayEntry = useWorkStore((state) => state.entries[dateKey]);
  const settings = useWorkStore((state) => state.settings);

  useEffect(() => {
    void configureNotificationSystem();
  }, []);

  useEffect(() => {
    void syncWorkNotifications({
      events: todayEntry?.events ?? [],
      settings
    });
  }, [settings, todayEntry?.events]);

  return null;
}
