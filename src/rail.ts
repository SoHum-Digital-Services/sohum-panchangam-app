import { StyleSheet, useWindowDimensions } from 'react-native';
import { colors } from './theme';

// Shared by every horizontal card rail (Today tab, Calendar day details).
// Cards are auto-height (minHeight only) so content that's longer in one
// language, or naturally longer (Sankalpam, a 6-row muhurta table), doesn't
// get clipped or spill past the card's rounded border.
//
// Card width is computed from the screen so only a small sliver (RAIL_PEEK)
// of the next card shows -- enough to signal "more here", not enough to
// look like a second half-card.
export const SIDE_PADDING = 16;
export const RAIL_GAP = 12;
export const RAIL_PEEK = 22;
export const MAX_FRAME_WIDTH = 430;
export const RAIL_MIN_HEIGHT = 172;

export function useRailMetrics() {
  const { width } = useWindowDimensions();
  const frameWidth = Math.min(width, MAX_FRAME_WIDTH);
  const cardWidth = frameWidth - SIDE_PADDING * 2 - RAIL_PEEK;
  return { cardWidth, gap: RAIL_GAP, snapInterval: cardWidth + RAIL_GAP };
}

export const railStyles = StyleSheet.create({
  cardRail: { paddingHorizontal: SIDE_PADDING, gap: RAIL_GAP, paddingVertical: 6 },
  panelTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  detailLine: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 3 },
  detailLabel: { width: 86, color: colors.orange, fontWeight: '800', fontSize: 12 },
  detailValue: { flex: 1, color: colors.ink, fontSize: 13, lineHeight: 18, fontWeight: '500' },
  festivalCard: { backgroundColor: colors.peach, borderColor: '#ffd7b8' },
  festivalText: { color: colors.maroon, fontWeight: '700', fontSize: 13, marginTop: 7 },
  sankalpamCard: { borderLeftWidth: 4, borderLeftColor: colors.saffron },
  sankalpamText: { color: colors.ink, fontSize: 13, lineHeight: 20, marginTop: 7 },
  moonBadge: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  moonIcon: { color: '#dfe3ea', fontSize: 28 },
});
