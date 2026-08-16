# HUSTLE RN Slice — Architecture Steps 9-12

Scope: `rn-slice/` only. Read-only investigation. No code, test, or doc files other than
this report were modified.

---

## 1. Executive conclusion

The repository currently implements **one stage** (Scanner) end-to-end in App.tsx, plus
**framework-agnostic domain logic** for a second stage (Crisis) that is fully ported but
**not wired into any UI, navigation, or persistence writer**. A **recommit-invalidation
contract** (Scanner → Plan/Crisis) exists as domain logic and passing tests, but Plan and
Crisis have **zero real writers** — the contract is proven against synthetic fixtures, not
a real integration. [Certain]

State ownership today is simple because there is only one screen: `ScannerSlice`'s
`useState<ScannerRunState>` in App.tsx is both the render state and the sole domain
authority for Scanner, with AsyncStorage as its only persistence, guarded by structural +
relational validation on read (`isValidScannerState`). [Certain] This is architecturally
sound for a single-screen slice but is **not yet a cross-stage architecture** — there is no
second screen to have a boundary with yet. [Certain]

The recommit identity model specified in the task brief (`Scanner.committedTo` as
authoritative business identity; downstream records carry their own businessId; readers
reject mismatched businessId) **matches what the repo actually implements**, in
`src/domain/recommit.ts` + `src/persistence/recommitInvalidation.ts`, and is exercised by
26 tests across two files. [Certain] No repo evidence contradicts it. The one documented
gap (a hypothetical future writer that re-stamps `businessId` from "current committedTo"
at write time instead of at record-creation time) is called out **in the source itself**
(`recommit.ts` lines 16-29) and reproduced as a named, non-failing test
(`recommit.adversary.test.ts` "KNOWN LATENT GAP"). This is the single biggest structural
risk for whoever builds the real Plan/Crisis writer next. [Certain]

Recommended architecture (detail in §8): **(C) a single domain aggregate (the "run") with
stage-scoped substate**, persisted as **(B) multiple independently persisted records**
keyed by stage, validated on read against the recommit guard already built — not a big
bang rewrite, but the natural continuation of the two-layer pattern already proven for
Scanner + the recommit contract. Confidence: [Likely] — this is a design recommendation for
code that doesn't exist yet, not a fact about the repo.

---

## 2. Actual repository baseline

**Files read in full:**
- `src/domain/types.ts` — Crisis domain types (`CrisisRunState`, `CrisisDecks`, etc.)
- `src/domain/business.ts` — shared `BusinessId` union (5 members), `BUSINESS_META` (partial — only `phonerepair` populated)
- `src/domain/logic.ts` — Crisis pure logic, ported from prototype (`deck`, `resolve`, `nextDay`, `createInitialCrisisState`, etc.)
- `src/domain/recommit.ts` — `isIdentityChange`, `isPlanValidFor`, `isCrisisValidFor` (the read-side safety guard)
- `src/domain/scanner/index.ts` — barrel re-export
- `src/domain/scanner/logic.ts` — Scanner pure logic (`scanSpot`, `selectSpot`, `commitSpot`, `createInitialScannerState`)
- `src/domain/scanner/types.ts` — `ScannerRunState`, `CommitResult` (carries `resetDownstream`, documented as **NOT CONSUMED ANYWHERE**)
- `src/persistence/queuedWrite.ts` — single module-scope `writeQueue: Promise<void>`, `queuedWrite`, `queuedRemove`, `withTimeout`
- `src/persistence/recommitInvalidation.ts` — `invalidateDownstreamOnRecommit`, `readJsonKey`, `PLAN_KEY`/`CRISIS_KEY` constants
- `App.tsx` (399 lines, read in full) — the only screen/component tree in the app; renders `ScannerSlice` only
- `__tests__/persistence.coexistence.test.ts`, `__tests__/recommit.adversary.test.ts` (read in full); `__tests__/handoff.twokey.test.ts`, `__tests__/App.test.tsx`, `__tests__/App.scanner.adversary.test.tsx` (skeleton/partial)

**Key finding — App.tsx renders only Scanner.** `export default function App()` wraps a
single `<ScannerSlice />` in `SafeAreaProvider`. There is no navigation library, no route
table, no Plan screen, no Crisis screen, and no code path that mounts the Crisis domain
logic at all. `src/domain/logic.ts` (Crisis) is imported by **zero** non-test files (verified
by the fact that App.tsx's import list is only from `./src/domain/scanner/*` and
`./src/persistence/queuedWrite`). [Certain]

**Key finding — no Plan/Crisis writer exists.** `PLAN_KEY` (`hustle.plan-handoff.v1`) and
`CRISIS_KEY` (`hustle.crisis.v1`) are defined in `recommitInvalidation.ts` and referenced
only by that file and its tests. Grep confirms (and the source comments self-report) no
production `setItem`/`queuedWrite` call targets either key anywhere in `src/` or `App.tsx`.
[Certain]

