# DECISIONS.md — HUSTLE

Significant decisions, alternatives considered, rationale, evidence, and what would change
them. For the narrative of how each decision came about, see `DEVELOPMENT_JOURNEY.md`. For
current confidence/status, see `MEMORY.md`.

---

## React Native as production platform

**CONTEXT**: HUSTLE committed to being a genuine mobile application (`PRODUCT.md`), not a
website. The technology choice — native / React Native / Flutter / Capacitor / PWA — was open.

**OPTIONS**: Evaluated in `ARCHITECTURE.md` §3-4 against HUSTLE's actual constraints: low-end
Android performance, offline/data model, existing JS domain layer and content, AI-agent
dev-workflow fit, animation-heavy design system (`DESIGN.md`).

**DECISION**: React Native, Hermes engine, New Architecture, Android-first. No iOS commitment
implied.

**WHY**: Best low-end-Android performance profile among app-store-distributable, native-feel
options — beats Flutter on memory/size, beats Capacitor on cold start and on the specific
animation-heavy-content weakness that lines up with HUSTLE's own design system. The domain
logic, content, and design tokens already exist in JS/TS and carry forward with far less
rewrite risk than a Dart or Kotlin port.

**EVIDENCE**: `ARCHITECTURE.md` §3-4 (benchmark comparison, general industry figures — not
HUSTLE-specific measurements, that gap is what the validation slice exists to narrow). Vertical
slice validation: `RN_VALIDATION_REPORT.md`, `DEVELOPMENT_JOURNEY.md` §8-10.

**TRADE-OFFS**: The entire Sunrise visual/game-feel layer (`DESIGN.md`) must be re-authored
against RN's styling/animation primitives — real, bounded work, not automatic. No RN UI-test
workflow existed before this project built one from scratch.

**WHAT WOULD CHANGE OUR MIND**: An iOS requirement appearing (removes RN's Android-specific
justification edge). A from-zero rewrite chosen for unrelated reasons (native Kotlin/Compose is
the theoretical performance ceiling with zero legacy JS investment — see `ARCHITECTURE.md` §10's
own "would you choose this from zero" caveat). Real-device testing (still outstanding)
surfacing a performance or memory-pressure problem the emulator pass couldn't see.

**CURRENT CONFIDENCE**: Medium-High per `ARCHITECTURE.md` §12's own decision gate. Validation
status: **CONDITIONAL GO**, not clean — real low-end device testing is the one still-open
condition `ARCHITECTURE.md` §11 itself named as required.

---

## Vertical-slice-before-migration gate

**CONTEXT**: The React Native decision above carries real risk (a full rewrite of the visual
layer, a new testing workflow) — committing to full migration on benchmark numbers alone would
mean discovering problems only after most of the rewrite cost was already sunk.

**OPTIONS**: Full migration on the strength of the architecture recommendation alone, vs.
building one real vertical slice first to pressure-test the recommendation against actual
content and a real (or emulator) device.

**DECISION**: Build one vertical slice (Crisis stage — animation-dense, good stress test) fully
through RN + Hermes + New Architecture, validate it, and only then decide on full migration.
Binding stop condition: no migration work starts off the validation report without explicit
user sign-off, even if the slice itself works.

**WHY**: Bounds the blast radius of the architecture choice being wrong to one stage's worth of
rework, not the whole app's.

**EVIDENCE**: `ARCHITECTURE.md` §11 (migration strategy sequence). Slice built and validated —
`RN_VALIDATION_REPORT.md`.

**TRADE-OFFS**: Slower path to any real migration progress; the slice's Crisis-only scope means
cross-stage state blending, multi-screen navigation, and persistence remain fully untested even
after a "GO."

**WHAT WOULD CHANGE OUR MIND**: n/a — this is a process decision, not a technical bet; it stays
in force until the user explicitly lifts the stop condition.

**CURRENT CONFIDENCE**: High that this was the right process (the domain-layer extraction alone
caught 4 major self-report-disproving bugs across review rounds — the gate did its job).

---

## Bare RN CLI vs. Expo (validation slice scaffold)

**CONTEXT**: Needed to scaffold the RN validation slice. `ARCHITECTURE.md`'s recommendation is
specifically "RN + Hermes + New Architecture."

**OPTIONS**: Bare RN CLI (`@react-native-community/cli init`) vs. Expo (SDK 50+, which also
supports New Architecture + Hermes by default and would have been faster to bootstrap).

