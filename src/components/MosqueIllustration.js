import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';

/**
 * Geometric mosque built from SVG primitives — scales to any size and picks up
 * its colours from the theme, so there's no bitmap asset to maintain.
 */
export default function MosqueIllustration({ width = 260, height = 216 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 240 200">
      <Defs>
        <LinearGradient id="domeGold" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.accent} />
          <Stop offset="1" stopColor={colors.accentDark} />
        </LinearGradient>
      </Defs>

      {/* Soft halo that gives the illustration its calm, rounded feel */}
      <Circle cx="120" cy="108" r="92" fill={colors.primaryLight} opacity="0.55" />

      {/* Minarets */}
      <Rect x="42" y="92" width="16" height="84" rx="6" fill={colors.primary} />
      <Path d="M42,92 Q50,70 58,92 Z" fill="url(#domeGold)" />
      <Rect x="182" y="92" width="16" height="84" rx="6" fill={colors.primary} />
      <Path d="M182,92 Q190,70 198,92 Z" fill="url(#domeGold)" />

      {/* Main prayer hall */}
      <Rect x="70" y="112" width="100" height="64" rx="6" fill={colors.primary} />

      {/* Onion dome */}
      <Path
        d="M78,112 C78,80 96,58 120,52 C144,58 162,80 162,112 Z"
        fill="url(#domeGold)"
      />

      {/* Spire and crescent */}
      <Rect x="118" y="42" width="4" height="14" rx="2" fill={colors.accentDark} />
      <Path d="M120,18 A10,10 0 1,0 120,38 A8,8 0 1,1 120,18 Z" fill={colors.accentDark} />

      {/* Arched doorway — this is the mihrab the app is named after */}
      <Path d="M105,176 L105,146 Q120,128 135,146 L135,176 Z" fill={colors.primaryDark} />

      {/* Side windows */}
      <Path d="M84,150 L84,140 Q90,132 96,140 L96,150 Z" fill={colors.primaryDark} />
      <Path d="M144,150 L144,140 Q150,132 156,140 L156,150 Z" fill={colors.primaryDark} />

      {/* Ground line */}
      <Rect x="24" y="176" width="192" height="7" rx="3.5" fill={colors.primary} opacity="0.25" />
    </Svg>
  );
}