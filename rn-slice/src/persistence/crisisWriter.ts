/** Step 13 Crisis writer/reader — REPAIRED after adversarial gate FAIL (see
 *  HUSTLE_ARCHITECTURE_STEP_13_ADVERSARY_REPORT.md and
 *  HUSTLE_ARCHITECTURE_STEP_13_REPAIR_REPORT.md for the full defect list and fix
 *  rationale). This module is the first REAL production Crisis writer/reader.
 *  Everything upstream (domain/logic.ts, domain/recommit.ts,
 *  persistence/recommitInvalidation.ts) was already built and tested against
 *  synthetic fixtures only.
 *
 *  Scope discipline (binding, see Step 13 task boundary): no navigation, no UI, no
 *  App.tsx wiring, no Plan. Scanner -> Crisis only.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import decksJson from '../domain/crisis-decks.json';
import { createInitialCrisisState, totalDays } from '../domain/logic';
import type { CrisisDecks, CrisisRunState } from '../domain/types';
import { isBusinessId, type BusinessId } from '../domain/business';
import { isCrisisValidFor } from '../domain/recommit';
import { queuedWrite, writeQueue } from './queuedWrite';
import { CRISIS_KEY } from './recommitInvalidation';

const decks = decksJson as unknown as CrisisDecks;

// Matches Scanner's established naming convention (`hustle.scanner.v1.corrupt-backup`,
// see PERSISTENCE_VALIDATION_REPORT.md) and the historical Crisis-only App.tsx's own
// `hustle.crisis.v1.corrupt-backup` (recovered from git history, commit 6abd4a4).
export const CRISIS_BACKUP_KEY = `${CRISIS_KEY}.corrupt-backup`;

/** Full structural + relational validity check, restored from the historical
 *  Crisis-only App.tsx (commit 6abd4a4's `isValidCrisisState`), generalized for the
 *  current multi-business model: the original hardcoded `s.biz === BIZ`; this checks
 *  only that `biz` is SOME valid BusinessId — identity match against the currently
 *  committed business is a separate, later check (isCrisisValidFor). Structural
 *  validity and identity validity are deliberately kept as two different questions —
 *  that separation is exactly what gate finding F1 (CRITICAL) showed was missing:
 *  `{biz:'phonerepair'}` alone was previously accepted as `kind:'valid'`. */
export function isValidCrisisState(v: unknown): v is CrisisRunState {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  if (!isBusinessId(s.biz)) return false;
  const deckLen = totalDays(decks, s.biz);
  const structural =
    typeof s.day === 'number' &&
    Number.isInteger(s.day) &&
    s.day >= 0 &&
    s.day < deckLen &&
    typeof s.cash === 'number' &&
    Number.isFinite(s.cash) &&
    Math.abs(s.cash) < 1e9 &&
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
  const expectedLen = resolved ? day + 1 : day;
  if (log.length !== expectedLen) return false;
  return log.every(
    (entry) =>
      entry !== null &&
      typeof entry === 'object' &&
      typeof (entry as Record<string, unknown>).day === 'number' &&
      typeof (entry as Record<string, unknown>).cash === 'number' &&
      Number.isFinite((entry as Record<string, unknown>).cash as number),
  );
}

/** Best-effort preservation of raw, unparseable-or-invalid bytes before they can be
 *  silently overwritten by a later launchCrisis — same contract as the historical
 *  Crisis App.tsx and Scanner's still-live equivalent (App.tsx's BACKUP_KEY). Backup
 *  failure is logged, never thrown — a failed backup must not block reporting the
 *  read result to the caller. */
async function backupCorrupt(raw: string): Promise<void> {
  try {
    await AsyncStorage.setItem(CRISIS_BACKUP_KEY, raw);
  } catch (e) {
    console.warn('[hustle] crisis corrupt-backup failed', e);
  }
}

export type LaunchCrisisResult =
  | { kind: 'launched'; state: CrisisRunState }
  // The queuedWrite call itself resolved (setItem succeeded), but the SEPARATE
  // post-write readback threw. This is not a write failure — collapsing it into one
  // was gate finding F3 (MAJOR): launchCrisis could throw after persistence had
  // actually already succeeded, leaving a caller unable to tell "nothing was saved"
  // from "it was saved, we just couldn't confirm it this instant."
  | { kind: 'written-unverified'; state: CrisisRunState }
  // Disk state after the write settled gives ACTUAL evidence of an identity
  // transition: either the key is gone (only queuedRemove(CRISIS_KEY), i.e.
  // invalidateDownstreamOnRecommit, does that on this shared queue) or what's on
  // disk now belongs to a different business than we wrote. Gate finding F4/F5
  // (MAJOR): the old code reported this label for ANY mismatch, including one with
  // zero identity-transition evidence.
  | { kind: 'lost-to-recommit-race'; state: CrisisRunState }
  // Disk holds a well-formed record for the SAME business, but not the payload we
  // wrote — a second launchCrisis for the same business overwrote us after our
  // write settled. This is a real data-loss outcome, but it is not a recommit race,
  // and must not be reported as one (gate finding F5).
  | { kind: 'overwritten-by-concurrent-write'; state: CrisisRunState };

