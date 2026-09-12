import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/WelcomeScreen';
import TabNavigator from './TabNavigator';
import ChangeLocationScreen from '../screens/ChangeLocationScreen';
import { useAppStore } from '../store/useAppStore';

const Stack = createNativeStackNavigator();

/**
 * The outermost navigator. Welcome sits above the tabs rather than inside them,
 * because it has no tab bar and you should not be able to swipe back to it.
 */
export default function RootNavigator() {
  const hasOnboarded = useAppStore((state) => state.hasOnboarded);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!hasOnboarded && <Stack.Screen name="Welcome" component={WelcomeScreen} />}
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen
        name="ChangeLocation"
        component={ChangeLocationScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}