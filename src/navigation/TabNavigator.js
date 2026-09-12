import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TimesScreen from '../screens/TimesScreen';
import QiblaScreen from '../screens/QiblaScreen';
import RemindersScreen from '../screens/RemindersScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ToolsScreen from '../screens/ToolsScreen';
import QuranNavigator from './QuranNavigator';
import { colors, radius, spacing, shadow, layout } from '../theme/colors';

const Tab = createBottomTabNavigator();

// Base Ionicons name per route. We append "-outline" when the tab is inactive,
// so the active tab reads as solid and heavier — a subtle but important cue.
const ICONS = {
  Times: 'moon',
  Quran: 'book',
  Calendar: 'calendar',
  Tools: 'sparkles',
  Qibla: 'compass',
  Reminders: 'notifications',
  Settings: 'grid',
};

function TabIcon({ routeName, focused }) {
  const base = ICONS[routeName];

  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons
        name={focused ? base : `${base}-outline`}
        size={22}
        color={focused ? colors.textOnPrimary : colors.textMuted}
      />
    </View>
  );
}

export default function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBar, { bottom: insets.bottom + spacing.md }],
        tabBarItemStyle: styles.tabItem,
        tabBarIcon: ({ focused }) => <TabIcon routeName={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Times" component={TimesScreen} />
      <Tab.Screen name="Quran" component={QuranNavigator} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Tools" component={ToolsScreen} />
      <Tab.Screen name="Qibla" component={QiblaScreen} />
      <Tab.Screen name="Reminders" component={RemindersScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    height: layout.tabBarHeight,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderTopWidth: 0,
    paddingHorizontal: spacing.sm,
    ...shadow.raised,
  },
  tabItem: {
    height: layout.tabBarHeight,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.primary,
  },
});