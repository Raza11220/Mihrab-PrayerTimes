import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import { searchQuran } from '../services/quranApi';
import { colors, layout, radius, shadow, spacing } from '../theme/colors';
import { type } from '../theme/typography';

const EDITIONS = [
  { id: 'en.asad', label: 'English' },
  { id: 'ur.jalandhry', label: 'Urdu' },
  { id: 'quran-uthmani', label: 'Arabic' },
];

export default function QuranSearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [edition, setEdition] = useState('en.asad');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');

  const submitSearch = async () => {
    if (query.trim().length < 2) return;
    setStatus('loading');
    const result = await searchQuran(query.trim(), edition);
    if (result.ok) { setResults(result.data.matches ?? []); setStatus('ready'); } else setStatus('error');
  };

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}><Pressable onPress={() => navigation.goBack()} hitSlop={8}><Ionicons name="arrow-back" size={21} color={colors.text} /></Pressable><Text style={type.h2}>Search Quran</Text><View style={styles.spacer} /></View>
        <View style={styles.searchBox}><Ionicons name="search" size={18} color={colors.textFaint} /><TextInput value={query} onChangeText={setQuery} onSubmitEditing={submitSearch} placeholder="Search Arabic, Urdu or English" placeholderTextColor={colors.textFaint} style={styles.input} returnKeyType="search" /><Pressable onPress={submitSearch} hitSlop={8}><Ionicons name="arrow-forward-circle" size={23} color={colors.primary} /></Pressable></View>
        <View style={styles.filters}>{EDITIONS.map((item) => <Pressable key={item.id} style={[styles.filter, item.id === edition && styles.filterActive]} onPress={() => setEdition(item.id)}><Text style={item.id === edition ? styles.filterTextActive : styles.filterText}>{item.label}</Text></Pressable>)}</View>
        {status === 'loading' && <View style={styles.state}><ActivityIndicator color={colors.primary} /><Text style={type.bodyMuted}>Searching the Quran...</Text></View>}
        {status === 'error' && <View style={styles.state}><Text style={type.bodyMuted}>Search is unavailable. Check your connection and try again.</Text></View>}
        {status === 'ready' && results.map((match) => <Pressable key={`${match.surah.number}:${match.numberInSurah}`} style={styles.result} onPress={() => navigation.navigate('QuranReader', { surah: match.surah.number, ayah: match.numberInSurah })}><View style={styles.badge}><Text style={styles.badgeText}>{match.surah.number}:{match.numberInSurah}</Text></View><View style={styles.resultCopy}><Text style={type.h3}>{match.surah.englishName}</Text><Text style={styles.resultText}>{match.text}</Text></View><Ionicons name="chevron-forward" size={17} color={colors.textFaint} /></Pressable>)}
        {status === 'ready' && results.length === 0 && <Text style={[type.bodyMuted, styles.empty]}>No Ayahs matched your search.</Text>}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: layout.tabBarSpace },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: spacing.lg },
  spacer: { width: 21 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 54, paddingHorizontal: spacing.lg, borderRadius: radius.pill, backgroundColor: colors.card, ...shadow.card },
  input: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.text, paddingVertical: 0 },
  filters: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  filter: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.pill, backgroundColor: colors.cardMuted },
  filterActive: { backgroundColor: colors.primary },
  filterText: { ...type.caption, color: colors.textMuted },
  filterTextActive: { ...type.caption, color: colors.textOnPrimary, fontFamily: 'Poppins_600SemiBold' },
  state: { alignItems: 'center', gap: spacing.md, marginTop: spacing.xl, padding: spacing.xl },
  result: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.divider },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.primaryLight },
  badgeText: { ...type.caption, color: colors.primaryDark },
  resultCopy: { flex: 1 },
  resultText: { ...type.bodyMuted, marginTop: spacing.xs },
  empty: { textAlign: 'center', paddingVertical: spacing.xl },
});
