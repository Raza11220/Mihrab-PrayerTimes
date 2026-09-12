import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.alquran.cloud/v1';
const CACHE_PREFIX = '@mihrab/quran/';

export const QURAN_RECITERS = [
  { id: 'ar.alafasy', label: 'Mishary Alafasy' },
  { id: 'ar.abdulbasitmurattal', label: 'Abdul Basit' },
  { id: 'ar.abdulsamad', label: 'Abdul Samad' },
  { id: 'ar.saoodshuraym', label: 'Saad Al-Ghamdi' },
];

async function readCache(key) {
  try {
    const value = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
}

async function writeCache(key, data) {
  try {
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(data));
  } catch (error) {
    // Caching is an enhancement; a storage failure should not block reading.
  }
}

async function request(path, cacheKey) {
  const cachedData = await readCache(cacheKey);

  try {
    const response = await fetch(`${API_URL}${path}`);
    const payload = await response.json();

    if (!response.ok || payload.code !== 200) {
      throw new Error('http-error');
    }

    await writeCache(cacheKey, payload.data);
    return { ok: true, data: payload.data, source: 'network' };
  } catch (error) {
    if (cachedData) {
      return { ok: true, data: cachedData, source: 'cache', stale: true };
    }

    return { ok: false, reason: error.message === 'http-error' ? 'http-error' : 'network' };
  }
}

export function fetchSurahs() {
  return request('/surah', 'surah-list');
}

export function fetchSurah(number) {
  return request(
    `/surah/${number}/editions/quran-uthmani,en.asad,ur.jalandhry`,
    `surah-v2-${number}`
  );
}

export function getSurahAudioUrl(number, reciter = 'ar.alafasy') {
  return `https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${number}.mp3`;
}

export function searchQuran(query, edition = 'en.asad') {
  return request(`/search/${encodeURIComponent(query)}/all/${edition}`, `search-${edition}-${query.toLowerCase()}`);
}