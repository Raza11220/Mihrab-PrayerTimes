import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/colors';

/**
 * The base wrapper every screen sits inside.
 * Handles the cream background, the status-bar gap, and side padding
 * so individual screens don't repeat that boilerplate.
 */
export default function ScreenContainer({ children, style, padded = true }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + spacing.md },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  padded: {
    paddingHorizontal: spacing.xl,
  },
});