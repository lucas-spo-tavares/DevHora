import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { hasManualAdjustmentLeaveHandler, runManualAdjustmentLeaveHandler } from "./manualAdjustmentLeaveGuard";
import { BarChart3, Calendar, PencilLine, Settings } from "lucide-react-native";
import { ManualAdjustmentScreen } from "../screens/ManualAdjustmentScreen";
import { ProgressScreen } from "../screens/ProgressScreen";
import { TodayScreen } from "../screens/TodayScreen";
import { SettingsStackNavigator } from "./SettingsStackNavigator";
import { colors } from "../theme/colors";

export type RootTabParamList = {
  Adjustment: {
    dateKey?: string;
  } | undefined;
  Progress: undefined;
  Settings: undefined;
  Today: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function createTabLeaveListener(targetTab: Exclude<keyof RootTabParamList, "Adjustment">) {
  return ({ navigation }: { navigation: any }) => ({
    tabPress: (event: { preventDefault: () => void }) => {
      const state = navigation.getState();
      const currentRoute = state.routes[state.index];

      if (currentRoute?.name !== "Adjustment" || !hasManualAdjustmentLeaveHandler()) {
        return;
      }

      event.preventDefault();
      runManualAdjustmentLeaveHandler(() => {
        navigation.navigate(targetTab);
      });
    }
  });
}

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
        listeners={createTabLeaveListener("Today")}
        name="Today"
        options={{
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
          title: "Hoje"
        }}
      >
        {() => <TodayScreen />}
      </Tab.Screen>
      <Tab.Screen
        listeners={createTabLeaveListener("Progress")}
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
        listeners={createTabLeaveListener("Settings")}
        name="Settings"
        options={{
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
          unmountOnBlur: true,
          title: "Config"
        }}
      >
        {() => <SettingsStackNavigator />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
