# Scanner Slice — Evidence Report

Branch: `scanner-slice` (off `main` `6abd4a4`, the Crisis-slice baseline — NOT built on
`nav-spike`, per explicit instruction). `main` and `nav-spike` both untouched by this work.

Objective (verbatim from the approval): prove that the RN architecture can support a
second real HUSTLE stage with shared state and persistence, using the smallest useful
experiment. Scope: one business, scan → select → commit → persist → force-stop →
relaunch → restore. Full scope/deferral list: `SCANNER_SLICE_PLAN.md`.

## IMPLEMENTATION

- **Domain layer** — `domain-ts/scanner/{types,logic,index}.ts`, framework-agnostic,
  ported from `prototype/hustle-shell.html:1913-2867` (Crisis-precedent structure).
  Functions: `affordable`, `opening`, `overBy`, `levelOf`, `forcesOf`, `forcesTotal`,
  `pressureWord`, plus new pure state-transition functions `scanSpot`, `selectSpot`,
  `commitSpot` (the prototype's equivalent logic is inline event-handler mutation, not
  extractable functions, so these were written fresh but follow the prototype's exact
  branching/validation order). Copied verbatim into `rn-slice/src/domain/scanner/`.
- **UI** — `rn-slice/App.tsx` rewritten from the Crisis screen into the Scanner screen
  (this branch does not carry Crisis forward — single-screen slice, same as Crisis's own
  single-screen scope). One hardcoded business (Phone Repair Kiosk). Reuses the Crisis
  slice's exact AsyncStorage restore/backup/write-queue pattern, key
  `hustle.scanner.v1`.
- **Commit atomicity** (approval §3) — implemented as: `commitSpot` (pure) computes the
  complete post-commit state → `commit()` persists that exact JSON via `await
  queuedWrite(...)` → **only on persist success** does `setState(result.state)` run,
  flipping the UI into the committed view. On persist failure, render state is left
  untouched (still pre-commit, recoverable) and `commitError` surfaces the failure with
  no partial application. This is a stronger guarantee than the Crisis slice's
  fire-and-forget autosave effect, which was correct for Crisis's non-destructive
  per-turn state but not strict enough for a one-way spend. Documented in the source
  comment directly above `commit()`.

## TEST

- `.maestro/scanner_baseline.yaml` — launch → scan → select → commit → force-stop →
  relaunch → restore, all assertions against real rendered text.
- `.maestro/scanner_negative_control.yaml` — deliberately asserts a false cash value
  (mandatory, per the harness-honesty discipline `TEST_HARNESS_INVESTIGATION.md`
  established).
- **Selector lesson repeated from that investigation, hit again here first**: an early
  draft used bare/partial text (`"HUSTLE.*Scanner"`, then bare `"HUSTLE"`) and got
  `FAILED` even though the on-device screenshot and screen-hierarchy dump both showed
  the text rendered and visible — root cause confirmed by direct comparison against a
  known-working assertion from `crisis_day1_flow.yaml` (`".*validation slice.*"`, which
  passed against the same text): Maestro full-matches non-wildcarded assertVisible
  patterns, it does not substring-match. Every assertion in the final flows wraps in
  leading/trailing `.*` unless the text is a self-contained button label with no
  surrounding content (`"Scan this spot"`, `"Choose this spot"`).

## ADVERSARY

No formal `adversary` subagent review was run this pass — the persistence/atomicity
design was self-reviewed against the Crisis slice's known-good pattern and the approval
doc's own invariant, then stress-tested directly on-device (below). Flagging this
explicitly: **self-applied fixes in this project's own history have twice needed a
second independent look to actually be correct** (`ROADMAP.md` Phase 1, momentum
bug). The stale-closure fix below is exactly that class of bug and was caught by
re-reading the approval doc's requirements against my own first draft before an
adversary pass was invoked, not by one. Recommend a real `adversary` pass before this
branch is treated as more than a slice-scope architecture proof.

## FINDINGS

