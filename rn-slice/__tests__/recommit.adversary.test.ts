/**
 * Adversarial tests for the recommit-invalidation contract, exercising the REAL
 * queuedWrite/queuedRemove mechanism (src/persistence/queuedWrite.ts) and the real
 * invalidateDownstreamOnRecommit orchestrator (src/persistence/recommitInvalidation.ts)
 * against a mocked AsyncStorage. Central question (from the task spec): can any
 * persisted combination make a downstream reader believe business B owns Plan or
 * Crisis state that actually belongs to business A? Every test below answers that
 * with the domain-level guard (isPlanValidFor/isCrisisValidFor), not by trusting
 * that the proactive clear succeeded — that's the point of the two-layer design.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockStore = new Map<string, string>();
let mockFailNextRemoveForKey: string | null = null;
let mockFailNextSetForKey: string | null = null;

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((k: string) => Promise.resolve(mockStore.has(k) ? (mockStore.get(k) as string) : null)),
    setItem: jest.fn((k: string, v: string) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      if (mockFailNextSetForKey === k) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        mockFailNextSetForKey = null;
        return Promise.reject(new Error(`simulated write failure for ${k}`));
      }
      mockStore.set(k, v);
      return Promise.resolve();
    }),
    removeItem: jest.fn((k: string) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      if (mockFailNextRemoveForKey === k) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        mockFailNextRemoveForKey = null;
        return Promise.reject(new Error(`simulated remove failure for ${k}`));
      }
      mockStore.delete(k);
      return Promise.resolve();
    }),
  },
}));

import { queuedWrite, __resetQueueForTests } from '../src/persistence/queuedWrite';
import {
  invalidateDownstreamOnRecommit,
  readJsonKey,
  PLAN_KEY,
  CRISIS_KEY,
} from '../src/persistence/recommitInvalidation';
import { isPlanValidFor, isCrisisValidFor } from '../src/domain/recommit';
import type { BusinessId } from '../src/domain/business';

const SCANNER_KEY = 'hustle.scanner.v1';

function scannerState(committedTo: BusinessId | null) {
  return {
    scanned: committedTo ? { [committedTo]: true } : {},
    selected: committedTo,
    committedTo,
    cash: committedTo ? 1300 : null,
    setupCost: committedTo ? 1200 : null,
  };
}

function writeScanner(committedTo: BusinessId | null) {
  return queuedWrite(SCANNER_KEY, JSON.stringify(scannerState(committedTo)));
}

function writePlan(businessId: BusinessId, planConfirmedAt = 1000) {
  return queuedWrite(PLAN_KEY, JSON.stringify({ businessId, planConfirmedAt }));
}

function writeCrisis(biz: BusinessId, day = 5) {
  return queuedWrite(CRISIS_KEY, JSON.stringify({ biz, day, cash: 900 }));
}

/** The one thing that actually matters: is whatever is CURRENTLY on disk for Plan/
 *  Crisis trustworthy for the currently-committed business? Read fresh every time —
 *  no in-memory state carried across calls, matching how a real cold-launch reader
 *  would behave. */
async function currentlyTrustedDownstream(committedTo: BusinessId | null) {
  const plan = await readJsonKey(PLAN_KEY);
  const crisis = await readJsonKey(CRISIS_KEY);
  return {
    planTrusted: isPlanValidFor(plan, committedTo),
    crisisTrusted: isCrisisValidFor(crisis, committedTo),
  };
}

beforeEach(() => {
  mockStore.clear();
  mockFailNextRemoveForKey = null;
  mockFailNextSetForKey = null;
  __resetQueueForTests();
  jest.clearAllMocks();
});

test('recommit when Plan is absent: invalidation is a no-op, still no false trust', async () => {
  await writeScanner('phonerepair');
  expect(mockStore.get(SCANNER_KEY)).toBe(JSON.stringify(scannerState('phonerepair')));
  await invalidateDownstreamOnRecommit('phonerepair', 'spaza');
  const r = await currentlyTrustedDownstream('spaza');
  expect(r.planTrusted).toBe(false);
});

test('recommit when Crisis is absent: same', async () => {
  await writeScanner('phonerepair');
  expect(mockStore.get(SCANNER_KEY)).toBe(JSON.stringify(scannerState('phonerepair')));
  await invalidateDownstreamOnRecommit('phonerepair', 'spaza');
  const r = await currentlyTrustedDownstream('spaza');
  expect(r.crisisTrusted).toBe(false);
});

