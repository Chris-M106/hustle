# HUSTLE ARCHITECTURE — STEP 14A: MINIMAL RUNTIME INTEGRATION BRIDGE

Date: 2026-08-15

## 1. Why Step 14 stopped

`HUSTLE_ARCHITECTURE_STEP_14_RUNTIME_VALIDATION.md` ended **INCONCLUSIVE — RUNTIME ACCESS LIMITATION** for two independent reasons: (a) `gradlew.bat app:installDebug` failed twice with two different root causes and no current-source build ever reached the emulator, and (b) `App.tsx` had zero calls to `launchCrisis`/`readCrisis`, so even a successful install would have had no UI path to Crisis. [Certain — that report's own logged evidence, re-read this session.]

## 2. Environment blocker

Gradle's `:app:installDebug` task (which drives install through Android's `ddmlib` `InstallException` path) failed twice this project's Step 14 session:
- Attempt 1: `ShellCommandUnresponsiveException`.
- Attempt 2: `Unknown failure: cmd: Failure calling service package: Broken pipe (32)`.

**This session's new diagnostic** [Certain — ran this turn]: built natively via `gradlew.bat assembleDebug` (`BUILD SUCCESSFUL in 15s`, log: `step14a_assemble.log`), then installed the resulting APK directly via `adb install -r app-debug.apk` (not through Gradle) — output: `Performing Streamed Install` / `Success`, exit 0. Independently verified via fresh `adb shell dumpsys package com.hustlecrisisslice`: `lastUpdateTime=2026-08-15 20:00:12` (today), `firstInstallTime=2026-08-12 19:15:34` (unchanged, correctly — same package, reinstalled not reinstalled-fresh).

**Conclusion**: the blocker is specifically in Gradle's own `ddmlib`-mediated install task on this machine/AVD combination, not in `adb`, not in the emulator, not in the APK itself. Raw `adb install -r` is a reliable alternate install mechanism for this environment. [Certain — both the failing and succeeding commands were run and their exit states independently checked this session.]

