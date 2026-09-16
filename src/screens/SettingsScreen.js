import { Text } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { type } from '../theme/typography';
import { Alert, ScrollView, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppStore, CALCULATION_METHODS, ASR_SCHOOLS } from '../store/useAppStore';
import { QURAN_RECITERS } from '../services/quranApi';
import { colors, radius, spacing, shadow, layout } from '../theme/colors';

function SettingRow({ icon, label, value, onPress, danger = false }) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={19} color={danger ? colors.danger : colors.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={[type.body, danger && styles.dangerText]}>{label}</Text>
        {value && <Text style={type.caption} numberOfLines={2}>{value}</Text>}
      </View>
      {!danger && <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />}
    </Pressable>
  );
}

export default function SettingsScreen({ navigation }) {
  const location = useAppStore((state) => state.location);
  const method = useAppStore((state) => state.method);
  const school = useAppStore((state) => state.school);
  const timeFormat = useAppStore((state) => state.timeFormat);
  const setMethod = useAppStore((state) => state.setMethod);
  const setSchool = useAppStore((state) => state.setSchool);
  const setTimeFormat = useAppStore((state) => state.setTimeFormat);
  const resetAll = useAppStore((state) => state.resetAll);
  const quranArabicFontSize = useAppStore((state) => state.quranArabicFontSize);
  const quranTranslationFontSize = useAppStore((state) => state.quranTranslationFontSize);
  const quranShowTranslation = useAppStore((state) => state.quranShowTranslation);
  const quranReadingMode = useAppStore((state) => state.quranReadingMode);
  const darkMode = useAppStore((state) => state.darkMode);
  const travelMode = useAppStore((state) => state.travelMode);
  const notificationsEnabled = useAppStore((state) => state.notificationsEnabled);
  const savedLocations = useAppStore((state) => state.savedLocations);
  const quranReciter = useAppStore((state) => state.quranReciter);
  const setQuranReciter = useAppStore((state) => state.setQuranReciter);
  const setQuranReadingSettings = useAppStore((state) => state.setQuranReadingSettings);
  const setTravelMode = useAppStore((state) => state.setTravelMode);
  const setNotificationsEnabled = useAppStore((state) => state.setNotificationsEnabled);
  const saveLocation = useAppStore((state) => state.saveLocation);
  const language = useAppStore((state) => state.language);
  const largeText = useAppStore((state) => state.largeText);
  const highContrast = useAppStore((state) => state.highContrast);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const setAccessibility = useAppStore((state) => state.setAccessibility);

  const currentMethod = CALCULATION_METHODS.find((item) => item.id === method);
  const currentSchool = ASR_SCHOOLS.find((item) => item.id === school);
  const locationLabel = location ? [location.city, location.country].filter(Boolean).join(', ') : 'Not set';

  const cycleMethod = () => {
    const index = CALCULATION_METHODS.findIndex((item) => item.id === method);
    setMethod(CALCULATION_METHODS[(index + 1) % CALCULATION_METHODS.length].id);
  };

  const confirmReset = () => Alert.alert('Reset Mihrab?', 'This clears your location, settings and cached prayer times.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Reset', style: 'destructive', onPress: resetAll },
  ]);

  const cycleArabicSize = () => setQuranReadingSettings({ quranArabicFontSize: quranArabicFontSize >= 30 ? 22 : quranArabicFontSize + 2 });
  const cycleTranslationSize = () => setQuranReadingSettings({ quranTranslationFontSize: quranTranslationFontSize >= 19 ? 14 : quranTranslationFontSize + 1 });
  const toggleReadingMode = () => setQuranReadingSettings({ quranReadingMode: quranReadingMode === 'mushaf' ? 'translation' : 'mushaf' });
  const toggleTranslation = () => setQuranReadingSettings({ quranShowTranslation: !quranShowTranslation });
  const cycleReciter = () => {
    const index = QURAN_RECITERS.findIndex((item) => item.id === quranReciter);
    setQuranReciter(QURAN_RECITERS[(index + 1) % QURAN_RECITERS.length].id);
  };
  const cycleLanguage = () => {
    const languages = ['en', 'ur', 'ar', 'roman-ur'];
    setLanguage(languages[(languages.indexOf(language) + 1) % languages.length]);
  };

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={type.label}>PERSONALISE YOUR EXPERIENCE</Text>
        <Text style={type.h1}>Settings</Text>

        <Text style={styles.sectionLabel}>LOCATION</Text>
        <View style={styles.card}>
          <SettingRow icon="location-outline" label="Prayer location" value={locationLabel} onPress={() => navigation.navigate('ChangeLocation')} />
        </View>

        <Text style={styles.sectionLabel}>PRAYER CALCULATION</Text>
        <View style={styles.card}>
          <SettingRow icon="calculator-outline" label="Calculation method" value={currentMethod?.label} onPress={cycleMethod} />
          <View style={styles.divider} />
          <SettingRow icon="time-outline" label="Asr calculation" value={currentSchool?.label} onPress={() => setSchool(school === 0 ? 1 : 0)} />
        </View>

        <Text style={styles.sectionLabel}>DISPLAY</Text>
        <View style={styles.card}>
          <SettingRow icon="phone-portrait-outline" label="Time format" value={timeFormat === '12h' ? '12-hour clock' : '24-hour clock'} onPress={() => setTimeFormat(timeFormat === '12h' ? '24h' : '12h')} />
          <View style={styles.divider} />
          <SettingRow icon="language-outline" label="App language" value={{ en: 'English', ur: 'Urdu', ar: 'Arabic', 'roman-ur': 'Roman Urdu' }[language]} onPress={cycleLanguage} />
          <View style={styles.divider} />
          <SettingRow icon="text-outline" label="Large text mode" value={largeText ? 'On' : 'Off'} onPress={() => setAccessibility({ largeText: !largeText })} />
          <View style={styles.divider} />
          <SettingRow icon="contrast-outline" label="High contrast" value={highContrast ? 'On' : 'Off'} onPress={() => setAccessibility({ highContrast: !highContrast })} />
        </View>

        <Text style={styles.sectionLabel}>PRIVACY & ACCOUNT</Text>
        <View style={styles.card}>
          <SettingRow icon="shield-checkmark-outline" label="Privacy & permissions" value="Local-first storage · review access" onPress={() => Alert.alert('Privacy & permissions', 'Mihrab stores your settings, bookmarks, reading progress and locations locally on this device. Location, notifications and compass access are only used for features you enable. No analytics or advertising trackers are configured.')} />
          <View style={styles.divider} />
          <SettingRow icon="cloud-outline" label="Account & sync" value="Optional · not connected" onPress={() => Alert.alert('Account & sync', 'Your app works without an account. Cloud bookmark sync and device backup can be connected later without changing your local data.')} />
        </View>

        <Text style={styles.sectionLabel}>QURAN READING</Text>
        <View style={styles.card}>
          <SettingRow icon="text-outline" label="Arabic font size" value={`${quranArabicFontSize}px`} onPress={cycleArabicSize} />
          <View style={styles.divider} />
          <SettingRow icon="language-outline" label="Translation font size" value={`${quranTranslationFontSize}px`} onPress={cycleTranslationSize} />
          <View style={styles.divider} />
          <SettingRow icon="chatbox-ellipses-outline" label="Translations" value={quranShowTranslation ? 'English and Urdu on' : 'Hidden'} onPress={toggleTranslation} />
          <View style={styles.divider} />
          <SettingRow icon="book-outline" label="Reading mode" value={quranReadingMode === 'mushaf' ? 'Mushaf only' : 'Arabic with translations'} onPress={toggleReadingMode} />
          <View style={styles.divider} />
          <SettingRow icon="headset-outline" label="Default reciter" value={QURAN_RECITERS.find((item) => item.id === quranReciter)?.label} onPress={cycleReciter} />
          <View style={styles.divider} />
          <SettingRow icon="moon-outline" label="Dark mode" value={darkMode ? 'On' : 'Off'} onPress={() => setQuranReadingSettings({ darkMode: !darkMode })} />
        </View>

        <Text style={styles.sectionLabel}>PRAYER & TRAVEL</Text>
        <View style={styles.card}>
          <SettingRow icon="notifications-outline" label="Prayer notifications" value={notificationsEnabled ? 'Enabled' : 'Disabled'} onPress={() => setNotificationsEnabled(!notificationsEnabled)} />
          <View style={styles.divider} />
          <SettingRow icon="airplane-outline" label="Travel mode" value={travelMode ? 'On' : 'Off'} onPress={() => setTravelMode(!travelMode)} />
          <View style={styles.divider} />
          <SettingRow icon="bookmark-outline" label="Save current location" value={savedLocations.length ? `${savedLocations.length} saved` : 'None saved'} onPress={() => location && saveLocation(location)} />
        </View>

        <Text style={styles.sectionLabel}>APP</Text>
        <View style={styles.card}>
          <SettingRow icon="refresh-outline" label="Reset app data" danger onPress={confirmReset} />
          <View style={styles.divider} />
          <SettingRow icon="cloud-outline" label="Backup & Restore" value="Export or import data" onPress={() => navigation.navigate('Backup')} />
          <View style={styles.divider} />
          <SettingRow icon="information-circle-outline" label="About" value="Version, license, and credits" onPress={() => navigation.navigate('About')} />
        </View>

        <Text style={[type.caption, styles.hint]}>Tap a setting to cycle through its available options.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: layout.tabBarSpace },
  sectionLabel: { ...type.label, marginTop: spacing.xxl, marginBottom: spacing.sm, color: colors.primary },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: spacing.lg, ...shadow.card },
  row: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowPressed: { opacity: 0.65 },
  iconWrap: { width: 38, height: 38, borderRadius: radius.pill, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: spacing.xs },
  divider: { height: 1, backgroundColor: colors.divider },
  dangerText: { color: colors.danger },
  hint: { textAlign: 'center', marginTop: spacing.xl },
});