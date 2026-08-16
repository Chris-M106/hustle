# MEMORY.md — HUSTLE fast recovery

> Read this first. Not a history — that's `DEVELOPMENT_JOURNEY.md`. This is "where are we
> right now," kept short enough to read in one pass. Update at the end of any substantial task
> that changes current state (see `CLAUDE.md` → "Memory update rule").

## Current State

HUSTLE is a 14-day financial-literacy simulation game (Profile → Scanner → Plan → Crisis →
Ending), currently existing as **two parallel builds**:

1. `prototype/hustle-shell.html` — single-file vanilla-JS browser prototype, all 4 stages
   complete, Sunrise visual system applied (`DESIGN.md`). This is the **canonical
   design/content source** — still actively maintained, not frozen.
2. `rn-slice/` — React Native (Hermes, New Architecture) vertical slice, built to validate the
   RN architecture recommendation, not a migration in progress. `App.tsx` is now the **Scanner**
   slice (`ScannerSlice`, `STORAGE_KEY = 'hustle.scanner.v1'`), not the earlier Crisis screen.
   Crisis exists only as a persistence writer/reader (`src/persistence/crisisWriter.ts`) plus an
   experimental runtime bridge inside `App.tsx` — there is **no Crisis screen and no Plan stage
   in RN**. Current domain logic lives in `rn-slice/src/domain/`; the root `domain-ts/` is an
   earlier historical port kept for reference, not the current source.

**Architecture baseline**: `rn-slice/HUSTLE_ARCHITECTURE_CURRENT_STATE.md` is the authoritative
current-state description of the RN slice (ownership, persistence contract, what is implemented
versus future). Read it before making any RN architectural claim.

No migration of the full app has started. That is a deliberate, binding stop condition, not an
oversight — see `DECISIONS.md` → "React Native as production platform."

## Current Architecture

**Decision made**: React Native + Hermes + New Architecture, Android-first (`ARCHITECTURE.md`
§10). **Status: CONDITIONAL GO**, not a clean GO — see `RN_VALIDATION_REPORT.md`. Full detail:
`DECISIONS.md` → "React Native as production platform."

## Canonical Paths

