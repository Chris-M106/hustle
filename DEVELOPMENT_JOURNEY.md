# DEVELOPMENT_JOURNEY.md — HUSTLE

How HUSTLE evolved and how we reached the current architecture. Milestones only — not a daily
log. Each entry: PROBLEM → INVESTIGATION → DECISION → IMPLEMENTATION → EVIDENCE → LESSON.
Rationale for each decision lives in `DECISIONS.md`; this file is the narrative thread that
connects them. Dates as recorded in existing docs — treat unlabeled dates as
**[Guessing]** if not explicitly stated in source material.

## 1. Deployed-bundle audit (2026-08-01)

**PROBLEM**: No source repo existed for HUSTLE yet — only a deployed build at
`hustle-simulation.netlify.app`.
**INVESTIGATION**: Audited the live app's copy, DOM, and shipped JS bundle directly (no source
access).
**DECISION**: Documented findings as `PRODUCT.md`, explicitly marking unverifiable items
`[assumed]`.
**EVIDENCE**: `PRODUCT.md` header states its own method and limitation.
**LESSON**: Starting from live-artifact inspection rather than guessing from the product pitch
kept early assumptions honest and auditable.

## 2. Prototype critique and mechanical-inertness finding (2026-08-04 to 2026-08-05)

**PROBLEM**: A hard `/impeccable critique` on `prototype/hustle-shell.html` scored 31/40. Root
finding: the prototype **looks authored but plays mechanically inert** — Stage 1 stat/archetype
choices didn't branch anything, and Crisis/Plan scoring was invisible until the very end.
**INVESTIGATION**: Critique pass plus a research pass into comparable games/apps (`research/`).
**DECISION**: Created `ROADMAP.md` as a living plan rather than continuing ad hoc, ordered
around fixing the mechanical-inertness gap first (Phase 1) before any engagement-layer work.
**IMPLEMENTATION**: Phase 1 (make choices matter) and Phase 2.5 (the game layer) both shipped
2026-08-05.
**EVIDENCE**: `ROADMAP.md` Phase 1 / Phase 2.5 sections, marked done same day.
**LESSON**: A surface-level "it looks finished" pass missed that the mechanics didn't actually
connect — visual polish and mechanical substance were validated separately, not assumed to
track together.

## 3. Consumer-app reframe (2026-08-05)

**PROBLEM**: `PRODUCT.md` had been written around a classroom/facilitator/NQF-SAQA learnership
audience. The actual product intent turned out to be broader.
**INVESTIGATION**: Correction surfaced mid-roadmap work, recorded directly in `ROADMAP.md`
Phase 4 rather than silently overwriting the prior framing.
**DECISION**: Product reframed as a standalone consumer app; classroom/facilitator content and
audience framing in `PRODUCT.md` stays real (it's who the *content* is written for) but no
longer defines the *product's* boundaries.
**EVIDENCE**: `ROADMAP.md` Phase 4 preamble, explicitly marked "Correction, 2026-08-05."
**LESSON**: See `BRAINSTORM_LOG.md` for the full pivot record — this is the kind of direction
change that belongs there, not just in a roadmap footnote.

## 4. Mobile-platform commitment and testing standard (2026-08-08)

**PROBLEM**: `prototype/hustle-shell.html` being a browser build was implicitly read by some
work as the product's platform commitment. It wasn't decided.
**INVESTIGATION**: Reviewed what "mobile application" actually requires vs. what a responsive
website gives you, against the low-end-Android/prepaid-data audience already documented.
**DECISION**: `PRODUCT.md` amended: HUSTLE is a genuine mobile application, quality bar is
app-native. The prototype is explicitly named as the *implementation stage*, not the platform
decision. Every prototype change from this point forward must be verified through the rendered
app, not source inspection alone (`TESTING.md`).
**EVIDENCE**: `PRODUCT.md` → "Product target vs. current implementation," `ROADMAP.md` →
"Product and testing standard."
**LESSON**: Making an implicit assumption explicit and authoritative early avoided later work
building against the wrong platform mental model.

## 5. Architecture investigation and React Native recommendation (2026-08-08 to 2026-08-11)

**PROBLEM**: Mobile platform was committed to in principle; which technology (native / RN /
Flutter / Capacitor / PWA) was still fully open.
**INVESTIGATION**: `ARCHITECTURE.md` evaluated options against HUSTLE's actual constraints
(low-end Android performance, offline/data model, state/domain architecture, AI-agent dev-fit,
scope discipline) — not generic framework popularity.
**DECISION**: React Native (Hermes, New Architecture), Android-first. Full rationale in
`DECISIONS.md` → "React Native as production platform." Explicitly gated on a real-device-
validated vertical slice before any full migration (§11).
**EVIDENCE**: `ARCHITECTURE.md` §10–12.
**LESSON**: The recommendation was framed as conditioned on HUSTLE's actual current state (an
existing JS domain layer and content set), not as an abstractly "best" choice — see §10's own
"would you choose this from zero" caveat. Worth re-opening only if that state changes.

