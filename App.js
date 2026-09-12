import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import RootNavigator from './src/navigation/RootNavigator';
import BrandMark from './src/components/BrandMark';
import { colors } from './src/theme/colors';
import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const navigationRef = useRef(null);
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
      return undefined;
    }

    try {
      const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const prayer = response.notification.request.content.data?.prayer;
        if (prayer) navigationRef.current?.navigate('Main', { screen: 'Times' });
      });
      return () => subscription.remove();
    } catch (error) {
      return undefined;
    }
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <BrandMark size={82} />
        <ActivityIndicator size="small" color={colors.primary} style={styles.loaderIndicator} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loaderIndicator: {
    marginTop: 16,
  },
});