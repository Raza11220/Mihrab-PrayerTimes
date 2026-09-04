import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getDeviceLocation } from '../services/location';
import { fetchDayTimings } from '../services/prayerApi';
import { toDayKey } from '../utils/time';

export const CALCULATION_METHODS = [
  { id: 1, label: 'University of Islamic Sciences, Karachi' },
  { id: 2, label: 'Islamic Society of North America' },
  { id: 3, label: 'Muslim World League' },
  { id: 4, label: 'Umm al-Qura, Makkah' },
  { id: 5, label: 'Egyptian General Authority of Survey' },
];

export const ASR_SCHOOLS = [
  { id: 0, label: 'Standard (Shafi, Maliki, Hanbali)' },
  { id: 1, label: 'Hanafi' },
];

// Saved to disk.
const PERSISTED_DEFAULTS = {
  location: null, // { latitude, longitude, city, country, source }
  method: 1,
  school: 1,
  timeFormat: '12h', // '12h' | '24h'
  hasOnboarded: false,

  // The API payload exactly as received. We store the RAW object, never the
  // normalized version — Date objects do not survive JSON, they come back as
  // strings and silently break every comparison.
  timingsRaw: null,
  timingsKey: null, // identifies what the cached payload is valid for
};

// Lives in memory only — must reset on every launch.
const TRANSIENT_DEFAULTS = {
  locationStatus: 'idle', // 'idle' | 'loading' | 'ready' | 'error'
  locationError: null,
  timingsStatus: 'idle',
  timingsError: null,
};

/**
 * Prayer times depend on day, position, method and school. Fold all four into
 * one string so we can tell in a single comparison whether the cache is stale.
 */
function buildTimingsKey({ location, method, school, dayKey }) {
  return [
    dayKey,
    location.latitude.toFixed(3),
    location.longitude.toFixed(3),
    method,
    school,
  ].join('|');
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      ...PERSISTED_DEFAULTS,
      ...TRANSIENT_DEFAULTS,

      // --- Location ---------------------------------------------------------

      loadDeviceLocation: async () => {
        set({ locationStatus: 'loading', locationError: null });

        const result = await getDeviceLocation();

        if (result.ok) {
          set({ location: result.location, locationStatus: 'ready' });
        } else {
          set({ locationStatus: 'error', locationError: result.reason });
        }

        return result;
      },

      setLocationManually: (location) =>
        set({ location, locationStatus: 'ready', locationError: null }),

      // --- Prayer times -----------------------------------------------------

      loadTimings: async ({ force = false } = {}) => {
        const { location, method, school, timingsRaw, timingsKey } = get();

        if (!location) {
          return { ok: false, reason: 'no-location' };
        }

        const expectedKey = buildTimingsKey({
          location,
          method,
          school,
          dayKey: toDayKey(),
        });

        // Already have exactly the right data — don't hit the network again.
        if (!force && timingsRaw && timingsKey === expectedKey) {
          set({ timingsStatus: 'ready' });
          return { ok: true, data: timingsRaw };
        }

        set({ timingsStatus: 'loading', timingsError: null });

        const result = await fetchDayTimings({
          latitude: location.latitude,
          longitude: location.longitude,
          method,
          school,
        });

        if (result.ok) {
          set({ timingsRaw: result.data, timingsKey: expectedKey, timingsStatus: 'ready' });
        } else {
          // Keep any previously cached payload — stale times beat a blank screen.
          set({ timingsStatus: 'error', timingsError: result.reason });
        }

        return result;
      },

      // --- Settings ---------------------------------------------------------

      setMethod: (method) => set({ method }),
      setSchool: (school) => set({ school }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      completeOnboarding: () => set({ hasOnboarded: true }),

      // --- Danger zone ------------------------------------------------------

      resetAll: () => set({ ...PERSISTED_DEFAULTS, ...TRANSIENT_DEFAULTS }),
    }),
    {
      name: 'mihrab-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        location: state.location,
        method: state.method,
        school: state.school,
        timeFormat: state.timeFormat,
        hasOnboarded: state.hasOnboarded,
        timingsRaw: state.timingsRaw,
        timingsKey: state.timingsKey,
      }),
    }
  )
);