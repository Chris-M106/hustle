/** Framework-agnostic logic for the HUSTLE "Scanner" stage — ported verbatim (arithmetic
 *  and control flow, not string rendering) from hustle-shell.html:1913-2867. See
 *  types.ts for scope boundary.
 */
import type {
  CommitResult,
  ForcesTable,
  ScannerForces,
  ScannerOpportunity,
  ScannerRunState,
} from "./types";

/** hustle-shell.html:1483 */
export const CAPITAL = 2500;
/** hustle-shell.html:1919 — below this, the setup has eaten the business. Ported for
 *  parity/future use; this slice's single hardcoded business never falls under it. */
export const THIN = 800;

/** hustle-shell.html:1913 */
export function affordable(o: ScannerOpportunity, capital: number = CAPITAL): boolean {
  return o.cost <= capital;
}

/** hustle-shell.html:1918 */
export function opening(o: ScannerOpportunity, capital: number = CAPITAL): number {
  return capital - o.cost;
}

/** hustle-shell.html:1917 */
export function overBy(o: ScannerOpportunity, capital: number = CAPITAL): number {
  return Math.max(0, o.cost - capital);
}

/** hustle-shell.html:1993 */
export function levelOf(w: "LOW" | "MEDIUM" | "HIGH"): number {
  return w === "HIGH" ? 3 : w === "MEDIUM" ? 2 : 1;
}

/** hustle-shell.html:1995-2013. `networkStat` is `state.stats.network` in the
 *  prototype; the >=7 threshold eases supplier pressure by one step, mirroring
 *  Network's own promise text ("better supplier terms"). */
export function forcesOf(
  o: ScannerOpportunity,
  table: ForcesTable,
  networkStat: number = 0,
): ScannerForces {
  const f = table[o.id] ?? { entrants: 2, subs: 2, suppliers: 2 };
  let suppliers = f.suppliers;
  const eased = networkStat >= 7 && suppliers > 1;
  if (eased) suppliers -= 1;
  return {
    rivalry: levelOf(o.comp),
    entrants: f.entrants,
    subs: f.subs,
    suppliers,
    // high demand = you hold the price = low buyer power
    buyers: 4 - levelOf(o.demand),
    supplierEased: eased,
  };
}

/** hustle-shell.html:2014-2016 */
export function forcesTotal(fv: ScannerForces): number {
  return fv.rivalry + fv.entrants + fv.subs + fv.suppliers + fv.buyers;
}

/** hustle-shell.html:2017-2021. 5 = every force at its lowest; 15 = squeezed from all
 *  five sides. */
export function pressureWord(total: number): "Room to breathe" | "Workable pressure" | "Squeezed from all sides" {
  return total <= 8 ? "Room to breathe" : total <= 11 ? "Workable pressure" : "Squeezed from all sides";
}

export function createInitialScannerState(): ScannerRunState {
  return { scanned: {}, selected: null, committedTo: null, cash: null, setupCost: null };
}

/** hustle-shell.html:2115-2119 first-tap branch. Idempotent — scanning an
 *  already-scanned spot is a no-op, matching the prototype's `if(!state.scanned[o.id])`
 *  guard (a repeat tap on a scanned-but-unselected spot falls to the select branch
 *  instead, handled separately by the caller/UI, not by this function). */
export function scanSpot(state: ScannerRunState, id: string): ScannerRunState {
  if (state.scanned[id]) return state;
  return { ...state, scanned: { ...state.scanned, [id]: true } };
}

/** hustle-shell.html:2120-2123 second-tap branch. Requires the spot to already be
 *  scanned — selecting an unscanned spot is a no-op (`ok:false`), since the prototype
 *  never exposes a select affordance before a scan reveals the readout. */
export function selectSpot(state: ScannerRunState, id: string): { state: ScannerRunState; ok: boolean } {
  if (!state.scanned[id]) return { state, ok: false };
  return { state: { ...state, selected: id }, ok: true };
}

/** hustle-shell.html:2845-2867 commitBtn handler. Validates selection + affordability,
 *  then computes the complete post-commit state — return value only, no side effects.
 *  Caller is responsible for the "persist before advancing" ordering (see
 *  SCANNER_SLICE_REPORT.md → "Commit atomicity"); this function does not persist or
 *  navigate, it only decides what the committed state WOULD be. */
export function commitSpot(
  state: ScannerRunState,
  o: ScannerOpportunity,
  capital: number = CAPITAL,
): CommitResult {
  // Defense in depth: `selected` is left equal to `o.id` after a successful commit
  // (see below), so `state.selected !== o.id` alone does not stop a second call from
  // recommitting to the same business. The UI's own button-hiding is the only thing
  // that currently prevents this via the App.tsx caller — this check makes the
  // domain function itself idempotent, not just the one caller that happens to exist.
  if (state.committedTo === o.id) {
    return { state, ok: false, reason: "already-committed", resetDownstream: false };
  }
  if (state.selected !== o.id) {
    return { state, ok: false, reason: "not-selected", resetDownstream: false };
  }
  if (!affordable(o, capital)) {
    return { state, ok: false, reason: "over-budget", resetDownstream: false };
  }
  const resetDownstream = state.committedTo !== null && state.committedTo !== o.id;
  const next: ScannerRunState = {
    ...state,
    committedTo: o.id,
    cash: opening(o, capital),
    setupCost: o.cost,
  };
  return { state: next, ok: true, resetDownstream };
}
