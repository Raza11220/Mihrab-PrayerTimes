import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import { colors, layout, radius, spacing } from '../theme/colors';
import { type } from '../theme/typography';

const JUZ = Array.from({ length: 30 }, (_, index) => index + 1);

export default function JuzDirectoryScreen({ navigation }) {
  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}><Pressable onPress={() => navigation.goBack()} hitSlop={8}><Ionicons name="arrow-back" size={21} color={colors.text} /></Pressable><Text style={type.h2}>Siparah directory</Text><View style={styles.spacer} /></View>
        <Text style={[type.bodyMuted, styles.intro]}>Browse the 30 parts of the Quran by Siparah.</Text>
        <View style={styles.grid}>{JUZ.map((juz) => <Pressable key={juz} style={({ pressed }) => [styles.item, pressed && styles.pressed]} onPress={() => navigation.navigate('QuranHome')}><Text style={styles.number}>{juz}</Text><Text style={styles.label}>Siparah {juz}</Text><Ionicons name="chevron-forward" size={16} color={colors.textFaint} /></Pressable>)}</View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: layout.tabBarSpace },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: spacing.lg },
  spacer: { width: 21 },
  intro: { marginBottom: spacing.xl },
  grid: { gap: spacing.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.divider },
  pressed: { opacity: 0.65 },
  number: { width: 34, height: 34, borderRadius: radius.pill, textAlign: 'center', textAlignVertical: 'center', backgroundColor: colors.primaryLight, color: colors.primaryDark, fontFamily: 'Poppins_600SemiBold', paddingTop: 8 },
  label: { ...type.body, flex: 1 },
});
