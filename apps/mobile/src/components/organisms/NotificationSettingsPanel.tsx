import { TextButton } from "../atoms/TextButton";
import { Panel } from "./Panel";

type NotificationSettingsPanelProps = {
  onPress: () => void;
};

export function NotificationSettingsPanel({ onPress }: NotificationSettingsPanelProps) {
  return (
    <Panel title="Notificações">
      <TextButton label="Configurar notificações" onPress={onPress} variant="secondary" />
    </Panel>
  );
}
