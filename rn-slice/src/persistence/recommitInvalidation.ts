/** Proactive cleanup half of the recommit-invalidation contract (see
 *  src/domain/recommit.ts for the safety half — the read-side guard that is what
 *  actually stops stale state from being trusted). Best-effort only: clears the Plan
 *  and Crisis keys when a Scanner commit changes WHICH business is committed, so
 *  storage doesn't keep carrying a stale record around for no reason. Does not, and
 *  cannot, guarantee both clears land — no multi-key atomicity is claimed.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { queuedRemove } from './queuedWrite';
import type { BusinessId } from '../domain/business';
import { isIdentityChange } from '../domain/recommit';

export const PLAN_KEY = 'hustle.plan-handoff.v1';
export const CRISIS_KEY = 'hustle.crisis.v1';

export interface InvalidationResult {
  invalidated: boolean;
  planCleared: boolean;
  crisisCleared: boolean;
}

/** Order: Plan then Crisis, both through the single shared writeQueue (queuedWrite.ts).
 *  The queue gives ORDERING (a remove and any later-issued write/remove to a different
 *  key are never reordered), NOT mutual exclusion against a write that some other
 *  caller enqueues concurrently, mid-function, from a different code path. A third
 *  party writing PLAN_KEY between this function's two `await`s can leave `planCleared:
 *  true` while the key is, at that instant, present again — reported CONFIRMED by
 *  adversary review 2026-08-13. planCleared/crisisCleared below are therefore verified
 *  by re-reading the key after the remove settles, not inferred from the remove
 *  promise resolving — callers must still not treat planCleared/crisisCleared as a
 *  substitute for the read-side guard (src/domain/recommit.ts): they describe storage
 *  state at one instant, not a durable guarantee. Caller (App.tsx's commit handler)
 *  awaits this AFTER the new Scanner commit is itself durably persisted — same
 *  ordering discipline as Scanner's own commit atomicity (persist before render-state
 *  flips). */
export async function invalidateDownstreamOnRecommit(
  prevCommittedTo: BusinessId | null,
  nextCommittedTo: BusinessId,
): Promise<InvalidationResult> {
  if (!isIdentityChange(prevCommittedTo, nextCommittedTo)) {
    return { invalidated: false, planCleared: false, crisisCleared: false };
  }
  let planCleared = false;
  let crisisCleared = false;
  try {
    await queuedRemove(PLAN_KEY);
    planCleared = (await AsyncStorage.getItem(PLAN_KEY)) == null;
  } catch (e) {
    console.warn('[hustle] plan invalidation failed', e);
  }
  try {
    await queuedRemove(CRISIS_KEY);
    crisisCleared = (await AsyncStorage.getItem(CRISIS_KEY)) == null;
  } catch (e) {
    console.warn('[hustle] crisis invalidation failed', e);
  }
  return { invalidated: true, planCleared, crisisCleared };
}

/** Read helper used by both tests and (were Plan/Crisis screens to exist) real
 *  consumers: fetch + parse a downstream key, returning null on any I/O/parse
 *  failure rather than throwing — a missing/corrupt downstream record is a normal,
 *  expected outcome after a recommit, not an error condition. */
export async function readJsonKey(key: string): Promise<unknown | null> {
  const raw = await AsyncStorage.getItem(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