test('recommit when both Plan and Crisis exist: both cleared and neither trusted for B', async () => {
  await writePlan('phonerepair');
  await writeCrisis('phonerepair');
  const result = await invalidateDownstreamOnRecommit('phonerepair', 'spaza');
  expect(result).toEqual({ invalidated: true, planCleared: true, crisisCleared: true });
  expect(mockStore.has(PLAN_KEY)).toBe(false);
  expect(mockStore.has(CRISIS_KEY)).toBe(false);
  const r = await currentlyTrustedDownstream('spaza');
  expect(r.planTrusted).toBe(false);
  expect(r.crisisTrusted).toBe(false);
});

test('recommit with stale persisted B: a Plan record that already (coincidentally) names B pre-recommit is still cleared, not special-cased as trustworthy', async () => {
  await writePlan('spaza'); // already-correct record for the business we're about to commit to
  const result = await invalidateDownstreamOnRecommit('phonerepair', 'spaza');
  expect(result.planCleared).toBe(true); // still cleared — this experiment does not special-case coincidental correctness
  const r = await currentlyTrustedDownstream('spaza');
  expect(r.planTrusted).toBe(false); // correct: cleared record is absent, absent is never trusted
});

test('recommit with corrupt B: malformed JSON at Plan key is never trusted, regardless of invalidation outcome', async () => {
  mockStore.set(PLAN_KEY, '{not valid json');
  const r = await currentlyTrustedDownstream('spaza');
  expect(r.planTrusted).toBe(false);
});

test('write failure during invalidation: Plan remove fails, Crisis remove still proceeds, and NEITHER is ever trusted for B regardless', async () => {
  await writePlan('phonerepair');
  await writeCrisis('phonerepair');
  mockFailNextRemoveForKey = PLAN_KEY;
  const result = await invalidateDownstreamOnRecommit('phonerepair', 'spaza');
  expect(result.planCleared).toBe(false); // the clear itself failed
  expect(result.crisisCleared).toBe(true); // independent key, unaffected
  // The safety property must hold anyway: even though Plan's stale record for A is
  // STILL on disk (clear failed), the read-side guard refuses to trust it for B.
  const r = await currentlyTrustedDownstream('spaza');
  expect(r.planTrusted).toBe(false);
  expect(r.crisisTrusted).toBe(false);
  expect(mockStore.has(PLAN_KEY)).toBe(true); // proves this test actually exercised the failure path
});

test('rapid recommit: A -> B -> C in quick succession, each awaited — final state trusted only for C', async () => {
  await writePlan('phonerepair');
  await invalidateDownstreamOnRecommit('phonerepair', 'spaza');
  await writePlan('spaza');
  await invalidateDownstreamOnRecommit('spaza', 'salon');
  const r = await currentlyTrustedDownstream('salon');
  expect(r.planTrusted).toBe(false); // spaza's Plan record was cleared on the second recommit
  expect(await currentlyTrustedDownstream('spaza')).toEqual({ planTrusted: false, crisisTrusted: false });
});

test('same-tick recommit: two invalidation calls fired without awaiting the first — queue serializes them, no lost update', async () => {
  await writePlan('phonerepair');
  await writeCrisis('phonerepair');
  const p1 = invalidateDownstreamOnRecommit('phonerepair', 'spaza');
  const p2 = invalidateDownstreamOnRecommit('phonerepair', 'salon'); // fired same tick, not awaited yet
  const [r1, r2] = await Promise.all([p1, p2]);
  expect(r1.invalidated).toBe(true);
  expect(r2.invalidated).toBe(true);
  // Whichever "new business" ends up as ground truth (Scanner's own key decides that,
  // not this test), Plan/Crisis must be gone either way — same-tick double-fire must
  // not leave a partially-applied clear.
  expect(mockStore.has(PLAN_KEY)).toBe(false);
  expect(mockStore.has(CRISIS_KEY)).toBe(false);
});

test('queue actually serializes, not just coincidentally ends empty: a write interleaved between two same-tick invalidations is not lost or reordered', async () => {
  await writePlan('phonerepair');
  const p1 = invalidateDownstreamOnRecommit('phonerepair', 'spaza'); // enqueues remove(PLAN_KEY)
  const p2 = writePlan('salon'); // enqueues set(PLAN_KEY, ...) same tick, after p1 in program order
  await Promise.all([p1, p2]);
  // If the queue actually serializes in enqueue order, the later set() must win: the
  // remove from p1 cannot un-happen the set from p2 issued after it. A version of this
  // function that DIDN'T go through the shared writeQueue (e.g. fired removeItem
  // directly) could race this either way — this test would be flaky under that bug.
  expect(mockStore.get(PLAN_KEY)).toBe(JSON.stringify({ businessId: 'salon', planConfirmedAt: 1000 }));
});

test('double recommit: invalidating A -> B twice in a row is idempotent (no error, no resurrection)', async () => {
  await writePlan('phonerepair');
  await invalidateDownstreamOnRecommit('phonerepair', 'spaza');
  await expect(invalidateDownstreamOnRecommit('phonerepair', 'spaza')).resolves.toEqual({
    invalidated: true,
    planCleared: true, // removeItem on an already-absent key resolves, not rejects
    crisisCleared: true,
  });
  expect(mockStore.has(PLAN_KEY)).toBe(false);
});

