import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';

import { shortestAngleDelta } from '../utils/qibla';

/**
 * Live compass heading in degrees clockwise from true north.
 * Returns { heading, accuracy, error } — heading is null until the first
 * reading arrives, accuracy is 0 (none) to 3 (high).
 */
export function useHeading() {
  const [heading, setHeading] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscription = null;
    let cancelled = false;

    if (Platform.OS === 'web') {
        if (typeof window === 'undefined' || !window.DeviceOrientationEvent) {
          setError('unavailable');
          return;
        }

        let receivedReading = false;
        const handleOrientation = (event) => {
          if (cancelled) return;

          const value = typeof event.webkitCompassHeading === 'number'
            ? event.webkitCompassHeading
            : typeof event.alpha === 'number'
              ? (360 - event.alpha) % 360
              : null;

          if (value === null) return;

          receivedReading = true;
          setError(null);
          setHeading((previous) =>
            previous !== null && Math.abs(shortestAngleDelta(previous, value)) < 1
              ? previous
              : value
          );
          setAccuracy(3);
        };

        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        window.addEventListener('deviceorientation', handleOrientation, true);

        const timeout = setTimeout(() => {
          if (!receivedReading && !cancelled) setError('unavailable');
        }, 2500);

      return () => {
          clearTimeout(timeout);
          window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
          window.removeEventListener('deviceorientation', handleOrientation, true);
      };
    }

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('permission-denied');
        return;
      }

      try {
        const sub = await Location.watchHeadingAsync((reading) => {
          if (cancelled) return;

          // trueHeading is -1 when the device cannot correct for magnetic
          // declination. Fall back to the raw magnetic reading rather than
          // showing a negative number.
          const value = reading.trueHeading >= 0 ? reading.trueHeading : reading.magHeading;

          // The sensor fires ~15 times a second. Ignoring sub-degree jitter
          // means React can skip most of those renders: returning the same
          // value from a setter makes React bail out entirely.
          setHeading((previous) =>
            previous !== null && Math.abs(shortestAngleDelta(previous, value)) < 1
              ? previous
              : value
          );

          setAccuracy(reading.accuracy ?? null);
        });

        // The await above takes a moment. If the screen unmounted while we
        // were waiting, the cleanup already ran and never saw this handle —
        // so we have to tear it down ourselves.
        if (cancelled) {
          sub.remove();
        } else {
          subscription = sub;
        }
      } catch {
        setError('unavailable');
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return { heading, accuracy, error };
}