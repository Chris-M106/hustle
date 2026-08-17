/**
 * HUSTLE — Plan screen.
 *
 * Five short strategic-commitment questions (Vision, Customers, Money, Operations,
 * My Edge), one at a time, three single-choice answers each — content ported
 * verbatim from the prototype's `PLAN` table (hustle-shell.html, `var PLAN=[...]`,
 * the line following the `var OPPS=` declaration, roughly line 1467) and its
 * qualitative strength-tier mapping (hustle-shell.html:2271:
 * `sf < .5 ? "Shaky" : sf < .75 ? "Building" : sf < .95 ? "Solid" : "Strong"`).
 *
 * Deliberately NOT ported from the prototype: `planIntro`'s "write the plan a
 * funder would actually read" framing (hustle-shell.html:2219-2220). That line is
 * funder framing, explicitly out of scope for this slice — see the intro copy
 * below, which is a [PROPOSAL — COPY] replacement, not an authored/approved string
 * found anywhere in rn-slice or the outer repo's docs.
 *
 * State is in-session only (useState) — no persistence, no resume, no Plan->Crisis
 * linkage. See PLAN_SCREEN_REPORT (this task's final report) for why: the existing
 * src/persistence/ layer (queuedWrite, crisisWriter) is scoped to Scanner/Crisis
 * state ownership and App.tsx's own header comment flags Plan->Crisis blending as
 * "NOT wired here — flagged, not invented." This screen follows that same boundary.
 *
 * No numeric score, fraction, percentage, rank, or grade is ever rendered — only
 * the four qualitative tier words above. No causal language implying Plan strength
 * controls Crisis/cash/outcome. No per-answer rationale text (the prototype's
 * `plan` field on each answer, e.g. "closes a clear local market gap", is used only
 * internally to pick a tier; it is intentionally never displayed to the player, since
 * the task brief scopes per-answer rationale text out).
 */
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AnswerId = 'A' | 'B' | 'C';

type PlanAnswer = {
  id: AnswerId;
  text: string;
  score: number;
};

type PlanSection = {
  id: string;
  title: string;
  q: string;
  answers: PlanAnswer[];
};