## 6. Android QA environment build (2026-08-11)

**PROBLEM**: No Android SDK/emulator environment existed on this dev machine to validate
anything RN-related.
**INVESTIGATION**: Root-caused a multi-session license-acceptance failure that had looked like
a rate limit — it was actually `cmd.exe /c "sdkmanager.bat ..."` silently producing zero effect
on this machine, every time. Also found `sdkmanager.bat --sdk_root=` doesn't respect the given
path and compounds a literal `Android` prefix on every invocation.
**DECISION**: Call `.bat` files directly from bash (no `cmd.exe /c` wrapper); never use
`--sdk_root=`, use `ANDROID_SDK_ROOT`/`ANDROID_HOME` env vars instead. Consolidated all real
packages into one canonical root, `C:\Android\FinalSdk`.
**IMPLEMENTATION**: `hustle_lowend` AVD created (android-33, google_apis, x86_64, pixel
profile), headless boot confirmed, screenshot captured and visually inspected.
**EVIDENCE**: Every binary/package presence verified via `ls`/`find` after each step, not
trusted on `sdkmanager`'s own `--list_installed` claim (which once claimed installed when files
genuinely weren't there). Full detail: `ANDROID_SETUP.md`.
**LESSON**: Two independent silent-failure bugs in the same tool (`cmd.exe` wrapper, `--sdk_root`
arg) were both found by re-verifying on disk rather than trusting tool output — this pattern
repeats through the whole RN workstream (see lesson 8 below). `LIBRARIAN CANDIDATE`: never
trust a wrapped batch-file invocation's silence as success; call it directly and check exit
output.

## 7. Canonical project path migration (2026-08-11)

