# HUSTLE ARCHITECTURE — STEP 13: MINIMAL IMPLEMENTATION EXPERIMENT REPORT

## 1. Task and scope

Continuation of `HUSTLE_ARCHITECTURE_STEPS_09_12_REPORT.md`. That report found the
recommit-invalidation contract (`src/domain/recommit.ts` read-side guard +
`src/persistence/recommitInvalidation.ts` best-effort cleanup) was validated only
against SYNTHETIC fixtures — no real writer of `PLAN_KEY`/`CRISIS_KEY` existed
anywhere in the repo (confirmed by grep in that pass). Steps 10–12 were marked
PARTIAL for reasons split into categories A (resolvable by more static reading), B
(requires implementation evidence), C (requires runtime/emulator evidence), D (cannot
yet be resolved — undesigned product content).

This task's sole objective: build the smallest real slice that converts category-B
PARTIALs into implementation evidence. Explicitly forbidden: full Plan implementation
(category D — zero Plan domain logic exists to build against), full Crisis gameplay
wiring, navigation, App.tsx changes, and any change to `recommit.ts`'s guard
semantics.

## 2. Phase 1 — category classification (done before any code was written)

| Steps 9-12 PARTIAL item | Category | Disposition |
|---|---|---|
| Scanner→Crisis contract only specified in intent, no real writer exists | B | **Built this** |
| Stamp-at-creation-timing gap ("future writer must stamp once, not re-derive") | B | **Built this** |
| Plan domain rules entirely undesigned | D | Not touched — no domain logic to build a writer against |
| Whether `jest` actually passes (report only ran `--listTests`) | B | Resolved as a read-only pre-check: `npx jest --silent` → 7 suites / 107 tests, all passing, before any Step 13 code was written |
| Background/foreground lifecycle timing | C | Deferred — RUNTIME EXPERIMENT REQUIRED, Step 14 |
| Real process-kill timing | C | Deferred — RUNTIME EXPERIMENT REQUIRED, Step 14 |

**Proposed slice** (in-scope, no need to pause for approval per task's own
instruction): a minimal, framework-independent Crisis writer + reader —
`launchCrisis`/`readCrisis` — that stamps `biz` once at creation from a
caller-supplied `committedTo`, writes through the existing shared `queuedWrite` to
the existing `CRISIS_KEY`, and reads back through the existing `readJsonKey` +
`isCrisisValidFor` guard. Paired with tests exercising REAL functions (not synthetic
fixtures) including a real recommit scenario.

## 3. Phase 2 — implementation

New file: `src/persistence/crisisWriter.ts`.

- `launchCrisis(committedTo: BusinessId, openingCash: number): Promise<LaunchCrisisResult>`
  — validates both inputs at the boundary (`isBusinessId`, `Number.isFinite &&
  >= 0`), calls the existing `createInitialCrisisState`, writes through the existing
  `queuedWrite`, then re-verifies what's actually on disk before reporting success.
  Returns `{kind:'launched'|'lost-to-recommit-race', state}` — never a bare object,
  so a caller cannot mistake "write call resolved" for "write survived."
- `readCrisis(committedTo: BusinessId | null): Promise<CrisisReadResult>` — reads via
  the existing `readJsonKey`, applies the existing `isCrisisValidFor` unconditionally,
  returns a tagged union (`valid` / `absent` / `invalid-for-current-business` /
  `malformed`).
- No update path exists in this module. No Plan writer was built (category D).

10 constraints check (from the task spec):
1. No change to `recommit.ts` guard semantics — confirmed, file untouched.
2. Only additive callers — confirmed, `crisisWriter.ts` is new, calls into existing
   exports only.
3–4. Guard applied unconditionally on every read — confirmed (`readCrisis` always
   calls `isCrisisValidFor`, no bypass path).
5. Framework-independent — confirmed: no React/RN imports; only
   `@react-native-async-storage/async-storage` transitively via `queuedWrite`, same
   as every other persistence module in this repo.
6. No navigation/UI/App.tsx changes — confirmed, zero touches to those files.
7. Stamp-once discipline — confirmed at the type level (`launchCrisis` has no update
   path) and now also verified NOT to be sufficient alone for identity safety (see §6).
