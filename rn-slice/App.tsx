/**
 * HUSTLE — Scanner vertical slice.
 * Second architectural-validation slice, on `scanner-slice` (off `main`, NOT built on
 * `nav-spike` — see DECISIONS.md -> "Navigation approach: raw root state vs.
 * react-navigation"). Proves the RN architecture (raw root state + the existing
 * AsyncStorage write-queue pattern) can support a second real HUSTLE stage with its
 * own shared state and persistence. Scope: ONE hardcoded business, scan -> select ->
 * commit -> persist -> force-stop -> relaunch -> restore. See SCANNER_SLICE_PLAN.md.
 *
 * Domain logic (src/domain/scanner/{types,logic}.ts) is an unmodified copy of the
 * adversary-pending hustle/domain-ts/scanner layer; only this file is RN-specific UI.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  affordable,
  CAPITAL,
  commitSpot,
  createInitialScannerState,
  forcesOf,
  forcesTotal,
  opening,
  overBy,
  pressureWord,
  scanSpot,
  selectSpot,
} from './src/domain/scanner/logic';
import type { ForcesTable, ScannerOpportunity, ScannerRunState } from './src/domain/scanner/types';

// Single hardcoded business — the highest-verdict, always-affordable spot from the
// prototype's OPPS table (hustle-shell.html:1466). Multi-business carousel deferred.
const BIZ: ScannerOpportunity = {
  id: 'phonerepair',
  name: 'Phone Repair Kiosk',
  short: 'Phone Repair',
  demand: 'HIGH',
  comp: 'LOW',
  cost: 1200,
};
const FORCES_TABLE: ForcesTable = {
  phonerepair: { entrants: 1, subs: 1, suppliers: 3 },
};

const STORAGE_KEY = 'hustle.scanner.v1';
const BACKUP_KEY = 'hustle.scanner.v1.corrupt-backup';
const RESTORE_TIMEOUT_MS = 5000;
const SAVE_FAIL_NOTE = 'Save failed — progress may not persist.';
const COMMIT_FAIL_NOTE = 'Commit could not be saved — try again. Your selection is unchanged.';

// Module scope, not per-instance — same reasoning as the Crisis slice: must survive
// remount so two component instances never issue concurrent setItem calls.
let writeQueue: Promise<void> = Promise.resolve();

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
}

function queuedWrite(key: string, payload: string): Promise<void> {
  const p = writeQueue.then(() => AsyncStorage.setItem(key, payload));
  // Swallow so a failed write doesn't leave writeQueue permanently rejected for
  // whichever caller chains onto it next; failure is reported to the caller of
  // queuedWrite via the returned/awaited promise below, not lost.
  writeQueue = p.catch(() => undefined);
  return p;
}

/** Structural + relational check — mirrors the Crisis slice's isValidCrisisState
 *  discipline: refuse corrupt/foreign data and internally-inconsistent data, not
 *  just wrong-typed fields. */
function isValidScannerState(v: unknown): v is ScannerRunState {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  const structural =
    s.scanned !== null &&
    typeof s.scanned === 'object' &&
    Object.values(s.scanned as Record<string, unknown>).every((x) => typeof x === 'boolean') &&
    (s.selected === null || typeof s.selected === 'string') &&
    (s.committedTo === null || typeof s.committedTo === 'string') &&
    (s.cash === null || (typeof s.cash === 'number' && Number.isFinite(s.cash))) &&
    (s.setupCost === null || (typeof s.setupCost === 'number' && Number.isFinite(s.setupCost)));
  if (!structural) return false;

  // Relational invariants this slice's own transitions guarantee and a corrupted/
  // hand-edited save could violate:
  const scanned = s.scanned as Record<string, boolean>;
  const selected = s.selected as string | null;
  const committedTo = s.committedTo as string | null;
  const cash = s.cash as number | null;
  if (selected !== null && !scanned[selected]) return false; // can't select the unscanned
  if (committedTo !== null && selected !== committedTo) return false; // commit implies selection matches
  if (committedTo !== null && cash === null) return false; // committed implies cash is set
  if (committedTo === null && cash !== null) return false; // uncommitted implies cash is unset
  return true;
}

