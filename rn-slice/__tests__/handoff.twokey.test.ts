/**
 * Two-key Scanner->Plan handoff experiment (2026-08-13). THROWAWAY HARNESS — no UI,
 * no Maestro, no real Plan screen/content. Answers one question: if Scanner-committed
 * identity (KEY A) and a minimal Plan-handoff record (KEY B) live in separate
 * AsyncStorage keys, using the REAL queuedWrite()/writeQueue mechanism
 * (src/persistence/queuedWrite.ts, same one exercised by
 * persistence.coexistence.test.ts), can a downstream Crisis-shaped reader ever be
 * fooled into thinking two different businesses are both "the active one"?
 *
 * KEY A shape: real ScannerRunState (from src/domain/scanner/types.ts), specifically
 * its `committedTo: BusinessId | null` field — reuses the actual domain type, not a
 * reimplementation.
 * KEY B shape: minimal Plan-handoff record `{ businessId: BusinessId, planConfirmedAt: number }`
 * — intentionally NOT a real Plan model, per approved scope (no Plan content/UI).
 *
 * simulatedCrisisRead() below is the ONE piece of "production-shaped" logic this
 * harness introduces (deliberately, to have something to test the boundaries
 * against). It embodies the conservative candidate contract from the report's
 * §3 comparison: Crisis requires BOTH keys to exist AND agree on business id before
 * treating any business as active — i.e. neither key is unilaterally authoritative,
 * both must corroborate. This is stricter than any of the three contracts described
 * in the report standing alone; it exists here purely to prove the failure boundaries
 * are actually detectable, not because it must be the production choice (P4/§3 covers
 * that we do NOT recommend that this be the actual production contract — see report).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ScannerRunState } from '../src/domain/scanner/types';
import type { BusinessId } from '../src/domain/business';

const mockStore = new Map<string, string>();
let mockFailNextSetItemForKey: string | null = null;

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((k: string) => Promise.resolve(mockStore.has(k) ? (mockStore.get(k) as string) : null)),
    setItem: jest.fn((k: string, v: string) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      if (mockFailNextSetItemForKey === k) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        mockFailNextSetItemForKey = null;
        return Promise.reject(new Error(`simulated native write failure for ${k}`));
      }
      mockStore.set(k, v);
      return Promise.resolve();
    }),
  },
}));

import { queuedWrite, __resetQueueForTests } from '../src/persistence/queuedWrite';

const KEY_A = 'hustle.scanner.v1';
const KEY_B = 'hustle.plan-handoff.v1';

interface PlanHandoff {
  businessId: BusinessId;
  planConfirmedAt: number;
}

function scannerState(committedTo: BusinessId | null): ScannerRunState {
  return {
    scanned: committedTo ? { [committedTo]: true } : {},
    selected: committedTo,
    committedTo,
    cash: committedTo ? 1300 : null,
    setupCost: committedTo ? 1200 : null,
  };
}

function writeA(committedTo: BusinessId | null) {
  return queuedWrite(KEY_A, JSON.stringify(scannerState(committedTo)));
}

function writeB(rec: PlanHandoff) {
  return queuedWrite(KEY_B, JSON.stringify(rec));
}

/** Structural validation only — mirrors App.tsx's isValidScannerState discipline;
 *  refuses malformed/foreign data rather than trusting it. */
function isValidScannerState(v: unknown): v is ScannerRunState {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.scanned === 'object' &&
    s.scanned !== null &&
    (typeof s.committedTo === 'string' || s.committedTo === null)
  );
}

function isValidPlanHandoff(v: unknown): v is PlanHandoff {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return typeof s.businessId === 'string' && typeof s.planConfirmedAt === 'number';
}

type CrisisReadResult =
  | { ok: true; businessId: BusinessId }
  | { ok: false; reason: 'a-missing' | 'a-invalid' | 'b-missing' | 'b-invalid' | 'a-not-committed' | 'mismatch' };

/** The one "production-shaped" piece of logic under test — see file header. Reads
 *  BOTH keys fresh from storage (no in-memory state carried across calls) and
 *  refuses to report an active business unless both keys exist, are individually
 *  valid, and agree. */
