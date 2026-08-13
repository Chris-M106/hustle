/** Crisis stage domain logic, ported 1:1 from prototype/hustle-shell.html
 *  (functions: deck, DAYS, crisisRange, crisisFrac, momentumFrac, today,
 *  judgeCall, resolve, nextDay — see that file's "stage 4" section, ~line 2275-2511).
 *
 *  DOM/render code stripped out; direct state mutation (`state.cash += x`) replaced
 *  with pure state-in/state-out functions. Arithmetic/thresholds match the prototype;
 *  resolve()'s double-resolve guard and momentumFrac's empty-day band are intentional
 *  behavior matches, not incidental — see their comments below.
 */

import type {
  BusinessId,
  CrisisDeck,
  CrisisDecks,
  CrisisEventVariant,
  CrisisRunState,
  MomentumWord,
  ScoreRange,
} from "./types";

export function deck(decks: CrisisDecks, biz: BusinessId): CrisisDeck {
  return decks[biz] || decks.spaza;
}

export function totalDays(decks: CrisisDecks, biz: BusinessId): number {
  return deck(decks, biz).length;
}

/** The prototype always resolves slot[0] deterministically (source comment:
 *  "the shipped build picks a random variant here; fixed to [0] so a
 *  facilitator can reproduce a run"). Preserved here for the same reason. */
export function today(decks: CrisisDecks, state: Pick<CrisisRunState, "biz" | "day">): CrisisEventVariant {
  return deck(decks, state.biz)[state.day][0];
}

/** `upto` limits the score range to days actually played (or the whole deck when
 *  omitted, used at run-end grading). Days with no `decisions` contribute nothing —
 *  they aren't a choice, so they can't widen or narrow the range. */
export function crisisRange(decks: CrisisDecks, biz: BusinessId, upto?: number): ScoreRange {
  let lo = 0;
  let hi = 0;
  const full = deck(decks, biz);
  const slots = upto == null ? full : full.slice(0, upto);
  for (const slot of slots) {
    const e = slot[0];
    if (!e.decisions) continue;
    const scores = e.decisions.map((x) => x.score || 0);
    lo += Math.min(...scores);
    hi += Math.max(...scores);
  }
  return { lo, hi };
}

export function crisisFrac(decks: CrisisDecks, biz: BusinessId, crisisScore: number, upto?: number): number {
  const r = crisisRange(decks, biz, upto);
  if (r.hi <= r.lo) return 0;
  return Math.max(0, Math.min(1, (crisisScore - r.lo) / (r.hi - r.lo)));
}

/** "How the run is going so far" — graded against days played, not the full 14-day
 *  headroom, so a strong opening day never reads as "losing" (source comment cites
 *  a real bug found 2026-08-05: grading day 1 against 14 days of range pinned the
 *  meter near empty after a perfect day). */
export function momentumFrac(decks: CrisisDecks, state: CrisisRunState): number {
  const played = state.log?.length || 0;
  const scored = crisisRange(decks, state.biz, played);
  if (!played || scored.hi <= scored.lo) return 0.5;
  return crisisFrac(decks, state.biz, state.crisisScore, played);
}

export function momentumWord(decks: CrisisDecks, state: CrisisRunState): MomentumWord {
  const played = state.log?.length || 0;
  const scored = crisisRange(decks, state.biz, played);
  if (!played || scored.hi <= scored.lo) return "Starting out";
  const mf = momentumFrac(decks, state);
  if (mf < 0.35) return "Shaky";
  if (mf < 0.65) return "Building";
  if (mf < 0.85) return "Solid";
  return "Strong";
}

/** Backdrop/day-band keying — kept here because the RN shell will still need to know
 *  which of the three art bands a given day falls into (1-4 dawn, 5-9 morning, 10-14 day),
 *  even though picking the actual asset is a UI concern. dayNum is 1-indexed. */
