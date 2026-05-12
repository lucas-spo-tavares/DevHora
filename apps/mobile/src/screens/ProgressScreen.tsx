import { MetricCard } from "../components/molecules/MetricCard";
import { PeriodActions } from "../components/organisms/PeriodActions";
import { ProgressDaysPanel } from "../components/organisms/ProgressDaysPanel";
import { SummaryGrid } from "../components/organisms/SummaryGrid";
import { ScreenTemplate } from "../components/templates/ScreenTemplate";
import { periodTotals, summarizePeriod } from "../lib/calculations";
import { formatDateLabel } from "../lib/dates";
import { formatMinutes, formatSignedMinutes } from "../lib/time";
import { useWorkStore } from "../store/workStore";

export function ProgressScreen() {
  const entries = useWorkStore((state) => state.entries);
  const settings = useWorkStore((state) => state.settings);
  const startNewPeriod = useWorkStore((state) => state.startNewPeriod);
  const data = { entries, settings };
  const totals = periodTotals(data);
  const summaries = summarizePeriod(data).reverse();

  return (
    <ScreenTemplate eyebrow={`Desde ${formatDateLabel(data.settings.periodStart)}`} title="Progresso">
      <SummaryGrid>
        <MetricCard label="Feito" value={formatMinutes(totals.workedMinutes)} />
        <MetricCard label="Previsto" value={formatMinutes(totals.expectedMinutes)} />
        <MetricCard
          label="Banco"
          tone={totals.balanceMinutes >= 0 ? "positive" : "negative"}
          value={formatSignedMinutes(totals.balanceMinutes)}
        />
        <MetricCard label="Pendencias" tone={totals.missingDays ? "negative" : "neutral"} value={`${totals.missingDays}`} />
      </SummaryGrid>
      <PeriodActions onStartNewPeriod={startNewPeriod} />
      <ProgressDaysPanel summaries={summaries} />
    </ScreenTemplate>
  );
}
