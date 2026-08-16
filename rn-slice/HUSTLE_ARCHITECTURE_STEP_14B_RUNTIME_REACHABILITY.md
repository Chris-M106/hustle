# HUSTLE ARCHITECTURE — STEP 14B: RUNTIME REACHABILITY / INTEGRATION BOUNDARY

Mode: architectural investigation + adversarial review. No implementation performed.
No files modified by this step (`git status` below).

## 1. Current runtime journey

`App.tsx` is a single-component "raw root state" screen. Flow: scan (fixed `BIZ =
"phonerepair"`, App.tsx:45) → `select()` → `commit()` → Step 14A Crisis bridge
(`startCrisisBridge()`) → `launchCrisis`/`readCrisis`. **[Certain]** There is exactly one
business (`BIZ`) hardcoded at App.tsx:45, one Scanner screen, one Crisis bridge. No Plan
screen exists. No navigation library, no second business, no UI affordance to change
`committedTo` after it is first set.

## 2. BusinessId ownership

`state.committedTo` (`App.tsx`) is the only place `BusinessId` is assigned at runtime.
**[Certain]** (App.tsx:227) `select()` is a no-op once `committedTo !== null`
(`if (prev.committedTo !== null) return prev;`). **[Certain]** (`src/domain/scanner/logic.ts:109`)
`commitSpot()` rejects a second commit to the *same* id (`already-committed`) but its guard
is `state.committedTo === o.id`, not `state.committedTo !== null` — the domain function
itself does not forbid committing to a *different* id. In practice this distinction is moot
at runtime because App.tsx only ever calls `commitSpot(state, BIZ, CAPITAL)` with the one
constant `BIZ` — `o.id` never varies, so `state.committedTo === o.id` is always true after
the first commit and every subsequent call is rejected. One authority, no path to a second
value.

## 3. Recommit purpose

`src/domain/recommit.ts` (header, lines 1-30) states its own purpose directly: a **read-side
safety guard** — "validates a downstream record as valid only if its own business field
agrees with the currently committed business" — protecting Plan/Crisis records from being
trusted after an identity change, independent of whether any delete succeeded.
`src/persistence/recommitInvalidation.ts` (header, lines 1-7) is the **proactive cleanup
half**: best-effort clear of `PLAN_KEY`/`CRISIS_KEY` on an identity change.

## 4. Current recommit implementation

**[Certain]** `isIdentityChange(prev, next)` = `prev !== null && prev !== next` —
`recommit.ts:38-43`. **[Certain]** `invalidateDownstreamOnRecommit` calls
`isIdentityChange`, and if true, `queuedRemove(PLAN_KEY)` then `queuedRemove(CRISIS_KEY)`,
re-reading each key to report `planCleared`/`crisisCleared` — `recommitInvalidation.ts:36-58`.
Both are fully implemented, typed, and covered by Jest (`recommit.domain.test.ts`,
`recommit.adversary.test.ts`, `crisisWriter.realwriter.test.ts` — part of the 136/136 suite
below).

## 5. Runtime reachability evidence

**[Certain]**, via same-turn grep (`recommit|Recommit|invalidateDownstream` across
`*.ts*`), the only files referencing these symbols are:
```
__tests__\crisisWriter.realwriter.test.ts
src\persistence\crisisWriter.ts        (imports isCrisisValidFor/isIdentityChange for read-side guard, not invalidation)
src\persistence\queuedWrite.ts
__tests__\recommit.adversary.test.ts
src\persistence\recommitInvalidation.ts
src\domain\recommit.ts
__tests__\recommit.domain.test.ts
__tests__\handoff.twokey.test.ts
__tests__\scanner.domain.differential.test.ts
src\domain\scanner\logic.ts            (computes resetDownstream, does not call invalidation)
```
`App.tsx` is **absent** from this list. **[Certain]** (App.tsx:242-280, `commit()`):
`result.resetDownstream` is returned by `commitSpot()` but never read by the caller — the
destructured/used fields are `result.ok`, `result.reason`, `result.state`;
`resetDownstream` is silently discarded. `invalidateDownstreamOnRecommit` is never imported
into `App.tsx`. There is no runtime path — not "untested," structurally absent — by which
`invalidateDownstreamOnRecommit` executes outside a Jest process.