async function simulatedCrisisRead(): Promise<CrisisReadResult> {
  const rawA = await AsyncStorage.getItem(KEY_A);
  if (rawA === null) return { ok: false, reason: 'a-missing' };
  let parsedA: unknown;
  try {
    parsedA = JSON.parse(rawA);
  } catch {
    return { ok: false, reason: 'a-invalid' };
  }
  if (!isValidScannerState(parsedA)) return { ok: false, reason: 'a-invalid' };
  if (!parsedA.committedTo) return { ok: false, reason: 'a-not-committed' };

  const rawB = await AsyncStorage.getItem(KEY_B);
  if (rawB === null) return { ok: false, reason: 'b-missing' };
  let parsedB: unknown;
  try {
    parsedB = JSON.parse(rawB);
  } catch {
    return { ok: false, reason: 'b-invalid' };
  }
  if (!isValidPlanHandoff(parsedB)) return { ok: false, reason: 'b-invalid' };

  if (parsedB.businessId !== parsedA.committedTo) return { ok: false, reason: 'mismatch' };

  return { ok: true, businessId: parsedA.committedTo as BusinessId };
}

beforeEach(() => {
  mockStore.clear();
  mockFailNextSetItemForKey = null;
  __resetQueueForTests();
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// §2 Happy path: A writes X -> B writes handoff for X -> Crisis read requires both.
// ---------------------------------------------------------------------------
test('happy path: A commits X, B confirms Plan for X, Crisis read succeeds with X', async () => {
  await writeA('phonerepair');
  await writeB({ businessId: 'phonerepair', planConfirmedAt: 1000 });
  const result = await simulatedCrisisRead();
  expect(result).toEqual({ ok: true, businessId: 'phonerepair' });
});

// ---------------------------------------------------------------------------
// §2 Kill-window boundaries — every boundary the task specifies, each with an
// explicit expected behavior asserted.
// ---------------------------------------------------------------------------
describe('kill-window boundaries', () => {
  test('1. before A write: nothing exists -> Crisis read refuses (a-missing)', async () => {
    const result = await simulatedCrisisRead();
    expect(result).toEqual({ ok: false, reason: 'a-missing' });
  });

  test('2. after A write, before B write: A exists, B does not -> Crisis read refuses (b-missing), never derives identity from A alone', async () => {
    await writeA('phonerepair');
    const result = await simulatedCrisisRead();
    expect(result).toEqual({ ok: false, reason: 'b-missing' });
  });

  test('3. before B write (restated): identical to case 2 under this contract — no additional state exists between "after A" and "before B start", they are the same observable state', async () => {
    await writeA('spaza');
    const result = await simulatedCrisisRead();
    expect(result).toEqual({ ok: false, reason: 'b-missing' });
  });

  test('4. after B write: both exist and agree -> Crisis read succeeds', async () => {
    await writeA('salon');
    await writeB({ businessId: 'salon', planConfirmedAt: 42 });
    const result = await simulatedCrisisRead();
    expect(result).toEqual({ ok: true, businessId: 'salon' });
  });

  test('5. after B write but before Crisis read (crash simulation): a FRESH simulatedCrisisRead() call, with no carried-over in-memory state, re-reads storage and still succeeds — proves the read logic does not depend on process-lifetime state', async () => {
    await writeA('clothing');
    await writeB({ businessId: 'clothing', planConfirmedAt: 7 });
    // Simulate a full process death/restart: nothing survives except AsyncStorage
    // (mockStore) and a fresh module load equivalent (__resetQueueForTests + a
    // brand-new call, no reuse of any promise/variable from the writes above).
    __resetQueueForTests();
    const freshRead = await simulatedCrisisRead();
    expect(freshRead).toEqual({ ok: true, businessId: 'clothing' });
  });
});

// ---------------------------------------------------------------------------
// §4 Adversarial pass — one test case per listed scenario.
// ---------------------------------------------------------------------------
describe('adversarial', () => {
  test('A exists / B does not -> refused, not a silent "assume A" pass', async () => {
    await writeA('phonerepair');
    expect(await simulatedCrisisRead()).toEqual({ ok: false, reason: 'b-missing' });
  });

  test('B exists / wrong business (A missing) -> refused as a-missing, B alone never grants identity', async () => {
    await writeB({ businessId: 'phonerepair', planConfirmedAt: 1 });
    expect(await simulatedCrisisRead()).toEqual({ ok: false, reason: 'a-missing' });
  });

  test('A=business-X / B=business-Y mismatch -> refused, never silently picks one side', async () => {
    await writeA('phonerepair');
    await writeB({ businessId: 'spaza', planConfirmedAt: 1 });
    expect(await simulatedCrisisRead()).toEqual({ ok: false, reason: 'mismatch' });
  });

  test('B corrupt (invalid JSON) -> refused, not treated as missing or as valid', async () => {
    await writeA('phonerepair');
    // Bypass queuedWrite to inject raw corruption directly into the mock store,
    // simulating on-disk corruption rather than an application-level write.
    mockStore.set(KEY_B, '{not valid json');
    expect(await simulatedCrisisRead()).toEqual({ ok: false, reason: 'b-invalid' });
  });

  test('B stale: belongs to a business A no longer points to (A recommitted after B was written) -> refused as mismatch', async () => {
    await writeA('phonerepair');
    await writeB({ businessId: 'phonerepair', planConfirmedAt: 1 });
    // Scanner recommits to a different business; nothing re-syncs B (this is exactly
    // the "stale Plan survives recommit" failure mode from the prototype's historical
    // bug, hustle-shell.html ~2852-2858, reproduced at the two-key level).
    await writeA('salon');
    expect(await simulatedCrisisRead()).toEqual({ ok: false, reason: 'mismatch' });
  });

  test('process dies between A write and B write -> a subsequent fresh read still correctly refuses (b-missing), never fabricates B', async () => {
    await writeA('shisanyama');
    __resetQueueForTests(); // simulated restart mid-handoff
    expect(await simulatedCrisisRead()).toEqual({ ok: false, reason: 'b-missing' });
  });

  test('repeated writes to A (same business, N times) do not change the outcome', async () => {
    await writeA('phonerepair');
    await writeA('phonerepair');
    await writeA('phonerepair');
    await writeB({ businessId: 'phonerepair', planConfirmedAt: 1 });
    expect(await simulatedCrisisRead()).toEqual({ ok: true, businessId: 'phonerepair' });
  });

  test('duplicate writes to B (identical payload, N times) do not change the outcome', async () => {
    await writeA('phonerepair');
    await writeB({ businessId: 'phonerepair', planConfirmedAt: 1 });
    await writeB({ businessId: 'phonerepair', planConfirmedAt: 1 });
    expect(await simulatedCrisisRead()).toEqual({ ok: true, businessId: 'phonerepair' });
  });

  test('write failure on A: A write rejects, B write still succeeds (reused forced-failure mock pattern) -> Crisis read still correctly refuses since A never actually landed', async () => {
    mockFailNextSetItemForKey = KEY_A;
    await expect(writeA('phonerepair')).rejects.toThrow(/simulated native write failure/);
    await writeB({ businessId: 'phonerepair', planConfirmedAt: 1 });
    // A's failed write means KEY_A was never set at all (first-ever write to A).
    expect(await simulatedCrisisRead()).toEqual({ ok: false, reason: 'a-missing' });
  });

  test('write failure on B: B write rejects after A succeeded -> Crisis read correctly refuses (b-missing), A failure does not corrupt or block A', async () => {
    await writeA('phonerepair');
    mockFailNextSetItemForKey = KEY_B;
    await expect(writeB({ businessId: 'phonerepair', planConfirmedAt: 1 })).rejects.toThrow(
      /simulated native write failure/
    );
    expect(await simulatedCrisisRead()).toEqual({ ok: false, reason: 'b-missing' });
    // A's own value must be untouched by B's unrelated failure.
    const a = JSON.parse((await AsyncStorage.getItem(KEY_A)) as string);
    expect(a.committedTo).toBe('phonerepair');
  });

  test('restore after partial handoff: A committed, B never written, app relaunches (fresh read) -> deterministically refuses, and a subsequent successful B write then makes it succeed (recoverable, not stuck)', async () => {
    await writeA('phonerepair');
    __resetQueueForTests();
    expect(await simulatedCrisisRead()).toEqual({ ok: false, reason: 'b-missing' });
    // Recovery: completing the handoff later succeeds cleanly.
    await writeB({ businessId: 'phonerepair', planConfirmedAt: 99 });
    expect(await simulatedCrisisRead()).toEqual({ ok: true, businessId: 'phonerepair' });
  });
});

// ---------------------------------------------------------------------------
// §6 Destructive recommit: A committed to X with downstream Plan-shaped state (B)
// for X -> recommit A to Y -> B for X must not survive mislabeled as belonging to Y.
// This harness does NOT implement an atomic multi-key transaction (see report §3/§9);
// it proves the CURRENT two-independent-keys reality does NOT silently misattribute
// stale B to the new business — the read-side guard (mismatch detection) catches it,
// even though nothing proactively deletes/resets B on recommit.
// ---------------------------------------------------------------------------
test('§6 destructive recommit: recommitting A to a different business leaves stale B for the old business, and Crisis read must refuse rather than misattribute it to the new business', async () => {
  await writeA('phonerepair');
  await writeB({ businessId: 'phonerepair', planConfirmedAt: 1 });
  expect(await simulatedCrisisRead()).toEqual({ ok: true, businessId: 'phonerepair' });

  // Recommit to a different business — mirrors hustle-shell.html:2845-2867's
  // commitBtn handler recommitting to a NEW business. In the prototype this reset
  // Crisis state and `state.plan = {}` atomically in the same synchronous block
  // before a single save(). Here, A and B are independent AsyncStorage keys and
  // NOTHING in this harness resets B when A recommits — that is the exact gap
  // the report's §3 "combined transactional record" option exists to close.
  await writeA('salon');

  // The critical assertion: B (stale, still says "phonerepair") must NEVER be
  // reported as valid for the newly committed business "salon". It also must not
  // be silently reported as still valid for "phonerepair" (Crisis has no business
  // asking about phonerepair anymore — A no longer points there).
  const result = await simulatedCrisisRead();
  expect(result).toEqual({ ok: false, reason: 'mismatch' });
  expect(result).not.toEqual({ ok: true, businessId: 'salon' });
  expect(result).not.toEqual({ ok: true, businessId: 'phonerepair' });
});

// ---------------------------------------------------------------------------
// §5 Negative controls (mandatory) — prove the harness can detect wrong behavior,
// not just pass vacuously.
// ---------------------------------------------------------------------------
describe('negative controls — these must fail, proving the harness is not vacuous', () => {
  test('asserting A=spaza/B=phonerepair (mismatch) as if it were ok:true fails', async () => {
    await writeA('spaza');
    await writeB({ businessId: 'phonerepair', planConfirmedAt: 1 });
    const result = await simulatedCrisisRead();
    expect(() => expect(result).toEqual({ ok: true, businessId: 'spaza' })).toThrow();
    expect(() => expect(result).toEqual({ ok: true, businessId: 'phonerepair' })).toThrow();
  });

  test('B missing must not silently pass as ok:true', async () => {
    await writeA('phonerepair');
    const result = await simulatedCrisisRead();
    expect(() => expect(result).toEqual({ ok: true, businessId: 'phonerepair' })).toThrow();
  });

  test('corrupt B must not silently pass as ok:true', async () => {
    await writeA('phonerepair');
    mockStore.set(KEY_B, '{not valid json');
    const result = await simulatedCrisisRead();
    expect(() => expect(result).toEqual({ ok: true, businessId: 'phonerepair' })).toThrow();
  });

  test('a forced write failure is actually observed (not swallowed) and a wrong "it resolved" expectation on that failing write itself fails', async () => {
    mockFailNextSetItemForKey = KEY_A;
    const p = writeA('phonerepair');
    await expect(p).rejects.toThrow();
    mockFailNextSetItemForKey = KEY_A;
    const p2 = writeA('phonerepair');
    await expect(expect(p2).resolves.toBeUndefined()).rejects.toThrow();
  });
});
