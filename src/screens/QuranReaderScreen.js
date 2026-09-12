import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import QuranAudioPlayer from '../components/QuranAudioPlayer';
import { fetchSurah } from '../services/quranApi';
import { useAppStore } from '../store/useAppStore';
import { getSurahStartJuz } from '../utils/quran';
import { colors, layout, radius, spacing } from '../theme/colors';
import { type } from '../theme/typography';

export default function QuranReaderScreen({ navigation, route }) {
  const [status, setStatus] = useState('loading');
  const [editions, setEditions] = useState([]);
  const surahNumber = route.params?.surah ?? 1;
  const initialAyah = route.params?.ayah ?? 1;
  const setQuranLastRead = useAppStore((state) => state.setQuranLastRead);
  const quranBookmarks = useAppStore((state) => state.quranBookmarks);
  const toggleQuranBookmark = useAppStore((state) => state.toggleQuranBookmark);
  const quranArabicFontSize = useAppStore((state) => state.quranArabicFontSize);
  const quranTranslationFontSize = useAppStore((state) => state.quranTranslationFontSize);
  const quranShowTranslation = useAppStore((state) => state.quranShowTranslation);
  const quranReadingMode = useAppStore((state) => state.quranReadingMode);
  const largeText = useAppStore((state) => state.largeText);
  const highContrast = useAppStore((state) => state.highContrast);

  useEffect(() => {
    setQuranLastRead({ surah: surahNumber, ayah: initialAyah });
  }, [initialAyah, setQuranLastRead, surahNumber]);

  useEffect(() => {
    let active = true;

    fetchSurah(surahNumber).then((result) => {
      if (!active) return;
      if (result.ok) {
        setEditions(result.data);
        setStatus('ready');
      } else {
        setStatus('error');
      }
    });

    return () => {
      active = false;
    };
  }, [surahNumber]);

  const arabic = editions.find((edition) => edition.edition.identifier === 'quran-uthmani');
  const translation = editions.find((edition) => edition.edition.identifier === 'en.asad');
  const urduTranslation = editions.find((edition) => edition.edition.identifier === 'ur.jalandhry');
  const surah = arabic ?? translation;
  const juzNumbers = arabic ? [...new Set(arabic.ayahs.map((ayah) => ayah.juz).filter(Boolean))] : [];

  return (
    <ScreenContainer padded={false}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Text style={type.h3}>{surah?.englishName ?? 'Quran'}</Text>
          {surah && <Text style={type.caption}>Siparah {getSurahStartJuz(surahNumber)} · {surah.revelationType} · {surah.numberOfAyahs} verses</Text>}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {status === 'loading' && <View style={styles.state}><ActivityIndicator color={colors.primary} /><Text style={type.bodyMuted}>Loading chapter…</Text></View>}
      {status === 'error' && <View style={styles.state}><Ionicons name="cloud-offline-outline" size={24} color={colors.accentDark} /><Text style={[type.bodyMuted, styles.centered]}>Could not load this chapter. Check your connection and try again.</Text></View>}

      {status === 'ready' && arabic && translation && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.chapterIntro}>
            <Text style={[styles.chapterArabic, highContrast && styles.highContrastText]} accessibilityRole="header">{arabic.name}</Text>
            <Text style={styles.chapterEnglish}>{arabic.englishName}</Text>
            <Text style={styles.chapterJuz}>
              {juzNumbers.length > 1 ? `Siparah ${juzNumbers.join(', ')}` : `Siparah ${juzNumbers[0] ?? getSurahStartJuz(surahNumber)}`}
            </Text>
            <Text style={type.caption}>In the name of Allah, the Most Gracious, the Most Merciful</Text>
          </View>

          <QuranAudioPlayer surahNumber={surahNumber} surahName={arabic.englishName} />

          {arabic.ayahs.map((ayah, index) => {
            const previousAyah = arabic.ayahs[index - 1];
            const startsNewJuz = index === 0 || ayah.juz !== previousAyah?.juz;

            return (
              <View key={ayah.number}>
                {startsNewJuz && (
                  <View style={styles.juzDivider}>
                    <View style={styles.juzLine} />
                    <Text style={styles.juzLabel}>SIPARAH {ayah.juz ?? getSurahStartJuz(surahNumber)}</Text>
                    <View style={styles.juzLine} />
                  </View>
                )}
                <Pressable
                  style={styles.ayah}
                  onPress={() => setQuranLastRead({ surah: surahNumber, ayah: index + 1 })}
                >
                  <View style={styles.ayahTop}>
                    <View style={styles.ayahNumber}><Text style={styles.ayahNumberText}>{index + 1}</Text></View>
                    <Pressable
                      style={styles.bookmarkButton}
                      onPress={() => toggleQuranBookmark({ surah: surahNumber, ayah: index + 1 })}
                      hitSlop={8}
                      accessibilityLabel="Toggle Ayah bookmark"
                    >
                      <Ionicons
                        name={quranBookmarks.some((bookmark) => bookmark.surah === surahNumber && bookmark.ayah === index + 1) ? 'bookmark' : 'bookmark-outline'}
                        size={19}
                        color={colors.primary}
                      />
                    </Pressable>
                  </View>
                  <Text style={[styles.arabicText, { fontSize: quranArabicFontSize + (largeText ? 4 : 0) }, highContrast && styles.highContrastText]} accessibilityLabel={`Arabic Ayah ${index + 1}`}>{ayah.text}</Text>
                  {quranShowTranslation && quranReadingMode !== 'mushaf' && <>
                    <Text style={styles.translationLabel}>ENGLISH</Text>
                    <Text style={[styles.translationText, { fontSize: quranTranslationFontSize + (largeText ? 3 : 0) }, highContrast && styles.highContrastText]} accessibilityLabel={`English translation Ayah ${index + 1}`}>{translation.ayahs[index]?.text}</Text>
                  </>}
                  {quranShowTranslation && quranReadingMode !== 'mushaf' && urduTranslation && (
                    <>
                      <Text style={styles.translationLabel}>اردو</Text>
                      <Text style={[styles.urduText, { fontSize: quranTranslationFontSize + 3 + (largeText ? 3 : 0) }, highContrast && styles.highContrastText]} accessibilityLabel={`Urdu translation Ayah ${index + 1}`}>{urduTranslation.ayahs[index]?.text}</Text>
                    </>
                  )}
                </Pressable>
              </View>
            );
          })}
          <Text style={styles.source}>Arabic text, English translation and Urdu translation provided by Al Quran Cloud.</Text>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
  backButton: { width: 38, height: 38, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  headerTitle: { flex: 1, alignItems: 'center' },
  headerSpacer: { width: 38 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  centered: { textAlign: 'center' },
  content: { paddingHorizontal: spacing.xl, paddingBottom: layout.tabBarSpace },
  chapterIntro: { alignItems: 'center', paddingVertical: spacing.xxl, borderBottomWidth: 1, borderBottomColor: colors.divider },
  chapterArabic: { fontSize: 30, lineHeight: 44, color: colors.primaryDark },
  chapterEnglish: { ...type.h2, marginTop: spacing.sm },
  chapterJuz: { ...type.label, color: colors.primary, marginTop: spacing.xs, marginBottom: spacing.sm },
  juzDivider: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xl },
  juzLine: { flex: 1, height: 1, backgroundColor: colors.primaryLight },
  juzLabel: { ...type.label, color: colors.primary, fontSize: 10 },
  ayah: { paddingVertical: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.divider },
  ayahTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ayahNumber: { width: 28, height: 28, borderRadius: radius.pill, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  bookmarkButton: { width: 34, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  ayahNumberText: { ...type.caption, color: colors.primaryDark, fontFamily: 'Poppins_600SemiBold' },
  arabicText: { fontSize: 24, lineHeight: 45, color: colors.text, textAlign: 'right' },
  translationLabel: { ...type.label, color: colors.primary, fontSize: 10, marginTop: spacing.lg, marginBottom: spacing.xs },
  translationText: { ...type.body, color: colors.textMuted, marginTop: spacing.lg, lineHeight: 25 },
  urduText: { fontFamily: 'Poppins_400Regular', fontSize: 19, lineHeight: 34, color: colors.text, textAlign: 'right', writingDirection: 'rtl' },
  source: { ...type.caption, textAlign: 'center', marginTop: spacing.xl },
  highContrastText: { color: '#111111' },
});