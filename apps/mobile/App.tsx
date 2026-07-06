import { NavigationContainer } from "@react-navigation/native";
import { AppLayout } from "./src/components/templates/AppLayout";
import { useNotificationSync } from "./src/hooks/useNotificationSync";
import { AppNavigator } from "./src/navigation/AppNavigator";

export default function App() {
  useNotificationSync();

  return (
    <AppLayout>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AppLayout>
  );
}
