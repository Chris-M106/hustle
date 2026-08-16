# HUSTLE ARCHITECTURE — FINAL PRE-FREEZE ADVERSARIAL GATE

Mode: adversary only. No code modified. No commit. No push. No Step 15 performed.

## 1. Scope

Attack the proposal "proceed to Step 15, freeze WITH constraints." Direct inspection of
current repository code (not report summaries) this pass: `crisisWriter.ts` (full, 211
lines), `queuedWrite.ts` (full, 59 lines), `App.tsx` commit/bridge handlers, `recommit.ts`,
`recommitInvalidation.ts`, plus all Step 9-14B reports already read across this session.

## 2. Evidence reviewed

All 8 listed `.md` reports (read earlier this session, re-checked against code this pass),
`recommit.ts`, `recommitInvalidation.ts`, `crisisWriter.ts` (re-read in full this pass),
`queuedWrite.ts` (re-read in full this pass — not previously read at this depth),
`App.tsx` commit()/startCrisisBridge(), `NEXT_EXPERIMENT_SCANNER_PLAN_CRISIS.md`.

## 3. Architecture attack

**New finding, not previously surfaced this session** — `queuedWrite.ts:16-21`,
`withTimeout()`: on timeout it rejects the *caller's* promise via `Promise.race`, but does
**not** cancel the underlying `AsyncStorage.setItem`/`removeItem` call — there is no
`AbortController`, no native cancellation API used. The losing promise keeps running against
real device I/O after the caller has already been told "timeout" (a failure). **[Certain]**
by direct code inspection. Consequence: a caller (Crisis or a future Plan writer) that
receives a timeout and concludes "nothing was persisted" may be wrong — the write can still
land on disk after the fact, with no further callback to correct that caller's belief.
Severity: **MAJOR** (see Section 12).

Compounding: `queuedWrite`/`queuedRemove` (`queuedWrite.ts:34-51`) immediately advance
`writeQueue` past a timed-out operation (`.catch(() => undefined)`) so the *next* queued
operation starts immediately, while the orphaned native call is still in flight. Two native
storage calls can therefore be genuinely concurrent and unordered relative to each other,
even though the JS-level queue guarantees ordering only for operations it itself sequenced.
**[Certain]** mechanism exists in code. **[Runtime Required]** whether this ever produces an
observable out-of-order write on the real AsyncStorage/SQLite backend — not reproduced this
session (the one real timeout observed in Step 14 did not have this specifically
instrumented).

## 4. Source-of-truth attack

No competing authority found for `BusinessId` — confirmed again this pass (`App.tsx`
`state.committedTo` remains sole writer). `CRISIS_KEY` (`recommitInvalidation.ts:14`) is a
single global key, not namespaced per business — **[Certain]**. This means "the currently
persisted Crisis record" and "the record for the currently committed business" are two
different concepts conflated into one storage slot; `isCrisisValidFor` is what reconciles
them at read time. No defect found — this is a deliberate, documented design (single-run
product model) — but it is a hard constraint any future multi-business/resume feature must
respect, not an incidental implementation detail. Flagged for Section 13.

No case found of test-only behavior being treated as production-supported. `isValidCrisisState`/
`isCrisisValidFor` are both invoked by real production code (`crisisWriter.ts:202,206`), not
only by tests — this is correctly *not* a "tests define behavior code doesn't" case.

## 5. Future-boundary attack (Step 14B's "A — INTENTIONAL FUTURE BOUNDARY")

Actively tried to find current-gameplay evidence requiring recommit. Re-confirmed
`NEXT_EXPERIMENT_SCANNER_PLAN_CRISIS.md:3`: "PLAN DOCUMENT ONLY. Nothing in this file has
been implemented." No other document read this session describes a current (shipped) player
journey involving a business change. **[Certain]** the claim survives this attack — no
counter-evidence found. Step 14B's classification stands.

## 6. Persistence attack (Crisis)

