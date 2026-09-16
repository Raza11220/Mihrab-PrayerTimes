// @jest-environment node

import { normalizeTimings, findCurrentAndNext, resolveNextPrayer, PRAYERS } from '../src/utils/prayers';
import { apiTimeToDate, formatTime, formatCountdown, parseApiTime, toDayKey } from '../src/utils/time';
import { qiblaBearing, distanceToKaabaKm, cardinalFromBearing, shortestAngleDelta } from '../src/utils/qibla';
import { getSurahStartJuz } from '../src/utils/quran';

describe('prayers.js', () => {
  test('PRAYERS contains all expected keys', () => {
    const keys = PRAYERS.map((p) => p.key);
    expect(keys).toContain('Fajr');
    expect(keys).toContain('Dhuhr');
    expect(keys).toContain('Asr');
    expect(keys).toContain('Maghrib');
    expect(keys).toContain('Isha');
  });

  test('PRAYERS has 7 entries', () => {
    expect(PRAYERS.length).toBe(7);
  });

  test('isFard correctly marks 5 obligatory prayers', () => {
    const fard = PRAYERS.filter((p) => p.isFard);
    expect(fard.length).toBe(5);
    expect(fard.map((p) => p.key)).toEqual(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']);
  });

  test('normalizeTimings returns empty for null input', () => {
    expect(normalizeTimings(null)).toEqual([]);
  });

  test('normalizeTimings returns empty for missing timings', () => {
    expect(normalizeTimings({})).toEqual([]);
  });

  test('normalizeTimings maps API times to Date objects', () => {
    const base = new Date('2026-09-16T00:00:00');
    const result = normalizeTimings({ timings: { Fajr: '04:40', Dhuhr: '12:30' } }, base);
    expect(result.length).toBe(2);
    expect(result[0].label).toBe('Fajr');
    expect(result[0].date.getHours()).toBe(4);
    expect(result[0].date.getMinutes()).toBe(40);
    expect(result[1].label).toBe('Dhuhr');
    expect(result[1].date.getHours()).toBe(12);
    expect(result[1].date.getMinutes()).toBe(30);
  });

  test('normalizeTimings filters out unknown keys', () => {
    const base = new Date('2026-09-16T00:00:00');
    const result = normalizeTimings({ timings: { Fajr: '04:40', Unknown: '00:00' } }, base);
    expect(result.length).toBe(1);
    expect(result[0].key).toBe('Fajr');
  });

  test('findCurrentAndNext returns current and next', () => {
    const base = new Date('2026-09-16T00:00:00');
    const entries = normalizeTimings(
      { timings: { Fajr: '04:40', Dhuhr: '12:30' } },
      base
    );
    const now = new Date('2026-09-16T06:00:00');
    const result = findCurrentAndNext(entries, now);
    expect(result.current.key).toBe('Fajr');
    expect(result.next.key).toBe('Dhuhr');
  });

  test('findCurrentAndNext returns null next after last prayer', () => {
    const base = new Date('2026-09-16T00:00:00');
    const entries = normalizeTimings(
      { timings: { Fajr: '04:40', Dhuhr: '12:30' } },
      base
    );
    const now = new Date('2026-09-16T20:00:00');
    const result = findCurrentAndNext(entries, now);
    expect(result.current.key).toBe('Dhuhr');
    expect(result.next).toBeNull();
  });

  test('resolveNextPrayer wraps to tomorrow', () => {
    const base = new Date('2026-09-16T00:00:00');
    const entries = normalizeTimings(
      { timings: { Fajr: '04:40', Dhuhr: '12:30' } },
      base
    );
    const now = new Date('2026-09-16T20:00:00');
    const result = resolveNextPrayer(entries, now);
    expect(result.key).toBe('Fajr');
    expect(result.isTomorrow).toBe(true);
  });

  test('resolveNextPrayer returns upcoming same day', () => {
    const base = new Date('2026-09-16T00:00:00');
    const entries = normalizeTimings(
      { timings: { Fajr: '04:40', Dhuhr: '12:30' } },
      base
    );
    const now = new Date('2026-09-16T06:00:00');
    const result = resolveNextPrayer(entries, now);
    expect(result.key).toBe('Dhuhr');
    expect(result.isTomorrow).toBe(false);
  });
});

describe('time.js', () => {
  test('parseApiTime parses HH:MM', () => {
    expect(parseApiTime('04:40')).toEqual({ hours: 4, minutes: 40 });
  });

  test('parseApiTime parses H:MM', () => {
    expect(parseApiTime('4:40')).toEqual({ hours: 4, minutes: 40 });
  });

  test('parseApiTime returns null for invalid', () => {
    expect(parseApiTime(null)).toBeNull();
    expect(parseApiTime('')).toBeNull();
    expect(parseApiTime('25:00')).toBeNull();
    expect(parseApiTime('abc')).toBeNull();
  });

  test('parseApiTime ignores timezone suffix', () => {
    expect(parseApiTime('17:19 (PKT)')).toEqual({ hours: 17, minutes: 19 });
  });

  test('apiTimeToDate creates correct Date', () => {
    const base = new Date('2026-09-16T00:00:00');
    const result = apiTimeToDate('04:40', base);
    expect(result.getHours()).toBe(4);
    expect(result.getMinutes()).toBe(40);
    expect(result.getSeconds()).toBe(0);
  });

  test('formatTime 24h format', () => {
    const d = new Date('2026-09-16T13:30:00');
    expect(formatTime(d, '24h')).toBe('13:30');
  });

  test('formatTime 12h AM format', () => {
    const d = new Date('2026-09-16T04:30:00');
    expect(formatTime(d, '12h')).toBe('4:30 AM');
  });

  test('formatTime 12h PM format', () => {
    const d = new Date('2026-09-16T13:30:00');
    expect(formatTime(d, '12h')).toBe('1:30 PM');
  });

  test('formatTime noon is 12 PM', () => {
    const d = new Date('2026-09-16T12:00:00');
    expect(formatTime(d, '12h')).toBe('12:00 PM');
  });

  test('formatTime midnight is 12 AM', () => {
    const d = new Date('2026-09-16T00:00:00');
    expect(formatTime(d, '12h')).toBe('12:00 AM');
  });

  test('formatTime returns --:-- for null', () => {
    expect(formatTime(null)).toBe('--:--');
  });

  test('formatCountdown returns HH:MM:SS for long duration', () => {
    const ms = 2 * 3600000 + 45 * 60000 + 30000;
    expect(formatCountdown(ms)).toBe('2:45:30');
  });

  test('formatCountdown returns MM:SS for under an hour', () => {
    const ms = 45 * 60000 + 30000;
    expect(formatCountdown(ms)).toBe('45:30');
  });

  test('formatCountdown returns 00:00 for zero', () => {
    expect(formatCountdown(0)).toBe('00:00');
  });

  test('formatCountdown handles negative', () => {
    expect(formatCountdown(-5000)).toBe('00:00');
  });

  test('toDayKey returns YYYY-MM-DD', () => {
    const d = new Date('2026-09-16T12:00:00');
    expect(toDayKey(d)).toBe('2026-09-16');
  });
});

describe('qibla.js', () => {
  test('KAABA coordinates are correct', () => {
    const { KAABA } = require('../src/utils/qibla');
    expect(KAABA.latitude).toBeCloseTo(21.4225, 4);
    expect(KAABA.longitude).toBeCloseTo(39.8262, 4);
  });

  test('qiblaBearing returns degrees 0-359', () => {
    const bearing = qiblaBearing(21.4225, 39.8262);
    expect(bearing).toBe(0);
  });

  test('qiblaBearing for Karachi is roughly 68 degrees', () => {
    const bearing = qiblaBearing(24.8607, 67.0011);
    expect(bearing).toBeGreaterThan(50);
    expect(bearing).toBeLessThan(90);
  });

  test('qiblaBearing for Tokyo is roughly 330 degrees', () => {
    const bearing = qiblaBearing(35.6762, 139.6503);
    expect(bearing).toBeGreaterThan(300);
    expect(bearing).toBeLessThan(360);
  });

  test('distanceToKaabaKm returns positive number', () => {
    const dist = distanceToKaabaKm(21.4225, 39.8262);
    expect(dist).toBeCloseTo(0, 1);
  });

  test('distanceToKaabaKm for Karachi is ~2100km', () => {
    const dist = distanceToKaabaKm(24.8607, 67.0011);
    expect(dist).toBeGreaterThan(2000);
    expect(dist).toBeLessThan(2300);
  });

  test('cardinalFromBearing returns N for 0', () => {
    expect(cardinalFromBearing(0)).toBe('N');
  });

  test('cardinalFromBearing returns E for 90', () => {
    expect(cardinalFromBearing(90)).toBe('E');
  });

  test('cardinalFromBearing returns S for 180', () => {
    expect(cardinalFromBearing(180)).toBe('S');
  });

  test('cardinalFromBearing returns W for 270', () => {
    expect(cardinalFromBearing(270)).toBe('W');
  });

  test('shortestAngleDelta handles wraparound', () => {
    expect(shortestAngleDelta(350, 10)).toBe(20);
  });

  test('shortestAngleDelta negative wraparound', () => {
    expect(shortestAngleDelta(10, 350)).toBe(-20);
  });

  test('shortestAngleDelta same angle', () => {
    expect(shortestAngleDelta(45, 45)).toBe(0);
  });

  test('shortestAngleDelta returns -180 to 180', () => {
    expect(shortestAngleDelta(0, 180)).toBe(180);
    expect(shortestAngleDelta(180, 0)).toBe(-180);
  });
});

describe('quran.js', () => {
  test('Surah 1 starts in Juz 1', () => {
    expect(getSurahStartJuz(1)).toBe(1);
  });

  test('Surah 2 starts in Juz 1', () => {
    expect(getSurahStartJuz(2)).toBe(1);
  });

  test('Surah 3 starts in Juz 3', () => {
    expect(getSurahStartJuz(3)).toBe(3);
  });

  test('Surah 30 starts in Juz 30', () => {
    expect(getSurahStartJuz(30)).toBe(30);
  });

  test('all 114 surahs return a valid Juz', () => {
    for (let i = 1; i <= 114; i++) {
      const juz = getSurahStartJuz(i);
      expect(juz).toBeGreaterThanOrEqual(1);
      expect(juz).toBeLessThanOrEqual(30);
    }
  });
});
