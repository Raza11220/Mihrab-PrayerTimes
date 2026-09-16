import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import { fetchSurahs } from '../services/quranApi';
import { useAppStore } from '../store/useAppStore';
import { getSurahStartJuz } from '../utils/quran';
import { colors, layout, radius, shadow, spacing } from '../theme/colors';
import { type } from '../theme/typography';

const MESSAGES = {
  network: 'Check your connection and try again.',
  'http-error': 'The Quran service is temporarily unavailable.',
};

export default function QuranScreen({ navigation }) {
  const [surahs, setSurahs] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const lastRead = useAppStore((state) => state.quranLastRead);

  const lastReadSurah = surahs.find((surah) => surah.number === lastRead.surah);

  const loadSurahs = async () => {
    setStatus('loading');
    setError(null);
    const result = await fetchSurahs();

    if (result.ok) {
      setSurahs(result.data);
      setStatus('ready');
    } else {
      setError(result.reason);
      setStatus('error');
    }
  };

  useEffect(() => {
    loadSurahs();
  }, []);

  const filteredSurahs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return surahs;

    return surahs.filter((surah) =>
      [surah.englishName, surah.name, surah.number.toString()]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [query, surahs]);

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View>
            <Text style={type.label}>READ AND REFLECT</Text>
            <Text style={type.h1}>The Quran</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={() => navigation.navigate('Bookmarks')} hitSlop={8} style={styles.headerIcon}>
              <Ionicons name="bookmarks-outline" size={20} color={colors.primary} />
            </Pressable>
            <View style={styles.headerIcon}>
              <Ionicons name="book-outline" size={22} color={colors.primary} />
            </View>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroMark}>
            <Ionicons name="bookmark-outline" size={20} color={colors.textOnPrimary} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroLabel}>CONTINUE READING</Text>
            <Text style={styles.heroTitle}>Continue {lastReadSurah?.englishName ?? 'Al-Fatihah'}</Text>
            <Text style={styles.heroCaption}>Verse {lastRead.ayah} of {lastReadSurah?.numberOfAyahs ?? 7}</Text>
          </View>
          <Pressable style={styles.heroButton} onPress={() => navigation.navigate('QuranReader', { surah: 1 })}>
            <Ionicons name="arrow-forward" size={18} color={colors.textOnPrimary} />
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.textFaint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search surah by name or number"
            placeholderTextColor={colors.textFaint}
            style={styles.searchInput}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textFaint} />
            </Pressable>
          )}
        </View>

        <View style={styles.quickActions}>
          <Pressable style={styles.quickAction} onPress={() => navigation.navigate('QuranSearch')}><Ionicons name="search-outline" size={17} color={colors.primary} /><Text style={styles.quickText}>Search Quran</Text></Pressable>
          <Pressable style={styles.quickAction} onPress={() => navigation.navigate('JuzDirectory')}><Ionicons name="grid-outline" size={17} color={colors.primary} /><Text style={styles.quickText}>30 Siparah</Text></Pressable>
        </View>

        <Text style={styles.sectionLabel}>ALL SURAHS</Text>

        {status === 'loading' && (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[type.bodyMuted, styles.centered]}>Loading the Quran…</Text>
          </View>
        )}

        {status === 'error' && (
          <View style={styles.stateCard}>
            <Ionicons name="cloud-offline-outline" size={24} color={colors.accentDark} />
            <Text style={[type.bodyMuted, styles.centered]}>{MESSAGES[error] ?? MESSAGES['http-error']}</Text>
            <Pressable style={styles.retryButton} onPress={loadSurahs}>
              <Text style={type.button}>Try again</Text>
            </Pressable>
          </View>
        )}

        {status === 'ready' && filteredSurahs.map((surah) => (
            <Pressable
            key={surah.number}
            style={({ pressed }) => [styles.surahRow, pressed && styles.pressed]}
            onPress={() => navigation.navigate('QuranReader', { surah: surah.number })}
          >
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>{surah.number}</Text>
            </View>
            <View style={styles.surahInfo}>
              <Text style={type.h3}>{surah.englishName}</Text>
              <Text style={type.caption}>Siparah {getSurahStartJuz(surah.number)} · {surah.revelationType} · {surah.numberOfAyahs} verses</Text>
            </View>
            <Text style={styles.arabicName}>{surah.name}</Text>
            <Ionicons name="chevron-forward" size={17} color={colors.textFaint} />
          </Pressable>
        ))}

        {status === 'ready' && filteredSurahs.length === 0 && (
          <Text style={[type.bodyMuted, styles.emptyText]}>No surah matches your search.</Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: layout.tabBarSpace },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.primary, ...shadow.raised },
  heroMark: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1, marginLeft: spacing.md },
  heroLabel: { ...type.label, color: colors.primaryLight, fontSize: 11 },
  heroTitle: { ...type.h3, color: colors.textOnPrimary, marginTop: 2 },
  heroCaption: { ...type.caption, color: colors.primaryLight, marginTop: 2 },
  heroButton: { width: 38, height: 38, borderRadius: radius.pill, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 52, marginTop: spacing.xl, paddingHorizontal: spacing.lg, borderRadius: radius.pill, backgroundColor: colors.card, ...shadow.card },
  searchInput: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.text, paddingVertical: 0 },
  sectionLabel: { ...type.label, color: colors.primary, marginTop: spacing.xxl, marginBottom: spacing.sm },
  quickActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  quickAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.primaryLight },
  quickText: { ...type.caption, color: colors.primaryDark, fontFamily: 'Poppins_600SemiBold' },
  stateCard: { alignItems: 'center', gap: spacing.md, padding: spacing.xl, borderRadius: radius.lg, backgroundColor: colors.card, ...shadow.card },
  centered: { textAlign: 'center' },
  retryButton: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.pill, backgroundColor: colors.primary },
  surahRow: { flexDirection: 'row', alignItems: 'center', minHeight: 72, gap: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
  pressed: { opacity: 0.65 },
  numberBadge: { width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  numberText: { ...type.caption, color: colors.primaryDark, fontFamily: 'Poppins_600SemiBold' },
  surahInfo: { flex: 1 },
  arabicName: { fontSize: 19, color: colors.text, marginRight: spacing.xs },
  emptyText: { textAlign: 'center', paddingVertical: spacing.xl },
});