**DECISION**: Bare CLI. **Flagged as a judgment call at the time, not a unilateral decision** —
proceeded because the user was unavailable to confirm and bare CLI is the more literal reading
of the architecture doc's own recommendation.

**WHY**: Bare CLI gives direct, undiluted control over the exact New Architecture/Hermes flags
being validated, with nothing Expo's managed layer could mask or auto-configure differently —
matters specifically because the slice's whole point is testing that recommendation, not
building the fastest possible prototype.

**EVIDENCE**: `rn-slice/android/gradle.properties` confirmed `newArchEnabled=true` and
`hermesEnabled=true` by direct `cat`, not assumed from RN 0.87's stated defaults.

**TRADE-OFFS**: Slower bootstrap; if a real build ever ships with Expo's toolchain, this
validation doesn't directly speak to Expo-specific behavior.

**WHAT WOULD CHANGE OUR MIND**: If the user would rather validate against Expo's toolchain
(closer to what a real build might actually ship with), that's a legitimate override — just say
so; Phase 2 of the RN work would restart on that toolchain.

**CURRENT CONFIDENCE**: Medium — reasonable default given the constraint (user unavailable),
but genuinely still open to being overridden; never converted from "flagged" to "confirmed."

---

## Detox vs. Maestro (RN UI-test tooling)

**CONTEXT**: `ARCHITECTURE.md` §11 sequences UI-test tooling alongside the vertical slice, not
after it. The prototype's existing Playwright harness doesn't transfer — Playwright drives a
DOM, on-device RN has none.

**OPTIONS**:
- **Detox**: gray-box, integrates into the app to detect full idle before acting. Lowest
  flakiness (<2%) for a pure-RN app, heaviest ecosystem adoption (Shopify, Wix). Needs native
  build config changes; has a track record of lagging new RN architecture/Expo SDK releases.
- **Maestro**: black-box, drives via the OS accessibility layer. Zero project/build footprint,
  fastest to set up, lowest flakiness of the two (<1%) per vendor benchmarks, cross-platform
  (iOS/Android/Flutter/web) if HUSTLE ever needs that.

**DECISION**: **OPEN — not picked.** This is a real trade-off (setup speed + flakiness vs.
deeper native integration + ecosystem maturity), left for the user rather than auto-decided.

**RECOMMENDATION IF A NUDGE IS WANTED**: Maestro — this slice's validation goal is
breadth/confidence, not yet a long-lived deep regression suite.

