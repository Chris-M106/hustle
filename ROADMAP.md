# ROADMAP: HUSTLE

> Living document. Started 2026-08-05, after a hard `/impeccable critique` on the prototype
> (score 31/40 — see `.impeccable/critique/2026-08-05T11-29-31Z__prototype-hustle-shell-html.md`)
> and a research pass into comparable games/apps (see `research/`). This is the point where
> there's enough surface area — critique fixes plus a real wishlist of new mechanics — that
> working without a plan would mean picking things in whatever order they got mentioned in
> chat. Update this file as phases complete or priorities change; don't let it go stale.

## Product and testing standard (added 2026-08-08)

**HUSTLE is a mobile application**, not a website — see `PRODUCT.md` → "Product target vs.
current implementation." Everything below that still says "prototype" or "the browser build" is
describing today's implementation stage, not the product's platform commitment; the final
mobile technology (native / React Native / Flutter / Capacitor / PWA) is an open Phase 4
decision, not something to infer from what the prototype happens to be built in.

**Every change to `prototype/hustle-shell.html` must be verified through the actual rendered
application, not source-code inspection alone** — see `TESTING.md` for the full standard
(Playwright/browser automation workflow, first-time-player probing, mobile interaction and
network testing, the real-device validation hierarchy). This isn't new practice — Phase 1, 2.5,
and the Sunrise `DESIGN.md` passes were already done this way — but it's now written down as a
required practice rather than an implied one.

## Where this stands right now

- `prototype/hustle-shell.html` — single-file vanilla-JS prototype, all 4 stages (Profile →
  Scanner → Plan → Crisis) plus landing/archetype/mode onboarding and an Ending/ledger screen.
  **This is prototype infrastructure for iterating on game design and visual system — not the
  final mobile platform.** See the product/testing standard above.
  Real game content (opportunities, plan questions, all 14 crisis days, lesson cards) ported
  from `prototype/build/`, which itself was extracted from the deployed bundle — nothing in
  Stage 2-4 is invented.
- Visual system: **Sunrise** (see `DESIGN.md`) — committed, documented, detector-clean.
- `hustle-simulation.netlify.app` — the separately-deployed production app this prototype is
  redesigning *toward*, not replacing directly; PRODUCT.md's original audit was of that build.
- **Key files**: `PRODUCT.md` (audience/constraints/anti-reference), `DESIGN.md` (Sunrise
  visual system) + its sidecar `.impeccable/design.json` (shadows/motion/focus/breakpoints),
  `research/` (this pass's findings), `.impeccable/critique/` (multiple runs — the
  2026-08-01 ones audited the *deployed bundle* before source access existed; the 2026-08-04
  and 2026-08-05 ones critique this prototype directly and supersede the bundle-era findings).
  Also read `~/.claude/knowledge/design/frontend-lessons.md` before UI work — anti-slop bans,
  contrast rules, motion rules, portable across projects.
