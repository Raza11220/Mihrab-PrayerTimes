import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import { colors, radius, spacing, shadow, layout } from '../theme/colors';
import { type } from '../theme/typography';

export default function AboutScreen({ navigation }) {
  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <Text style={type.h1}>Mihrab</Text>
          <Text style={type.caption}>Version 1.0.0</Text>
        </View>

        <Text style={type.bodyMuted}>
          A calm, privacy-first Islamic companion for prayer, Quran reading,
          Qibla direction and daily reflection.
        </Text>

        <View style={styles.card}>
          <Text style={type.h3}>Built With</Text>
          <Text style={type.body}>Expo SDK 57 · React Native 0.86 · React 19</Text>
          <Text style={type.body}>React Navigation · Zustand · Poppins</Text>
        </View>

        <View style={styles.card}>
          <Text style={type.h3}>Data Sources</Text>
          <Text style={type.body}>Aladhan API — Prayer times</Text>
          <Text style={type.body}>Al Quran Cloud — Quran text & translations</Text>
          <Text style={type.body}>Islamic Network — Quran recitation audio</Text>
          <Text style={type.body}>OpenStreetMap — City search & geocoding</Text>
        </View>

        <View style={styles.card}>
          <Text style={type.h3}>License</Text>
          <Text style={type.body}>MIT License — Open source, free to use.</Text>
        </View>

        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={colors.primary} />
          <Text style={[type.body, { color: colors.primary }]}>Back to Settings</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: layout.tabBarSpace },
  brandRow: { alignItems: 'center', marginTop: spacing.xxl, marginBottom: spacing.lg },
  card: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    ...shadow.card,
    gap: spacing.xs,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
    paddingVertical: spacing.md,
  },
});
