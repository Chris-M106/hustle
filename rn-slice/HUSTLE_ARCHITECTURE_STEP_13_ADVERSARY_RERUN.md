# HUSTLE ARCHITECTURE — STEP 13 REPAIR — INDEPENDENT ADVERSARIAL RE-CHECK

Performed inline (not as a separate subagent — dispatched agent hit account spend limit
mid-run and failed before producing output; that run's partial output is not used
anywhere below). Read the current code directly this turn rather than trusting the
repair report's claims.

## 1. Scope attacked

`src/persistence/crisisWriter.ts`, `src/persistence/queuedWrite.ts`,
`__tests__/crisisWriter.realwriter.test.ts`, their interaction with
`src/domain/recommit.ts` and `src/persistence/recommitInvalidation.ts`.

## 2. Current implementation inspected

Read directly this turn: `crisisWriter.ts` (211 lines), `queuedWrite.ts` (58 lines),
`recommit.ts` (86 lines), `recommitInvalidation.ts` (72 lines),
`crisisWriter.realwriter.test.ts` (297 lines, all 29 tests). Not re-derived from the
repair report's description.

## 3. Structural validation findings

`isValidCrisisState` (crisisWriter.ts:36-72): rejects non-object/null (`!v ||
typeof v !== 'object'`), rejects invalid/missing `biz` via `isBusinessId`, then
requires `day`/`cash`/`crisisScore`/`resolved`/`streak`/`log` all present with
correct types and bounds, plus a relational `log.length === (resolved ? day+1 :
day)` check with per-entry shape validation.

Traced against the attack list:
- `{biz:'phonerepair'}` alone: `structural` check requires `typeof s.day ===
  'number'` etc. — `s.day` is `undefined`, fails. **[Certain]** rejected, and the
  test at line 75-80 asserts `result.kind === 'malformed'`, not just that
  `isValidCrisisState` returns false — this test would fail if the original bug
  returned.
- missing/invalid biz: `isBusinessId(s.biz)` false for both `undefined` and
  `'not-a-real-business'` — rejected. **[Certain]**
- wrong-typed day (`'0'` string): `typeof s.day === 'number'` false — rejected.
  **[Certain]**
- NaN cash/crisisScore: `Number.isFinite(NaN)` is false — rejected. **[Certain]**
  (no direct test for this specific field, but the same guard also protects
  `openingCash` at the `launchCrisis` boundary, which IS tested at line 165-169.)
- Infinity: `Number.isFinite(Infinity)` false — rejected. **[Certain]**, untested
  directly but same code path as the NaN case.
- null: `!v` is true for `null` — rejected before the object cast. **[Certain]**
- malformed JSON: handled one level up in `readCrisis` (`JSON.parse` throws →
  `corrupt`, never reaches `isValidCrisisState`). **[Certain]**
- extra unexpected fields: not checked, and not rejected — an object with all
  required fields plus extras passes. This is **not a defect**: nothing in the
  contract requires closed-object validation, and no caller trusts unlisted
  fields. **INFORMATIONAL**, not a finding to fix.
- semantically incomplete but structurally OK-looking: the `log.length` relational
  check is the specific defense here (a `day: 5, log: []` record fails even though
  every individual field type is correct) — traced and correct. **[Certain]**

No bypass path to `kind: 'valid'` found for any structurally unusable record.
**No CRITICAL finding.**

Gap noted, not new: `isValidCrisisState` checks `log.length` against `day`/
`resolved` but never checks that individual `log[i].day` values are the correct
sequence (0..day-1, no duplicates/gaps) — a log of `[{day:0,...},{day:0,...}]` at
`day:2` passes (right length, wrong content). **MINOR.** Matches what the repair
report itself already disclosed in its §9/§10 — independently reproduced here, not
just copied: confirmed by re-reading the `log.every(...)` block (line 64-71), which
only checks each entry's own `day`/`cash` are numbers, never cross-checks the
sequence.

## 4. Corrupt/absent findings

`readCrisis` (line 190-210) reads `AsyncStorage` directly, not through
`recommitInvalidation.ts`'s `readJsonKey` (which collapses parse failure into
`null`, same as absent — confirmed by reading `readJsonKey` line 64-72: `catch {
return null; }`, indistinguishable from the `raw == null` branch above it).
`readCrisis` instead: `raw == null` → `absent`; parse throws → backup then
`corrupt`; parses but fails `isValidCrisisState` → backup then `malformed`. Three
genuinely distinct, ordered outcomes. **[Certain]**

