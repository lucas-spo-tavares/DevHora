import { DayProgressRow } from "../molecules/DayProgressRow";
import { Panel } from "./Panel";
import { DaySummary } from "../../types/app";

type ProgressDaysPanelProps = {
  summaries: DaySummary[];
  title?: string;
};

export function ProgressDaysPanel({ summaries, title = "Dias do periodo" }: ProgressDaysPanelProps) {
  return (
    <Panel title={title}>
      {summaries.map((day) => (
        <DayProgressRow day={day} key={day.date} />
      ))}
    </Panel>
  );
}
