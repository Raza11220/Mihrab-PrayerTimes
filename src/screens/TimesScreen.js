import { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import LocationChip from '../components/LocationChip';
import PrayerRow from '../components/PrayerRow';
import CountdownBanner from '../components/CountdownBanner';
import { useNow } from '../hooks/useNow';
import { useAppStore } from '../store/useAppStore';
import { normalizeTimings, findCurrentAndNext, resolveNextPrayer } from '../utils/prayers';
import { formatTime, formatCountdown } from '../utils/time';
import { colors, radius, spacing, shadow, layout } from '../theme/colors';
import { type } from '../theme/typography';

const LOCATION_MESSAGES = {
  'permission-denied':
    'Location permission was denied. Allow it to get times for where you are, or choose your city manually.',
  'services-off':
    'Location services are turned off on this device. Turn them on, or choose your city manually.',
  failed: 'We could not read your location. Please try again, or choose your city manually.',
};

const TIMINGS_MESSAGES = {
  network: 'No internet connection. Prayer times need to be downloaded at least once.',
  timeout: 'The request took too long. Check your connection and try again.',
  'http-error': 'The prayer times service returned an error. Please try again.',
  'bad-payload': 'The prayer times service sent something unexpected. Please try again.',
};

export default function TimesScreen({ navigation }) {
  const location = useAppStore((state) => state.location);
  const locationStatus = useAppStore((state) => state.locationStatus);
  const locationError = useAppStore((state) => state.locationError);
  const loadDeviceLocation = useAppStore((state) => state.loadDeviceLocation);

  const method = useAppStore((state) => state.method);
  const school = useAppStore((state) => state.school);
  const timeFormat = useAppStore((state) => state.timeFormat);
  const timingsRaw = useAppStore((state) => state.timingsRaw);
  const timingsStatus = useAppStore((state) => state.timingsStatus);
  const timingsError = useAppStore((state) => state.timingsError);
  const loadTimings = useAppStore((state) => state.loadTimings);

  // The app's single clock. Everything below reads "now" from here.
  const now = useNow();

  useEffect(() => {
    if (!location && locationStatus === 'idle') {
      loadDeviceLocation();
    }
  }, [location, locationStatus, loadDeviceLocation]);

  // Refetch whenever anything the times depend on changes. The store's cache
  // key means this is a no-op when nothing actually changed.
  useEffect(() => {
    if (location) {
      loadTimings();
    }
  }, [location, method, school, loadTimings]);

  // Rebuild Date objects from the raw payload. useMemo so we don't redo this
  // on every render — only when the payload actually changes.
  const entries = useMemo(() => normalizeTimings(timingsRaw), [timingsRaw]);

  // These two recompute every second because `now` is in their deps. That is
  // exactly what makes the highlight and the countdown move on their own.
  const { current } = useMemo(() => findCurrentAndNext(entries, now), [entries, now]);
  const next = useMemo(() => resolveNextPrayer(entries, now), [entries, now]);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    []
  );

  const chipLabel = location
    ? [location.city, location.country].filter(Boolean).join(', ')
    : 'Set your location';

  const findingLocation = locationStatus === 'loading';
  const locationFailed = !location && locationStatus === 'error';
  const loadingTimes = timingsStatus === 'loading' && entries.length === 0;
  const timesFailed = timingsStatus === 'error' && entries.length === 0;

  return (
    <ScreenContainer padded={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={timingsStatus === 'loading' && entries.length > 0}
            onRefresh={() => loadTimings({ force: true })}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={type.label}>{today.toUpperCase()}</Text>
            <Text style={type.h1}>Prayer Times</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            onPress={() => loadTimings({ force: true })}
            hitSlop={8}
          >
            <Ionicons name="refresh" size={18} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.chipWrap}>
          <LocationChip label={chipLabel} onPress={() => navigation.navigate('ChangeLocation')} />
        </View>

        {findingLocation && (
          <View style={styles.card}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[type.bodyMuted, styles.centered]}>Finding your location…</Text>
          </View>
        )}

        {locationFailed && (
          <View style={styles.card}>
            <View style={styles.mark}>
              <Ionicons name="location-outline" size={22} color={colors.accentDark} />
            </View>
            <Text style={[type.h3, styles.centered]}>Location needed</Text>
            <Text style={[type.bodyMuted, styles.centered]}>
              {LOCATION_MESSAGES[locationError] ?? LOCATION_MESSAGES.failed}
            </Text>

            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
              onPress={loadDeviceLocation}
            >
              <Text style={type.button}>Try again</Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate('ChangeLocation')} hitSlop={8}>
              <Text style={styles.linkText}>Choose city manually</Text>
            </Pressable>
          </View>
        )}

        {loadingTimes && (
          <View style={styles.card}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[type.bodyMuted, styles.centered]}>Loading prayer times…</Text>
          </View>
        )}

        {timesFailed && (
          <View style={styles.card}>
            <View style={styles.mark}>
              <Ionicons name="cloud-offline-outline" size={22} color={colors.accentDark} />
            </View>
            <Text style={[type.h3, styles.centered]}>Could not load times</Text>
            <Text style={[type.bodyMuted, styles.centered]}>
              {TIMINGS_MESSAGES[timingsError] ?? TIMINGS_MESSAGES['http-error']}
            </Text>

            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
              onPress={() => loadTimings({ force: true })}
            >
              <Text style={type.button}>Try again</Text>
            </Pressable>
          </View>
        )}

        {next && (
          <View style={styles.bannerWrap}>
            <CountdownBanner
              label={next.label}
              icon={next.icon}
              timeLabel={formatTime(next.date, timeFormat)}
              countdown={formatCountdown(next.date - now)}
              isTomorrow={next.isTomorrow}
            />
          </View>
        )}

        {entries.length > 0 && (
          <View style={styles.listCard}>
            {entries.map((entry) => (
              <PrayerRow
                key={entry.key}
                label={entry.label}
                icon={entry.icon}
                timeLabel={formatTime(entry.date, timeFormat)}
                isActive={current?.key === entry.key}
                isPast={entry.date <= now}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: layout.tabBarSpace,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flexShrink: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  iconButtonPressed: {
    backgroundColor: colors.primaryLight,
  },
  chipWrap: {
    marginTop: spacing.lg,
  },
  bannerWrap: {
    marginTop: spacing.xl,
  },
  card: {
    marginTop: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    ...shadow.card,
  },
  listCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.sm,
    gap: spacing.xs,
    ...shadow.card,
  },
  centered: {
    textAlign: 'center',
  },
  mark: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  linkText: {
    ...type.label,
    color: colors.primary,
  },
});