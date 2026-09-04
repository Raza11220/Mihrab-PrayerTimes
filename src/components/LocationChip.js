import { Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function LocationChip({ label, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
      onPress={onPress}
      hitSlop={8}
    >
      <Ionicons name="location-outline" size={15} color={colors.primary} />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Ionicons name="chevron-down" size={15} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.sm,
    maxWidth: '100%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
});