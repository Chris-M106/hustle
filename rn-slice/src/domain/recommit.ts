/** Cross-stage recommit-invalidation contract (2026-08-13 experiment, see
 *  NEXT_EXPERIMENT_SCANNER_PLAN_CRISIS.md and DECISIONS.md for the wider handoff
 *  context). Answers: when Scanner's committed business identity changes, what must
 *  become true so no stale downstream (Plan/Crisis) state can be mistaken for state
 *  belonging to the new business?
 *
 *  This module is the SAFETY mechanism: a read-side guard that treats a downstream
 *  record as valid only if its own business field agrees with the currently committed
 *  business. It does NOT depend on any proactive delete succeeding — multi-key
 *  atomicity across separate AsyncStorage keys is not available (and not claimed;
 *  see PERSISTENCE_COEXISTENCE_EXPERIMENT.md) and a delete can fail or be interrupted.
 *  Proactive cleanup lives in src/persistence/recommitInvalidation.ts and is a
 *  hygiene optimization only — correctness rests on the functions in this file being
 *  applied on every read, unconditionally.
 *
 *  KNOWN UNENFORCED INVARIANT (adversary review, 2026-08-13, CONFIRMED, not fixed —
 *  no fix possible without a real Plan/Crisis writer to constrain): this guard
 *  validates a STAMP (record.businessId / record.biz), not provenance. Nothing
 *  requires that stamp be written at record-creation time. If a future Plan/Crisis
 *  writer ever re-persists in-memory state by reading the CURRENT committedTo at
 *  write time (rather than the business the record was created for), a write that
 *  lands after a recommit but before the writer unmounts would stamp business A's
 *  data as B, and this guard would wrongly trust it. Nothing in this module, and no
 *  test in __tests__/recommit.adversary.test.ts, constrains writer behavior — every
 *  existing fixture is written BEFORE the simulated recommit. Grep confirms no RN
 *  code writes hustle.plan-handoff.v1 or hustle.crisis.v1 today, so this is currently
 *  latent, not exploitable — but whoever builds the real Plan/Crisis writer MUST
 *  stamp businessId/biz at record-creation time from the value committed at THAT
 *  moment, never re-stamp on every write from "whatever is current now".
 */
import { isBusinessId, type BusinessId } from "./business";

/** True exactly when a commit changes WHICH business is committed — i.e. a real
 *  recommit, not the first-ever commit (prevCommittedTo === null) and not a no-op
 *  re-commit to the same business. Mirrors the predicate scanner/logic.ts's
 *  commitSpot() already uses for its own `resetDownstream` flag (kept identical on
 *  purpose so the two can never disagree about what counts as an identity change). */
export function isIdentityChange(
  prevCommittedTo: BusinessId | null,
  nextCommittedTo: BusinessId,
): boolean {
  return prevCommittedTo !== null && prevCommittedTo !== nextCommittedTo;
}

export interface PlanHandoff {
  businessId: BusinessId;
  planConfirmedAt: number;
}

/** Subset of CrisisRunState (src/domain/types.ts) this guard actually reads. Kept
 *  narrow and structural rather than importing the full type, so this module doesn't
 *  need to agree with Crisis's complete shape to do its one job. */
export interface CrisisBizRecord {
  biz: BusinessId;
}

/** Structural check only (not full isValidPlanHandoff — that's App-layer's job);
 *  this function's contract is narrower: given something already believed to be a
 *  parsed, structurally-valid record, does its business field match? A malformed
 *  record (wrong types) is treated as NOT valid for anyone, same as a mismatch. */
export function isPlanValidFor(
  plan: unknown,
  committedTo: BusinessId | null,
): plan is PlanHandoff {
  if (!committedTo) return false;
  if (!plan || typeof plan !== "object") return false;
  const p = plan as Record<string, unknown>;
  if (!Object.prototype.hasOwnProperty.call(p, "businessId")) return false;
  if (!Object.prototype.hasOwnProperty.call(p, "planConfirmedAt")) return false;
  if (!isBusinessId(p.businessId)) return false;
  if (typeof p.planConfirmedAt !== "number" || !Number.isFinite(p.planConfirmedAt)) return false;
  return p.businessId === committedTo;
}

export function isCrisisValidFor(
  crisis: unknown,
  committedTo: BusinessId | null,
): crisis is CrisisBizRecord {
  if (!committedTo) return false;
  if (!crisis || typeof crisis !== "object") return false;
  const c = crisis as Record<string, unknown>;
  if (!Object.prototype.hasOwnProperty.call(c, "biz")) return false;
  if (!isBusinessId(c.biz)) return false;
  return c.biz === committedTo;
}
