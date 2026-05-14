import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { MetricCard } from "../components/molecules/MetricCard";
import { PeriodActions } from "../components/organisms/PeriodActions";
import { ProgressDaysPanel } from "../components/organisms/ProgressDaysPanel";
import { SharePanel } from "../components/organisms/SharePanel";
import { SummaryGrid } from "../components/organisms/SummaryGrid";
import { ScreenTemplate } from "../components/templates/ScreenTemplate";
import { periodTotals, summarizeDay } from "../lib/calculations";
import { eachDateKey, toDateKey } from "../lib/dates";
import { formatMinutes, formatSignedMinutes } from "../lib/time";
import { AppData, DaySummary } from "../types/app";
import { colors } from "../theme/colors";
import { saveProgressCsvToDevice, shareProgressCsv } from "../services/backupService";
import { useWorkStore } from "../store/workStore";

export function ProgressScreen() {
  const entries = useWorkStore((state) => state.entries);
  const settings = useWorkStore((state) => state.settings);
  const startNewPeriod = useWorkStore((state) => state.startNewPeriod);
  const data = { entries, settings };
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  const monthDate = new Date(selectedYear, selectedMonth, 1);
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric"
  }).format(monthDate);
  const summaries = getMonthSummaries(data, selectedYear, selectedMonth).reverse();
  const totals = periodTotalsFromSummaries(summaries);
  const panelTitle = `Dias de ${monthLabel}`;

  async function handleShareCsv() {
    try {
      const uri = await shareProgressCsv(data, summaries);

      if (uri) {
        Alert.alert("CSV pronto", uri);
      }
    } catch {
      Alert.alert("Compartilhar CSV", "Nao consegui gerar o CSV neste aparelho.");
    }
  }

  async function handleSaveCsv() {
    try {
      const uri = await saveProgressCsvToDevice(data, summaries);

      if (uri) {
        Alert.alert("CSV salvo", uri);
      }
    } catch {
      Alert.alert("Salvar CSV", "Nao consegui salvar o arquivo neste aparelho.");
    }
  }

  function shiftMonth(delta: number) {
    const next = new Date(selectedYear, selectedMonth + delta, 1);
    setSelectedMonth(next.getMonth());
    setSelectedYear(next.getFullYear());
  }

  return (
    <ScreenTemplate eyebrow={monthLabel} title="Progresso">
      <View style={styles.filterRow}>
        <Pressable accessibilityLabel="Mês anterior" onPress={() => shiftMonth(-1)} style={styles.filterButton}>
          <ChevronLeft color={colors.primary} size={18} />
        </Pressable>
        <View style={styles.filterCenter}>
          <Text style={styles.filterLabel}>Mês filtrado</Text>
          <Text style={styles.filterValue}>{monthLabel}</Text>
        </View>
        <Pressable accessibilityLabel="Próximo mês" onPress={() => shiftMonth(1)} style={styles.filterButton}>
          <ChevronRight color={colors.primary} size={18} />
        </Pressable>
      </View>
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
      <SharePanel onSaveCsv={handleSaveCsv} onShareCsv={handleShareCsv} />
      <PeriodActions onStartNewPeriod={startNewPeriod} />
      <ProgressDaysPanel summaries={summaries} title={panelTitle} />
    </ScreenTemplate>
  );
}

function getMonthSummaries(data: AppData, year: number, month: number): DaySummary[] {
  const startKey = toDateKey(new Date(year, month, 1));
  const endKey = toDateKey(new Date(year, month + 1, 0));

  return eachDateKey(startKey, endKey).map((dateKey) => summarizeDay(data, dateKey));
}

function periodTotalsFromSummaries(summaries: DaySummary[]) {
  return summaries.reduce(
    (totals, day) => ({
      balanceMinutes: totals.balanceMinutes + day.balanceMinutes,
      expectedMinutes: totals.expectedMinutes + day.expectedMinutes,
      missingDays: totals.missingDays + (day.isMissing ? 1 : 0),
      workedMinutes: totals.workedMinutes + day.workedMinutes + day.adjustmentMinutes
    }),
    {
      balanceMinutes: 0,
      expectedMinutes: 0,
      missingDays: 0,
      workedMinutes: 0
    }
  );
}

const styles = StyleSheet.create({
  filterButton: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  filterCenter: {
    alignItems: "center",
    flex: 1,
    gap: 2
  },
  filterLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  filterRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  filterValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  }
});
