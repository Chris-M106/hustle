# Scanner Slice — Implementation Plan (DRAFT, awaiting approval)

**Status: plan only, nothing built.** Written after the navigation spike passed
(`NAVIGATION_SPIKE_REPORT.md`) and the prior Scanner planning report was found **not to exist on
disk** — that report lived in a since-cleared session and was never persisted to a file. This
plan is derived fresh from the prototype's actual Scanner-stage code
(`prototype/hustle-shell.html` lines ~1466-2170, ~2845-2867), not from memory of the missing
report. Flagging this so the gap is visible, not papered over.

## Scope — one business, full loop, nothing else

> scan → select → commit → persist → restart → restore

Explicitly deferred (do not build this pass):
- Carousel / multi-business grid (prototype has 5 `OPPS`; slice hardcodes **1**: Phone Repair
  Kiosk, `cost:1200`, `CAPITAL:2500` — the only always-affordable, highest-verdict spot, so no
  over-budget branch needs UI this pass)
- Full Five Forces presentation (`forcesHTML`, the 5-row pressure gauge, `FORCES` table,
  `topForce` commit-hint line) — real domain logic, but a rendering-heavy feature, not a
  navigation/persistence stress test
- Animations (`revealIn`, damage numbers, haptics, curtain transitions)
- Plan-stage implementation or transition
- Full Profile→Scanner integration (stat unlocks `finance/sales/network >= 7`, archetype)

## State model

```ts
type ScannerState = {
  scanned: boolean;        // spot has been "checked out" — readout visible
  selected: boolean;       // spot tapped a 2nd time — chosen, not yet paid for
  committed: boolean;      // capital spent, locked in
  cash: number | null;     // opening cash after commit (CAPITAL - cost), null until committed
};

const BIZ = {
  id: "phonerepair", name: "Phone Repair Kiosk",
  demand: "HIGH", comp: "LOW", cost: 1200,
} as const;
const CAPITAL = 2500;
```

Three taps, not two — matches the prototype's real interaction model (`renderScan`
click handler: first tap sets `scanned`, second tap on an already-scanned spot sets
`state.biz`/selection; a separate Commit button then spends capital). Collapsing scan+select
into one tap would be a real behavior change, not a simplification — the prototype's own
comment history (the re-commit `state.plan` bug) shows this project treats commit as a distinct,
consequential action from selection.

## Domain functions to port (verbatim arithmetic, from `hustle-shell.html`)

- `affordable(o) => o.cost <= CAPITAL` — line 1913
- `opening(o) => CAPITAL - o.cost` — line 1918
- `overBy(o) => Math.max(0, o.cost - CAPITAL)` — line 1917 (ported even though unreachable with
  the hardcoded always-affordable business, so the guard exists and is testable, not silently
  dropped for the next slice that adds a second business)

These are pure 3-line functions — no separate `domain-ts/scanner/` package needed at this scope;
inline in the screen component is proportionate. Revisit only if a second business is added.

## Persistence boundary

Reuse the existing module-scope write-queue / backup-before-overwrite / validated-restore
pattern **verbatim**, same as the nav-spike copied it from the Crisis slice — do not modify the
persistence mechanism itself, only the shape of what's stored.

- Key: `hustle.scanner.v1`
- Payload: the `ScannerState` object above
- Restore path: on mount, attempt `AsyncStorage.getItem` → validate shape → hydrate state;
  corrupt/missing → fresh state (`scanned:false, selected:false, committed:false, cash:null`),
  same as Crisis/nav-spike's existing corruption handling

## Maestro flow (baseline)

`.maestro/scanner_baseline.yaml`:
1. Launch, assert "Phone Repair Kiosk" tile visible, unscanned state (no readout)
2. Tap spot → assert readout visible (demand HIGH, competition LOW, cost R1,200)
3. Tap spot again → assert "selected" state (button reflects chosen)
4. Tap Commit → assert committed state, cash = R1,300 (2500-1200)
5. `stopApp` (genuine kill)
6. Relaunch → assert restored: committed, cash R1,300, readout still visible

Plus a **mandatory negative control** (`scanner_negative_control.yaml`) asserting a false cash
value, to prove the harness isn't vacuously passing — same discipline as the nav spike.

## Adversarial cases

- Rapid repeated taps on Commit before the write-queue flushes (double-spend guard — commit
  must be idempotent once `committed:true`)
- Kill mid-sequence: scanned-but-not-selected, then kill/relaunch — must restore to exactly that
  partial state, not silently advance or reset
- Kill immediately after Commit tap, before the async persist call resolves — does the write
  queue's existing backup-before-overwrite protect against a torn write here, or does this
  slice need to await persistence before enabling next-screen navigation (open question, not
  pre-answered by copying the pattern verbatim)
- Corrupt/malformed AsyncStorage value on restore — falls back to fresh state, doesn't crash
- Rapid scan→select→scan-again spam — state machine shouldn't reach an invalid combination
  (e.g. `selected:true` while `scanned:false`)

## Stop conditions (this slice is done when, and ONLY when)

- Baseline + adversarial Maestro flows pass, `adversary`-reviewed
- Negative control fails as required
- EMULATOR-VERIFIED (not REAL-DEVICE-VERIFIED — standing project limitation)
- No carousel, no full Five Forces UI, no animations, no Plan transition, no Profile
  integration exist in the diff — if any of those show up mid-build, that's scope creep against
  this plan and should be flagged, not silently included

## Open question for approval

The persist-before-navigate timing question above (adversarial case 3) is a real design
decision this plan surfaces but doesn't resolve — flagging it here rather than picking
unilaterally, since it affects the persistence boundary's actual guarantee.

---

**Awaiting approval. Not implementing until confirmed.**
