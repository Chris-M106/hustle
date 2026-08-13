# RN Architecture Validation Report — Crisis Vertical Slice

> Produced 2026-08-12, autonomous overnight pass. Answers `ARCHITECTURE.md` §11/§12's own
> validation gate: "validate that slice on a real low-end Android device — the first real
> test of §10's bet." Scope was explicitly a Crisis-only vertical slice, not a migration.
> `prototype/hustle-shell.html` was not touched and remains canonical. Per binding stop
> condition, no migration work has been started off the back of this report — it stops here
> and waits for the user.

## Verdict: **CONDITIONAL GO**

React Native + Hermes + New Architecture works end-to-end for HUSTLE's actual domain logic
and content on this machine's emulator — the slice built, ran, and rendered correctly after
three adversary-review cycles found and fixed real bugs. The recommendation in
`ARCHITECTURE.md` is not falsified by anything found this pass. It is not a clean GO because
one condition `ARCHITECTURE.md` itself named as required — **real low-end device
validation** — could not be run this pass (no physical device available; emulator-only), and
because the build/dev-loop friction found was worse than the architecture doc anticipated.

## What was validated

- **Domain layer portability** (`ARCHITECTURE.md` §6's central bet): `domain-ts/crisis`
  ported 1:1 from the prototype's Crisis arithmetic, zero RN/DOM/React imports, `tsc --strict`
  clean, and a 1000-run differential simulation vs. a verbatim prototype re-implementation
  found 0 arithmetic mismatches. 3 rounds of adversary review, final verdict SHIP — this
  layer is solid. Full history in `ROADMAP.md` Phase 1.
- **RN + Hermes + New Architecture, functioning together**: `rn-slice/` is bare RN 0.87.0,
  `newArchEnabled=true` and `hermesEnabled=true` by default (RN 0.87's own default, no manual
  wiring needed) — confirmed via direct `cat` of `android/gradle.properties`, not assumed.
- **A real UI screen against real content**: `App.tsx` renders the actual Crisis decks
  (`crisis-decks.json`, byte-identical to the prototype's), plays a full day loop (event →
  choice → resolve → advance), and was adversary-reviewed as a code deliverable (verdict SHIP
  WITH FIXES, all 7 confirmed issues fixed — full list in `ROADMAP.md` Phase 3). Confirmed
  working on an emulator via direct screenshot inspection (`/c/Android/rn_crisis_screen6.png`),
  not by trusting build/launch status alone.

## What was NOT validated (real gaps, not hedges)

1. **Real device.** `ARCHITECTURE.md` §11 names this as the first real test of §10's whole
   low-end-hardware bet. This pass is emulator-only — the emulator's performance profile does
   not stand in for a real low-end Android phone's memory pressure, thermal throttling, or
   actual touch-input latency. This is the single biggest reason the verdict isn't a clean GO.
2. **Persistence.** Confirmed by direct grep (not assumed): zero references to
   AsyncStorage/MMKV/any storage API anywhere in `rn-slice/`. State is `useState`-only and is
   lost on app kill or reload. `ARCHITECTURE.md` §12 recommends on-device persistence as
   part of the architecture; this slice never needed to exercise it, so nothing here confirms
   or denies that persistence will be straightforward to add.
3. **RN-native UI-test tooling.** Not installed or run this pass — `ARCHITECTURE.md` §11
   calls for standing this up alongside the vertical slice. Researched Detox vs. Maestro
   instead of assuming the existing Playwright harness transfers (it can't — Playwright drives
   a DOM, on-device RN has none). Left as an **open decision for the user**, not picked:
   Detox is gray-box/lowest-flakiness-for-pure-RN but heavier to integrate and has lagged past
   RN architecture upgrades; Maestro is black-box/zero-footprint/fastest-to-set-up with even
   lower reported flakiness but shallower native integration. See `ROADMAP.md` Phase 5 for the
   full comparison and sources.
4. **Performance vs. the prototype — qualitative only, not benchmarked.** No profiling/
   instrumentation was set up this pass. Subjectively, on-device interaction (button taps,
   screen transitions) felt immediate with no visible jank across the screenshots taken, but
   this is not a measurement and should not be read as one — `ARCHITECTURE.md` §12's own
   position is that the RN/Flutter/Capacitor comparisons are industry figures, not
   measurements of this app; that gap is still open after this pass, just narrowed slightly
   for the specific Crisis-slice content.

## Architectural health check against `ARCHITECTURE.md`'s original recommendation

The recommendation holds, conditionally:

- **Confirmed**: the domain-layer/UI split works exactly as designed — the same
  `domain-ts/crisis` logic runs unmodified under both a browser (differential sim harness)
  and a real RN/Hermes/Fabric runtime. This was the highest-risk assumption in §6 and it's now
  directly demonstrated, not just argued.
- **Confirmed**: RN 0.87 ships New Architecture + Hermes on by default — §10's bet doesn't
  require fighting opt-in flags or version-compatibility issues that older RN guidance worried
  about.
- **New information not in the original doc**: the Android/Gradle build toolchain on this
  specific dev machine is meaningfully more fragile than a "framework decision" discussion
  usually accounts for — five distinct environment gotchas (JAVA_HOME not set by default, adb
  not on PATH by default, a 44-minute first cold build, an ~20s+ first-launch timing trap that
  can look like a crash, and a Gradle 9.4.1 internal timeout that produces a false-negative
  BUILD FAILED after a real successful install) were hit and resolved before a single screen
  could be verified working. None of these are architecture-level problems — they're dev-loop
  friction — but `ARCHITECTURE.md` didn't budget for them, and a team without this session's
  troubleshooting trail would lose real time to each one. Full detail: `ANDROID_SETUP.md`
  "Bug 3", `ROADMAP.md` Phase 3.
- **Not yet stress-tested**: nothing in this slice exercises cross-stage state (Scanner →
  Plan → Crisis blending, per Phase 1's explicitly-deferred `finish()` logic), multi-screen
  navigation, or the animation-heavy game-feel layer `DESIGN.md` specifies (GSAP equivalents
  don't exist in RN — Reanimated/Skia was explicitly deferred in `ARCHITECTURE.md` §12 pending
  slice experience, and this slice didn't need any of that layer to prove the domain-logic
  bet). That's a real unknown for the *next* slice, not a defect in this one.

## Recommendation

Proceed with React Native as the target architecture. Before extending beyond this slice:

1. Get real low-end Android device access and re-run this exact slice on it — the one
   condition `ARCHITECTURE.md` itself treats as blocking.
2. Decide Detox vs. Maestro (`ROADMAP.md` Phase 5) — needed before the next slice, since
   `ARCHITECTURE.md` §11 sequences UI-test tooling alongside vertical-slice work, not after it.
3. Budget real time for environment setup on any new dev machine — the five gotchas in
   `ANDROID_SETUP.md` are not one-offs specific to this machine's history, they're generic
   RN/Android-toolchain friction (JAVA_HOME, adb PATH, first-build time, launch-timing traps,
   Gradle's own flaky diagnostics writer) that will recur on a fresh machine.
4. Do not start a full migration yet. Per the binding stop condition on this validation pass,
   that decision is the user's to make now that this report exists — the next slice (Scanner
   or a persistence-exercising screen) is the logical next step if a GO is confirmed, but this
   agent is not choosing to start it unprompted.

## Adversarial emulator validation pass 2 (2026-08-12, `hustle_lowend` AVD, release APK)

No physical Android device was available for this pass either. All results below are
**EMULATOR-VERIFIED**, not **REAL-DEVICE-UNVERIFIED** — emulator CPU/memory behavior does not
reproduce real thermal throttling, real touch-controller latency, or real low-end-hardware
memory pressure. Listed as additional evidence toward the report's Recommendation item 1, not
as a substitute for it.

- **Cold start, 5 cycles (force-stop → `am start -W`)**: 6313, 2418, 3123, 2248, 1368 ms.
  First cycle after a fresh `adb install -r` was substantially slower than the rest (ART
  compilation on first run) — later cycles land inside the 1.6–4.5s range the original report
  measured. **EMULATOR-VERIFIED.**
- **Genuine kill/restart, 5 cycles**: initial attempt used `adb shell kill -9 <pid>`, which
  silently failed (`Operation not permitted` — unrooted emulator shell can't signal another
  app's process) and produced a false `TotalTime: 0` (the "restart" was just `am start`
  refocusing the still-alive task, not a real cold start). Caught by inspecting the anomalous
  0ms figure rather than accepting it. Corrected to `am force-stop` (verified via `pidof`
  returning empty), which **does** kill the process. Real cold restarts: 1392, 1443, 1319, 909,
  920 ms — no crashes, new PID each cycle, no state leaking across restarts (expected, no
  persistence layer exists yet, see Gap 2 above). **EMULATOR-VERIFIED.**
- **Rapid-fire kill/relaunch, 10 cycles, zero cooldown**: survived, final PID present and
  stable, memory did not runaway (51.7 MB PSS after, vs. 55.5 MB baseline at first launch).
  **EMULATOR-VERIFIED.**
- **Network interruption mid-session**: `svc wifi disable` + `svc data disable` while app
  running, tapped a UI element while offline, then re-enabled both (flap). Same PID before and
  after — no crash, no restart triggered by the network transition either direction.
  **EMULATOR-VERIFIED.**
- **Touch adversary — 20x spam-tap** on the "Take the day" button coordinates: no crash, no
  double-submit/day-skip observed (screen still showed Day 1 after the burst, matching
  pre-spam state — screenshot-confirmed via direct inspection, not assumed). Followed by 10x
  rapid swipe and a rotation-lock cycle (portrait → landscape flag → portrait) — same PID
  throughout, no crash. **EMULATOR-VERIFIED.** Note: this is a same-coordinate spam test, not a
  fuzzer — it does not cover arbitrary/adversarial touch sequences across all interactive
  elements, only the single most obvious "impatient tester mashes the button" case.
- **Maestro release-build regression, 3 clean-state runs**: `crisis_day1_flow.yaml`, all 10
  steps COMPLETED on every run, no flakiness observed across 3/3. **EMULATOR-VERIFIED.**

### What this pass did NOT cover (real gaps, still open)

- **Real device.** Unchanged from the original report — this is still the single biggest open
  item and no amount of additional emulator evidence closes it. Emulator CPU is not a low-end
  Android SoC; emulator touch input is synthetic (`adb shell input`), not a real digitizer;
  emulator memory pressure does not model a 1–2GB-RAM device under real OS/background-app
  contention.
- **Multi-element touch fuzzing.** Only one button was spam-tested. No coverage of rapid taps
  across multiple different interactive elements in sequence, or taps during transition
  animations specifically (the report's game-feel/animation gap, still open).
- **True long-duration soak.** All cycles here were tens of iterations over single-digit
  minutes, not a multi-hour soak run. Still open.
- **Persistence-dependent lifecycle behavior.** Since no persistence layer exists, kill/restart
  correctness here only proves "doesn't crash," not "resumes state correctly" — that question
  remains fully open per Gap 2 above.

## Scanner slice addendum (2026-08-12, `scanner-slice` branch off `main`)

Second real stage validated: single hardcoded business, scan → select → commit → persist →
force-stop → relaunch → restore. Full evidence: `rn-slice/SCANNER_SLICE_REPORT.md`.

- **Domain port**: `domain-ts/scanner` ported from prototype (affordable/opening/overBy/
  forcesOf/forcesTotal/pressureWord/commit transition), `tsc --strict` clean, 30-case
  differential sim vs. hand-rederived prototype arithmetic, 0 mismatches.
- **Commit atomicity**: persist-before-render-flip — durable AsyncStorage write completes
  before render state advances to committed; on write failure state stays pre-commit and
  surfaces an error. Design recorded in `DECISIONS.md` → "Scanner commit atomicity."
- **1 MAJOR bug found and fixed this pass**: `commit()`'s re-entrancy guard read React state
  (`committing`) via closure, not a ref — same bug class as Crisis's `pick()` fix (Phase 3).
  Two same-tick `onPress` calls could both pass a stale `committing===false` check. Fixed with
  a synchronous `useRef` guard. Independently reproduced: clean `tsc`, full rebuild, reinstall
  verified via `lastUpdateTime`, baseline re-run clean, THEN the fixed double-tap case re-run
  clean (single commit, correct cash, no double-charge) — pre-fix evidence was not reused.
- **10 numbered adversarial cases** run and classified (APP BUG / ARCHITECTURE PROBLEM /
  TEST-HARNESS FAILURE / EXPECTED-OUT-OF-SCOPE); real double-tap race (case above), corrupt/
  relationally-invalid AsyncStorage payloads (via `adb root` + raw SQLite on `Storage` table,
  correctly rejected), kill-before-select/kill-before-commit/kill-after-commit, 3x restart, all
  clean. Full list and evidence: `SCANNER_SLICE_REPORT.md`.
- **Maestro selector lesson recurred**: full-match not substring-match — same root cause as
  `TEST_HARNESS_INVESTIGATION.md`, fixed the same way (wrap partial text in `.*...*.`).
- **Gap carried forward, not closed**: still emulator-only, no real device. New gap this pass:
  no formal `adversary` subagent review was run against this slice (flagged, not hidden) — see
  `SCANNER_SLICE_REPORT.md` "LIMITATIONS."
- **Scope discipline**: per the approval's Final Stop, this pass did not expand to the full
  Scanner (carousel, multi-business), Plan, or a navigation library. Those remain gated on the
  next explicit user decision — see `MEMORY.md` → "Next Action."

## Evidence index

- Domain layer: `ROADMAP.md` Phase 1 (3 adversary rounds, final verdict SHIP)
- RN shell scaffold: `ROADMAP.md` Phase 2 (bare CLI, New Arch + Hermes defaults confirmed)
- Crisis screen + adversary review + fixes: `ROADMAP.md` Phase 3
- Persistence gap, test-tool research: `ROADMAP.md` Phase 4-5
- Environment gotchas: `ANDROID_SETUP.md` "Bug 3"
- Confirmed-good screenshot: `/c/Android/rn_crisis_screen6.png` (directly inspected, not
  assumed from build/launch status)
