import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme';

export function MoonPhase({ fraction, waxing, size = 60 }: { fraction: number; waxing: boolean; size?: number }) {
  const c = size / 2;
  const r = c - 1;
  const gibbous = fraction > 0.5;
  const terminatorRx = Math.abs(1 - 2 * fraction) * r;
  const outerSweep = waxing ? 1 : 0;
  const terminatorSweep = waxing ? (gibbous ? 1 : 0) : gibbous ? 0 : 1;
  const lit = `M ${c} ${c - r} A ${r} ${r} 0 0 ${outerSweep} ${c} ${c + r} A ${terminatorRx} ${r} 0 0 ${terminatorSweep} ${c} ${c - r} Z`;
  return (
    <Svg width={size} height={size}>
      <Circle cx={c} cy={c} r={r} fill={colors.moonDark} />
      <Path d={lit} fill={colors.moonLit} />
    </Svg>
  );
}
