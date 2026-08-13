# Maestro Test-Harness Investigation — 2026-08-12

Scope: why `crisis_persistence_adversarial.yaml` repeatedly reported FAILED while
screenshots/ADB showed the app in the correct state. GRAPH → LOOP → ADVERSARY per governing
instruction. EMULATOR-VERIFIED (`hustle_lowend` AVD), REAL-DEVICE-UNVERIFIED throughout.

## 1. Root cause of the Maestro false-failure behavior

**Two distinct, compounding causes, both TEST BUGS — not application bugs.**

**Cause A — vacuous `notVisible` gate.** The original flow used
`extendedWaitUntil: { notVisible: "Loading saved run" }` as its "app finished mounting" gate.
This assertion is satisfied both when loading has genuinely finished AND when the JS bundle
hasn't rendered *anything* yet (native splash / blank hierarchy, zero text nodes — verified
directly: hierarchy dump at a failure point had an empty text-node list, screenshot was a
blank white/grey screen). On this emulator, JS bundle start after process launch was observed
to take anywhere from ~1s to 75s+ across runs (`device-logcat.txt` `ReactNativeJS: Running
"HustleCrisisSlice"` timestamp vs. process-start `ActivityTaskManager: START` timestamp,
diffed directly — one run showed a 23s gap). The vacuous pass let the flow proceed against a
still-blank screen before real content existed, so the next step (`tapOn "Take the day"`)
correctly failed to find an element that genuinely wasn't there yet — but the *test's own
design* is what let it race ahead, not a real app defect.

**Cause B — substring selector used against a full-match regex engine.** Independently and
more consequentially: even after fixing Cause A with a positive `visible:` gate on real
content text (`"Day 1 / "`), the flow **still failed on a screen directly confirmed correct**
— screenshot and hierarchy dump both captured at the exact moment of the reported FAILED
showed `"Day 1 / 14"` present verbatim in the hierarchy's text nodes, rendered exactly as
expected on screen. Maestro's `visible`/`notVisible` text selector matches with full-string
regex semantics (Java `String.matches()`), not substring/contains search. `"Day 1 / "` is a
true substring of the actual text `"Day 1 / 14"` but does not fully match it (unmatched
trailing `"14"`), so the assertion reports NOT FOUND against a screen that plainly has the
text — indistinguishable from a real absence without opening the hierarchy dump. This is the
dominant cause of the false failures seen across the 5+ prior runs of this flow; the
pre-existing `crisis_day1_flow.yaml` never hit this because it already wrote every selector as
a wildcarded regex (`".*Day 1 / 14.*"`), confirming the bug is specific to how the adversarial
flow's selectors were authored, not a Maestro-wide or app-wide defect.

**Classification: Cause A = TEST METHODOLOGY BUG (wrong gate design). Cause B = TEST
METHODOLOGY BUG (selector-semantics misunderstanding).** Neither is an application defect;
neither is emulator/tooling flakiness in the sense of nondeterministic infrastructure — both
are deterministic, explainable mistakes in how the flow file was written.

## 2. Can the test method be made trustworthy?

**Yes, for this flow, with the two fixes applied and re-verified below.** Not a blanket claim
for Maestro generally — see "Remaining test-harness limitations."

## 3. What was changed

`crisis_persistence_adversarial.yaml` rewritten:
- Every `notVisible`-as-mount-gate step replaced with a positive `extendedWaitUntil: visible:`
  on real rendered content (`"Day 1 / .*"`, `"Day 2 / .*"`), which cannot pass vacuously — the
  text must actually exist in the hierarchy.
- Every text selector rewritten as a real regex with `.*` wildcards instead of a bare prefix
  string, matching the pattern `crisis_day1_flow.yaml` already used correctly.
- Timeout on the post-launch mount gate raised to 90000ms (from the original 20000-30000ms),
  sized to the slowest genuinely-observed bundle-start time on this emulator plus margin — not
  an arbitrary bump to force green; justified by the logcat timing evidence in Cause A above.

## 4. Fresh successful and intentionally failing test cases

All evidence below is from runs executed this pass (`2026-08-12` 15:07–15:19), not reused from
the pre-fix build.

- **3 consecutive full-flow passes** of the rewritten `crisis_persistence_adversarial.yaml`
  (`2026-08-12_150734`* first attempt still using the old bare-prefix selector, FAILED —
  this is what surfaced Cause B; `2026-08-12_151641` and two more back-to-back runs, all
  COMPLETED end-to-end: fresh launch → Day 1 render → tap → resolve → advance → Day 2 → kill
  (`stopApp`) → relaunch → restore confirmed).