// Verbatim from hustle-shell.html `var PLAN=[...]` — ids, titles, questions, answer
// text and scores unchanged. The prototype's per-answer `plan` rationale strings are
// intentionally dropped (out of scope, see file header).
const PLAN: PlanSection[] = [
  {
    id: 'vision',
    title: 'Vision',
    q: 'What problem does your business solve?',
    answers: [
      { id: 'A', text: "There's no nearby option — customers travel far for this", score: 4 },
      { id: 'B', text: "People always need what I'm selling", score: 2 },
      { id: 'C', text: 'I have passion and skill for this', score: 1 },
    ],
  },
  {
    id: 'customers',
    title: 'Customers',
    q: 'Why will customers choose you over the competition?',
    answers: [
      { id: 'A', text: 'Better service, quality, or a more convenient location', score: 4 },
      { id: 'B', text: 'They know and trust me — community relationships matter', score: 4 },
      { id: 'C', text: 'My prices will be lower than the competition', score: 2 },
    ],
  },
  {
    id: 'money',
    title: 'Money',
    q: 'Do you have a cash reserve for unexpected costs?',
    answers: [
      { id: 'A', text: 'Yes — at least 4 weeks of operating costs set aside', score: 4 },
      { id: 'B', text: 'Partially — about 2 weeks of backup funds', score: 2 },
      { id: 'C', text: 'No — starting with only enough to open', score: 1 },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    q: 'What happens if you are unavailable for a day?',
    answers: [
      { id: 'A', text: 'I have a trained backup person I can call', score: 4 },
      { id: 'B', text: "I'll close for the day and absorb the loss", score: 1 },
      { id: 'C', text: "I haven't made a plan for this yet", score: 2 },
    ],
  },
  {
    id: 'edge',
    title: 'My Edge',
    q: 'How will new customers discover your business?',
    answers: [
      { id: 'A', text: 'A combination: flyers, social media, and word of mouth', score: 4 },
      { id: 'B', text: 'WhatsApp and social media — targeted and low cost', score: 3 },
      { id: 'C', text: 'Word of mouth — great service spreads naturally', score: 2 },
    ],
  },
];

// Verbatim tier thresholds from hustle-shell.html:2271.
function strengthWord(sf: number): 'Shaky' | 'Building' | 'Solid' | 'Strong' {
  return sf < 0.5 ? 'Shaky' : sf < 0.75 ? 'Building' : sf < 0.95 ? 'Solid' : 'Strong';
}

/** The raw got/max Plan grade — used both for the on-screen qualitative word (via
 *  strengthWord(frac)) and, since this task, as the payload handed to onContinue so
 *  Ending can show "Plan grade: got/max" as its own independent fact. Never rendered
 *  as a number on this screen itself (see file header). */
export type PlanResult = { got: number; max: number };

/**
 * `onContinue` fires once all 5 sections are answered and the player taps Continue.
 * Optional, mirroring ScannerScreen's `onContinue` shape. Carries the Plan grade
 * (got/max, matching the prototype's planScore()) so Ending can show it as an
 * independent fact — this is a data handoff, not a Plan->Crisis scoring blend; Plan's
 * result never feeds Crisis's judgment score (see EndingScreen.tsx).
 */
export default function PlanScreen({ onContinue }: { onContinue?: (result: PlanResult) => void } = {}) {
  const [answers, setAnswers] = useState<Record<string, AnswerId>>({});
  const [index, setIndex] = useState(0);

  const doneCount = Object.keys(answers).length;
  const allDone = doneCount === PLAN.length;
  const section = PLAN[index];
  const picked = answers[section.id] ?? null;

  const planResult = useMemo(() => {
    let got = 0;
    let max = 0;
    PLAN.forEach((sec) => {
      const best = Math.max(...sec.answers.map((a) => a.score));
      max += best;
      const chosenId = answers[sec.id];
      const chosen = sec.answers.find((a) => a.id === chosenId);
      if (chosen) got += chosen.score;
    });
    return { got, max };
  }, [answers]);
  const sf = planResult.max ? planResult.got / planResult.max : 0;

  function choose(a: AnswerId) {
    setAnswers((prev) => ({ ...prev, [section.id]: a }));
  }

  function goPrev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  function goNext() {
    setIndex((i) => Math.min(PLAN.length - 1, i + 1));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header} testID="planHeader">Plan your first month</Text>
        {/* [PROPOSAL — COPY]: no approved non-funder intro copy was found in rn-slice
            or outer-repo docs; this replaces the prototype's funder-framed line. */}
        <Text style={styles.intro} testID="planIntro">
          You committed to your hustle. Now decide how you'll actually run it — five
          short questions, one answer each. There's no judge reading this; it's you
          getting clear before day one.
        </Text>

        <View style={styles.progressRow} testID="planProgress">
          <Text style={styles.progressText}>
            {doneCount} of {PLAN.length} answered
          </Text>
          <Text style={styles.progressText} testID="planStepIndicator">
            {index + 1} of {PLAN.length}
          </Text>
        </View>

        {doneCount > 0 && (
          <View style={styles.strengthBox} testID="planStrength">
            <Text style={styles.strengthLabel}>Plan strength so far</Text>
            <Text style={styles.strengthWord} testID="planStrengthWord">
              {strengthWord(sf)}
            </Text>
          </View>
        )}

        <View style={styles.card} testID={`section-${section.id}`}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.question}>{section.q}</Text>

          <View style={styles.answers} accessibilityRole="radiogroup">
            {section.answers.map((a) => {
              const selected = picked === a.id;
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.answerBtn, selected && styles.answerBtnSelected]}
                  testID={`ans-${section.id}-${a.id}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${a.text}${selected ? ', selected' : ''}`}
                  onPress={() => choose(a.id)}
                >
                  <Text style={[styles.answerMark, selected && styles.answerMarkSelected]}>
                    {selected ? '[x]' : '[ ]'}
                  </Text>
                  <Text style={[styles.answerText, selected && styles.answerTextSelected]}>
                    {a.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, index === 0 && styles.navBtnDisabled]}
            testID="planPrevBtn"
            onPress={goPrev}
            disabled={index === 0}
            accessibilityLabel="Previous question"
          >
            <Text style={styles.navBtnText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtn, index === PLAN.length - 1 && styles.navBtnDisabled]}
            testID="planNextBtn"
            onPress={goNext}
            disabled={index === PLAN.length - 1}
            accessibilityLabel="Next question"
          >
            <Text style={styles.navBtnText}>Next</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.continueBtn, !allDone && styles.continueBtnDisabled]}
          testID="planContinueBtn"
          onPress={allDone ? () => onContinue?.(planResult) : undefined}
          disabled={!allDone}
          accessibilityLabel={
            allDone ? 'Plan complete' : `${PLAN.length - doneCount} question${PLAN.length - doneCount === 1 ? '' : 's'} left, disabled`
          }
        >
          <Text style={styles.continueBtnText}>
            {allDone
              ? 'Plan complete'
              : `Answer ${PLAN.length - doneCount} more question${PLAN.length - doneCount === 1 ? '' : 's'}`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#14100D' },
  scroll: { padding: 20, gap: 16, flexGrow: 1 },
  header: { color: '#F5EDE3', fontSize: 18, fontWeight: '700' },
  intro: { color: '#CBBBA6', fontSize: 14, lineHeight: 20 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { color: '#CBBBA6', fontSize: 13, fontWeight: '600' },
  strengthBox: {
    backgroundColor: '#1F1813',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strengthLabel: { color: '#CBBBA6', fontSize: 13 },
  strengthWord: { color: '#F2A81C', fontSize: 15, fontWeight: '700' },
  card: { backgroundColor: '#1F1813', borderRadius: 12, padding: 16, gap: 10 },
  sectionTitle: { color: '#F2A81C', fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
  question: { color: '#F5EDE3', fontSize: 17, fontWeight: '700', marginBottom: 4 },
  answers: { gap: 10 },
  answerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14100D',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3A2E24',
    paddingVertical: 14,
    paddingHorizontal: 14,
    minHeight: 44,
    gap: 10,
  },
  answerBtnSelected: {
    borderColor: '#E2571E',
    borderWidth: 2,
    backgroundColor: '#241A12',
  },
  answerMark: { color: '#6B5C4B', fontSize: 15, fontWeight: '700' },
  answerMarkSelected: { color: '#E2571E' },
  answerText: { color: '#CBBBA6', fontSize: 14, flex: 1, flexWrap: 'wrap' },
  answerTextSelected: { color: '#F5EDE3', fontWeight: '700' },
  navRow: { flexDirection: 'row', gap: 12 },
  navBtn: {
    flex: 1,
    backgroundColor: '#1F1813',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { color: '#F5EDE3', fontSize: 14, fontWeight: '700' },
  continueBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  continueBtnDisabled: { backgroundColor: '#3A342C' },
  continueBtnText: { color: '#F5EDE3', fontSize: 15, fontWeight: '700' },
});
