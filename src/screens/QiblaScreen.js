import { useMemo } from 'react';
import { View, Text, ActivityIndicator, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import ScreenContainer from '../components/ScreenContainer';
import Compass from '../components/Compass';
import { useHeading } from '../hooks/useHeading';
import { useAppStore } from '../store/useAppStore';
import {
  qiblaBearing,
  distanceToKaabaKm,
  cardinalFromBearing,
  shortestAngleDelta,
} from '../utils/qibla';
import { colors, radius, spacing, shadow, layout } from '../theme/colors';
import { type } from '../theme/typography';

const ALIGNED_WITHIN_DEGREES = 5;

const HEADING_MESSAGES = {
  'permission-denied': 'Allow location permission to activate the live compass.',
  unavailable: 'Live compass is not available in this browser or on this device.',
};

export default function QiblaScreen({ navigation }) {
  const location = useAppStore((state) => state.location);
  const { heading, accuracy, error } = useHeading();

  const qibla = useMemo(
    () => (location ? qiblaBearing(location.latitude, location.longitude) : null),
    [location]
  );

  const distanceKm = useMemo(
    () => (location ? distanceToKaabaKm(location.latitude, location.longitude) : null),
    [location]
  );

  const delta = heading !== null && qibla !== null ? shortestAngleDelta(heading, qibla) : null;
  const aligned = delta !== null && Math.abs(delta) <= ALIGNED_WITHIN_DEGREES;
  const needsCalibration = accuracy !== null && accuracy < 2;
  const ready = Boolean(location && !error && heading !== null && qibla !== null);
  const locationLabel = location
    ? [location.city, location.country].filter(Boolean).join(', ')
    : 'Set your location';

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
      <Text style={type.label}>FIND YOUR DIRECTION</Text>
      <Text style={type.h1}>Direction to the Qibla</Text>

      <Pressable
        style={({ pressed }) => [styles.locationChip, pressed && styles.pressed]}
        onPress={() => navigation.navigate('ChangeLocation')}
      >
        <Ionicons name="location-outline" size={16} color={colors.primary} />
        <Text style={styles.locationText} numberOfLines={1}>{locationLabel}</Text>
        <Ionicons name="chevron-down" size={15} color={colors.textMuted} />
      </Pressable>

      {!location && (
        <View style={styles.card}>
          <Ionicons name="location-outline" size={26} color={colors.accentDark} />
          <Text style={[type.bodyMuted, styles.centered]}>
            Set your location on the Prayer Times tab first — the Qibla direction is calculated
            from where you are.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('ChangeLocation')}>
            <Text style={type.button}>Set location</Text>
          </Pressable>
        </View>
      )}

      {location && qibla !== null && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="navigate" size={20} color={colors.textOnPrimary} />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryLabel}>QIBLA FROM YOUR LOCATION</Text>
            <Text style={styles.summaryTitle}>{Math.round(qibla)}° {cardinalFromBearing(qibla)}</Text>
            <Text style={type.caption}>{Math.round(distanceKm).toLocaleString('en-US')} km to the Kaaba</Text>
          </View>
          <Ionicons name="cube-outline" size={28} color={colors.accentDark} />
        </View>
      )}

      {location && error && (
        <View style={styles.card}>
          <Ionicons name="compass-outline" size={26} color={colors.accentDark} />
          <Text style={[type.h3, styles.centered]}>Live compass unavailable</Text>
          <Text style={[type.bodyMuted, styles.centered]}>
            {HEADING_MESSAGES[error] ?? HEADING_MESSAGES.unavailable}
          </Text>
          <Text style={[type.caption, styles.centered]}>The calculated Qibla bearing remains accurate.</Text>
        </View>
      )}

      {location && !error && heading === null && (
        <View style={styles.card}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[type.bodyMuted, styles.centered]}>Waking up the compass…</Text>
        </View>
      )}

      {ready && (
        <>
          <View style={styles.dialWrap}>
            <Compass heading={heading} qibla={qibla} aligned={aligned} />
          </View>

          <Text style={[styles.instruction, aligned && styles.instructionAligned]}>
            {aligned
              ? 'You are facing the Qibla'
              : `Turn ${Math.abs(Math.round(delta))}° ${delta > 0 ? 'right' : 'left'}`}
          </Text>

          <Text style={[type.bodyMuted, styles.centered]}>
            {Math.round(qibla)}° {cardinalFromBearing(qibla)} from north ·{' '}
            {Math.round(distanceKm).toLocaleString('en-US')} km to Makkah
          </Text>

          {needsCalibration && (
            <View style={styles.notice}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.accentDark} />
              <Text style={styles.noticeText}>
                Compass accuracy is low. Move the phone in a figure-eight motion to calibrate, and
                keep it away from metal and magnets.
              </Text>
            </View>
          )}
        </>
      )}

      {location && qibla !== null && (
        <>
          <View style={styles.accuracyCard}>
            <View style={[styles.accuracyDot, accuracy !== null && accuracy >= 2 && styles.accuracyGood]} />
            <View style={styles.accuracyCopy}><Text style={styles.summaryLabel}>COMPASS ACCURACY</Text><Text style={type.body}>{accuracy === null ? 'Checking sensor...' : accuracy >= 2 ? 'Good accuracy' : 'Needs calibration'}</Text></View>
            <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
          </View>

          <View style={styles.routeCard}>
            <Text style={styles.summaryLabel}>ROUTE TO THE KAABA</Text>
            <View style={styles.routeMap}>
              <Svg width="100%" height="120" viewBox="0 0 320 120">
                <Path d="M28 88 C90 22 190 105 292 32" fill="none" stroke={colors.primaryLight} strokeWidth="3" strokeDasharray="7 7" />
                <Circle cx="28" cy="88" r="8" fill={colors.primary} />
                <Circle cx="292" cy="32" r="10" fill={colors.accent} />
                <Line x1="28" y1="88" x2="292" y2="32" stroke={colors.accentDark} strokeWidth="1.5" strokeDasharray="3 4" />
              </Svg>
              <View style={styles.routeStart}><Text style={styles.routeLabel}>{location.city || 'You'}</Text></View>
              <View style={styles.routeEnd}><Ionicons name="cube-outline" size={16} color={colors.accentDark} /><Text style={styles.routeLabel}>Makkah</Text></View>
            </View>
            <Text style={[type.caption, styles.centered]}>Follow {Math.round(qibla)}° {cardinalFromBearing(qibla)} for {Math.round(distanceKm).toLocaleString('en-US')} km</Text>
          </View>
        </>
      )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: layout.tabBarSpace },
  locationChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: spacing.sm, maxWidth: '100%', marginTop: spacing.lg, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.pill, backgroundColor: colors.primaryLight },
  locationText: { flexShrink: 1, fontFamily: 'Poppins_500Medium', fontSize: 14, color: colors.text },
  pressed: { opacity: 0.7 },
  card: {
    marginTop: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadow.card,
  },
  primaryButton: { marginTop: spacing.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.pill, backgroundColor: colors.primary },
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xl, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.card, ...shadow.card },
  summaryIcon: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  summaryCopy: { flex: 1 },
  summaryLabel: { ...type.label, color: colors.primary, fontSize: 10 },
  summaryTitle: { ...type.h2, marginTop: 2 },
  dialWrap: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  instruction: {
    ...type.h2,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  instructionAligned: {
    color: colors.primary,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xl,
    backgroundColor: colors.accentLight,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  noticeText: {
    ...type.caption,
    flex: 1,
  },
  centered: {
    textAlign: 'center',
  },
  accuracyCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xl, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.card, ...shadow.card },
  accuracyDot: { width: 12, height: 12, borderRadius: radius.pill, backgroundColor: colors.warning },
  accuracyGood: { backgroundColor: colors.success },
  accuracyCopy: { flex: 1 },
  routeCard: { marginTop: spacing.xl, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.card, ...shadow.card },
  routeMap: { height: 145, position: 'relative', marginTop: spacing.sm },
  routeStart: { position: 'absolute', left: 0, bottom: 18 },
  routeEnd: { position: 'absolute', right: 0, top: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  routeLabel: { ...type.caption, color: colors.textMuted },
});