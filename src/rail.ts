import { StyleSheet } from 'react-native';
import { colors } from './theme';

// Shared by every horizontal card rail (Today tab, Calendar day details).
// Cards are auto-height (minHeight only) so content that's longer in one
// language, or naturally longer (Sankalpam, a 6-row muhurta table), doesn't
// get clipped or spill past the card's rounded border. Width is fixed so
// the horizontal ScrollView can snap consistently.
export const RAIL_CARD_WIDTH = 312;
export const RAIL_GAP = 12;
export const RAIL_SNAP_INTERVAL = RAIL_CARD_WIDTH + RAIL_GAP;
export const RAIL_MIN_HEIGHT = 172;

export const railStyles = StyleSheet.create({
  cardRail: { paddingHorizontal: 16, gap: RAIL_GAP, paddingVertical: 6 },
  railCard: { width: RAIL_CARD_WIDTH, minHeight: RAIL_MIN_HEIGHT },
  panelTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  panelSubtitle: { color: colors.muted, fontWeight: '600', fontSize: 12, marginTop: -2, marginBottom: 3 },
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