Could a future Crisis screen misuse the current API? Yes, under specific conditions, and the
current code only partially defends against them:

- **Overwriting existing state**: `launchCrisis` is unconditionally create-only
  (`crisisWriter.ts:117-133`, no existing-state check) — **[Certain]** any caller invoking it
  on an already-in-progress run destroys that run. This is documented in-module ("no update
  path... by design") but nothing in the type system stops a caller from calling it wrongly;
  the safety is entirely comment-based. **MAJOR** as a constraint, not a defect against
  current scope (Section 13, constraint 2).
- **Losing state via timeout-vs-cancellation confusion**: per Section 3 — real risk, not
  runtime-disproven. **MAJOR**.
- **Accepting stale identity**: defended — `isCrisisValidFor` is mandatory on every read
  (`crisisWriter.ts:206`), independent of structural validity. **[Certain]** no gap found.
- **Misclassifying corruption**: defended — `corrupt` (unparseable) and `malformed`
  (parseable but structurally invalid) are kept distinct (`crisisWriter.ts:194-205`), and
  both back up the raw bytes before any future write can destroy them
  (`backupCorrupt`, lines 79-85, 198, 203). **[Certain]** no gap found in the reader itself.
  The gap (Step 14B, unchanged) is that the only current *caller* of the reader
  (`startCrisisBridge`) always writes first, so corrupt bytes on disk today are destroyed
  before this correctly-defensive reader ever runs. That is a reachability gap in the bridge,
  not a defect in `crisisWriter.ts` itself.
- **Violating BusinessId provenance**: defended by the write-once-at-creation stamp
  (`createInitialCrisisState(committedTo, ...)`, called with the caller's own argument, never
  re-derived internally) — **[Certain]** `crisisWriter.ts` itself follows its own rule
  correctly. Whether a *future* writer will is Section 8's concern, not this module's.

## 7. Process lifecycle attack

Re-examined the Step 14 Test 4 evidence: state survival across a real process kill was
proven at the **disk layer** (direct `sqlite3` query before/after kill+relaunch) and
independently by Scanner's own unrelated restore path ("Restored committed run."). It was
**not** proven through the Crisis bridge's own read path, because `startCrisisBridge` always
calls `launchCrisis` (destructive create) before `readCrisis` — **[Certain]**, re-confirmed
this pass at `App.tsx:294-296`. So: the OS/SQLite persistence layer demonstrably survives
process death (real evidence, stands). But the *application*, as currently wired, has no way
to show a user a restored Crisis run without destroying it first via the same tap that would
display it. This is not "merely re-created" masquerading as "restored" — the disk evidence is
genuine — but it does mean **no current runtime path lets the app itself demonstrate
resume-after-restart**, only a raw storage inspection can. Per the task's own instruction, this
is not being upgraded into an invented resume requirement — current product scope (single
create-only Crisis run, Step 14B) does not obviously need one — but it must be stated
precisely as a constraint (Section 13), not left implied. **MAJOR** as a documentation gap,
**not** a functional defect against current scope.

## 8. Future-writer safety attack (the critical one)

Simulated: could a future Plan/Crisis writer accidentally re-derive `businessId` from
"whatever Scanner's current state is" at write time instead of at record-creation time,
exactly the failure mode `recommit.ts`'s own header (lines 16-29) warns against?

**Yes, trivially — nothing in the current architecture prevents it.** **[Certain]**. The
constraint ("stamp at creation, never re-derive") exists only as a code comment in
`recommit.ts`. There is:
- no type-level enforcement (no branded/frozen `businessId` type that can't be silently
  swapped),
- no runtime assertion inside `recommitInvalidation.ts` or any writer that a record's
  `biz`/`businessId` field, once set, cannot be overwritten by a later write to the same key,
- no lint rule, test-enforced contract, or factory function that a future writer is
  *required* to go through (writers could call `AsyncStorage.setItem` directly, bypassing
  `queuedWrite` and `recommitInvalidation` entirely — nothing stops that architecturally).

Could a future writer bypass `recommitInvalidation`? **[Certain]** yes — it's an ordinary
exported function, not enforced by any gate; a writer that never calls it simply never
invalidates. Could it bypass `queuedWrite`? **[Certain]** yes, same reasoning — `AsyncStorage`
is imported directly in multiple files already; nothing prevents a new file from doing the
same and issuing unqueued writes that race with the shared queue.

Classification: this is **not** an architectural defect *today* (no such writer exists yet),
but it is a **missing enforcement mechanism** — the entire safety model for the future
Plan/Crisis handoff rests on a future implementer reading and obeying a comment. Severity:
**MAJOR**, carried into Section 13 as a hard constraint on any future writer's code review,
since the current architecture provides guidance but no enforcement.

## 9. Experiment contamination attack

`App.tsx` diff this session is additive only (+58/-8 per earlier `git diff --stat`,
re-confirmed unchanged this pass) — `startCrisisBridge`, `crisisBridgeBusy`,
`crisisBridgeResult`, `crisisBridgeError`, and the bridge UI block. **[Certain]** Scanner's
own `commit()`/`select()`/`commitSpot()` logic is untouched by the bridge (no diff lines
inside those functions beyond the pre-existing `resetDownstream` field, which predates this
session's work). No navigation was added. No `BusinessId` behavior changed. The bridge is
comment-labeled ("Step 14A runtime bridge handler") but **is not gated behind any dev-only
flag, environment check, or `__DEV__` conditional** — it is a permanent, always-present part
of the shipped `App.tsx` file, indistinguishable at the type/build level from production UI.
**MINOR-to-MAJOR**: not a correctness defect, but a freeze-hygiene issue — if Step 15 freezes
the architecture with this bridge silently included, a future reader has no code-level signal
that it's validation scaffolding rather than intended product UI. Flagged for Section 13.

## 10. Over-architecture attack

`LaunchCrisisResult`'s `lost-to-recommit-race` variant (`crisisWriter.ts:101`) is currently
unreachable in production: it depends on a racing `queuedRemove(CRISIS_KEY)`, and the only
caller of that remove is `invalidateDownstreamOnRecommit`, itself unreachable at runtime
(Step 14B). **[Certain]** dead code path in current shipped behavior. Recommend: **do not
remove** — it is cheap, correctly designed forward-compatible plumbing for the same future
writer Section 8 discusses, and removing it now would just require re-adding it later with no
benefit. Classification: **INFORMATIONAL**, not a defect, not something to simplify away.

No other component found that exists solely for this experiment with no plausible future use.

## 11. Step 15 readiness attack

Attempted to prove Step 15 premature. The defensible standard given in the task
("architecture currently supported by evidence can be frozen, with explicit future
boundaries and constraints") **is met**, provided Section 13's constraints are actually
carried forward in writing — not merely implied. Two things would make Step 15 premature as
currently described, and both are addressable by documentation, not by more implementation:
(a) the timeout/cancellation gap (Section 3) being silently omitted from the freeze
document, and (b) the future-writer enforcement gap (Section 8) being silently omitted. If
Section 13 is incorporated verbatim, Step 15 is not premature.

## 12. Findings by severity

- **MAJOR** — `withTimeout` never cancels the underlying AsyncStorage call; a caller-visible
  timeout is not proof of non-persistence, and a later queued operation can race an orphaned
  earlier one. (Section 3)
- **MAJOR** — No enforcement mechanism (type-level, runtime, or process) exists to make a
  future Plan/Crisis writer obey "stamp at creation, never re-derive" or "always go through
  `queuedWrite`/`recommitInvalidation`" — the entire safety model is comment-based. (Section 8)
- **MAJOR** — `launchCrisis`'s create-only/always-overwrite behavior has no type-level guard
  against being called on an in-progress run; safety is comment-only. (Section 6)
- **MAJOR** — No current runtime path lets the app demonstrate a resumed (not recreated)
  Crisis run to a user; only direct storage inspection proved process-death survival. Not a
  functional defect against current scope, but must be stated as an explicit limitation, not
  left implicit. (Section 7)
- **MINOR/MAJOR (freeze-hygiene)** — Step 14A bridge is permanent, ungated production code
  with no `__DEV__`/flag boundary distinguishing it from real UI. (Section 9)
- **INFORMATIONAL** — `CRISIS_KEY` is a single global (not per-business) key; correct for
  current single-run model, must be stated as a hard constraint for any future multi-run
  feature. (Section 4)
- **INFORMATIONAL** — `lost-to-recommit-race` branch is currently dead code; correctly kept,
  not a defect. (Section 10)

No CRITICAL finding. Nothing found that breaks current, in-scope, shipped behavior.

## 13. Required constraints (to carry into the freeze)

1. `withTimeout`/`queuedWrite`/`queuedRemove` timeouts are **not** proof of non-persistence.
   Any future code (UI or writer) that treats a timeout as "nothing was saved" is making an
   unverified assumption; the underlying native call may still complete after the timeout
   fires. This must be fixed (real cancellation, or a documented "assume persisted-unknown,
   re-read before trusting either state" pattern) **before** any feature relies on timeout
   semantics for correctness, not merely before Step 15.
2. `launchCrisis` overwrites unconditionally. Any future caller MUST check for an existing,
   valid, same-business run (via `readCrisis`) before calling `launchCrisis`, if resume/no-op
   semantics are ever required by product scope. This is not enforced by the type system today.
3. Any future Plan/Crisis writer MUST stamp `businessId`/`biz` from the value committed at
   record-creation time, MUST go through `queuedWrite`/`queuedRemove` (never call
   `AsyncStorage` directly), and MUST trigger `invalidateDownstreamOnRecommit` on every
   identity change. None of this is currently enforced mechanically — code review is the only
   current gate, and must be treated as mandatory review criteria, not optional style.
4. `CRISIS_KEY` is a single global key. Any future feature allowing more than one persisted
   run must redesign the key scheme; the current architecture does not support it.
5. The Step 14A Crisis bridge (`startCrisisBridge` and its associated state in `App.tsx`) is
   validation scaffolding, not product UI. It must be explicitly labeled as such in the frozen
   architecture document (and ideally gated behind a dev-only flag before any further build),
   so a future reader does not mistake it for intended behavior.
6. Tests 3/5/6/10/11 (recommit A→B, restart-after-recommit, A→B→C, A→A, corruption) remain
   INCONCLUSIVE for a structural reason (no runtime invocation path), per Step 14B. Restated
   here: this is not resolved by anything found in this pass and must be carried forward
   unchanged.

## 14. FINAL VERDICT

**READY FOR STEP 15 WITH CONSTRAINTS.**

No CRITICAL finding blocks freeze. All MAJOR findings above are enforcement/documentation
gaps against **future** work, not defects in currently shipped, in-scope behavior — they are
sufficient specifically because Step 15 is being asked to freeze "architecture currently
supported by evidence... with explicit future boundaries," not to certify unbuilt features
safe. The six constraints in Section 13 are the exact new material this pass adds beyond
Step 14B; they must appear in the Step 15 document verbatim, not summarized away.

## Git / test / build status (this step)

```
$ git status --short
 M App.tsx
 M src/persistence/queuedWrite.ts
?? (Step 13/14/14B report, log, and screenshot artifacts — unchanged by this step)
```
No files modified by this adversary pass (Read/Grep/Bash only). `App.tsx`/`queuedWrite.ts`
modifications pre-date this step (Step 14A bridge work + the testability extraction noted in
`queuedWrite.ts`'s own header).

Tests were not re-run this pass — no code changed since the last run reported in Step 14B
(136/136 Jest, 8 pre-existing/0 new tsc errors). Re-running was not required per the task's
own regression rule (only required after a production-code modification), and none occurred.
