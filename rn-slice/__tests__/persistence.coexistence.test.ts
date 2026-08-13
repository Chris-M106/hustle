/**
 * Persistence-mechanism coexistence experiment (2026-08-12).
 *
 * QUESTION: can multiple HUSTLE state slices safely share the existing AsyncStorage
 * write-queue mechanism (src/persistence/queuedWrite.ts, extracted unmodified from
 * App.tsx's Scanner slice) when writes to different keys interleave?
 *
 * This exercises the REAL queuedWrite()/writeQueue from src/persistence/queuedWrite.ts
 * — not a reimplementation. It does NOT exercise the App.tsx component, React state,
 * restore/backup logic, or any UI — infrastructure-only, per the approved experiment
 * scope. It proves the queue mechanism, not the future multi-screen application.
 *
 * SLICE_A mimics hustle.scanner.v1 shape, SLICE_B mimics hustle.crisis.v1 shape —
 * shapes are illustrative only, the queue is shape-agnostic (it just moves strings).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockStore = new Map<string, string>();
let mockFailNextSetItemForKey: string | null = null;

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((k: string) => Promise.resolve(mockStore.has(k) ? (mockStore.get(k) as string) : null)),
    setItem: jest.fn((k: string, v: string) => {
      // Test hook: force exactly one setItem for a given key to fail, to prove failures
      // don't silently corrupt storage or block other keys' writes.
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

const KEY_A = 'hustle.scanner.v1'; // SLICE_A
const KEY_B = 'hustle.crisis.v1'; // SLICE_B

function scannerPayload(n: number) {
  return JSON.stringify({
    scanned: { phonerepair: true },
    selected: n > 0 ? 'phonerepair' : null,
    committedTo: null,
    cash: null,
    setupCost: null,
    _seq: n, // test-only marker to prove ordering, not part of the real domain shape
  });
}

function crisisPayload(n: number) {
  return JSON.stringify({
    day: n,
    activeDeckId: 'deck-1',
    resolvedCardIds: Array.from({ length: n }, (_, i) => `card-${i}`),
    _seq: n,
  });
}

beforeEach(() => {
  mockStore.clear();
  mockFailNextSetItemForKey = null;
  __resetQueueForTests();
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// 1. Alternating: A, B, A, B
// ---------------------------------------------------------------------------
test('alternating writes (A,B,A,B) preserve each key final state and do not cross-contaminate', async () => {
  await queuedWrite(KEY_A, scannerPayload(1));
  await queuedWrite(KEY_B, crisisPayload(1));
  await queuedWrite(KEY_A, scannerPayload(2));
  await queuedWrite(KEY_B, crisisPayload(2));

  const a = JSON.parse((await AsyncStorage.getItem(KEY_A)) as string);
  const b = JSON.parse((await AsyncStorage.getItem(KEY_B)) as string);
  expect(a._seq).toBe(2);
  expect(b._seq).toBe(2);
  expect(a.scanned).toEqual({ phonerepair: true }); // A's shape untouched by B
  expect(b.day).toBe(2); // B's shape untouched by A
});

// ---------------------------------------------------------------------------
// 2. Clustered: A, B, B, A
// ---------------------------------------------------------------------------
test('clustered writes (A,B,B,A) preserve each key final state', async () => {
  await queuedWrite(KEY_A, scannerPayload(1));
  await queuedWrite(KEY_B, crisisPayload(1));
  await queuedWrite(KEY_B, crisisPayload(2));
  await queuedWrite(KEY_A, scannerPayload(3));

  const a = JSON.parse((await AsyncStorage.getItem(KEY_A)) as string);
  const b = JSON.parse((await AsyncStorage.getItem(KEY_B)) as string);
  expect(a._seq).toBe(3);
  expect(b._seq).toBe(2);
});

// ---------------------------------------------------------------------------
// 3. Overlapping/concurrent: fire many unawaited writes to both keys via Promise.all,
//    proving the shared queue serializes them into the call order rather than losing
//    or reordering any of them.
// ---------------------------------------------------------------------------
test('concurrent unawaited writes to both keys are serialized in call order — last call per key wins, no loss', async () => {
  const calls: Array<Promise<void>> = [];
  const order: string[] = [];
  const N = 20;
  for (let i = 1; i <= N; i++) {
    if (i % 2 === 0) {
      order.push(`A:${i}`);
      calls.push(queuedWrite(KEY_A, scannerPayload(i)));
    } else {
      order.push(`B:${i}`);
      calls.push(queuedWrite(KEY_B, crisisPayload(i)));
    }
  }
  await Promise.all(calls);

  const a = JSON.parse((await AsyncStorage.getItem(KEY_A)) as string);
  const b = JSON.parse((await AsyncStorage.getItem(KEY_B)) as string);
  // Last A write issued was i=20, last B write issued was i=19.
  expect(a._seq).toBe(20);
  expect(b._seq).toBe(19);

  // Every intermediate setItem call actually happened, in call order, for the correct
  // key — the shared single-file queue doesn't drop or reorder cross-key calls even
  // though it was never awaited between calls.
  const setItemMock = AsyncStorage.setItem as jest.Mock;
  expect(setItemMock).toHaveBeenCalledTimes(N);
  const calledKeysInOrder = setItemMock.mock.calls.map((c) => c[0]);
  expect(calledKeysInOrder).toEqual(order.map((o) => (o.startsWith('A') ? KEY_A : KEY_B)));
});

// ---------------------------------------------------------------------------
// 4. Final-state integrity: A valid -> B update -> A update -> read all keys -> verify
//    nothing lost/corrupted.
// ---------------------------------------------------------------------------
test('final-state integrity check across both keys after mixed updates', async () => {
  await queuedWrite(KEY_A, scannerPayload(1));
  await queuedWrite(KEY_B, crisisPayload(5));
  await queuedWrite(KEY_A, scannerPayload(9));

  const rawA = await AsyncStorage.getItem(KEY_A);
  const rawB = await AsyncStorage.getItem(KEY_B);
  expect(rawA).not.toBeNull();
  expect(rawB).not.toBeNull();
  const a = JSON.parse(rawA as string);
  const b = JSON.parse(rawB as string);
  expect(a._seq).toBe(9);
  expect(b._seq).toBe(5);
  expect(b.resolvedCardIds).toHaveLength(5); // B's internal structure intact, not touched by A writes
});

// ---------------------------------------------------------------------------
// Adversarial: one key's write failure must not silently corrupt or block the other
// key's subsequent write, and the failure must surface to ITS OWN caller.
// ---------------------------------------------------------------------------
test('a failing write to key A does not corrupt A storage, does not block, and does not silently swallow B writes', async () => {
  await queuedWrite(KEY_A, scannerPayload(1)); // A has a good baseline value
  mockFailNextSetItemForKey = KEY_A;

  const failingWrite = queuedWrite(KEY_A, scannerPayload(2)); // this call's setItem will reject
  const bWrite = queuedWrite(KEY_B, crisisPayload(1)); // queued right after, must still succeed

  await expect(failingWrite).rejects.toThrow(/simulated native write failure/);
  await expect(bWrite).resolves.toBeUndefined();

  // A's storage must still hold the last successfully-written value (1), not be
  // corrupted, not silently show the failed payload (2).
  const a = JSON.parse((await AsyncStorage.getItem(KEY_A)) as string);
  expect(a._seq).toBe(1);

  // B's write was not blocked or lost by A's failure, despite sharing one queue.
  const b = JSON.parse((await AsyncStorage.getItem(KEY_B)) as string);
  expect(b._seq).toBe(1);

  // A subsequent write to A after the failure must still go through — the queue must
  // not be left permanently wedged/rejected by the earlier failure.
  await queuedWrite(KEY_A, scannerPayload(3));
  const a2 = JSON.parse((await AsyncStorage.getItem(KEY_A)) as string);
  expect(a2._seq).toBe(3);
});

// ---------------------------------------------------------------------------
// Adversarial: queue starvation / duplication check — writing the same key N times
// back-to-back with a slow-but-real setItem must not duplicate or drop entries and
// must call setItem exactly N times, in order.
// ---------------------------------------------------------------------------
test('rapid same-key writes are not duplicated or dropped, and land in issue order', async () => {
  const N = 10;
  const calls: Array<Promise<void>> = [];
  for (let i = 1; i <= N; i++) {
    calls.push(queuedWrite(KEY_A, scannerPayload(i)));
  }
  await Promise.all(calls);
  const setItemMock = AsyncStorage.setItem as jest.Mock;
  const aCalls = setItemMock.mock.calls.filter((c) => c[0] === KEY_A);
  expect(aCalls).toHaveLength(N);
  const seqs = aCalls.map((c) => JSON.parse(c[1])._seq);
  expect(seqs).toEqual(Array.from({ length: N }, (_, i) => i + 1)); // strict issue order
  const final = JSON.parse((await AsyncStorage.getItem(KEY_A)) as string);
  expect(final._seq).toBe(N);
});

// ---------------------------------------------------------------------------
// NEGATIVE CONTROLS (mandatory) — prove the harness actually detects wrong behavior
// rather than passing vacuously.
// ---------------------------------------------------------------------------
describe('negative controls — these must fail, proving the harness is not vacuous', () => {
  test('asserting a deliberately wrong final value fails', async () => {
    await queuedWrite(KEY_A, scannerPayload(1));
    const a = JSON.parse((await AsyncStorage.getItem(KEY_A)) as string);
    expect(() => expect(a._seq).toBe(999)).toThrow();
  });

  test('a corrupted/mismatched payload is detected, not silently accepted', async () => {
    await queuedWrite(KEY_A, scannerPayload(1));
    // Manually corrupt the stored payload to simulate a real corruption scenario,
    // then confirm a structural check on it fails (proving the harness can tell
    // valid from invalid, same discipline as isValidScannerState in App.tsx).
    mockStore.set(KEY_A, '{not valid json');
    let threw = false;
    try {
      JSON.parse(mockStore.get(KEY_A) as string);
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });

  test('a forced write failure is actually observed, and a wrong "it resolved" expectation on that same failing write fails', async () => {
    mockFailNextSetItemForKey = KEY_A;
    const p = queuedWrite(KEY_A, scannerPayload(1));
    // If the harness merely awaited without asserting rejection, this failure would
    // pass silently. Confirm rejection is actually observed.
    await expect(p).rejects.toThrow();

    // Re-arm the same failure on a fresh write and prove a deliberately wrong
    // "resolves" expectation against it fails — showing the assertion machinery
    // isn't a tautology that would pass regardless of outcome.
    mockFailNextSetItemForKey = KEY_A;
    const p2 = queuedWrite(KEY_A, scannerPayload(2));
    await expect(expect(p2).resolves.toBeUndefined()).rejects.toThrow();
  });
});
