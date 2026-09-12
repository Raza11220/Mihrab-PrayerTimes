const BASE_URL = 'https://api.aladhan.com/v1';
const TIMEOUT_MS = 12000;

/** Aladhan expects DD-MM-YYYY in the path. */
function formatApiDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
}

/**
 * Build a query string by hand rather than using URLSearchParams — React
 * Native's version of that API is incomplete and bites you at runtime.
 */
function toQuery(params) {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

/**
 * A fetch that cannot hang forever. Without the AbortController, a phone on a
 * dead wifi network leaves the spinner spinning with no way out.
 */
async function getJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    // fetch only rejects on network failure — a 404 or 500 still "succeeds",
    // so the status has to be checked explicitly.
    if (!response.ok) {
      return { ok: false, reason: 'http-error', status: response.status };
    }

    const json = await response.json();
    return { ok: true, json };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { ok: false, reason: 'timeout' };
    }
    return { ok: false, reason: 'network', error };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Raw prayer timings for one day at one coordinate.
 * Returns the API's payload untouched for now — we'll shape it once we've seen it.
 */
export async function fetchDayTimings({ latitude, longitude, method, school, date = new Date() }) {
  const query = toQuery({ latitude, longitude, method, school });
  const url = `${BASE_URL}/timings/${formatApiDate(date)}?${query}`;

  const result = await getJson(url);

  if (!result.ok) {
    return result;
  }

  if (result.json?.code !== 200 || !result.json?.data) {
    return { ok: false, reason: 'bad-payload' };
  }

  return { ok: true, data: result.json.data };
}

export async function fetchMonthTimings({ latitude, longitude, method, school, month, year }) {
  const query = toQuery({ latitude, longitude, method, school });
  const url = `${BASE_URL}/calendar/${year}/${month}?${query}`;
  const result = await getJson(url);

  if (!result.ok) return result;
  if (result.json?.code !== 200 || !Array.isArray(result.json?.data)) {
    return { ok: false, reason: 'bad-payload' };
  }

  return { ok: true, data: result.json.data };
}