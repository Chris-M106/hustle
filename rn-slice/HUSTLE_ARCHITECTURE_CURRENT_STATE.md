# HUSTLE ARCHITECTURE — CURRENT STATE (Step 15 Freeze Baseline)

Mode: ARCHITECTURE FREEZE + DOCUMENTATION. No new architecture, no product feature work, no
cosmetic cleanup, no reopening of settled decisions absent contradicting evidence. This is
not a "HUSTLE is finished" declaration.

Hierarchy: this document is the **current architectural baseline**. `HUSTLE_ARCHITECTURE_
STEPS_09_12_REPORT.md` / `_STEP_13*` / `_STEP_14*` / `_FINAL_PRE_FREEZE_ADVERSARY.md` are
**evidence/investigation history** — read for detail, not duplicated here. `DECISIONS.md` =
project-level decisions. `ROADMAP.md` = future work sequencing. `NEXT_EXPERIMENT_SCANNER_
PLAN_CRISIS.md` = future experiment planning. Where another doc already owns a fact, this
document references it rather than restating it.

---

## 1. Purpose

Freeze what current repository evidence supports as CURRENT architecture, separate it from
EXPERIMENTAL instrumentation and INTENTIONALLY FUTURE architecture, and record explicit
constraints future implementation (by a person or a future Claude Code session) must obey.
Forbidden phrases: "architecture complete," "production ready," "fully validated," "all
lifecycle behavior proven." None of those claims are made below.

---

## 2. Current architecture

Dependency/ownership chain, as implemented today in `rn-slice/`:

```
Application (App.tsx, single component, no navigation library)
  └─ ScannerSlice (only screen)
       ├─ Scanner domain (src/domain/scanner/{logic,types}.ts) — scan/select/commit
       ├─ Business identity (state.committedTo, stamped by commitSpot())
       ├─ Scanner persistence (AsyncStorage key hustle.scanner.v1, via queuedWrite)
       └─ Step 14A bridge (startCrisisBridge(), additive render block)
            └─ Crisis writer/reader (src/persistence/crisisWriter.ts)
                 ├─ launchCrisis() — create/overwrite CRISIS_KEY
                 └─ readCrisis() — structural + identity validated read
                      ├─ isValidCrisisState (structural, crisisWriter.ts)
                      └─ isCrisisValidFor (identity, src/domain/recommit.ts)
       [no runtime caller] ─ recommitInvalidation.ts (invalidateDownstreamOnRecommit)
       [no runtime caller] ─ Plan (no domain module, no writer, no UI)
```

Per component:

| Component | Owner | Responsibility | Authoritative source | In/Out | Persistence boundary | Constraints |
|---|---|---|---|---|---|---|
| `App.tsx` | itself | render, event wiring, sole state holder | in-memory `ScannerRunState` | user taps → domain calls | writes `hustle.scanner.v1` | single component, no navigation lib (deliberate — `DECISIONS.md` → "raw root state vs. react-navigation") |
| Scanner domain (`scanner/logic.ts`) | domain layer | pure scan/select/commit transitions | itself (pure functions) | `ScannerRunState` in/out | none (pure) | no React/RN imports [Certain, Steps 9-12 report] |
| `state.committedTo` | `App.tsx` | sole runtime `BusinessId` authority | itself | set once by `commitSpot()` via `commit()` | persisted as part of scanner state | one hardcoded `BIZ="phonerepair"` (App.tsx:45); `select()` no-ops once committed (App.tsx:227) |
| `crisisWriter.ts` | persistence layer | create Crisis record, validated read | itself | `(committedTo, openingCash)` in; 4-way result out | writes/reads `hustle.crisis.v1` via `queuedWrite`/direct `AsyncStorage` | create-only, no update path, by design (crisisWriter.ts:108-116) |
| `recommit.ts` | domain layer | read-side identity guard | itself | `(record, currentCommittedTo)` → boolean | none (pure) | validates stamp, not provenance (own header, lines 16-29) |
| `recommitInvalidation.ts` | persistence layer | best-effort downstream clear on identity change | itself | `(prev, next)` → cleared flags | removes `PLAN_KEY`/`CRISIS_KEY` | **zero runtime callers** [Certain, Step 14B §5] |
| `queuedWrite.ts` | persistence infra | module-scope write ordering | itself | promise-chained | n/a | ordering only, not mutual exclusion; timeout does not cancel underlying call [Certain] |
| Step 14A bridge (`startCrisisBridge`, App.tsx) | validation scaffolding | exercise `launchCrisis`/`readCrisis` from real app | itself | button tap → bridge state | none new (reuses `CRISIS_KEY`) | always-present, ungated, no `__DEV__` flag — see §8 |
| Plan | **none — does not exist** | — | — | — | — | no domain module, no writer, no UI, no persisted key written [Certain] |

No component invented for this document — table matches Steps 9-12/13/14 evidence, re-verified against current file reads this session.

---

## 3. Ownership

