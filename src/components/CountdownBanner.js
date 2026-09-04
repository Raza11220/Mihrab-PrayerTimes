import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing, shadow } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function CountdownBanner({ label, icon, timeLabel, countdown, isTomorrow }) {
  return (
    <View style={styles.banner}>
      <Ionicons name={icon} size={120} color={colors.primaryDark} style={styles.watermark} />

      <Text style={styles.eyebrow}>NEXT PRAYER</Text>

      <View style={styles.titleRow}>
        <Text style={styles.name}>{label}</Text>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{timeLabel}</Text>
        </View>
      </View>

      <Text style={styles.countdown}>{countdown}</Text>
      <Text style={styles.footnote}>{isTomorrow ? 'remaining until tomorrow' : 'remaining'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    overflow: 'hidden', // keeps the oversized watermark icon inside the card
    ...shadow.raised,
  },
  watermark: {
    position: 'absolute',
    right: -18,
    bottom: -26,
    opacity: 0.28,
  },
  eyebrow: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.primaryLight,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.textOnPrimary,
  },
  chip: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textOnPrimary,
  },
  countdown: {
    fontFamily: fonts.bold,
    fontSize: 42,
    lineHeight: 50,
    letterSpacing: 1,
    color: colors.textOnPrimary,
    marginTop: spacing.md,
    // Digits have different widths in Poppins, so the text jiggles as it ticks.
    // This forces every digit to occupy the same box.
    fontVariant: ['tabular-nums'],
  },
  footnote: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.primaryLight,
  },
});