## 6. Evidence FOR intentional future boundary (Hypothesis A)

- `recommit.ts:1-2` header dates itself "2026-08-13 experiment" and says explicitly: "no fix
  possible without a real Plan/Crisis writer to constrain" and "whoever builds the real
  Plan/Crisis writer MUST stamp businessId/biz at record-creation time" — future-tense,
  addressed to a not-yet-built component. **[Certain]**
- `recommit.ts:26` (as of its authoring): "Grep confirms no RN code writes
  hustle.plan-handoff.v1 or hustle.crisis.v1 today" — written when Crisis's writer did not
  yet exist either; the guard was built *ahead of* both writers it protects. **[Certain]**
- `recommitInvalidation.ts:60`: "Read helper used by both tests and (**were Plan/Crisis
  screens to exist**) real consumers" — the module's own comment frames Plan/Crisis screens
  as hypothetical/future, not current. **[Certain]**
- `NEXT_EXPERIMENT_SCANNER_PLAN_CRISIS.md:3`: "Status: PLAN DOCUMENT ONLY. Nothing in this
  file has been implemented." The document explicitly scopes the Scanner→Plan→Crisis handoff
  (the only scenario that would exercise recommit) as **not yet built**, and its own
  recommendation (lines 101-103) is to build an even *smaller* write-queue-coexistence
  experiment first, not the handoff itself. **[Certain]**
- Current game (per this document set) has exactly one business path per run; nothing in
  read repository documentation describes a current player journey requiring mid-run
  business reassignment. **[Likely]** — absence-of-requirement inferred from the product/plan
  docs read, not from an explicit "recommit is not needed" statement.

## 7. Evidence FOR current integration gap (Hypothesis B) — adversarial attempt

Actively searched for counter-evidence:
- No repository text states current gameplay requires recommit today.
- No repository text says Scanner "should" allow changing business in the shipped slice.
- `commitSpot()`'s `resetDownstream` computation is real, general-purpose logic (works for
  any A→B, not just a stub) — this could be read as "the plumbing is ready, wiring was
  simply forgotten." **[Likely]** this is the strongest counter-argument available, but it is
  outweighed by direct evidence in (6): the same commit that added `resetDownstream` to
  `commitSpot()` is accompanied by NEXT_EXPERIMENT's explicit "plan only, not built" framing
  and recommit.ts's "future writer" language — i.e., the plumbing was built deliberately
  ahead of its caller, not left behind by an oversight. No commit message, test, or doc found
  claiming App.tsx *should already* call it.
- Conclusion: Hypothesis B does not survive — no repository evidence supports it as more than
  a plausible-sounding but unsupported alternative reading of the same code.

## 8. Adversarial findings (gauntlet)

1. Could we freeze architecture while a required runtime path is missing? Not applicable —
   evidence says the path isn't *required* by current scope, only by a documented future
   scope. **[Likely]**
2. Could we mistake future contract for current functionality? Risk is real if Step 15 or
   later work assumes `invalidateDownstreamOnRecommit` is live in the shipped app — it is not.
   Must be stated explicitly as a Step 15 constraint (Section 13).
3. Could we dismiss a real defect as "future work"? Checked directly: `commit()` discarding
   `resetDownstream` is not a defect against current scope, since current scope structurally
   never produces `resetDownstream === true` (single hardcoded `BIZ`). If a second business
   were ever wired into Scanner without also wiring `invalidateDownstreamOnRecommit`, *that*
   would become a real defect at that moment — not today. **[Certain]**
4. Would a new developer/Claude know when recommit must become reachable? Not from code
   alone — `recommit.ts`'s header is explicit but easy to miss. Recorded as a Step 15
   documentation requirement (Section 13).
5. Is BusinessId ownership unambiguous? **[Certain]** yes today — `App.tsx`'s
   `state.committedTo` is sole authority, no second writer exists.
6. Could future Plan/Crisis writers safely depend on the current contract? **[Likely]** yes,
   per `recommit.ts`'s own instructions (stamp at creation time, not at write time) — the
   contract is written defensively for exactly that future case.
