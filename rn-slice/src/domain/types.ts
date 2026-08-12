/** Framework-agnostic types for the HUSTLE "Crisis" stage (stage 4 of the prototype).
 *  Mirrors the shape of hustle/domain/crisis-decks.json exactly — do not
 *  reshape the data, this layer describes what the prototype already emits.
 */

export type BusinessId = "phonerepair" | "spaza" | "salon" | "shisanyama" | "clothing";

export type CrisisEventType =
  | "income"
  | "decision"
  | "crisis"
  | "opportunity"
  | "expense"
  | "competition"
  | "emergency";

export interface CrisisLesson {
  title: string;
  body: string;
  /** NVC = the prototype's real-world curriculum tie-in (unit standard reference). */
  nvc: string;
}

export interface CrisisDecisionOption {
  id: string;
  label: string;
  detail: string;
  cashChange: number;
  score: number;
  outcome: string;
}

/** A single day-event variant. `decisions` present <=> player is offered a choice;
 *  absent <=> the day just happens (income/expense with a fixed cashChange). */
export interface CrisisEventVariant {
  /** 1-indexed (day 1..14) — do NOT compare directly against CrisisRunState.day,
   *  which is 0-indexed and used to index the deck array. */
  day: number;
  type: CrisisEventType;
  title: string;
  description: string;
  cashChange?: number;
  /** false on the 30 no-decision events (income/expense with a fixed cashChange);
   *  absent (not present) on the 180 decision events — matches crisis-decks.json's
   *  actual shape, do not widen to required `boolean`. */
  hasDecision?: boolean;
  decisions?: CrisisDecisionOption[];
  outcome?: string;
  lesson?: CrisisLesson;
}

/** Each day-slot in the deck is an array of interchangeable variants; the prototype
 *  always resolves slot[0] (documented in-source as a determinism fix for facilitators —
 *  the shipped build originally picked a random variant per slot). */
export type CrisisDaySlot = CrisisEventVariant[];

export type CrisisDeck = CrisisDaySlot[];

export type CrisisDecks = Record<BusinessId, CrisisDeck>;

/** The subset of run state the Crisis stage reads and mutates.
 *  `plan`/`archetype` etc. belong to other stages and are intentionally NOT modeled
 *  here. */
export interface CrisisRunState {
  biz: BusinessId;
  day: number;
  cash: number;
  crisisScore: number;
  resolved: boolean;
  streak: number;
  log: CrisisLogEntry[];
  /** Persisted so a resumed session (app reload mid-day) can redraw the outcome
   *  panel for the day just closed — prototype's renderCrisis reads these. */
  lastDelta?: number;
  lastOutcome?: string;
  /** Set once the run is over; drives the resume-to-end-screen nav guard. */
  ended?: boolean;
}

export interface CrisisLogEntry {
  day: number;
  event: string;
  type: CrisisEventType;
  choice: string;
  delta: number;
  score: number;
  cash: number;
}

export interface ScoreRange {
  lo: number;
  hi: number;
}

export type MomentumWord = "Starting out" | "Shaky" | "Building" | "Solid" | "Strong";
