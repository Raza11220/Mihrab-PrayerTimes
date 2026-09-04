import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../../components/ScreenContainer';
import MosqueIllustration from '../../components/MosqueIllustration';
import { colors, radius, spacing, shadow } from '../../theme/colors';
import { type, fonts } from '../../theme/typography';

export default function WelcomeScreen({ navigation }) {
  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}>
          <Ionicons name="moon" size={16} color={colors.textOnPrimary} />
        </View>
        <Text style={styles.brandName}>Mihrab</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.headingLight}>Stay Closer to</Text>
        <Text style={styles.headingBold}>Your Faith</Text>
        <Text style={styles.subtitle}>
          Accurate prayer times, a reliable Qibla compass, and gentle reminders — wherever you are.
        </Text>
      </View>

      <View style={styles.illustration}>
        <MosqueIllustration />
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => navigation.replace('Main')}
      >
        <Text style={type.button}>Get Started</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.text,
  },
  hero: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  headingLight: {
    fontFamily: fonts.regular,
    fontSize: 29,
    lineHeight: 40,
    color: colors.text,
  },
  headingBold: {
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 42,
    color: colors.text,
  },
  subtitle: {
    ...type.bodyMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  illustration: {
    alignItems: 'center',
    flexShrink: 1,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    ...shadow.raised,
  },
  buttonPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
});