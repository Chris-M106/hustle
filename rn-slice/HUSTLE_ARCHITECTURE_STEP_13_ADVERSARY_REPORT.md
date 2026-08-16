# HUSTLE ARCHITECTURE — STEP 13 ADVERSARIAL GATE REPORT

Standalone gate review, independent of the inline adversary pass recorded in
`HUSTLE_ARCHITECTURE_STEP_13_REPORT.md` section 5. Every conclusion in that report was
treated as an unproven claim. Mode: ADVERSARY ONLY — no production code retained-modified,
no Step 14 work performed.

Verification posture: every claim tagged [CERTAIN] is backed by a command run in this
session with output quoted, or by a file:line read directly. Nothing is called
"verified", "complete" or "safe" without that.

## 1. Scope attacked

- `src/persistence/crisisWriter.ts` (Step 13 deliverable) — `launchCrisis`, `readCrisis`.
- `__tests__/crisisWriter.realwriter.test.ts` — all 11 tests, plus mutation testing.
- `src/persistence/queuedWrite.ts` — queue semantics, alternate write paths.
- `src/persistence/recommitInvalidation.ts` — `invalidateDownstreamOnRecommit`, `readJsonKey`.
- `src/domain/recommit.ts` — `isCrisisValidFor`, `isIdentityChange`, KNOWN LATENT GAP header.
- `src/domain/logic.ts` `createInitialCrisisState`; `src/domain/types.ts` `CrisisRunState`;
  `src/domain/business.ts` `isBusinessId`.
- Repo-wide grep for alternate writers of `CRISIS_KEY`.
- Claims in `HUSTLE_ARCHITECTURE_STEP_13_REPORT.md` sections 4, 5, 7, 9.

Not attacked: runtime/emulator behavior (out of mode), Plan (does not exist), App.tsx
Scanner logic beyond the write-path grep, `src/domain/scanner/`.

## 2. Evidence inspected (this session)

| Evidence | How obtained |
|---|---|
| All files above | Read in full |
| `npx jest --silent` run 1 | 2 failed, 116 passed, 118 total — `App.scanner.adversary.test.tsx` 5s timeout at its line 41 |
| `npx jest --silent` run 2 | 8 suites passed, 118/118 |
| `npx jest __tests__/crisisWriter.realwriter.test.ts` x5 | 11/11 each run — that suite is deterministic |
| 7 throwaway adversarial tests (written, run, output captured, file deleted) | Findings F1-F8 |
| 4 mutation tests against the shipped suite (production file mutated, run, restored) | Section 9 |
| `cmp /tmp/cw.bak src/persistence/crisisWriter.ts` -> `IDENTICAL`; `git status --short` shows only the 4 pre-existing untracked files | Cleanup proof |

## 3. Findings

### F1 — readCrisis returns kind:valid for objects that are not CrisisRunState [CERTAIN]

