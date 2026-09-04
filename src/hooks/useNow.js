import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * A Date that re-renders the component every `intervalMs`.
 * Anything that needs "right now" reads it from here instead of running its
 * own timer, so there is exactly one clock in the app.
 */
export function useNow(intervalMs = 1000) {
  // The function form runs once. `useState(new Date())` would build a fresh
  // Date on every single render and throw it away — wasteful and misleading.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    let id = setInterval(tick, intervalMs);

    // The OS throttles timers while the app is backgrounded, so the clock can
    // come back stale. Snap it forward the moment we become visible again.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        tick();
        clearInterval(id);
        id = setInterval(tick, intervalMs);
      }
    });

    // Without this cleanup the interval keeps firing after the screen is gone,
    // calling setState on an unmounted component — a classic memory leak.
    return () => {
      clearInterval(id);
      subscription.remove();
    };
  }, [intervalMs]);

  return now;
}