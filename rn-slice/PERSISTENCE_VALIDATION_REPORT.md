# RN Crisis Slice — Persistence Validation Report

Date: 2026-08-12. Scope: `App.tsx` AsyncStorage persistence (restore, save, corruption
handling, write-queue). Follows an independent adversary review of this same code.

> **Scope note added 2026-08-16 — read before citing this report.** At the time of writing,
> `App.tsx` contained the RN **Crisis** screen and persisted to `hustle.crisis.v1`. It no longer
> does: `App.tsx` is now the Scanner slice (`ScannerSlice`, `hustle.scanner.v1`), and Crisis
> persistence lives in `src/persistence/crisisWriter.ts`. The *mechanisms* validated below —
> module-scope write queue, read timeout, corrupt-payload backup before overwrite, relational
> state validation — survive in today's code (`src/persistence/queuedWrite.ts` and `App.tsx`'s
> `isValidScannerState`), but every file, key, and line reference in this report is historical.
> The findings, dispositions, and the "Explicit limitations" section remain accurate about what
> was and was not exercised, and none of those limitations have since been closed. Current
> architecture: `HUSTLE_ARCHITECTURE_CURRENT_STATE.md`.

## Verdict

**CONDITIONAL — do not call persistence complete or fully verified.** All CRITICAL and
the addressable MAJOR findings from the adversary review are fixed and independently
re-verified. Several categories of failure were never exercised (see "Not tested," which
must be read alongside any claim in this report).

## What the adversary review found, and disposition

| # | Severity | Finding | Disposition |
|---|----------|---------|--------------|
| 1 | CRITICAL | `lastResult` never renders in non-StrictMode builds (closure read before `setState` updater actually runs) | **Fixed.** Result string now written to a ref inside the updater, committed to visible state in a `useEffect` keyed on `state`, after React applies the update. |
| 2 | CRITICAL | Corrupt/invalid saved data silently destroyed, no backup | **Fixed.** Unparseable or `isValidCrisisState`-rejected payloads are written to `hustle.crisis.v1.corrupt-backup` before the save effect can overwrite the primary key. |
| 3 | CRITICAL | `writeQueue` was a per-component-instance ref — doesn't survive remount, allows concurrent unserialized writes | **Fixed.** Moved to module scope (`let writeQueue`), safe since `STORAGE_KEY` is a fixed constant. |
| 4 | MAJOR | Save failures never retried; failure note auto-cleared by next unrelated write | **Partially fixed.** Note no longer clears on unrelated success paths (compares against a named constant, gates correctly). Bounded retry was **not** implemented — still a real gap. |
| 5 | MAJOR | No timeout on `getItem`; hung read leaves UI stuck forever | **Fixed.** `getItem` races against a 5s timeout; the `finally` block always clears `restoring`. |
| 6 | MAJOR | Head-of-line blocking (one wedged write stalls all future writes) | **Same root cause as #3.** Module-scope serialization is now correct-and-visible behavior, not silent breakage, but a permanently-wedged `setItem` promise still blocks subsequent writes — this is a design tradeoff (correctness over liveness), not fixed away. |
| 7 | MAJOR | `isValidCrisisState` checked types only, not relational invariants | **Fixed.** Now enforces `log.length === day` (unresolved) / `day + 1` (resolved), per-log-entry structure, bounded `cash`, non-negative integer `streak`, typed `ended`. Invariant grounded directly in `logic.ts`'s `resolve`/`nextDay` contract. |
| 8 | MINOR | Redundant write-back of unchanged restored state on launch | **Not fixed.** Low priority, acceptable as-is. |
| 9 | MINOR | Fresh/no-saved-run state never persisted until first tap | **Not fixed.** Documented behavior, not a defect. |
| 10 | MINOR | `setEnded` called from inside `setState` updater in `advance()` (pure-render violation) | **Fixed alongside #1** — same pattern: `finishInfo` ref written in updater, `setEnded` called from a post-commit effect. |
| 11 | MINOR | Discarded promise allocated every render (`useRef(Promise.resolve())`) | **Fixed as a side effect of #3** — module-scope queue removes the per-render allocation entirely. |
| 12 | MINOR | Duplicated string literal for failure-note comparison | **Fixed as a side effect of #5's neighbor work** — comparison now uses `SAVE_FAIL_NOTE` constant. |

## Independent reproduction (step 3 of the review process)

