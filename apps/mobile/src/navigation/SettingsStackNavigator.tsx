import { createStackNavigator } from "@react-navigation/stack";
import { NotificationSettingsScreen } from "../screens/NotificationSettingsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

export type SettingsStackParamList = {
  Notifications: undefined;
  SettingsHome: undefined;
};

const Stack = createStackNavigator<SettingsStackParamList>();

export function SettingsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={SettingsScreen} name="SettingsHome" />
      <Stack.Screen component={NotificationSettingsScreen} name="Notifications" />
    </Stack.Navigator>
  );
}
