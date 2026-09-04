import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const SIZE = 260;
const C = SIZE / 2; // centre of the dial

/**
 * A point on the dial. Angle 0 is straight up and grows clockwise, which is
 * how bearings work — but SVG's angle 0 is to the right and Y grows downward,
 * hence the -90 offset.
 */
function point(angle, radius) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: C + radius * Math.cos(radians),
    y: C + radius * Math.sin(radians),
  };
}

const TICKS = Array.from({ length: 24 }, (_, index) => index * 15);
const CARDINALS = [
  { angle: 0, letter: 'N' },
  { angle: 90, letter: 'E' },
  { angle: 180, letter: 'S' },
  { angle: 270, letter: 'W' },
];

export default function Compass({ heading, qibla, aligned }) {
  const needleColor = aligned ? colors.primary : colors.accent;

  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      {/* ---- Fixed frame: does not move when you turn ---- */}

      {/* The gold band */}
      <Circle
        cx={C}
        cy={C}
        r={126}
        fill={colors.accentLight}
        stroke={aligned ? colors.primary : colors.accent}
        strokeWidth={2}
      />

      {/* The white face */}
      <Circle cx={C} cy={C} r={108} fill={colors.card} />

      {/* The marker at 12 o'clock — this is the direction you are facing */}
      <Path d={`M${C},2 L${C + 9},18 L${C - 9},18 Z`} fill={colors.primary} />

      {/* ---- The rose: rotates against your heading, like a real compass ---- */}
      <G rotation={-heading} origin={`${C}, ${C}`}>
        {TICKS.map((angle) => {
          const major = angle % 45 === 0;
          const outer = point(angle, major ? 123 : 120);
          const inner = point(angle, major ? 109 : 113);

          return (
            <Line
              key={angle}
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              stroke={major ? colors.accentDark : colors.accent}
              strokeWidth={major ? 2.5 : 1}
              strokeLinecap="round"
            />
          );
        })}

        {CARDINALS.map(({ angle, letter }) => {
          const at = point(angle, 86);

          return (
            <SvgText
              key={letter}
              x={at.x}
              y={at.y + 6}
              fontSize={16}
              fontFamily={fonts.semiBold}
              fill={angle === 0 ? colors.accentDark : colors.textMuted}
              textAnchor="middle"
            >
              {letter}
            </SvgText>
          );
        })}

        {/* ---- The needle: rotates to the Qibla inside the rose ---- */}
        <G rotation={qibla} origin={`${C}, ${C}`}>
          {/* tail */}
          <Path d={`M${C},${C + 70} L${C + 11},${C} L${C - 11},${C} Z`} fill={colors.textFaint} />
          {/* pointer */}
          <Path d={`M${C},${C - 70} L${C + 11},${C} L${C - 11},${C} Z`} fill={needleColor} />

          {/* A little Kaaba sitting at the tip */}
          <Rect
            x={C - 9}
            y={C - 100}
            width={18}
            height={18}
            rx={2}
            fill={colors.text}
          />
          <Rect x={C - 9} y={C - 94} width={18} height={3} fill={colors.accent} />
        </G>

        {/* hub, drawn last so it sits above the needle */}
        <Circle cx={C} cy={C} r={9} fill={colors.card} stroke={needleColor} strokeWidth={3} />
      </G>
    </Svg>
  );
}