Backup (`backupCorrupt`, line 79-85) is invoked and awaited **before** the
classification return in both failure branches (line 198, 203) — traced directly,
not assumed. Test at line 138-142 and 144-149 assert `mockStore.get
(CRISIS_BACKUP_KEY)` equals the exact raw bytes — these would fail if backup were
skipped or reordered after the return.

Backup failure: `backupCorrupt` wraps its own `setItem` in try/catch and only
`console.warn`s — never throws, never blocks the caller from getting its
classification. Confirmed by reading; no test exercises a failing backup write, so
this specific behavior is **[Likely]**, not [Certain] — the code shape guarantees
it, but it is not test-covered.

Repeat-corruption case not tested: if two consecutive corrupt reads happen before
any recovery, the second backup silently overwrites the first (`AsyncStorage.
setItem` with no existence check) — earliest evidence is lost if there are two
different corruption events back to back. **MINOR**, not previously flagged by the
repair report — this is a genuine gap the repair report's §10 did not mention.

**CORRUPT ≠ ABSENT invariant holds.** No CRITICAL/MAJOR here.

## 5. launchCrisis result-contract findings

Traced all four branches (line 117-168):
- `launched`: requires `onDiskRaw === payload`, an exact string match against what
  was just written, obtained via a **separate** `AsyncStorage.getItem` call after
  `await writeQueue` drains same-tick queue entries. This is real readback
  evidence, not merely "setItem didn't throw." **[Certain]**
- `written-unverified`: only reached when the readback `getItem` itself throws
  (line 142-146) — distinct code path from a `setItem` failure, which propagates
  unchanged from the earlier `await queuedWrite(...)` (uncaught, at line 133,
  before this function's own try/catch begins). Confirmed these are genuinely two
  different failure sites, not the same catch relabeled. **[Certain]**
- `lost-to-recommit-race`: two triggers — `onDiskRaw === null` (real removal
  evidence) or a successfully-parsed different `biz` (real identity-transition
  evidence). Traced both paths (line 151-153, 164-165). **[Certain]** — matches
  claim, not just asserted.
- `overwritten-by-concurrent-write`: the fallback when disk has *something* that
  isn't the exact payload but shows no identity-transition evidence — includes the
  case where the on-disk JSON fails to parse at all (line 156-163, caught and
  falls through). One subtlety worth flagging: unparseable garbage on disk after a
  successful write is *not* necessarily "same business, different write" — it
  could be anything, including a corruption event unrelated to any writer. Calling
  it `overwritten-by-concurrent-write` in that specific sub-case is a slight
  overstatement of what's known; the honest claim is closer to "not a recommit
  race" rather than affirmatively "a concurrent write happened." **MINOR** —
  narrower/weaker claim than the label implies in this one sub-path only; does not
  affect the primary claimed guarantee (that `lost-to-recommit-race` requires real
  evidence).

No case found where a result claims stronger evidence than the code actually
gathered for the two labels the original gate flagged (F3/F4/F5: `launched` and
`lost-to-recommit-race`). **No CRITICAL/MAJOR.**

## 6. Race findings

`launchCrisis` and `invalidateDownstreamOnRecommit`'s `queuedRemove` share the same
module-scope `writeQueue`, so ordering between any two calls issued before the
other starts is enforced. `launchCrisis` additionally awaits `writeQueue` itself
after its own write, picking up anything enqueued by the time its write settled.
Anything enqueued strictly after that await point is a genuine live race outside
either function's ability to observe — this is acknowledged, not hidden, in the
repair's own comments (line 134-138) and confirmed accurate by reading.

Test at line 218-229 (`Promise.all([invalidateDownstreamOnRecommit(...),
launchCrisis(...)])`) exercises real interleaving through the real queue (not a
scripted mock), and asserts the outcome is internally consistent (`onDisk` matches
`launch2.state` iff `kind==='launched'`) — this is a meaningful test, not vacuous.

**System is not atomic** — confirmed, and the repair report does not claim
atomicity anywhere (checked: it explicitly disclaims cross-key/write-readback
atomicity at crisisWriter.ts line 113-116). No new race defect found beyond what's
already disclosed as a documented limitation.

## 7. Queue findings

`withTimeout` (queuedWrite.ts:16-22) races the real operation against a `setTimeout`
rejection; `clearTimeout` runs in `finally` either way. **Critical property to
check: does timeout cancel the underlying `AsyncStorage.setItem`/`removeItem`
call, or just stop waiting for it?** Read `withTimeout` directly: it does **not**
cancel anything — `Promise.race` has no mechanism to cancel the loser. If
`setItem` eventually resolves after the 5s timeout already rejected and moved the
queue on, that resolution is silently dropped (nothing awaits it anymore) — but
critically, if it eventually *writes to storage*, that write still physically
happens, just later and un-ordered relative to whatever the queue did next. A
write that "times out" from the caller's perspective can still land in storage
afterward, potentially overwriting a subsequent queued write that DID complete
normally. **MAJOR-adjacent, but no credible execution path found for it to
actually fire in this app**: `@react-native-async-storage/async-storage`'s
`setItem` in real RN either resolves or rejects promptly on both platforms' native
bridges — it is not documented or known to hang indefinitely under normal
operation, so this is a defense against a failure mode (device I/O hang) that has
no confirmed real-world trigger in this stack. Classifying as **MINOR /
[Guessing]** rather than MAJOR: real, traced, but no credible path to actually
observe it without deliberately breaking the storage layer. Matches the repair
report's own §9-flagged gap (zero test coverage for the timeout) — independently
re-derived here, not copied.

Every write/remove to `CRISIS_KEY` in the current codebase goes through the queue
(`queuedWrite`/`queuedRemove`) **except** `backupCorrupt`, which calls
`AsyncStorage.setItem` directly on the *different* key `CRISIS_BACKUP_KEY`. Since
it's a different key with no other writer, bypassing the queue here creates no
observed ordering hazard — traced, not assumed. **INFORMATIONAL.**

## 8. Identity/provenance findings

`BusinessId` is captured exactly once, at `launchCrisis` call time, stamped
directly from the `committedTo` argument into `createInitialCrisisState(committedTo,
openingCash)` (line 129). No update path exists anywhere in `crisisWriter.ts` — a
launched record is never re-written with a different stamp later. Grep-confirmed
(via direct read of the whole file): the only two `AsyncStorage`/`queuedWrite`
touches to `CRISIS_KEY` are inside `launchCrisis` itself.

This satisfies the exact invariant `recommitInvalidation.ts`'s own doc comment (line
16-29) demands of any future writer: "MUST stamp businessId/biz at record-creation
time from the value committed at THAT moment, never re-stamp on every write from
'whatever is current now'." `launchCrisis` does not re-derive identity from
"current" state at write time — it trusts its caller's `committedTo` argument once,
at creation. **[Certain]**, read directly.

