import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { normalizeTimings, PRAYERS } from '../utils/prayers';

const CHANNEL_ID = 'prayer-reminders';

export async function prepareNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Prayer reminders',
      description: 'Reminders for the five daily prayers',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7C8A50',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return { ok: true };
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });

  return { ok: requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL };
}

export async function schedulePrayerReminders({ timingsRaw, reminders, leadMinutes = 0 }) {
  const permission = await prepareNotifications();
  if (!permission.ok) return { ok: false, reason: 'permission-denied' };

  await Notifications.cancelAllScheduledNotificationsAsync();

  const entries = normalizeTimings(timingsRaw).filter((entry) =>
    PRAYERS.some((prayer) => prayer.key === entry.key && prayer.isFard && reminders[entry.key])
  );

  const now = Date.now();
  const scheduled = [];

  for (const entry of entries) {
    const triggerDate = new Date(entry.date.getTime() - leadMinutes * 60 * 1000);
    if (triggerDate.getTime() <= now) continue;

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${entry.label} prayer`,
        body: leadMinutes
          ? `${entry.label} is in ${leadMinutes} minutes.`
          : `It is time for ${entry.label} prayer.`,
        sound: 'default',
        data: { prayer: entry.key },
        ...(Platform.OS === 'android' ? { color: '#7C8A50' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      },
    });

    scheduled.push(identifier);
  }

  return { ok: true, count: scheduled.length };
}

export async function clearPrayerReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}