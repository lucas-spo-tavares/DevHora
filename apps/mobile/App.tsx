import { NavigationContainer } from "@react-navigation/native";
import { AppLayout } from "./src/components/templates/AppLayout";
import { NotificationSyncBridge } from "./src/components/organisms/NotificationSyncBridge";
import { AppNavigator } from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AppLayout>
      <NavigationContainer>
        <NotificationSyncBridge />
        <AppNavigator />
      </NavigationContainer>
    </AppLayout>
  );
}
