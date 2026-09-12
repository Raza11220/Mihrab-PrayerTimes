import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { getSurahAudioUrl, QURAN_RECITERS } from '../services/quranApi';
import { useAppStore } from '../store/useAppStore';
import { colors, radius, shadow, spacing } from '../theme/colors';
import { type } from '../theme/typography';

function formatTime(seconds) {
  const value = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(value / 60);
  const remainingSeconds = value % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function QuranAudioPlayer({ surahNumber, surahName }) {
  const reciter = useAppStore((state) => state.quranReciter);
  const setQuranReciter = useAppStore((state) => state.setQuranReciter);
  const [showReciters, setShowReciters] = useState(false);
  const audioUrl = getSurahAudioUrl(surahNumber, reciter);
  const player = useAudioPlayer(audioUrl, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);
  const progress = status.duration > 0 ? Math.min(status.currentTime / status.duration, 1) : 0;
  const reciterLabel = QURAN_RECITERS.find((item) => item.id === reciter)?.label ?? 'Mishary Alafasy';

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => {});

    return () => {
      player.clearLockScreenControls();
    };
  }, [player]);

  const togglePlayback = async () => {
    if (status.playing) {
      player.pause();
      return;
    }

    try {
      player.setActiveForLockScreen(true, {
        title: surahName,
        artist: 'Mishary Rashid Alafasy',
        albumTitle: 'The Holy Quran',
      });
      player.play();
    } catch {
      // The status error below gives the user a retry path.
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="headset-outline" size={20} color={colors.textOnPrimary} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.label}>LISTEN TO THIS SURAH</Text>
          <Text style={styles.title}>{reciterLabel}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}
          onPress={togglePlayback}
          disabled={status.isBuffering}
          accessibilityLabel={status.playing ? `Pause ${surahName}` : `Play ${surahName}`}
        >
          {status.isBuffering ? (
            <ActivityIndicator size="small" color={colors.textOnPrimary} />
          ) : (
            <Ionicons name={status.playing ? 'pause' : 'play'} size={19} color={colors.textOnPrimary} />
          )}
        </Pressable>
      </View>

      <Pressable style={styles.reciterPicker} onPress={() => setShowReciters((value) => !value)}>
        <Ionicons name="options-outline" size={15} color={colors.primary} />
        <Text style={styles.reciterPickerText}>Choose reciter</Text>
        <Ionicons name={showReciters ? 'chevron-up' : 'chevron-down'} size={15} color={colors.textMuted} />
      </Pressable>

      {showReciters && (
        <View style={styles.reciterList}>
          {QURAN_RECITERS.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.reciterOption, item.id === reciter && styles.reciterOptionActive]}
              onPress={() => {
                setQuranReciter(item.id);
                setShowReciters(false);
              }}
            >
              <Text style={item.id === reciter ? styles.reciterOptionTextActive : styles.reciterOptionText}>{item.label}</Text>
              {item.id === reciter && <Ionicons name="checkmark" size={16} color={colors.primary} />}
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.progressTrack}>
        <View style={[styles.progress, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.timeRow}>
        <Text style={styles.time}>{formatTime(status.currentTime)}</Text>
        <Text style={styles.time}>{formatTime(status.duration)}</Text>
      </View>

      {status.error && <Text style={styles.error}>Audio could not be loaded. Check your connection and try again.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: spacing.xl, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.card, ...shadow.card },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  label: { ...type.label, color: colors.primary, fontSize: 10 },
  title: { ...type.h3, marginTop: 2 },
  playButton: { width: 42, height: 42, borderRadius: radius.pill, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
  reciterPicker: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.xs, marginTop: spacing.md },
  reciterPickerText: { ...type.caption, color: colors.primary },
  reciterList: { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.divider },
  reciterOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  reciterOptionActive: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, borderRadius: radius.sm },
  reciterOptionText: { ...type.caption, color: colors.textMuted },
  reciterOptionTextActive: { ...type.caption, color: colors.primaryDark, fontFamily: 'Poppins_600SemiBold' },
  progressTrack: { height: 5, marginTop: spacing.lg, overflow: 'hidden', borderRadius: radius.pill, backgroundColor: colors.primaryLight },
  progress: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.accent },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  time: { ...type.caption, fontVariant: ['tabular-nums'] },
  error: { ...type.caption, color: colors.danger, marginTop: spacing.sm },
});