- Project root: `C:\claude-projects\hustle\` (not `Documents\...` — Windows `MAX_PATH` limit
  breaks RN/Gradle/CMake builds under a deep path; see `ANDROID_SETUP.md` → "Canonical project
  path").
- Android SDK root: `C:\Android\FinalSdk` (always via `ANDROID_SDK_ROOT`/`ANDROID_HOME` env
  vars, never `--sdk_root=`; see `ANDROID_SETUP.md`).
- Old copies (`C:\Users\Christofer\Documents\claude-projects\`, `C:\hustle-rn\`) still exist as
  **rollback/reference only** — do not delete, do not treat as active.

## Current Validation State

- **Domain layer** (`domain-ts/crisis`): adversary-cleared over 3 rounds, `tsc --strict`
  clean, 1000-run differential sim vs. prototype found 0 arithmetic mismatches. High
  confidence.
- **RN Crisis screen**: historical. The Crisis screen that once lived in `rn-slice/App.tsx` was
  adversary-cleared (all 7 confirmed issues fixed, screenshot-verified on emulator), but that
  component is no longer what `App.tsx` contains. There is currently no Crisis screen in RN, and
  no Crisis resume API — `launchCrisis` is create-only and overwrites unconditionally.
- **RN Scanner slice** (`rn-slice/App.tsx`, current): scan → select → commit → persist →
  force-stop → relaunch → restore, EMULATOR-VERIFIED, adversary round 2 applied. Details below
  under "Next Action" and in `rn-slice/SCANNER_SLICE_REPORT.md`.
- **Recommit invalidation**: NOT runtime-integrated. `commitSpot()` computes a `resetDownstream`
  flag (`src/domain/scanner/logic.ts:118`) and returns it; `App.tsx`'s `commit()` discards it.
  `invalidateDownstreamOnRecommit` has zero production callers — it is exercised by tests only.
  Test coverage is not runtime integration.
- **RN architecture end-to-end**: CONDITIONAL GO. Two adversarial emulator passes done on
  `hustle_lowend` (release APK): cold start, genuine kill/restart, rapid kill/relaunch, network
  interruption, spam-tap/swipe/rotation stress, 3x Maestro regression — all clean, all
  EMULATOR-VERIFIED. **Zero REAL-DEVICE-UNVERIFIED items have been closed** — this remains the
  single biggest open gap. Full detail: `RN_VALIDATION_REPORT.md`.
- **Persistence**: AsyncStorage-backed persistence exists in `rn-slice/App.tsx`
  (restore, save-queue, corruption handling). Note that
  `rn-slice/PERSISTENCE_VALIDATION_REPORT.md` documents the *Crisis-era* `App.tsx` — the
  mechanism it validated (module-scope write queue, timeout, corrupt-backup) survives in
  today's Scanner `App.tsx` and in `src/persistence/queuedWrite.ts`, but its file/key
  references are historical. An independent adversary review found 3
  CRITICAL + 4 MAJOR defects; all CRITICALs and most MAJORs are fixed and independently
  re-verified (jest + real component, EMULATOR-VERIFIED screenshot inspection). **Not**
  validated: save-retry logic still missing, no torn-write/storage-full/concurrent-instance
  testing, no real device. Full detail: `rn-slice/PERSISTENCE_VALIDATION_REPORT.md`.
- **Step 14A Crisis bridge** (`App.tsx`, `testID="crisisBridgeBtn"`): experimental validation
  instrumentation, not product architecture and not Crisis UX. It calls
  `launchCrisis`/`readCrisis` once per tap so the Crisis persistence path can be exercised
  through the real app lifecycle. It is ungated and user-reachable one tap after commit —
  deliberate, because it is the only execution path behind every EMULATOR-VERIFIED Crisis
  persistence result and no physical device exists. It proves nothing about recommit
  integration. Binding removal trigger and full classification:
  `rn-slice/HUSTLE_ARCHITECTURE_CURRENT_STATE.md` §8 category B-1.
- **Maestro test harness**: the persistence flow's prior FAILED-but-actually-correct results
  were root-caused, not just worked around — two test-authoring bugs (a `notVisible`-as-
  mount-gate that passes vacuously before the JS bundle renders anything, and bare-prefix text
  selectors that Maestro full-match rather than substring-match). Both fixed in
  `crisis_persistence_adversarial.yaml`; 3 consecutive clean full-flow reruns
  (fresh launch → resolve → advance → genuine `stopApp` kill → relaunch → restore confirmed),
  plus a control case proving the harness still correctly reports FAILED on a genuinely false
  assertion. Full detail: `rn-slice/.maestro/TEST_HARNESS_INVESTIGATION.md`. **Conditional
  yes** on Maestro as an autonomous gate — for flows following the two disciplines above; not
  yet proven at CI scale or beyond a 3-run sample.
- **Playwright harness** (prototype-side): 9/9 passing but flagged as a **false-positive
  generator** — assertions aren't HUSTLE-specific, passed against a 45-byte stub page too.
  Treat "9/9 passing" as "page loads," not "HUSTLE works." See `TESTING.md`.

## Known Constraints

- Primary audience: low-end Android, prepaid/limited data, possibly a shared device
  (`PRODUCT.md` → "Who it is for" / "Constraints that actually bind").
- HUSTLE is a mobile application, not a website — quality bar is app-native, not
  responsive-web (`PRODUCT.md` → "Product target vs. current implementation").
- Windows dev machine: RN/Gradle builds require the shallow `C:\claude-projects\` path (above)
  and several environment gotchas budgeted in `ANDROID_SETUP.md` (JAVA_HOME, adb PATH, first-
  build time, launch-timing trap, Gradle diagnostics false-negative).

## Known Unknowns

- Real low-end Android device behavior — thermal throttling, real touch latency, real memory
  pressure under OS contention. No physical device available; emulator cannot substitute.
- Detox vs. Maestro — open decision, not picked (`ARCHITECTURE.md` §11 Phase 5). Maestro
  recommended if a nudge is wanted, but not chosen unilaterally.
- Cross-stage state blending (`finish()` logic: Plan + cash into Crisis) — deferred, not
  ported, not designed for RN.
- ~~Multi-screen navigation~~ — **DE-RISKED 2026-08-12**, raw root `useState` navigation-only
  spike (`nav-spike` branch, `rn-slice/NAVIGATION_SPIKE_REPORT.md`): PASS, zero app/architecture
  bugs. Shared state, back-nav, kill/relaunch, rapid nav all correct against the existing
  AsyncStorage write-queue pattern. `react-navigation` deferred, not rejected — see
  `DECISIONS.md`. Spike NOT migrated. (Branch note: the `main`/`nav-spike`/`scanner-slice`
  branches referenced here belong to the pre-consolidation RN repository, now reachable only via
  the `rn-rewrite-src` remote. This repository's working branch is `master`.)
- Reanimated/Skia game-feel layer — untouched, still a real unknown for the next slice.
- Monetization model — deliberately deferred, framed but not decided (`ROADMAP.md` Phase 4).

## Current Objective

Architecture freeze / public-baseline closure — documentation accuracy only. No code, no
migration, no new feature work. The freeze commit `6b00674` is local and unpushed; deciding
whether it becomes the public authoritative state is the open question. Review:
`rn-slice/HUSTLE_ARCHITECTURE_PUBLIC_BASELINE_REVIEW.md`.

## Write-Queue Coexistence Experiment (2026-08-12/13)

Narrower follow-on to the Scanner slice, per `rn-slice/NEXT_EXPERIMENT_SCANNER_PLAN_CRISIS.md`'s
own smaller-experiment recommendation: does the existing module-scope `writeQueue` in `App.tsx`
safely serialize interleaved writes from multiple slices sharing one AsyncStorage instance?
Answered via throwaway Jest harness against the REAL mechanism (`queuedWrite`/`withTimeout`
extracted verbatim to `src/persistence/queuedWrite.ts`, no logic change) — SLICE_A/SLICE_B
simulated real slice shapes, interleaving permutations, forced-failure adversarial case, 3
negative controls. Per the subagent's own report: 52/52 tests passing (run twice), no cross-key
corruption, per-write failure isolation, queue doesn't wedge after a failure — not independently
re-inspected by the coordinator this pass. Corroborates the existing architecture decision, no
change to it; not a Librarian candidate per the subagent's own assessment.

Since committed: `App.tsx`, `src/persistence/queuedWrite.ts`, and
`__tests__/persistence.coexistence.test.ts` are all in the repository. Still uncommitted at the
time of writing: `prototype/hustle-shell.html` (unrelated causal-feedback pilot) and the
untracked root `domain-ts/` — both deliberately excluded from the architecture baseline.

Domain questions this experiment deliberately documented but did NOT resolve: business-identity
contract (shared constant module vs. duplicated per-slice), persistence-hop failure semantics,
destructive-reset scope across keys — still open, see `NEXT_EXPERIMENT_SCANNER_PLAN_CRISIS.md`.

## Next Action

Navigation unknown de-risked 2026-08-12. **Scanner slice — DONE, checkpointed and independently
adversary-reviewed, 2026-08-12**, on branch `scanner-slice` (off `main`, not `nav-spike`,
commits `adaea51` then `6e1a9bb`): one hardcoded business, scan → select → commit → persist →
force-stop → relaunch → restore, all EMULATOR-VERIFIED. A formal independent `adversary` pass
(round 2, the gap flagged after round 1) found 1 CRITICAL (a restore failure/timeout could
silently overwrite a real saved run — no backup taken) + 5 MAJOR defects (cross-committed
select() allowed corrupting state; validator accepted an array `scanned`, a `committedTo`
without `setupCost`, and unreconciled cash/setupCost; `commitSpot` lacked a domain-level
recommit guard; `resetDownstream` was computed and never consumed, report overclaimed it;
the original jest smoke test never actually mounted the screen). All fixed, independently
reproduced (new regression test file, 6/6 passing; array-`scanned` gap re-verified on-device
via `adb root` + SQLite injection against a rebuilt APK), and the 3 affected Maestro flows
re-run clean. Full evidence: `rn-slice/SCANNER_SLICE_REPORT.md` → "ADVERSARY ROUND 2". Per the
approval's own stop condition, **not expanded further** — no full Scanner, no Plan, no carousel,
no navigation library added this pass. Still user-gated, unchanged:
1. Get real low-end Android device access and re-run the RN validation slice on it, or
2. Decide Detox vs. Maestro, or
3. Approve the next architectural experiment (scope growth toward the full Scanner/Plan, or a
   real-device pass).

Remaining known gaps on the Scanner slice specifically (not blocking, but real): round-1
adversarial Maestro flows (kill/corruption cases, repeat scan/select) were not re-run against
the round-2 fixes since their code paths didn't change; the CRITICAL restore-failure fix was
verified via jest (mocked AsyncStorage), not as a genuine on-device native-call failure.

If none of these have been decided when a new session picks this up: **ask**, don't assume.

## Important Decisions

- Scanner slice commit atomicity: persist-before-render-flip (`DECISIONS.md` → "Scanner commit
  atomicity"); the RN architecture supports a second real stage's own persistence + a durable
  destructive transition without a new state library — `rn-slice/SCANNER_SLICE_REPORT.md`.
- React Native (Hermes, New Architecture), Android-first — `DECISIONS.md` → "React Native as
  production platform"; full rationale `ARCHITECTURE.md` §10.
- Bare RN CLI over Expo for the validation slice — `DECISIONS.md` → "Bare CLI vs. Expo."
- Sunrise visual system — `DESIGN.md`, committed and documented.
- Canonical Windows project path moved to `C:\claude-projects\` — `DECISIONS.md` → "Canonical
  path migration."
- Product reframed from classroom/facilitator tool to consumer app — `DECISIONS.md` →
  "Consumer-app reframe," `BRAINSTORM_LOG.md`.

## Project Documentation Map

See `CLAUDE.md` → "Documentation map" for the full index.