8. No assumed atomicity — confirmed: `launchCrisis` re-reads after write specifically
   because atomicity cannot be assumed; return type surfaces the discrepancy instead
   of hiding it.
9. Plan excluded — confirmed, category D, not built.
10. No commit/push — confirmed, nothing staged or committed.

## 4. Phase 3 — testing

New file: `__tests__/crisisWriter.realwriter.test.ts`. 11 tests, all against the same
mocked-`AsyncStorage` pattern used by `recommit.adversary.test.ts`, but exercising the
REAL `launchCrisis`/`readCrisis`/`invalidateDownstreamOnRecommit` together (first
suite in the repo to do so — every prior recommit test used synthetic fixtures for
Plan/Crisis).

Results:
- `npx tsc --noEmit`: 0 new errors. Same 8 pre-existing errors as the Steps 9-12
  baseline, all confined to `App.test.tsx` / `App.scanner.adversary.test.tsx`
  (unrelated jest-mock typing issue, not touched by this task).
- `npx jest --silent`: **118 / 118 passing**, 8 suites (107 pre-existing + 11 new).
  [Certain] — full output inspected this session, not inferred.

## 5. Phase 4 — adversarial review

Delegated to the `adversary` subagent (model: sonnet, per the session's confirmed
model-selection tiering), scope-limited to the two new files. Verdict: **SHIP WITH
FIXES**. It independently wrote and ran throwaway adversarial tests against the real
stack (not speculation) before reporting.

Findings and disposition:

| Severity | Finding | Fixed? |
|---|---|---|
| MAJOR | `launchCrisis(biz, NaN)` silently persisted `cash: null` on disk despite the type claiming `number` | **Fixed** — `launchCrisis` now throws on non-finite/negative `openingCash`, verified by test |
| MAJOR | Untested real race: `launchCrisis` firing concurrently (no `await` between) with `invalidateDownstreamOnRecommit` for the same business can have its write silently clobbered by the recommit's later-queued `CRISIS_KEY` remove — the caller's promise still resolved with a full state object, storage had nothing | **Fixed** — `launchCrisis` now drains the shared `writeQueue` and re-reads before reporting success, returning `lost-to-recommit-race` when disk doesn't match what was written. New test `adversarial race: launchCrisis fired concurrently...` reproduces the exact scenario and passes. **Limitation, stated in code comment**: this can only detect clobbering already enqueued by the time of the check — a clear enqueued strictly after cannot be waited for; that residual is a live race, not a detection gap, and remains an open question for whatever caller eventually wires this into App.tsx. |
| MINOR | No `isBusinessId` runtime check on `launchCrisis`'s `committedTo`, unlike `isCrisisValidFor` | **Fixed** — now throws at the write boundary instead of failing silently and only surfacing on a later read |
| MINOR | Module docstring conflated "caller discipline" (protects against launch-race data loss) with "identity safety" (protected entirely by the read-side guard, independent of caller discipline) — could mislead a future App.tsx integrator | **Fixed** — docstring corrected to state plainly that identity safety rests on `isCrisisValidFor` alone, and that caller discipline affects a narrower, different risk |

Adversary's SOUND findings (confirmed, no action needed): the core two-layer safety
property (stale-business record never trusted) held under every ordering the
adversary threw at it, including true concurrent fire-without-await interleaving in
both directions; the shipped clear-failure test is a legitimate, non-convenient
simulation of the documented failure mode; `launchCrisis` fails clean (rejected
promise, no fake success) on a genuine `setItem` rejection.

Post-fix, tests were re-run (§4 numbers above already include the fixes — 118/118,
tsc clean of new errors).

## 6. Phase 5 — recheck against Steps 9-12 findings

- **Scanner→Crisis contract**: was "specified in intent, unproven in practice."
  [Certain] Now has a real writer/reader pair exercised against real domain functions
  and a real recommit, including an adversarially-discovered race that was not
  anticipated by the original design and has since been closed (with a stated
  residual limit).
