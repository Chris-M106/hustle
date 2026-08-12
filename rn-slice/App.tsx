/**
 * HUSTLE — Crisis vertical slice.
 * Validates ARCHITECTURE.md's RN + Hermes + New Architecture recommendation against
 * a real Crisis-stage rebuild. NOT a full migration — this is the only screen.
 * Domain logic (src/domain/{types,logic}.ts) is an unmodified copy of the adversary-
 * cleared hustle/domain-ts/crisis layer; only this file is RN-specific UI.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import decksJson from './src/domain/crisis-decks.json';
import {
  createInitialCrisisState,
  momentumFrac,
  momentumWord,
  nextDay,
  resolve,
  today,
  totalDays,
} from './src/domain/logic';
import type { BusinessId, CrisisDecks, CrisisRunState } from './src/domain/types';

const decks = decksJson as unknown as CrisisDecks;
const BIZ: BusinessId = 'spaza';
const STORAGE_KEY = 'hustle.crisis.v1';
const BACKUP_KEY = 'hustle.crisis.v1.corrupt-backup';
const RESTORE_TIMEOUT_MS = 5000;
const SAVE_FAIL_NOTE = 'Save failed — progress may not persist.';

// Module scope, not per-instance: must survive remount (fast refresh, activity
// recreation) so two component instances never issue concurrent setItem calls
// on the same key.
let writeQueue: Promise<void> = Promise.resolve();

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
}

/** Structural + relational check — refuses corrupt/foreign data and data that is
 *  internally inconsistent (day/log mismatch, out-of-range cash, malformed log
 *  entries), not just wrong-typed fields. */
function isValidCrisisState(v: unknown): v is CrisisRunState {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  const deckLen = totalDays(decks, BIZ);
  const structural =
    s.biz === BIZ &&
    typeof s.day === 'number' &&
    Number.isInteger(s.day) &&
    s.day >= 0 &&
    s.day < deckLen &&
    typeof s.cash === 'number' &&
    Number.isFinite(s.cash) &&
    Math.abs(s.cash as number) < 1e9 &&
    typeof s.crisisScore === 'number' &&
    Number.isFinite(s.crisisScore) &&
    typeof s.resolved === 'boolean' &&
    typeof s.streak === 'number' &&
    Number.isInteger(s.streak) &&
    s.streak >= 0 &&
    (s.ended === undefined || typeof s.ended === 'boolean') &&
    Array.isArray(s.log);
  if (!structural) return false;

  const log = s.log as unknown[];
  const day = s.day as number;
  const resolved = s.resolved as boolean;
  // Relational invariant: log.length tracks day (see logic.ts resolve/nextDay) —
  // one entry per resolved day, plus the just-resolved-but-not-yet-advanced day.
  const expectedLen = resolved ? day + 1 : day;
  if (log.length !== expectedLen) return false;
  if (
    !log.every(
      (entry) =>
        entry !== null &&
        typeof entry === 'object' &&
        typeof (entry as Record<string, unknown>).day === 'number' &&
        typeof (entry as Record<string, unknown>).cash === 'number' &&
        Number.isFinite((entry as Record<string, unknown>).cash as number),
    )
  ) {
    return false;
  }
  return true;
}