**EVIDENCE**: [Maestro vs Appium vs Detox 2026](https://codersera.com/blog/maestro-vs-appium-vs-detox-2026/),
[Detox vs Maestro flakiness](https://maestro.dev/insights/detox-vs-maestro-reducing-flakiness-react-native).
Note: Maestro was in fact used for the adversarial validation pass in
`RN_VALIDATION_REPORT.md` — a working default, not a final pick.

**WHAT WOULD CHANGE OUR MIND**: n/a, no decision made yet to change.

**CURRENT CONFIDENCE**: n/a — open decision.

---

## Canonical path migration (Windows)

**CONTEXT**: HUSTLE's original path was nested under `Documents\...`. RN Android builds
generate deep intermediate paths (Gradle/CMake/Ninja native codegen) that, combined with the
long prefix, exceeded Windows' 260-character `MAX_PATH` limit.

**OPTIONS**: Shorten specific build output paths vs. move the whole project root.

**DECISION**: Canonical root for any Claude Code project on this Windows machine is now
`C:\claude-projects\<project>\`. Old copies preserved as rollback/reference, not deleted.

**WHY**: A shallow root avoids the limit regardless of how deep build tooling nests its own
paths — fixing individual paths would just relocate the failure point to the next deep build.

**EVIDENCE**: Actual `ninja: error: Stat(...): Filename longer than 260 characters` failures
under the old path, documented in `ANDROID_SETUP.md`.

**TRADE-OFFS**: Two now-stale copies of the project exist on disk (`Documents\claude-projects\`,
`C:\hustle-rn\`) until an explicit cleanup pass is requested.

**WHAT WOULD CHANGE OUR MIND**: n/a — this is a fixed environment constraint on this machine,
not a preference.

**CURRENT CONFIDENCE**: High — directly confirmed by reproducing and then eliminating the
failure.

---

## Consumer-app reframe

**CONTEXT**: `PRODUCT.md` was originally written around a classroom/facilitator/NQF-SAQA
learnership audience, audited from the deployed bundle.

**OPTIONS**: Keep the classroom-tool framing as the product's actual boundary, vs. reframe the
product as a standalone consumer app while keeping the classroom content framing intact.

**DECISION**: Reframed as a consumer app. The classroom/NQF-SAQA audience description in
`PRODUCT.md` stays real and binding for *content* — that's genuinely who the curriculum is
written for — but no longer defines the *product's* boundaries.

**WHY**: The idea owner's actual intent, surfaced mid-roadmap-work, was a standalone consumer
product, not a facilitator-only tool.

**EVIDENCE**: `ROADMAP.md` Phase 4 preamble, "Correction, 2026-08-05." See `BRAINSTORM_LOG.md`
for the fuller pivot record.

**TRADE-OFFS**: Opens real unresolved questions — facilitator-side needs (cohort reporting,
shared-device reset) are still `[assumed]` and unresolved per `PRODUCT.md`, monetization model
is undecided, outcome-validation approach (e.g. ESSA-style efficacy measurement) is open.

**WHAT WOULD CHANGE OUR MIND**: n/a — already the current framing; would only reopen if the
idea owner's intent changes again.

**CURRENT CONFIDENCE**: High that this is the current intent (directly stated correction, not
inferred). Low-to-medium confidence on the downstream unresolved questions this reframe opened.

---

## RN Crisis slice: adversary-driven persistence fix pass (2026-08-12)

**CONTEXT**: An independent adversary review of `rn-slice/App.tsx`'s AsyncStorage
persistence layer found 3 CRITICAL and 4 MAJOR defects (dead-render `lastResult` bug,
per-instance write queue not surviving remount, silent destruction of corrupt saves with
no backup, no `getItem` timeout, weak validation, save-failure note auto-cleared, and
related pure-render violations). Full findings and disposition:
`rn-slice/PERSISTENCE_VALIDATION_REPORT.md`.

**DECISION**: Fixed all 3 CRITICALs and the addressable MAJORs in place; did not attempt
a save-retry mechanism or pursue a fully automated Maestro regression gate for the
restore/corruption path in this pass.

**WHY**: The 3 CRITICALs were correctness-breaking and cheap to fix in isolation (ref +
post-commit effect pattern for both `lastResult` and `setEnded`, module-scope write queue,
backup-before-overwrite). Save-retry is a larger design question (bounded retry policy,
backoff, user-facing recovery UX) that deserves its own decision, not a bolt-on inside an
adversary-response pass.

**EVIDENCE**: Independent jest + react-test-renderer reproduction (own mocks, not reused
from the adversary's scratch tests) confirmed all 3 CRITICAL fixes hold. Emulator retest
on `hustle_lowend` (EMULATOR-VERIFIED): baseline flow unregressed; new adversarial flow
authored but assertion-timing-flaky (Maestro issue, not app issue — confirmed via direct
screenshot/adb-screencap inspection showing correct app state at every reported
"failure," including one live capture of the `getItem`-failure fallback path working
correctly on a real intermittent failure). Full detail:
`rn-slice/PERSISTENCE_VALIDATION_REPORT.md`.

**TRADE-OFFS**: Persistence is meaningfully more correct than before this pass, but is
explicitly **not** validated as production-ready: no save-retry, no automated regression
gate for the restore path, no torn-write/storage-full/concurrent-instance testing, no real
device. Do not let "adversary findings fixed" be read as "persistence is done."

**WHAT WOULD CHANGE OUR MIND**: A real device becoming available and surfacing behavior
the emulator can't (this is the standing gap across the whole RN validation workstream,
not specific to this pass). A decision to invest in save-retry UX. A fix for the Maestro
assertion flakiness that makes the adversarial flow trustworthy as a CI gate.

**CURRENT CONFIDENCE**: High that the fixed defects are genuinely fixed (independently
reproduced, not just trusting the original adversary's own tests). Low confidence on
anything not explicitly tested — see the report's "Not tested" section.

---

## Navigation approach: raw root state vs. react-navigation

**CONTEXT**: The RN validation workstream flagged multi-screen navigation as untested
(Crisis slice is single-screen). Before scoping a Scanner slice (multi-screen), needed to
know whether raw `useState`-based screen switching is sufficient or whether
`react-navigation` is required.

**OPTIONS**: Adopt `react-navigation` up front (native back-stack, gestures, deep linking,
larger dependency/API surface) vs. a navigation-only spike testing raw root `useState`
against the existing AsyncStorage persistence pattern first.

**DECISION**: Raw root `useState` state navigation is **sufficient for the current
validated scope** (shared state, back-nav, remount, rapid interaction, kill/relaunch, all
combined with the existing write-queue persistence pattern). `react-navigation` remains
**deferred, not rejected**.

**WHY**: The spike (`rn-slice/NAVIGATION_SPIKE_REPORT.md`, `nav-spike` branch) found zero
app bugs and zero architecture problems across baseline + adversarial Maestro runs, with a
negative control confirming the harness isn't vacuously passing. No concrete requirement
raw navigation can't satisfy has surfaced yet.

**EVIDENCE**: `rn-slice/NAVIGATION_SPIKE_REPORT.md` — 2 baseline runs + 1 adversarial run,
all COMPLETED exit 0; negative control FAILED exit 1 as required; restored-state screenshot
independently inspected.

**WHAT WOULD CHANGE OUR MIND**: A real requirement emerges for native back-stack/gesture
semantics, deep linking, or materially more complex navigation than the current linear
stage flow. Revisit only then — not speculatively.

**CURRENT CONFIDENCE**: Medium — small sample (2+1 runs, same caveat as the persistence
investigation about ruling out low-frequency flakes), emulator-only, untested beyond 2
screens or with real back-stack semantics. Sufficient to unblock Scanner scoping, not a
closed question forever.

---

## Scanner commit atomicity

**CONTEXT**: The Scanner slice's Commit action is destructive and one-way (spends capital,
locks in a business) — unlike Crisis's per-turn state, which the Crisis slice's
fire-and-forget autosave effect (persist after every state change, best-effort) was
adequate for. The Scanner approval explicitly required resolving "does the UI ever treat
a commit as successful while durable state still describes the pre-commit state?" before
building, not after.

**OPTIONS**: Reuse Crisis's fire-and-forget autosave for Commit too (simplest, but the
render state could flip to "committed" before the write actually lands) vs. a stricter
ordering that guarantees durable state always leads or matches render state for this one
transition, without introducing a new transaction/state-management system.

**DECISION**: Treat Commit as one atomic sequence: (1) validate selection + affordability
via the pure `commitSpot` domain function, (2) compute the complete post-commit state,
(3) persist that exact JSON via `await` (through the same module-scope write queue Crisis
uses), (4) only on persist success, `setState` flips the UI into the committed render.
On persist failure: render state stays pre-commit (recoverable), the failure is surfaced
via a visible error, nothing partially applies. Everything else (scan, select) keeps
Crisis's original fire-and-forget pattern — only the destructive transition gets the
stricter ordering.

**WHY**: The invariant the approval named — "a committed business must never be
navigated/treated as committed by the UI while durable state still describes the
pre-commit state" — is satisfied by ordering alone, using the persistence mechanism
that already exists. No new mechanism was needed, matching the approval's own "use the
smallest mechanism consistent with the existing persistence architecture" instruction.

**EVIDENCE**: `rn-slice/SCANNER_SLICE_REPORT.md` adversarial case 6 — killing the app
immediately after the Commit tap, with no artificial delay, restored to the fully
committed state with no corruption, across the runs tested.

**TRADE-OFFS**: Commit has a small perceptible delay (the `await` on persistence) versus
Crisis's instant-feeling fire-and-forget updates — an intentional trade for correctness
on a one-way spend, not applied everywhere. Does not prove immunity to a kill landing
mid-`AsyncStorage.setItem` flush (a torn write) — black-box `adb`/`am force-stop` timing
cannot inject a kill at that exact instruction boundary; same standing gap
`PERSISTENCE_VALIDATION_REPORT.md` already carries for Crisis, not newly introduced here.

**WHAT WOULD CHANGE OUR MIND**: A real device or a longer/larger-scale adversarial run
surfacing an actual torn-write corruption under this pattern. A future stage needing
multiple destructive transitions in sequence, where this per-action ordering trick stops
being proportionate and a real transaction/outbox pattern would be justified instead.

**CURRENT CONFIDENCE**: Medium-High that the ordering is correct as designed and that the
one bug this pass found (the double-tap stale-closure race, a separate concern from
commit-vs-persist ordering) is genuinely fixed — independently rebuilt and re-verified,
not just trusting the first fix. Lower confidence on real-device and mid-flush-kill
behavior, both untested for the same reasons the rest of this project's persistence work
carries that gap.
