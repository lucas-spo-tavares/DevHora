import { Alert } from "react-native";
import { RotateCcw } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { TextButton } from "../atoms/TextButton";

type PeriodActionsProps = {
  onStartNewPeriod: () => void;
};

export function PeriodActions({ onStartNewPeriod }: PeriodActionsProps) {
  function startNewPeriod() {
    Alert.alert("Iniciar novo periodo", "O historico continua salvo, mas o saldo passa a contar a partir de hoje.", [
      { text: "Cancelar", style: "cancel" },
      {
        onPress: onStartNewPeriod,
        text: "Iniciar"
      }
    ]);
  }

  return (
    <TextButton
      icon={<RotateCcw size={18} color={colors.dangerSoftText} />}
      label="Iniciar novo periodo"
      onPress={startNewPeriod}
      variant="warning"
    />
  );
}