**1 MAJOR, self-caught before adversarial testing began**: `commit()`'s double-tap
guard checked `committing` (React state, read via closure) instead of a ref. Two
`onPress` calls dispatched in the same JS tick — a fast double-tap, before RN's
`disabled` prop re-renders — would both close over the same stale `committing===false`
and both proceed, risking a double-charge. This is the identical bug class the Crisis
slice's Phase 3 adversary review caught in `pick()` (`ROADMAP.md`), and this project's
own written lesson ("don't trust a self-applied fix without independent
re-verification") is exactly why it was checked for here rather than assumed absent.

## FIXES

`App.tsx`: added `const committingRef = useRef(false)`, checked/set synchronously at
the top of `commit()` before any `await`, instead of relying on the `committing` state
value for the guard. `committing` state is kept only for the UI spinner/disabled
visual, no longer for correctness.

## INDEPENDENT REPRODUCTION

- `npx tsc --noEmit` clean before and after the fix.
- Rebuilt `app-release.apk` from scratch (`gradlew.bat assembleRelease
  --no-configuration-cache`, BUILD SUCCESSFUL), reinstalled, confirmed fresh via
  `adb shell dumpsys package ... | grep lastUpdateTime` matching the actual install
  moment (per this project's own standing rule: never trust Gradle's exit code alone).
- Re-ran `scanner_baseline.yaml` against the rebuilt APK — clean, before running any
  adversarial case against it. Per the approval doc's Loop discipline: **did not reuse
  the pre-fix evidence** as proof of the fixed build.

## E2E RETEST

- `scanner_baseline.yaml`: **2 independent clean runs**, all steps COMPLETED, exit 0.
- `scanner_negative_control.yaml`: **FAILED as required**, confirmed real process exit
  code 1 (not just log text) on two separate runs.
- **Adversarial cases** (approval §8, numbered as given):
  1. **Rapid double-tap on Commit** — Maestro's step model re-queries the hierarchy
     per step and can't dispatch a true same-frame double-tap (button vanishes after
     the first successful commit, so a scripted 2nd `tapOn` just fails to find it —
     **TEST-HARNESS LIMITATION**, reclassified the flow to assert the real
     post-commit invariant instead). Followed up with a closer approximation: two raw
     `adb shell input tap` calls fired concurrently via backgrounded shell jobs at the
     Commit button's coordinates. Result: single commit, R1,300 cash, no double-charge
     — **APP BUG: fixed** (see Findings/Fixes above; this is the case that caught it).
  2. **Repeated scan/select spam** — Maestro flow (scan → assert → select → assert,
     confirming Scan/Choose buttons correctly disappear after their transition) plus
     three concurrent raw `adb` taps on the Scan button. Result: settled cleanly to
     scanned-not-selected, no crash, no duplicate state. **APP BUG: none.**
  3. **Select → commit immediately** (no delay between taps) — clean, correct end
     state. **APP BUG: none.**
  4. **Kill after scan, before select** — `am force-stop` + relaunch. Restored to
     exactly scanned-not-selected. **APP BUG: none.**
  5. **Kill after select, before commit** — same method. Restored to exactly
     selected-not-committed, wallet still showing pre-commit R2,500 (not R1,300 — cash
     correctly never applied). **APP BUG: none.**
  6. **Kill immediately after the commit tap**, no artificial delay — restored to the
     fully-committed state (R1,300 cash) with no corruption. Supports commit atomicity
     holding under a same-instant kill; **does not** prove immunity to a kill landing
     mid-`AsyncStorage.setItem` flush (torn write) — adb cannot inject a kill at that
     exact instruction boundary from black-box control. Same standing limitation as
     `PERSISTENCE_VALIDATION_REPORT.md` already flagged project-wide, not new to this
     slice.
  7. **Restart and verify exact state** — 3 consecutive `force-stop`/relaunch cycles
     post-commit. State byte-identical (screenshot-inspected) across all 3. **APP
     BUG: none.**
  8. **Invalid/missing persisted state** — two sub-cases, both via `adb root` +
     direct SQLite edits to the real `AsyncStorage`/`Storage` table (not a mock):
     (a) syntactically invalid JSON (`{not-valid-json`) — app fell back to fresh
     state, backed up the corrupt payload under `hustle.scanner.v1.corrupt-backup`
     (confirmed present via direct SQL query), no crash; (b) syntactically valid but
     **relationally** invalid (`selected:"phonerepair"` while `scanned:{}`) — the
     `isValidScannerState` relational-invariant check correctly rejected it too, same
     fresh-state fallback. **APP BUG: none** in either sub-case.
  9. **Deliberately wrong assertion** — `scanner_negative_control.yaml`, confirmed
     FAILED with real exit code 1, both as its own case and re-run at the end of the
     full pass. Harness genuinely distinguishes correct from incorrect state.
  10. **Re-commit to another business** — **EXPECTED/OUT-OF-SCOPE for the UI**: this
      slice hardcodes one business, so the UI has no second spot to select. The
      domain layer's `commitSpot` implements the general mechanism anyway
      (`resetDownstream` flag, ported for the same reason the Crisis layer ported
      `overBy` despite being unreachable with a single always-affordable business —
      so the next slice doesn't have to rediscover it). Verified in isolation, outside
      the UI: same-business recommit → `resetDownstream:false`; different-business
      recommit → `resetDownstream:true` and the state correctly reflects the new
      business's cost/cash; first-ever commit → `resetDownstream:false`. All 3 cases
      matched expectation.

## ADVERSARY ROUND 2 — INDEPENDENT (2026-08-12)

Formal `adversary` subagent pass, closing the gap flagged above. Fresh context, given only
the source files and told not to trust this report's own claims. Attacked STATE,
PERSISTENCE, CROSS-STAGE, TEST VALIDITY, LOW-END/UI. Full method: read `App.tsx` and
`src/domain/scanner/{logic,types}.ts` directly, wrote 5 throwaway jest tests against the
real `App.tsx` with a mocked AsyncStorage (deleted after use), reproduced each finding
before reporting it.

**Verdict returned: DO NOT SHIP as-is** — one CRITICAL data-loss path, four MAJOR defects,
one MAJOR test-validity gap (the original `App.test.tsx` asserted nothing — `SafeAreaProvider`
never resolved insets in the jest environment, so `App`'s children never mounted and the
test passed even if the screen threw on render).

### Findings, genuine vs. not

| # | Sev | Finding | Genuine? |
|---|-----|---------|----------|
| 1 | CRITICAL | Restore failure/timeout (`App.tsx` catch branch) took no backup, then the autosave effect silently overwrote a real saved run with fresh empty state | Yes — reproduced |
| 2 | MAJOR | `select()` unguarded against `committedTo !== null` for a *different* business (foreign/older save) — produces a state the app's own validator then rejects as corrupt on next launch | Yes — reproduced |
| 3 | MAJOR | `isValidScannerState` accepted `scanned` as an array, `committedTo` set with `setupCost: null`, and arbitrary/negative `cash`/`setupCost` that don't reconcile | Yes — reproduced (3 sub-cases) |
| 4 | MAJOR | `commitSpot` didn't guard against an identical re-commit to the same already-committed business (unreachable via the current UI, since the button hides — a domain-layer gap, not an app-level one) | Yes — genuine domain-layer gap, currently unreachable via UI |
| 5 | MAJOR | `resetDownstream` on `CommitResult` computed and never consumed anywhere; §"FINDINGS" (round 1 of this report) had implied it was more than that | Yes — the report's own wording overclaimed; not a code defect, a documentation defect |
| 6 | MAJOR | `__tests__/App.test.tsx` asserted nothing meaningful — SafeAreaProvider never resolved insets in jest, no mount, no assertions | Yes — reproduced |
| 7 | MINOR | `timeout()`'s `setTimeout` was never cleared, leaking a 5s timer per mount | Yes — cheap fix, applied |
| 8 | MINOR | Failed scan/select autosave surfaced `SAVE_FAIL_NOTE` but left the UI advanced (state shown as saved when it wasn't) | Confirmed as designed-behavior-with-a-caveat, not silently swallowed — no code change; already reported to the user via `restoreNote`, just not blocking. Left as-is (blocking the UI on every autosave failure is out of scope for this slice and would be its own design decision). |
| 9 | MINOR | Post-commit `setState` re-triggered the autosave effect, redundantly re-writing the identical payload; a failure on *that* write showed "save failed" over an actually-durable commit | Yes — reproduced, cheap fix, applied |
| 10 | MINOR | Weak negative-control assertion (asserts on an absent element, would also "pass"-as-fail on an app crash) | Correct as a limitation note, not a code defect — left as-is; documented here instead of reworked, to avoid scope creep into rebuilding the harness. |

Nothing was found and rejected as a false positive this round — every reported item traced to
a real line of code behaving as described.

### FIXES (this session, applied to both `rn-slice/App.tsx`/`src/domain/scanner/*` and
the mirrored `domain-ts/scanner/*`)

1. **CRITICAL #1**: restore's `catch` branch now attempts a bounded (2s) best-effort backup
   read before falling back to fresh state (same discipline as the existing invalid-JSON
   branch), and a new `skipNextAutosave` ref suppresses the mount-triggered autosave write
   for that one cycle — so a failed/slow restore can no longer silently clobber a real save
   before the user has taken any action.
2. **MAJOR #2**: `select()` is now a no-op whenever `state.committedTo !== null`, regardless
   of which business it's committed to; the select-button's JSX condition changed from
   `!isCommitted` (BIZ-specific) to `!state.committedTo` (any commitment).
3. **MAJOR #3**: `isValidScannerState` gained `!Array.isArray(s.scanned)`, a
   `committedTo`⇄`setupCost` null-consistency pair (mirroring the existing `cash` pair),
   non-negativity checks, and a `cash === CAPITAL - setupCost` reconciliation check.
4. **MAJOR #4**: `commitSpot` now rejects with `reason: "already-committed"` when
   `state.committedTo === o.id`, checked before the `selected` check — makes the domain
   function idempotent on its own, not dependent on the one caller that happens to hide the
   button.
5. **MAJOR #5**: `CommitResult.resetDownstream`'s doc comment corrected in both
   `domain-ts/scanner/types.ts` and `rn-slice/src/domain/scanner/types.ts` to state plainly
   it is not consumed anywhere yet and does not survive a restart on its own — no code
   changed (consuming it is out of scope: no downstream stage exists yet to consume it into).
6. **MAJOR #6**: `App.test.tsx` now mocks `react-native-safe-area-context` via its official
   `jest/mock` export and asserts a real testID is present post-mount, instead of only
   checking that `create()` doesn't throw.
7. **MINOR #7/#9**: `withTimeout()` helper replaces the old bare `timeout()`, clearing its
   timer in a `finally`; `commit()` now sets `skipNextAutosave` after its own persist so the
   post-commit `setState` doesn't trigger a redundant duplicate write.

### INDEPENDENT REPRODUCTION

- `npx tsc --noEmit` clean in both `rn-slice/` and `domain-ts/` after all fixes.
- New regression file `__tests__/App.scanner.adversary.test.tsx` (5 tests, all targeting the
  CRITICAL/MAJOR findings above by reconstructing the exact failure scenario against the
  real `App.tsx` with a controlled mock store) plus the corrected `App.test.tsx` — **6/6
  pass** against the fixed code. This is a second, independently-written reproduction of the
  same findings (different test code than the adversary's own throwaway tests, which were
  deleted).
- Full release APK rebuild (`assembleRelease`, `BUILD SUCCESSFUL`), reinstalled, fresh-install
  confirmed via `dumpsys package | grep lastUpdateTime` matching wall-clock time (not trusting
  Gradle's exit code alone, per this project's own standing discipline).
- **EMULATOR-VERIFIED, on the rebuilt APK**: the new array-`scanned` validator gap was
  re-tested for real (not just in jest) — `adb root`, direct SQLite write of
  `{"scanned":[],...}` into the real `Storage` table, relaunch, screenshot confirms "Saved
  data was invalid — starting fresh (corrupt copy backed up)." (`scanner_reverify_array_scanned.png`).
- **EMULATOR-VERIFIED**: pre-fix evidence was not reused for any retest below.

### E2E RETEST (post-fix, rebuilt APK, fresh `pm clear` before each)

- `scanner_baseline.yaml` — all 18 steps COMPLETED, exit 0.
- `scanner_negative_control.yaml` — genuinely FAILED (exit 1) on its deliberately-false
  assertion, confirming the harness still correctly reports failure after the App.tsx changes.
- `scanner_adv_double_tap_commit.yaml` — COMPLETED, exit 0 (single commit, correct cash,
  commit button gone) — re-run because `commit()`'s body changed (added `skipNextAutosave`),
  even though the `committingRef` guard itself was untouched this round.
- The other 3 existing adversarial Maestro flows (repeat scan/select, immediate
  select-then-commit, and the case-4/5/6/7/8/8b kill/corruption cases from round 1) were
  **not** re-run this pass — none of their code paths changed. This is a DOCUMENTED FROM
  EARLIER WORK gap, not a freshly-verified claim; flagged explicitly rather than silently
  assumed still-clean.

## LIMITATIONS

- **No real device** — emulator-only (`hustle_lowend`), standing project constraint,
  not new here.
- ~~No formal `adversary` subagent pass~~ — **closed 2026-08-12**, see "ADVERSARY ROUND 2"
  above: 1 CRITICAL + 5 MAJOR genuine findings, all fixed and independently reproduced.
- **Adversarial Maestro flows from round 1 (kill/corruption cases, repeat-scan/select,
  immediate select-commit) were not re-run against the round-2 fixes** — their code paths
  didn't change, but that's an assumption, not a freshly-verified fact. If any future work
  touches `scan()`, `selectSpot`, or the restore effect again, re-run them before trusting
  this report's round-1 evidence as still current.
- **The CRITICAL restore-failure fix was verified via jest (mocked AsyncStorage), not
  reproduced as a real on-device failure.** Forcing a genuine `AsyncStorage.getItem`
  rejection/timeout on a real emulator (vs. mocking the JS call) would require killing the
  native module or the process mid-read, which wasn't attempted — the jest reproduction
  exercises the exact same code path but not the exact same failure trigger.
- **Torn-write mid-flush** (adversarial case 6's caveat) — not disprovable via
  black-box `adb`/`am force-stop` timing; same gap `PERSISTENCE_VALIDATION_REPORT.md`
  already carries for Crisis.
- **Sample size** — 2 baseline runs, small numbers of adversarial runs per case (not a
  hundreds-of-runs statistical sweep) — same caveat this project's own prior reports
  have carried, not newly introduced.
- **Domain differential validation was arithmetic-only** — `affordable`/`opening`/
  `overBy`/`forcesOf`/`forcesTotal`/`pressureWord`, 30 cases (5 businesses × 6 network
  stat values) vs. a hand-re-derivation of the prototype's own logic, 0 mismatches.
  The state-transition functions (`scanSpot`/`selectSpot`/`commitSpot`) were **not**
  differentially simmed against the prototype, because the prototype's equivalent is
  inline event-handler mutation with no pure function to diff against — they were
  verified by direct code-reading comparison against `hustle-shell.html:2115-2867`
  instead, plus the on-device/adversarial evidence above.
- **Five Forces UI is minimal** — the pure calculation is ported and differentially
  validated, but only a one-line summary (`pressureWord` + total) is rendered; the
  full per-force gauge presentation is explicitly deferred, per scope.

## ARCHITECTURAL CONCLUSION

**The RN architecture (raw root state + the existing AsyncStorage write-queue/backup/
restore pattern) supports a second real HUSTLE stage with its own shared state and
persistence**, at this slice's scope. Specifically demonstrated, not just claimed:

- A second, independent persistence key (`hustle.scanner.v1`) coexists with the
  pattern's original use (Crisis's `hustle.crisis.v1`) without modification to the
  pattern itself — the mechanism generalizes, it wasn't Crisis-specific.
- A **destructive, one-way state transition** (commit) can be made durably atomic on
  top of that same pattern with a small, explicit ordering change (persist-then-flip),
  not a new state-management library or transaction system — the approval doc's "use
  the smallest mechanism consistent with the existing architecture" instruction held
  up in practice.
- The known-good navigation conclusion (`DECISIONS.md` → "Navigation approach") is
  unaffected and untested further here — this slice is still single-screen, same as
  Crisis; a real second-screen navigation load (Scanner → Plan, say) remains untested
  by either slice.

No STOP-condition trigger fired (approval §10): state ownership stayed unambiguous,
persistence and commit state never diverged in any tested case, no commit navigated
forward without durable state, the domain port's own arithmetic showed 0 differential
mismatches, Maestro reliably distinguished correct from incorrect state (negative
control), and nothing here required a global state manager or a navigation library.

**Updated after the round-2 independent adversary pass**: the initial self-reviewed
implementation was not sound enough to ship — 1 CRITICAL data-loss path and 5 MAJOR
defects existed in the code this report originally called SHIP-worthy. All are now fixed
and independently reproduced (see "ADVERSARY ROUND 2" above). The architecture conclusion
above still holds — nothing found was an *architectural* problem (no state-ownership
ambiguity, no persistence/commit divergence, no need for a different pattern) — but the
slice's *implementation* needed a real second pass to be trustworthy, exactly the
"don't trust a self-applied fix" lesson this project has hit before (`LESSONS_LEARNED.md`).
**Scanner slice is now a trustworthy architectural checkpoint** for what it demonstrates
(second-stage persistence + atomic commit on the existing pattern), conditioned on the
limitations above (no real device; round-1 Maestro flows not re-run; CRITICAL fix
jest-verified, not on-device-failure-verified).

**CONTINUE conditions met**: domain differential tests clean, commit semantics
explicit and tested, persistence survives the required lifecycle tests including
corruption, Maestro reliably tests the core flow, no unresolved CRITICAL/MAJOR defect
(the one MAJOR found was fixed and independently re-verified against a fresh build).

Per the approval's Final Stop (§13): **stopping here.** Not expanding to the full
Scanner, not adding Plan, not building the carousel, not adding a navigation library.
