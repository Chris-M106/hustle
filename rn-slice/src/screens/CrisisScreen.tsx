/**
 * HUSTLE — Crisis screen.
 * First real Crisis slice: the existing 14-day flat loop (Event -> Decision ->
 * Consequence -> Close Day -> Next Day), ported from the prototype's renderCrisis
 * (hustle-shell.html ~2326-2455) onto the pure domain functions in ../domain/logic.ts,
 * plus one new causally-neutral continuity cue ("Yesterday: [choice label]"). Scope is
 * the flat loop only — no 3-beat loop, no Field Notes, no scoring/horizon changes, no
 * Crisis -> Ending navigation (Ending has no legitimate entry point in this slice yet).
 *
 * Persistence: `launchCrisis` (../persistence/crisisWriter.ts) is create-only by design
 * (no update/resume path) — it is called exactly once, on mount, to durably record that
 * this run started. Day-to-day progression after that is in-session React state only;
 * this screen does not invent an update API on top of a contract that doesn't have one.
 * A relaunch mid-run is not resumed to the in-progress day — flagged, not solved here.
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import decksJson from '../domain/crisis-decks.json';
import { momentumWord, nextDay, resolve, today, totalDays } from '../domain/logic';
import type { CrisisDecks, CrisisRunState } from '../domain/types';
import type { BusinessId } from '../domain/business';
import { launchCrisis } from '../persistence/crisisWriter';

const decks = decksJson as unknown as CrisisDecks;

export default function CrisisScreen({
  committedTo,
  openingCash,
  onFinish,
}: {
  committedTo: BusinessId;
  openingCash: number;
  /** Fired only when the player taps through the completion screen's own "See your
   *  results" action — not automatically on finish. Mirrors the existing
   *  Scanner/Plan onContinue pattern: the legitimate completion signal (`finished`,
   *  computed above) is what unlocks Ending, but leaving is still a deliberate step,
   *  same as every other stage transition in this app. */
  onFinish?: (result: { broke: boolean; state: CrisisRunState }) => void;
}) {
  const [state, setState] = useState<CrisisRunState | null>(null);
  const [persistNote, setPersistNote] = useState<string | null>(null);
  const [finished, setFinished] = useState<{ broke: boolean; state: CrisisRunState } | null>(null);
  const [lessonShown, setLessonShown] = useState(false);

  function attemptLaunch() {
    let cancelled = false;
    launchCrisis(committedTo, openingCash)
      .then((result) => {
        if (cancelled) return;
        setState(result.state);
        if (result.kind !== 'launched') {
          // Non-fatal: this slice does not have an update/resume path to recover
          // storage identity in these cases, so play continues in-session while the
          // persisted record's identity may not match what's on screen.
          setPersistNote('Progress this run may not be saved.');
        }
      })
      .catch((e) => {
        if (cancelled) return;
        console.warn('[hustle] launchCrisis failed', e);
        // Play in-session even though nothing was persisted — falling straight into
        // createInitialCrisisState so this doesn't leave the screen stuck on the
        // loading spinner forever (a hung/failed storage write on a low-end device
        // is the realistic case here, not an edge case).
        setState({
          biz: committedTo,
          day: 0,
          cash: openingCash,
          crisisScore: 0,
          resolved: false,
          streak: 0,
          log: [],
        });
        setPersistNote('Could not start this run — progress will not be saved.');
      });
    return () => {
      cancelled = true;
    };
  }

  useEffect(() => {
    // committedTo/openingCash are the handoff for exactly one run; this screen does not
    // re-launch on their change within a mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return attemptLaunch();
  }, []);

  if (finished) {
    const days = totalDays(decks, finished.state.biz);
    return (
      <SafeAreaView style={styles.safe} testID="crisisFinished">
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.header} testID="crisisFinishedHeader">
            {finished.broke ? 'Out of cash' : 'Crisis complete'}
          </Text>
          <Text style={styles.body} testID="crisisFinishedBody">
            {finished.broke
              ? `Day ${finished.state.day + 1} of ${days}. Cash ran out before the run finished.`
              : `All ${days} trading days done.`}
          </Text>
          <Text style={styles.body} testID="crisisFinalCash">
            Final cash: R{finished.state.cash.toLocaleString()}
          </Text>
          {persistNote && (
            <Text style={styles.warning} testID="crisisPersistNote">
              {persistNote}
            </Text>
          )}
          {onFinish && (
            <TouchableOpacity
              style={styles.cta}
              testID="crisisSeeResultsBtn"
              onPress={() => onFinish(finished)}
              accessibilityRole="button"
              accessibilityLabel="See your results"
            >
              <Text style={styles.ctaText}>See your results →</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!state) {
    return (
      <SafeAreaView style={styles.safe} testID="crisisLoading">
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  const days = totalDays(decks, state.biz);
  const dayNum = state.day + 1;
  const remain = days - state.day - 1;
  const event = today(decks, state);
  const yesterday = state.day > 0 ? state.log[state.day - 1] : null;
  const mWord = momentumWord(decks, state);

  function applyResolve(delta: number, score: number, outcome: string, label: string) {
    // Functional updater: two presses queued in the same batch (a double-tap, or
    // two different decision buttons both firing before a re-render) must both see
    // the same prevState.resolved, so the second press is a genuine no-op against
    // the first press's result — not a recompute from the pre-resolve base state.
    setState((prev) => {
      if (!prev) return prev;
      const result = resolve(decks, prev, delta, score, outcome, label);
      if (result.alreadyResolved) return prev;
      return result.state;
    });
    setLessonShown(false);
  }

  function handleNextDay() {
    if (!state) return;
    const result = nextDay(decks, state);
    if (result.kind === 'finish') {
      setFinished({ broke: result.broke, state: result.state });
    } else {
      setState(result.state);
    }
  }

  return (
    <SafeAreaView style={styles.safe} testID="crisisScreen">
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header} testID="crisisDayCount">
          Day {dayNum} of {days}
        </Text>
        <Text style={styles.subtle} testID="crisisRemain">
          {remain > 0 ? `${remain} trading day${remain === 1 ? '' : 's'} remaining` : 'Final day'}
        </Text>
        <Text style={styles.subtle} testID="crisisCash">
          Cash: R{state.cash.toLocaleString()}
        </Text>
        <Text style={styles.subtle} testID="crisisMomentum">
          Momentum: {mWord}
        </Text>
        {persistNote && (
          <Text style={styles.warning} testID="crisisPersistNote">
            {persistNote}
          </Text>
        )}

        {yesterday && !state.resolved && (
          <Text style={styles.yesterday} testID="crisisYesterday">
            Yesterday: {yesterday.choice || '—'}
          </Text>
        )}

        <View style={styles.eventBox} testID="crisisEvent">
          <Text style={styles.eventKind} testID="crisisEventKind">
            Day {dayNum} · {event.type}
          </Text>
          <Text style={styles.eventTitle} testID="crisisEventTitle">
            {event.title}
          </Text>
          <Text style={styles.body} testID="crisisEventDesc">
            {event.description}
          </Text>

          {!state.resolved && event.decisions && (
            <View style={styles.answers} testID="crisisDecisions">
              {event.decisions.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  style={styles.ans}
                  testID={`crisisAns-${d.id}`}
                  onPress={() => applyResolve(d.cashChange, d.score, d.outcome, d.label)}
                  accessibilityRole="button"
                  accessibilityLabel={d.label}
                >
                  <Text style={styles.ansLabel}>{d.label}</Text>
                  <Text style={styles.ansDetail}>
                    {d.detail}
                    {d.cashChange
                      ? ` · ${d.cashChange > 0 ? '+' : '-'}R${Math.abs(d.cashChange).toLocaleString()}`
                      : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {!state.resolved && !event.decisions && (
            <TouchableOpacity
              style={styles.cta}
              testID="takeDayBtn"
              onPress={() => applyResolve(event.cashChange ?? 0, 0, event.outcome ?? '', 'No choice — the day happened')}
              accessibilityRole="button"
              accessibilityLabel="Take the day"
            >
              <Text style={styles.ctaText}>Take the day →</Text>
            </TouchableOpacity>
          )}

          {state.resolved && (
            <View style={styles.outcome} testID="crisisOutcome">
              <Text style={styles.outcomeStamp} testID="crisisOutcomeStamp">
                Day {dayNum} closed
              </Text>
              <Text style={styles.body} testID="crisisOutcomeText">
                {state.lastOutcome}
              </Text>
              <Text style={styles.delta} testID="crisisDelta">
                {(state.lastDelta ?? 0) >= 0 ? '+' : '-'}R{Math.abs(state.lastDelta ?? 0).toLocaleString()}
              </Text>

              {event.lesson && !lessonShown && (
                <TouchableOpacity
                  style={styles.linkBtn}
                  testID="showLessonBtn"
                  onPress={() => setLessonShown(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Show the lesson"
                >
                  <Text style={styles.linkText}>Show the lesson</Text>
                </TouchableOpacity>
              )}
              {event.lesson && lessonShown && (
                <View style={styles.lesson} testID="lessonBox">
                  <Text style={styles.lessonTitle}>{event.lesson.title}</Text>
                  <Text style={styles.body}>{event.lesson.body}</Text>
                  <Text style={styles.nvc}>{event.lesson.nvc}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {state.resolved && (
          <TouchableOpacity
            style={styles.cta}
            testID="nextDayBtn"
            onPress={handleNextDay}
            accessibilityRole="button"
            accessibilityLabel={state.cash <= 0 || state.day >= days - 1 ? 'See your result' : `Advance to day ${dayNum + 1}`}
          >
            <Text style={styles.ctaText}>
              {state.cash <= 0 || state.day >= days - 1 ? 'See your result →' : `Day ${dayNum + 1} →`}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#14100D' },
  scroll: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { color: '#F5EFE6', fontSize: 22, fontWeight: '700' },
  subtle: { color: '#B8AFA1', fontSize: 14, marginTop: 2 },
  warning: { color: '#E0A93A', fontSize: 13, marginTop: 8 },
  yesterday: { color: '#8FA6B8', fontSize: 13, marginTop: 12, fontStyle: 'italic' },
  body: { color: '#F5EFE6', fontSize: 15, marginTop: 8, lineHeight: 21 },
  eventBox: { marginTop: 16, padding: 16, borderRadius: 12, backgroundColor: '#1F1913' },
  eventKind: { color: '#B8AFA1', fontSize: 12, textTransform: 'uppercase' },
  eventTitle: { color: '#F5EFE6', fontSize: 19, fontWeight: '700', marginTop: 4 },
  answers: { marginTop: 16, gap: 10 },
  ans: { padding: 14, borderRadius: 10, backgroundColor: '#2A2219', minHeight: 48 },
  ansLabel: { color: '#F5EFE6', fontSize: 15, fontWeight: '700' },
  ansDetail: { color: '#B8AFA1', fontSize: 13, marginTop: 4 },
  cta: { marginTop: 18, padding: 16, borderRadius: 10, backgroundColor: '#E0A93A', alignItems: 'center', minHeight: 48 },
  ctaText: { color: '#14100D', fontSize: 16, fontWeight: '700' },
  outcome: { marginTop: 16 },
  outcomeStamp: { color: '#8FA6B8', fontSize: 13, fontWeight: '700' },
  delta: { color: '#F5EFE6', fontSize: 18, fontWeight: '700', marginTop: 6 },
  linkBtn: { marginTop: 12, minHeight: 48, justifyContent: 'center' },
  linkText: { color: '#8FA6B8', fontSize: 14, textDecorationLine: 'underline' },
  lesson: { marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: '#1A2A2E' },
  lessonTitle: { color: '#F5EFE6', fontSize: 15, fontWeight: '700' },
  nvc: { color: '#8FA6B8', fontSize: 12, marginTop: 6, fontStyle: 'italic' },
});
