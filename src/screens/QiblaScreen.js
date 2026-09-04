import { useMemo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

export default function QiblaScreen() {
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
  const ready = location && !error && heading !== null;

  return (
    <ScreenContainer style={styles.screen}>
      <Text style={type.label}>FIND YOUR DIRECTION</Text>
      <Text style={type.h1}>Direction to the Qibla</Text>

      {!location && (
        <View style={styles.card}>
          <Ionicons name="location-outline" size={26} color={colors.accentDark} />
          <Text style={[type.bodyMuted, styles.centered]}>
            Set your location on the Prayer Times tab first — the Qibla direction is calculated
            from where you are.
          </Text>
        </View>
      )}

      {location && error && (
        <View style={styles.card}>
          <Ionicons name="compass-outline" size={26} color={colors.accentDark} />
          <Text style={[type.bodyMuted, styles.centered]}>
            {error === 'permission-denied'
              ? 'The compass needs location permission to know which way is true north.'
              : 'This device does not seem to have a compass sensor.'}
          </Text>
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: layout.tabBarSpace,
  },
  card: {
    marginTop: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadow.card,
  },
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
});