- **Standing test environment built 2026-08-11, flagged as a false-positive generator same
  day** — Playwright harness (`package.json`, `playwright.config.js`, `tests/smoke.spec.js`),
  run via `npx playwright test`. 9/9 passing is real but does not mean what it sounds like:
  an `adversary` review copied the spec against a 45-byte stub page (`<button>x</button>`,
  no HUSTLE content) and got the same "9 passed" — the spec has zero HUSTLE-specific
  assertions (no text/selector/content checks tied to real Crisis/Scanner/Plan output), so it
  currently only proves the page loads and something clickable exists, not that HUSTLE works.
  This violates this file's and `TESTING.md`'s own rule 2 ("DOM contains the expected element"
  alone is not verification). Not yet fixed. Also unfixed: `npm test` still runs the npm-init
  stub (`npx playwright test` is the real invocation), and the screenshot output path collides
  across all three viewport projects (last writer wins). Deeper per-stage journey coverage is
  **not yet written**. See `TESTING.md` → "Environment status" for detail, including a real
  bug the harness caught on its first run (an a11y skip-link false-positiving as the landing
  page's primary CTA) — that finding stands independent of the assertion-strength problem.
- **Android QA environment — DONE 2026-08-11.** Not gated on `adversary` review — infra/
  tooling setup, not a code deliverable (the gate applies to code that ships, this is a
  one-time environment build with its own on-disk verification at every step). Root-caused
  the multi-session license-acceptance failure: it was never the
  rate limit — **`cmd.exe /c "sdkmanager.bat ... < file"` silently produces zero output and
  zero effect on this machine**, every single time, regardless of quoting/timeout (confirmed
  by running it in the foreground with no timeout and getting only the cmd.exe banner back).
  Fix: call `sdkmanager.bat` **directly** (no `cmd.exe /c` wrapper) with `< file` stdin
  redirect — this actually invokes java and produces real output. **If a future session hits
  a silent/no-output batch-file automation problem on this machine again: never use `cmd.exe
  /c` as a wrapper, call the `.bat` directly from bash with env vars exported first.**
  Second bug found: `sdkmanager.bat --sdk_root=<path>` **does not use the path given** — it
  compounds an extra literal `Android` prefix onto the arg's basename on every single
  invocation (`C:\Android\Sdk` → installed to `C:\Android\AndroidSdk` → next call with that
  same corrected path installed to `C:\Android\AndroidAndroidSdk` → next call to
  `AndroidAndroidAndroidSdk`, confirmed by direct `find`/`ls` after each call, not trusted on
  exit-0/log-text alone). Worked around by **not using `--sdk_root` at all** — export
  `ANDROID_SDK_ROOT`/`ANDROID_HOME` env vars instead (tools respect these directly and
  correctly). Consolidated all real downloaded packages (platform-tools, platforms;
  android-33, emulator, system-images;android-33;google_apis;x86_64, licenses,
  cmdline-tools/latest) via `mv`/`cp` into one clean root: **`C:\Android\FinalSdk`** — this
  is the canonical SDK root going forward, every real binary in it directly verified present
  via `ls` (`adb.exe`, `emulator.exe`, `sdkmanager.bat`). Licenses accepted, platform-tools +
  platform 33 + emulator + system image all installed and verified on disk (not trusted on
  sdkmanager's own `--list_installed` claim alone after it once claimed installed when the
  files genuinely weren't there — re-verify with `find`/`ls` after every install). AVD
  `hustle_lowend` created via `avdmanager.bat` (android-33 google_apis x86_64, pixel device
  profile), confirmed on disk at `~/.android/avd/hustle_lowend.avd`. Emulator launched
  headless (`-no-window -no-audio -no-boot-anim -gpu swiftshader_indirect`). Boot completion
  confirmed via `getprop sys.boot_completed` = 1 (`adb devices` showed `emulator-5554
  device`, not offline). Screenshot captured via `adb exec-out screencap -p >
  /c/Android/hustle_boot.png` (first two attempts using `adb shell screencap` +
  `adb pull /sdcard/...` both failed on git-bash POSIX-path mangling of the remote path —
  `exec-out` sidesteps it by streaming the PNG straight to a local redirect). Verified
  499331 bytes, `PNG image data, 1080 x 1920, 8-bit/color RGBA` via `file`, and visually
  inspected: genuine Android 13 home screen, Pixel launcher, status bar, real app icons, plus
  a benign "Gmail keeps stopping" first-boot dialog (cosmetic, normal on `google_apis` images
  with no account configured — not a defect). Clean shutdown via `adb emu kill`, re-confirmed
  with `adb devices` returning no attached devices. Full write-up, canonical SDK root, and
  the exact working command sequence: `hustle/ANDROID_SETUP.md`.
- **RN architecture validation (Crisis vertical slice) — started 2026-08-11, in progress.**
  Scope: prove/disprove the `ARCHITECTURE.md` React Native + Hermes + New Architecture
  recommendation against a real Crisis-stage slice, per that document's own validation gate.
  Explicitly NOT a full migration — current prototype stays canonical and untouched. Phase 1
  (framework-agnostic TypeScript domain layer for Crisis): first fork attempt died silently
  (no output files). Second attempt (2026-08-11) actually wrote real files, confirmed on disk
  via `ls`/`wc`: `hustle/domain-ts/crisis/types.ts` (84 lines), `logic.ts` (184 lines),
  `index.ts`, `tsconfig.json`. Extracting agent's self-report: 1:1 port of Crisis arithmetic/
  thresholds from `prototype/hustle-shell.html` lines ~2275-2586, zero RN/DOM/React imports,
  `tsc --strict --noEmit` clean, converted prototype's in-place global-state mutation to pure
  state-in/state-out (claimed mechanical only). Explicitly NOT extracted (flagged for Phase 13):
  `finish()` cross-stage score blending (Plan + cash), asset/image path selection, UI feedback
  side effects (say/popNumber/flash/shake/buzz/burst).
  **Adversary review (agent adc2db65795a554d7) completed 2026-08-11 — VERDICT: SHIP WITH FIXES,
  not clean.** Ran real byte-diff of `crisis-decks.json` vs prototype (identical), `tsc --strict
  --noEmit` (clean), and a 1000-run differential sim vs a verbatim prototype re-implementation
  (arithmetic parity: 0 mismatches). Arithmetic/bands/streak/momentum logic itself is sound. But
  4 CONFIRMED MAJOR bugs, both self-report claims disproven:
  - `types.ts:41` `hasDecision: boolean` required, but 180/225 deck events omit the key —
    `tsc` fails the moment real JSON is assigned to the type. "Mirrors JSON exactly" claim FALSE.
  - `logic.ts:129-147` drops `lastDelta`/`lastOutcome` from persisted state — prototype's
    `renderCrisis` reads these on resume to redraw the outcome panel; the port loses them on
    reload.
  - `logic.ts:158-172` drops the `ended` flag — prototype's nav guard needs it to resume to the
    end screen; the port has no way to know a run finished after reload.
  - `logic.ts:122-124` **throws** on double-resolve where prototype silently no-ops (guards
    against double-tap banking a day twice) — in RN this is a redbox/crash on an onPress, not a
    no-op. "Behavior preserved exactly" claim FALSE.
  Plus 3 MINOR: `momentumFrac` returns 0 instead of prototype's 0.5 for "Starting out" (visual
  regression), `state.log.length` unguarded (prototype null-tolerates on resume, port throws),
  dangling README reference. Not-extracted list also incomplete: no-decision "Take the day"
  convention, `STREAK_WORD` bands, `renderLedger` pivot computation all silently missing.
  **Fixes applied 2026-08-11** to `types.ts`/`logic.ts`: `hasDecision` made optional (verified
  `tsc --strict` now accepts direct `crisis-decks.json` assignment for this field, no cast
  needed — remaining `type: string` widening on JSON import is normal TS behavior, needs one
  `as CrisisDecks` at the import site regardless of type shape, not a defect); `lastDelta`/
  `lastOutcome`/`ended` added to `CrisisRunState` and threaded through `resolve()`/`nextDay()`;
  double-resolve now no-ops (`alreadyResolved: true`) instead of throwing; `momentumFrac`
  returns 0.5 (was 0) for the empty/"Starting out" case to match the prototype's bar value;
  `log.length` reads guarded with `?.`. Re-ran `tsc --strict --noEmit -p domain-ts/tsconfig.json`
  from `hustle/node_modules/.bin/tsc` directly (not npx — avoids network/registry calls):
  exit 0. **Still NOT done** — these are my own fixes, unverified by adversary. Next: re-run
  `adversary` fresh against the updated files before marking Phase 1 done / starting Phase 2.
  Minor items not yet addressed: no-decision "Take the day" convention, `STREAK_WORD` bands,
  `renderLedger` pivot computation — still absent from the port, flagged for whoever builds the
  Phase 2 shell to not silently reinvent differently.
  Android license job: bnkq20dnb → b10aftgh0 both died with no real output (log only ever had
  the cmd.exe banner, sdkmanager never actually ran/echoed — same rate-limit-kill pattern).
  Relaunched 2026-08-11 as background task bd5tvhf6i, log `/c/Android/licenses4.log`, same
  confirmed-working `cmd.exe /c` + absolute paths + `<` redirect command. Not yet resolved.
  Adversary re-review (a48c2655e4de7d248) completed 2026-08-11 — VERDICT: SHIP WITH FIXES,
  again not clean. 6 of 7 first-round fixes CONFIRMED correct (hasDecision, lastDelta/
  lastOutcome, ended, double-resolve no-op, log.length guard, README ref removed) — but the
  `momentumFrac` fix (0.5-default) was **wrong**: it only guarded `played === 0`, missing that
  day 1 of every deck is a no-decision event, so after day 1 `played===1` but `crisisRange(1)`
  is `{0,0}` → still returned 0 instead of 0.5. Fires on 100% of runs at the day-2 screen.
  Fixed again: `momentumFrac` now checks `!played || scored.hi <= scored.lo` (mirrors
  `momentumWord`'s own guard) before falling through to `crisisFrac`. Also fixed two MINOR
  items the review caught: a stale comment claiming "45 no-decision events" (actual: 30, per
  a real census — 180 decision + 30 no-decision = 210 total, not 225) and an undocumented
  1-indexed-vs-0-indexed mismatch between `CrisisEventVariant.day` (1-14) and
  `CrisisRunState.day` (0-indexed, used to index the deck array) — now documented in
  `types.ts`. Re-ran `tsc --strict --noEmit`: exit 0.
  Two MINOR items from the review left unfixed (real but non-blocking per the review's own
  read): `today()` throws on out-of-range `state.day` (matches prototype behavior, not a
  regression — flagged as a `noUncheckedIndexedAccess` gap, not urgent), and the "picks"/
  "picked" tense nit in a source comment.
  Still-missing (confirmed absent both rounds, deliberately deferred to Phase 2/13): the
  no-decision "Take the day" label+score-0 convention, `STREAK_WORD` bands, `renderLedger`
  pivot computation, and (newly noted) `BANDS`/`STAMP_WORD`/`ARCHETYPE_CLOSING` and `finish()`'s
  cross-stage score blend — all stage-5/UI-adjacent, need a product call on where they live.
  **Third adversary pass (a2adcf5a5f6579df8) completed 2026-08-11 — VERDICT: SHIP.** Zero
  CRITICAL/MAJOR. Independently re-derived `crisisRange` per-deck for all 5 decks across
  `upto=0..14` from the JSON and ran a 225-point differential sim of TS `momentumFrac` vs the
  prototype's actual meter value: 0 divergences. Confirmed the round-2 bug is genuinely gone
  and the guard isn't over-broad (range stays non-degenerate and correctly keeps grading at
  played=5, the other no-decision day). Both comment fixes (30/180 count, 1-indexed `day`)
  independently re-counted from the JSON and confirmed accurate. 2 MINOR non-blocking notes:
  `momentumFrac`'s doc comment doesn't explain the 0.5-for-ungraded convention at the function
  itself (doc gap, not a bug — only call site matches prototype exactly), and
  `crisisRange`/`crisisFrac` get recomputed redundantly per render (irrelevant at 14 slots,
  noted only as a future-drift risk if the two guards are edited separately later).
  **Phase 1 (Crisis domain-layer TS extraction) is DONE, adversary-cleared, 2026-08-11.**
  Took 3 rounds: round 1 found 4 major + 3 minor real bugs in the original extraction; round 2
  caught that my own first fix (momentumFrac default) was itself wrong; round 3 confirmed the
  corrected fix. Lesson for future phases: don't trust a single review pass or a self-applied
  fix without independent re-verification — this is the second time in this workstream a
  "fixed" claim needed a second look to actually be true.
  **Phase 2 started 2026-08-11 — FLAGGED JUDGMENT CALL, not a unilateral decision:**
  scaffolding via bare React Native CLI (`npx @react-native-community/cli init`), not Expo.
  Reasoning: `ARCHITECTURE.md`'s recommendation is specifically "RN + Hermes + New
  Architecture" — bare CLI gives direct, undiluted control over those exact flags with nothing
  Expo's managed layer could mask or auto-configure differently, which matters for a
  *validation* slice whose whole point is testing that specific recommendation. Expo (SDK 50+)
  now supports New Architecture + Hermes by default too and would have been faster to
  bootstrap — if the user would rather validate against Expo's toolchain (closer to what a
  real build might actually ship with), that's a legitimate override, just say so and Phase 2
  restarts on that toolchain instead. Proceeding with bare CLI as the default since the user
  is unavailable to confirm and it's the more literal reading of the architecture doc's own
  recommendation.
  **Phase 2 scaffold verified 2026-08-11** — background task `b23drzxhg` (`npx
  @react-native-community/cli@latest init HustleCrisisSlice --directory rn-slice`) reported
  exit 0; independently re-verified via direct `ls`/`cat` (not trusted on status alone, per
  standing rule): `hustle/rn-slice/` is a real bare RN 0.87.0 project (React 19.2.3,
  `android/`+`ios/` present, `android/gradle.properties` confirmed `newArchEnabled=true` and
  `hermesEnabled=true` already — no manual wiring needed, RN 0.87 defaults to both). Not yet
  done: importing Phase 1's `domain-ts/crisis/{types,logic}.ts` into `rn-slice`, building the
  Crisis screen (Phase 3).
  Phases 3-13 (slice rebuild, persistence check, device/emulator testing, automated-testing
  tool choice, GO/CONDITIONAL GO/NO-GO decision) not started. Real-device testing is not
  available this pass — emulator-only, which weakens the evidence the spec itself asks for
  (§7); the final report must say so plainly, not paper over it. Every item in this
  workstream requires `adversary` review before being marked done here.
  **Phase 3 (Crisis screen rebuild in RN) — DONE, adversary-cleared, 2026-08-12.**
  Built `rn-slice/App.tsx` against Phase 1's domain-ts layer (copied verbatim into
  `rn-slice/src/domain/`). Adversary review (task ae1a75f38d67e672d) — **VERDICT: SHIP WITH
  FIXES.** 2 MAJOR (deprecated core `SafeAreaView` instead of the installed
  `react-native-safe-area-context` package; stale-closure lost-update race in `pick()` from
  reading `state` instead of the setState updater's `prev`), 5 MINOR (day-1 momentum meter
  showing a false partial fill instead of empty/sentinel; cash rendered as raw digits with no
  thousands separator; dangling ", " when neither streak-extended nor streak-broken; disabled
  choice buttons had no visual dimming; unsafe `decksJson as unknown as CrisisDecks` cast with
  no runtime schema check). All 7 fixed in `App.tsx`: wrapped root in `SafeAreaProvider` +
  package's `SafeAreaView`; `pick()` rewritten to use `setState(prev => ...)`; added
  `meterWidth = played === 0 ? 0 : mFrac` sentinel; `.toLocaleString()` on both cash displays;
  streak-note string only appends when non-empty; `choiceDisabled` style (`opacity: 0.4`) added
  conditionally. Re-verified: `npx tsc --noEmit` clean, full rebuild, on-device install,
  screenshot `/c/Android/rn_crisis_screen6.png` (91820 bytes, directly inspected) shows
  "Cash: R5,000" comma-formatted and an empty day-1 meter — both fixes visually confirmed live.
  **Deliberately NOT touched** (scoping call, not yet user-confirmed): `src/domain/{types.ts,
  logic.ts,crisis-decks.json}` — verbatim copy of the domain-ts layer already adversary-cleared
  3 rounds over in Phase 1. Two items the review also flagged there are recorded as
  **KNOWN LIMITATIONS** instead of being silently patched mid-slice:
  - **Day-2 momentum/streak contradiction**: day 2's `crisisRange` is a 1-point span, so
    `momentumFrac` always reads a hard 0% or 100%, while `judgeCall`'s independent ±1-point
    tolerance can call the same pick a streak success — UI can show "streak +1" beside a meter
    reading 0%. Root cause is in the already-cleared domain-ts math, not the RN port; a real fix
    means changing `crisisRange`/`judgeCall`'s relationship, which is a domain-layer product
    decision, not a slice-validation task.
  - **`decksJson as unknown as CrisisDecks` unsafe cast** left in place — adversary manually
    verified all 5 decks are well-formed against the type, so nothing fires today, but there is
    no runtime schema validation guarding future deck edits. Low risk, deferred.
  **Five environment/build gotchas found this phase, now also in `ANDROID_SETUP.md`:**
  1. `gradlew.bat` must be invoked directly from bash — `npx react-native run-android` doesn't
     reliably drive it on this machine. First build: 44m4s, auto-installed NDK 27.1.12297006,
     SDK Platform 37, Build-Tools 36, CMake 3.22.1.
  2. `adb` isn't on PATH in a fresh bash shell — export `ANDROID_SDK_ROOT`/`ANDROID_HOME=
     /c/Android/FinalSdk` and prepend `$ANDROID_SDK_ROOT/platform-tools` to PATH every fresh
     shell.
  3. First app launch takes ~18-25s to Activity-display, plus more time for Metro to finish
     serving the bundle — a screenshot taken during either window looks identical to a blank or
     crashed screen. Verify via logcat's "Displayed" timestamp and metro.log/file-mtime
     freshness before concluding success or failure from a screenshot alone.
  4. `JAVA_HOME` isn't set by default in a fresh bash shell either — real path on this machine:
     `C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot`, must be set in Windows-backslash
     form (`export JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot'`) since
     `gradlew.bat` is a native Windows batch file — a POSIX-style guessed path produces a
     misleadingly-different "invalid directory" error rather than "not found," so don't assume a
     different error message means a different root cause.
  5. Gradle 9.4.1's incubating "Problems report" writer can itself throw
     `java.util.concurrent.TimeoutException` and make gradle report `BUILD FAILED` even though
     `:app:installDebug` already succeeded and logged "Installed on 1 device." Don't trust
     gradle's own exit status alone here — cross-check with
     `adb shell dumpsys package <pkg> | grep lastUpdateTime` against the build's run window.
     `--no-configuration-cache` avoided recurrence on retry; root cause in the report-writer
     itself not further diagnosed since it doesn't block the actual install.
  **Phase 4 — persistence check, 2026-08-12: gap closed, then adversary-reviewed and fixed,
  same day.** AsyncStorage-backed persistence (restore/save/corruption handling) was added
  to `App.tsx` after the original "zero matches" gap noted below was found. An independent
  adversary review then found 3 CRITICAL + 4 MAJOR defects in that persistence code; all
  CRITICALs and most MAJORs were fixed and independently re-verified the same day
  (jest + real component, EMULATOR-VERIFIED). **Not** validated: save-retry logic, an
  automated Maestro regression gate for the restore/corruption path (flow authored but
  assertion-timing-flaky), torn-write/storage-full/concurrent-instance behavior, real
  device. Full detail: `rn-slice/PERSISTENCE_VALIDATION_REPORT.md`, `DECISIONS.md` → "RN
  Crisis slice: adversary-driven persistence fix pass."
  *(Original note, now superseded: grepped `App.tsx`/`src/domain/` for
  `AsyncStorage|MMKV|localStorage|persist` and found zero matches, meaning the slice held
  state in `useState` only. That gap is what the persistence work above closed.)*
  **Phase 5 — RN test-tool choice: OPEN DECISION FOR THE USER, not picked.** Researched
  Detox vs Maestro (2026) rather than assuming the existing Playwright harness transfers —
  it doesn't; Playwright drives a DOM, RN on-device has no DOM to query.
  - **Detox**: gray-box, integrates into the app to detect when it's fully idle before
    acting — lowest flakiness (<2%) for a pure-RN app, heaviest adoption (Shopify, Wix), but
    needs native build config changes and has a track record of lagging new RN
    architecture/Expo SDK releases after upgrades.
  - **Maestro**: black-box, drives via the OS accessibility layer, zero project/build
    footprint, fastest to set up, lowest flakiness of the two (<1%) per vendor benchmarks,
    also works across iOS/Android/Flutter/web if HUSTLE ever needs that.
  - No pick made here — this is a real trade (setup speed + flakiness vs. deeper native
    integration + ecosystem maturity), and the spec calls for flagging judgment calls rather
    than auto-deciding them. Recommendation if a nudge is wanted: Maestro, given this slice's
    validation goal is breadth/confidence, not a long-lived deep regression suite yet.
    Sources: [Maestro vs Appium vs Detox 2026](https://codersera.com/blog/maestro-vs-appium-vs-detox-2026/),
    [Detox vs Maestro flakiness](https://maestro.dev/insights/detox-vs-maestro-reducing-flakiness-react-native)
  **RN architecture validation workstream — DONE, 2026-08-12. Verdict: CONDITIONAL GO.**
  Full report: `RN_VALIDATION_REPORT.md`. Not a clean GO because real low-end device testing
  (the one condition `ARCHITECTURE.md` §11 itself names as required) wasn't available this
  pass — emulator-only. Per this workstream's binding stop condition, **no migration work
  has been started** off the back of this validation, even though the slice itself worked —
  that decision is explicitly left for the user. Next steps if a GO is confirmed: real-device
  re-test, Detox/Maestro pick (Phase 5 above), budget for the five environment gotchas on any
  new machine (`ANDROID_SETUP.md`).
- **Navigation-only spike — DONE, PASS, 2026-08-12.** Branch `nav-spike` off `main`
  (`6abd4a4`). Question: does raw root `useState` screen-switching, combined with the existing
  AsyncStorage write-queue/backup/restore pattern, correctly carry shared state across
  navigation, remount, rapid interaction, and genuine kill/relaunch? Answer: yes — zero app
  bugs, zero architecture problems, mandatory negative control confirmed the Maestro harness
  isn't vacuous. Full report: `rn-slice/NAVIGATION_SPIKE_REPORT.md`. `react-navigation` stays
  deferred (see `DECISIONS.md`). Spike branch **not** merged into `main` — `main` remains the
  Crisis-slice baseline; spike kept as evidence only.
- **Scanner slice — DONE, 2026-08-12.** Branch `scanner-slice` off `main` (`6abd4a4`) —
  explicitly NOT built on `nav-spike`, per the approval's implementation boundary. Objective:
  prove the RN architecture supports a SECOND real HUSTLE stage with its own shared state and
  persistence, using the smallest useful experiment. Scope: one hardcoded business (Phone
  Repair Kiosk) — scan → select → commit → persist → force-stop → relaunch → restore. Full
  evidence, findings, fixes, and architectural conclusion: `rn-slice/SCANNER_SLICE_REPORT.md`.
  Deferred (explicitly, per approval): multi-business carousel, scroll-snap, dot navigation,
  full Five Forces presentation, full stat-gated content, animation/game-feel polish, Plan
  implementation, full Profile→Scanner integration, full Scanner migration, new navigation
  library.
  - **Domain layer**: `domain-ts/scanner/{types,logic,index}.ts`, ported from
    `hustle-shell.html:1913-2867` — `affordable`/`opening`/`overBy`/`levelOf`/`forcesOf`/
    `forcesTotal`/`pressureWord` plus new pure state-transition functions `scanSpot`/
    `selectSpot`/`commitSpot` (the prototype's own equivalent is inline event-handler
    mutation, not an extractable function — written fresh, following the prototype's exact
    validation/branching order). Copied verbatim into `rn-slice/src/domain/scanner/`.
    Differential-validated: 30 cases (5 businesses × 6 network-stat values) vs. a hand
    re-derivation of the prototype's own arithmetic, **0 mismatches**. State-transition
    functions verified by direct code comparison instead (no prototype pure function to diff
    against), plus the on-device adversarial evidence below.
  - **Commit atomicity** (a real design decision, not left implicit): persist the complete
    post-commit state to AsyncStorage FIRST, only flip the render state to "committed" after
    that write succeeds; on failure, render state stays pre-commit and the failure is
    surfaced, nothing partially applies. Stronger guarantee than Crisis's fire-and-forget
    autosave, which was correct for Crisis's own non-destructive per-turn state but not
    strict enough for a one-way spend. See `DECISIONS.md` → "Scanner commit atomicity."
  - **1 MAJOR bug found and fixed, self-caught before formal adversarial testing began**: the
    Commit double-tap guard checked `committing` (React state via closure) instead of a ref —
    two `onPress` calls in the same JS tick could both see stale `committing===false` and
    both proceed, risking a double-charge. Identical bug class to the Crisis slice's Phase 3
    `pick()` stale-closure bug. Fixed with a `committingRef` checked/set synchronously before
    any `await`. Rebuilt from scratch, reinstalled, freshness confirmed via
    `dumpsys package | grep lastUpdateTime` (not trusting Gradle exit code alone, per this
    project's standing rule), baseline flow re-run clean against the rebuilt APK before any
    adversarial case ran against it — did not reuse pre-fix evidence.
  - **10/10 adversarial cases run** (approval §8), each classified APP BUG / ARCHITECTURE
    PROBLEM / TEST-HARNESS LIMITATION / EXPECTED-OUT-OF-SCOPE: rapid double-tap on Commit
    (Maestro can't dispatch a true same-frame double-tap — TEST-HARNESS LIMITATION for the
    scripted case, but a real concurrent-`adb`-tap approximation confirmed the fix holds);
    repeated scan/select spam (clean); select→commit immediately (clean); kill after scan
    before select (restored correctly); kill after select before commit (restored correctly,
    cash correctly never applied); kill immediately after commit with no artificial delay
    (restored correctly — supports but doesn't prove immunity to a mid-flush torn write, same
    standing gap as `PERSISTENCE_VALIDATION_REPORT.md`); 3x consecutive restart cycles
    (state byte-identical every time); corrupt AsyncStorage via real `adb root` + direct SQLite
    edit, both syntactically-invalid JSON and syntactically-valid-but-relationally-invalid
    payloads (both correctly rejected, backup preserved, no crash); negative control
    (genuinely FAILED, real exit code 1, confirmed twice); re-commit to a different business
    (EXPECTED/OUT-OF-SCOPE for this slice's single-business UI — but the domain layer's
    `resetDownstream` mechanism was verified correct in isolation: same-business → false,
    different-business → true with correct new cash/cost, first-ever commit → false).
  - **Selector lesson repeated from `TEST_HARNESS_INVESTIGATION.md`, hit again on first
    attempt here**: bare/partial-text `assertVisible` (`"HUSTLE"`, `"HUSTLE.*Scanner"`) FAILED
    even though the screenshot and screen-hierarchy dump both showed the text rendered —
    confirmed by A/B against a known-working wildcarded pattern from `crisis_day1_flow.yaml`.
    Root cause: Maestro full-matches non-wildcarded patterns, does not substring-match. Every
    assertion in the final flows wraps in `.*` unless the text is a self-contained button
    label with no surrounding content.
  - **Not done this pass**: no formal `adversary` subagent review was run — the one MAJOR bug
    was self-caught, not adversary-caught, which is a weaker guarantee than Crisis's own
    history (which needed an independent reviewer to catch its equivalent bug). Flagged as a
    real gap in `SCANNER_SLICE_REPORT.md`, not silently skipped.
  - **Architectural conclusion**: RN + raw root state + the existing AsyncStorage write-queue/
    backup/restore pattern supports a second stage's own independent persistence key
    coexisting with the first, and a destructive one-way transition can be made durably atomic
    on top of that same pattern with a small ordering change, not a new library. Full
    conclusion and stop-condition check: `rn-slice/SCANNER_SLICE_REPORT.md`.
  - Per the approval's Final Stop: not expanded to the full Scanner, no Plan, no carousel, no
    navigation library added this pass.
- Known gap, confirmed by the 2026-08-05 critique: **the prototype looks authored but plays
  mechanically inert** — Stage 1's stat/archetype choices don't branch anything, and
  Crisis/Plan scoring is invisible until the very end. This is the throughline the next two
  phases exist to fix.

## Phase 1 — Make choices matter (critique fixes) — ✅ done 2026-08-05

Directly from the 2026-08-05 critique's P0/P1 findings. This was the prerequisite for
everything in Phase 2 meaning anything — no amount of new educational content matters if the
player still can't feel any choice's consequence until the Ending. Verified via Playwright +
detector, zero console errors.

- [x] Wire `state.stats`/`state.archetype` into at least one real branch each — done via
      finance/sales/network ≥7 Scanner insight unlocks (restoring the mechanic `PRODUCT.md`
      documents the original shipped build had) and an archetype-keyed closing line on the
      Ending screen
- [x] Surface a live signal during Crisis/Plan instead of hiding `crisisScore`/`planScore()`
      until `finish()` — a qualitative "Momentum" meter (word + bar, deliberately not the raw
      score) in the Crisis HUD, reusing `crisisFrac()`; a "Plan strength" meter in Stage 3
      computed from answered-so-far sections
- [x] Removed the always-visible `.note` dev-disclosure block entirely (HTML + its now-orphaned
      CSS)
- [x] Fixed the `#live` region — moved to a direct child of `<main>`, outside every `.screen`,
      so it's never inside a `display:none` ancestor regardless of active stage
- [x] Added a real mode-switch control (`#modeToggle`) in the persistent header, visible once
      past onboarding (same `.pre-game` hide the stage stepper already used) — the Mode
      screen's "you can switch later" claim is now true

## Phase 2 — Deepen the business education

Backed by `research/`. Each item links to the page with the full research + design detail.

- [x] **Name and complete Porter's Five Forces in the Scanner** — done 2026-08-05. `rivalry`
      reads `o.comp` verbatim and `buyers` is the inverse of `o.demand`; the other three
      (`entrants`, `subs`, `suppliers`) are authored per opportunity in a `FORCES` table, and
      **each authored row prints the judgement it rests on directly underneath it** so a call
      somebody made never passes as a number the game measured. Rendered as five three-segment
      pressure gauges plus an out-of-15 total. The framework is named **once**, after the first
      spot has actually been read — the research's own finding was that strategy sims teach
      this by letting the player derive it from consequences, not by opening with a definition.
      Two further hooks came free: `Network >= 7` really does take one step off supplier power
      (making the stat's "better supplier terms" promise true), and the commit hint plus the
      Ending's review both name the high force you are carrying, so the analysis is closed back
      to the outcome. → `research/porters-five-forces-and-strategy.md`
      - **Still open from that page:** letting a mid-Crisis event fire preferentially against
        the force the player under-scanned. The crisis decks are fixed authored data, so this
        needs deck work, not view work — it belongs with the 3-beat restructure below.
- [ ] **Real budget allocation** — split cash into a weekly/daily allocation decision
      (stock, marketing, buffer) instead of one undifferentiated pool.
      → `research/porters-five-forces-and-strategy.md`, `research/marketing-and-customer-retention.md`
- [ ] **A visible marketing/reputation signal**, distinct from cash, that only moves in
      response to specific choices (marketing spend, consistent service, a Plan answer about
      the target customer).
      → `research/marketing-and-customer-retention.md`
- [ ] **Field Notes decision journal** — the single highest-leverage item in the whole
      research pass. Resurface `state.log` entries mid-game, connecting an earlier choice to
      its actual consequence, instead of only replaying the ledger at the Ending.
      → `research/decision-journal-and-feedback-loops.md`
- [ ] **Restructure Crisis into a 3-beat daily loop** (morning prep → the event → close the
      day) instead of one flat beat — the close-the-day beat is where Field Notes lives.
      → `research/daily-loop-design.md`

## Phase 2.5 — The game layer — ✅ done 2026-08-05

Not originally on this roadmap. Added after: *"it simply doesn't read like a game, it reads
more like a simulation inside a webpage"* — and the fix for that is not more content, it is
that the moments the engine already treats as significant have to **land**. GSAP, vendored
locally (`prototype/vendor/gsap.min.js`), never a CDN. Full spec in `DESIGN.md` → "The game
layer".

- [x] **Thumb dock** — the stage's one real action pinned in reach on Stages 1–4, safe-area
      padded. Mobile is the design target, not an adaptation: this is the single change that
      most separates "a page you scroll" from "a thing you play" on a phone.
- [x] **Damage numbers** — the real `cashChange` thrown from the element that changed.
- [x] **Day card** — a full-bleed curtain between trading days, with the screen swapped while
      covered so a render is never seen half-built. 14 days became 14 curtain-ups.
- [x] **Streak** — consecutive good calls named while you are still in them, judged off the
      deck's own best-available score rather than a threshold invented in the view.
- [x] **Verdict burst** — tier 1–2 only. A run that went broke never gets one.
- [x] Haptics on every decision, screen shake scaled to the loss relative to what you hold,
      elastic meters, and an authored per-stage entrance timeline.
- [x] **Bug this pass exposed and fixed:** the live momentum meter normalised against all 14
      days, so a won opening day read as "Shaky" on an empty bar. It now grades on days
      actually played. A progress signal must be normalised against what has happened, not
      against what could still happen.
- [x] **Dropped anime.js entirely** — 118KB, ~40% of page weight, dead once GSAP covered every
      call site. GSAP is now the only animation dependency.
- [x] Also fixed en route: aborted View Transitions surfacing as uncaught errors (three per
      run); `rands()` printing a negative close as `R-100` instead of `−R100`; the ledger
      calling a no-decision day "one decision"; the dock's transparent gradient band
      swallowing taps on content beneath it (invisible, and the worst kind); the archetype
      Continue button landing at y=621 in a 640px viewport; the hero kicker stretching to
      34rem because `.hero-copy` is a flex column; and a focus ring drawn around the H1 on
      load, because `show()` focuses headings for screen-reader announcement and the focus
      rule matched every `[tabindex]`.

## Phase 3 — Engagement layer

Only after Phase 1 and 2 — an engagement layer on top of mechanically-inert choices would just
be decoration.

- [ ] **Founder's Path** — a participation-based reward track across the 14 days (read every
      lesson, survive a thin-cash day, diversify stat spend). The structure is worth building
      now regardless of the monetization question below — a free/premium split can be
      layered onto a track that already works, but a track designed around a paywall from day
      one tends to warp the design toward extraction.
      → `research/engagement-mechanics.md`
- [ ] A replay-streak mark for completing the 14 days more than once (Play mode's stated
      use case is revision/replay — reward the actual pedagogical goal, not daily login)
      → `research/engagement-mechanics.md`

## Phase 4 — Beyond the prototype

**Correction, 2026-08-05: the idea owner's actual intent is to turn this into a consumer
app**, not to stay a facilitator-only learnership tool. Everything in `PRODUCT.md` about the
NQF/SAQA classroom audience is still real and still binding — that's who the *content* is
written for — but the *product* itself should be planned as something that stands on its own
outside a classroom, which changes what Phase 4 actually needs to answer.

- [x] **Choose the mobile technology and the reuse plan** — ✅ decided 2026-08-08, see
      `ARCHITECTURE.md`. **Recommendation: React Native (Hermes + New Architecture),
      Android-first.** Beats Flutter on memory/size and Capacitor on cold-start and on the
      specific WebView-vs-animation-heavy-content weakness that lines up with `DESIGN.md`'s own
      game-feel layer. Domain logic/content ports as a framework-agnostic TS layer; the whole
      Sunrise UI/animation layer gets rebuilt against RN primitives, guided by `DESIGN.md` as
      spec. **Decision only — migration itself is un-started**, gated on a real-device-validated
      vertical slice first (`ARCHITECTURE.md` §11/§13).
- [ ] Decide whether/how these mechanics port from this vanilla-JS prototype into the real
      React app at `hustle-simulation.netlify.app` — folds into the reuse plan above
- [ ] **A real monetization model**, chosen deliberately rather than defaulted into — see
      "Monetization, done carefully" below before building anything here
- [ ] Facilitator-side needs, currently **[assumed]** and unresolved per `PRODUCT.md`: cohort
      reporting, shared-device reset flow for a classroom period, whether a facilitator
      dashboard is a real requirement — **still relevant even for a consumer app**, since
      classroom/facilitated use is a plausible acquisition channel, not a separate product
- [ ] Outcome validation — EVERFI's FutureSmart is ESSA Level III validated (see
      `research/financial-literacy-education.md`); worth deciding early whether HUSTLE should
      eventually be measured the same way, since that changes what "done" means for Phase 2,
      and a credible efficacy claim is also a real consumer-app differentiator

## Monetization, done carefully — not "out of scope" anymore, but not a free-for-all either

The correction above changes what's *possible*; it doesn't change who's playing. The audience
PRODUCT.md documents — low-end Android, prepaid data paid for by the learner, possibly a
shared device — makes certain monetization patterns actively predatory rather than merely
distasteful, regardless of whether the product is "for a classroom" or "for consumers." Decide
the model deliberately in Phase 4, informed by `research/engagement-mechanics.md`'s note on
what the battle-pass research found (points for participation, not performance, is the
transferable part) — but don't default into the parts of that research this file previously
ruled out sight-unseen:

- Prefer a model where the core 14-day experience is never paywalled mid-run (nothing that
  stops a player broke and mid-crisis behind a paywall)
- If a premium tier exists, prefer it sitting on cosmetic/replay/extra-content value, not on
  gating the lessons themselves — the educational content is the product's actual
  differentiator per `PRODUCT.md`'s own anti-reference framing
- Avoid countdown-timer/limited-time-offer urgency mechanics aimed at a prepaid-data audience
  specifically — the "data costs real money" constraint in `PRODUCT.md` doesn't disappear
  just because the business model changed
- Revisit `research/engagement-mechanics.md`'s Founder's Path design once the monetization
  model is chosen, since a free/premium split can reuse that track's structure directly

## How to use this file

Pick the next unchecked item in the earliest open phase, check the linked research page for
the design detail already worked out, then implement. Re-run `/impeccable critique` after
Phase 1 lands to confirm the score moves before starting Phase 2.