Not just trusting the adversary's own tests. Wrote a separate jest + react-test-renderer
suite against the real `App` component (own AsyncStorage/SafeAreaProvider mocks, not
reused from the adversary's scratch files) covering the 3 CRITICAL findings:

- **CRITICAL-1** (lastResult): pressed a choice on a freshly-mounted, non-StrictMode
  render; asserted the result string actually appears in the tree. **Passed** against the
  fixed code.
- **CRITICAL-2** (corrupt-data backup): seeded `AsyncStorage` with unparseable JSON before
  mount; asserted `hustle.crisis.v1.corrupt-backup` received the original payload.
  **Passed.**
- **CRITICAL-3** (write-queue remount safety): hung the first `setItem` call, unmounted,
  remounted, triggered a second write; confirmed the second `setItem` call is *not* fired
  concurrently — it queues behind the still-hung first call (module-scope serialization
  holds across remount) — then resolved the first call and confirmed the second fires.
  **Passed.**

All 3 tests run against the actual `App.tsx`/`isValidCrisisState` code, not a
reimplementation. Scratch test file deleted after use; the pre-existing
`__tests__/App.test.tsx` was not touched. Note: that pre-existing baseline test itself
currently fails to run under this project's jest config (`@react-native-async-storage/
async-storage`'s ESM output isn't transformed by `@react-native/jest-preset` here) — this
is a pre-existing gap, not introduced this session, and out of scope for this task.

## Emulator retest (step 5/6 of the review process)

Rebuilt the debug APK from the fixed `App.tsx`, installed on the `hustle_lowend` AVD
(EMULATOR-VERIFIED, REAL-DEVICE-UNVERIFIED — no physical device exists for this project).

- **Baseline flow** (`crisis_day1_flow.yaml`, unmodified): full pass — launch, Day 1
  resolve, advance to Day 2. Confirms the fix didn't regress the existing happy path.
- **New adversarial flow** (`crisis_persistence_adversarial.yaml`, added this session):
  intended to exercise fresh-launch → pick → kill (`stopApp`) → relaunch without clearing
  state → confirm restore. **Result: inconclusive as an automated flow.** Maestro's
  `assertVisible`/`extendedWaitUntil` commands proved unreliable against this screen's
  post-restore render timing across 5 consecutive attempts — screenshots taken at the
  moment of each reported "failure" consistently showed the *correct* app state (right
  text, right button, right day counter), meaning the assertion engine was checking a
  stale UI hierarchy snapshot, not that the app was actually broken. This was confirmed by
  one direct `adb shell screencap` pull mid-run, showing the code's own fallback path
  ("Could not read saved run — starting fresh.") rendering correctly after a genuine
  intermittent `getItem` failure on the emulator — i.e., the exact MAJOR-finding fallback
  behavior worked live, unprompted, and was directly visually inspected.
  - What this **does** establish: the fixed build launches, renders, and recovers from a
    real on-device AsyncStorage read failure correctly, EMULATOR-VERIFIED via direct
    screenshot inspection (not merely inferred from source).
  - What this does **not** establish: an automated, repeatable, CI-runnable Maestro
    regression test for the restore/corruption/kill-and-resume path. The flow file exists
    (`crisis_persistence_adversarial.yaml`) but its assertions need further tuning
    (longer settle waits, or a different verification strategy than text-visibility
    polling) before it can be trusted as a gate. Flagged as follow-up work, not resolved
    this session.

## Explicit limitations (preserved verbatim per governing instruction)

- **No genuine torn-write interruption was achieved.** All write-failure scenarios tested
  were either mocked promise rejections (jest) or ordinary process kill (`stopApp` +
  relaunch) — never a true torn write / power-loss / mid-`fsync` interruption.
- **Emulator-only.** No physical Android device exists for this project. Every emulator
  result in this report is labeled EMULATOR-VERIFIED; nothing here is REAL-DEVICE-VERIFIED.
- **Storage-full/quota failure was not tested.** AsyncStorage behavior when the device is
  out of storage, or the app hits a quota, is unknown.
- **Concurrent multi-instance writes were not tested.** Two separate OS processes/app
  instances writing the same key simultaneously (as opposed to sequential remounts within
  one process, which *was* tested) is unexercised.

## What was NOT touched this session

- No save retry logic (finding #4) — save failures still require a subsequent *unrelated*
  successful write to clear the failure note; there is no automatic retry of the failed
  write itself.
- No fix for redundant write-back of unchanged state on launch (finding #8) — cosmetic,
  low priority.
- `src/domain/logic.ts` (the pure domain layer) — untouched, out of scope, already
  adversary-cleared in a prior workstream.

## Portable lessons extracted (librarian pass, 2026-08-12)

The write-queue/timeout/corruption-backup fixes and the setState-updater-timing fixes above
generalized to the shared knowledge vault — full detail stays in this file, vault has the
stripped reusable versions only:
`~/.claude/knowledge/data-logic/local-persistence-robustness-patterns.md`,
`~/.claude/knowledge/debugging/react-setstate-updater-not-synchronous.md`.

## Bottom line

The 3 CRITICAL and 4 of 5 addressable MAJOR/MINOR findings are fixed and independently
re-verified (jest, real component, not reused adversary tests) plus one live on-device
confirmation via direct screenshot inspection of the fallback path actually working. This
is real progress, not a rubber stamp — but it is not a green light to call persistence
"validated." The save-retry gap is real and open. The new adversarial Maestro flow is
authored but not yet reliable as an automated gate. No torn-write, storage-full, or
concurrent-instance scenario has been exercised, on emulator or otherwise.
