import * as Location from 'expo-location';

/**
 * Turn coordinates into a human-readable place name.
 * Never throws — a missing city name should not break the screen.
 */
async function describeCoords(latitude, longitude, fallbackName = '') {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    const place = results[0];

    if (!place) {
      return { city: fallbackName || 'Unknown location', country: '' };
    }

    return {
      // Different devices fill different fields, so we walk down a priority list.
      city: place.city || place.subregion || place.region || fallbackName || 'Unknown location',
      country: place.country || '',
    };
  } catch {
    return { city: fallbackName || 'Unknown location', country: '' };
  }
}

/**
 * Ask for permission and read the device's GPS position.
 * Returns a result object instead of throwing, so the UI can show the right
 * message for each failure without a try/catch in every component.
 */
export async function getDeviceLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      return { ok: false, reason: 'permission-denied' };
    }

    const servicesOn = await Location.hasServicesEnabledAsync();
    if (!servicesOn) {
      return { ok: false, reason: 'services-off' };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = position.coords;
    const place = await describeCoords(latitude, longitude);

    return {
      ok: true,
      location: { latitude, longitude, ...place, source: 'gps' },
    };
  } catch (error) {
    return { ok: false, reason: 'failed', error };
  }
}

/**
 * Turn a typed city name into coordinates — the fallback when GPS is denied.
 */
export async function searchCity(query) {
  const trimmed = query.trim();

  if (trimmed.length < 3) {
    return { ok: false, reason: 'too-short' };
  }

  try {
    const results = await Location.geocodeAsync(trimmed);

    if (!results.length) {
      return { ok: false, reason: 'not-found' };
    }

    const { latitude, longitude } = results[0];
    const place = await describeCoords(latitude, longitude, trimmed);

    return {
      ok: true,
      location: { latitude, longitude, ...place, source: 'manual' },
    };
  } catch (error) {
    return { ok: false, reason: 'failed', error };
  }
}