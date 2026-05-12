import { NavigationContainer } from "@react-navigation/native";
import { AppLayout } from "./src/components/templates/AppLayout";
import { AppNavigator } from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AppLayout>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AppLayout>
  );
}