`crisisWriter.ts:93-102`. The only gate is `isCrisisValidFor` (`recommit.ts:75-85`), which
by its own docstring checks **biz only** ("Structural check only (not full
isValidPlanHandoff...)"). readCrisis then does `return { kind: "valid", state: raw as
CrisisRunState }` — an unchecked cast of arbitrary disk content.

Reproduced output:

    A result:  {"kind":"valid","state":{"biz":"phonerepair"}}
    A2 result: {"kind":"valid","state":{"biz":"phonerepair","day":"x","cash":null,"log":"nope","resolved":"yes"}}
    A2 cash typeof: object   day: x
    A2 downstream logic.resolve THREW: TypeError: Cannot read properties of undefined (reading undefined)

A record with no cash, no day and no log at all is handed to the caller as a trusted
CrisisRunState. Feeding it to the real `logic.resolve` crashes.

Root cause: the writer validates at the boundary, the reader does not. The Step 13 fix for
"NaN cash must never be persisted" (`crisisWriter.ts:57-59`) is fully bypassed by the read
path — anything on disk with the right biz field is trusted regardless of shape.

This is a regression against a standard this repo already met:
`PERSISTENCE_VALIDATION_REPORT.md:23` records a MAJOR finding fixed in the earlier Crisis
slice requiring isValidCrisisState to enforce log.length === day / day+1, per-entry
structure, bounded cash, non-negative integer streak, typed ended. No isValidCrisisState
exists anywhere in `src/` today (grep: the only hits are an `App.tsx:65` comment and the
old report).

### F2 — corrupt payload silently reported as absent, then silently destroyed [CERTAIN]

`readJsonKey` (`recommitInvalidation.ts:64-72`) swallows parse failure as null;
`readCrisis:92` maps null to kind:absent. The shipped test at
`crisisWriter.realwriter.test.ts:151` asserts this as correct behavior. Reproduced:

    C read: {"kind":"absent"}
    C keys after launch: [ hustle.crisis.v1 ]

A caller cannot distinguish "no run yet" from "the run exists but is unreadable", so the
natural response is to start a fresh run, overwriting the corrupt bytes with no backup.
`PERSISTENCE_VALIDATION_REPORT.md:18` lists exactly this as a previously-fixed CRITICAL
("Corrupt/invalid saved data silently destroyed, no backup" — fixed by a corrupt-backup
key). That protection does not exist in the Step 13 path.

### F3 — launchCrisis throws after a write that actually landed [CERTAIN]

`crisisWriter.ts:72` calls readJsonKey, which calls AsyncStorage.getItem with no try/catch
on the I/O itself. A read failure therefore rejects launchCrisis even though setItem
succeeded. Reproduced:

    B threw: Error: device read I/O error | on disk: {"biz":"phonerepair","day":0,"cash":1300,...}

Step 13 report section 5 claims launchCrisis "fails clean (rejected promise, no fake
success) on a genuine setItem rejection" — true for setItem, but the readback that fix
introduced created a NEW failure mode the inline pass did not test: a rejection that is a
false negative. A caller that retries, or that renders "could not start", now disagrees
with storage. On a low-end Android device under memory pressure this is a realistic read
failure, not a theoretical one.

### F4 — the residual post-check clear race produces a false launched result [CERTAIN]

Step 13 report section 7 lists this as "acknowledged as unresolvable by this module alone,
not tested further". I tested it. Reproduced:

    E result: launched | on disk after: NOTHING

launchCrisis returned kind:launched while CRISIS_KEY is empty. The mitigation at
`crisisWriter.ts:71` (`await writeQueue`) narrows the window; it does not close it, exactly
as the code comment says. The finding is not that the comment is wrong — it is that the
report section 5 sentence "so a caller cannot show Crisis started UI while storage silently
has nothing" is falsified by the output above.

### F5 — lost-to-recommit-race is returned when there is no recommit [CERTAIN]

`crisisWriter.ts:73` compares disk against payload and attributes ANY mismatch to a recommit
race. Reproduced with two concurrent launches and no recommit at all:

    F a: lost-to-recommit-race  b: launched  | disk: {"biz":"spaza","cash":200,...}

The tag misdiagnoses the cause; a caller branching on it takes the wrong recovery action.
Root cause: the check infers a cause from an effect it cannot distinguish.

### F6 — provenance unenforced; the API shape invites the violation the invariant forbids [CERTAIN, design-level]

`recommit.ts:16-29` states the invariant: the stamp must come from the business committed at
record-creation time. `launchCrisis(committedTo, openingCash)` takes identity and data as two
independently-sourced parameters with no consistency relation between them. Nothing in the
module, the type system, or the tests prevents a caller passing B committedTo with A cash.
Reproduced:

    D: {"kind":"launched","state":{"biz":"spaza","cash":999999,...}}
    D read as spaza: {"kind":"valid", ...}

A financial state belonging to A, labelled B, accepted as valid for B. The guard is a
DETECTOR of mismatched stamps, not a PREVENTER of mislabelling — those are not equivalent.
The Step 13 framing ("this function ... cannot itself violate the stamp-at-creation
discipline", `crisisWriter.ts:30-31`) is true of the stamp, not of the payload the stamp is
attached to. Correct fix shape: a single caller-supplied snapshot read atomically from one
Scanner state object, instead of two loose arguments. Reported, NOT applied.

Category per the four-way split in the task spec: (2) a future writer invariant that the
current API actively fails to enforce, trending toward (3) a limitation of the current
architecture. Not (1) currently exploitable — no caller exists. Not (4) — the two-layer
design is sound; the parameter shape is not.

### F7 — openingCash has no upper or sanity bound [CERTAIN]

    G 1e308: launched  cash: 1e+308
    G float: launched  cash: 0.30000000000000004

`crisisWriter.ts:57` checks finite and non-negative only. The earlier Crisis slice standard
required bounded cash (`PERSISTENCE_VALIDATION_REPORT.md:23`). MINOR, but a second instance
of the same regression class as F1.

### F8 — the Step 13 claim of 118/118 passing, tagged [Certain], is not reproducible [CERTAIN]

Run 1 this session: 2 failed, 116 passed. Run 2: 118 passed. The failing suite is
`App.scanner.adversary.test.tsx` (5s Jest timeout), unrelated to crisisWriter — the Step 13
suite itself passed 5 of 5 consecutive runs. The finding is not that Step 13 broke anything;
it is that the green-suite signal for this repo is flaky and timing-dependent, and the Step
13 report asserts it as [Certain] without noting nondeterminism.

### F9 — queue semantics: no bypass path, but reads are uncoordinated and writes have no timeout

Repo-wide grep for setItem, removeItem and CRISIS_KEY: the only non-queued writes are
`App.tsx:142,160` to BACKUP_KEY (the Scanner corrupt-backup, a different key). No alternate
writer of CRISIS_KEY exists [CERTAIN]. queuedWrite and queuedRemove share one module-scope
writeQueue (`queuedWrite.ts:12,25,29,45,46`), and writeQueue is an `export let` read live at
`crisisWriter.ts:71`, so the drain does observe operations enqueued after import [CERTAIN,
demonstrated by mutation test 1 being killed]. But READS ARE NOT ON THE QUEUE: readJsonKey
via getItem, and `recommitInvalidation.ts:47,53`, all read outside it — that is what makes
F3, F4 and F5 possible. Separately, queuedWrite has NO timeout while queuedRemove has one
(`queuedWrite.ts:38,45`): a hung setItem deadlocks the shared queue permanently for every
future caller, including the `await writeQueue` inside launchCrisis, which would then never
resolve [LIKELY — read directly at those lines, not reproduced; would need a never-settling
setItem mock].

### F10 — scope contamination: none found [CERTAIN]

crisisWriter.ts imports only domain/logic, domain/types, domain/business, domain/recommit,
persistence/queuedWrite, persistence/recommitInvalidation. No React/RN, no navigation, no
App.tsx, no Plan, no duplicated domain state, no new persistence authority (it reuses
CRISIS_KEY and the shared queue), no speculative abstraction. `git status --short` shows only
the two new files plus the two reports; recommit.ts, recommitInvalidation.ts, queuedWrite.ts,
logic.ts and App.tsx are untouched. This area of the Step 13 claims holds.

## 4. Severity

| # | Finding | Severity |
|---|---|---|
| F1 | readCrisis trusts unvalidated shape as CrisisRunState | **CRITICAL** |
| F2 | Corrupt payload reads as absent, then is overwritten with no backup | **MAJOR** |
| F3 | launchCrisis throws after a successful write (false negative) | **MAJOR** |
| F4 | Residual race yields a false launched result with empty storage | **MAJOR** |
| F6 | Provenance unenforced; two-loose-param API invites mislabelling | **MAJOR** |
| F9 | queuedWrite has no timeout; a hung write deadlocks the shared queue | **MAJOR** |
| F5 | lost-to-recommit-race misattributes non-recommit collisions | MINOR |
| F7 | openingCash unbounded | MINOR |
| F8 | Suite is flaky; the 118/118 [Certain] claim is not reproducible | MINOR |
| F10 | Scope discipline held | INFORMATIONAL (sound) |

## 5. Exact attack scenarios

- F1: `mockStore.set(CRISIS_KEY, JSON.stringify({biz:"phonerepair"}))` then `readCrisis("phonerepair")`.
- F2: `mockStore.set(CRISIS_KEY, "{truncated")` then readCrisis, then launchCrisis.
- F3: getItem mocked to reject; `launchCrisis("phonerepair", 1300)`.
- F4: `const p = launchCrisis(...)`; enqueue `queuedRemove(CRISIS_KEY)` six microtasks later; await p.
- F5: `Promise.all([launchCrisis("phonerepair",100), launchCrisis("spaza",200)])`.
- F6: `launchCrisis("spaza", 999999)` where 999999 is the cash belonging to business A.
- F7: `launchCrisis("phonerepair", 1e308)`.
- F8: `npx jest --silent` run twice.

## 6. Did the attacks reproduce a failure?

F1, F2, F3, F4, F5, F6, F7 and F8 — yes, all eight reproduced, with captured output quoted
in section 3. F9 has two halves: the grep half and the live-binding half are reproduced; the
deadlock consequence is [LIKELY], read from source, not executed. F10 is a negative result:
attacked and nothing found.

## 7. Existing mitigation

- F1 / F2: none in the Crisis path. isCrisisValidFor is deliberately biz-only per its own docstring.
- F3: none.
- F4: `await writeQueue` (`crisisWriter.ts:71`) plus the tagged return type. Narrows, does not
  close — the code comment says so; the report prose overstates it.
- F5: none.
- F6: isCrisisValidFor on every read catches a wrong stamp, never a wrong payload under a
  right stamp. `recommit.ts:16-29` documents the gap honestly.
- F7: finite and non-negative check only.
- F9: the 5s timeout on queuedRemove mitigates the remove half only.

## 8. Remaining vulnerability

The actual guarantee of the two-layer design, stated precisely: a record whose biz differs
from the currently committed business is never returned as valid. [CERTAIN — held under every
ordering I attacked: failed clear, concurrent launch plus invalidate in both firing orders,
null committedTo, A to B to C, and four mutants.] Everything else attributed to it by the
Step 13 report is not guaranteed: not payload integrity (F1), not payload provenance (F6),
not durability of a reported launch (F4), not honest failure reporting (F3), not preservation
of corrupt data (F2).

## 9. Test-quality findings

Mutation testing (production file mutated, suite run, file restored; `cmp` against the
pre-mutation backup returned IDENTICAL, and the throwaway test file was deleted):

| Mutant | Result |
|---|---|
| Delete `await writeQueue` (line 71) | KILLED — 1 failure, by the adversarial-race test specifically |
| Delete the whole readback and always return launched | KILLED — 1 failure |
| Disable the openingCash finite/non-negative guard | KILLED — 1 failure |
| Replace isCrisisValidFor with a bare biz-in-object check | KILLED — 2 failures |

All four mutants died. The shipped tests are NOT vacuous for the bugs they claim to cover.
That is a genuine strength and I could not break it. [CERTAIN]

The problem is the coverage boundary, not the rigor:

- No test asserts anything about CrisisRunState shape on read, so F1 is invisible to the suite.
- `crisisWriter.realwriter.test.ts:151` encodes F2 as expected behavior, locking in the
  corrupt-indistinguishable-from-absent semantics as if it were a design decision.
- The race test (lines 71-89) is written as an if/else that accepts either outcome. It killed
  mutant 1 only because that mutant makes the launched-branch disk assertion fail. It cannot
  fail on the F4 ordering at all, because F4 produces a launched result and the test never
  re-reads disk after the later clear lands. A test that passes under both branches is weak
  evidence about which branch the system actually takes.
- Nothing covers read-path I/O failure (F3), concurrent launches (F5), unbounded cash (F7),
  or a mismatched payload under a correct stamp (F6).

## 10. Static versus runtime evidence

STATICALLY ESTABLISHED this session (Jest with mocked AsyncStorage): the biz-mismatch guard
holds across failed clear, concurrent orderings and null committedTo; no alternate CRISIS_KEY
writer exists; scope discipline held; F1 through F8 all reproduced; all four mutants killed.

RUNTIME EXPERIMENT REQUIRED (no evidence exists for any of the following): real
SQLite-backed AsyncStorage write durability and latency; process death mid-setItem and
whether a partial or truncated row is possible, which is the real-world trigger for F1 and
F2; background to foreground with a queued write in flight; app kill between queuedWrite
resolving and the readback; restart recovery ordering, specifically whether anything reads
CRISIS_KEY before Scanner committedTo is restored (with committedTo null, isCrisisValidFor
returns false and the F2 absent path fires); real App integration — there is still NO CALLER,
so every claim about caller discipline is entirely unexercised; low-end-Android I/O latency
widening the F4 window. Passing Jest tests substitute for none of this. Labelled
EMULATOR-UNVERIFIED and REAL-DEVICE-UNVERIFIED per project convention.

The gauntlet, answered.

A to B: CAN THE STATE OF A EVER BE ACCEPTED AS B? Via the stamp, no [CERTAIN — mutation-tested
and attacked from six directions]. The preventing invariants are: isCrisisValidFor applied
unconditionally on every read at `crisisWriter.ts:93`; createInitialCrisisState stamping biz
from the caller-supplied argument at creation; and no update path existing in the module.
Via the payload, YES [CERTAIN, reproduced — F6]: a caller that sources committedTo from
post-recommit state and openingCash from pre-recommit state produces a record holding the
money of A stamped B, read back as valid for B, with nothing detecting it. Via the shape,
YES [CERTAIN — F1]: any corrupt, truncated or legacy object carrying biz B is returned as a
trusted CrisisRunState, so residue at that key becomes the state of B.

A to B to C rapid: same answers. isIdentityChange (`recommit.ts:38-43`) fires on each
distinct transition and the guard is per-read, so intermediate B records are rejected for C.
The F5 misattribution gets worse here: more concurrent operations, same undifferentiated
mismatch check.

A to A same-business: isIdentityChange returns false, so there is NO clear at all, the A
record persists, and it is correctly valid for A. Mechanically correct — but this means a
same-business re-commit deliberately preserves an in-progress Crisis run, and whether that is
the intended product behavior is undecided and undocumented. [CERTAIN on mechanism, NOT YET
ASSESSED on product intent.]

## 11. Required constraints for future Plan and Crisis writers

1. Take ONE snapshot object; never take identity and data as separate parameters (F6).
2. The reader must run a full structural and relational validator of the isValidCrisisState
   class (`PERSISTENCE_VALIDATION_REPORT.md:23`) before any cast, not just isCrisisValidFor (F1).
3. Corrupt bytes must be backed up to a corrupt-backup key before any overwrite, and readCrisis
   must distinguish corrupt from absent (F2).
4. A readback failure must not be reported as a write failure; it needs its own result kind,
   for example written-unverified (F3).
5. Do not attribute a disk mismatch to a recommit unless a recommit is actually known to have
   occurred (F5).
6. queuedWrite needs the same timeout queuedRemove already has, before any further writer
   shares that queue (F9).
7. An update path (post resolve / nextDay) must re-stamp from the biz field of the record
   itself, never from current committedTo. That path does not exist yet, and it is exactly
   where the recommit.ts KNOWN LATENT GAP stops being latent.

## 12. Step 14 requirements

If Step 14 proceeds it must explicitly cover: process kill during setItem, with inspection of
what CRISIS_KEY actually contains afterwards (this drives F1 and F2 from theoretical to
demonstrated); background/foreground with an in-flight queued write; restart ordering with
committedTo not yet restored; a real caller wired end to end, without which F6 is untestable;
measurement of real-device I/O latency to size the F4 window; and a repeated-run determinism
check of the whole suite, given F8.

## 13. Final verdict

**FAIL — must be corrected before Step 14.**

Basis: F1 is a CRITICAL, reproduced defect. readCrisis hands arbitrary unvalidated disk
content to callers as a trusted CrisisRunState, crashing the real domain layer, and it
silently undoes the round-1 input-validation fix that the Step 13 report presents as its
headline improvement. F2 re-opens a defect this repo previously classified CRITICAL and
fixed. Both are regressions against an already-met standard, both are cheap to fix, and both
make the results of Step 14 uninterpretable: a process-kill experiment run against a reader
that trusts truncated data cannot distinguish "persistence is fine" from "persistence is
broken and the reader is hiding it".

This is NOT a FAIL because of the provenance gap. That is correctly categorised as a future
writer invariant (F6, category 2) and I explicitly do not count it toward the verdict. The
two-layer stamp guard is the strongest part of this work: I attacked it from six directions
and could not make a wrong-biz record read as valid.

---

Scope of this review: static analysis and Jest-level adversarial execution only. No emulator
or device work was performed. All production files are unmodified as of this writing
(`cmp` against a pre-mutation backup returned IDENTICAL; the throwaway test file was deleted).
