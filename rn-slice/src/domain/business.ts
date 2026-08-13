/** Single shared business-identity representation for HUSTLE's RN domain layer.
 *
 *  Before this file existed, Scanner and Crisis modeled the same concept two
 *  different ways: Scanner's `ScannerOpportunity.id` (src/domain/scanner/types.ts)
 *  was a bare `string`, while Crisis's `BusinessId` (src/domain/types.ts) was a
 *  closed 5-member union. Not yet actually duplicated as data — RN only ever
 *  instantiates one hardcoded business today (App.tsx's `BIZ`, id "phonerepair")
 *  — but two independent type representations of the same identity concept was a
 *  real seed for future divergence (e.g. a typo'd Scanner id silently failing to
 *  match a real Crisis deck instead of failing to compile). This module is the
 *  one place both domains now import `BusinessId` from.
 *
 *  Source of truth for the id set: crisis-decks.json's top-level keys, confirmed
 *  1:1 against this union (2026-08-13, `node -e "console.log(Object.keys(require('./src/domain/crisis-decks.json')))"`
 *  -> ["phonerepair","spaza","salon","shisanyama","clothing"]). No mismatch found —
 *  documenting that explicitly rather than assuming it, per task instructions.
 *
 *  BUSINESS_META is intentionally partial: Scanner only has real
 *  ScannerOpportunity-shaped content (name/short/demand/comp/cost) for
 *  "phonerepair" today (ported from the prototype's OPPS table,
 *  hustle-shell.html:1466). The other four ids are real Crisis identities (Crisis
 *  has full 14-day decks for all five in crisis-decks.json) but Scanner has never
 *  had opportunity content for them — so this table does NOT fabricate cost/demand/
 *  comp data for them. Consuming code must treat a missing BUSINESS_META entry as
 *  "no Scanner content yet for this business", not as a bug.
 */

export type BusinessId = "phonerepair" | "spaza" | "salon" | "shisanyama" | "clothing";

export const BUSINESS_IDS: readonly BusinessId[] = [
  "phonerepair",
  "spaza",
  "salon",
  "shisanyama",
  "clothing",
];

export function isBusinessId(v: unknown): v is BusinessId {
  return typeof v === "string" && (BUSINESS_IDS as readonly string[]).includes(v);
}

export type DemandLevel = "LOW" | "MEDIUM" | "HIGH";
export type CompetitionLevel = "LOW" | "MEDIUM" | "HIGH";

/** The fields Scanner's ScannerOpportunity needs. Crisis's own consumers only ever
 *  need the bare `BusinessId` (as a deck key / state field) and do not read this
 *  table — see src/domain/types.ts and src/domain/logic.ts, neither imports it. */
export interface BusinessMeta {
  id: BusinessId;
  name: string;
  short: string;
  demand: DemandLevel;
  comp: CompetitionLevel;
  cost: number;
}

/** Partial on purpose — see file header. Only "phonerepair" has real content. */
export const BUSINESS_META: Partial<Record<BusinessId, BusinessMeta>> = {
  phonerepair: {
    id: "phonerepair",
    name: "Phone Repair Kiosk",
    short: "Phone Repair",
    demand: "HIGH",
    comp: "LOW",
    cost: 1200,
  },
};
