# Next cross-stage experiment: Scanner -> Plan -> Crisis (plan only, not built)

Status: **PLAN DOCUMENT ONLY.** Nothing in this file has been implemented. Per the coordinator's
explicit instruction, no Plan screen/stage was built to produce this document — it is derived
from reading `SCANNER_SLICE_PLAN.md`, `SCANNER_SLICE_REPORT.md`, the Crisis slice's existing
persistence pattern (`App.tsx` in this same repo predates Scanner and established the
write-queue/autosave conventions Scanner reused), and `ROADMAP.md`/`ARCHITECTURE.md` in the
parent repo (read-only).

## Why this experiment, and why now

Two independent validation slices exist (Crisis, Scanner), each proving the raw-root-state +
AsyncStorage architecture holds up for *one* stage in isolation. Neither proves stages can
**hand off state to each other** — shared business identity, a Plan stage that consumes what
Scanner committed, and Crisis eventually reading the same committed business. That handoff is
the actual product shape (14-day loop: scan a spot, plan it, then survive crises against it) and
is currently unvalidated. This is the smallest slice that tests the handoff itself rather than
either endpoint again.

## Smallest viable experiment

**Scope:** Scanner (already built) -> a minimal Plan stub (NOT the real Plan screen/content) ->
Crisis (already built) reads the committed business's identity.

1. Scanner commits `phonerepair` exactly as it does today — no change to Scanner.
2. A new minimal "Plan stub" screen: reads `hustle.scanner.v1`'s `committedTo`/`setupCost`/
   `cash`, displays them read-only (e.g. "You committed R1,200 to Phone Repair Kiosk. Cash:
   R1,300."), and a single button that writes a trivial `hustle.plan.v1` record
   (`{ businessId: committedTo, planConfirmedAt: <timestamp> }`) and does nothing else — no
   real Plan mechanics (five-forces strategy picks, pricing, staffing — all deferred, matching
   how Scanner deferred the carousel).
3. Crisis reads `hustle.plan.v1.businessId` (falling back to a hardcoded default if absent, so
   Crisis's existing standalone validation isn't broken) and displays that business's name
   somewhere in its own screen, proving the identity actually flowed through two persisted
   hops, not just one.
4. One Maestro flow: fresh install -> Scanner scan/select/commit -> Plan stub confirm -> Crisis
   launch -> assert Crisis shows the same business name Scanner committed. Plus one kill/relaunch
   at the Plan-stub step, same discipline as Scanner's own kill-before-commit case.

## Dependencies and shared state this experiment must get right

- **Storage key namespace collision risk:** three keys (`hustle.scanner.v1`, `hustle.plan.v1`,
  the Crisis slice's own existing key) must coexist in one AsyncStorage instance without a
  write-queue race — the existing `writeQueue` module-scope pattern in each slice's `App.tsx`
  is per-file/per-module today; a combined app needs ONE shared write queue, not three
  independent ones, or a fast sequence of writes across stages can interleave.
- **Business-identity contract:** Scanner today hardcodes one business (`phonerepair`).
  Plan/Crisis reading `committedTo` as a string ID (not the full `ScannerOpportunity` object)
  means Plan/Crisis need their own copy of business metadata (name, cost) keyed by the same ID
  — a second hardcoded `BIZ` table, or a shared one. Decide before building: shared constant
  module, or duplicated per-slice (Scanner/Crisis already duplicate patterns independently by
  design in this validation-slice approach).
- **Persistence-hop failure semantics:** what happens if Plan-stub's write fails (mirroring
  Scanner's own `COMMIT_FAIL_NOTE` handling)? What does Crisis do if `hustle.plan.v1` is
  missing/corrupt but `hustle.scanner.v1` shows a valid commit — does Crisis trust Scanner's
  key directly, or strictly require the Plan hop? This experiment should deliberately test
  the corrupt/missing-Plan-record case, not just the happy path.
- **Destructive reset semantics:** none of the three slices currently define what "start a new
  run" means across all three keys at once (each slice's own reset is local/undefined). This
  experiment doesn't need to solve it, but should not accidentally *require* solving it —
  keep the Plan stub's own reset (if any) scoped to `hustle.plan.v1` only.
- **Downstream consumers beyond Crisis:** none yet (Profile integration is explicitly out of
  scope per `SCANNER_SLICE_PLAN.md`) — this experiment's scope should stop at Crisis, not chase
  a third hop.
- **Minimum viable UI/content for the Plan stub:** read-only display + one confirm button, as
  above — explicitly not the real Plan screen (five forces strategy, pricing decisions,
  staffing) per the "no Plan build" constraint already given twice this session.

## Strongest argument AGAINST doing this next

Scanner and Crisis were each validated with real adversarial rigor (round-2 findings, fresh
differential tests, real native-corruption reproduction) specifically because each stage's
*own* internal correctness was the open question. The cross-stage handoff experiment tests a
**different, narrower** question — "can two AsyncStorage-backed screens agree on a shared ID"
— which is a much smaller unknown than either stage's internal logic was. There is a real risk
this experiment produces a false sense of validated integration: proving a 3-line stub screen
can read a string ID from AsyncStorage does not prove the *real* Plan stage (five forces
strategy content, pricing decisions, a materially larger UI) will integrate cleanly, because a
stub by construction avoids the actual complexity (form state, its own persistence shape, its
own adversarial surface) that a real Plan screen would introduce. In other words: this
experiment risks answering "yes, integration works" prematurely, on a stub thin enough that the
answer doesn't transfer to the real Plan stage's actual scope. The genuinely open architectural
question — whether raw-root-state without a nav library scales past 2 real stages of UI
complexity, not 2 stages where one is a 4-line stub — remains untested either way.

## Smaller-experiment recommendation

Given the above, a smaller and more targeted experiment is likely higher-value than building
even the stub Plan screen: **write a single Maestro/Jest test today, against the two slices as
they currently exist independently, that only proves the storage-key-coexistence and
write-queue-sharing question** — install both App.tsx's business logic into one process (a
throwaway combined test harness, not a real merged app), run Scanner's commit and Crisis's own
write in interleaved sequence, and assert no write is lost or corrupted. This isolates the one
concrete unknown (can one shared AsyncStorage/write-queue instance serve two stages
concurrently without a race) without committing to Plan's UI/content scope, is buildable in a
fraction of the time, and its failure mode (a real interleaving bug) would be a genuine
architectural red flag worth stopping for — whereas the stub-Plan experiment's failure mode
("stub screen couldn't read a string") would be nearly impossible to fail and thus low
information value for the time spent.

**Recommendation: do the smaller write-queue-coexistence experiment first. Only build the Plan
stub (as scoped above) if that smaller experiment passes AND the coordinator decides validating
the UI-handoff shape specifically (not just storage) is worth a dedicated slice.**
