/**
 * Step 13 Crisis writer/reader tests — REPAIRED after adversarial gate FAIL. See
 * HUSTLE_ARCHITECTURE_STEP_13_ADVERSARY_REPORT.md for the original findings (F1-F9)
 * and HUSTLE_ARCHITECTURE_STEP_13_REPAIR_REPORT.md for the fix rationale. Every test
 * below is written to the standard the repair task set: "would this fail if the
 * underlying bug returned?" — asserting the returned classification/result, not just
 * that a promise resolves.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockStore = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((k: string) => Promise.resolve(mockStore.has(k) ? (mockStore.get(k) as string) : null)),
    setItem: jest.fn((k: string, v: string) => {
      mockStore.set(k, v);
      return Promise.resolve();
    }),
    removeItem: jest.fn((k: string) => {
      mockStore.delete(k);
      return Promise.resolve();
    }),
  },
}));

import { __resetQueueForTests } from '../src/persistence/queuedWrite';
import { invalidateDownstreamOnRecommit, readJsonKey, CRISIS_KEY } from '../src/persistence/recommitInvalidation';
import { launchCrisis, readCrisis, isValidCrisisState, CRISIS_BACKUP_KEY } from '../src/persistence/crisisWriter';

beforeEach(() => {
  mockStore.clear();
  __resetQueueForTests();
  jest.clearAllMocks();
  // jest.clearAllMocks() only clears call history, not a custom mockImplementation
  // installed by a previous test (e.g. a simulated I/O failure) — without restoring
  // the default here, that override silently bleeds into every later test in the file.
  const storage = AsyncStorage as unknown as {
    getItem: jest.Mock;
    setItem: jest.Mock;
    removeItem: jest.Mock;
  };
  storage.getItem.mockImplementation((k: string) => Promise.resolve(mockStore.has(k) ? (mockStore.get(k) as string) : null));
  storage.setItem.mockImplementation((k: string, v: string) => {
    mockStore.set(k, v);
    return Promise.resolve();
  });
  storage.removeItem.mockImplementation((k: string) => {
    mockStore.delete(k);
    return Promise.resolve();
  });
});

// ---------------------------------------------------------------------------
// 1. STRUCTURAL VALIDATION (gate finding F1, CRITICAL)
// ---------------------------------------------------------------------------

test('real writer, same business: launchCrisis persists a record readCrisis trusts', async () => {
  const launched = await launchCrisis('phonerepair', 1300);
  expect(launched.kind).toBe('launched');
  expect(launched.state).toEqual({
    biz: 'phonerepair',
    day: 0,
    cash: 1300,
    crisisScore: 0,
    resolved: false,
    streak: 0,
    log: [],
  });
  const result = await readCrisis('phonerepair');
  expect(result).toEqual({ kind: 'valid', state: launched.state });
});

test('CRITICAL regression: a record with only biz present is rejected, not accepted as valid', async () => {
  mockStore.set(CRISIS_KEY, JSON.stringify({ biz: 'phonerepair' }));
  expect(isValidCrisisState({ biz: 'phonerepair' })).toBe(false);
  const result = await readCrisis('phonerepair');
  expect(result.kind).toBe('malformed');
});

test('structural: missing required field (cash) is rejected', async () => {
  const full = { biz: 'phonerepair', day: 0, crisisScore: 0, resolved: false, streak: 0, log: [] };
  expect(isValidCrisisState(full)).toBe(false);
});

test('structural: wrong field type (day as string) is rejected', async () => {
  const bad = { biz: 'phonerepair', day: '0', cash: 1300, crisisScore: 0, resolved: false, streak: 0, log: [] };
  expect(isValidCrisisState(bad)).toBe(false);
});

test('structural: missing biz is rejected', async () => {
  const bad = { day: 0, cash: 1300, crisisScore: 0, resolved: false, streak: 0, log: [] };
  expect(isValidCrisisState(bad)).toBe(false);
});

test('structural: invalid biz (not in the BusinessId union) is rejected', async () => {
  const bad = { biz: 'not-a-real-business', day: 0, cash: 1300, crisisScore: 0, resolved: false, streak: 0, log: [] };
  expect(isValidCrisisState(bad)).toBe(false);
});

test('structural: valid biz but incomplete record (missing log) is rejected', async () => {
  const bad = { biz: 'phonerepair', day: 0, cash: 1300, crisisScore: 0, resolved: false, streak: 0 };
  expect(isValidCrisisState(bad)).toBe(false);
});

test('structural: valid complete record is accepted', async () => {
  const ok = { biz: 'phonerepair', day: 1, cash: 1300, crisisScore: 5, resolved: false, streak: 1, log: [{ day: 0, cash: 1300 }] };
  expect(isValidCrisisState(ok)).toBe(true);
});

test('relational: log.length must track day/resolved — a day=1 record with an empty log is rejected', async () => {
  const bad = { biz: 'phonerepair', day: 1, cash: 1300, crisisScore: 0, resolved: false, streak: 0, log: [] };
  expect(isValidCrisisState(bad)).toBe(false);
});

test('readCrisis on well-formed JSON that is not crisis-shaped (no biz field): malformed, not crash', async () => {
  mockStore.set(CRISIS_KEY, JSON.stringify({ notCrisis: true }));
  const result = await readCrisis('phonerepair');
  expect(result).toEqual({ kind: 'malformed' });
});

// ---------------------------------------------------------------------------
// 2. ABSENT VS CORRUPT (gate finding F2, MAJOR)
// ---------------------------------------------------------------------------

test('readCrisis on empty storage: absent, not corrupt/malformed', async () => {
  const result = await readCrisis('phonerepair');
  expect(result).toEqual({ kind: 'absent' });
});

test('CRITICAL regression: corrupt (unparseable) bytes are reported as corrupt, never silently as absent', async () => {
  mockStore.set(CRISIS_KEY, '{not valid json');
  const result = await readCrisis('phonerepair');
  expect(result).toEqual({ kind: 'corrupt' });
});

test('corrupt bytes are preserved to CRISIS_BACKUP_KEY before any classification is returned', async () => {
  mockStore.set(CRISIS_KEY, '{not valid json');
  await readCrisis('phonerepair');
  expect(mockStore.get(CRISIS_BACKUP_KEY)).toBe('{not valid json');
});

test('structurally invalid (but well-formed JSON) bytes are also preserved to CRISIS_BACKUP_KEY', async () => {
  const raw = JSON.stringify({ biz: 'phonerepair' });
  mockStore.set(CRISIS_KEY, raw);
  await readCrisis('phonerepair');
  expect(mockStore.get(CRISIS_BACKUP_KEY)).toBe(raw);
});

test('corrupt record followed by launch: corrupt evidence was already backed up before the overwrite, so it survives', async () => {
  mockStore.set(CRISIS_KEY, '{not valid json');
  await readCrisis('phonerepair'); // backs up before caller can act on the corrupt result
  const launched = await launchCrisis('phonerepair', 1300);
  expect(launched.kind).toBe('launched');
  expect(mockStore.get(CRISIS_BACKUP_KEY)).toBe('{not valid json'); // not clobbered by the new write
  const result = await readCrisis('phonerepair');
  expect(result).toEqual({ kind: 'valid', state: launched.state }); // new record is trusted
});

// ---------------------------------------------------------------------------
// 3. launchCrisis RESULT CONTRACT (gate findings F3/F4/F5, MAJOR)
// ---------------------------------------------------------------------------

test('launchCrisis rejects a non-finite/negative openingCash rather than silently persisting null/NaN', async () => {
  await expect(launchCrisis('phonerepair', NaN)).rejects.toThrow(/finite/);
  await expect(launchCrisis('phonerepair', -1)).rejects.toThrow(/finite/);
  expect(mockStore.has(CRISIS_KEY)).toBe(false); // rejected before any write happened
});

test('launchCrisis rejects an openingCash outside the bounded range', async () => {
  await expect(launchCrisis('phonerepair', 1e10)).rejects.toThrow(/bounded/);
  expect(mockStore.has(CRISIS_KEY)).toBe(false);
});

test('launchCrisis rejects a committedTo outside the closed BusinessId union (e.g. a stale/legacy deserialized value)', async () => {
  await expect(launchCrisis('not-a-real-business' as never, 1300)).rejects.toThrow(/BusinessId/);
  expect(mockStore.has(CRISIS_KEY)).toBe(false);
});

test('CRITICAL regression: launchCrisis never reports "launched" while storage is actually empty', async () => {
  const launched = await launchCrisis('phonerepair', 1300);
  if (launched.kind === 'launched') {
    expect(mockStore.has(CRISIS_KEY)).toBe(true);
    expect(mockStore.get(CRISIS_KEY)).toBe(JSON.stringify(launched.state));
  }
});

test('post-write readback failure is reported as written-unverified, not conflated with a write failure or a race', async () => {
  const getItem = (AsyncStorage as unknown as { getItem: jest.Mock }).getItem;
  getItem.mockImplementation(() => Promise.reject(new Error('simulated readback I/O failure')));
  const result = await launchCrisis('phonerepair', 1300);
  expect(result.kind).toBe('written-unverified');
  // The underlying write itself must have actually happened — this is not a write failure.
  expect(mockStore.get(CRISIS_KEY)).toBe(JSON.stringify(result.state));
});

test('a same-business overwrite by a second concurrent launch is reported as overwritten-by-concurrent-write, not lost-to-recommit-race (no identity transition occurred)', async () => {
  await launchCrisis('phonerepair', 1300);
  // Simulate: our write settles, but disk now holds a DIFFERENT same-business payload
  // (another launchCrisis for the same business finished after ours) with no recommit
  // in play at all.
  const getItem = (AsyncStorage as unknown as { getItem: jest.Mock }).getItem;
  const other = JSON.stringify({ biz: 'phonerepair', day: 0, cash: 999, crisisScore: 0, resolved: false, streak: 0, log: [] });
  getItem.mockImplementation(() => Promise.resolve(other));
  const result = await launchCrisis('phonerepair', 1400);
  expect(result.kind).toBe('overwritten-by-concurrent-write');
});

test('MAJOR regression: lost-to-recommit-race is only reported when there is real evidence of an identity transition (key removed or disk shows a different business)', async () => {
  await launchCrisis('phonerepair', 1300);
  const getItem = (AsyncStorage as unknown as { getItem: jest.Mock }).getItem;
  getItem.mockImplementation(() => Promise.resolve(null)); // key genuinely gone — real evidence
  const result = await launchCrisis('phonerepair', 1400);
  expect(result.kind).toBe('lost-to-recommit-race');
});

test('adversarial race: launchCrisis fired concurrently with a recommit clear reports a truthful, evidence-backed outcome', async () => {
  await launchCrisis('phonerepair', 1300);
  const p1 = invalidateDownstreamOnRecommit('phonerepair', 'spaza');
  const p2 = launchCrisis('phonerepair', 1400);
  const [, launch2] = await Promise.all([p1, p2]);
  const onDisk = await readJsonKey(CRISIS_KEY);
  if (launch2.kind === 'launched') {
    expect(onDisk).toEqual(launch2.state);
  } else {
    expect(['lost-to-recommit-race', 'overwritten-by-concurrent-write']).toContain(launch2.kind);
  }
});

// ---------------------------------------------------------------------------
// 4. RACE SEMANTICS / recommit interplay
// ---------------------------------------------------------------------------

test('real writer + real recommit: A launches Crisis, recommit A->B fires, B must not trust A record', async () => {
  await launchCrisis('phonerepair', 1300);
  expect(mockStore.has(CRISIS_KEY)).toBe(true);

  const inv = await invalidateDownstreamOnRecommit('phonerepair', 'spaza');
  expect(inv.crisisCleared).toBe(true);

  const afterClear = await readCrisis('spaza');
  expect(afterClear).toEqual({ kind: 'absent' });
});

test('same-business recommit (A->A) is a no-op: not an identity change, Crisis is not cleared', async () => {
  await launchCrisis('phonerepair', 1300);
  const inv = await invalidateDownstreamOnRecommit('phonerepair', 'phonerepair');
  expect(inv.invalidated).toBe(false);
  expect(mockStore.has(CRISIS_KEY)).toBe(true);
  const result = await readCrisis('phonerepair');
  expect(result.kind).toBe('valid');
});

test('real writer + real recommit, clear fails (adversarial): stale A-stamped record survives on disk, guard still refuses it for B', async () => {
  await launchCrisis('phonerepair', 1300);
  const removeItem = (AsyncStorage as unknown as { removeItem: jest.Mock }).removeItem;
  removeItem.mockImplementation((k: string) =>
    k === CRISIS_KEY ? Promise.reject(new Error('simulated I/O failure')) : (mockStore.delete(k), Promise.resolve()),
  );

  const inv = await invalidateDownstreamOnRecommit('phonerepair', 'spaza');
  expect(inv.crisisCleared).toBe(false);
  expect(mockStore.has(CRISIS_KEY)).toBe(true); // proves the stale record is genuinely still there

  const result = await readCrisis('spaza');
  expect(result).toEqual({ kind: 'invalid-for-current-business' });
});

test('failed write: launchCrisis propagates a genuine setItem rejection unchanged', async () => {
  const setItem = (AsyncStorage as unknown as { setItem: jest.Mock }).setItem;
  setItem.mockImplementation(() => Promise.reject(new Error('simulated write I/O failure')));
  await expect(launchCrisis('phonerepair', 1300)).rejects.toThrow(/simulated write I\/O failure/);
});

test('B launches a fresh Crisis after a failed clear: B record overwrites A record at the same key, B is trusted, A is gone', async () => {
  await launchCrisis('phonerepair', 1300);
  const removeItem = (AsyncStorage as unknown as { removeItem: jest.Mock }).removeItem;
  removeItem.mockImplementation((k: string) =>
    k === CRISIS_KEY ? Promise.reject(new Error('simulated I/O failure')) : (mockStore.delete(k), Promise.resolve()),
  );
  await invalidateDownstreamOnRecommit('phonerepair', 'spaza'); // clear fails, A record survives
  removeItem.mockImplementation((k: string) => (mockStore.delete(k), Promise.resolve()));

  const bCrisis = await launchCrisis('spaza', 800);
  expect(bCrisis.kind).toBe('launched');
  const result = await readCrisis('spaza');
  expect(result).toEqual({ kind: 'valid', state: bCrisis.state });
  expect((result as { state: { biz: string } }).state.biz).toBe('spaza');
});

test('readCrisis with no committed business (null): a real record is never trusted for "no business"', async () => {
  await launchCrisis('phonerepair', 1300);
  const result = await readCrisis(null);
  expect(result).toEqual({ kind: 'invalid-for-current-business' });
});
