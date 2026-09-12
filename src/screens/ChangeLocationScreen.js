import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import { useAppStore } from '../store/useAppStore';
import { searchCity } from '../services/location';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { type, fonts } from '../theme/typography';

const ERRORS = {
  'too-short': 'Please type at least 3 characters.',
  'not-found':
    'No place found with that name. Try adding the country, for example “Lahore, Pakistan”.',
  'permission-denied': 'Location permission was denied, so we cannot use GPS.',
  'services-off': 'Location services are turned off on this device.',
  failed: 'Search failed. Check your connection and try again.',
};

export default function ChangeLocationScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const setLocationManually = useAppStore((state) => state.setLocationManually);
  const loadDeviceLocation = useAppStore((state) => state.loadDeviceLocation);
  const locationStatus = useAppStore((state) => state.locationStatus);
  const currentLocation = useAppStore((state) => state.location);
  const savedLocations = useAppStore((state) => state.savedLocations);
  const saveLocation = useAppStore((state) => state.saveLocation);

  const gpsBusy = locationStatus === 'loading';

  const handleSearch = async () => {
    Keyboard.dismiss();
    setError(null);
    setResult(null);

    if (query.trim().length < 3) {
      setError('too-short');
      return;
    }

    setSearching(true);

    const outcome = await searchCity(query);

    if (outcome.ok) {
      setResult(outcome.location);
    } else {
      setError(outcome.reason);
    }

    setSearching(false);
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    if (error) setError(null);
    if (result) setResult(null);
  };

  const handleConfirm = () => {
    setLocationManually(result);
    saveLocation(result);
    navigation.goBack();
  };

  const handleUseGps = async () => {
    setError(null);
    setResult(null);

    const outcome = await loadDeviceLocation();

    // Only dismiss the modal if we actually got a location.
    if (outcome.ok) {
      saveLocation(outcome.location);
      navigation.goBack();
    } else {
      setError(outcome.reason);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={type.h2}>Change Location</Text>

        <Pressable
          style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
      </View>

      <Text style={[type.bodyMuted, styles.intro]}>
        Search for your city to get prayer times for that position.
      </Text>

      {savedLocations.length > 0 && (
        <View style={styles.savedSection}>
          <Text style={styles.savedLabel}>SAVED LOCATIONS</Text>
          {savedLocations.map((item) => (
            <Pressable
              key={`${item.city}-${item.country}`}
              style={styles.savedRow}
              onPress={() => { setLocationManually(item); navigation.goBack(); }}
            >
              <Ionicons name={currentLocation?.city === item.city ? 'checkmark-circle' : 'location-outline'} size={19} color={colors.primary} />
              <Text style={styles.savedText}>{[item.city, item.country].filter(Boolean).join(', ')}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.searchRow}>
        <View style={styles.inputWrap}>
          <Ionicons name="search" size={18} color={colors.textFaint} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={handleQueryChange}
            placeholder="City name"
            placeholderTextColor={colors.textFaint}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            maxLength={80}
            accessibilityLabel="City name"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textFaint} />
            </Pressable>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [styles.searchButton, pressed && styles.searchButtonPressed]}
          onPress={handleSearch}
          disabled={searching}
        >
          {searching ? (
            <ActivityIndicator size="small" color={colors.textOnPrimary} />
          ) : (
            <Ionicons name="arrow-forward" size={20} color={colors.textOnPrimary} />
          )}
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
          <Text style={styles.errorText}>{ERRORS[error] ?? ERRORS.failed}</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultMark}>
            <Ionicons name="location" size={20} color={colors.textOnPrimary} />
          </View>

          <View style={styles.resultText}>
            <Text style={styles.resultLabel}>FOUND LOCATION</Text>
            <Text style={type.h3} numberOfLines={1}>
              {result.city}
            </Text>
            <Text style={type.caption}>
              {[result.country, `${result.latitude.toFixed(3)}, ${result.longitude.toFixed(3)}`]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </View>
        </View>
      )}

      {result && (
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          onPress={handleConfirm}
        >
          <Text style={type.button}>Use {result.city}</Text>
        </Pressable>
      )}

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={type.caption}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <Pressable
        style={({ pressed }) => [styles.ghostButton, pressed && styles.ghostButtonPressed]}
        onPress={handleUseGps}
        disabled={gpsBusy}
      >
        {gpsBusy ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="navigate" size={18} color={colors.primary} />
        )}
        <Text style={styles.ghostButtonText}>Use my current location</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  closeButtonPressed: {
    backgroundColor: colors.border,
  },
  intro: {
    marginTop: spacing.sm,
  },
  savedSection: { marginTop: spacing.xl, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.card, ...shadow.card },
  savedLabel: { ...type.label, color: colors.primary, fontSize: 10, marginBottom: spacing.xs },
  savedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider },
  savedText: { ...type.body, flex: 1 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    ...shadow.card,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    // Android adds its own vertical padding to TextInput; zeroing it keeps the
    // text optically centred inside the pill.
    paddingVertical: 0,
  },
  searchButton: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  searchButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#FCEDEC',
  },
  errorText: {
    ...type.caption,
    flex: 1,
    color: colors.danger,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    ...shadow.card,
  },
  resultMark: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    flex: 1,
  },
  resultLabel: {
    ...type.label,
    color: colors.primary,
    fontSize: 10,
    marginBottom: 2,
  },
  primaryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadow.card,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  ghostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghostButtonPressed: {
    backgroundColor: colors.primaryLight,
  },
  ghostButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.primary,
  },
});