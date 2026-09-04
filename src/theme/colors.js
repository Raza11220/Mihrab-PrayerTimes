// Mihrab design tokens — the single source of truth for the app's look.
// Never hardcode a colour, radius or shadow in a screen; import from here.

export const colors = {
  // Surfaces
  background: '#FAF7F0',   // warm cream — every screen's background
  card: '#FFFFFF',         // white cards that sit on the cream
  cardMuted: '#FDFBF7',    // barely-tinted card, for nested blocks

  // Primary — olive / sage green (buttons, active tab, selected prayer)
  primary: '#7C8A50',
  primaryDark: '#5F6B3C',
  primaryLight: '#E8ECD9', // pale wash for backgrounds and chips

  // Accent — gold / amber (bells, compass needle, highlights)
  accent: '#E8A33D',
  accentDark: '#C4842A',
  accentLight: '#FDF0DC',

  // Text
  text: '#2C2C2C',         // headings and primary content
  textMuted: '#8A8A8A',    // labels, secondary info
  textFaint: '#B5B5B5',    // placeholders, disabled
  textOnPrimary: '#FFFFFF',

  // Lines
  border: '#F0EDE5',
  divider: '#F2EFE8',

  // Status
  success: '#5A9367',
  warning: '#E8A33D',
  danger: '#D9534F',
};

// Corner radius scale — the design is very rounded, so these run large.
export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

// Spacing scale. Using a scale instead of random numbers is what makes
// a layout feel consistent instead of slightly-off everywhere.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Shadows. Tinted with the brand green rather than pure black —
// that's the trick that makes soft UI look warm instead of dirty grey.
export const shadow = {
  card: {
    shadowColor: '#7C8A50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  raised: {
    shadowColor: '#7C8A50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
};

// Layout constants
export const layout = {
  tabBarHeight: 66,
  // The tab bar floats above the content, so scrolling screens must add this
  // much bottom padding — otherwise the last row hides behind it.
  tabBarSpace: 66 + 32,
};