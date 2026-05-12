import { DayProgressRow } from "../molecules/DayProgressRow";
import { Panel } from "./Panel";
import { DaySummary } from "../../types/app";

type ProgressDaysPanelProps = {
  summaries: DaySummary[];
};

export function ProgressDaysPanel({ summaries }: ProgressDaysPanelProps) {
  return (
    <Panel title="Dias do periodo">
      {summaries.map((day) => (
        <DayProgressRow day={day} key={day.date} />
      ))}
    </Panel>
  );
}