**PROBLEM**: The project's original path was nested under `Documents\...`, which combined with
RN/Gradle/CMake's deep generated build paths, exceeded Windows' 260-character `MAX_PATH` limit.
**INVESTIGATION**: Confirmed via actual `ninja: error: Stat(...): Filename longer than 260
characters` failures, not anticipated in advance.
**DECISION**: Canonical path for any Claude Code project on this Windows machine is now
`C:\claude-projects\<project>\`, shallow by design. Old paths (`Documents\claude-projects\`,
`C:\hustle-rn\`) preserved as rollback/reference, not deleted.
**EVIDENCE**: `ANDROID_SETUP.md` → "Canonical project path (Windows)."
**LESSON**: This is a standing environment constraint for any future native-build project on
this machine, not a one-off HUSTLE fix. `LIBRARIAN CANDIDATE`.

## 8. RN architecture validation: domain layer, 3 adversary rounds (2026-08-11)

**PROBLEM**: Prove/disprove the RN recommendation against real Crisis-stage content, starting
with a framework-agnostic TypeScript port of the Crisis arithmetic.
**INVESTIGATION**: First extraction attempt died silently (no output files) — caught, retried.
Second attempt produced real files; the extracting agent self-reported a clean 1:1 port.
**DECISION / EVIDENCE**: Independent adversary review (round 1) disproved both of the
self-report's claims — found 4 CONFIRMED MAJOR bugs (`hasDecision` required-but-180/225-events-
omit-it; dropped `lastDelta`/`lastOutcome` on persisted state; dropped `ended` flag; threw
instead of no-op on double-resolve) plus 3 minor. Fixes applied; adversary round 2 confirmed 6
of 7 fixes correct but found the `momentumFrac` fix itself was wrong (fired on 100% of runs at
the day-2 screen). Fixed again; adversary round 3: **VERDICT SHIP**, zero critical/major, 225-
point differential sim confirmed 0 divergences.
**LESSON**: "Fixed" was wrong twice in the same workstream before it was actually right. Don't
trust a single review pass or a self-applied fix without independent re-verification — this is
now a standing rule in `CLAUDE.md`.

## 9. RN Crisis screen build and environment gotchas (2026-08-11 to 2026-08-12)

**PROBLEM**: Build an actual RN screen against the cleared domain layer and get it running on
the emulator.
**INVESTIGATION**: Scaffolded via bare RN CLI (not Expo) — a flagged judgment call, not a
unilateral pick (see `DECISIONS.md` → "Bare CLI vs. Expo"). Hit five distinct environment
gotchas before a single screen could be verified: `gradlew.bat` must be invoked directly, `adb`
not on PATH by default, first cold build 44 minutes, an 18-25s first-launch timing trap that
looks identical to a crash, and Gradle 9.4.1's diagnostics writer producing a false-negative
`BUILD FAILED` after a real successful install.
**DECISION**: Build `App.tsx` against the domain-ts layer; adversary review found 2 MAJOR
(deprecated `SafeAreaView` import; stale-closure race in `pick()`) and 5 MINOR, all fixed and
re-verified.
**EVIDENCE**: Screenshot `/c/Android/rn_crisis_screen6.png` directly inspected, showing both
fixes live (comma-formatted cash, empty day-1 meter).
**LESSON**: A screenshot taken during the first-launch window is indistinguishable from a
crash — verify via logcat's "Displayed" timestamp, not a screenshot's mere existence. All five
gotchas are generic RN/Android-toolchain friction, not HUSTLE-specific — `LIBRARIAN CANDIDATE`.

## 10. RN architecture validation: verdict and two adversarial emulator passes (2026-08-12)

**PROBLEM**: Close out the validation workstream with an honest verdict, including the fact
that no physical Android device was ever available.
**DECISION**: `RN_VALIDATION_REPORT.md` verdict: **CONDITIONAL GO** — not clean, specifically
because real low-end device validation (the one condition `ARCHITECTURE.md` §11 itself named
as required) couldn't be run. Binding stop condition set: no migration work starts off this
report without the user's explicit go-ahead.
**IMPLEMENTATION**: A second adversarial emulator pass added more evidence without touching the
gate — cold-start cycles, genuine kill/restart (see lesson below), rapid kill/relaunch, network
interruption, spam-tap/swipe/rotation stress, 3x Maestro regression, all against the release
APK on `hustle_lowend`.
**EVIDENCE**: Every result screenshot- or command-output-verified directly, each explicitly
labeled EMULATOR-VERIFIED (never claimed equivalent to real-device evidence). Full detail:
`RN_VALIDATION_REPORT.md` → "Adversarial emulator validation pass 2."
**LESSON**: Mid-pass, `adb shell kill -9 <pid>` was found to silently fail on an unrooted
emulator (`Operation not permitted`) and produce a false `TotalTime: 0` reading that looked
like a successful instant restart — caught by treating an anomalous number as a signal to
re-check the method, not by assuming the tool. Corrected to `am force-stop`, verified via
`pidof`. `LIBRARIAN CANDIDATE`: an anomalously "too good" measurement is itself evidence of a
broken measurement method, not a result to report at face value.

## 11. Institutional-memory documentation pass (2026-08-12)

**PROBLEM**: Project knowledge was accumulating inside `ROADMAP.md`'s history section and
individual reports, with no fast-recovery layer for a new session.
**DECISION**: Established the documentation architecture in `CLAUDE.md`, created `MEMORY.md`,
`DEVELOPMENT_JOURNEY.md` (this file), `DECISIONS.md`, `BRAINSTORM_LOG.md`,
`LESSONS_LEARNED.md` — reusing and cross-referencing existing docs rather than duplicating them.
**EVIDENCE**: This pass. No application code, architecture, or feature work touched.
**LESSON**: n/a yet — this entry exists so the *next* session can see documentation-system
work as its own milestone, not invisible scaffolding.