export type CrisisTimeOfDay = "dawn" | "morning" | "day";
export function timeOfDay(dayNum: number): CrisisTimeOfDay {
  if (dayNum <= 4) return "dawn";
  if (dayNum <= 9) return "morning";
  return "day";
}

/** A "good call" is the day's own best-available score, or within one point of it —
 *  the deck's numbers decide, not a threshold invented in this layer. Days with no
 *  decision are neutral: 0, neither building nor breaking a streak. */
export function judgeCall(e: CrisisEventVariant, score: number): -1 | 0 | 1 {
  if (!e.decisions) return 0;
  const best = Math.max(...e.decisions.map((x) => x.score || 0));
  return (score || 0) >= best - 1 ? 1 : -1;
}

export interface ResolveResult {
  state: CrisisRunState;
  /** what the UI layer should say/animate off of — the prototype's `say(...)`,
   *  popNumber/flash/shake/buzz/burst calls all derive from these same fields. */
  delta: number;
  outcome: string;
  streakBroke: boolean;
  streakExtended: boolean;
  /** true if this call was a no-op because the day was already resolved. */
  alreadyResolved: boolean;
}

/** Applies one day's chosen (or forced) outcome to run state. Mirrors `resolve()`.
 *  Prototype comment: "a double-tap must not bank the day twice" — if the day is
 *  already resolved, this silently no-ops and returns the unchanged state, same as
 *  the prototype's early return (NOT a throw — an onPress double-tap must not crash). */
export function resolve(
  decks: CrisisDecks,
  state: CrisisRunState,
  delta: number,
  score: number,
  outcome: string,
  choiceLabel: string
): ResolveResult {
  if (state.resolved) {
    return {
      state,
      delta: state.lastDelta ?? 0,
      outcome: state.lastOutcome ?? "",
      streakBroke: false,
      streakExtended: false,
      alreadyResolved: true,
    };
  }
  const e = today(decks, state);
  const verdict = judgeCall(e, score);
  const streak = verdict > 0 ? state.streak + 1 : verdict < 0 ? 0 : state.streak;
  const appliedDelta = delta || 0;
  const appliedOutcome = outcome || "";

  const nextState: CrisisRunState = {
    ...state,
    cash: state.cash + appliedDelta,
    crisisScore: state.crisisScore + (score || 0),
    resolved: true,
    streak,
    lastDelta: appliedDelta,
    lastOutcome: appliedOutcome,
    log: [
      ...state.log,
      {
        day: state.day + 1,
        event: e.title,
        type: e.type,
        choice: choiceLabel || "",
        delta: appliedDelta,
        score: score || 0,
        cash: state.cash + appliedDelta,
      },
    ],
  };

  return {
    state: nextState,
    delta: appliedDelta,
    outcome: appliedOutcome,
    streakBroke: verdict < 0,
    streakExtended: verdict > 0,
    alreadyResolved: false,
  };
}

export type NextDayResult =
  | { kind: "advance"; state: CrisisRunState }
  | { kind: "finish"; broke: boolean; state: CrisisRunState };

/** Mirrors `nextDay()`. Cash <= 0 ends the run broke, regardless of day; otherwise
 *  the last day ends the run clean; otherwise advance and clear `resolved`.
 *  On finish, `state.ended = true` is set and returned so a resumed session's nav
 *  guard (prototype: `case "end": return !!state.ended;`) can route to the end
 *  screen after a reload. */
export function nextDay(decks: CrisisDecks, state: CrisisRunState): NextDayResult {
  if (state.cash <= 0) return { kind: "finish", broke: true, state: { ...state, ended: true } };
  const days = totalDays(decks, state.biz);
  if (state.day >= days - 1) return { kind: "finish", broke: false, state: { ...state, ended: true } };
  return {
    kind: "advance",
    state: { ...state, day: state.day + 1, resolved: false },
  };
}

export function createInitialCrisisState(biz: BusinessId, capital: number): CrisisRunState {
  return {
    biz,
    day: 0,
    cash: capital,
    crisisScore: 0,
    resolved: false,
    streak: 0,
    log: [],
  };
}