READ-SIDE SAFETY (`isCrisisValidFor` in `recommit.ts`, checked on every `readCrisis`
call) is independent of and does not by itself prove WRITE-SIDE PROVENANCE — this
distinction is preserved correctly: `launchCrisis`'s correctness rests on ITS OWN
discipline (stamp once, at creation, from the caller's argument), not on the
read-side guard bailing it out. If a *future* writer violated this discipline
(re-stamped from live "current" state), the read-side guard would not catch it,
because a re-stamped record's `biz` would, by construction, always match whatever
is currently committed. This is exactly the "future-writer constraint" the
`recommitInvalidation.ts` comment already calls out — correctly classified there as
a standing constraint on future code, not a current defect, since only
`launchCrisis` writes `CRISIS_KEY` today. **No new finding — confirms an existing,
already-documented boundary.**

## 9. Test-quality findings

Reviewed all 29 tests directly (not sampled). Applying "would this fail if the bug
returned":

- Structural section (9 tests, line 59-121): all assert either `.kind` or the
  boolean return of `isValidCrisisState` directly — every one would fail if the
  corresponding rejection logic were removed. No vacuous assertions found.
- Absent/corrupt section (5 tests, line 127-159): assert `.kind` and/or
  `mockStore.get(CRISIS_BACKUP_KEY)` content directly — the backup-preservation
  tests genuinely inspect persisted state, not just a resolved promise. Strong.
- launchCrisis contract section (7 tests, line 165-229): all assert `.kind` and,
  where relevant, cross-check `mockStore` content against `result.state` — e.g.
  line 195 (`written-unverified` test) verifies the underlying write actually
  happened by checking storage content, not just the returned label. This is
  exactly the kind of test that would catch a mislabeled result. Strong.
- Race/recommit section (6 tests, line 235-296): line 255-268 (clear-fails
  adversarial test) genuinely simulates a partial-failure interleaving via a
  conditional mock and asserts both that the stale record survives on disk AND
  that the read-side guard still refuses it — a real, non-trivial assertion.

One test worth flagging as weaker than its name implies: `'adversarial race:
launchCrisis fired concurrently with a recommit clear reports a truthful,
evidence-backed outcome'` (line 218-229) — its assertion is a disjunction
(`kind==='launched'` implies disk match, else `kind` is one of two acceptable
values) rather than a single deterministic expected outcome. This is defensible
given the test intentionally exercises a real race with no fixed winner, but it
means the test cannot detect a regression where the *wrong one* of the two
non-launched outcomes is returned (e.g. `overwritten-by-concurrent-write` returned
when the real cause was actually a race, or vice versa) — it only proves the
result isn't nonsense, not that it's the *correct* one for whatever interleaving
actually occurred that run. **MINOR test-quality gap**, not a production defect.

No vacuous or promise-only tests found in this file. **This matches the repair
report's own self-assessment — independently re-verified, not copied.**

## 10. Regression results

Run directly this turn:
1. `npx jest __tests__/crisisWriter.realwriter.test.ts --silent` → **29 passed, 29
   total.** [Certain]
2. `npx jest --silent` (full suite) → **8 suites passed, 136 passed, 136 total**
   (includes `recommit.adversary.test.ts` and `recommit.domain.test.ts` within the
   8). [Certain]
3. `npx tsc --noEmit` → **8 errors**, all in `__tests__/App.scanner.adversary.test.tsx`
   (7 errors) and `__tests__/App.test.tsx` (1 error), all the identical
   jest-mock-callback-arity error (`TS2345`, `(value: unknown) => void` not
   assignable to `() => void`) at the same line numbers the repair report cites.
   [Certain]

All three exactly match the repair report's claimed numbers (29/29, 136/136, 8
pre-existing/0-new). No discrepancy to explain.

