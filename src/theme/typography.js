import { colors } from './colors';

// These strings must match the font names we load in App.js exactly.
export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

// Ready-made text styles. In a screen you write:
//   <Text style={type.h2}>Prayer Times</Text>
// instead of repeating fontFamily + fontSize + color every time.
export const type = {
  display: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 42, color: colors.text },
  h1: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 34, color: colors.text },
  h2: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 28, color: colors.text },
  h3: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 24, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.text },
  bodyMuted: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.textMuted },
  label: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.textMuted },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: colors.textMuted },
  button: { fontFamily: fonts.semibold, fontSize: 16, color: colors.textOnPrimary },

  // The prayer time value on the right of each row — tabular-ish, prominent.
  timeValue: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
};