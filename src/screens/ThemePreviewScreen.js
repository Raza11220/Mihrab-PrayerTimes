import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { type } from '../theme/typography';

const SWATCHES = [
  { name: 'primary', value: colors.primary },
  { name: 'primaryDark', value: colors.primaryDark },
  { name: 'primaryLight', value: colors.primaryLight },
  { name: 'accent', value: colors.accent },
  { name: 'accentLight', value: colors.accentLight },
  { name: 'background', value: colors.background },
];

export default function ThemePreviewScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xxl },
      ]}
    >
      <Text style={type.label}>MIHRAB</Text>
      <Text style={type.display}>Design system</Text>
      <Text style={[type.bodyMuted, { marginTop: spacing.xs }]}>
        A temporary screen to confirm fonts and colours render correctly.
      </Text>

      <View style={styles.card}>
        <Text style={type.h3}>Colours</Text>
        <View style={styles.swatchRow}>
          {SWATCHES.map((swatch) => (
            <View key={swatch.name} style={styles.swatchItem}>
              <View style={[styles.swatch, { backgroundColor: swatch.value }]} />
              <Text style={type.caption}>{swatch.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={type.h3}>Type scale</Text>
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <Text style={type.h1}>Heading one</Text>
          <Text style={type.h2}>Heading two</Text>
          <Text style={type.body}>Body text — the quick brown fox jumps over the lazy dog.</Text>
          <Text style={type.bodyMuted}>Muted body text for secondary information.</Text>
          <Text style={type.label}>LABEL TEXT</Text>
          <Text style={type.caption}>Caption text</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={type.h3}>Prayer row preview</Text>

        <View style={[styles.prayerRow, styles.prayerRowActive]}>
          <Text style={[type.h3, { color: colors.textOnPrimary }]}>Asr</Text>
          <Text style={[type.timeValue, { color: colors.textOnPrimary }]}>15:24</Text>
        </View>

        <View style={styles.prayerRow}>
          <Text style={type.h3}>Maghrib</Text>
          <Text style={type.timeValue}>18:13</Text>
        </View>
      </View>

      <Pressable style={styles.button}>
        <Text style={type.button}>Get Started</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  swatchItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  swatch: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    marginTop: spacing.md,
    backgroundColor: colors.cardMuted,
  },
  prayerRowActive: {
    backgroundColor: colors.primary,
    ...shadow.raised,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    ...shadow.raised,
  },
});