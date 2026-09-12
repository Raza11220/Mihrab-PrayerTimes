import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import { fetchMonthTimings } from '../services/prayerApi';
import { useAppStore } from '../store/useAppStore';
import { colors, layout, radius, shadow, spacing } from '../theme/colors';
import { type } from '../theme/typography';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarScreen() {
  const location = useAppStore((state) => state.location);
  const method = useAppStore((state) => state.method);
  const school = useAppStore((state) => state.school);
  const [date, setDate] = useState(new Date());
  const [days, setDays] = useState([]);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!location) return;
    let active = true;
    setStatus('loading');
    fetchMonthTimings({ latitude: location.latitude, longitude: location.longitude, method, school, month: date.getMonth() + 1, year: date.getFullYear() }).then((result) => {
      if (!active) return;
      if (result.ok) { setDays(result.data); setStatus('ready'); } else setStatus('error');
    });
    return () => { active = false; };
  }, [date, location, method, school]);

  const moveMonth = (offset) => setDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={type.label}>PLAN YOUR MONTH</Text>
        <Text style={type.h1}>Prayer calendar</Text>
        <View style={styles.monthHeader}>
          <Pressable style={styles.monthButton} onPress={() => moveMonth(-1)}><Ionicons name="chevron-back" size={19} color={colors.text} /></Pressable>
          <Text style={type.h2}>{MONTHS[date.getMonth()]} {date.getFullYear()}</Text>
          <Pressable style={styles.monthButton} onPress={() => moveMonth(1)}><Ionicons name="chevron-forward" size={19} color={colors.text} /></Pressable>
        </View>
        {!location && <View style={styles.state}><Ionicons name="location-outline" size={24} color={colors.accentDark} /><Text style={[type.bodyMuted, styles.centered]}>Set a location to see the monthly prayer calendar.</Text></View>}
        {location && status === 'loading' && <View style={styles.state}><ActivityIndicator color={colors.primary} /><Text style={type.bodyMuted}>Loading month...</Text></View>}
        {location && status === 'error' && <View style={styles.state}><Ionicons name="cloud-offline-outline" size={24} color={colors.accentDark} /><Text style={[type.bodyMuted, styles.centered]}>Could not load this month. Check your connection and try again.</Text></View>}
        {status === 'ready' && days.map(({ date: dayDate, timings }) => {
          return <View key={dayDate.gregorian.date} style={styles.dayRow}>
            <View style={styles.dayDate}><Text style={styles.dayNumber}>{dayDate.gregorian.day}</Text><Text style={styles.dayName}>{dayDate.gregorian.weekday.en.slice(0, 3)}</Text></View>
            <View style={styles.dayTimes}><Text style={styles.hijri}>{dayDate.hijri.day} {dayDate.hijri.month.en}</Text><Text style={styles.times}>{timings.Fajr?.split(' ')[0]}  ·  {timings.Dhuhr?.split(' ')[0]}  ·  {timings.Maghrib?.split(' ')[0]}  ·  {timings.Isha?.split(' ')[0]}</Text><Text style={styles.sun}>Sunrise {timings.Sunrise?.split(' ')[0]}  ·  Sunset {timings.Sunset?.split(' ')[0]}</Text>{dayDate.hijri.holidays?.length > 0 && <Text style={styles.event}>{dayDate.hijri.holidays.join(' · ')}</Text>}</View>
          </View>;
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: layout.tabBarSpace },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.card, ...shadow.card },
  monthButton: { width: 38, height: 38, borderRadius: radius.pill, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  state: { alignItems: 'center', gap: spacing.md, marginTop: spacing.xl, padding: spacing.xl, borderRadius: radius.lg, backgroundColor: colors.card, ...shadow.card },
  centered: { textAlign: 'center' },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.divider },
  dayDate: { width: 46, alignItems: 'center' },
  dayNumber: { ...type.h2, color: colors.primaryDark },
  dayName: { ...type.caption, color: colors.textMuted, textTransform: 'uppercase' },
  dayTimes: { flex: 1 },
  hijri: { ...type.caption, color: colors.primary },
  times: { ...type.body, marginTop: 3 },
  sun: { ...type.caption, marginTop: 3 },
  event: { ...type.caption, color: colors.accentDark, marginTop: 3 },
});