test('recommit after partial state: Plan exists but Crisis was never created (mid-run-before-Crisis realistic case)', async () => {
  await writePlan('phonerepair');
  const result = await invalidateDownstreamOnRecommit('phonerepair', 'spaza');
  expect(result.planCleared).toBe(true);
  expect(result.crisisCleared).toBe(true); // remove on absent key still resolves true
  const r = await currentlyTrustedDownstream('spaza');
  expect(r.planTrusted).toBe(false);
  expect(r.crisisTrusted).toBe(false);
});

test('A -> A is not an identity change: invalidation must NOT fire, unrelated Plan/Crisis state for A survives untouched', async () => {
  await writePlan('phonerepair');
  await writeCrisis('phonerepair');
  const result = await invalidateDownstreamOnRecommit('phonerepair', 'phonerepair');
  expect(result).toEqual({ invalidated: false, planCleared: false, crisisCleared: false });
  const r = await currentlyTrustedDownstream('phonerepair');
  expect(r.planTrusted).toBe(true);
  expect(r.crisisTrusted).toBe(true);
});

test('no prior business -> B (first-ever commit): invalidation must NOT fire — nothing to invalidate', async () => {
  const result = await invalidateDownstreamOnRecommit(null, 'phonerepair');
  expect(result).toEqual({ invalidated: false, planCleared: false, crisisCleared: false });
});

test('KNOWN LATENT GAP (documented, not fixed): a record stamped for B but actually containing A-era data (e.g. a writer that re-stamps businessId from "current committedTo" on every write instead of at creation) is trusted, because the guard checks the stamp, not provenance', async () => {
  // Simulates the exact scenario src/domain/recommit.ts's header now documents: a
  // hypothetical future writer persists AFTER the recommit but stamps the record with
  // the new business anyway. No code in this repo does this today (grep: no writer of
  // PLAN_KEY/CRISIS_KEY exists), so this is not exploitable yet — this test exists to
  // keep the gap visible, not to claim it's closed.
  await writePlan('spaza'); // "spaza"-stamped record, indistinguishable from a real spaza Plan
  const r = await currentlyTrustedDownstream('spaza');
  expect(r.planTrusted).toBe(true); // guard cannot tell this apart from a genuine one — that's the gap
});

test('type confusion: BusinessId values outside the closed union are never trusted, even if they equal committedTo string-for-string', async () => {
  mockStore.set(PLAN_KEY, JSON.stringify({ businessId: 'not-a-real-business', planConfirmedAt: 1 }));
  const plan = await readJsonKey(PLAN_KEY);
  expect(isPlanValidFor(plan, 'not-a-real-business' as never)).toBe(false);
});

test('prototype pollution: inherited businessId/planConfirmedAt on Object.prototype must not make an empty record pass', async () => {
  // eslint-disable-next-line no-extend-native
  (Object.prototype as Record<string, unknown>).businessId = 'spaza';
  // eslint-disable-next-line no-extend-native
  (Object.prototype as Record<string, unknown>).planConfirmedAt = 1;
  try {
    expect(isPlanValidFor({}, 'spaza')).toBe(false);
  } finally {
    delete (Object.prototype as Record<string, unknown>).businessId;
    delete (Object.prototype as Record<string, unknown>).planConfirmedAt;
  }
});

test("adversarial core question: can ANY persisted combination make B falsely own A's Plan/Crisis state? Exhaustive-ish sweep", async () => {
  const combos: Array<[unknown, unknown]> = [
    [{ businessId: 'phonerepair', planConfirmedAt: 1 }, { biz: 'phonerepair', day: 1 }],
    [null, { biz: 'phonerepair', day: 1 }],
    [{ businessId: 'phonerepair', planConfirmedAt: 1 }, null],
    ['{corrupt', '{corrupt'],
    [{ businessId: 42 }, { biz: 42 }],
    [{}, {}],
  ];
  for (const [planRaw, crisisRaw] of combos) {
    mockStore.clear();
    if (planRaw !== null) mockStore.set(PLAN_KEY, typeof planRaw === 'string' ? planRaw : JSON.stringify(planRaw));
    if (crisisRaw !== null) mockStore.set(CRISIS_KEY, typeof crisisRaw === 'string' ? crisisRaw : JSON.stringify(crisisRaw));
    const r = await currentlyTrustedDownstream('spaza'); // committed business is always 'spaza', none of the fixtures name it
    expect(r.planTrusted).toBe(false);
    expect(r.crisisTrusted).toBe(false);
  }
});
