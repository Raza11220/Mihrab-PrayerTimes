import * as Location from 'expo-location';
import { Platform } from 'react-native';

function getTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (error) {
    return 'UTC';
  }
}

/**
 * Turn coordinates into a human-readable place name.
 * Never throws — a missing city name should not break the screen.
 */
async function describeCoords(latitude, longitude, fallbackName = '') {
  try {
    const results = Platform.OS === 'web'
      ? []
      : await Location.reverseGeocodeAsync({ latitude, longitude });
    const place = results[0];

    if (place) {
      return {
        city: place.city || place.subregion || place.region || fallbackName || 'Unknown location',
        country: place.country || '',
      };
    }
  } catch (error) {
    // Fall through to the network reverse geocoder.
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${latitude}&lon=${longitude}`
    );
    const payload = await response.json();
    const address = payload.address || {};
    return {
      city: address.city || address.town || address.village || address.municipality || fallbackName || 'Unknown location',
      country: address.country || '',
    };
  } catch (error) {
    return { city: fallbackName || 'Unknown location', country: '' };
  }
}

/**
 * Ask for permission and read the device's GPS position.
 * Returns a result object instead of throwing, so the UI can show the right
 * message for each failure without a try/catch in every component.
 */
export async function getDeviceLocation() {
  if (Platform.OS === 'web') {
    return getBrowserLocation();
  }

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
      location: { latitude, longitude, ...place, source: 'gps', timezone: getTimezone() },
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
    const results = Platform.OS === 'web' ? [] : await Location.geocodeAsync(trimmed);

    if (results.length) {
      const { latitude, longitude } = results[0];
      const place = await describeCoords(latitude, longitude, trimmed);
      return { ok: true, location: { latitude, longitude, ...place, source: 'manual', timezone: getTimezone() } };
    }
  } catch (error) {
    // Fall through when the platform geocoder is unavailable.
  }

  try {
    const location = await searchWithOpenStreetMap(trimmed);
    return location ? { ok: true, location } : { ok: false, reason: 'not-found' };
  } catch (error) {
    return { ok: false, reason: 'failed', error };
  }
}

async function searchWithOpenStreetMap(query) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`
  );
  const results = await response.json();
  const match = results[0];

  if (!match) return null;

  const address = match.address || {};
  return {
    latitude: Number(match.lat),
    longitude: Number(match.lon),
    city: address.city || address.town || address.village || address.municipality || query,
    country: address.country || '',
    source: 'manual',
    timezone: getTimezone(),
  };
}

function getBrowserLocation() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve({ ok: false, reason: 'unavailable' });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const place = await describeCoords(coords.latitude, coords.longitude);
        resolve({
          ok: true,
          location: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            ...place,
            source: 'gps',
            timezone: getTimezone(),
          },
        });
      },
      (error) => {
        const reason = error.code === 1
          ? 'permission-denied'
          : error.code === 2
            ? 'unavailable'
            : 'timeout';
        resolve({ ok: false, reason, error });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    );
  });
}