import { DayProgressRow } from "../molecules/DayProgressRow";
import { Panel } from "./Panel";
import { DaySummary } from "../../types/app";

type ProgressDaysPanelProps = {
  summaries: DaySummary[];
  onDayPress?: (dateKey: string) => void;
  title?: string;
};

export function ProgressDaysPanel({ onDayPress, summaries, title = "Dias do periodo" }: ProgressDaysPanelProps) {
  return (
    <Panel title={title}>
      {summaries.map((day) => (
        <DayProgressRow day={day} key={day.date} onPress={onDayPress} />
      ))}
    </Panel>
  );
}