- **1 intentional-failure control case** (`debug_intentional_fail.yaml`, written this pass,
  deleted after use — not a permanent flow): asserted `"Day 99 / .*"` is visible against a
  correctly-rendered Day-1 screen. Result: **FAILED**, correctly. Confirms the harness can
  still distinguish a genuinely false assertion from a true one — the fix didn't just relax
  assertions until everything reports green.

## 5. Evidence a real app failure is detected

The control case in §4 is the direct evidence: `"Day 99 / .*"` does not exist anywhere on a
screen that is otherwise fully mounted and correct (same run, `"Day 1 / .*"` passed
immediately before it) — Maestro reported FAILED, correctly, with no ambiguity. This is a
constructed proof, not a real app regression — no genuine app defect was found or introduced
this pass; per the governing instruction, persistence work is out of scope and no application
code was modified.

## 6. Evidence the known false-failure condition is eliminated or bounded

- Cause A (vacuous gate): eliminated by construction — every gate in the rewritten flow is a
  positive `visible:` assertion; there is no remaining `notVisible`-as-mount-proof step in this
  flow file.
- Cause B (substring-vs-full-match): eliminated by construction in this flow — every selector
  audited and rewritten as a wildcarded regex. **Bounded, not eliminated project-wide**: this
  was fixed only in `crisis_persistence_adversarial.yaml` (the file that had the bug).
  `crisis_day1_flow.yaml` was checked and already correct. Any *future* flow file written with
  a bare non-wildcarded text selector will reproduce Cause B — this is a per-file authoring
  discipline, not a Maestro config fix, so it doesn't automatically prevent recurrence in a new
  flow.
- Confirmed stable across 3 consecutive fresh runs with zero flakes post-fix — small sample,
  see limitations below.

## 7. Remaining test-harness limitations

- **Sample size is 3 consecutive passes**, not dozens — cannot rule out a lower-frequency
  timing flake (e.g. a run that happens to exceed even the 90s mount-gate timeout on unusually
  slow hardware/CI). The 90s figure is evidence-based (worst observed + margin) but not proven
  as an absolute ceiling.
- **No CI/headless execution tested** — every run here was interactive, on one known-state
  local emulator (`hustle_lowend`), one machine. Behavior on a CI runner (different host
  performance, possibly different emulator image) is unverified.
- **The selector-full-match trap is a general Maestro behavior**, not something this pass
  patched at the tool level — any future flow author can reintroduce Cause B by writing a
  bare-prefix selector again. No lint/guard exists to catch this at authoring time; it's
  documented here and in the shared knowledge vault (see below) as a discipline, not enforced
  mechanically.
- **Baseline flow (`crisis_day1_flow.yaml`) was read for comparison but not re-executed this
  pass** — it was already known-good and out of scope for this investigation's changes.
- Cause A's underlying slow-bundle-start behavior (up to 75s observed) was not itself
  investigated further (e.g. whether it's Metro/dev-build overhead, emulator resource
  contention, or something fixable) — the fix here is a longer, evidence-sized timeout, not a
  fix to the slowness itself. If real device testing later shows much faster bundle starts,
  90s remains a safe (if generous) upper bound, not a claim that the app takes that long
  normally.

## 8. Is Maestro reliable enough as an autonomous gate for the next vertical slice?

**Conditional yes, for flows written with the two disciplines confirmed above** (positive
`visible:` gates only, wildcarded regex selectors always) — not an unconditional green light
for Maestro as a tool. Concretely: before trusting a *new* flow file as an autonomous
pass/fail gate, its selectors need the same audit this pass gave
`crisis_persistence_adversarial.yaml` (either match the full text, or wrap in `.*`), and any
mount/loading gate needs to assert presence of real content, never absence of a loading
indicator. Given the 3-run sample size and single-machine scope, this is *likely* trustworthy
[Likely] for near-term use, not *certain* [Certain] — recommend widening the run sample (10+
consecutive passes) before fully removing human screenshot review from the loop for
persistence-class flows specifically, since those are the ones with the longest, most
variable async-mount windows.

## Portable lesson (flagged, not yet extracted)

Cause B (full-match-not-substring text selector) generalizes beyond HUSTLE and beyond Maestro
(any UI-automation tool with regex-based text matching can have the same trap) but was not
written to the shared knowledge vault this pass — no `/librarian` pass was run, and vault
writes go through that skill's propose-before-writing gate, out of scope for this
investigation. Flagged `LIBRARIAN CANDIDATE` in `LESSONS_LEARNED.md` instead.
