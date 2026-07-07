import { Coffee } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MetricCard } from "../components/molecules/MetricCard";
import { StatusPanel } from "../components/molecules/StatusPanel";
import { PunchAction } from "../components/organisms/PunchAction";
import { SummaryGrid } from "../components/organisms/SummaryGrid";
import { TodayEventsPanel } from "../components/organisms/TodayEventsPanel";
import { ScreenTemplate } from "../components/templates/ScreenTemplate";
import { canStartExtraPause, createEmptyEntry, nextPunchType, periodTotals, summarizeDay } from "../lib/calculations";
import { formatLongDate, todayKey } from "../lib/dates";
import { formatSignedMinutes } from "../lib/time";
import { useWorkStore } from "../store/workStore";
import { colors } from "../theme/colors";

export function TodayScreen() {
  const addPunchEventToday = useWorkStore((state) => state.addPunchEventToday);
  const entries = useWorkStore((state) => state.entries);
  const settings = useWorkStore((state) => state.settings);
  const punchToday = useWorkStore((state) => state.punchToday);
  const data = { entries, settings };
  const date = todayKey();
  const entry = data.entries[date] ?? createEmptyEntry(date);
  const extraPauseEnabled = canStartExtraPause(entry.events);
  const nextAction = nextPunchType(entry.events);
  const todaySummary = summarizeDay(data, date);
  const totals = periodTotals(data);

  return (
    <ScreenTemplate eyebrow={formatLongDate(date)} title="Hoje">
      <StatusPanel events={entry.events} />
      <View style={styles.actionRow}>
        <View style={styles.actionStack}>
          <PunchAction nextAction={nextAction} onPunch={punchToday} />
          <Pressable
            accessibilityRole="button"
            disabled={!extraPauseEnabled}
            onPress={() => addPunchEventToday("pauseStart")}
            style={({ pressed }) => [
              styles.pauseButton,
              !extraPauseEnabled && styles.pauseButtonDisabled,
              pressed && extraPauseEnabled && styles.pauseButtonPressed
            ]}
          >
            <Coffee color={extraPauseEnabled ? colors.primaryText : colors.muted} size={22} />
            <Text style={[styles.pauseButtonText, !extraPauseEnabled && styles.pauseButtonTextDisabled]}>Pausa</Text>
          </Pressable>
        </View>
      </View>
      <SummaryGrid>
        <MetricCard
          label="Saldo do periodo"
          tone={totals.balanceMinutes >= 0 ? "positive" : "negative"}
          value={formatSignedMinutes(totals.balanceMinutes)}
        />
        <MetricCard
          label="Hoje"
          tone={todaySummary.balanceMinutes >= 0 ? "positive" : "negative"}
          value={formatSignedMinutes(todaySummary.balanceMinutes)}
        />
      </SummaryGrid>
      <TodayEventsPanel events={entry.events} />
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    alignItems: "center"
  },
  actionStack: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
    position: "relative",
    width: "100%"
  },
  pauseButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 16,
    bottom: 10,
    gap: 6,
    height: 60,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    width: 60
  },
  pauseButtonDisabled: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderWidth: 1
  },
  pauseButtonPressed: {
    opacity: 0.82
  },
  pauseButtonText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: "900"
  },
  pauseButtonTextDisabled: {
    color: colors.muted
  }
});
