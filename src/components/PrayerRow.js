import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing, shadow } from '../theme/colors';
import { type } from '../theme/typography';

export default function PrayerRow({ label, icon, timeLabel, isActive, isPast }) {
  const dimmed = isPast && !isActive;

  return (
    <View style={[styles.row, isActive && styles.rowActive]}>
      <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
        <Ionicons
          name={icon}
          size={17}
          color={isActive ? colors.textOnPrimary : colors.accentDark}
        />
      </View>

      <Text
        style={[styles.label, isActive && styles.textActive, dimmed && styles.textDimmed]}
        numberOfLines={1}
      >
        {label}
      </Text>

      <Text style={[styles.time, isActive && styles.textActive, dimmed && styles.textDimmed]}>
        {timeLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  rowActive: {
    backgroundColor: colors.primary,
    ...shadow.raised,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.primaryDark,
  },
  label: {
    ...type.h3,
    flex: 1,
  },
  time: {
    ...type.timeValue,
  },
  textActive: {
    color: colors.textOnPrimary,
  },
  textDimmed: {
    color: colors.textFaint,
  },
});