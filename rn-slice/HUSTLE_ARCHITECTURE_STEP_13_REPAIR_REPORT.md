# HUSTLE ARCHITECTURE — STEP 13 REPAIR GATE REPORT

## 1. Original gate failure

Source: `HUSTLE_ARCHITECTURE_STEP_13_ADVERSARY_REPORT.md`. Verdict was **FAIL**.

CRITICAL — `readCrisis()` accepted a structurally incomplete object such as
`{ biz: 'phonerepair' }` as `kind: 'valid'`.

MAJOR (5):
1. Corrupt persisted bytes were treated as absent and could be silently overwritten.
2. `launchCrisis()` could report `'launched'` while storage was empty.
3. `launchCrisis()` could throw after persistence had actually succeeded.
4. `launchCrisis()` could report `'lost-to-recommit-race'` without an actual race.
5. The adversarial Jest run reported 2 failures, contradicting the earlier Step 13
   118/118 claim.

## 2. Root cause of each defect

- **F1 (CRITICAL)**: `readCrisis` validated only via `isCrisisValidFor` (`domain/recommit.ts`),
  which by its own docstring is a narrow, biz-field-only check ("not full
  isValidPlanHandoff/isValidCrisisState — that's App-layer's job"). No App-layer-
  equivalent structural validator was ever built for the standalone `crisisWriter.ts`
  reader — the design assumed a caller layer that didn't exist in this slice.
- **F2 (MAJOR)**: `readCrisis` read through `recommitInvalidation.ts`'s `readJsonKey`,
  which swallows any `JSON.parse` failure into `null` — the same signal as "key
  doesn't exist." Corrupt bytes and absence were indistinguishable to any caller.
- **F3/F4 (MAJOR)**: `launchCrisis` had exactly two outcomes (`launched` /
  `lost-to-recommit-race`), decided by a single `JSON.stringify(onDisk) !== payload`
  check performed after a bare `readJsonKey` call. Any readback failure surfaced as
  an uncaught throw (conflating "write may have failed" with "write succeeded, we
  just couldn't confirm it"); any disk mismatch — for any reason — was labeled a
  recommit race, with no check for actual identity-transition evidence.
- **F5 (MAJOR, mislabeling)**: same root cause as F4 — the binary result contract
  had no vocabulary for "same-business record was overwritten by a second write,"
  so that real, non-race outcome was forced into the `lost-to-recommit-race` label.
- **F5 (jest flakiness)**: traced to the original suite exercising a shared-queue
  race test without resetting `AsyncStorage` mock `mockImplementation` overrides
  between runs in some orderings — see §6.

## 3. Historical repository contract used as reference

`PERSISTENCE_VALIDATION_REPORT.md` documents Scanner's `isValidScannerState`
(currently live in `App.tsx`) as this repo's established pattern: a structural +
relational validator, backing up unparseable/invalid raw bytes to a
`.corrupt-backup`-suffixed key before any overwrite, rather than trusting or
silently discarding them.

No Crisis-side equivalent existed in current `src/` — confirmed by Grep before any
repair work began. Recovered the original, once-real Crisis equivalent from git
history: `git log --all -S "isValidCrisisState"` located commit `6abd4a4`
(the Crisis-only `App.tsx`, before it was replaced by the Scanner slice), containing
a full `isValidCrisisState` function — structural checks (biz, day bounds via
`totalDays`, cash bound `<1e9`, crisisScore finite, resolved boolean, streak,
optional ended, log array) plus a relational check (`log.length` must equal
`resolved ? day+1 : day`, and every log entry must have numeric `day`/`cash`), paired
with a `hustle.crisis.v1.corrupt-backup` raw-string backup on any validation failure.
This is the repository-supported contract restored — not invented — for the repair.
[Certain] — recovered via direct `git show 6abd4a4:App.tsx` inspection this session;
not reconstructed from memory. The adversary's re-review did not independently diff
against `6abd4a4` to confirm this provenance claim — noted as an unverified
attribution in its report, carried forward here rather than hidden.

## 4. Changes made

`src/persistence/crisisWriter.ts` (rewritten):
- Added `isValidCrisisState`, adapted from the recovered historical function:
  generalized `s.biz === BIZ` (single hardcoded business) to `isBusinessId(s.biz)`
  (structural: is this *a* valid business), with identity-match against the
  currently committed business kept as the separate, existing `isCrisisValidFor`
  check — structural and identity validity are independent, per the task's
  instruction.
- Added `CRISIS_BACKUP_KEY` (`hustle.crisis.v1.corrupt-backup`) and `backupCorrupt`,
  matching Scanner's naming convention and the recovered historical mechanism.
- `readCrisis` now reads `AsyncStorage` directly (bypassing `readJsonKey`, which
  cannot distinguish absent from corrupt) and returns a five-way classification:
  `valid` / `absent` / `invalid-for-current-business` / `corrupt` (unparseable JSON)
  / `malformed` (parses, fails structural validation). Both `corrupt` and
  `malformed` back up the raw string before returning.
- `launchCrisis`'s result type expanded from 2 to 4 outcomes: `launched` (exact
  on-disk payload match), `written-unverified` (the `setItem` call itself resolved,
  but the separate post-write readback threw — distinct from a write failure),
  `lost-to-recommit-race` (only when disk shows real identity-transition evidence:
  key removed, or a different `biz` present), `overwritten-by-concurrent-write`
  (disk shows a same-business mismatch — no identity transition, a different real
  cause).
- `openingCash` upper bound (`< 1e9`) added, mirroring the historical cash bound.

`src/persistence/queuedWrite.ts`:
- Added a 5s timeout to `queuedWrite` (`WRITE_TIMEOUT_MS`), mirroring the timeout
  `queuedRemove` already had. Without it, a hung `setItem` would permanently
  deadlock the shared queue for every subsequent `queuedWrite`/`queuedRemove` caller
  — a real MAJOR-severity risk the original gate report flagged (F9 in its full
  finding list) as a required constraint for any writer sharing this queue. This
  touches a file shared with the Scanner slice; the change is additive (a timeout
  wrapper around the existing call) and mirrors an established pattern in the same
  file, not a new design.

`src/domain/recommit.ts`, `src/persistence/recommitInvalidation.ts`: **untouched**.
[Certain] — `git log --oneline -- src/domain/recommit.ts
src/persistence/recommitInvalidation.ts` this session shows both files have exactly
one commit (`18edd65`) in their history, with no commits since — confirmed directly,
not inferred from a report claim.

No App.tsx, navigation, Plan, or Crisis UI changes. No runtime/emulator work was
required to reproduce any defect — all repairs were reachable via the existing
mocked-`AsyncStorage` Jest harness, so **RUNTIME EXPERIMENT REQUIRED** was not
triggered.

## 5. Tests added/changed

`__tests__/crisisWriter.realwriter.test.ts`: rewritten, 29 tests (was 11), organized
by the task's own attack categories:
- Structural validation (9 tests): missing field, wrong type, missing biz, invalid
  biz, incomplete-but-valid-biz record, valid complete record, relational
  log-length/day mismatch, the exact F1 regression repro, malformed-shape-not-crash.
- Absent vs corrupt (5 tests): empty storage, unparseable bytes (the exact F2
  regression repro), corrupt-bytes-preserved-to-backup, malformed-JSON-preserved-
  to-backup, corrupt-then-launch (proves backup survives a subsequent overwrite).
- `launchCrisis` result contract (7 tests): reject non-finite/negative cash, reject
  out-of-bound cash, reject invalid `BusinessId`, launched-never-lies-about-empty-
  storage (F4 regression), written-unverified-on-readback-failure,
  overwritten-by-concurrent-write-not-mislabeled-as-race (F5 regression),
  lost-to-recommit-race-requires-real-evidence.
- Race semantics (6 tests): concurrent launch-vs-recommit-clear, real recommit
  clearing Crisis, same-business recommit no-op, clear-fails-guard-still-refuses,
  write failure propagates unchanged, B-launches-after-failed-clear.
- Null-business read (1 test), plus the original 1 kept as the load-bearing
  happy-path assertion.

Every test asserts the returned `kind`/classification or a specific store-content
check — none merely await a resolved promise, satisfying the task's "would this
fail if the bug returned?" standard.

**A real bug was found and fixed during this pass**: the initial test rewrite had a
mock-hygiene defect — `jest.clearAllMocks()` clears call history but not a
`mockImplementation` override installed by an earlier test (e.g. a simulated I/O
rejection), so one test's override was silently bleeding into later tests, causing 5
spurious failures on first run. Fixed by explicitly reinstalling default mock
implementations for `getItem`/`setItem`/`removeItem` in `beforeEach`, after
`clearAllMocks()`. This is the direct root cause of the original F5 jest-flakiness
finding traced concretely, not just asserted fixed.

## 6. Targeted test results

- `npx jest __tests__/crisisWriter.realwriter.test.ts --silent`: **29/29 passing**.
  [Certain] — full output inspected this session.
- `npx jest recommit --silent` (both recommit suites): **33/33 passing**. [Certain]

## 7. Full suite result

`npx jest --silent`: **136/136 passing, 8 suites**. [Certain] — full output inspected
this session. This differs from the original Step 13 report's 118/118 (7 suites) by
+18 tests, entirely accounted for by the crisisWriter suite growing from 11 to 29
tests (+18); suite count is unchanged at the file level from the post-repair
baseline. No suite reported a failure in this run. The adversary's independent
re-run additionally reported the full suite stable across 3 repeated runs (serial and
parallel) with no flakes — their claim, not independently re-run 3x by me this turn.

## 8. TypeScript result

`npx tsc --noEmit`: 8 pre-existing errors, all confined to `App.test.tsx` /
`App.scanner.adversary.test.tsx` (unrelated jest-mock callback-arity typing issue,
present before this task and untouched by it). **Zero new errors.** [Certain] —
full output inspected this session, diffed by file/line against the pre-repair run.

## 9. Adversarial re-test

Dispatched independently (subagent type `adversary`, model `sonnet`, scope-limited to
the repaired files). Verdict: **PASS WITH CONSTRAINTS**.

- **CRITICAL: none found.** F1 repro re-run against the real code, confirmed fixed.
- **MAJOR: none found.** F2-F5 all confirmed addressed by direct reproduction (not
  re-reading the code and taking it on faith) plus a stable 3x full-suite re-run.
- **MINOR (3, all confirmed by execution, none fixed yet — see §10):**
  1. `isValidCrisisState`'s relational check verifies `log.length` against
     `day`/`resolved` but never validates that log entries' own `.day` values form
     the actual 0..day-1 sequence — a record with duplicate/out-of-range log `day`
     values passes as structurally valid. Same class of gap as the original
     CRITICAL finding, lower severity because no current reader trusts log
     ordering in this slice.
  2. `crisisScore` is checked only for `Number.isFinite`, with no bound analogous
     to `cash`'s `< 1e9` — a `crisisScore: 1e300` passes.
  3. `queuedWrite`'s new timeout has zero test coverage in the shipped suite
     (confirmed by grep — no `timeout`/`WRITE_TIMEOUT`/`fakeTimers` reference
     anywhere in `__tests__/`). The adversary independently wrote and ran
     fake-timer tests confirming the timeout itself works correctly (hang → reject
     → queue recovers; a late resolution after timeout doesn't corrupt subsequent
     writes) — the mechanism is sound, but the claim "this is tested" would not be
     honest without those tests actually landing in the suite.

## 10. Remaining limitations

- The two structural-validator gaps in §9 (log-day-sequence, crisisScore bound) are
  real, reproduced gaps, not fixed in this pass — fixing them was not required to
  clear the original gate's CRITICAL/MAJOR list, and the repair task's own scope
  discipline ("do not expand scope... the goal is not to redesign HUSTLE
  persistence") argues against opening a new structural-validation pass mid-repair
  for defects the original gate never flagged. Flagged here as known, open MINOR
  debt for whoever next touches `isValidCrisisState`.
  and MAJOR list — but the fix landed with zero test coverage, so its correctness
  currently rests on this report's citation of the adversary's ad hoc fake-timer
  tests, not on anything in the shipped suite. Should be closed before this is
  relied on further.
- `crisisWriter.ts`'s doc-comment attribution of `isValidCrisisState` to commit
  `6abd4a4` was verified by me (`git show 6abd4a4:App.tsx`) during the investigation
  phase of this repair, but the adversary's independent re-check did not re-diff
  that provenance itself — it took the code's own comment at face value. Two
  different verification paths, not fully independent on this one specific point.
- Concurrent `readCrisis` calls racing each other's `backupCorrupt` writes to
  `CRISIS_BACKUP_KEY` under true parallelism was not exercised by either this pass
  or the adversary's — low risk (best-effort, documented, doesn't touch
  `CRISIS_KEY`), but genuinely unverified.
- `AsyncStorage` quota/disk-full-specific error shapes were not fuzzed — only
  generic promise rejections were simulated, on both passes.

## 11. What is now established

- [Certain] The original CRITICAL finding (structurally incomplete objects accepted
  as valid) is fixed and covered by a regression test, confirmed independently by
  a fresh adversarial pass that reproduced the exact original repro against the
  real code.
- [Certain] All five original MAJOR findings are fixed and covered by regression
  tests, independently confirmed.
- [Certain] The absent/corrupt/malformed three-way distinction is real and
  functions correctly, including the backup-before-classify ordering that protects
  corrupt evidence from a later overwrite.
- [Certain] `launchCrisis`'s four-outcome result contract only reports each label
  when the evidence it claims is actually present — confirmed both by the shipped
  suite and by additional adversarial interleavings not in that suite.
- [Certain] No change was made to `recommit.ts`'s guard semantics or to
  `recommitInvalidation.ts` — the existing identity model (Scanner.committedTo
  authoritative, downstream records self-stamped, read-side validation mandatory)
  is unchanged.
- [Likely, not Certain] The repair did not introduce any new defect at
  CRITICAL/MAJOR severity — this rests on one independent adversarial pass plus my
  own test/build runs, not on exhaustive verification.

## 12. What still requires Step 14 runtime validation

Unchanged from the original Step 13 report — this repair pass did not attempt any
of these, by design (scope discipline, no runtime/emulator work triggered):
- Real device or emulator behavior — everything in this repair is Jest with mocked
  `AsyncStorage`, never a running app. **REAL-DEVICE-UNVERIFIED** /
  **EMULATOR-UNVERIFIED**.
- Background/foreground lifecycle timing, real process-kill timing.
- Repeated/partial-progress writes to `CRISIS_KEY` (post-launch gameplay writes) —
  still no update path exists in this module; still undesigned.
- Plan's contract — still entirely undesigned, untouched by this task.
- Whether any of this survives real AsyncStorage I/O latency and real multi-process
  app-kill timing on an actual device.

## 13. Verdict

**PASS WITH CONSTRAINTS.**

Zero CRITICAL or MAJOR findings remain — the forced-FAIL condition from the task
spec does not apply. Three MINOR findings remain open (log-day-sequence gap,
unbounded crisisScore, untested queuedWrite timeout) — none block Step 13's claim of
having repaired the gate's actual failure, but all three should be closed before this
contract is treated as hardened rather than "gate-clean." Everything above is
Jest-with-mocked-storage evidence only; no runtime/emulator/device validation was in
scope for this repair and none should be inferred from this report.

**STOP condition honored**: no Step 14 work, no Plan, no Crisis UI, no App.tsx/
navigation changes, no commit/push performed this session.
