# HUSTLE ARCHITECTURE — FREEZE CORRECTION ADVERSARY

Mode: **ADVERSARIAL REVIEW ONLY.** No code modified. `HUSTLE_ARCHITECTURE_CURRENT_STATE.md`
not modified. Nothing committed, nothing pushed, no correction implemented. Git status at the
end of this document is byte-identical in shape to the status at its start (Read/Grep/Bash
only).

---

## 1. Scope of this review

This document attacks the **proposed correction plan** for the frozen architecture baseline —
not the architecture, and not the freeze document's remaining content. The question under test
is narrow and specific:

> If we applied the six proposed corrections exactly as written, would
> `HUSTLE_ARCHITECTURE_CURRENT_STATE.md` become a *more* precise description of the
> architecture the repository actually supports, or a *less* precise one?

Findings are labelled with the requester's own labels — **F1, F2, F3, M1, M2, M3, M4** — plus
one new finding surfaced by this pass that the correction plan does not cover (**N1**).

Source precedence used throughout: (1) current repository source, (2) `CURRENT_STATE`, (3)
project decision documents, (4) Step 9–14 reports. Where the correction plan's stated premise
disagrees with current source, current source wins and the premise is rejected — including
where the premise came from my own earlier audit.

Two of the seven findings, as stated in the correction plan, rest on premises that current
source contradicts. That is the headline result of this pass.

---

## 2. Evidence inspected

Direct reads / greps performed **this pass** (not inherited from earlier steps):

| Evidence | What was actually inspected |
|---|---|
| `App.tsx:360-457` | Bridge render block, committed panel, `App()` root, full `StyleSheet` |
| `src/domain/scanner/logic.ts:90-127` | `commitSpot()` complete body + its header comment |
| `HUSTLE_ARCHITECTURE_CURRENT_STATE.md` | Grepped for every `isPlanValidFor` / `recommitInvalidation` / `invalidateDownstream` / `resetDownstream` mention; read lines 36-46, 50-55, 82-87, 105-115, 225-250 verbatim |
| `git status --short`, `git diff --stat` | Full working-tree state, all three modified files |
| `git diff prototype/hustle-shell.html` | First 30 lines of the diff, verbatim |
| `C:\claude-projects\hustle\*.md` | Full top-level documentation file listing |
| `rn-slice\*.md` | Full rn-slice documentation file listing |
| `rn-slice\README.md:1-40` | Confirmed it is the stock React Native CLI template README |
| `CLAUDE.md` documentation map | Read as always-loaded project context this session |
| `HUSTLE_ARCHITECTURE_STEP_14B_RUNTIME_REACHABILITY.md` | Full re-read, §5 grep evidence and §13 constraints |

Carried forward from earlier passes in this same session (labelled where used, not re-verified
this pass): `recommit.ts` full body, `recommitInvalidation.ts` full body, `crisisWriter.ts`
full body, `queuedWrite.ts` full body, `App.tsx:1-320`, the grep of `isPlanValidFor` /
`invalidateDownstreamOnRecommit` call sites across `*.ts*`.

**Not inspected this pass:** test file bodies, `src/domain/logic.ts`, `src/domain/types.ts`,
`src/domain/business.ts`, `NEXT_EXPERIMENT_SCANNER_PLAN_CRISIS.md` body. **No tests were run.
No build was run. No emulator was started.** All runtime claims below are inherited from
Step 14/14A/14B and are labelled EMULATOR-VERIFIED or REAL-DEVICE-UNVERIFIED accordingly.

---

## 3. ATTACK F1 — `isPlanValidFor` callers

### Correction plan's premise

> "CURRENT_STATE incorrectly implies that `isPlanValidFor` has production callers; evidence
> indicates callers are test-only. Correct: state that it has no production callers and is
> exercised by tests."

### What the source actually says

`CURRENT_STATE:228-230`, verbatim:

```
- `recommit.ts`'s read-side guards (`isCrisisValidFor`/`isPlanValidFor`): implemented,
  Jest-proven, but only `isCrisisValidFor` has a real caller (`readCrisis`) — `isPlanValidFor`
  has zero callers anywhere, including tests-as-production-proxy, because Plan doesn't exist.
```

`CURRENT_STATE:86` similarly names `readCrisis()` as the consumer with the parenthetical
"(Crisis only; Plan has no reader)".

### Verdict on the premise: **REJECTED — the premise is factually inverted.**

CURRENT_STATE does not imply `isPlanValidFor` has production callers. It states the opposite,
and states it in the strongest available form. **[Certain — direct quote of current document
text, grepped and read this pass.]**

### The real defect, which the correction plan does not describe

CURRENT_STATE's error is in the *opposite direction*: it says "zero callers **anywhere,
including tests-as-production-proxy**". That clause is false. `isPlanValidFor` has twelve test
call sites — `recommit.domain.test.ts:24,27,30,33,34,37,40,69,81` and
`recommit.adversary.test.ts:86,243,252`. **[Certain — grep output from earlier this session;
not re-run this pass, and the line numbers are therefore inherited rather than freshly
re-verified.]**

So the correction plan and the document are wrong in opposite directions, and the plan's
prescribed replacement text ("no production callers, exercised by tests") happens to land on
the correct answer *by accident, from a false premise*. Applying it fixes the sentence. Keeping
the plan's justification in the record poisons the audit trail.

### The "does 'no production callers' imply 'unnecessary'?" attack

Yes — this is a real risk, and it is asymmetric between the two guards:

- `isCrisisValidFor` **has** a production caller: `crisisWriter.ts:17` imports it,
  `crisisWriter.ts:206` calls it inside `readCrisis`. **[Certain, inherited from this session's
  earlier full read of `crisisWriter.ts`.]**
- `isPlanValidFor` has none, only because **Plan has no reader, no writer, and no module**.

A flat "no production callers" sentence applied to both would flatten that asymmetry and invite
a future session to conclude both are dead code. The correction must preserve *why*: the
function is unreachable because its consumer does not exist yet, not because it was superseded.
`recommit.ts`'s own header (lines 16-29) already frames it as future-facing infrastructure
addressed to "whoever builds the real Plan/Crisis writer" — the correction text must not
contradict that.

