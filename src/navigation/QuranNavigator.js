import { createNativeStackNavigator } from '@react-navigation/native-stack';

import QuranScreen from '../screens/QuranScreen';
import QuranReaderScreen from '../screens/QuranReaderScreen';
import QuranSearchScreen from '../screens/QuranSearchScreen';
import JuzDirectoryScreen from '../screens/JuzDirectoryScreen';
import QuranBookmarksScreen from '../screens/QuranBookmarksScreen';

const Stack = createNativeStackNavigator();

export default function QuranNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="QuranHome" component={QuranScreen} />
      <Stack.Screen name="QuranReader" component={QuranReaderScreen} />
      <Stack.Screen name="QuranSearch" component={QuranSearchScreen} />
      <Stack.Screen name="JuzDirectory" component={JuzDirectoryScreen} />
      <Stack.Screen name="Bookmarks" component={QuranBookmarksScreen} />
    </Stack.Navigator>
  );
}