- **Stamp-at-creation-timing gap** (recommit.ts header's KNOWN LATENT GAP): [Certain]
  This experiment does NOT close that gap — it was never closable by a writer's
  internal design alone. The adversary review confirmed identity safety rests
  entirely on `isCrisisValidFor` re-validating on every read, independent of what any
  writer does. `launchCrisis`'s "create once" design affects a different, narrower
  property (avoiding launch-time data loss on a live race), not the provenance gap
  itself. The KNOWN LATENT GAP entry in `recommit.ts`'s header remains accurate and
  should stay as documented — this task adds evidence, not a fix, to that specific
  item.
- **jest passing**: [Certain] resolved affirmatively both at baseline (107/107) and
  post-change (118/118).
- Lifecycle timing (background/foreground, process-kill): untouched, still
  RUNTIME EXPERIMENT REQUIRED — this task did not attempt runtime/emulator work
  (category C, explicitly out of scope, deferred to Step 14).

## 7. What this did NOT prove

- Real device or emulator behavior — everything above is Jest-with-mocked-
  `AsyncStorage`, not a running app. Labeled **REAL-DEVICE-UNVERIFIED** /
  **EMULATOR-UNVERIFIED** per project convention — no emulator or device work
  occurred this session.
- Repeated/partial-progress writes to `CRISIS_KEY` (e.g. after gameplay
  `resolve()`/`nextDay()`) — `launchCrisis` only covers the single create-once write;
  an update path was deliberately not built (category D reasoning extends here: no
  real caller/UI exists yet to design an update contract against).
- The residual "clear enqueued after the check" race described in §5 — acknowledged
  as unresolvable by this module alone, not tested further (would require a caller
  loop, which is out of scope).
- Plan's contract — still entirely undesigned (category D), unaffected by this task.
- Whether any of this survives real AsyncStorage on a real device (I/O latency,
  actual multi-process app-kill timing) — deferred to Step 14 by design.

## 8. Files changed

New (both created, both git-untracked, nothing staged/committed):
- `src/persistence/crisisWriter.ts`
- `__tests__/crisisWriter.realwriter.test.ts`

Modified: none (all pre-existing files, including `recommit.ts`,
`recommitInvalidation.ts`, `queuedWrite.ts`, `logic.ts`, untouched).

`git status --short` at time of writing this report:
```
?? HUSTLE_ARCHITECTURE_STEPS_09_12_REPORT.md
?? __tests__/crisisWriter.realwriter.test.ts
?? src/persistence/crisisWriter.ts
```
(plus this report file itself, once written). No commit or push performed.

## 9. Test failure accounting

- Pre-existing (baseline, before this task, unrelated to this task): 8 `tsc`
  errors confined to `App.test.tsx`/`App.scanner.adversary.test.tsx` (jest-mock
  callback arity typing) — unchanged count before and after this task.
- New failures introduced by this task and left unresolved: **none**. Two rounds of
  test failures occurred DURING development (readCrisis malformed-vs-absent
  semantics mismatch; the adversary-flagged clobber race) — both were root-caused and
  fixed before this report was written, not left as known-broken.
- Unrelated failures: none observed.

## 10. Completion gate

- [x] Phase 1 slice proposed and scoped before implementation
- [x] Phase 2 implementation stayed within the 10 constraints
- [x] Phase 3 narrow-then-broad testing, pre-existing vs new failures separated
- [x] Phase 4 adversarial review performed by an independent subagent, findings
      fixed and re-verified (not self-graded as done without a second look)
- [x] Phase 5 recheck against Steps 9-12 performed, conclusions updated only where
      evidence required it
- [x] Report written with all required sections
- [x] No commit/push performed
- [x] No navigation, Plan, or App.tsx work performed

## 11. Explicit stop condition

**STOP after Step 13.** Do not proceed to Step 14 (runtime/emulator validation) or
Step 15 (architecture freeze) without explicit instruction. The architecture is not
declared production-ready or frozen by this report — category-C items (lifecycle
timing under real backgrounding/process-kill) remain fully unvalidated, and this was
Jest-only evidence, not emulator or device evidence.
