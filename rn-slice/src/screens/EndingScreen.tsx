/**
 * HUSTLE — Ending screen.
 *
 * Faithful port of the prototype's current Ending model (hustle-shell.html
 * finish()/renderLedger(), ~2534-2682) onto the RN domain layer. Purpose, per the
 * approved product contract: "Here's what you decided, how those calls compared to
 * the best available call each day, and which day mattered most" — not a report
 * card. Judgment (crisisFrac, full 14-day range) alone drives the tier; cash and
 * Plan are reported as independent facts, never blended into one score, never fed
 * into the judgment calculation. No new score dimension, no aggregate "Overall
 * Score" is introduced here.
 *
 * Deliberately NOT ported (no RN data/architecture supports them — omitted, not
 * invented):
 *  - ARCHETYPE_CLOSING: no archetype-selection stage exists in RN.
 *  - VERDICT_ALT / endArt / the tier stamp burst animation: no art assets or
 *    animation library equivalent exist in this slice. Tier is shown as text.
 *  - "opened with X after a Y setup" ledger caption line: RN's Crisis->Ending
 *    handoff (App.tsx) does not carry ScannerRunState.setupCost through.
 *  - The force-back line only renders when committedTo === "phonerepair", the one
 *    business BUSINESS_META and the Scanner's Five-Forces table actually cover.
 *
 * Tier badge/art/burst is an OPEN PRODUCT QUESTION per the approved contract (may
 * read as grading) — ported as plain text, not resolved here. [OPEN — PLAYER
 * VALIDATION]
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import decksJson from '../domain/crisis-decks.json';
import { crisisFrac, crisisRange, totalDays } from '../domain/logic';
import type { CrisisDecks, CrisisLogEntry, CrisisRunState } from '../domain/types';
import type { BusinessId } from '../domain/business';
import { BUSINESS_META } from '../domain/business';
import { forcesOf } from '../domain/scanner/logic';
import { BIZ, FORCES_TABLE } from './ScannerScreen';
import type { PlanResult } from './PlanScreen';

const decks = decksJson as unknown as CrisisDecks;

// Verbatim from hustle-shell.html:2534-2568.
const BANDS = [
  { min: 80, tier: 1, title: 'Business Boss', msg: 'You planned smart, survived every crisis, and finished strong. This is how real businesses are built.' },
  { min: 60, tier: 2, title: 'Sharp Operator', msg: 'Solid execution across the board. A few refinements and you’re running a serious operation.' },
  { min: 40, tier: 3, title: 'Hustler in Training', msg: 'You made it through — now study the lessons and go again with better decisions.' },
  { min: 0, tier: 4, title: 'Back to the Drawing Board', msg: 'Every entrepreneur fails before they win. The lessons are all there — go back and apply them.' },
] as const;

const INTERP = {
  good_good: 'Good calls, good numbers — the judgment matched the outcome.',
  good_poor: 'The calls were sound even though the cash didn’t land soft. Good judgment doesn’t always buy a soft landing — some days the numbers just go against you.',
  poor_good: 'The cash held up, but the calls that got you there were shakier than the result suggests. Worth a second look before trusting the same instincts next time.',
  poor_poor: 'The calls were shaky and the cash shows it — this is what that combination looks like.',
} as const;

function judgmentTier(jf: number): 'good' | 'poor' {
  return jf >= 0.65 ? 'good' : 'poor';
}
function outcomeBand(cash: number): 'good' | 'poor' {
  return cash >= 2500 ? 'good' : 'poor';
}

// Verbatim from hustle-shell.html:1998-2004.
const FORCE_ROWS: { k: 'rivalry' | 'entrants' | 'subs' | 'suppliers' | 'buyers'; name: string }[] = [
  { k: 'rivalry', name: 'Competitive rivalry' },
  { k: 'entrants', name: 'Threat of new entrants' },
  { k: 'subs', name: 'Threat of substitutes' },
  { k: 'suppliers', name: 'Supplier power' },
  { k: 'buyers', name: 'Buyer power' },
];

function rands(n: number): string {
  const r = Math.round(n);
  return r < 0 ? `-R${Math.abs(r).toLocaleString()}` : `R${r.toLocaleString()}`;
}

export default function EndingScreen({
  committedTo,
  broke,
  finalState,
  plan,
}: {
  committedTo: BusinessId;
  broke: boolean;
  finalState: CrisisRunState;
  plan: PlanResult | null;
}) {
  const days = totalDays(decks, committedTo);
  const cr = crisisRange(decks, committedTo);
  const jf = crisisFrac(decks, committedTo, finalState.crisisScore);
  // Tier is judgment-only, per the approved contract — `broke` is a cash/outcome
  // fact and must never override or zero out the judgment score (it did previously:
  // a perfect-judgment run that ran out of cash was mislabeled "Back to the Drawing
  // Board" with "the calls were shaky", which is false and blends cash into judgment).
  const o = jf * 100;
  const band = BANDS.filter((b) => o >= b.min)[0] ?? BANDS[3];
  const interp = INTERP[`${judgmentTier(jf)}_${broke ? 'poor' : outcomeBand(finalState.cash)}`];
  const endMsg = `${broke ? `You ran out of cash before day ${days}. ` : ''}${band.msg} ${interp}`;

  const log: CrisisLogEntry[] = finalState.log || [];
  let pivotIdx = -1;
  let worst = 0;
  log.forEach((r, i) => {
    if (r.delta < worst) {
      worst = r.delta;
      pivotIdx = i;
    }
  });
  const pivot = pivotIdx >= 0 ? log[pivotIdx] : null;

  const meta = BUSINESS_META[committedTo];
  // Force-back text: only computable for the one business Scanner actually has
  // Five-Forces content for (phonerepair) — see file header.
  let forceBack: string | null = null;
  if (committedTo === 'phonerepair') {
    const fv = forcesOf(BIZ, FORCES_TABLE, 0);
    const high = FORCE_ROWS.filter((r) => fv[r.k] >= 3);
    forceBack = high.length
      ? `You went in carrying high ${high.map((r) => r.name.toLowerCase()).join(' and ')}. That was on the Scanner before you spent a rand.`
      : 'None of the five forces was against you here — this run was decided by your calls, not the market.';
  }

  const pivotText = pivot
    ? `The day that cost you most was day ${pivot.day} — ${pivot.event}. ${
        pivot.choice && !pivot.choice.startsWith('No choice')
          ? `You chose: ${pivot.choice}. ${rands(Math.abs(pivot.delta))} gone in one decision.`
          : `${rands(Math.abs(pivot.delta))} gone, and nothing on the day you could do about it.`
      }`
    : 'No single day broke you. The result is the sum of all of them.';

  return (
    <SafeAreaView style={styles.safe} testID="endingScreen">
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker} testID="endKicker">
          {broke ? `Out of cash on day ${finalState.day + 1}` : `Day ${days} — trading closed`}
        </Text>
        <Text style={styles.title} testID="endTitle">
          {band.title}
        </Text>
        {/* [OPEN — PLAYER VALIDATION]: tier badge/title may read as a grade rather
            than a factual summary — ported faithfully, not resolved here. */}
        <Text style={styles.msg} testID="endMsg">
          {endMsg}
        </Text>

        <View style={styles.summaryBox} testID="endSummary">
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cash at close</Text>
            <Text style={styles.summaryValue} testID="endCash">{rands(finalState.cash)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Plan grade</Text>
            <Text style={styles.summaryValue} testID="endPlan">
              {plan ? `${plan.got}/${plan.max}` : 'Not completed this run'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Crisis decisions</Text>
            <Text style={styles.summaryValue} testID="endCrisis">
              {finalState.crisisScore}/{cr.hi}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeader} testID="endPivotHeader">Which day mattered most</Text>
        <Text style={styles.body} testID="endPivot">
          {pivotText}
          {forceBack ? ` ${forceBack}` : ''}
        </Text>

        <Text style={styles.sectionHeader} testID="endLedgerHeader">
          {meta ? meta.name : 'Your hustle'}
        </Text>
        <View testID="endLedger">
          {log.length === 0 && (
            <Text style={styles.body} testID="endLedgerEmpty">
              No days traded — the run ended before day 1.
            </Text>
          )}
          {log.map((r, i) => (
            <View
              key={`${r.day}-${i}`}
              style={[styles.ledgerRow, i === pivotIdx && styles.ledgerRowPivot]}
              testID={`endLedgerRow-${i}`}
            >
              <Text style={styles.ledgerDay}>Day {r.day}</Text>
              <View style={styles.ledgerWhat}>
                <Text style={styles.ledgerEvent}>{r.event}</Text>
                {!!r.choice && <Text style={styles.ledgerChoice}>{r.choice}</Text>}
              </View>
              <Text style={[styles.ledgerDelta, r.delta >= 0 ? styles.up : styles.down]}>
                {r.delta >= 0 ? '+' : '−'}{rands(Math.abs(r.delta))}
              </Text>
              <Text style={[styles.ledgerCash, r.cash <= 0 && styles.broke]}>{rands(r.cash)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#14100D' },
  scroll: { padding: 20, paddingBottom: 40, gap: 4 },
  kicker: { color: '#B8AFA1', fontSize: 13, textTransform: 'uppercase' },
  title: { color: '#F5EFE6', fontSize: 26, fontWeight: '700', marginTop: 4 },
  msg: { color: '#F5EFE6', fontSize: 15, lineHeight: 21, marginTop: 10 },
  summaryBox: { marginTop: 18, padding: 16, borderRadius: 12, backgroundColor: '#1F1913', gap: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: '#B8AFA1', fontSize: 14, fontWeight: '600' },
  summaryValue: { color: '#F5EFE6', fontSize: 16, fontWeight: '700' },
  sectionHeader: { color: '#E0A93A', fontSize: 15, fontWeight: '700', marginTop: 24, textTransform: 'uppercase' },
  body: { color: '#F5EFE6', fontSize: 14, lineHeight: 20, marginTop: 8 },
  ledgerRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2A2219', gap: 8 },
  ledgerRowPivot: { backgroundColor: '#2A2015' },
  ledgerDay: { color: '#B8AFA1', fontSize: 12, width: 40 },
  ledgerWhat: { flex: 1 },
  ledgerEvent: { color: '#F5EFE6', fontSize: 13, fontWeight: '700' },
  ledgerChoice: { color: '#B8AFA1', fontSize: 12, marginTop: 2 },
  ledgerDelta: { fontSize: 13, fontWeight: '700', width: 72, textAlign: 'right' },
  ledgerCash: { color: '#F5EFE6', fontSize: 13, width: 72, textAlign: 'right' },
  up: { color: '#6BB56B' },
  down: { color: '#D9694F' },
  broke: { color: '#D9694F', fontWeight: '700' },
});