function CrisisSlice() {
  const [state, setState] = useState<CrisisRunState>(() =>
    createInitialCrisisState(BIZ, 5000),
  );
  const [ended, setEnded] = useState<{ broke: boolean } | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [restoreNote, setRestoreNote] = useState<string | null>(null);
  const hydrated = useRef(false);
  const lastResultRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await Promise.race([AsyncStorage.getItem(STORAGE_KEY), timeout(RESTORE_TIMEOUT_MS)]);
        if (cancelled) return;
        if (raw == null) {
          setRestoreNote('No saved run — starting fresh.');
        } else {
          let parsed: unknown;
          let parseOk = true;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parseOk = false;
          }
          if (parseOk && isValidCrisisState(parsed)) {
            setState(parsed);
            if (parsed.ended) setEnded({ broke: parsed.cash <= 0 });
            setRestoreNote('Restored saved run.');
          } else {
            // Back up the unreadable payload before it gets overwritten by the
            // save effect below — otherwise a single corrupt byte permanently
            // destroys the only copy of the run.
            AsyncStorage.setItem(BACKUP_KEY, raw).catch((e) =>
              console.warn('[hustle] backup of corrupt save failed', e),
            );
            setRestoreNote('Saved data was invalid — starting fresh (corrupt copy backed up).');
            setState(createInitialCrisisState(BIZ, 5000));
          }
        }
      } catch (e) {
        console.warn('[hustle] restore failed', e);
        if (!cancelled) {
          setRestoreNote('Could not read saved run — starting fresh.');
          setState(createInitialCrisisState(BIZ, 5000));
        }
      } finally {
        if (!cancelled) {
          hydrated.current = true;
          setRestoring(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const payload = JSON.stringify(state);
    writeQueue = writeQueue.then(() =>
      AsyncStorage.setItem(STORAGE_KEY, payload).then(
        () => setRestoreNote((n) => (n === SAVE_FAIL_NOTE ? null : n)),
        (e) => {
          console.warn('[hustle] save failed', e);
          setRestoreNote(SAVE_FAIL_NOTE);
        },
      ),
    );
  }, [state]);

  // lastResultRef is written inside the setState updater (during render) but
  // only committed to visible state here, after React has actually applied
  // the update — a synchronous read right after setState would see the
  // pre-update value, since updaters run during the render phase.
  useEffect(() => {
    if (lastResultRef.current !== null) {
      setLastResult(lastResultRef.current);
      lastResultRef.current = null;
    }
  }, [state]);

  const event = ended ? null : today(decks, state);
  const days = totalDays(decks, BIZ);
  const played = state.log.length;
  const mFrac = momentumFrac(decks, state);
  const mWord = momentumWord(decks, state);
  const meterWidth = played === 0 ? 0 : mFrac;

  function pick(delta: number, score: number, outcome: string, label: string) {
    setState((prev) => {
      const result = resolve(decks, prev, delta, score, outcome, label);
      if (!result.alreadyResolved) {
        const streakNote = result.streakExtended
          ? ', streak +1'
          : result.streakBroke
          ? ', streak broken'
          : '';
        lastResultRef.current = `${outcome} (${result.delta >= 0 ? '+' : ''}${result.delta} cash${streakNote})`;
      }
      return result.state;
    });
  }

  // finishInfo carries the nextDay() finish outcome out of the updater; setEnded
  // is called from the effect below (after commit), not from inside the updater
  // itself, which must stay a pure function of its input.
  const finishInfo = useRef<{ broke: boolean } | null>(null);

  function advance() {
    setState((prev) => {
      const res = nextDay(decks, prev);
      if (res.kind === 'finish') finishInfo.current = { broke: res.broke };
      return res.state;
    });
    setLastResult(null);
    lastResultRef.current = null;
  }

  useEffect(() => {
    if (finishInfo.current !== null) {
      setEnded(finishInfo.current);
      finishInfo.current = null;
    }
  }, [state]);

  function restart() {
    setState(createInitialCrisisState(BIZ, 5000));
    setEnded(null);
    setLastResult(null);
    lastResultRef.current = null;
    finishInfo.current = null;
  }

  if (restoring) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />
        <View style={styles.scroll}>
          <Text style={styles.header}>HUSTLE — Crisis (RN validation slice)</Text>
          <Text style={styles.body}>Loading saved run…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>HUSTLE — Crisis (RN validation slice)</Text>
        {restoreNote && <Text style={styles.body} testID="restoreNote">{restoreNote}</Text>}

        {ended ? (
          <View style={styles.card}>
            <Text style={styles.title}>{ended.broke ? 'Business closed' : 'Run complete'}</Text>
            <Text style={styles.body}>Final cash: R{state.cash.toLocaleString()}</Text>
            <Text style={styles.body}>Crisis score: {state.crisisScore}</Text>
            <TouchableOpacity style={styles.button} onPress={restart}>
              <Text style={styles.buttonText}>Play again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.hud}>
              <Text style={styles.hudText}>Day {state.day + 1} / {days}</Text>
              <Text style={styles.hudText}>Cash: R{state.cash.toLocaleString()}</Text>
              <Text style={styles.hudText}>Streak: {state.streak}</Text>
            </View>

            <View style={styles.meterTrack}>
              <View style={[styles.meterFill, { width: `${Math.round(meterWidth * 100)}%` }]} />
            </View>
            <Text style={styles.momentumWord}>Momentum: {mWord}</Text>

            {event && (
              <View style={styles.card}>
                <Text style={styles.title}>{event.title}</Text>
                <Text style={styles.body}>{event.description}</Text>

                {event.decisions ? (
                  event.decisions.map((d) => (
                    <TouchableOpacity
                      key={d.id}
                      style={[styles.choice, state.resolved && styles.choiceDisabled]}
                      disabled={state.resolved}
                      onPress={() => pick(d.cashChange, d.score, d.outcome, d.label)}
                    >
                      <Text style={styles.choiceLabel}>{d.label}</Text>
                      <Text style={styles.choiceDetail}>{d.detail}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <TouchableOpacity
                    style={[styles.choice, state.resolved && styles.choiceDisabled]}
                    disabled={state.resolved}
                    onPress={() =>
                      pick(event.cashChange ?? 0, 0, event.outcome ?? 'Day taken.', 'Take the day')
                    }
                  >
                    <Text style={styles.choiceLabel}>Take the day</Text>
                  </TouchableOpacity>
                )}

                {lastResult && <Text style={styles.result}>{lastResult}</Text>}

                {state.resolved && (
                  <TouchableOpacity style={styles.button} onPress={advance}>
                    <Text style={styles.buttonText}>Next day</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <CrisisSlice />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#14100D' },
  scroll: { padding: 20, gap: 16 },
  header: { color: '#F5EDE3', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  hud: { flexDirection: 'row', justifyContent: 'space-between' },
  hudText: { color: '#F5EDE3', fontSize: 14 },
  meterTrack: { height: 8, borderRadius: 4, backgroundColor: '#2A2119', overflow: 'hidden' },
  meterFill: { height: 8, backgroundColor: '#F2A81C' },
  momentumWord: { color: '#F2A81C', fontSize: 13, marginBottom: 8 },
  card: { backgroundColor: '#1F1813', borderRadius: 12, padding: 16, gap: 10 },
  title: { color: '#F5EDE3', fontSize: 17, fontWeight: '700' },
  body: { color: '#CBBBA6', fontSize: 14 },
  choice: {
    backgroundColor: '#2A2119',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  choiceDisabled: {
    opacity: 0.4,
  },
  choiceLabel: { color: '#F5EDE3', fontSize: 15, fontWeight: '600' },
  choiceDetail: { color: '#CBBBA6', fontSize: 13, marginTop: 2 },
  result: { color: '#E2571E', fontSize: 13, marginTop: 8 },
  button: {
    backgroundColor: '#E2571E',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#14100D', fontSize: 15, fontWeight: '700' },
});
