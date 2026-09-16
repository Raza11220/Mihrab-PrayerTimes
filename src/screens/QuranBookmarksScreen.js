import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import { useAppStore } from '../store/useAppStore';
import { colors, radius, spacing, shadow, layout } from '../theme/colors';
import { type, fonts } from '../theme/typography';

export default function QuranBookmarksScreen({ navigation }) {
  const quranBookmarks = useAppStore((state) => state.quranBookmarks);
  const quranBookmarkFolders = useAppStore((state) => state.quranBookmarkFolders);
  const toggleQuranBookmark = useAppStore((state) => state.toggleQuranBookmark);
  const setQuranBookmarkNote = useAppStore((state) => state.setQuranBookmarkNote);
  const addQuranBookmarkFolder = useAppStore((state) => state.addQuranBookmarkFolder);
  const [activeFolder, setActiveFolder] = useState('Favorites');
  const [noteInput, setNoteInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showAddFolder, setShowAddFolder] = useState(false);

  const bookmarksInFolder = quranBookmarks.filter(
    (b) => b.folder === activeFolder
  );

  const handleSaveNote = () => {
    if (!editingId || !noteInput.trim()) return;
    setQuranBookmarkNote(editingId, noteInput.trim());
    setNoteInput('');
    setEditingId(null);
  };

  const handleDeleteBookmark = (bookmark) => {
    Alert.alert('Delete bookmark', `Remove ${bookmark.surah}:${bookmark.ayah}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => toggleQuranBookmark({ surah: bookmark.surah, ayah: bookmark.ayah, folder: bookmark.folder }),
      },
    ]);
  };

  const handleAddFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;
    addQuranBookmarkFolder(name);
    setNewFolderName('');
    setShowAddFolder(false);
    setActiveFolder(name);
  };

  const handleDeleteFolder = (folder) => {
    Alert.alert('Delete folder', `Delete "${folder}" and all its bookmarks?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const toRemove = quranBookmarks.filter((b) => b.folder === folder);
          toRemove.forEach((b) =>
            toggleQuranBookmark({ surah: b.surah, ayah: b.ayah, folder: b.folder })
          );
          if (activeFolder === folder) setActiveFolder('Favorites');
        },
      },
    ]);
  };

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={type.label}>SAVED</Text>
        <Text style={type.h1}>Bookmarks</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.folderRow}
        >
          {quranBookmarkFolders.map((folder) => (
            <Pressable
              key={folder}
              style={[
                styles.folderChip,
                activeFolder === folder && styles.folderChipActive,
              ]}
              onPress={() => setActiveFolder(folder)}
            >
              <Text
                style={[
                  styles.folderText,
                  activeFolder === folder && styles.folderTextActive,
                ]}
              >
                {folder}
              </Text>
              {quranBookmarkFolders.length > 1 && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder);
                  }}
                  hitSlop={6}
                  style={styles.folderDelete}
                >
                  <Ionicons name="close" size={13} color={colors.textFaint} />
                </Pressable>
              )}
            </Pressable>
          ))}
          <Pressable
            style={styles.addFolderChip}
            onPress={() => setShowAddFolder((v) => !v)}
          >
            <Ionicons name="add" size={15} color={colors.primary} />
          </Pressable>
        </ScrollView>

        {showAddFolder && (
          <View style={styles.addFolderRow}>
            <TextInput
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="Folder name"
              placeholderTextColor={colors.textFaint}
              style={styles.folderInput}
              onSubmitEditing={handleAddFolder}
            />
            <Pressable style={styles.folderConfirm} onPress={handleAddFolder}>
              <Ionicons name="checkmark" size={18} color={colors.textOnPrimary} />
            </Pressable>
          </View>
        )}

        <Text style={[type.caption, styles.count]}>
          {bookmarksInFolder.length} bookmark{bookmarksInFolder.length !== 1 ? 's' : ''}
        </Text>

        {bookmarksInFolder.length === 0 && (
          <View style={styles.emptyCard}>
            <Ionicons name="bookmark-outline" size={32} color={colors.textFaint} />
            <Text style={[type.bodyMuted, styles.centered]}>
              No bookmarks in this folder yet
            </Text>
          </View>
        )}

        {bookmarksInFolder.map((bookmark) => (
          <View key={bookmark.id} style={styles.bookmarkCard}>
            <Pressable
              style={styles.bookmarkHeader}
              onPress={() => navigation.navigate('QuranReader', { surah: bookmark.surah, ayah: bookmark.ayah })}
              hitSlop={4}
            >
              <View style={styles.bookmarkBadge}>
                <Text style={styles.bookmarkBadgeText}>
                  {bookmark.surah}:{bookmark.ayah}
                </Text>
              </View>
              <View style={styles.bookmarkInfo}>
                <Text style={type.h3}>Surah {bookmark.surah}</Text>
                <Text style={type.caption}>Ayah {bookmark.ayah}</Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color={colors.textFaint} />
            </Pressable>

            {bookmark.note ? (
              <Text style={styles.noteText}>{bookmark.note}</Text>
            ) : editingId === bookmark.id ? (
              <View style={styles.noteEditor}>
                <TextInput
                  value={noteInput}
                  onChangeText={setNoteInput}
                  placeholder="Add a note"
                  placeholderTextColor={colors.textFaint}
                  style={styles.noteInput}
                  multiline
                />
                <View style={styles.noteActions}>
                  <Pressable style={styles.noteCancel} onPress={() => { setEditingId(null); setNoteInput(''); }}>
                    <Text style={styles.noteCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={styles.noteSave}
                    onPress={handleSaveNote}
                    disabled={!noteInput.trim()}
                  >
                    <Text style={type.button}>Save</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                style={styles.notePlaceholder}
                onPress={() => {
                  setEditingId(bookmark.id);
                  setNoteInput(bookmark.note || '');
                }}
                hitSlop={4}
              >
                <Ionicons name="add" size={14} color={colors.primary} />
                <Text style={styles.notePlaceholderText}>Tap to add note</Text>
              </Pressable>
            )}

            <Pressable
              style={styles.deleteButton}
              onPress={() => handleDeleteBookmark(bookmark)}
              hitSlop={6}
            >
              <Ionicons name="trash-outline" size={15} color={colors.danger} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: layout.tabBarSpace },
  centered: { textAlign: 'center' },
  folderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  folderChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  folderText: { ...type.body, color: colors.text },
  folderTextActive: { ...type.body, color: colors.primaryDark, fontFamily: fonts.semibold },
  folderDelete: { padding: 2 },
  addFolderChip: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFolderRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  folderInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    ...shadow.card,
    ...type.body,
  },
  folderConfirm: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: { marginTop: spacing.sm, marginBottom: spacing.md },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xxl,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    ...shadow.card,
  },
  bookmarkCard: {
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bookmarkBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
  },
  bookmarkBadgeText: {
    ...type.caption,
    color: colors.primaryDark,
    fontFamily: fonts.semibold,
  },
  bookmarkInfo: { flex: 1 },
  noteText: {
    ...type.bodyMuted,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  noteEditor: { marginTop: spacing.md },
  noteInput: {
    ...type.body,
    height: 70,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.cardMuted,
    textAlignVertical: 'top',
  },
  noteActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    justifyContent: 'flex-end',
  },
  noteCancel: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  noteCancelText: { ...type.body, color: colors.textMuted },
  noteSave: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  notePlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  notePlaceholderText: { ...type.caption, color: colors.primary },
  deleteButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    padding: spacing.sm,
  },
});