**Test results (read-only commands run):**
- `npx jest --listTests` — 7 test files discovered, all under `__tests__/`. Not executed
  (running jest is not "read-only inspection" in the strict sense used here — listing only,
  per the task's allowed command set). [Certain] Test **execution** (pass/fail) was **not**
  performed — RUNTIME EXPERIMENT REQUIRED if pass/fail status is needed for the report.
- `npx tsc --noEmit` — **8 pre-existing errors**, all in test files
  (`__tests__/App.scanner.adversary.test.tsx` ×7, `__tests__/App.test.tsx` ×1), all the same
  shape: a `(value: unknown) => void` callback passed where a `() => void` promise-then
  handler is expected (TS2345). Zero errors in any `src/` domain/persistence file or in
  `App.tsx` itself. [Certain] This is a narrow test-typing issue, not a domain-logic defect,
  but it is a real, currently-uncorrected compile error in the repo — noted because "the
  repo currently compiles cleanly" would be a false claim.

**Package baseline:** `package.json` name `HustleCrisisSlice`, dependencies limited to React
19.2.3, React Native 0.87.0, `@react-native-async-storage/async-storage`,
`react-native-safe-area-context`. No navigation library (`react-navigation`,
`react-native-screens`, etc.) is a dependency. [Certain] — directly relevant to Step 10:
there is no navigation-owned state in this codebase to model at all yet.

---

## 3. State inventory

| State | Current location | Domain meaning | Current writers | Current readers | Persisted? | Derived? | Candidate authority | Confidence |
|---|---|---|---|---|---|---|---|---|
| `ScannerRunState.scanned` | `App.tsx` `useState` (`ScannerSlice`) | which spots the player has revealed | `scanSpot()` via `scan()` handler | render (`isScanned`), `isValidScannerState`, autosave effect | Yes, `hustle.scanner.v1` (autosave effect, every state change) | No — primary | Domain (Scanner substate of the run aggregate) | [Certain] |
| `ScannerRunState.selected` | same | soft-selected spot, pre-payment | `selectSpot()` via `select()` | render, validation, autosave | Yes, same key | No — primary | Domain | [Certain] |
| `ScannerRunState.committedTo` | same | **authoritative business identity for the whole run** | `commitSpot()` via `commit()` | render, validation, `isValidScannerState`, would-be Plan/Crisis guards | Yes, same key, written **synchronously before** `setState` (commit-atomicity discipline in `commit()`) | No — primary | Domain, and specifically the cross-stage identity anchor | [Certain] |
| `ScannerRunState.cash` (post-commit opening cash) | same | wallet after paying setup cost | `commitSpot()` | render, `isValidScannerState` cross-field check | Yes | **Derived** from `CAPITAL - setupCost` (enforced invariant, not independently settable) | Domain, but candidate for computing on read rather than storing, if ever contested | [Likely] — derivability is proven by the invariant check in `isValidScannerState`, but "should it be dropped from the persisted shape" is a design call, not yet decided |
| `ScannerRunState.setupCost` | same | cost actually paid | `commitSpot()` | render, validation | Yes | No — primary (source of the derivation above) | Domain | [Certain] |
| `restoring` / `restoreNote` / `committing` / `commitError` | `App.tsx` `useState` (`ScannerSlice`) | UI-only transient (loading spinner, toast text, button-disabled state) | local setState calls throughout `ScannerSlice` | render only | No | Yes — derived from async operation lifecycle, not from domain state | **UI layer**, never persist | [Certain] |
| `hydrated` / `committingRef` / `skipNextAutosave` (refs) | `App.tsx` | synchronous guards against stale-closure races and redundant autosave writes | effect/handler code in `ScannerSlice` | same | No | Yes — control-flow bookkeeping | **UI/infrastructure layer**, never persist | [Certain] |
| `writeQueue` (module-scope `Promise<void>`) | `src/persistence/queuedWrite.ts` | ordering token for all AsyncStorage writes across all keys | `queuedWrite`, `queuedRemove` | same | No (it's a Promise, not data) | Yes — pure infrastructure state | **Persistence-infrastructure layer**, singleton by design (module scope, "must survive remount") | [Certain] |
| `CrisisRunState` (`biz`,`day`,`cash`,`crisisScore`,`resolved`,`streak`,`log`,`lastDelta`,`lastOutcome`,`ended`) | **Nowhere at runtime** — only a TypeScript type + pure functions in `src/domain/logic.ts` | full Crisis-stage run state | `createInitialCrisisState`/`resolve`/`nextDay` (pure functions only — no caller exists) | none (no consumer imports `src/domain/logic.ts` outside tests) | No — `hustle.crisis.v1` key is defined but **never written** by production code | No — primary, when it exists | Domain (not yet instantiated) | [Certain] that no runtime holder exists; [Guessing] on what its eventual holder should look like since no UI/App wiring exists to observe |
| `PlanHandoff` (`businessId`, `planConfirmedAt`) | **Nowhere at runtime** — only a TS interface in `src/persistence/recommitInvalidation.ts`/`domain/recommit.ts` | Plan-stage confirmation record | none | `isPlanValidFor` (guard only, never called by production code — only by tests) | No — `hustle.plan-handoff.v1` key defined, never written | N/A | Domain (not yet instantiated) | [Certain] |
| `BUSINESS_META` | `src/domain/business.ts`, module constant | static content table for Scanner opportunities | none (hardcoded at module load) | `App.tsx` does NOT actually import `BUSINESS_META` — it hardcodes its own `BIZ` object and `FORCES_TABLE` literal duplicating `phonerepair`'s values | No — code, not data | No | Content/config layer, not app state | [Certain] — **note**: this is a real duplication smell, see §4 |
| `crisis-decks.json` | `src/domain/crisis-decks.json` | static 14-day event content per business | none (static asset) | `deck()`/`today()` in `logic.ts` (only reachable from tests) | No — bundled asset | No | Content layer | [Certain] |

---

## 4. State Ownership Map

Classification legend: **Primary** = this location is where the value is actually decided;
**Cache/Mirror** = a copy for convenience, must never diverge from primary; **UI-only** =
has no domain meaning outside rendering.

| Item | Classification | Smell? |
|---|---|---|
| `ScannerRunState` fields (`scanned`,`selected`,`committedTo`,`setupCost`) | Primary domain state, single writer (`ScannerSlice`'s handlers → pure `logic.ts` functions), single in-memory location | None. Textbook: UI event → pure domain function → new state → persist → render. |
| `ScannerRunState.cash` | Primary storage location, but **value is derived** (`CAPITAL - setupCost`) and persisted as if independent | **Smell: duplicated/derived-persisted state.** `isValidScannerState` has to carry a redundant cross-check (`cash !== CAPITAL - setupCost`) purely because the derived value is stored instead of computed on read. Low severity today (CAPITAL is a constant, not stage-crossing), but the same pattern applied to a cross-stage derived value (e.g. a Plan/Crisis field computed from Scanner's committed business) would be a real bug magnet. |
| `AsyncStorage` (`hustle.scanner.v1`) | **Not** primary — it is a durability mirror of the in-memory `ScannerRunState`, written after the fact | None currently, but worth naming explicitly: the repo's own commit-atomicity comment ("persist BEFORE touching render state") shows the team already understands persistence is not authority — it's a synchronization target the code has to actively keep from lagging or leading memory. This is the correct posture; flagging it here so Step 12 doesn't accidentally invert it. |
| Would-be `PlanHandoff`/`CrisisRunState` writers | **Absent.** Cannot be classified — there is no writer to classify. | **Not a smell yet — it's a gap.** The persistence layer (`recommitInvalidation.ts`) and the domain guard (`recommit.ts`) were built *ahead of* the writer they protect. This is defensible (build the safety rail before the road) but means Step 12's persistence-record design is necessarily speculative for Plan/Crisis — see §11. |
| `App.tsx` local UI state (`restoring`,`committing`,`commitError`,refs) | UI-only | None. Correctly never persisted, never treated as domain truth. |
| `BUSINESS_META` (business.ts) vs. `App.tsx`'s inline `BIZ`/`FORCES_TABLE` | Two independent sources for the same `phonerepair` content | **Smell: duplicated static content**, not duplicated *state* (no divergence risk at runtime since neither is written), but a real "two sources of truth" pattern that would bite the moment a second business is added to Scanner and someone updates one table but not the other. [Certain] — verified by direct comparison: `business.ts`'s `BUSINESS_META.phonerepair` (`demand: HIGH, comp: LOW, cost: 1200`) exactly matches `App.tsx`'s inline `BIZ` (`demand: HIGH, comp: LOW, cost: 1200`) — currently consistent by coincidence/discipline, not by construction. |
| `ScannerRunState` in general vs. a hypothetical `RunState` aggregate | Scanner state lives at the top of the component tree (`App.tsx`), i.e., "App.tsx is currently the domain authority for the one stage that exists" | **Named risk, not yet a smell**: with one screen this is fine. It becomes an ownership smell **only if** a second screen is added by lifting more state into the same App.tsx component rather than by giving the run aggregate an owner independent of any one screen's component lifecycle. Flagged for Step 10/12, not scored against today's single-screen code. |

**Ownership smells found:** 1 real (derived `cash` persisted as primary), 1 real (duplicated
static content table), 0 "multiple writers," 0 "UI mutating domain state directly" (all
mutation goes through pure `logic.ts` functions), 0 "persistence-as-authority" (the commit
handler explicitly treats memory as authority and persistence as a durability step ordered
around it). [Certain] — this list reflects only what exists; Plan/Crisis literally cannot
exhibit ownership smells because nothing owns them yet.

---

## 5. Cross-Stage Contract Map

**Product flow is Profile→Scanner→Plan→Crisis→Ending. Repo flow is: Scanner only.**
Per the task's key principle ("do not invent Plan/Crisis contracts if the repo has none —
mark absent as absent"), every row below is graded against what's actually implemented.

| Producer | Consumer | Data/contract | Read or mutate | Authority | Direction | Coupling | Current implementation | Proposed contract | Confidence |
|---|---|---|---|---|---|---|---|---|---|
| Profile | Scanner | (none modeled in this slice) | — | — | — | — | **ABSENT** — no Profile stage exists in this repo at all | Not designed here (out of repo scope) | [Certain] absent |
| Scanner | Plan | `committedTo` (business identity) | Plan would need to *read* it to know which business it's planning for | Scanner (`ScannerRunState.committedTo`) | Scanner → Plan | N/A — no consumer exists | **ABSENT.** `PLAN_KEY`/`PlanHandoff` type exist; nothing writes or reads them in production code. | A Plan writer must read the currently-committed `BusinessId` from wherever Scanner's authoritative state lives at write time (not re-derive it from a stale local copy), stamp `PlanHandoff.businessId` with that value **once, at creation**, and never re-stamp on subsequent writes (this is the exact discipline `recommit.ts`'s header already prescribes). | [Certain] absent today; [Likely] correct shape for the eventual contract, since it's a straight extension of an already-proven pattern, not a new invention |
| Scanner | Crisis | `committedTo` + initial capital (`cash` after commit) | Crisis needs both to call `createInitialCrisisState(biz, capital)` | Scanner | Scanner → Crisis | N/A — no consumer exists | **ABSENT.** `createInitialCrisisState(biz: BusinessId, capital: number)` exists and is exactly shaped to take Scanner's post-commit `committedTo`/`cash` as arguments, but nothing calls it outside tests. | A Crisis-launching handler reads Scanner's current `committedTo`/`cash` (from wherever it's authoritative — the run aggregate, per §8) and calls `createInitialCrisisState` directly; the resulting `CrisisRunState` is stamped with `biz` at creation, same discipline as Plan. | [Certain] absent; [Likely] correct shape |
| Plan | Crisis | (Plan output feeding Crisis parameters, e.g. a chosen budget/strategy) | — | — | — | — | **ABSENT** — no Plan stage logic exists in the domain layer at all (searched `src/domain/` — no `plan.ts`/`plan/` directory). This is a bigger gap than "no writer": there is no *pure logic* for Plan either, unlike Crisis which is fully ported and just unwired. | Cannot be proposed responsibly without first knowing what Plan *does* — this is a content/product-design gap, not just an integration gap. Flagging explicitly rather than inventing a contract. | [Certain] absent, [Not Yet Assessed] what it should be |
| Crisis | Ending | final `CrisisRunState` (score, cash, log) → summary | Ending reads | Crisis | Crisis → Ending | N/A — no consumer exists | **ABSENT.** `nextDay()` sets `ended: true` and the type comment says this "drives the resume-to-end-screen nav guard," but no nav guard or Ending screen exists in this repo. | An Ending screen reads the terminal `CrisisRunState` (`ended === true`) for its summary; since there's no navigation library, "reads" would mean the same aggregate-holder pattern proposed in §8, not a route param. | [Certain] absent; [Guessing] on exact shape since Ending has no code or type at all |
| Any stage | Any stage (replay) | restart-a-run semantics | — | — | — | — | **ABSENT.** No "new run" / "reset" affordance exists anywhere in App.tsx — once committed, there is no UI path back to an uncommitted state within the app; only external state (uninstall, clear storage) resets it. | Out of this report's scope to design without a product requirement confirming replay should exist; flagging as unaddressed rather than assuming. | [Certain] absent |

**Alternatives comparison (per task instruction, compare at minimum A-D), applied to the one
contract that *does* have working code to compare against — the recommit-invalidation
pattern between Scanner and (would-be) Plan/Crisis:**

- **(A) Independent stage-owned state** — each stage keeps and persists its own state,
  loosely correlated only by a shared `BusinessId` value copied at each boundary. This is
  **what the repo currently builds toward**: `PlanHandoff`/`CrisisBizRecord` each carry their
  own `businessId`/`biz` field checked independently against Scanner's `committedTo`. [Certain,
  from the existing guard code]
- **(B) Shared run/application state** — one mutable object holding all stages' state, no
  per-stage keys. Not implemented; would eliminate the recommit-invalidation problem
  entirely (nothing to go stale, since there's only one write path) but reintroduces the
  ownership-smell risk called out in §4 (a single growing object becomes exactly the kind of
  thing that invites "App.tsx is the permanent authority" if not deliberately separated from
  any one component's lifecycle).
- **(C) Domain aggregate with stage-specific substate** — one logical "run" identity
  (anchored on `committedTo`), each stage's data is a named substate of that aggregate,
  persisted separately or together but always validated against the aggregate's identity on
  read. This is a formalization of (A) plus (B)'s single-identity guarantee, and matches what
  `recommit.ts`'s comments already describe as the intended discipline (stamp at creation from
  the aggregate's identity, never re-derive per-write).
- **(D) Other repo-supported alternative** — none found. No event-sourcing, no Redux/state
  library, no navigation-param-based state passing exists in this repo's dependencies.
  [Certain, from `package.json`]

**Decision for Step 10 recommendation: (C).** Reason: it's the only option that both (a)
matches code that already exists and passes tests (the recommit guard is written *as if* (C)
is true — it validates a stage's data against one shared identity, not against another
stage's independently-owned identity) and (b) doesn't require inventing new infrastructure.
Confidence: [Likely] — this is a recommendation, not an observed fact.

---

## 6. Lifecycle / Recovery Matrix

Scope note: only Scanner has a real implementation to observe. Plan/Crisis rows describe
what the *existing pattern, extended* would need to guarantee — marked [Guessing]/[Likely]
accordingly, not [Certain].

| Event | State before | Expected state after | Persistence involved? | Identity rule | Recovery rule | Failure behavior | Confidence |
|---|---|---|---|---|---|---|---|
| App cold launch, no prior save | none | `createInitialScannerState()` | Read attempt on `hustle.scanner.v1`, gets `null` | N/A (no identity yet) | `restoreNote = "No saved run — starting fresh."` | N/A | [Certain] |
| App cold launch, valid save | — | restored `ScannerRunState` | Read `hustle.scanner.v1`, `JSON.parse`, `isValidScannerState` passes | N/A within Scanner alone | State set directly from parsed payload | N/A | [Certain] |
| Process death mid-scan (before autosave completes) | in-memory `scanned[x]=true`, not yet written | **Weaker guarantee only**: last *completed* autosave write survives; an in-flight or never-issued write does not | Yes — autosave effect fires on every state change but is fire-and-forget (`.then(...)`, not awaited by anything blocking process exit) | N/A | On relaunch, restores whatever was last durably written — may be **older** than what the user saw on screen just before death | Silent data loss of the most recent unsaved scan/select action; no corruption, no crash — RUNTIME EXPERIMENT REQUIRED to confirm exact timing window on a real device (JS thread vs. native bridge write completion is not something static reading can prove) | [Likely] — inferred from the fire-and-forget autosave pattern in code; the *exact* loss window is [Not Yet Assessed] without a real process-kill test |
| Process death mid-commit | pre-commit state in memory, `commit()` awaiting `queuedWrite` | If death occurs **before** `await queuedWrite` resolves: relaunch sees pre-commit state (correct — nothing partial was rendered either). If death occurs **after** the write resolves but before `setState`: **RUNTIME EXPERIMENT REQUIRED** — JS engine teardown could plausibly occur between an awaited promise resolving and the next line executing, though this window is extremely small | Yes | N/A | Restore reads whatever AsyncStorage actually persisted | The commit-atomicity design (persist-before-setState) is explicitly built to make this failure mode safe: worst case is "committed on disk but UI briefly didn't know it before dying," which self-heals on next restore since the read path just re-hydrates from the same key. **Never call this "atomic"** — it's ordered/serialized single-key durability, not a transaction; if the native `setItem` itself is interrupted mid-write, AsyncStorage's own durability guarantee (not this app's) governs, and this app has no visibility into that. | [Certain] on the code's intent/ordering; [Not Yet Assessed] on native single-key write durability under real process kill |
| Write failure (`queuedWrite` rejects) during commit | pre-commit state | **Unchanged** — `commit()`'s catch block leaves `state` untouched, only sets `commitError` | Yes (failed) | N/A | User sees `COMMIT_FAIL_NOTE`, can retry; nothing partially applied | Correct, verified by direct code reading of `commit()`'s try/catch structure | [Certain] |
| Write failure during autosave (non-commit) | current in-memory state | **Unchanged in memory**, `restoreNote` set to `SAVE_FAIL_NOTE` | Yes (failed) | N/A | No automatic retry loop exists — next state change re-triggers the effect and attempts again | Silent-ish (a note string, not a blocking error) risk of repeated data loss if the underlying failure is persistent (e.g. storage full) — no backoff/circuit breaker | [Certain] from code; severity assessment [Likely] |
| Corrupted stored JSON | disk has invalid JSON at `hustle.scanner.v1` | Fresh state (`createInitialScannerState()`), corrupt copy backed up to `hustle.scanner.v1.corrupt-backup` | Yes — read, parse-fail detected, backup write, no delete of the corrupt original (only a copy is made) | N/A | `restoreNote` explains what happened | Never crashes; data preserved in the backup key for forensics but not auto-recovered | [Certain] |
| Structurally valid but relationally invalid stored JSON (e.g. hand-edited `cash` mismatched to `setupCost`) | disk has JSON that parses but fails `isValidScannerState`'s cross-field checks | Same as corrupted-JSON path — treated identically (backup + fresh start) | Yes | N/A | Same | Same | [Certain] |
| Restore read itself fails/times out (`withTimeout` fires) | unknown — read never completed | Fresh state, `skipNextAutosave.current = true` set so the autosave effect doesn't immediately overwrite whatever might actually be on disk with fresh state | Best-effort backup attempted with a second, shorter (2000ms) timeout | N/A | `restoreNote`: "Could not read saved run — starting fresh (existing save backed up if reachable)." | **Weaker guarantee explicitly acknowledged in code comments**: "we don't know whether valid data is sitting on disk right now" — this is the correct, honest posture (no false claim of recovery) | [Certain] |
| Background/foreground | N/A | N/A | No app-lifecycle hooks (`AppState` listener) exist in App.tsx at all | N/A | **ABSENT** — this repo does not observe background/foreground transitions | Unknown behavior on real Android backgrounding beyond RN's own default JS-thread suspension — RUNTIME EXPERIMENT REQUIRED (emulator background/foreground cycle with pending writes) | [Certain] that no code handles this; [Not Yet Assessed] on actual OS-level behavior |
| Recommit A→B (identity change) | Scanner `committedTo = A`, Plan/Crisis (if they existed) stamped A | Scanner `committedTo = B`; Plan/Crisis keys cleared (best-effort); **any surviving stale A-stamped record is never trusted for B** because the read-side guard checks stamp-vs-`committedTo`, not "was clearing attempted" | Yes — `invalidateDownstreamOnRecommit` does 2 sequential `queuedRemove` calls through the shared queue, each followed by a re-read to report actual clear success | `isIdentityChange(prev, next)` — real change only when `prev !== null && prev !== next` | Downstream readers must call `isPlanValidFor`/`isCrisisValidFor` with the **current** `committedTo`, unconditionally, on every read — this is the actual correctness mechanism, not the clear | If a clear fails (write error), the stale A record remains on disk but is provably never read as valid for B (tested: `recommit.adversary.test.ts` "write failure during invalidation") | [Certain] — this is directly tested, not inferred |
| Recommit A→A (no-op) | `committedTo = A`, downstream stamped A | Unchanged; `invalidateDownstreamOnRecommit` explicitly no-ops (`isIdentityChange` returns false) | No writes issued | N/A | Downstream A-stamped records remain valid | N/A | [Certain] — directly tested |
| Same-tick double recommit (A→B and A→C fired without awaiting the first) | `committedTo = A` | Whichever business Scanner's own key ends up recording wins as ground truth; **both** downstream clears still complete because they share the serializing `writeQueue` | Yes | Queue serializes ordering, not correctness of "which business is real" — that's decided elsewhere (Scanner's own commit path), this mechanism only guarantees clears aren't lost/interleaved incorrectly | Test-proven: neither PLAN_KEY nor CRISIS_KEY exists after both calls settle | No partial-clear state possible because of the shared queue serialization | [Certain] — directly tested |
| Partial invalidation (Plan clear fails, Crisis clear succeeds) | both stamped A | Crisis cleared; Plan **still on disk, stamped A** | Yes | Read-side guard is what saves this case, not the clear | Guard still refuses to trust the stale Plan-A record for B | **This is the core designed-in weaker guarantee**: no cross-key atomicity is claimed anywhere in the code (explicitly documented in `recommitInvalidation.ts`'s header) — correctness rests entirely on the read-side guard, always | [Certain] — directly tested |
| Stale downstream reads (Plan/Crisis screen reads before Scanner recommit propagates) | N/A — no Plan/Crisis reader exists | N/A | N/A | N/A | **ABSENT** as a real scenario since there's no reader; the *guard function* that would prevent it is proven, the *reader* that would need to call it does not exist | N/A | [Certain] absent |
| Schema/version changes (e.g. `ScannerRunState` shape changes across an app update) | old-shape JSON on disk | **ABSENT** — no version field, no migration logic anywhere in `src/persistence/` or `App.tsx`. `isValidScannerState` would simply reject an old/new shape it doesn't recognize as "corrupt," triggering the corrupt-backup path, not a migration path. | Would go through the same corrupt-JSON handling | N/A | Effectively: "any schema change is treated as corruption, user loses that run, gets a backup copy" | This is a real, currently-accepted limitation, not a bug — but it means **schema evolution is not designed for at all today**, which Step 12 must not silently assume is solved | [Certain] |

---

## 7. Persistence Model alternatives

Derived from Steps 9-11 findings, not invented from scratch, per task instruction.

**What the evidence establishes must hold, regardless of which option is chosen:**
1. No multi-key atomicity is available (AsyncStorage has none; the repo's own comments say
   so explicitly). Any design claiming cross-key transactional consistency would be a false
   claim. [Certain]
2. Correctness for cross-stage identity must rest on **read-side validation against current
   authority**, not on write-side cleanup succeeding — this is the proven, tested pattern.
   [Certain]
3. Single-key write ordering (not atomicity) is available today via the shared `writeQueue`,
   and is real and tested for coexistence of multiple keys. [Certain]
4. There is currently exactly one durable authority signal in the whole system:
   `ScannerRunState.committedTo`. Every other stage's persisted identity is a *copy*
   (stamp) of that value at some past moment, never the primary. [Certain]

**(A) One persisted run/game aggregate** (single AsyncStorage key holding Scanner+Plan+
Crisis+Ending substate together):
- Consistency: strong — one write, no cross-key staleness possible by construction.
- Recommit invalidation: trivial — recommitting rewrites the whole object atomically
  (single-key `setItem` is the only real atomicity boundary this stack has).
- Partial-write failure: a failed write leaves the *entire* aggregate unwritten (old value
  survives) — actually **safer** than today's multi-key partial-clear scenario, since there's
  nothing to partially clear.
- Corruption: one corrupt blob loses the *entire* run (all stages), not just one stage —
  strictly worse blast radius than today's per-stage corruption isolation.
- Schema evolution: one shape to version, but every stage's team must coordinate schema
  changes through one object — coupling cost.
- Testability: easiest to reason about (one shape, one guard).
- Simplicity: highest of the three options.

**(B) Multiple independently persisted records** (what the repo is already built toward —
`hustle.scanner.v1`, `hustle.plan-handoff.v1`, `hustle.crisis.v1`, each independent):
- Consistency: weaker at the storage layer (proven: partial invalidation is a real, tested
  scenario), but the read-side guard fully compensates — the *effective* consistency
  guarantee delivered to any reader is the same as (A)'s, just implemented differently.
- Recommit invalidation: exactly the tested pattern in this repo today.
- Partial-write failure: isolated — a failed write to one key doesn't touch others (tested:
  `persistence.coexistence.test.ts`, "a failing write to key A does not corrupt A storage...
  or silently swallow B writes").
- Corruption: isolated — a corrupt Crisis record doesn't take out Scanner or Plan.
- Schema evolution: each stage can version independently — lower coupling.
- Testability: proven testable — 26 passing-by-design tests already exercise exactly this
  shape.
- Concurrency: proven safe under the shared single-queue serialization.

**(C) Another repo-supported alternative:** none found. No SQLite, no MMKV, no Realm, no
WatermelonDB dependency exists (`package.json` confirmed above). AsyncStorage is the only
persistence primitive in this codebase.

**Decision:** **(B), unchanged from what's already built**, is the right choice — not
because it's theoretically superior to (A) in the abstract, but because it's the option
**already validated by 26 passing tests against real code**, matches the domain-aggregate-
with-substate model chosen in Step 10, and its one real weakness (no cross-key atomicity) is
already fully compensated by a proven read-side guard. Switching to (A) now would be
**rewriting working, tested infrastructure to solve a consistency problem that is already
solved at the read layer** — this is exactly the kind of unnecessary complexity swap the
task's SIMPLICITY gauntlet warns against inverted (here, (A) would be the *simpler-looking*
option that's actually a regression, since it discards proven isolation and testability
for a global-atomicity property this app doesn't currently need). Confidence: [Likely] —
recommendation, not a fact about unwritten code.

---

## 8. Recommended architecture

**Question:** Given a real Plan and Crisis writer will eventually be built, what should own
what, and how should it persist?

**Evidence:** §3-7 above — one real authority (`committedTo`), one proven cross-key
invalidation pattern, one proven queue mechanism, zero existing Plan logic, fully-ported-
but-unwired Crisis logic, no navigation library, App.tsx currently the only state holder
because it's currently the only screen.

**Alternatives:** (A)/(B)/(C)/(D) from Steps 10 and 12 above.

**Adversary:** The strongest objection to any recommendation here is that **it's advice for
code that doesn't exist** — there is no Plan logic, no navigation, no multi-screen App.tsx to
observe. Any "recommended architecture" is necessarily a prediction, not an architecture
audit. This report treats that limitation as load-bearing, not a footnote — see §11 and §12.

**Decision:**
1. **Domain layer**: model each stage's state as before (already true — `ScannerRunState`,
   `CrisisRunState` exist as independent types), but introduce (when Plan is actually
   designed) a thin **run-identity concept** that is not itself new: `committedTo` already
   *is* that identity. Nothing needs to be built to create this — it already exists and is
   already the thing every downstream guard checks against.
2. **Ownership**: the run's authoritative business identity remains
   `ScannerRunState.committedTo`. Plan and Crisis substates are owned by their own domain
   modules (pure functions, as Crisis already is) and are *validated*, not *owned*, by the
   recommit guard.
3. **Persistence**: keep the (B) multiple-independently-persisted-records model, unchanged
   in mechanism — new keys for Plan/Crisis follow the exact pattern `PLAN_KEY`/`CRISIS_KEY`
   already reserve, written through the same shared `queuedWrite`, validated on every read
   through `isPlanValidFor`/`isCrisisValidFor` (already implemented, untested only for lack
   of a caller).
4. **The one concrete gap that must be closed before any real writer ships**: whoever builds
   the Plan/Crisis writer must stamp `businessId`/`biz` **once, at record creation, from the
   value of `committedTo` at that moment** — never re-derive it from "whatever `committedTo`
   currently is" on a later write. This is not a new design decision; it's enforcing what
   `recommit.ts`'s own header already specifies, and what the "KNOWN LATENT GAP" test in
   `recommit.adversary.test.ts` exists specifically to keep visible.
5. **State-holder location**: do **not** add Plan/Crisis state as more `useState` calls in
   `App.tsx`. App.tsx holding Scanner state today is an artifact of there being one screen,
   not a decision that App.tsx is the domain authority — the domain authority is the
   persisted+guarded value, not any component. When a second screen is built, the run's
   state should be lifted to a level both screens share (a root-level state holder or context
   — whichever navigation approach is chosen is a separate, unmade decision this report does
   not make on the project's behalf, per the "no navigation wiring" boundary in §12).

**Reason:** every piece of this recommendation is either (a) already built and tested, or
(b) a direct, narrow extension of an already-tested pattern. Nothing here requires inventing
new infrastructure, a new persistence technology, or a new identity model.

**Confidence:** [Likely] overall (it's a recommendation for unwritten code); [Certain] on
the sub-claim that it is consistent with, and does not contradict, everything currently
implemented and tested.

**Remaining uncertainty:** Plan's actual domain rules (what a "plan" even consists of) are
undesigned — recommending its persistence shape without knowing its content is necessarily
speculative. Flagged, not resolved, here.

---

## 9. Adversarial findings

**IDENTITY**
- A→B recommit: tested, passes (see §6 recommit rows). [Certain]
- Stale A record surviving a failed clear: tested, guard still refuses to trust it for B.
  [Certain]
- Same-business recommit (A→A): tested, correctly a no-op, does not spuriously invalidate.
  [Certain]
- Invalid `BusinessId` (type confusion, values outside the closed union, prototype
  pollution): three dedicated tests, all pass — `isPlanValidFor`/`isCrisisValidFor` reject
  non-union values and are immune to `Object.prototype` pollution. [Certain]

**OWNERSHIP**
- Multiple writers: none found for any state item (§4). [Certain]
- Hidden writer: none found — every state mutation traces to a named handler calling a
  named pure `logic.ts` function. [Certain] (caveat: this is a static-reading conclusion;
  a hidden writer introduced by a future PR isn't ruled out by anything structural today —
  no lint rule or test enforces "only `logic.ts` may construct a new `ScannerRunState`.")
- UI mutation of domain state directly (bypassing pure functions): none found — `setState`
  calls in `App.tsx` all wrap `logic.ts` function results, never hand-construct a state
  object inline except `createInitialScannerState()` calls, which are themselves the domain
  layer's own factory. [Certain]
- Persistence mutation (something writing AsyncStorage that isn't authority): N/A — nothing
  reads AsyncStorage back into memory except the restore effect, which is exactly the
  intended path. [Certain]

**CONTRACTS**
- Circular deps: none — `domain/business.ts` is imported by both `domain/types.ts` and
  `domain/scanner/types.ts`, one-directional; `domain/recommit.ts` imports `domain/business.ts`
  only; `persistence/recommitInvalidation.ts` imports `domain/recommit.ts` and
  `domain/business.ts`, one-directional. Verified by direct reading of every import
  statement in every file above. [Certain]
- Excessive coupling: `App.tsx` imports directly from `src/domain/scanner/logic.ts` and
  `src/domain/scanner/types.ts` (not through the barrel `src/domain/scanner/index.ts`) —
  a minor inconsistency (the barrel exists but isn't used by the one consumer that could use
  it) rather than a coupling risk. [Certain]
- Stage leakage: Crisis's `logic.ts` does not import anything from `scanner/`; scanner's
  `logic.ts` does not import anything from Crisis's `types.ts`/`logic.ts` — the only shared
  import is `business.ts`, which is exactly the intended shared-identity module. [Certain]
- Duplicated state: the one real instance found is `BUSINESS_META` vs. `App.tsx`'s inline
  `BIZ`/`FORCES_TABLE` (§4) — content duplication, not runtime state duplication, but real.
  [Certain]

**LIFECYCLE**
- Normal restart: works, tested via the restore effect's logic (not via an actual jest run
  in this investigation — RUNTIME EXPERIMENT REQUIRED for an executed pass/fail confirmation,
  though `App.test.tsx`/`App.scanner.adversary.test.tsx` exist to cover exactly this and
  their TS errors are narrow typing issues, not obviously test-breaking logic errors, per
  direct reading of the errors' nature).
- Process death: partially covered (commit-atomicity ordering is sound by inspection);
  exact timing guarantees are RUNTIME EXPERIMENT REQUIRED (see §6).
- Background/foreground: **not handled at all** — no `AppState` listener exists. [Certain]
  gap.
- Write failure: tested and correctly isolated (§6, §7).
- Corruption: tested and correctly isolated (§6).
- Missing state: tested (`readJsonKey` returns `null` on missing key, both guards reject
  `null`). [Certain]

**PERSISTENCE**
- Partial writes: tested (`persistence.coexistence.test.ts`, "a failing write to key A does
  not corrupt A storage"). [Certain]
- Stale records: tested exhaustively (`recommit.adversary.test.ts`'s "Exhaustive-ish sweep").
  [Certain]
- Incompatible versions/schema changes: **not handled** — confirmed absent in §6. Real gap
  for future work, not a defect in current scope (nothing versioned yet needs migrating).
- Recovery: tested for the corrupt-JSON and read-timeout paths. [Certain]
- Invalidation: tested extensively, including the documented latent gap. [Certain]

**EVOLUTION**
- Adding a stage (Plan): possible without "architectural surgery" to the *domain/persistence*
  layers — the pattern (own types, own pure logic module, own key, guard-on-read) is a
  straightforward repeat of what Crisis's domain layer and Scanner's persistence layer
  already demonstrate. It **would** require surgery to `App.tsx` specifically, because
  `App.tsx` currently has no navigation/multi-screen structure at all — that's real, novel
  work, not an extension of an existing pattern. [Certain] distinction.
- Changing UI framework: domain layer (`src/domain/**`) has zero React/RN imports — fully
  portable. [Certain, verified by import lists read above]
- Changing persistence tech: `queuedWrite.ts` is the only file importing
  `@react-native-async-storage/async-storage` directly among persistence code (plus
  `recommitInvalidation.ts` for direct `getItem` calls in the read-verification step) — a
  storage swap touches 2 files, not the domain layer. [Certain]
- Changing domain rules (e.g. Crisis scoring formula): confined to `domain/logic.ts`,
  doesn't touch persistence or (currently) any UI, since nothing renders Crisis yet.
  [Certain]

**SIMPLICITY**
- Is the proposed model solving a demonstrated problem or adding elegance for its own sake?
  The core recommendation (§8) is "keep what's built, extend it the same way, stamp identity
  at creation not at every write" — this is the **minimum** necessary change, not an
  elaboration. No new abstraction, library, or pattern is proposed. [Certain] — self-check
  against over-engineering passes because there is, by construction, nothing extra proposed.

---

## 10. Changes made to the proposed architecture during the loop

1. **Initial framing risk avoided**: the task brief's own key principles warn against
   assuming "stage boundaries must equal domain boundaries" and "persistence boundaries must
   equal domain boundaries." Early in the investigation it would have been easy to recommend
   "give Plan and Crisis their own persistence keys" as if that were a fresh design decision.
   Correction: the repo **already has** `PLAN_KEY`/`CRISIS_KEY` reserved and a full guard
   contract built against exactly that shape — the correct move was to recognize and endorse
   the existing pattern, not re-derive a new one, which changed §7/§8 from "propose a
   persistence scheme" to "validate the existing reserved scheme against the evidence and
   flag the one real gap (stamp timing)."
2. **`cash` derivation flagged only after seeing `isValidScannerState`'s cross-field check**:
   initially cash looked like ordinary primary state; reading the validation function's
   redundant invariant check (`cash !== CAPITAL - setupCost`) surfaced that it's derived and
   should have been computed, not stored+checked — added to §4 as a named (low-severity)
   smell.
3. **`BUSINESS_META` vs. `App.tsx`'s inline `BIZ` duplication**: found only by cross-reading
   `business.ts` and `App.tsx` side by side and comparing field values; not obvious from
   either file in isolation. Added as a named smell in §4/§9 after confirming (not assuming)
   the two tables currently agree.
4. **Downgraded confidence on process-death timing claims**: initial pass toward this report
   was tempted to describe the commit-atomicity design as making process death "safe" in an
   unqualified way. Re-checked against the task's explicit instruction never to call anything
   atomic beyond what's proven, and rewrote §6's process-death rows to state the actual proven
   property (ordering/durability of a completed write) versus the unproven property (exact
   timing window of JS-thread teardown), marking the latter RUNTIME EXPERIMENT REQUIRED.

---

## 11. Remaining uncertainties

- **Plan's domain rules are entirely undesigned** — no `src/domain/plan.ts` or equivalent
  exists, so any persistence/contract recommendation for Plan is necessarily provisional on
  content design happening first. [Certain] gap, [Not Yet Assessed] resolution.
- **Real native AsyncStorage durability under process kill** — cannot be established by
  static reading; requires an emulator kill-mid-write experiment. RUNTIME EXPERIMENT
  REQUIRED: force-kill the app process between a `queuedWrite` call resolving and the next
  synchronous line executing, across N repeated trials, observing whether the write is ever
  lost despite having "resolved" from the JS side.
- **Background/foreground behavior** — no code path exists to observe; RUNTIME EXPERIMENT
  REQUIRED: background the app mid-autosave-write on the `hustle_lowend` emulator, foreground
  it, and confirm whether RN/Android suspends the JS thread mid-promise-chain in a way that
  could leave `writeQueue` in an inconsistent state.
- **Whether `jest` actually passes today** — only `--listTests` (an allowed read-only
  command) was run, not `jest` itself; the 8 `tsc` errors are in test files that may or may
  not still execute correctly under ts-jest's transform settings. Not verified in this
  investigation.
- **Whether App.tsx's structural discipline (only `logic.ts` constructs state) is enforced by
  anything besides convention** — no lint rule found guaranteeing this; a future contributor
  could hand-construct a `ScannerRunState` in a handler without it being caught until a
  behavioral bug surfaces.

---

## 12. Explicit implementation boundary

**Step 13 may build**, consistent with what §8/§9/§10 conclude:
- New pure domain modules for Plan (`src/domain/plan/*`), following the Crisis/Scanner
  pattern (types + pure logic functions, no React/RN imports).
- A real Plan writer and a real Crisis writer, both going through `queuedWrite`, both
  stamping `businessId`/`biz` **once at creation** from the currently-committed business at
  that moment — this is the one concrete, evidence-backed requirement this report identifies.
- Real callers of `isPlanValidFor`/`isCrisisValidFor` in whatever reads Plan/Crisis state.
- Navigation/multi-screen structure in App.tsx (or a replacement root component) needed to
  actually reach Plan/Crisis screens — this was previously out of scope for the Scanner slice
  and remains a real, unstarted piece of work.

**Step 13 must NOT build**, per this report's own findings and the task's binding
instruction not to implement anything:
- Nothing in this investigation implemented any of the above — this report is analysis only.
- Any cross-key "transactional" write helper claiming atomicity AsyncStorage cannot provide.
- Any migration/versioning system invented ahead of an actual schema change being needed
  (the current absence of one is a known, accepted, explicitly-flagged limitation, not
  something to preemptively solve with speculative infrastructure).
- Any change to the recommit guard's stamp-validation semantics (`isPlanValidFor`/
  `isCrisisValidFor`) — they are correct as built; only their *callers* are missing.
- Per HUSTLE's own `CLAUDE.md` binding stop condition, migration/persistence/feature work
  beyond what's explicitly greenlit must not start off the back of this validation pass
  without the user's explicit go-ahead.

---

## 13. Step 9-12 completion status

**STEP 9 — State Ownership: PASS.** Full inventory built and directly verified against
source; one real ownership smell found (derived `cash` persisted redundantly) and one
content-duplication smell (`BUSINESS_META` vs. inline `BIZ`); no multiple-writer or
UI-mutates-domain-state smells found because none exist in the current single-screen
implementation.

**STEP 10 — Cross-Stage Contracts: PARTIAL.** Scanner→Plan and Scanner→Crisis contracts are
correctly identified as **absent in implementation** but **specified in intent** by existing
types/functions; Plan→Crisis and Crisis→Ending are absent with **no supporting logic at all**
for Plan, which is a deeper gap than "unwired." Downgraded from PASS because half the matrix
(anything touching Plan) rests on zero code to verify against — the report is honest about
that rather than inventing a Plan contract to complete the table.

**STEP 11 — Lifecycle: PARTIAL.** Scanner's lifecycle is fully traceable from source and
matches the matrix built in §6. Several cells (background/foreground, real process-kill
durability, schema-version changes) are correctly marked ABSENT/RUNTIME EXPERIMENT REQUIRED
rather than answered from inference — this is by design (the task forbids manufacturing
certainty), but it does mean the matrix is not fully populated with verified answers.

**STEP 12 — Persistence: PARTIAL.** The alternatives comparison and recommendation (§7/§8)
are grounded entirely in Steps 9-11's evidence, not invented AsyncStorage keys — this
satisfies the task's core instruction. It is PARTIAL rather than PASS because the
recommendation for Plan/Crisis records is necessarily speculative (no writer, no Plan
domain rules exist to validate a record schema against) — the report says so explicitly
rather than presenting a speculative table as settled.
