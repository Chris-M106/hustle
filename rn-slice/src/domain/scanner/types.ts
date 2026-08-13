/** Framework-agnostic types for the HUSTLE "Scanner" stage (stage 2 of the prototype).
 *  Scoped to the Scanner slice's approved boundary: one hardcoded business, the
 *  scan -> select -> commit sequence, and the pure Five Forces calculation. Does NOT
 *  model the full 5-business portfolio, stat-gated narrative unlocks, or cross-stage
 *  reset of Crisis/Plan state — those are out of scope for this slice, see
 *  SCANNER_SLICE_PLAN.md.
 */

// DemandLevel/CompetitionLevel/BusinessId now come from ../business — the one
// shared representation Scanner and Crisis both import, unified 2026-08-13 (was
// independently redefined here before). Re-exported for existing importers of
// this module.
export type { BusinessId, DemandLevel, CompetitionLevel } from "../business";
import type { BusinessId, DemandLevel, CompetitionLevel } from "../business";

/** Mirrors the shape of prototype `OPPS` entries exactly (hustle-shell.html:1466) —
 *  only the fields the ported logic actually reads. `id` is the shared BusinessId,
 *  not a locally-duplicated `string` — see ../business.ts header for why. */
export interface ScannerOpportunity {
  id: BusinessId;
  name: string;
  short: string;
  demand: DemandLevel;
  comp: CompetitionLevel;
  cost: number;
}

/** Mirrors one entry of the prototype's authored `FORCES` table
 *  (hustle-shell.html:1963) — entrants/subs/suppliers are judgement calls made by
 *  the game's authors, not computed; rivalry/buyers are, and are derived in
 *  `forcesOf` from the opportunity's own comp/demand fields instead. */
export interface ForcesTableEntry {
  entrants: number;
  subs: number;
  suppliers: number;
}

export type ForcesTable = Record<string, ForcesTableEntry>;

/** The five Porter's-Five-Forces pressure scores (1=low pressure on the player,
 *  3=high), plus whether the Network stat's supplier-easing rule fired. */
export interface ScannerForces {
  rivalry: number;
  entrants: number;
  subs: number;
  suppliers: number;
  buyers: number;
  supplierEased: boolean;
}

/** The subset of run state the Scanner stage reads and mutates. `plan`/`day`/
 *  `crisisScore` etc. belong to other stages and are intentionally NOT modeled here. */
export interface ScannerRunState {
  /** id -> has this spot been scanned (readout revealed) */
  scanned: Record<string, boolean>;
  /** id of the spot tapped a 2nd time (soft-selected, not yet paid for), or null */
  selected: string | null;
  /** id of the spot capital has actually been committed to, or null */
  committedTo: string | null;
  /** opening cash after commit (capital - cost); null until committed */
  cash: number | null;
  /** the cost that was actually paid at commit time; null until committed */
  setupCost: number | null;
}

export interface CommitResult {
  state: ScannerRunState;
  ok: boolean;
  reason?: string;
  /** true when this commit replaces a DIFFERENT prior committed business — signals
   *  that any downstream (Crisis/Plan) state a real integration owns must be reset,
   *  matching the prototype's own commitBtn handler (hustle-shell.html:2849-2860).
   *  NOT CONSUMED ANYWHERE YET (confirmed by grep, 2026-08-12 adversary pass) —
   *  App.tsx computes it via commitSpot() but never reads it, and no persisted state
   *  records that a downstream reset was owed. It is exercised only by direct calls
   *  to commitSpot() in isolation. The next stage that needs it must implement
   *  consumption AND its own persisted "reset owed" signal — this field alone does
   *  not carry that guarantee across an app restart. */
  resetDownstream: boolean;
}