### Severity: **MINOR** (correction outcome is right, justification is wrong)

The corrected sentence is materially better than the current one. The *reasoning* recorded for
why it changed must be rewritten, or the next audit will re-derive a false history.

---

## 4. ATTACK F2 — `recommitInvalidation.ts` runtime integration

This was designated the highest-priority attack. It produced the largest single error in the
correction plan.

### Correction plan's premise

> "CURRENT_STATE contains wording implying `recommitInvalidation.ts` is awaited/integrated by
> App.tsx's commit path."

### What CURRENT_STATE actually says

Every mention, grepped this pass:

| Line | Text |
|---|---|
| 42 | `[no runtime caller] ─ recommitInvalidation.ts (invalidateDownstreamOnRecommit)` |
| 55 | "… **zero runtime callers** [Certain, Step 14B §5]" |
| 86 | "Not currently invoked at runtime — see §8" |
| 244-247 | Filed under heading **"C. INTENTIONALLY FUTURE"** — "zero runtime callers, by design" |
| 397 | "**Future** (zero runtime callers) \| Jest only" |
| 281, 369, 408 | "**must be wired** into that same commit path *before*…" — future-tense obligation |

### Verdict on the premise: **REJECTED — the premise is factually false.**

CURRENT_STATE says `recommitInvalidation.ts` is **not** runtime-integrated, in six separate
places, in three different structural forms (call graph, ownership table, status table).
**[Certain — grep + verbatim read this pass.]**

### Where the phantom-caller wording actually lives

Not in the freeze document. In **the source file itself** — `recommitInvalidation.ts:32-35`:

> "Caller (**App.tsx's commit handler**) **awaits this** AFTER the new Scanner commit is itself
> durably persisted — same ordering discipline as Scanner's own commit atomicity."

