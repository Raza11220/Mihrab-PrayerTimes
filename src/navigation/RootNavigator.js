import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/WelcomeScreen';
import TabNavigator from './TabNavigator';
import ChangeLocationScreen from '../screens/ChangeLocationScreen';

const Stack = createNativeStackNavigator();

/**
 * The outermost navigator. Welcome sits above the tabs rather than inside them,
 * because it has no tab bar and you should not be able to swipe back to it.
 */
export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen
        name="ChangeLocation"
        component={ChangeLocationScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}