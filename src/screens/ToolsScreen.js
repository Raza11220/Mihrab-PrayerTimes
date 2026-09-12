import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import { useAppStore } from '../store/useAppStore';
import { colors, layout, radius, shadow, spacing } from '../theme/colors';
import { type } from '../theme/typography';

const HADITH = 'The best of you are those who learn the Quran and teach it.';
const DUA = 'Our Lord, grant us good in this world and in the Hereafter, and save us from the Fire.';

export default function ToolsScreen() {
  const tasbihCount = useAppStore((state) => state.tasbihCount);
  const tasbihHistory = useAppStore((state) => state.tasbihHistory);
  const incrementTasbih = useAppStore((state) => state.incrementTasbih);
  const resetTasbih = useAppStore((state) => state.resetTasbih);
  const [ramadanMode, setRamadanMode] = useState(false);
  const dayOfYear = useMemo(() => Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000), []);
  const ayah = dayOfYear % 2 === 0
    ? 'Indeed, in the remembrance of Allah do hearts find rest.'
    : 'So remember Me; I will remember you.';

  const finishTasbih = () => {
    if (tasbihCount > 0) resetTasbih();
  };

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={type.label}>DAILY PRACTICE</Text>
        <Text style={type.h1}>Islamic tools</Text>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}><Ionicons name="book-outline" size={20} color={colors.textOnPrimary} /></View>
          <Text style={styles.featureLabel}>DAILY AYAH</Text>
          <Text style={styles.arabicQuote}>{ayah}</Text>
          <Text style={type.caption}>A moment for reflection today</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeading}><Ionicons name="quote-outline" size={20} color={colors.accentDark} /><Text style={type.h3}>Daily Hadith</Text></View>
          <Text style={type.body}>{HADITH}</Text>
          <Text style={[type.caption, styles.source]}>Sahih al-Bukhari</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeading}><Ionicons name="heart-outline" size={20} color={colors.accentDark} /><Text style={type.h3}>Dua of the day</Text></View>
          <Text style={styles.dua}>{DUA}</Text>
          <Text style={styles.duaArabic}>رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeading}><Ionicons name="ellipse-outline" size={20} color={colors.accentDark} /><Text style={type.h3}>Tasbih</Text></View>
          <Text style={styles.count}>{tasbihCount}</Text>
          <Pressable style={styles.tasbihButton} onPress={incrementTasbih}><Text style={type.button}>Tap to count</Text></Pressable>
          <Pressable style={styles.resetButton} onPress={finishTasbih}><Text style={styles.resetText}>Complete session</Text></Pressable>
          {tasbihHistory.length > 0 && <Text style={[type.caption, styles.centered]}>Last session: {tasbihHistory[tasbihHistory.length - 1].count} counts</Text>}
        </View>

        <View style={styles.ramadanCard}>
          <View style={styles.cardHeading}><Ionicons name="moon-outline" size={20} color={colors.accentDark} /><Text style={type.h3}>Ramadan mode</Text></View>
          <Text style={type.bodyMuted}>{ramadanMode ? 'Ramadan dashboard enabled for Sehri, Iftar and Taraweeh planning.' : 'Prepare a focused Ramadan dashboard for fasting and Taraweeh.'}</Text>
          <Pressable style={styles.ramadanButton} onPress={() => setRamadanMode((value) => !value)}><Text style={type.button}>{ramadanMode ? 'Disable Ramadan mode' : 'Enable Ramadan mode'}</Text></Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: layout.tabBarSpace },
  featureCard: { marginTop: spacing.xl, padding: spacing.xl, borderRadius: radius.lg, backgroundColor: colors.primary, ...shadow.raised },
  featureIcon: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  featureLabel: { ...type.label, color: colors.primaryLight, marginTop: spacing.lg, fontSize: 10 },
  arabicQuote: { ...type.h2, color: colors.textOnPrimary, marginTop: spacing.sm },
  card: { marginTop: spacing.lg, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.card, ...shadow.card },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  source: { marginTop: spacing.sm },
  dua: { ...type.body, lineHeight: 25 },
  duaArabic: { fontSize: 20, lineHeight: 34, color: colors.primaryDark, textAlign: 'right', marginTop: spacing.md },
  count: { fontFamily: 'Poppins_700Bold', fontSize: 54, color: colors.primary, textAlign: 'center' },
  tasbihButton: { alignItems: 'center', paddingVertical: spacing.md, borderRadius: radius.pill, backgroundColor: colors.primary },
  resetButton: { alignItems: 'center', paddingVertical: spacing.md },
  resetText: { ...type.caption, color: colors.danger },
  centered: { textAlign: 'center' },
  ramadanCard: { marginTop: spacing.lg, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.accentLight, ...shadow.card },
  ramadanButton: { alignItems: 'center', marginTop: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.pill, backgroundColor: colors.accentDark },
});
