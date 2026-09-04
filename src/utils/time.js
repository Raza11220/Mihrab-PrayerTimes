/**
 * Aladhan returns "HH:MM", but on some endpoints it appends a timezone —
 * "17:19 (PKT)". Take only the leading HH:MM and ignore whatever follows.
 */
export function parseApiTime(value) {
  if (typeof value !== 'string') return null;

  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  return { hours, minutes };
}

/** Turn an API time string into a real Date on the given calendar day. */
export function apiTimeToDate(value, baseDate = new Date()) {
  const parsed = parseApiTime(value);
  if (!parsed) return null;

  const date = new Date(baseDate);
  date.setHours(parsed.hours, parsed.minutes, 0, 0);
  return date;
}

/** "17:19" or "5:19 PM", depending on the user's setting. */
export function formatTime(date, timeFormat = '12h') {
  if (!date) return '--:--';

  const hours24 = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (timeFormat === '24h') {
    return `${String(hours24).padStart(2, '0')}:${minutes}`;
  }

  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${minutes} ${suffix}`;
}

/** Ticking countdown: "2:04:31" or "04:31" when under an hour. */
export function formatCountdown(ms) {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value) => String(value).padStart(2, '0');

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

/** Human phrasing for the banner: "1 hour and 37 minutes". */
export function formatDurationWords(ms) {
  const totalMinutes = Math.max(0, Math.round(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);

  if (parts.length === 0) return 'less than a minute';
  return parts.join(' and ');
}
/** Stable 'YYYY-MM-DD' key for a calendar day, used for caching. */
export function toDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}