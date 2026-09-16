import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Share,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';

import ScreenContainer from '../components/ScreenContainer';
import { useAppStore } from '../store/useAppStore';
import { colors, radius, spacing, shadow, layout } from '../theme/colors';
import { type } from '../theme/typography';

export default function BackupScreen() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const exportBackup = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const entries = await AsyncStorage.multiGet(allKeys);
      const data = Object.fromEntries(entries.map(([k, v]) => [k, v]));
      const json = JSON.stringify({ version: 1, timestamp: Date.now(), data }, null, 2);

      const result = await Share.share({
        message: json,
        title: 'Mihrab Backup',
        dialogTitle: 'Share Mihrab Backup',
      });

      if (result.dismissedAction) {
        await Clipboard.setString(json);
        setMessage('Backup copied to clipboard (share dismissed).');
      }
    } catch (error) {
      setMessage('Backup failed. Check your storage and try again.');
    } finally {
      setBusy(false);
    }
  };

  const importBackup = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const text = await Clipboard.getString();
      if (!text) {
        setMessage('Paste your backup JSON first, then try again.');
        setBusy(false);
        return;
      }

      const backup = JSON.parse(text);

      if (!backup || !backup.data || typeof backup.data !== 'object') {
        setMessage('Invalid backup format. Please paste a valid Mihrab backup.');
        setBusy(false);
        return;
      }

      const entries = Object.entries(backup.data);
      await AsyncStorage.multiSet(entries);

      Alert.alert('Restore complete', 'Your data has been restored.', [
        { text: 'OK', onPress: () => {} },
      ]);
    } catch (error) {
      setMessage('Import failed. Paste a valid JSON backup and try again.');
    } finally {
      setBusy(false);
    }
  };

  const resetStore = () => {
    Alert.alert('Reset all data', 'This will clear all your saved data including bookmarks, locations, and settings.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          const store = useAppStore.getState();
          store.resetAll();
          setMessage('All data has been reset.');
        },
      },
    ]);
  };

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={type.label}>PROTECT</Text>
        <Text style={type.h1}>Backup & Restore</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.infoText}>
              Backups include your locations, bookmarks, settings, reading progress,
              and cached prayer times. They are stored as JSON files on your device.
            </Text>
          </View>
        </View>

        <Pressable style={styles.actionCard} onPress={exportBackup} disabled={busy}>
          <View style={styles.iconWrap}>
            <Ionicons name="download-outline" size={20} color={colors.textOnPrimary} />
          </View>
          <View style={styles.textWrap}>
            <Text style={type.h3}>Export Backup</Text>
            <Text style={type.caption}>Share a copy of your data</Text>
          </View>
          {busy && <ActivityIndicator size="small" color={colors.textOnPrimary} />}
        </Pressable>

        <Pressable style={styles.actionCard} onPress={importBackup} disabled={busy}>
          <View style={[styles.iconWrap, { backgroundColor: colors.accentDark }]}>
            <Ionicons name="upload-outline" size={20} color={colors.textOnPrimary} />
          </View>
          <View style={styles.textWrap}>
            <Text style={type.h3}>Import Backup</Text>
            <Text style={type.caption}>Restore from a shared file</Text>
          </View>
          {busy && <ActivityIndicator size="small" color={colors.textOnPrimary} />}
        </Pressable>

        <View style={styles.divider} />

        <Pressable style={styles.dangerCard} onPress={resetStore}>
          <View style={styles.iconWrap}>
            <Ionicons name="trash-outline" size={20} color={colors.textOnPrimary} />
          </View>
          <View style={styles.textWrap}>
            <Text style={type.h3}>Clear All Data</Text>
            <Text style={type.caption}>Reset settings, bookmarks, and locations</Text>
          </View>
        </Pressable>

        {message && (
          <Text style={[type.caption, styles.message, message.includes('fail') || message.includes('only') ? styles.messageError : styles.messageSuccess]}>
            {message}
          </Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: layout.tabBarSpace },
  infoCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    ...shadow.card,
  },
  infoRow: { flexDirection: 'row', gap: spacing.sm },
  infoText: { ...type.bodyMuted, flex: 1, marginTop: 2 },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    ...shadow.card,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  dangerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.danger,
    ...shadow.card,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  message: { textAlign: 'center', marginTop: spacing.md },
  messageSuccess: { color: colors.success },
  messageError: { color: colors.danger },
});