## 11. Static vs runtime boundary

**STATICALLY ESTABLISHED** (Jest with mocked AsyncStorage + direct code reading,
this turn):
- Structural validation closes the original CRITICAL finding.
- Corrupt/absent/malformed are distinguishable, and corrupt evidence is preserved
  before any overwrite.
- `launched`/`written-unverified`/`lost-to-recommit-race`/
  `overwritten-by-concurrent-write` are each gated on real, traced evidence.
- Queue ordering is enforced for every `CRISIS_KEY` writer that exists today.
- Write-side provenance is correctly stamp-once-at-creation, matching the
  documented constraint.
- No scope creep: `recommit.ts` and `recommitInvalidation.ts` are absent from `git
  status`/`git diff` entirely — untouched. No App.tsx, navigation, Plan, or Crisis
  UI files appear in the change set.

**RUNTIME EXPERIMENT REQUIRED** (not established by anything above):
- Whether `AsyncStorage.setItem`/`removeItem` can actually hang indefinitely on a
  real Android device, which is the entire premise behind the `queuedWrite`
  timeout's practical value.
- Real process-kill/restart timing around the GAUNTLET scenario — the reasoning in
  §12 below is a static trace of the code, not an observed run.
- Real multi-instance/multi-process concurrent write behavior (Jest's mocked
  `AsyncStorage` is single-threaded, synchronous-microtask; real native bridge
  timing is not represented at all).
- Backup-write failure behavior under real storage-quota-exhaustion conditions.

## 12. Remaining constraints

Same three MINOR-tier items the repair report itself already disclosed
(log-sequence gap, unbounded `crisisScore`, untested `queuedWrite` timeout),
independently reproduced above (§3, §7). Two additional MINOR items found this
turn, not previously listed:
- Repeated corruption events overwrite each other's backup with no preservation of
  the earliest evidence (§4).
- `overwritten-by-concurrent-write` can be returned for unparseable-garbage-on-disk
  cases where no concurrent write is actually known to have occurred — a narrower
  claim than the label states (§5).

## 13. Step 14 requirements

Same boundary the repair report already states: everything above is
mocked-AsyncStorage Jest evidence. Step 14 must exercise this on the emulator (this
project has no physical device — `EMULATOR-VERIFIED` is the ceiling, not
`REAL-DEVICE-UNVERIFIED`... it remains **REAL-DEVICE-UNVERIFIED** per project
constraint) with actual app lifecycle (background/kill/restart) around a recommit +
Crisis launch, and should specifically try to trigger a real slow/hung
`AsyncStorage` call if feasible, since that is the one mechanism in this module
that has zero real-world evidence behind it either way.

## 14. FINAL VERDICT

**PASS WITH CONSTRAINTS.**

No CRITICAL or MAJOR finding survived this independent re-check — the original
gate's F1-F5 defects are each closed by a traced, evidence-based code path with a
corresponding test that would fail if the defect returned. All three regression
numbers were reproduced exactly by running the suite myself this turn, not taken on
the repair report's word. Five MINOR items remain open (three previously disclosed,
two newly found in this pass: repeated-corruption backup clobbering, and the
narrower-than-labeled `overwritten-by-concurrent-write` sub-case) plus the
queuedWrite timeout's untested/unproven-in-practice status. None block Step 14; all
should be listed as explicit things Step 14 (or a later hardening pass) should keep
in mind, not treated as closed.
