import { apiTimeToDate } from './time';

/**
 * The rows we show, in order. `isFard` marks the five obligatory prayers —
 * Imsak and Sunrise are informational, so they get no reminder toggle later.
 *
 * The `key` must match the Aladhan field name exactly. This array is the only
 * place those names appear, so a rename in the API is a one-line fix here.
 */
export const PRAYERS = [
  { key: 'Imsak', label: 'Imsak', icon: 'cloudy-night-outline', isFard: false },
  { key: 'Fajr', label: 'Fajr', icon: 'cloudy-outline', isFard: true },
  { key: 'Sunrise', label: 'Sunrise', icon: 'sunny-outline', isFard: false },
  { key: 'Dhuhr', label: 'Dhuhr', icon: 'sunny', isFard: true },
  { key: 'Asr', label: 'Asr', icon: 'partly-sunny-outline', isFard: true },
  { key: 'Maghrib', label: 'Maghrib', icon: 'moon-outline', isFard: true },
  { key: 'Isha', label: 'Isha', icon: 'moon', isFard: true },
];

/**
 * Turn the API's `{ Fajr: "04:40", ... }` object into an ordered array of
 * entries with real Date objects, which is what the UI and countdown need.
 */
export function normalizeTimings(apiData, baseDate = new Date()) {
  const timings = apiData?.timings;
  if (!timings) return [];

  return PRAYERS
    .map((prayer) => ({
      ...prayer,
      raw: timings[prayer.key],
      date: apiTimeToDate(timings[prayer.key], baseDate),
    }))
    // Drop anything the API didn't send, rather than rendering "--:--" rows.
    .filter((entry) => entry.date !== null);
}
/**
 * Which prayer period we're in right now.
 * `current` is the most recent entry that has passed; `next` is the first
 * one still to come. After Isha, `next` is null — that's tomorrow's Fajr,
 * which we handle in the countdown.
 */
export function findCurrentAndNext(entries, now = new Date()) {
  let current = null;
  let next = null;

  for (const entry of entries) {
    if (entry.date <= now) {
      current = entry;
    } else if (!next) {
      next = entry;
    }
  }

  return { current, next };
}
/**
 * The next prayer to count down to. After Isha there is nothing left today,
 * so we wrap to tomorrow's first entry.
 */
export function resolveNextPrayer(entries, now = new Date()) {
  if (entries.length === 0) return null;

  const upcoming = entries.find((entry) => entry.date > now);
  if (upcoming) return { ...upcoming, isTomorrow: false };

  // setDate() rolls the month and the year over correctly on its own — never
  // do this by adding 86400000 milliseconds, that breaks across DST changes.
  const first = entries[0];
  const tomorrow = new Date(first.date);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return { ...first, date: tomorrow, isTomorrow: true };
}