/** Launches a new Crisis run for the business currently committed in Scanner and
 *  durably persists it. `committedTo`/`openingCash` must come from the caller's own
 *  current, authoritative Scanner state at the moment this is called. Stamps `biz`
 *  once, at creation, from whatever `committedTo` the caller handed it — there is no
 *  update path in this module, by design (see Step 13 report). No claim of
 *  cross-key or write/readback atomicity is made anywhere below: queuedWrite only
 *  guarantees ORDERING against other operations on the same shared queue, never
 *  mutual exclusion against a caller that reads AsyncStorage directly, and never
 *  atomicity between the write settling and this function's own readback. */
export async function launchCrisis(
  committedTo: BusinessId,
  openingCash: number,
): Promise<LaunchCrisisResult> {
  if (!isBusinessId(committedTo)) {
    throw new Error(`launchCrisis: committedTo is not a valid BusinessId: ${String(committedTo)}`);
  }
  if (!Number.isFinite(openingCash) || openingCash < 0 || Math.abs(openingCash) >= 1e9) {
    throw new Error(
      `launchCrisis: openingCash must be finite, non-negative, and bounded (<1e9), got ${openingCash}`,
    );
  }
  const initial = createInitialCrisisState(committedTo, openingCash);
  const payload = JSON.stringify(initial);
  // If this rejects (real setItem failure or the queue's own timeout), it propagates
  // unchanged — an unambiguous write failure, not something this function reinterprets.
  await queuedWrite(CRISIS_KEY, payload);
  // Drain whatever else got enqueued onto the SAME shared queue in this tick (e.g. a
  // racing invalidateDownstreamOnRecommit's queuedRemove(CRISIS_KEY)) before checking
  // disk state. Can only see operations already enqueued by this point — an operation
  // enqueued strictly AFTER this resolves is a genuinely unresolvable live race, not a
  // detection gap.
  await writeQueue;

  let onDiskRaw: string | null;
  try {
    onDiskRaw = await AsyncStorage.getItem(CRISIS_KEY);
  } catch {
    return { kind: 'written-unverified', state: initial };
  }

  if (onDiskRaw === payload) {
    return { kind: 'launched', state: initial };
  }
  if (onDiskRaw === null) {
    // Real evidence of removal, not an inference from a generic mismatch.
    return { kind: 'lost-to-recommit-race', state: initial };
  }
  let otherBiz: unknown;
  try {
    otherBiz = (JSON.parse(onDiskRaw) as Record<string, unknown> | null)?.biz;
  } catch {
    // Unparseable bytes on disk after our own write settled: not evidence of a
    // business-identity transition specifically, so this does not qualify as
    // lost-to-recommit-race either — treat as a same-business overwrite by
    // something that wrote garbage, the closest honest label available.
  }
  if (otherBiz !== undefined && otherBiz !== committedTo) {
    return { kind: 'lost-to-recommit-race', state: initial };
  }
  return { kind: 'overwritten-by-concurrent-write', state: initial };
}

export type CrisisReadResult =
  | { kind: 'valid'; state: CrisisRunState }
  | { kind: 'absent' }
  | { kind: 'invalid-for-current-business' }
  // Bytes exist but are not parseable JSON at all.
  | { kind: 'corrupt' }
  // Parses, but is not a structurally valid CrisisRunState (missing/wrong-typed
  // fields, inconsistent log length, etc.) — this is exactly the gap gate finding F1
  // exploited: a record could previously pass with only a `biz` field present.
  | { kind: 'malformed' };

/** Reads back CRISIS_KEY. Reads AsyncStorage directly rather than through
 *  recommitInvalidation.ts's readJsonKey, because that helper's contract collapses
 *  "key absent" and "key present but unparseable" into the same `null` (gate finding
 *  F2, MAJOR) — this function needs to tell those apart to preserve corrupt evidence
 *  instead of letting a later launchCrisis silently overwrite it. Applies full
 *  structural validation (isValidCrisisState) before ever applying the existing
 *  read-side identity guard (domain/recommit.ts's isCrisisValidFor) — the two checks
 *  are independent and both mandatory, exactly as the Steps 9-12 report's recommended
 *  architecture specifies. */
export async function readCrisis(committedTo: BusinessId | null): Promise<CrisisReadResult> {
  const raw = await AsyncStorage.getItem(CRISIS_KEY);
  if (raw == null) return { kind: 'absent' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    await backupCorrupt(raw);
    return { kind: 'corrupt' };
  }

  if (!isValidCrisisState(parsed)) {
    await backupCorrupt(raw);
    return { kind: 'malformed' };
  }
  if (!isCrisisValidFor(parsed, committedTo)) {
    return { kind: 'invalid-for-current-business' };
  }
  return { kind: 'valid', state: parsed };
}
