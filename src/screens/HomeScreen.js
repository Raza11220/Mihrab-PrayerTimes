import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import { useAppStore } from '../store/useAppStore';
import { colors, radius, spacing, shadow, layout } from '../theme/colors';
import { type, fonts } from '../theme/typography';
import { normalizeTimings, PRAYERS, findCurrentAndNext } from '../utils/prayers';
import { formatTime, formatCountdown } from '../utils/time';

const FEATURES = [
  {
    key: 'Times',
    label: 'Prayer Times',
    icon: 'mosque-outline',
    color: colors.primary,
    description: 'Your daily schedule',
    badge: 'live',
  },
  {
    key: 'Quran',
    label: 'Quran',
    icon: 'book-outline',
    color: colors.accentDark,
    description: 'Read & reflect',
  },
  {
    key: 'Qibla',
    label: 'Qibla',
    icon: 'compass-outline',
    color: colors.accent,
    description: 'Direction finder',
    badge: 'guide',
  },
  {
    key: 'Calendar',
    label: 'Calendar',
    icon: 'calendar-outline',
    color: colors.accentDark,
    description: 'Monthly plan',
  },
  {
    key: 'Tools',
    label: 'Tools',
    icon: 'build-outline',
    color: colors.primaryDark,
    description: 'Ayah, Hadith, Dua',
  },
  {
    key: 'Reminders',
    label: 'Reminders',
    icon: 'notifications-outline',
    color: colors.accent,
    description: 'Five daily prayers',
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

export default function HomeScreen({ navigation }) {
  const location = useAppStore((state) => state.location);
  const method = useAppStore((state) => state.method);
  const school = useAppStore((state) => state.school);
  const todayTimings = useAppStore((state) => state.todayTimings);
  const [currentPrayer, setCurrentPrayer] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (todayTimings?.timings) {
        const entries = normalizeTimings(todayTimings, new Date());
        const { current, next } = findCurrentAndNext(entries, new Date());
        setCurrentPrayer(current);
        setNextPrayer(next);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [todayTimings]);

  const locationLabel = location
    ? [location.city, location.country].filter(Boolean).join(', ')
    : 'Set your location';

  const methodLabel = PRAYERS.find((p) => p.key === currentPrayer?.key)?.label ?? '--';

  const handleFeaturePress = (feature) => {
    if (feature.key === 'Times') {
      navigation.navigate('Times');
    } else if (feature.key === 'Quran') {
      navigation.navigate('QuranHome');
    } else if (feature.key === 'Qibla') {
      navigation.navigate('Qibla');
    } else if (feature.key === 'Calendar') {
      navigation.navigate('Calendar');
    } else if (feature.key === 'Tools') {
      navigation.navigate('Tools');
    } else if (feature.key === 'Reminders') {
      navigation.navigate('Reminders');
    }
  };

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={type.label}>WELCOME BACK</Text>
            <Text style={styles.greeting}>{getGreeting()}</Text>
          </View>
          <View style={styles.locationChip}>
            <Ionicons name="location-outline" size={13} color={colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationLabel}
            </Text>
          </View>
        </View>

        {/* Current Prayer Banner */}
        {currentPrayer && nextPrayer && (
          <Pressable
            style={styles.prayerBanner}
            onPress={() => navigation.navigate('Times')}
            hitSlop={4}
          >
            <View style={styles.prayerBannerText}>
              <Text style={type.label}>NEXT PRAYER</Text>
              <Text style={styles.prayerName}>{nextPrayer.label}</Text>
            </View>
            <View style={styles.prayerTimer}>
              <Text style={styles.timerValue}>
                {formatCountdown(nextPrayer.date.getTime() - Date.now())}
              </Text>
              <Text style={styles.timerLabel}>remaining</Text>
            </View>
          </Pressable>
        )}

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={type.label}>QUICK ACCESS</Text>
        </View>

        <View style={styles.grid}>
          {FEATURES.map((feature) => (
            <Pressable
              key={feature.key}
              style={({ pressed }) => [styles.featureCard, pressed && styles.featureCardPressed]}
              onPress={() => handleFeaturePress(feature)}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: feature.color + '18' }]}
              >
                <Ionicons name={feature.icon} size={22} color={feature.color} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureLabel} numberOfLines={1}>
                  {feature.label}
                </Text>
                <Text style={styles.featureDesc} numberOfLines={1}>
                  {feature.description}
                </Text>
              </View>
              {feature.badge && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: feature.color },
                  ]}
                >
                  <Text style={styles.badgeText}>{feature.badge}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* Prayer Schedule Mini */}
        <View style={styles.sectionHeader}>
          <Text style={type.label}>TODAY'S TIMINGS</Text>
        </View>

        {todayTimings?.timings ? (
          <View style={styles.timingCard}>
            {PRAYERS.slice(0, 5).map((prayer, index) => {
              const time = todayTimings.timings[prayer.key];
              const isActive = currentPrayer?.key === prayer.key;
              return (
                <Pressable
                  key={prayer.key}
                  style={[styles.timingRow, isActive && styles.timingRowActive]}
                  onPress={() => navigation.navigate('Times')}
                  hitSlop={4}
                >
                  <View style={[styles.timingDot, isActive && styles.timingDotActive]} />
                  <Text style={[styles.timingLabel, isActive && styles.timingLabelActive]}>
                    {prayer.label}
                  </Text>
                  <Text style={[styles.timingTime, isActive && styles.timingTimeActive]}>
                    {time ?? '--:--'}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={15}
                    color={isActive ? colors.textOnPrimary : colors.textFaint}
                  />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Pressable
            style={styles.timingCard}
            onPress={() => navigation.navigate('Times')}
          >
            <View style={styles.timingEmpty}>
              <Ionicons name="time-outline" size={28} color={colors.textFaint} />
              <Text style={[type.bodyMuted, styles.timingEmptyText]}>
                Tap to view today's prayer times
              </Text>
            </View>
          </Pressable>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: layout.tabBarSpace },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  greeting: {
    ...fonts.bold !== undefined ? { fontFamily: fonts.bold, fontSize: 28, lineHeight: 38, color: colors.text } : { fontSize: 28, fontWeight: 'bold', color: colors.text },
    marginTop: 2,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    maxWidth: '55%',
  },
  locationText: {
    ...type.caption,
    color: colors.primaryDark,
    fontFamily: fonts.medium,
  },
  prayerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    ...shadow.raised,
  },
  prayerBannerText: { gap: spacing.xs },
  prayerName: {
    ...fonts.semiBold !== undefined ? { fontFamily: fonts.semiBold, fontSize: 22, color: colors.textOnPrimary } : { fontSize: 22, fontWeight: '600', color: colors.textOnPrimary },
  },
  prayerTimer: { alignItems: 'flex-end' },
  timerValue: {
    ...fonts.bold !== undefined ? { fontFamily: fonts.bold, fontSize: 32, lineHeight: 40, color: colors.textOnPrimary, fontVariant: ['tabular-nums'] } : { fontSize: 32, fontWeight: 'bold', color: colors.textOnPrimary, fontVariant: ['tabular-nums'] },
  },
  timerLabel: {
    ...type.caption,
    color: colors.primaryLight,
  },
  sectionHeader: { marginTop: spacing.xxl },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  featureCard: {
    width: ((Dimensions.get('window').width - spacing.xxl * 2 - spacing.sm) / 2),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    ...shadow.card,
  },
  featureCardPressed: { opacity: 0.65 },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureLabel: {
    ...fonts.semiBold !== undefined ? { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text } : { fontSize: 14, fontWeight: '600', color: colors.text },
  },
  featureDesc: {
    ...type.caption,
    color: colors.textFaint,
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: fonts.medium,
    color: colors.textOnPrimary,
    textTransform: 'uppercase',
  },
  timingCard: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    ...shadow.card,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  timingRowActive: {
    backgroundColor: colors.primary,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderBottomWidth: 0,
  },
  timingDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.textFaint,
  },
  timingDotActive: {
    backgroundColor: colors.textOnPrimary,
  },
  timingLabel: {
    ...type.body,
    flex: 1,
    color: colors.text,
  },
  timingLabelActive: {
    color: colors.textOnPrimary,
  },
  timingTime: {
    ...type.timeValue,
    color: colors.text,
  },
  timingTimeActive: {
    color: colors.textOnPrimary,
  },
  timingEmpty: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  timingEmptyText: { textAlign: 'center' },
});