function ScannerSlice() {
  const [state, setState] = useState<ScannerRunState>(() => createInitialScannerState());
  const [restoring, setRestoring] = useState(true);
  const [restoreNote, setRestoreNote] = useState<string | null>(null);
  const [committing, setCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);
  const hydrated = useRef(false);
  const committingRef = useRef(false);

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
          if (parseOk && isValidScannerState(parsed)) {
            setState(parsed);
            setRestoreNote(parsed.committedTo ? 'Restored committed run.' : 'Restored saved run.');
          } else {
            AsyncStorage.setItem(BACKUP_KEY, raw).catch((e) =>
              console.warn('[hustle] backup of corrupt save failed', e),
            );
            setRestoreNote('Saved data was invalid — starting fresh (corrupt copy backed up).');
            setState(createInitialScannerState());
          }
        }
      } catch (e) {
        console.warn('[hustle] restore failed', e);
        if (!cancelled) {
          setRestoreNote('Could not read saved run — starting fresh.');
          setState(createInitialScannerState());
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

  // Fire-and-forget autosave for non-destructive transitions (scan/select) — same
  // pattern as the Crisis slice. Commit does NOT rely on this effect for its
  // durability guarantee; see commit() below, which persists synchronously before
  // flipping the render state.
  useEffect(() => {
    if (!hydrated.current) return;
    const payload = JSON.stringify(state);
    queuedWrite(STORAGE_KEY, payload).then(
      () => setRestoreNote((n) => (n === SAVE_FAIL_NOTE ? null : n)),
      (e) => {
        console.warn('[hustle] save failed', e);
        setRestoreNote(SAVE_FAIL_NOTE);
      },
    );
  }, [state]);

  function scan() {
    setState((prev) => scanSpot(prev, BIZ.id));
  }

  function select() {
    setState((prev) => {
      const r = selectSpot(prev, BIZ.id);
      return r.state;
    });
  }

  /**
   * Commit atomicity (DECISIONS.md -> "Scanner commit atomicity"):
   * 1. Validate (commitSpot is pure — no side effects yet).
   * 2. Compute the complete post-commit state.
   * 3+4. Persist that exact JSON BEFORE touching render state.
   * 5. Only on persist success does setState flip the UI into the committed view.
   * On persist failure: render state is untouched (still pre-commit, recoverable),
   * the failure is surfaced via commitError, and nothing partially applies.
   */
  async function commit() {
    // Ref, not the `committing` state value: two onPress calls dispatched in the
    // same JS tick (a fast double-tap, before RN's `disabled` prop re-renders)
    // would both close over the same stale `committing===false`, exactly the
    // stale-closure race the Crisis slice's adversary review caught in pick()
    // (ROADMAP.md Phase 3). A ref is read/written synchronously, so the second
    // call sees the first call's write immediately, same JS tick or not.
    if (committingRef.current) return;
    const result = commitSpot(state, BIZ, CAPITAL);
    if (!result.ok) {
      setCommitError(result.reason === 'over-budget' ? 'Not enough capital.' : 'Select the spot first.');
      return;
    }
    committingRef.current = true;
    setCommitting(true);
    setCommitError(null);
    try {
      const payload = JSON.stringify(result.state);
      await queuedWrite(STORAGE_KEY, payload);
      setState(result.state);
    } catch (e) {
      console.warn('[hustle] commit persist failed', e);
      setCommitError(COMMIT_FAIL_NOTE);
      // state intentionally left untouched — still pre-commit.
    } finally {
      committingRef.current = false;
      setCommitting(false);
    }
  }

  if (restoring) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />
        <View style={styles.scroll}>
          <Text style={styles.header}>HUSTLE — Scanner (RN validation slice)</Text>
          <Text style={styles.body}>Loading saved run…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isScanned = !!state.scanned[BIZ.id];
  const isSelected = state.selected === BIZ.id;
  const isCommitted = state.committedTo === BIZ.id;
  const fv = forcesOf(BIZ, FORCES_TABLE, 0);
  const total = forcesTotal(fv);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header} testID="header">HUSTLE — Scanner (RN validation slice)</Text>
        {restoreNote && (
          <Text style={styles.body} testID="restoreNote">{restoreNote}</Text>
        )}
        <Text style={styles.body} testID="wallet">Wallet: R{CAPITAL.toLocaleString()}</Text>

        <View style={styles.card} testID="spot-phonerepair">
          <Text style={styles.title}>{BIZ.name}</Text>

          {!isScanned && (
            <TouchableOpacity style={styles.button} testID="scanBtn" onPress={scan}>
              <Text style={styles.buttonText}>Scan this spot</Text>
            </TouchableOpacity>
          )}

          {isScanned && (
            <>
              <Text style={styles.body} testID="readout">
                Demand {BIZ.demand} · Competition {BIZ.comp} · Cost R{BIZ.cost.toLocaleString()}
              </Text>
              <Text style={styles.body} testID="forces">
                Five forces: {pressureWord(total)} ({total}/15)
              </Text>
              {affordable(BIZ, CAPITAL) ? (
                <Text style={styles.body} testID="opening">
                  Leaves R{opening(BIZ, CAPITAL).toLocaleString()} to trade with.
                </Text>
              ) : (
                <Text style={styles.overbudget} testID="overbudget">
                  Over budget by R{overBy(BIZ, CAPITAL).toLocaleString()}
                </Text>
              )}

              {!isSelected && !isCommitted && (
                <TouchableOpacity style={styles.button} testID="selectBtn" onPress={select}>
                  <Text style={styles.buttonText}>Choose this spot</Text>
                </TouchableOpacity>
              )}

              {isSelected && !isCommitted && (
                <>
                  <Text style={styles.selectedNote} testID="selectedNote">Selected — not yet committed.</Text>
                  <TouchableOpacity
                    style={[styles.button, styles.commitButton]}
                    testID="commitBtn"
                    onPress={commit}
                    disabled={committing}
                  >
                    {committing ? (
                      <ActivityIndicator color="#14100D" />
                    ) : (
                      <Text style={styles.buttonText}>Commit R{BIZ.cost.toLocaleString()}</Text>
                    )}
                  </TouchableOpacity>
                  {commitError && (
                    <Text style={styles.overbudget} testID="commitError">{commitError}</Text>
                  )}
                </>
              )}

              {isCommitted && (
                <View testID="committedPanel">
                  <Text style={styles.committedNote} testID="committedNote">
                    Committed R{(state.setupCost ?? 0).toLocaleString()} to {BIZ.name}.
                  </Text>
                  <Text style={styles.body} testID="cash">
                    Cash: R{(state.cash ?? 0).toLocaleString()}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ScannerSlice />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#14100D' },
  scroll: { padding: 20, gap: 16 },
  header: { color: '#F5EDE3', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  body: { color: '#CBBBA6', fontSize: 14, marginBottom: 6 },
  card: { backgroundColor: '#1F1813', borderRadius: 12, padding: 16, gap: 6 },
  title: { color: '#F5EDE3', fontSize: 17, fontWeight: '700', marginBottom: 6 },
  overbudget: { color: '#E2571E', fontSize: 13, marginTop: 4 },
  selectedNote: { color: '#F2A81C', fontSize: 13, marginTop: 6 },
  committedNote: { color: '#F2A81C', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  button: {
    backgroundColor: '#E2571E',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  commitButton: { backgroundColor: '#2E7D32' },
  buttonText: { color: '#14100D', fontSize: 15, fontWeight: '700' },
});