7. Does the current runtime bridge (Step 14A) distort conclusions? No — the bridge calls
   `launchCrisis`/`readCrisis` only, never touches `recommit`/`invalidateDownstreamOnRecommit`;
   its presence doesn't create or hide a runtime call site. **[Certain]**
8. Does Step 15 need actual recommit runtime evidence, or only a documented boundary? Given
   (6)/(7) above and the explicit "plan only" status of the handoff experiment: only a
   documented boundary, not runtime evidence, is needed for Step 15 as currently scoped.
   **[Likely]**

## 9. Source-of-truth analysis

Chain Scanner → BusinessId → recommit → downstream invalidation is coherent in shape:
one producer (`App.tsx` `state.committedTo`), two consumers-in-waiting (`recommit.ts` read
guard, `recommitInvalidation.ts` cleanup), zero competing producers. **[Certain]** No code
path allows a second component to independently set `BusinessId` today. Risk flagged for
Step 15: if a Plan stage is later added per `NEXT_EXPERIMENT_SCANNER_PLAN_CRISIS.md`, that
document itself already flags (its own "Dependencies" section, lines 42-67) the one adjacent
risk — a shared write-queue must be genuinely shared, not per-screen — this is pre-identified,
not a new finding.

## 10. Step 15 impact

**Possibility 2 — DOCUMENTED CONSTRAINT.** Architecture can freeze. The missing runtime
integration is not a defect against current scope but must be explicitly recorded as a known,
intentional boundary so it isn't silently assumed solved later.

## 11. Minimal action required

None to implement. Required before/at Step 15: record explicitly (in the Step 15 document
itself, not only here) that `invalidateDownstreamOnRecommit` and the `isIdentityChange`/
`isCrisisValidFor` read-guard are validated at Jest/unit level only (136/136, same suite as
already reported) and have **zero runtime call sites** in the shipped app; that Tests 3, 5,
6, 10, 11 from Step 14's continuation remain INCONCLUSIVE for a structural reason, not a
time-budget reason; and that runtime/integration evidence for those tests becomes REQUIRED
input the moment a second business or a real Plan/Crisis writer is wired into `App.tsx`.

## 12. Final decision

**A — INTENTIONAL FUTURE BOUNDARY.**

Recommit/invalidation is real, tested, and correctly designed code built deliberately ahead
of its own integration, per its own header comments and per the explicit "plan only, not
built" status of the only document describing the scenario that would call it. Current
`App.tsx` has one business and no path to produce an identity change; this is not an
oversight, it matches the documented staged-development plan. Runtime recommit is not
required for the current architecture to freeze.

## 13. Exact constraints for Step 15

1. State plainly that `invalidateDownstreamOnRecommit`/`isIdentityChange`/`isCrisisValidFor`
   have zero runtime callers in `App.tsx` or any other production file as of this step.
2. State that Tests 3 (A→B), 5 (restart after A→B), 10 (A→B→C), 11 (A→A) remain
   INCONCLUSIVE, reason RUNTIME INVOCATION PATH ABSENT (structural), not time/scope-budget.
3. State that this absence must NOT be silently treated as resolved by a future step; the
   moment a second business or real Plan/Crisis writer is wired into `App.tsx`, runtime
   evidence for these tests becomes a required gate before that integration can itself be
   marked validated.
4. Reaffirm `recommit.ts`'s own instruction verbatim as a binding constraint on any future
   writer: stamp `businessId`/`biz` at record-creation time from the value committed at that
   moment, never re-stamp from "whatever is current now."

## Git / test / build status (this step)

```
$ git status --short
 M App.tsx
 M src/persistence/queuedWrite.ts
?? (report/log/screenshot artifacts from Steps 13/14, unchanged by this step)
```
No files were edited by Step 14B (Read/Grep/Bash only). The `M` entries on `App.tsx` and
`src/persistence/queuedWrite.ts` predate this step (Step 14A bridge work).

```
$ npx jest
Test Suites: 8 passed, 8 total
Tests:       136 passed, 136 total
```

```
$ npx tsc --noEmit
8 errors — same signature/count as previously reported baseline (App.scanner.adversary.test.tsx x7,
App.test.tsx x1, all "too few arguments" on an unrelated test-helper type mismatch), 0 new.
```
