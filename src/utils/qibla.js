// The Kaaba, Masjid al-Haram, Makkah.
const KAABA = { latitude: 21.4225, longitude: 39.8262 };

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => (degrees * Math.PI) / 180;
const toDegrees = (radians) => (radians * 180) / Math.PI;

/** Wraps any angle into the 0–359.99 range. */
function normalizeBearing(degrees) {
  return (degrees + 360) % 360;
}

/**
 * Initial great-circle bearing from a coordinate to the Kaaba, in degrees
 * clockwise from true north. This is the direction you physically face.
 */
export function qiblaBearing(latitude, longitude) {
  const lat1 = toRadians(latitude);
  const lat2 = toRadians(KAABA.latitude);
  const deltaLon = toRadians(KAABA.longitude - longitude);

  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

  return normalizeBearing(toDegrees(Math.atan2(y, x)));
}

/** Great-circle distance to the Kaaba in kilometres (haversine formula). */
export function distanceToKaabaKm(latitude, longitude) {
  const lat1 = toRadians(latitude);
  const lat2 = toRadians(KAABA.latitude);
  const deltaLat = toRadians(KAABA.latitude - latitude);
  const deltaLon = toRadians(KAABA.longitude - longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const CARDINALS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                   'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

/** Turns 293° into "WNW" — 16 sectors of 22.5° each. */
export function cardinalFromBearing(bearing) {
  const index = Math.round(normalizeBearing(bearing) / 22.5) % 16;
  return CARDINALS[index];
}

/**
 * Signed shortest turn from one bearing to another, in -180..180 degrees.
 * Negative means turn left, positive means turn right. Naively subtracting
 * would say "go 350° right" when the answer is "go 10° left".
 */
export function shortestAngleDelta(from, to) {
  return ((to - from + 540) % 360) - 180;
}