Note: `app-debug.apk`'s file timestamp itself is still **Aug 12** even after `assembleDebug` reported `BUILD SUCCESSFUL` this turn — `:app:packageDebug`/`:app:assembleDebug` were both `UP-TO-DATE` (only CMake native-lib and an unrelated library's sub-tasks actually executed, confirmed via grep of the log for non-`UP-TO-DATE`/`SKIPPED`/`NO-SOURCE` task lines). This is expected, not a bug: RN debug builds do not bake the JS bundle into the APK — JS (including this session's `App.tsx` changes) loads live from the Metro dev server at runtime, not from the APK. The stale APK timestamp does not mean the bridge code implemented in §7 is stale on-device; it means the native shell is unchanged since Aug 12, which is correct (no native code changed).

## 3. Runtime integration blocker

Confirmed again this session (not reused from a prior turn): `grep -n "launchCrisis\|readCrisis" App.tsx` before this step's edits returned zero matches. `App.tsx` was a single self-contained `ScannerSlice` component — one hardcoded business, its own local `useState`, no navigation library (`SafeAreaProvider` wraps `ScannerSlice` directly), no shared app-level state owner, no stage-transition mechanism of any kind. There was no seam to reach Crisis without adding one. [Certain]

## 4. Actual current RN architecture relevant to the experiment

- **Entry point**: `App.tsx` default export, a bare function returning `<SafeAreaProvider><ScannerSlice /></SafeAreaProvider>`. No `react-navigation` — an explicit prior decision (`DECISIONS.md` → "raw root state vs. react-navigation", referenced in `App.tsx`'s own header comment).
- **Navigation mechanism**: none. Single screen, single component.
- **State owner**: `ScannerSlice`'s own `useState<ScannerRunState>` — scanned/selected/committedTo/cash/setupCost. Nothing above or outside this component owns any cross-stage state.
- **Persistence initialization**: a `useEffect` on mount reads `AsyncStorage.getItem(STORAGE_KEY)` (`'hustle.scanner.v1'`), validates via `isValidScannerState`, restores or starts fresh, backs up corrupt/unreadable data to a `.corrupt-backup` key — same pattern `crisisWriter.ts` already follows independently for its own key.
- **Scanner ownership**: `ScannerSlice` owns the entire Scanner lifecycle (scan → select → commit) and is the only writer of `ScannerRunState`. `commit()` persists synchronously via `queuedWrite` before flipping render state (documented atomicity contract, `App.tsx:222-230`).
- **Stage-transition mechanism**: none existed before this step. Commit's `CommitResult.resetDownstream` field is computed but not consumed anywhere (`scanner/types.ts:70-79`, confirmed by that file's own comment, itself sourced from a 2026-08-12 adversary pass).
- **Candidate Crisis integration seam**: the `isCommitted` branch of `ScannerSlice`'s render — the one place the component already has a validated `committedTo`/`cash` pair in hand, matching exactly `launchCrisis`'s own required inputs (`committedTo: BusinessId, openingCash: number`).

## 5. Candidate runtime seams considered

1. **New top-level app state machine (Scanner → Crisis) with a stage field.** Rejected: this is exactly the "broad App.tsx/navigation redesign" the task boundary prohibits — it would require inventing a stage-transition architecture Step 14A is not scoped to design.
2. **A separate always-visible debug menu/screen bypassing Scanner state entirely (manually enter a BusinessId, call launchCrisis directly).** Rejected: this would create a second path to `committedTo` that doesn't originate from Scanner's own commit — exactly "a second `BusinessId` authority" the adversarial checklist warns against.
3. **A button inside Scanner's own already-existing `isCommitted` panel, calling `launchCrisis`/`readCrisis` with `state.committedTo`/`state.cash` taken directly from the same state Scanner already owns and validates.** Selected — see §6/§7.

## 6. Adversarial comparison of those seams

Applying the Phase 2 checklist to seam 3 (selected):
1. Second `BusinessId` authority? No — `committedTo` is read from the same `ScannerRunState` Scanner already validates (`isValidScannerState`) and owns; guarded again with `isBusinessId()` before use, but not re-derived from anywhere else.
2. UI becomes responsible for domain state? No — `App.tsx` calls `launchCrisis`/`readCrisis` unmodified; it does not touch `CrisisRunState` fields or persistence directly.
3. Bypasses persistence contracts? No — goes through the same `launchCrisis`/`readCrisis`/`queuedWrite` used by production Crisis code, unmodified.
4. Requires changing Scanner? No functional change to Scanner's scan/select/commit logic; only an additive render branch and one new handler function.
5. Second Crisis state representation? No — `crisisBridgeResult` is local UI-only display state holding whatever `readCrisis` returned, not a second persisted or authoritative representation.
6. Alters normal game progression? No — purely additive; existing scan/select/commit flow is byte-for-byte unchanged (confirmed via `git diff App.tsx`, §8).
7. Could contaminate the runtime experiment? No — isolated behind its own `testID`s and only reachable after a real commit, so it does not interfere with Scanner-only test assertions.
8. Mistaken for real Crisis product implementation? Risk noted — mitigated by explicit "Step 14A" labeling in the button text, a code comment marking it as non-product, and by displaying only raw `readCrisis` result data (`kind`, `day`, `cash`), not any actual Crisis gameplay UI.
9. Isolable? Yes — one import block, one state block, one handler, one render block; removable by deleting those four additions.
10. Expandable later without contradiction? Yes — this is literally the seam a real Crisis-launch UI would eventually occupy; nothing here would need to be un-done, only extended.

Seams 1 and 2 were rejected before implementation; seam 3 passed all ten checks.

## 7. Selected minimum bridge

Implemented in `App.tsx` only:
- Import `isBusinessId` (`./src/domain/business`) and `launchCrisis`, `readCrisis`, `CrisisReadResult` (`./src/persistence/crisisWriter`) — both pre-existing, unmodified.
- Three new `useState` hooks scoped to `ScannerSlice`: `crisisBridgeBusy`, `crisisBridgeError`, `crisisBridgeResult`.
- One new handler, `startCrisisBridge()`: guards `isBusinessId(state.committedTo) && state.cash !== null`, then calls `launchCrisis(committedTo, state.cash)` followed by `readCrisis(committedTo)`, storing the read result for display. No retry, no polling, no additional persistence.
- One new render block inside the existing `isCommitted` panel: a button (`testID="crisisBridgeBtn"`) and result/error text (`testID="crisisBridgeResult"` / `testID="crisisBridgeError"`).

## 8. Files changed

- `App.tsx` — the only file this step touched (58 insertions, 0 deletions, per `git diff --stat` run this turn). All additions are the bridge described in §7; the pre-existing scan/select/commit code is unchanged.

`src/persistence/queuedWrite.ts` shows as modified in `git status`/`git diff --stat`, but that change predates this session (Step 13 repair work) and was not touched this turn — confirmed by this turn's diff stat showing it separately from the `App.tsx` change just made.

## 9. Why each change is necessary

- `isBusinessId` import: `state.committedTo` is typed `string | null` (not `BusinessId`) in `ScannerRunState` — a runtime guard is required before it can be passed to `launchCrisis`, which requires `BusinessId`. Without it, either a type-unsafe cast or a silent wrong-type call would be needed.
- `launchCrisis`/`readCrisis` imports: these are the exact, unmodified Step 13 production functions the experiment exists to exercise — no substitute or mock was created.
- Three state hooks: minimum needed to represent in-flight/error/result for one bridge action; mirrors the existing `committing`/`commitError` pattern already in this file, no new pattern introduced.
- Handler + render block: the only way to trigger `launchCrisis`/`readCrisis` from the real running app, which is the entire point of Step 14A.

## 10. What was deliberately not changed

- Scanner's `scan()`, `select()`, `commit()` — untouched.
- `crisisWriter.ts`, `queuedWrite.ts`, `recommitInvalidation.ts`, all domain files — untouched.
- No navigation library added.
- No Plan code.
- No day-by-day Crisis gameplay UI — the bridge shows only raw `readCrisis` result data, not a Crisis experience.
- No new persistence key or mechanism — the bridge writes/reads only through `CRISIS_KEY` via the existing functions.

## 11. Automated test results

Run fresh this turn:
- `npx tsc --noEmit`: 8 pre-existing errors (all in `__tests__/App.scanner.adversary.test.tsx` / `__tests__/App.test.tsx`, `TS2345` jest-mock signature mismatches, same file/line set as the Step 14 report's baseline). 0 new errors.
- `npx jest`: `Test Suites: 8 passed, 8 total`, `Tests: 136 passed, 136 total`, 0 failed.
- `git diff --stat`: `App.tsx | 58 ++++...`, `src/persistence/queuedWrite.ts | 19 +++...` (pre-existing, not from this turn).

No test currently exercises the new bridge itself (it requires the real app lifecycle, not the Jest mock harness) — this is expected and is exactly what Step 14 proper is for.

## 12. Emulator/install diagnosis

- `adb devices -l`: one device, `emulator-5554`, state `device` (connected, responsive).
- `adb shell getprop ro.build.version.sdk`: `33` (image reports API 33 despite the AVD's "13" label — consistent, not a mismatch: Android 13 = API 33).
- `adb shell pm list packages | grep hustle`: `package:com.hustlecrisisslice` present (the stale Aug 12 install, prior to this turn's reinstall).
- `gradlew.bat assembleDebug` (native build only, no install task): `BUILD SUCCESSFUL in 15s`.
- `adb install -r app-debug.apk` (raw adb, bypassing Gradle's ddmlib install task): `Success`, exit 0.
- Fresh `dumpsys` after: `lastUpdateTime=2026-08-15 20:00:12` — today, confirming the install genuinely landed, not a Gradle-diagnostics false report.

**Diagnosis**: the failure is isolated to Gradle's own `:app:installDebug` task (which calls into `ddmlib`'s `InstallException`/device-transport path) on this machine/AVD. Raw `adb install -r` against the same APK, same device, same session succeeds immediately. **Smallest reliable path to get current source onto the emulator**: `gradlew.bat assembleDebug` (build) + `adb install -r <apk>` (install), never `gradlew.bat app:installDebug`.

## 13. Remaining blockers

None for reaching the app on-device. The one open question is whether Gradle's `installDebug` failure mode is a one-off (Java/ddmlib version, some intermittent adb-server state — recall the same session needed one `adb kill-server`/`adb start-server` cycle earlier for an unrelated hung shell command) or reproducible on a clean re-run; that was not tested (would require deliberately reproducing it a third time, which the Step 14 report already declined to do). Not a blocker for Step 14 execution, since the working alternate path is now established and verified.

## 14. Exact Step 14 execution plan once the bridge is available

The bridge is available now (§7) and the install path is now known-working (§12). Step 14 proper can resume:
1. `cd android && gradlew.bat assembleDebug` (build), then `adb install -r app-debug.apk` (install) — not `gradlew.bat app:installDebug`.
2. Start Metro (`npx react-native start`) so the JS bundle (including this step's `App.tsx` bridge) loads live on-device.
3. `adb shell am start -n com.hustlecrisisslice/.MainActivity` to launch.
4. Drive the real app through: scan → select → commit → tap "Step 14A: launch + read Crisis (bridge)" → observe `crisisBridgeResult` text on-device (screenshot via `adb exec-out screencap -p`).
5. From there, Tests 1–6/8 (process-death via `adb shell am force-stop` + relaunch, corruption injection via `adb shell` + AsyncStorage file edit, recommit-invalidation via a second commit before restart, etc.) become executable through this same bridge, per the original Step 14 test matrix.
6. Test 7 (queue timeout) remains a RUNTIME/TEST-HARNESS LIMITATION regardless of the bridge — `withTimeout()`'s non-cancelling `Promise.race` still cannot be safely triggered without either a slow-storage double or a production-code change, neither authorized here.

## 15. Evidence classification

- [Certain] Two prior `installDebug` failures, their exact error strings, and their logs — read directly this session and in the prior Step 14 turn.
- [Certain] `App.tsx` had zero `launchCrisis`/`readCrisis` calls before this step's edits — grep run this session, zero matches.
- [Certain] `gradlew.bat assembleDebug` succeeded and `adb install -r` succeeded, independently verified via `dumpsys lastUpdateTime` showing today's date — all run and inspected this turn.
- [Certain] `tsc`/`jest` results — run fresh this turn, output inspected directly.
- [Likely] The `installDebug`-specific failure is a `ddmlib`/Gradle-side issue rather than an adb/device issue, given raw `adb install` succeeded immediately after — inferred from the contrast between the two mechanisms against the identical device/APK, not from inspecting Gradle's internals.
- [Guessing] Whether the two `installDebug` failures share a single root cause or are two unrelated intermittent faults — not determined; would need a third `installDebug`-specific attempt (deliberately not run, per the two-failures-same-layer stop rule).
- [Runtime Required] Whether the bridge's `launchCrisis`/`readCrisis` calls behave correctly through the real app lifecycle (Tests 1–8) — not yet exercised on-device; Step 14 proper, not this step, establishes that.

---

## Success criteria check

1. Actual RN runtime seam identified — yes (§4/§5).
2. Minimum Crisis integration bridge defined — yes (§7).
3. Bridge does not redefine application architecture — yes, no navigation/state-machine added (§10).
4. Existing Crisis writer/reader remain authoritative — yes, called unmodified (§9).
5. Scanner remains authoritative for `BusinessId` — yes, bridge reads `state.committedTo`, does not set it (§6.1).
6. No second persistence mechanism introduced — yes (§10).
7. No full Crisis feature implemented — yes, raw result display only (§6.8/§10).
8. Emulator/install path restored — **yes**, via the `assembleDebug` + `adb install -r` alternate path (§12), not via forcing `installDebug` to work.

**A successful Step 14A does not mean Crisis runtime behavior is validated.** It establishes that the bridge exists, is structurally sound, and that a working install path is now known — the actual Gauntlet (Step 14 proper) has not been re-run.

No commit. No push. Stopping here — no Step 15, no full Gauntlet execution this turn.
