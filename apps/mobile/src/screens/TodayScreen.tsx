import { MetricCard } from "../components/molecules/MetricCard";
import { StatusPanel } from "../components/molecules/StatusPanel";
import { PunchAction } from "../components/organisms/PunchAction";
import { SummaryGrid } from "../components/organisms/SummaryGrid";
import { TodayEventsPanel } from "../components/organisms/TodayEventsPanel";
import { ScreenTemplate } from "../components/templates/ScreenTemplate";
import { createEmptyEntry, nextPunchType, periodTotals, summarizeDay } from "../lib/calculations";
import { formatLongDate, todayKey } from "../lib/dates";
import { formatSignedMinutes } from "../lib/time";
import { useWorkStore } from "../store/workStore";

export function TodayScreen() {
  const entries = useWorkStore((state) => state.entries);
  const settings = useWorkStore((state) => state.settings);
  const punchToday = useWorkStore((state) => state.punchToday);
  const data = { entries, settings };
  const date = todayKey();
  const entry = data.entries[date] ?? createEmptyEntry(date);
  const nextAction = nextPunchType(entry.events);
  const todaySummary = summarizeDay(data, date);
  const totals = periodTotals(data);

  return (
    <ScreenTemplate eyebrow={formatLongDate(date)} title="Hoje">
      <StatusPanel events={entry.events} />
      <PunchAction nextAction={nextAction} onPunch={punchToday} />
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
