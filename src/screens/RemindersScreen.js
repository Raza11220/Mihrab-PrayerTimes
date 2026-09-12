import { Text } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { type } from '../theme/typography';
import { useEffect, useState } from 'react';
import { View, Switch, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppStore } from '../store/useAppStore';
import { schedulePrayerReminders, clearPrayerReminders } from '../services/notifications';
import { PRAYERS } from '../utils/prayers';
import { colors, radius, spacing, shadow, layout } from '../theme/colors';

const LEAD_OPTIONS = [0, 5, 10, 15];

export default function RemindersScreen() {
  const reminders = useAppStore((state) => state.reminders);
  const reminderLeadMinutes = useAppStore((state) => state.reminderLeadMinutes);
  const timingsRaw = useAppStore((state) => state.timingsRaw);
  const setReminder = useAppStore((state) => state.setReminder);
  const setReminderLeadMinutes = useAppStore((state) => state.setReminderLeadMinutes);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!timingsRaw || !Object.values(reminders).some(Boolean)) return;

    let cancelled = false;
    schedulePrayerReminders({ timingsRaw, reminders, leadMinutes: reminderLeadMinutes }).then((result) => {
      if (!cancelled && !result.ok) setMessage('Allow notifications in device settings to receive reminders.');
    });

    return () => {
      cancelled = true;
    };
  }, [timingsRaw, reminders, reminderLeadMinutes]);

  const updateReminder = async (prayer, enabled) => {
    setMessage(null);
    setReminder(prayer, enabled);

    if (!enabled && Object.entries(reminders).every(([key, value]) => key === prayer || !value)) {
      await clearPrayerReminders();
    }
  };

  const selectLeadTime = async (minutes) => {
    setBusy(true);
    setMessage(null);
    setReminderLeadMinutes(minutes);
    const result = await schedulePrayerReminders({ timingsRaw, reminders, leadMinutes: minutes });
    setBusy(false);
    if (!result.ok) setMessage('Allow notifications in device settings to receive reminders.');
  };

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={type.label}>STAY ON TIME</Text>
        <Text style={type.h1}>Prayer reminders</Text>
        <Text style={[type.bodyMuted, styles.intro]}>Choose the prayers you want Mihrab to remind you about.</Text>

        <View style={styles.card}>
          {PRAYERS.filter((prayer) => prayer.isFard).map((prayer, index, list) => (
            <View key={prayer.key} style={[styles.row, index < list.length - 1 && styles.rowBorder]}>
              <View style={styles.rowIcon}>
                <Ionicons name={prayer.icon} size={19} color={colors.accentDark} />
              </View>
              <Text style={type.h3}>{prayer.label}</Text>
              <Switch
                value={Boolean(reminders[prayer.key])}
                onValueChange={(value) => updateReminder(prayer.key, value)}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={reminders[prayer.key] ? colors.primary : colors.textFaint}
                accessibilityLabel={`${prayer.label} reminder`}
              />
            </View>
          ))}
        </View>

        <Text style={[type.h3, styles.sectionTitle]}>Remind me</Text>
        <View style={styles.optionsCard}>
          {LEAD_OPTIONS.map((minutes) => (
            <Pressable key={minutes} style={[styles.option, reminderLeadMinutes === minutes && styles.optionSelected]} onPress={() => selectLeadTime(minutes)}>
              <Text style={reminderLeadMinutes === minutes ? styles.optionTextSelected : styles.optionText}>
                {minutes === 0 ? 'At prayer time' : `${minutes} min before`}
              </Text>
            </Pressable>
          ))}
        </View>

        {busy && <ActivityIndicator style={styles.loader} color={colors.primary} />}
        {message && <Text style={styles.message}>{message}</Text>}
        {!timingsRaw && <Text style={[type.caption, styles.note]}>Load today&apos;s prayer times before enabling reminders.</Text>}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: layout.tabBarSpace },
  intro: { marginTop: spacing.sm },
  card: { marginTop: spacing.xl, backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: spacing.lg, ...shadow.card },
  row: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowIcon: { width: 36, height: 36, borderRadius: radius.pill, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { marginTop: spacing.xxl },
  optionsCard: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  option: { paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  optionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { ...type.caption, color: colors.textMuted },
  optionTextSelected: { ...type.caption, color: colors.textOnPrimary },
  loader: { marginTop: spacing.lg },
  message: { ...type.caption, color: colors.danger, textAlign: 'center', marginTop: spacing.lg },
  note: { textAlign: 'center', marginTop: spacing.xl },
});