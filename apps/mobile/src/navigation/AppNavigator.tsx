import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BarChart3, Calendar, PencilLine, Settings } from "lucide-react-native";
import { ManualAdjustmentScreen } from "../screens/ManualAdjustmentScreen";
import { ProgressScreen } from "../screens/ProgressScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { TodayScreen } from "../screens/TodayScreen";
import { colors } from "../theme/colors";

export type RootTabParamList = {
  Adjustment: undefined;
  Progress: undefined;
  Settings: undefined;
  Today: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function AppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Today"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "800"
        },
        tabBarStyle: {
          backgroundColor: colors.panel,
          borderTopColor: colors.border,
          minHeight: 62,
          paddingBottom: 10,
          paddingTop: 8
        }
      }}
    >
      <Tab.Screen
        name="Today"
        options={{
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
          title: "Hoje"
        }}
      >
        {() => <TodayScreen />}
      </Tab.Screen>
      <Tab.Screen
        name="Progress"
        options={{
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
          title: "Progresso"
        }}
      >
        {() => <ProgressScreen />}
      </Tab.Screen>
      <Tab.Screen
        name="Adjustment"
        options={{
          tabBarIcon: ({ color, size }) => <PencilLine color={color} size={size} />,
          title: "Ajuste"
        }}
      >
        {() => <ManualAdjustmentScreen />}
      </Tab.Screen>
      <Tab.Screen
        name="Settings"
        options={{
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
          title: "Config"
        }}
      >
        {() => <SettingsScreen />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
