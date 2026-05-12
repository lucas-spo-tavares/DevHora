import { StyleSheet, Text } from "react-native";
import { EventRow } from "../molecules/EventRow";
import { Panel } from "./Panel";
import { colors } from "../../theme/colors";
import { PunchEvent } from "../../types/app";

type TodayEventsPanelProps = {
  events: PunchEvent[];
};

export function TodayEventsPanel({ events }: TodayEventsPanelProps) {
  return (
    <Panel title="Pontos de hoje">
      {events.length ? (
        events.map((event) => <EventRow event={event} key={event.id} />)
      ) : (
        <Text style={styles.empty}>Nenhum ponto marcado ainda.</Text>
      )}
    </Panel>
  );
}

const styles = StyleSheet.create({
  empty: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  }
});