- **`ScannerRunState`** (scanned/selected/committedTo/cash/setupCost): single writer
  (`ScannerSlice` handlers → pure `logic.ts` functions), single in-memory location
  (`App.tsx` `useState`). [Certain]
- **Crisis record on disk (`CRISIS_KEY`)**: single writer, `launchCrisis()`. No update path
  exists — a launch always creates/overwrites. [Certain]
- **`writeQueue`**: module-scope singleton in `queuedWrite.ts`, shared by every caller
  (Scanner autosave/commit, `launchCrisis`, `recommitInvalidation`'s removes). [Certain]
- **No component in the current runtime has more than one writer.** [Certain, re-verified
  Steps 9-12 §4 + this session's direct reads]

---

## 4. Source of truth

| Item | Owner | Where stored | Who may change | Who may read | Must never become a second authority |
|---|---|---|---|---|---|
| `BusinessId` (current run) | `App.tsx` `state.committedTo` | in-memory + `hustle.scanner.v1` | `commitSpot()` via `commit()`, once | render, validators, Crisis bridge | Any future writer must read this, never maintain its own copy |
| Scanner state | `App.tsx` `useState` | in-memory + `hustle.scanner.v1` | Scanner handlers only | render, `isValidScannerState` | — |
| Crisis state | disk (`hustle.crisis.v1`) | AsyncStorage | `launchCrisis()` only | `readCrisis()` | **Disk is the only *authority*.** No in-memory Crisis state holder with authority exists — nothing mutates an in-memory Crisis object, and nothing persists from one. An in-memory *representation* does exist: `crisisBridgeResult` (`App.tsx:121`) holds a full `CrisisRunState` on the `valid` branch and renders `.state.day`/`.state.cash` from memory (`App.tsx:412-417`). It is write-once-per-tap, read-only, display-only, discarded on unmount. A future Crisis screen **may** hold Crisis state as a read-only projection; it **may not** treat that projection as an authority or write back from it. [Certain] |
| Persistence state (queue) | `queuedWrite.ts` module scope | in-memory Promise chain | `queuedWrite`/`queuedRemove` | same | Must remain the single shared queue if a future writer is added — a second independent queue would defeat ordering guarantees `NEXT_EXPERIMENT_SCANNER_PLAN_CRISIS.md` already flags this risk |
| Recommit identity | `recommit.ts` (`isIdentityChange`) | pure function, no storage | n/a (pure) | `recommitInvalidation.ts` (tests only) | Not currently invoked at runtime — see §8 |
| Downstream validity | `recommit.ts` (`isCrisisValidFor`/`isPlanValidFor`) | pure function | n/a | `readCrisis()` (Crisis only; Plan has no reader) | Read-side guard is the only identity-safety mechanism — must remain independent of write-side discipline, not redundant with it [Certain, Step 13 adversary rerun §8] |
| Stage progression | **does not exist as a concept** | — | — | — | App has exactly one stage wired (Scanner + Crisis-bridge instrumentation); no stage-machine/state field exists |
| Plan state | **does not exist** | — | — | — | Any future Plan writer must not invent a second `BusinessId` source — must read `state.committedTo` at creation time only |

---

## 5. Persistence contract

Distinguishing GUARANTEE / BEST EFFORT / NOT TESTED, per current code (`crisisWriter.ts`,
`queuedWrite.ts`, `recommitInvalidation.ts`, all re-read this session):

- **Structural validation before trust (GUARANTEE)**: `readCrisis()` applies
  `isValidCrisisState` (structural) then `isCrisisValidFor` (identity) unconditionally
  before returning `kind: 'valid'`. [Certain — this is the fix for the Step 13 gate's F1
  CRITICAL, confirmed by 3 independent passes]
- **Absent vs. corrupt vs. malformed (GUARANTEE)**: three distinct, ordered outcomes; corrupt
  and malformed both back up raw bytes to `CRISIS_BACKUP_KEY` before returning. [Certain]
- **Corrupt-backup preservation across repeated corruption (NOT GUARANTEED)**: a second
  corruption event overwrites the first backup — no history retained. [Certain, MINOR, Step
  13 adversary rerun §4]
- **Write ordering (GUARANTEE, single shared queue)**: every `CRISIS_KEY`/`hustle.scanner.v1`
  write/remove goes through `queuedWrite`/`queuedRemove`, serialized by one module-scope
  Promise chain. [Certain]
- **Write atomicity (NOT CLAIMED, correctly)**: no cross-key atomicity exists or is claimed
  anywhere in the code; `recommitInvalidation.ts`'s own header disclaims it. [Certain]
- **Timeout semantics (GUARANTEE the caller unblocks; NOT a cancellation guarantee)**: both
  `queuedWrite` and `queuedRemove` now have a 5s timeout (`WRITE_TIMEOUT_MS`/
  `REMOVE_TIMEOUT_MS`). `withTimeout()` uses `Promise.race` — it does **not** cancel the
  underlying `AsyncStorage` call. A "timed out" write can still land on disk later,
  un-ordered relative to whatever the queue did next. [Certain, re-derived independently by
  three separate reviews across this workstream — not a single-source claim]
- **`launchCrisis()` result honesty (GUARANTEE)**: `launched` requires an exact post-write
  disk readback match; `written-unverified`, `lost-to-recommit-race`, and
  `overwritten-by-concurrent-write` are each gated on distinct, traced evidence, not
  inferred. One narrow exception: `overwritten-by-concurrent-write` can fire for unparseable
  garbage on disk that isn't actually a concurrent write — a labeling overstatement in one
  sub-path, not a false "success." [Certain, MINOR]
- **Read-side validity (GUARANTEE)**: a record whose `biz` differs from the currently
  committed business is never returned as valid — held under every ordering attacked across
  three independent adversarial passes (failed clear, concurrent orderings, null
  `committedTo`, A→B→C, 4 mutation tests). [Certain — this is the single strongest proven
  property in the whole persistence layer]
- **Write-side provenance (NOT ENFORCED — architectural limitation, not a defect)**:
  `launchCrisis(committedTo, openingCash)` takes identity and data as two independently
  sourced parameters. Nothing prevents a caller passing a mismatched pair (business B's
  identity, business A's cash). No current caller does this (the only caller, the Step 14A
  bridge, sources both from the same `state` object) — but the API shape does not forbid it.
  [Certain, Step 13 adversary report F6 — carried forward, not fixed]
- **Real device durability under process kill (NOT TESTED beyond what §7 states)**: real
  AsyncStorage/SQLite write durability under a kill mid-`setItem`, and whether the queue
  timeout's non-cancellation ever fires in practice on real hardware, are RUNTIME EXPERIMENT
  REQUIRED items with no evidence either way beyond the disk-survival proof in §7.

---

## 6. Identity/provenance contract

- **Stamp-once-at-creation (GUARANTEE, today)**: `launchCrisis()` stamps `biz` exactly once,
  from its `committedTo` argument, via `createInitialCrisisState`. No update path exists in
  `crisisWriter.ts` — a launched record is never re-written with a different stamp later.
  [Certain, re-verified directly this session]
- **This satisfies `recommit.ts`'s own documented invariant** (lines 16-29): "stamp
  businessId/biz at record-creation time from the value committed at THAT moment, never
  re-stamp on every write from 'whatever is current now.'" [Certain]
- **This does NOT close the KNOWN LATENT GAP** `recommit.ts`'s header names: identity safety
  today rests entirely on the read-side guard (`isCrisisValidFor`), not on any write-side
  provenance enforcement. A **hypothetical future** writer that re-derives `committedTo` at
  write time (instead of at creation time) would defeat this, and the current type system
  does nothing to prevent it. This is a standing constraint on future code, explicitly
  documented in-repo, not a current defect — no such writer exists today. [Certain]
- **Single `BusinessId` authority**: `state.committedTo` in `App.tsx` is the only place
  `BusinessId` is assigned at runtime; no second writer exists anywhere in the current
  codebase. [Certain]

---

## 7. Lifecycle evidence

Three evidence classes, per the task's own instruction — do not claim runtime recommit
validation (Step 14B established it is intentionally absent from current app flow).

**RUNTIME ESTABLISHED** (real emulator, `hustle_lowend`, this workstream's Step 14/14A
passes):
- Real Scanner commit → real process kill (`am force-stop`, `pidof` confirmed exit 1) → real
  relaunch (new PID) → Scanner state restored correctly from disk via the app's own read
  path, independently disk-inspected. [Certain, Step 14 §6 Test 4/§6 Test 2-Scanner-side]
- Real Crisis write+read round-trip via the Step 14A bridge, disk-inspected match. [Certain,
  Step 14 §6 Test 1]
- Real `launchCrisis()` overwrite-on-tap behavior: a deliberately planted day-7 Crisis record
  was destroyed by a single bridge tap, confirming the create-only/no-idempotency design at
  runtime, not just in Jest. [Certain, Step 14 §7]
- One real, unplanned `queuedWrite` timeout (Scanner commit path, transport-stress-induced)
  — UI correctly surfaced failure, no state corruption, successful retry. Does **not** answer
  whether the underlying write was cancelled — that remains open (§5). [Certain on what was
  observed; the cancellation question is explicitly NOT answered by this evidence]

**AUTOMATED-TEST ESTABLISHED** (Jest with mocked AsyncStorage, 136/136 passing at last
verified run this workstream):
- Structural/corrupt/malformed three-way read classification.
- `launchCrisis()`'s 4-outcome result contract under adversarial interleavings, including
  concurrent-launch-vs-recommit-clear races.
- `isCrisisValidFor` holding under every attacked ordering (failed clear, A→B→C, null
  identity, 4 mutation tests).
- `recommit.ts`/`recommitInvalidation.ts` full behavior — but see next bullet.

**NOT CURRENTLY RUNTIME-REACHABLE** (structural, not a time-budget gap — Step 14B's
decisive finding):
- `invalidateDownstreamOnRecommit`, `isIdentityChange`'s only-real-invocation-path, and by
  extension recommit/downstream-invalidation as a whole: **zero runtime callers** in
  `App.tsx` or any other production file. [Certain, re-confirmed by direct grep this session
  — matches Step 14B §5's own grep exactly]
- Tests 3 (A→B recommit), 5 (restart after A→B), 6 (restart after recommit, user-flagged
  highest value), 10 (A→B→C), 11 (A→A no-op): INCONCLUSIVE, reason RUNTIME INVOCATION PATH
  ABSENT — not achievable through the shipped app as it exists today, regardless of
  time/turn budget, because the app has exactly one hardcoded business (`BIZ =
  "phonerepair"`) and `select()` structurally cannot produce a second `committedTo` value.
  [Certain]
- "Restore vs. recreate" for Crisis state cannot be demonstrated through the current bridge:
  `startCrisisBridge()` always calls `launchCrisis()` (create/overwrite) before it ever
  calls `readCrisis()` — any real post-restart tap destroys restored state before the app
  can display it. Disk-layer survival (proven, §7 above) is not the same as app-observable
  resume, which remains unproven. [Certain]
- Live corrupt-state read via the app's own code path: not obtainable given the bridge's
  launch-before-read design; only Jest evidence exists for this path. [Certain]
- `queuedWrite` timeout's effect on the underlying write promise (cancelled vs. still
  in-flight): genuinely unknown at runtime; only the static code trace (`Promise.race`
  cannot cancel) is available. [Certain the trace is accurate; Guessing on real-device
  practical incidence]
- Background/foreground lifecycle: no code path exists to observe it (no `AppState`
  listener); not exercised this workstream.

---

## 8. Current vs. experimental vs. future boundaries

**A. CURRENT / IMPLEMENTED** (real, wired, runtime-reachable today):
- Scanner: scan → select → commit → persist, with commit-atomicity ordering (persist before
  render flip).
- `crisisWriter.ts`: `launchCrisis()`/`readCrisis()`, real production functions, reachable
  today only through the Step 14A bridge (see category B).
- `queuedWrite.ts`: shared write-ordering queue, with timeout on both write and remove.
- `recommit.ts`'s read-side guards (`isCrisisValidFor`/`isPlanValidFor`): implemented and
  Jest-proven, but **asymmetric in reachability**, and the asymmetry is load-bearing:
  - `isCrisisValidFor` **has a production caller** — `crisisWriter.ts:17` imports it and
    `crisisWriter.ts:206` calls it inside `readCrisis()`. It is live code on a real runtime
    path. [Certain]
  - `isPlanValidFor` has **zero production callers**. It is exercised **only by unit tests**
    (`recommit.domain.test.ts`, `recommit.adversary.test.ts`). [Certain]
  - `isPlanValidFor` is unreachable **because Plan has no module, no writer, and no reader** —
    not because it is superseded, redundant, or dead. It is future-facing infrastructure built
    ahead of its consumer, per `recommit.ts`'s own header (lines 16-29) addressed to "whoever
    builds the real Plan/Crisis writer". Do not delete it as unused code.

**B. EXPERIMENTAL / VALIDATION-ONLY** (real code, running in the real app, but not product
UI):
- **The Step 14A bridge** (`startCrisisBridge`, its three `useState` hooks, and its render
  block in `App.tsx`) — this is the resolution the pre-freeze adversary's freeze-hygiene
  finding required (see below).
- The bridge is the **only current caller** of `launchCrisis`/`readCrisis` in the shipped
  app. Its combined launch-then-read design (not a separate read-only affordance) is a
  deliberate, documented Step 14A scoping choice, not an oversight — but it structurally
  blocks proving resume/corrupt-read behavior through the real app (§7).

**B-1. Bridge classification (binding — this is the definitive statement; §15 requires no
further code action):**

- The bridge is **experimental validation instrumentation. It is never product architecture.**
  No future work may treat it as a sanctioned permanent debug facility or as a template for
  one.
- **It is reachable by ordinary users.** It renders *inside* `testID="committedPanel"`
  (`App.tsx:388-420`) — the ordinary post-commit product panel, directly below the committed
  and cash lines. One tap after commit reaches it. There is no build flag, no `__DEV__` guard,
  no hidden gesture. [Certain]
- **Ungated on purpose.** It is the **sole execution path** by which `launchCrisis`/
  `readCrisis` have ever run on a device; every EMULATOR-VERIFIED Crisis-persistence claim in
  this repository traces to it. No physical Android device exists for this project, so gating
  it behind `__DEV__` would remove the only harness capable of exercising Crisis persistence
  against a release build. That cost exceeds the tidiness gained. [Certain on sole-caller
  status, Step 14B §5/§7]
- **It does not corrupt Scanner state.** `startCrisisBridge` (`App.tsx:285-304`) reads
  `state.committedTo`/`state.cash` and never calls `setState` on Scanner state. Its only
  durable effect is writing `hustle.crisis.v1`, which no product feature reads today.
  [Certain]
- **It is self-labelled in the UI**, informally but unmistakably: the button reads
  `"Step 14A: launch + read Crisis (bridge)"` (`App.tsx:405`) and the result line renders raw
  internals, e.g. `readCrisis: valid (day 0, cash R1300)` (`App.tsx:412-417`). No player would
  read this as product UI. [Certain]
- **Known divergence from this project's own experimental convention — deliberate, recorded so
  it is not "fixed".** The canonical prototype gates its temporary instrumentation
  **fail-closed** (`prototype/hustle-shell.html`, `CAUSAL_FEEDBACK_PILOT`: scope comment,
  pointer to owning document, explicit removal condition, and a query-param gate that stays
  off unless explicitly enabled). The bridge has the first three (`App.tsx:113-118`) and
  deliberately omits the fourth, for the reason above. A future reader must not close this gap
  for consistency's sake without first replacing the evidence path it provides.
- **REMOVAL TRIGGER (binding).** The bridge **must be removed or gated before any real Crisis
  screen ships.** `launchCrisis` is create-only and overwrites unconditionally — a tap during
  a real run would silently reset that run to day 0 with no confirmation and no recovery.

**C. INTENTIONALLY FUTURE** (real code, deliberately built ahead of its own integration, per
its own header comments — not a gap, per Step 14B's decisive investigation):
- `recommitInvalidation.ts` / `invalidateDownstreamOnRecommit` and the runtime invocation of
  `isIdentityChange` — zero runtime callers, by design, per `recommit.ts`'s own "2026-08-13
  experiment ... whoever builds the real Plan/Crisis writer MUST ..." framing and
  `recommitInvalidation.ts`'s own "were Plan/Crisis screens to exist" framing.

**C-1. Recorded hazard — a stale source comment previously asserted a caller that does not
exist.** Kept here permanently, because the wrong belief it created is the single easiest
mistake to re-make about this architecture:

- `recommitInvalidation.ts` (header, as written 2026-08-13) stated: *"Caller (App.tsx's commit
  handler) awaits this AFTER the new Scanner commit is itself durably persisted."* **No such
  caller has ever existed.** `App.tsx` does not import `recommitInvalidation.ts` at all. The
  comment was written in the present indicative, unlike line 60 of the same file, which
  correctly hedges ("were Plan/Crisis screens to exist"). The comment has since been corrected
  in source; this entry preserves the hazard.
- **The actual current runtime graph, in full:**

  ```
  user taps commitBtn (App.tsx:373)
    └─ commit()                                       App.tsx:242-280
         ├─ commitSpot(state, BIZ, CAPITAL)           App.tsx:250
         │    └─ logic.ts:99-126
         │         ├─ computes resetDownstream        logic.ts:118
         │         └─ returns { state, ok, resetDownstream }   logic.ts:125
         │              — performs NO storage access, NO removal, NO invalidation
         ├─ reads result.ok / result.reason / result.state
         │    — result.resetDownstream is NEVER read. Value discarded.
         ├─ await queuedWrite(STORAGE_KEY, payload)   App.tsx:266
         └─ setState(result.state)                    App.tsx:271

    ✗ invalidateDownstreamOnRecommit — NOT reachable. Structurally absent, not untested.
  ```

- **`commitSpot()` performs no invalidation internally**, by explicit design — its own header
  (`logic.ts:94-98`) states "return value only, no side effects … does not persist or
  navigate". [Certain]
- **Do not confuse "`resetDownstream` returned" with "downstream invalidation executed."** The
  boolean is computed and thrown away.
- **This is not a live defect.** Under the single hardcoded `BIZ` (`App.tsx:45`),
  `state.committedTo !== o.id` can never be true after the first commit, so `resetDownstream`
  is structurally always `false`. Discarding it becomes a real defect the instant a second
  committable business is wired in — see §9 rule 3. [Certain]
- A Crisis update path (post-launch gameplay writes, e.g. after `resolve()`/`nextDay()`) —
  does not exist; `crisisWriter.ts` is create-only by explicit design comment.
- Multi-business Scanner UI (a second `BIZ` value reachable through real interaction) — only
  `phonerepair` has `BUSINESS_META` content; the other 4 `BusinessId` union members are
  structural-only.
- Navigation/multi-screen architecture — deliberately deferred per `DECISIONS.md` →
  "Navigation approach: raw root state vs. react-navigation."

**D. UNKNOWN / NOT YET ESTABLISHED** (not classifiable as A/B/C from current evidence):
- Whether the queued-write timeout's non-cancellation ever manifests as a real ordering
  violation on real hardware — no confirmed real-world trigger found across three
  independent review passes, but not ruled out either.
- Whether same-business re-commit (A→A) preserving an in-progress Crisis run is the intended
  product behavior — mechanically confirmed (`isIdentityChange` returns false, no clear
  happens), but product intent was never assessed. [Certain on mechanism, NOT YET ASSESSED
  on product intent — Step 13 adversary rerun §8]

---

## 9. Future Plan/Crisis writer contract

Binding on any future writer, derived from evidence already in the repository — not invented
here:

1. **Stamp `businessId`/`biz` once, at record creation**, from the value of `state.
   committedTo` at that exact moment. Never re-derive it from "whatever is currently
   committed" on a later write. [`recommit.ts` header, lines 16-29]
2. **Take one snapshot object**, not independently sourced identity + data parameters. The
   current `launchCrisis(committedTo, openingCash)` two-parameter shape is a documented,
   uncorrected limitation (§5) — a future writer should not repeat this shape without a
   consistency relation between its arguments. [Step 13 adversary report F6]
3. **Must respect downstream invalidation** the moment a second committable business exists:
   if Scanner UI ever wires a second `BIZ` (moving item C.3 above out of "future"),
   `invalidateDownstreamOnRecommit` must be wired into that same commit path *before* that
   integration is considered validated — Step 14B names this explicitly as the trigger
   condition. [Step 14B §11, §13]
4. **Must use the established persistence mechanism** — `queuedWrite`/`queuedRemove` through
   the existing shared `writeQueue`, not a parallel queue or direct `AsyncStorage` call
   (except for isolated non-conflicting keys, as `backupCorrupt` correctly does today).
5. **Must respect queued-write semantics**: a "timeout" from `withTimeout()` means the caller
   stopped waiting, **not** that the underlying operation was cancelled. Do not build retry
   logic that assumes a timed-out write is guaranteed not to land later.
6. **Create-only APIs must not be mistaken for resume APIs.** `launchCrisis()` is
   unconditional create/overwrite. A future UI must not call it as if it were idempotent or
   restore-safe without first adding an explicit resume/read-only path.
7. **Must run a full structural + relational validator** (the `isValidCrisisState` class)
   before trusting any read, never a bare identity check alone. [Step 13 gate F1, closed for
   Crisis; must be replicated for any Plan reader]
8. **Must not create a second `BusinessId` authority.** Read `state.committedTo`; never
   maintain an independent copy that could diverge.

No additional rules invented beyond what current repository evidence already states.

---

## 10. Known constraints

Re-evaluated against current repository evidence (not blindly carried over from the
pre-freeze adversary report):

1. **`queuedWrite`'s timeout does not cancel the underlying operation.** [Certain — confirmed
   directly this session by reading `withTimeout()`; `Promise.race` has no cancellation
   mechanism] Still true, still a constraint on any future caller.
2. **`launchCrisis()` is create-only and can overwrite existing Crisis state with no guard.**
   [Certain — confirmed directly this session, and runtime-reproduced in Step 14 §7]
3. **Future-writer BusinessId/provenance rules (§9) are architectural constraints, not
   technically enforced guarantees.** [Certain — the type system does not prevent violation]
4. **Resume behavior is not implemented and cannot currently be demonstrated through the
   bridge.** [Certain — confirmed this session by re-reading `startCrisisBridge()`'s
   launch-then-read order]
5. **The Step 14A runtime bridge is experimental instrumentation and must not silently
   become product architecture.** Resolved explicitly in §8/category B above and the freeze
   action in this document's decision (§15) — not left ambiguous.
6. **Recommit/invalidation is an intentional future boundary, not current runtime
   functionality.** [Certain — reconfirmed this session via direct grep, matching Step 14B
   exactly]

7. **`isValidScannerState` enforces a relational cash invariant inside a schema validator that
   has no schema-version field — this will silently reject valid saves once cash derivation
   changes.** `App.tsx:101-103` rejects any persisted Scanner state where `committedTo` is set
   and `cash !== CAPITAL - setupCost`. This is correct today: `opening()` (`logic.ts:122`) sets
   cash at commit and no production path mutates it afterwards, so the relation is a true
   invariant and checking it is legitimate defense-in-depth against tampered or truncated
   saves. [Likely — based on the absence of any other post-commit `state.cash` writer in the
   code read; not an exhaustive repository-wide grep of every `cash` assignment]

   **The failure mode is concrete and silent.** Add any post-commit cash mutation — a repair
   job paying out R200 — and the app writes `cash = 1500`, `setupCost = 1200`. On next launch
   the validator computes `CAPITAL - setupCost = 1300`, sees `1500 !== 1300`, returns `false`,
   and the save is discarded as corrupt. The user loses their run, and the code that "broke" it
   lives in a file the change never touched. [Certain on the mechanism — follows directly from
   `App.tsx:101-103`]

   Compounding: `hustle.scanner.v1` carries **no schema-version field**, and
   `hustle.scanner.v1.corrupt-backup` (`App.tsx:58`) is the de facto migration mechanism — it
   retains exactly one corrupted state and is overwritten by the next corruption event.

   **This is a future migration constraint, not a current defect. Do not change the validator
   now** — relaxing a currently-valid invariant to defend against a hypothetical, with no
   schema-version mechanism to hang the change on, is strictly worse. **Binding constraint:**
   whatever change first mutates post-commit cash must relax this check and introduce a
   schema-version field **in the same unit of work**.

All seven hold under current-repository re-verification. Constraints 1-6 required no
alteration; constraint 7 was added by the post-freeze correction pass
(`HUSTLE_ARCHITECTURE_FREEZE_CORRECTION_ADVERSARY.md` §7).

---

## 11. Known limitations

- No cross-key write atomicity anywhere in the persistence layer (never claimed).
- Repeated corruption events overwrite each other's backup — earliest evidence lost.
- `overwritten-by-concurrent-write` can be returned for unparseable-garbage-on-disk cases
  where no concurrent write is actually known to have occurred — narrower evidence than the
  label implies, in one sub-path only.
- `crisisScore` has no upper bound (finite-only check).
- Log entry day-sequence is not validated (length/count checked, not per-entry ordering).
- No schema/version migration mechanism exists anywhere — any shape change is treated as
  corruption, not migrated.
- No `AppState` (background/foreground) handling anywhere in the app.
- No lint/type-level enforcement that only `logic.ts` functions may construct domain state
  objects — currently true by convention/discipline, not by mechanism.
- Real native AsyncStorage/SQLite write durability under a kill mid-`setItem`: proven safe
  for *completed* writes surviving kill (§7); the exact timing window for an in-flight write
  at the moment of kill remains RUNTIME EXPERIMENT REQUIRED.
- No physical Android device exists for this project — everything above is
  EMULATOR-VERIFIED at best, REAL-DEVICE-UNVERIFIED, a standing project-level constraint
  (`CLAUDE.md`), not specific to this freeze.

---

## 12. Architectural risks

Separated CURRENT / FUTURE-IMPLEMENTATION / VALIDATION-LIMITATION / EXPERIMENTAL-LIMITATION;
only risks that materially affect future architecture decisions are listed (not every risk
converted into a task).

**CURRENT RISK**
- The Step 14A bridge is permanent, ungated production code in `App.tsx` with no `__DEV__`/
  flag boundary and no in-app visual signal that it is validation scaffolding rather than
  real product UI. A user (or future developer) encountering it in a real build could
  mistake it for a Crisis-launch feature. [Carried from pre-freeze adversary report;
  resolution stated in §15]

**FUTURE IMPLEMENTATION RISK**
- `launchCrisis(committedTo, openingCash)`'s two-loose-parameter shape invites a
  provenance-mismatched call the moment a real multi-step caller exists (§5/§9 item 2) — no
  current caller does this, but nothing prevents a future one from doing so.
- The moment a second committable business is wired into Scanner, `invalidateDownstreamOnRecommit`
  must be wired into the same commit path in the same change — if these are decoupled (built
  in two separate passes), there is a real window where recommit-without-invalidation could
  ship as a regression. Step 14B names this as the exact trigger condition to watch for.

**VALIDATION LIMITATION**
- Tests 3/5/6/10/11 (all recommit-adjacent) are structurally unreachable through the current
  app — this is not "not yet tested," it is "cannot be tested without first building the
  feature that would exercise it." Any future claim that recommit is "runtime validated"
  must be backed by new evidence, not by re-reading this document or the Step 14 reports.
- Crisis resume/restore-vs-recreate has no runtime proof; only disk-layer survival is proven.

**EXPERIMENTAL LIMITATION**
- The queue timeout's non-cancellation property is confirmed by static trace only; whether
  it ever fires as a real ordering violation on real hardware has zero evidence either way.

---

## 13. Final architecture map

| Component | Current Owner | Source of Truth | Current/Future | Evidence | Constraints |
|---|---|---|---|---|---|
| Scanner | `App.tsx` `ScannerSlice` | `state` (`useState`) | Current | Runtime + 136/136 Jest | Single component, no second writer |
| BusinessId | `App.tsx` `state.committedTo` | in-memory + `hustle.scanner.v1` | Current | Runtime-proven restore | Stamp-once rule binds all downstream writers |
| Crisis writer/reader | `crisisWriter.ts` | itself | Current | Runtime (Step 14 Tests 1/4/7) + Jest | Create-only, no idempotency guard |
| Persistence (`queuedWrite`) | `queuedWrite.ts` | module-scope queue | Current | Runtime (1 real timeout observed) + Jest | Timeout ≠ cancellation |
| App lifecycle (process kill/restart) | OS + AsyncStorage/SQLite | disk | Current, for Scanner + Crisis-disk-survival | Runtime-proven (Step 14 Test 4) | App-observable resume for Crisis unproven |
| recommit (read-side guard) | `recommit.ts` | pure functions | Current (implemented), unreachable at runtime for recommit purpose | Jest only for invocation via recommit; used live by `readCrisis` for identity check | Stamp-vs-provenance distinction, see §6 |
| Downstream invalidation | `recommitInvalidation.ts` | itself | **Future** (zero runtime callers) | Jest only | Must be wired alongside any second-business feature |
| Experimental bridge | `App.tsx` (`startCrisisBridge`) | itself | **Experimental** | Runtime | Must not be mistaken for product UI; ungated (freeze action, §15) |
| Plan | — | — | **Future** (does not exist) | none | No domain module, no writer, no UI |

---

## 14. Future implementation rules

1. Any future Plan or Crisis-update writer must obey the full contract in §9 — no exceptions
   without a documented, evidence-backed reason.
2. Wiring a second committable business into Scanner and wiring
   `invalidateDownstreamOnRecommit` into that same commit path are a single unit of work —
   do not ship one without the other.
3. Before claiming recommit is "runtime validated," Tests 3/5/6/10/11 must actually be
   executed against a real, reachable runtime path — not inferred from Jest coverage, not
   inferred from this document.
4. Before claiming Crisis resume works, a read-only debug affordance separate from
   `launchCrisis()` must exist and itself be verified — the current bridge cannot prove this.
5. Do not treat `withTimeout()`'s timeout as proof of cancellation anywhere in future code —
   confirmed false by direct reading (§5, §10 item 1).
6. Do not add a second `BusinessId` authority, a second write queue, or a second Crisis/Plan
   persisted representation — all current evidence points to exactly one of each.
7. Do not silently gate, remove, or relabel the Step 14A bridge as part of unrelated future
   work — its treatment is decided explicitly in §15, any change to that treatment is itself
   a decision requiring the same rigor as this document, not a side effect of another task.

---

## 15. Freeze decision

**FREEZE WITH CONSTRAINTS.**

Basis: no CRITICAL finding blocks freeze (`HUSTLE_ARCHITECTURE_FINAL_PRE_FREEZE_ADVERSARY.md`
verdict, re-verified against current code this session — the 6 constraints in §10 all held
under direct re-inspection, none required alteration). The current architecture (Scanner
end-to-end, Crisis writer/reader, shared persistence queue) is real, runtime-proven where it
matters most (process-kill/restore, real Crisis round-trip), and consistently documented as
either current or explicitly future by the code's own comments — not retrofitted narrative.
The future boundary (recommit/invalidation, Plan, multi-business) is genuinely intentional,
not a disguised gap, per Step 14B's decisive, adversarially-tested investigation.

**Freeze action, per §8/§12's Step 14A bridge finding — SATISFIED, no code action pending.**
The bridge was already labelled in-code as validation scaffolding (`App.tsx:113-118`) at the
time of the freeze; the original wording of this section wrongly implied that labelling was
still outstanding. The definitive classification — experimental instrumentation, ungated on
purpose, user-reachable, self-labelled in the UI, with a binding removal trigger before any
real Crisis screen ships — now lives in **§8 category B-1**. Nothing further is required of a
future pass except honouring that removal trigger. [Corrected by
`HUSTLE_ARCHITECTURE_FREEZE_CORRECTION_ADVERSARY.md` §5]

**What would make this NOT READY TO FREEZE**: if a future inspection found the Step 14A
bridge's presence had begun to alter real gameplay behavior (it does not, per §8), or if a
second `BusinessId`/persistence authority were discovered (none found, re-checked directly
this session), or if the recommit-unreachability finding turned out to be a live defect
rather than a documented design choice (ruled out, Step 14B §7). None of these apply.

---

## Final verification performed this pass

- `git status --short` — not re-run in this specific turn's tool calls beyond what prior
  Step 14A/14/14B/pre-freeze passes already captured; no code file was edited to produce this
  document (only this new `.md` was written). [Certain — Write tool call count this turn:
  exactly one, targeting this file]
- Current code re-read directly this session (not summarized from memory): `HUSTLE_
  ARCHITECTURE_STEPS_09_12_REPORT.md`, `_STEP_13_REPORT.md`, `_STEP_13_ADVERSARY_REPORT.md`,
  `_STEP_13_REPAIR_REPORT.md`, `_STEP_13_ADVERSARY_RERUN.md`, `_STEP_14_RUNTIME_VALIDATION.md`,
  `_STEP_14A_RUNTIME_BRIDGE.md`, `MEMORY.md`, `DECISIONS.md`, `ROADMAP.md` (all at parent
  `hustle/` level) — `App.tsx`'s current signatures independently re-confirmed via its
  skeleton read this turn (`ScannerSlice`, `isValidScannerState`, `App` — matches the
  described architecture, no drift found).
- No contradiction found between this document's claims and current repository state.
- No duplicated/conflicting source-of-truth statement found across §4/§13.
- No test run was needed this pass to validate a new claim — all claims trace to evidence
  already gathered and re-confirmed via direct file reads this session, not re-executed
  suites (last known suite state: 136/136 Jest, 8 pre-existing/0-new tsc errors, per Step 14A).
- No production code changed for documentation cleanliness or any other reason.

---

The purpose is to establish the authoritative architectural baseline for the next stage of
HUSTLE development. Freeze what the evidence supports. Do not freeze what the evidence does
not support.