**[Certain, inherited from this session's earlier full read of the file.]** That comment
describes a caller that does not exist. It is written in the present indicative, not the
conditional — unlike line 60 of the same file, which correctly hedges ("were Plan/Crisis
screens to exist"). This is the single most dangerous artefact in the recommit surface, and the
correction plan aims its fix at the wrong file.

### The call graph, rendered explicitly

**CURRENT RUNTIME (what an APK actually executes):**

```
user taps commitBtn (App.tsx:373)
  └─ commit()                                        App.tsx:242-280
       ├─ commitSpot(state, BIZ, CAPITAL)            App.tsx:250
       │    └─ logic.ts:99-126
       │         ├─ computes  resetDownstream        logic.ts:118
       │         │     = state.committedTo !== null && state.committedTo !== o.id
       │         └─ returns { state, ok, resetDownstream }   logic.ts:125
       │              ── performs NO storage access, NO removal, NO invalidation
       ├─ reads result.ok / result.reason / result.state     App.tsx:250-271
       │    ── result.resetDownstream is NEVER read.  Value discarded.
       ├─ await queuedWrite(STORAGE_KEY, payload)    App.tsx:266
       └─ setState(result.state)                     App.tsx:271

  ✗ invalidateDownstreamOnRecommit  — NOT reachable. App.tsx does not import
    recommitInvalidation.ts at all.  Structurally absent, not merely untested.
```

**TEST (the only execution path that exists):**

```
Jest process (AsyncStorage mocked)
  ├─ __tests__/recommit.adversary.test.ts:102,110,118,129,145,158,160,169,170,
  │       183,195,196,206,217,225   ──► invalidateDownstreamOnRecommit(prev, next)
  └─ __tests__/crisisWriter.realwriter.test.ts:220,239,248,262,282
                                    ──► invalidateDownstreamOnRecommit(prev, next)
```

**[Certain]** for the `App.tsx` and `logic.ts` structure — read directly this pass
(`logic.ts:90-127`) and earlier this session (`App.tsx:242-280`). **[Certain, inherited]** for
the test line numbers — from this session's earlier grep, not re-run this pass.

### "Does `commitSpot()` itself perform equivalent invalidation internally?"

**No.** Read in full this pass, `logic.ts:99-126`. Its own header comment (`logic.ts:94-98`)
states the design explicitly: *"return value only, no side effects … this function does not
persist or navigate, it only decides what the committed state WOULD be."* The only thing it
does with the recommit condition is compute a boolean at `logic.ts:118` and hand it back at
`logic.ts:125`. There is no `AsyncStorage` import, no `queuedRemove`, no key reference in the
function. **[Certain — full body read this pass.]**

This directly settles the instruction *"do not confuse 'resetDownstream returned' with
'downstream invalidation executed'"*: the boolean is **computed and thrown away**. Nothing
anywhere in the production path acts on it.

Note the second-order fact, which matters for how alarming this is: under the current single
hardcoded `BIZ` (`App.tsx:45`), `state.committedTo !== o.id` can never be true after a first
commit, so `resetDownstream` is **structurally always `false`** at runtime. Discarding it is
therefore not a live defect — it is a defect that arms itself the instant a second business is
added. **[Certain]**

### Verdict: the F2 correction as written is a **no-op on the wrong file**

If applied literally — "correct CURRENT_STATE to state that recommitInvalidation is not
runtime-integrated" — it changes nothing, because CURRENT_STATE already says that six times.
Meanwhile the actual false statement, in `recommitInvalidation.ts:32-35`, survives untouched.
And the correction plan's own constraint forbids modifying code, so it cannot be fixed in this
phase — it must be **recorded as a known hazard** in CURRENT_STATE instead.

### Severity: **MAJOR**

Not because the freeze document is wrong — it is right — but because the correction plan
believes it is wrong. Acting on that belief burns the one correction pass on a no-op while a
real source-level falsehood, capable of convincing a future reader that Scanner commit already
invalidates downstream state, remains unrecorded.

---

## 5. ATTACK F3 — the Step 14A bridge

### Sub-question 1: Does the bridge change normal product behavior?

**Partially — and more than the freeze document admits.** Read this pass, `App.tsx:388-420`:
the bridge is rendered **inside `testID="committedPanel"`**, the ordinary post-commit product
panel, immediately below "Committed R… to Phone Repair Kiosk" and the cash line. It is not a
separate screen, not a modal, not behind a long-press. It is the next button in the flow.

It does not alter Scanner's own state (`startCrisisBridge` reads `state.committedTo` /
`state.cash` and never calls `setState` on Scanner state — `App.tsx:285-304`), so Scanner
behavior is unchanged. But it **writes `hustle.crisis.v1` to disk** via `launchCrisis`. That is
a real, durable, product-namespace side effect from a button an ordinary user can press.
**[Certain — render block and handler both read.]**

### Sub-question 2: Is it reachable by ordinary users?

**Yes, trivially.** Any user who commits reaches it in one tap. There is no gate: no build
flag, no `__DEV__` check, no query param, no hidden gesture. `App.tsx:396-407` renders it
unconditionally within the committed panel. **[Certain.]**

### Sub-question 3: Is it clearly marked?

**In code, yes. In the UI, accidentally yes — and that is load-bearing.** The in-code comment
at `App.tsx:113-118` is explicit ("NOT part of the Crisis product experience … architectural
validation only"). The button label reads **"Step 14A: launch + read Crisis (bridge)"**
(`App.tsx:405`) and the result text renders raw internals — `readCrisis: valid (day 0, cash
R1300)` (`App.tsx:412-417`). No player would mistake that for product UI; it is self-evidently
instrumentation. **[Certain — label strings read verbatim this pass.]**

This falsifies my own earlier audit finding F8's framing that there is "no UI signal". There
is a strong UI signal. It is just informal rather than structural.

### Sub-question 4: Is it safe to leave temporarily?

**Yes, with one named condition.** It is safe because: it cannot corrupt Scanner state; the
only key it writes is `hustle.crisis.v1`, which no product feature reads today; and it is
self-labelled. The condition: it must not still be present when a real Crisis screen is built,
because `launchCrisis` is **create-only and overwrites** — a user tapping the bridge mid-Crisis
would silently reset a real run to day 0. **[Certain on the create-only semantics, inherited
from this session's read of `crisisWriter.ts:117-168`.]**

### Sub-question 5: Would removal invalidate runtime evidence?

**Yes — irreversibly, on this machine.** The bridge is the *only* path that has ever executed
`launchCrisis`/`readCrisis` on a device. All EMULATOR-VERIFIED Crisis-writer evidence in
Step 14/14A traces to it. Remove it and the repository's Crisis persistence layer drops back to
Jest-only evidence, with AsyncStorage mocked. Given the standing project constraint that no
physical device exists and the emulator is the deliberate stand-in, discarding the only real
runtime harness to tidy the UI is a strictly negative trade. **[Certain on the "only caller"
claim — inherited from Step 14B §7 and this session's earlier grep.]**

### Sub-question 6: Would gating require new architecture?

**No.** `__DEV__` is a React Native global, available with zero new dependencies, zero new
modules, and one `&&` in the render condition. That is not new architecture. **[Certain that
`__DEV__` exists in RN; Guessing that it would behave correctly in this specific release build
configuration — not tested, and this pass ran no build.]**

But "cheap" is not "warranted". Gating it is a **code change**, forbidden in this phase, and it
would immediately destroy the ability to run the emulator validation harness against a release
APK — the exact evidence class the project is short of.

### Sub-question 7: Does the project already have a convention for experimental tooling?

**Yes — and this pass found it, in the working tree, unrecorded by any architecture document.**
`git diff prototype/hustle-shell.html` shows an uncommitted causal-feedback pilot in the
canonical prototype with a fully-formed convention:

```
/* CAUSAL FEEDBACK PILOT — temporary, isolated pilot condition flag.
   Scope: HUSTLE_CAUSAL_FEEDBACK_FINAL_RESEARCH_AND_CLAUDE_BRIEF.md.
   Not a general experimentation framework — remove after the pilot gate closes.
   Fail-closed: only an explicit ?pilot=experimental turns the bridge on. */
var CAUSAL_FEEDBACK_PILOT =
  /[?&]pilot=experimental(?:&|$)/i.test(location.search);
```

**[Certain — verbatim from the diff, read this pass.]** The convention has four parts: a
scope-naming comment, a pointer to the owning document, an explicit removal condition, and a
**fail-closed runtime gate**. The Step 14A bridge has the first three (`App.tsx:113-118`) and
lacks the fourth.

That is a genuine, evidence-backed inconsistency — the same codebase, the same class of
temporary instrumentation, one gated fail-closed and one always-on. It is **not** a reason to
gate the bridge now (see sub-question 5 — gating the prototype flag costs nothing, gating the
bridge costs the runtime harness). It **is** a reason the freeze document should name the
divergence and its justification, so a future reader does not "fix" the inconsistency and
delete the evidence path.

### Sub-question 8: Should the document prescribe removal, or merely classify?

**Classify, plus one dated trigger. Not removal.**

The correction plan's instinct to "determine whether the correct action is documentation-only /
gating / removal" is itself the trap the requester warned about. The objective is the smallest
correct architecture, not the prettiest repository. Evidence says: the bridge is honest,
self-labelled, harmless today, and is the sole source of the project's only real-device-class
Crisis evidence. Every proposed treatment other than documentation costs more than it buys —
**today**.

### Severity: **MINOR**, and the correction as drafted is **overscoped**

Correction 3 as written ("determine whether the correct action is documentation-only / gating /
removal / future cleanup") invites a code change during a freeze-correction phase that
explicitly forbids code changes. The determination is already made by the evidence:
documentation-only, with a named trigger.

---

## 6. ATTACK M1 — "no in-memory Crisis state holder"

### What CURRENT_STATE says

`CURRENT_STATE:84`, verbatim: *"No in-memory Crisis state holder exists at runtime today —
disk is the only representation [Certain]"*.

### Attack

The claim is **technically nuanced and, as phrased, over-broad**. `App.tsx:121` declares
`crisisBridgeResult` — React state holding the full `readCrisis` result, including, on the
`valid` branch, the entire `CrisisRunState` object. `App.tsx:412-417` renders
`crisisBridgeResult.state.day` and `.state.cash` from memory, not from disk. That is, literally,
Crisis state held in memory at runtime. **[Certain — both lines read this session.]**

### But the distinction the requester asked for is the right one

There are two different claims, and CURRENT_STATE conflates them:

1. **"No durable/authoritative in-memory Crisis holder exists"** — **TRUE**. Nothing in the app
   treats an in-memory Crisis object as the source of truth. Nothing mutates one. Nothing
   persists from one. `crisisBridgeResult` is write-once-per-tap, read-only, display-only, and
   discarded on unmount. Disk remains the only authority. **[Certain.]**
2. **"No in-memory Crisis representation exists"** — **FALSE**, per `App.tsx:121`.

CURRENT_STATE asserts (2) while meaning (1), and stamps it `[Certain]`. The `[Certain]` tag
makes it worse: a confident false statement is more damaging than a hedged one.

### Why it matters beyond pedantry

The row lives in the **ownership/authority table** (`CURRENT_STATE:82-87`). A future session
building a real Crisis screen reads that table to answer "may I hold Crisis state in a
component?" The answer the architecture actually supports is *"yes, as a read-only projection;
no, as an authority."* The current wording says "no" flatly, which either blocks a legitimate
design or gets ignored wholesale once the reader spots `crisisBridgeResult` and concludes the
table is unreliable. Both outcomes are bad.

### Verdict on the proposed correction: **SOUND, and it must be precise**

M1's correction is correct to make. The replacement must say **authority**, not **existence**.

### Severity: **MINOR**

---

## 7. ATTACK M2 — `cash === CAPITAL - setupCost` in `isValidScannerState`

### The code

`App.tsx:101-103`, read this session:

```ts
if (committedTo !== null && cash !== null && setupCost !== null && cash !== CAPITAL - setupCost) {
  return false;
}
```

`isValidScannerState` is the restore-time validator for `hustle.scanner.v1`. Any persisted
Scanner state failing this check is rejected on load.

### Why is cash derived this way?

Because Scanner is currently a **pure commit-once screen with no post-commit cash mutation**.
`opening(o, capital)` (`logic.ts:122`) sets `cash = CAPITAL - o.cost` at commit, and no other
production code path writes `state.cash` afterwards. So the relation is a true invariant *of
the current architecture*, and checking it is legitimate defense-in-depth — it catches a
tampered or truncated save that a purely structural check would pass. **[Likely — based on the
absence of any other `cash` writer in the App.tsx regions read this session; I did not
exhaustively grep every assignment to `state.cash` across the repository this pass.]**

### Is it a persisted-state validation problem?

**Yes, and precisely.** It is a **relational invariant baked into a schema validator with no
schema version field**. The failure mode is concrete:

> Day-1 gameplay is added. Cash changes after commit — a repair job pays out R200. The app
> writes `hustle.scanner.v1` with `cash = 1300 + 200 = 1500`, `setupCost = 1200`. On next
> launch `isValidScannerState` computes `CAPITAL - setupCost = 1300`, sees `1500 !== 1300`,
> returns `false`. The save is rejected as corrupt. The user loses their run — and the code
> that "broke" it is in a file nobody touched.

**[Certain on the mechanism — this follows directly from the quoted lines.]** The trap is that
the breaking change (adding cash mutation) is in a *different file* from the code that rejects
the save. Nothing links them.

### Is it a current defect or a future migration constraint?

**Future migration constraint, not a current defect.** Today no production code mutates cash
post-commit, so the invariant holds for every state the app can actually produce. It becomes a
live data-loss bug the moment cash derivation changes. **[Likely, same caveat as above.]**

### Compounding factor found this pass

There is **no schema version field** on `hustle.scanner.v1`, and the corrupt-backup key
(`hustle.scanner.v1.corrupt-backup`, `App.tsx:58`) is the de facto migration mechanism — it
preserves exactly one corrupted state and is overwritten by the next corruption event. So the
failure mode above is not only silent, it is barely recoverable.

### Verdict on the proposed correction: **SOUND, and its "do not change code" clause is right**

Correction 4 — record as a documented constraint, do not change the persistence implementation
— is correct. Changing the validator now would weaken a currently-valid invariant to defend
against a hypothetical, and would do it without a schema-version mechanism to hang the change
on. Document it; fix it as part of whatever change first mutates cash.

### Severity: **MINOR** as documentation. Flagged **MAJOR-if-ignored** — the future
consequence is silent user data loss, not a cosmetic inaccuracy.

---

## 8. ATTACK M3 — discoverability of CURRENT_STATE

### Where authoritative architecture is currently expected to be found

`CLAUDE.md`'s documentation map, read as project context this session, is explicit and
hierarchical:

- **`MEMORY.md`** → "Read first. Current project state, validation status, next action."
- **`ARCHITECTURE.md`** → "Technical architecture, technology choices, trade-offs, the RN
  decision and its validation gate."
- **`RN_VALIDATION_REPORT.md`** → standalone RN verdict report.

All of these live at `C:\claude-projects\hustle\` (repository root). Confirmed this pass by
listing: 18 `.md` files at root, including `ARCHITECTURE.md`, `MEMORY.md`, `ROADMAP.md`,
`DECISIONS.md`, `RN_VALIDATION_REPORT.md`. **[Certain — directory listing this pass.]**

`HUSTLE_ARCHITECTURE_CURRENT_STATE.md` lives in `rn-slice/`, alongside **fifteen other
`HUSTLE_ARCHITECTURE_*.md` step reports** plus `SCANNER_SLICE_*.md`,
`PERSISTENCE_VALIDATION_REPORT.md`, and `NEXT_EXPERIMENT_*.md`. **[Certain — listing this
pass.]** `rn-slice/README.md` is the **stock React Native CLI template** — "This is a new React
Native project, bootstrapped using @react-native-community/cli" — with zero project content.
**[Certain — read this pass.]** So there is no index inside `rn-slice/` either.

### The actual discoverability problem, stated precisely

A fresh session following `CLAUDE.md` correctly lands on `ARCHITECTURE.md`. It has **no signal
whatsoever** that a more current, more specific, freeze-grade RN architecture baseline exists
one directory down, indistinguishable by filename from fifteen superseded step reports. The
freeze document is not merely unlisted — it is **camouflaged**.

### Does adding it create a duplicate documentation hierarchy?

**Only if added wrong.** Two failure modes:

- **Adding it as a peer of `ARCHITECTURE.md`** creates exactly the "two sources of truth"
  outcome the whole-plan adversary is charged with preventing. A reader would face two
  architecture documents with no stated precedence.
- **Adding all sixteen `HUSTLE_ARCHITECTURE_*` files** turns the map into a changelog and
  destroys its usefulness.

The safe form is a **subordinate, scoped, one-line entry** — the same pattern `CLAUDE.md`
already uses for `RN_VALIDATION_REPORT.md` (a standalone RN-specific report nested under the
general map), and the same pattern its own "Documentation update rule" endorses: *"Don't
duplicate; link."*

### Does the existing structure support the change?

**Yes.** `CLAUDE.md` already carries RN-slice-specific entries (`RN_VALIDATION_REPORT.md`,
`ANDROID_SETUP.md`) in a flat bulleted map. One more line is structurally identical to what is
already there. The correction plan's conditional — *"if and only if the repository's existing
documentation structure supports such a change"* — is satisfied. **[Certain on the structure;
Likely on "one line is sufficient", since I did not test how a fresh session actually navigates
it.]**

### Smallest possible change

One bullet in `CLAUDE.md`'s documentation map, scoped to the RN slice and explicitly
subordinate to `ARCHITECTURE.md`. Nothing else. No new index file, no `rn-slice/README.md`
rewrite, no reorganisation of the sixteen step reports.

### Severity: **MINOR**

### Note on execution

This is the **only correction in the plan that touches a file outside `rn-slice/`**, and the
requester's instruction is *"Do not automatically modify CLAUDE.md."* It therefore requires
explicit approval separately from the CURRENT_STATE corrections. It must not be bundled.

---

## 9. ATTACK M4 — commit / durability (operational integrity check)

**No commit was made. No `git add` was run. This section is inspection only.**

### Current working tree

```
$ git status --short
 M prototype/hustle-shell.html
 M rn-slice/App.tsx
 M rn-slice/src/persistence/queuedWrite.ts
?? domain-ts/
?? rn-slice/HUSTLE_ARCHITECTURE_CURRENT_STATE.md
?? rn-slice/HUSTLE_ARCHITECTURE_FINAL_PRE_FREEZE_ADVERSARY.md
?? rn-slice/HUSTLE_ARCHITECTURE_POST_FREEZE_AUDIT.md
?? rn-slice/HUSTLE_ARCHITECTURE_STEPS_09_12_REPORT.md
?? rn-slice/HUSTLE_ARCHITECTURE_STEP_13_ADVERSARY_REPORT.md
?? rn-slice/HUSTLE_ARCHITECTURE_STEP_13_ADVERSARY_RERUN.md
?? rn-slice/HUSTLE_ARCHITECTURE_STEP_13_REPAIR_REPORT.md
?? rn-slice/HUSTLE_ARCHITECTURE_STEP_13_REPORT.md
?? rn-slice/HUSTLE_ARCHITECTURE_STEP_14A_RUNTIME_BRIDGE.md
?? rn-slice/HUSTLE_ARCHITECTURE_STEP_14B_RUNTIME_REACHABILITY.md
?? rn-slice/HUSTLE_ARCHITECTURE_STEP_14_RUNTIME_VALIDATION.md
?? rn-slice/__tests__/crisisWriter.realwriter.test.ts
?? rn-slice/src/persistence/crisisWriter.ts
?? rn-slice/step14_*.png                      (14 screenshots)

$ git diff --stat
 prototype/hustle-shell.html             | 20 ++++++++++++
 rn-slice/App.tsx                        | 58 +++++++++++++++++++++++++++++++++
 rn-slice/src/persistence/queuedWrite.ts | 19 ++++++-----
 3 files changed, 89 insertions(+), 8 deletions(-)
```

**[Certain — run this pass.]**

### Classification

| Path | Status | Nature |
|---|---|---|
| `rn-slice/App.tsx` | modified (+58) | Step 14A bridge — experimental instrumentation |
| `rn-slice/src/persistence/queuedWrite.ts` | modified (+19/-8) | Step 13 repair — timeout on write and remove |
| `rn-slice/src/persistence/crisisWriter.ts` | **untracked** | Step 13 — entire Crisis writer, 211 lines, never committed |
| `rn-slice/__tests__/crisisWriter.realwriter.test.ts` | **untracked** | Step 13 test suite for the above |
| 12 × `HUSTLE_ARCHITECTURE_*.md` | **untracked** | Every architecture report, Steps 9-15, including the freeze baseline itself |
| 14 × `step14_*.png` | untracked | Emulator validation screenshots |
| `prototype/hustle-shell.html` | modified (+20) | **UNRELATED — causal-feedback pilot** |
| `domain-ts/` | untracked | Unexamined this pass; contents unknown |

### The finding the correction plan asked for

> *"whether committing the architecture baseline now would accidentally commit unrelated
> implementation changes."*

**Yes. Two ways, and one is worse than expected.**

1. **`prototype/hustle-shell.html` is unrelated work in progress.** Its diff is a causal-feedback
   research pilot — a new `CAUSAL_FEEDBACK_PILOT` flag and a Day-2 event branch, scoped to
   `HUSTLE_CAUSAL_FEEDBACK_FINAL_RESEARCH_AND_CLAUDE_BRIEF.md`. That document **does not exist
   in the repository** (not in the root `.md` listing taken this pass). This is a live,
   in-flight, externally-scoped experiment in the *canonical* prototype. A `git commit -a` or
   `git add -A` from `rn-slice/`'s parent sweeps it into an "architecture freeze" commit.
   **[Certain on the diff content; Certain that the referenced brief is absent from the root
   listing.]**
2. **`domain-ts/` is untracked and was not inspected.** Committing broadly would add an entire
   directory of unknown provenance to history. **[Certain that it is untracked; Guessing at its
   contents — not read.]**

### Second finding: production source is unversioned

`crisisWriter.ts` — 211 lines of production persistence code, the subject of Steps 13, 14, 14A,
and 14B, and a load-bearing component of the frozen architecture — **has never been committed**.
Neither has its test suite. The architecture baseline currently describes source that exists
only in one working tree on one machine, with no physical device and no backup path named
anywhere. This is a larger durability exposure than the missing documentation commits.

### Verdict on the proposed correction

Correction 6 — "treat commit/durability as an operational freeze step, not an architectural
correction" — is **SOUND and correctly separated**. It should additionally be **path-scoped**:
any freeze commit must enumerate paths explicitly and must **exclude `prototype/hustle-shell.html`
and `domain-ts/`** until each is separately reviewed.

### Severity: **MAJOR** (operational, not architectural)

Not a defect in the freeze document. A real risk in the act of committing it.

---

## 10. WHOLE-PLAN ADVERSARY

Each attack the requester specified, tested against the plan as written.

| # | Attack | Result |
|---|---|---|
| 1 | Do corrections create a **new source of truth**? | **Risk, via M3 only.** If CURRENT_STATE is listed as a peer of `ARCHITECTURE.md`, yes. Mitigated by requiring a subordinate, scoped entry with explicit precedence. Corrections 1,2,4,6 carry no such risk — they edit an existing document in place. |
| 2 | Do corrections **rewrite history**? | **Yes, for F1 and F2 — and this is the plan's core failure.** Both are stated as "CURRENT_STATE incorrectly implies X". For F2 that is false (the document says the opposite six times); for F1 it is inverted (the document over-claims in the other direction). Recording either justification writes a false account of what the freeze document said. |
| 3 | Do corrections **hide that recommit is not runtime-integrated**? | **No — but they fail to strengthen it where it is actually weak.** CURRENT_STATE states it clearly. `recommitInvalidation.ts:32-35` states the opposite, in source, and the plan leaves that unaddressed. |
| 4 | Do corrections make future architecture look **more complete than it is**? | **No.** All corrections move in the subtractive direction: fewer claimed callers, fewer claimed guarantees, more named constraints. |
| 5 | Do corrections turn **experimental instrumentation into production architecture**? | **Risk, via correction 3.** Its menu ("documentation-only / gating / removal / future cleanup") invites a code change. Gating the bridge with `__DEV__` would make it *look* like a sanctioned permanent debug facility — the opposite of temporary scaffolding. Rejected. |
| 6 | Do corrections create **unnecessary documentation process**? | **No**, as scoped: five in-place edits and one `CLAUDE.md` line. No new documents, no new review cadence. |
| 7 | Do corrections create **unnecessary code changes**? | **Yes, latently — correction 3 only.** Everything else is documentation. |
| 8 | Do corrections **remove useful runtime instrumentation prematurely**? | **Yes, latently — correction 3 only.** The bridge is the sole execution path for every EMULATOR-VERIFIED Crisis claim in the project. Removing or gating it now destroys the only real-runtime harness on a project that has no physical device. |
| 9 | Do corrections **overstate Scanner persistence guarantees**? | **No — correction 4 does the reverse**, and correctly declines to change the implementation. |
| 10 | Would corrections make **future Claude sessions misunderstand** the architecture? | **Yes, if F1/F2 are applied with their stated justifications.** A future audit reading "CURRENT_STATE incorrectly implied recommitInvalidation was integrated" would search for that wording, fail to find it, and either distrust the correction record or re-derive the whole recommit question from scratch. |

### Does any correction make the architecture LESS precise?

**Correction 2 (F2), as written: yes — by omission.** It spends the correction on a
non-existent error while the real one, `recommitInvalidation.ts:32-35`'s claim that "App.tsx's
commit handler awaits this", goes unrecorded. Net precision after applying it literally: zero
change to the document, and one live falsehood still unflagged.

**Correction 3 (F3), as written: yes, if its menu is taken up.** Gating or removing the bridge
reduces the repository's evidence base without improving the document.

The other four corrections increase precision.

---

## 11. FRESH CLAUDE SESSION TEST

Assume corrections applied **as refined in §13**, and a session reading only `CLAUDE.md`,
`HUSTLE_ARCHITECTURE_CURRENT_STATE.md`, `DECISIONS.md`, `ROADMAP.md`.

| # | Question | Answerable? |
|---|---|---|
| 1 | Is recommit invalidation active at runtime? | **YES** — stated six ways today (§4), unchanged by corrections. |
| 2 | Does Plan exist in production? | **YES** — "no domain module, no writer, no UI" (`CURRENT_STATE:43`). |
| 3 | Does Crisis have a resume API? | **YES** — `readCrisis` exists; `launchCrisis` is create-only; no update path (category C). |
| 4 | Is `launchCrisis` create-only? | **YES** — stated explicitly. |
| 5 | What does the timeout actually mean? | **YES** — `CURRENT_STATE:112-115` is precise: unblocks the caller, does not cancel; a "timed out" write can still land. |
| 6 | Who owns `BusinessId`? | **YES** — `App.tsx state.committedTo`, sole authority (`CURRENT_STATE:82`). |
| 7 | Is provenance technically enforced? | **PARTIAL — pre-existing gap, not created by these corrections.** `CURRENT_STATE:86` describes the stamp-vs-provenance guard but §9's rule reads imperatively without the local "unenforced" qualifier that `recommit.ts:16-29` carries. A reader could conclude the rule is enforced by code. Correction plan does not address this; carried as **N1** below. |
| 8 | Is the bridge production architecture? | **YES, after the refined correction 3** — currently ambiguous between `CURRENT_STATE` §8-B ("already labelled") and §15 ("labelling required"). |
| 9 | What is future vs current? | **YES** — the A/B/C category split (`CURRENT_STATE:225-250`) is the document's strongest feature. |
| 10 | What remains untested? | **PARTIAL.** Tests 3/5/10/11 are named INCONCLUSIVE with a structural reason. But nothing tells the reader that **all** Jest evidence runs against a *mocked* AsyncStorage, so "136/136 passing" carries no real-storage weight. Also carried as **N1**. |

**Score: 8 clean, 2 partial.** Neither partial is caused by the corrections; both are
pre-existing and neither is in the plan. Worth noting rather than expanding the plan to cover
them — the requester's own standard is the smallest correct architecture.

---

## 12. FINDINGS BY SEVERITY

Severity here rates **the proposed correction**, per the requester's definitions — not the
architecture.

### CRITICAL — correction would materially misrepresent the architecture

None.

### MAJOR — correction creates dangerous or significant ambiguity

- **F2 — the highest-priority correction is aimed at the wrong file and is a no-op.**
  `CURRENT_STATE` already states zero runtime callers in six places. The false "App.tsx's
  commit handler awaits this" statement lives in `recommitInvalidation.ts:32-35`, which this
  phase may not modify. Applying correction 2 literally changes nothing and records a false
  account of what the document said.
- **M4 — committing the freeze baseline naively would sweep in unrelated in-flight work.**
  `prototype/hustle-shell.html` carries an uncommitted causal-feedback research pilot whose
  own scope document is absent from the repository; `domain-ts/` is untracked and unexamined.
  Separately: `crisisWriter.ts` (211 lines of production code) and its test suite have never
  been committed at all.

### MINOR — correction needs refinement, no material misrepresentation

- **F1** — right outcome, inverted justification. The document under-claims callers
  ("zero anywhere, including tests"), it does not over-claim them. Correction text must also
  preserve the `isPlanValidFor` / `isCrisisValidFor` asymmetry so "no production callers" is
  not read as "dead code".
- **F3** — overscoped. Evidence settles it: documentation-only. The correction's own menu
  invites a forbidden code change and risks deleting the project's only real-runtime evidence
  path.
- **M1** — right to correct, must be precise: the true claim is about **authority**, not
  **existence**. `App.tsx:121` `crisisBridgeResult` is an in-memory Crisis representation.
- **M2** — sound as documentation; "do not change code" is the correct call. Flagged
  **MAJOR-if-ignored**: the eventual failure mode is silent save rejection and user data loss.
- **M3** — sound, and the structure supports it. Must be a subordinate scoped line, must not be
  bundled with the CURRENT_STATE edits, and requires separate approval.

### INFORMATIONAL

- **N1 (new, not in the plan)** — two residual gaps found by the fresh-session test:
  §9's provenance rule reads as enforced when `recommit.ts:16-29` calls it explicitly
  unenforced; and nothing states that all 136 Jest tests run against a **mocked** AsyncStorage.
  Recorded, not recommended for this pass — adding them would expand scope beyond the six
  agreed corrections.

---

## 13. EXACT CORRECTIONS TO APPLY

Refined. Where a correction is rewritten, the reason is stated. **None of these have been
applied.**

### Correction 1 — F1 — **REWRITTEN** (outcome kept, justification replaced)

Target: `CURRENT_STATE:228-230`.

The premise "CURRENT_STATE implies production callers" is rejected as false. The actual defect
is the clause *"zero callers anywhere, including tests-as-production-proxy"*, which is
contradicted by twelve test call sites. Replace with text that states:

- `isPlanValidFor` has **zero production callers**, and is exercised **only by unit tests**
  (`recommit.domain.test.ts`, `recommit.adversary.test.ts`);
- it is unreachable because **Plan has no module, writer, or reader** — not because it is
  superseded or dead;
- `isCrisisValidFor`, by contrast, **does** have a production caller (`crisisWriter.ts:206`,
  inside `readCrisis`) — the asymmetry must survive the edit.

### Correction 2 — F2 — **REWRITTEN** (target changed; original was a no-op)

Do **not** "correct CURRENT_STATE to state recommitInvalidation is not runtime-integrated" —
it already does, six times. Instead add a new hazard entry to CURRENT_STATE §8 recording:

- `recommitInvalidation.ts:32-35` contains a source comment asserting *"Caller (App.tsx's
  commit handler) awaits this AFTER the new Scanner commit is itself durably persisted"* —
  **this caller does not exist**;
- the comment is written in the present indicative, unlike line 60 of the same file, which
  correctly hedges ("were Plan/Crisis screens to exist");
- the correct runtime graph is: `commit()` → `commitSpot()` computes `resetDownstream`
  (`logic.ts:118`) → returns it (`logic.ts:125`) → **`App.tsx` discards it**; no storage
  removal occurs anywhere in the production path;
- `commitSpot()` performs no invalidation internally, by explicit design
  (`logic.ts:94-98`: "return value only, no side effects");
- under the current single hardcoded `BIZ`, `resetDownstream` is structurally always `false`,
  so discarding it is **not** a live defect — it becomes one the moment a second business is
  added;
- **fixing the comment is a code change and is out of scope for this phase** — it is recorded
  here so it is not lost, and so no future reader trusts it.

### Correction 3 — F3 — **NARROWED** (menu removed; determination made)

Documentation-only. Do **not** remove the bridge. Do **not** gate it. Record in CURRENT_STATE:

- the bridge is **experimental validation instrumentation**, never product architecture;
- it is rendered **inside the ordinary committed panel** (`App.tsx:388-420`) and is reachable
  by any user in one tap after commit — **ungated by design**, because it is the **sole
  execution path** for every EMULATOR-VERIFIED `launchCrisis`/`readCrisis` claim in the
  project, and no physical device exists;
- it is self-labelled in the UI ("Step 14A: launch + read Crisis (bridge)", raw `readCrisis:
  <kind>` output) — informal but unmistakable;
- it **diverges** from the project's own experimental convention, which is fail-closed
  (see `prototype/hustle-shell.html`'s `CAUSAL_FEEDBACK_PILOT` flag). The divergence is
  deliberate and is recorded so a future reader does not "fix" it and destroy the evidence
  path;
- **removal trigger, binding:** the bridge must be removed or gated **before any real Crisis
  screen ships**, because `launchCrisis` is create-only and overwrites — a tap mid-run would
  silently reset a real Crisis to day 0;
- this resolves the §8-B / §15 contradiction: §15's action item is **satisfied by this
  documentation**, not by a pending code change.

### Correction 4 — M2 — **ACCEPTED AS WRITTEN**, with one addition

Record as a documented constraint; do not change the persistence implementation. Add:

- `isValidScannerState` (`App.tsx:101-103`) requires `cash === CAPITAL - setupCost` whenever
  `committedTo` is set — a **relational invariant enforced inside a schema validator that has
  no schema version field**;
- valid today (no production path mutates cash post-commit), and it is legitimate
  defense-in-depth against tampered saves;
- **the first change that mutates cash after commit will cause existing saves to be rejected as
  corrupt on restore — silent user data loss**, from a validator in a file the change never
  touched;
- the corrupt-backup key retains exactly one prior corruption and is overwritten by the next,
  so recovery is thin;
- **binding constraint:** whatever change first mutates post-commit cash must relax this check
  and introduce a schema-version field in the same unit of work.

### Correction 5 — M3 — **ACCEPTED, SCOPED, AND SEPARATED**

The existing structure supports it (`CLAUDE.md` already carries RN-specific entries). Apply as:

- exactly **one** bullet in `CLAUDE.md`'s documentation map;
- explicitly **subordinate** to `ARCHITECTURE.md` and explicitly **scoped to the RN slice** —
  it must not read as a second general architecture source;
- it must distinguish `HUSTLE_ARCHITECTURE_CURRENT_STATE.md` from the fifteen superseded
  `HUSTLE_ARCHITECTURE_*` step reports it sits beside;
- **no other change**: no new index, no `rn-slice/README.md` rewrite (it is the stock RN
  template), no listing of the other reports;
- **requires separate explicit approval** — the standing instruction is "Do not automatically
  modify CLAUDE.md", and this is the only correction touching a file outside `rn-slice/`.
  Do not bundle it with corrections 1-4.

### Correction 6 — M4 — **ACCEPTED, PATH-SCOPED**

Operational freeze step, not an architectural correction — correct as framed. Add:

- any freeze commit must **enumerate paths explicitly**; no `git add -A`, no `git commit -a`;
- it must **exclude `prototype/hustle-shell.html`** (unrelated in-flight causal-feedback pilot,
  whose own scope document is absent from the repository) and **`domain-ts/`** (untracked,
  uninspected) until each is separately reviewed;
- it should **include `rn-slice/src/persistence/crisisWriter.ts` and
  `rn-slice/__tests__/crisisWriter.realwriter.test.ts`** — 211 lines of production persistence
  code plus its suite, load-bearing in the frozen architecture and **never committed**. This is
  a larger durability exposure than the missing documentation.

### Not recommended for this pass

**N1** (§9's provenance rule reading as enforced; the mocked-AsyncStorage caveat on the 136
passing tests). Both are real. Both are outside the six agreed corrections. Recorded here so
the next pass can decide deliberately rather than rediscover them.

---

## 14. FINAL VERDICT

# CORRECTIONS NEED REFINEMENT

The correction plan's **direction is right** — every one of the six items points at something
real, and none of them would make the architecture appear more complete than it is. But **two
of the six rest on premises that current source contradicts**, and one invites a code change
during a phase that forbids code changes.

**Rewritten:** correction 1 (F1 — right outcome, inverted justification), correction 2 (F2 —
correct target is a source comment in `recommitInvalidation.ts`, not `CURRENT_STATE`, which
already says the right thing in six places).

**Narrowed:** correction 3 (F3 — evidence settles it as documentation-only; the "gating /
removal" branch would destroy the project's only real-runtime evidence path on a project with
no physical device).

**Accepted with additions:** corrections 4, 5, 6 (M2 path-specific hazard; M3 scoped to one
subordinate line and separately approved; M4 path-scoped to exclude the unrelated prototype
pilot and to include the never-committed `crisisWriter.ts`).

The single most valuable thing this pass produced is not a correction — it is the finding that
**the freeze document was already right about recommit, and the correction plan was wrong**.
Had the plan been applied unexamined, the highest-priority correction would have been a no-op
that recorded a false history, while the actual falsehood — a source comment asserting a
Scanner commit path that does not exist — survived into the frozen baseline.

Applying the corrections as refined in §13 makes the freeze document strictly more precise.
Applying them as originally drafted would not.

---

## Operational status of this pass

```
$ git status --short
 M prototype/hustle-shell.html
 M rn-slice/App.tsx
 M rn-slice/src/persistence/queuedWrite.ts
?? domain-ts/
?? rn-slice/HUSTLE_ARCHITECTURE_*.md          (12 files, pre-existing)
?? rn-slice/__tests__/crisisWriter.realwriter.test.ts
?? rn-slice/src/persistence/crisisWriter.ts
?? rn-slice/step14_*.png                      (14 files)
```

**Files changed by this pass:** exactly one — this document,
`rn-slice/HUSTLE_ARCHITECTURE_FREEZE_CORRECTION_ADVERSARY.md` (new, untracked). No production
file, no test file, and `HUSTLE_ARCHITECTURE_CURRENT_STATE.md` were modified. Nothing staged,
nothing committed, nothing pushed.

**Tests run this pass:** none. **Builds run this pass:** none. **Emulator sessions this pass:**
none. Every runtime claim in this document is inherited from Steps 14/14A/14B and is
EMULATOR-VERIFIED at best; all Crisis persistence behavior remains **REAL-DEVICE-UNVERIFIED**.

**Method limits of this pass:** conclusions rest on static reading of source and documents.
Test-file line numbers and the bodies of `recommit.ts`, `recommitInvalidation.ts`,
`crisisWriter.ts`, and `queuedWrite.ts` are carried from earlier reads in this same session and
were not re-read here. `domain-ts/`, `NEXT_EXPERIMENT_SCANNER_PLAN_CRISIS.md`, and all test
bodies were not inspected at all.
