# LESSONS_LEARNED.md — HUSTLE

What HUSTLE taught us. Narrative source for each: `DEVELOPMENT_JOURNEY.md`, `BRAINSTORM_LOG.md`.
Not a repeat of HUSTLE's history — extracted principles. `LIBRARIAN CANDIDATE` = generalizes
beyond this project, pending a separate `/librarian` pass (not run automatically — `CLAUDE.md`).

Confidence: **[CERTAIN]** directly demonstrated · **[SUPPORTED]** strongly evidenced ·
**[INFERENCE]** reasonable generalization · **[HYPOTHESIS]** needs future validation.

---

## HUSTLE-SPECIFIC

### The classroom/consumer framing question isn't closed
**PRINCIPLE**: The consumer-app reframe left facilitator-side needs, monetization, and
outcome-validation genuinely open, not resolved by the reframe.
**WHY IT MATTERS**: Future work could silently re-import classroom-tool assumptions or silently
foreclose them without a decision either way.
**HUSTLE EVIDENCE**: `PRODUCT.md` → "Known product-truth open questions"; `DECISIONS.md` →
"Consumer-app reframe."
**WHEN TO APPLY**: Any HUSTLE product decision touching acquisition, monetization, or
facilitator features.
**WHEN NOT TO APPLY**: n/a — HUSTLE-specific.
**GENERALIZATION**: none claimed.
**CONFIDENCE**: [CERTAIN]

### The crisis-length contradiction is unresolved, not fixed
**PRINCIPLE**: The shipped bundle shows `DAY 1/14` in the header but "Seven trading days" in the
tutorial copy, with 210 day-entries authored (5 businesses × 14 days × 3 fields) — either the
header is wrong or 7 authored days are unreachable. Not resolved without source access.
**WHY IT MATTERS**: Whichever screen or copy is "true" affects balance, pacing, and content
completeness claims.
**HUSTLE EVIDENCE**: `PRODUCT.md` → "Known product-truth open questions."
**WHEN TO APPLY**: Before any further Crisis-stage content or balance work.
**WHEN NOT TO APPLY**: n/a.
**GENERALIZATION**: none claimed.
**CONFIDENCE**: [CERTAIN] that the contradiction exists; [NOT RECOVERABLE] which side is correct.

---

## PROJECT METHODOLOGY

### RESEARCH → BENCHMARK → EVIDENCE → DESIGN STANDARD → ADVERSARIAL CRITIQUE
**PRINCIPLE**: Replace "does this look good" with an externally checkable standard before
critiquing against it.
**WHY IT MATTERS**: Taste judgments can't be argued with or falsified; evidence-backed standards
can be checked, disputed on specifics, and re-run.
**HUSTLE EVIDENCE**: `research/best-practices.md`, `research/competitive-teardown.md` feeding
`DESIGN.md`; the 31/40 critique that found mechanical inertness invisible to a surface pass
(`BRAINSTORM_LOG.md` pivot 1).
**WHEN TO APPLY**: Any product-quality question with no obvious ground truth (visual design,
UX flow, content tone).
**WHEN NOT TO APPLY**: Purely mechanical/functional bugs — those have a direct pass/fail, no
benchmark needed.
**GENERALIZATION**: [SUPPORTED] — the pipeline itself doesn't depend on HUSTLE's domain.
**CONFIDENCE**: [SUPPORTED]

### Vertical-slice-before-migration gate
**PRINCIPLE**: When an architecture recommendation rests on generic (not project-specific)
benchmarks, validate it against one small, representative, real slice before committing to a
full rewrite.
**WHY IT MATTERS**: Bounds the cost of the recommendation being wrong to one slice's rework
instead of the whole system's.
**HUSTLE EVIDENCE**: RN recommendation validated via the Crisis-stage slice; the domain-layer
extraction alone caught 4 major bugs an unvalidated "clean port" self-report had missed
(`DEVELOPMENT_JOURNEY.md` #8).
**WHEN TO APPLY**: Any framework/platform choice made primarily from external benchmarks rather
than measurement against your actual content and constraints.
**WHEN NOT TO APPLY**: Low-blast-radius or trivially reversible tech choices — the gate's cost
(slower path to any real progress) isn't worth it there.
**GENERALIZATION**: [SUPPORTED] — this is a standard de-risking pattern (spike/prototype before
commit), HUSTLE is a clean instance of it working.
**CONFIDENCE**: [SUPPORTED]

### An audited/reverse-engineered framing is a hypothesis, not ground truth
**PRINCIPLE**: When project understanding starts from inspecting an artifact (a deployed bundle,
existing code) rather than the owner's stated intent, treat the resulting framing as provisional
until confirmed.
**WHY IT MATTERS**: The classroom-tool framing was a reasonable read of the shipped bundle and
was still wrong about the actual product intent.
**HUSTLE EVIDENCE**: `DEVELOPMENT_JOURNEY.md` #1, #3.
**WHEN TO APPLY**: Any project starting from artifact audit rather than direct requirements.
**WHEN NOT TO APPLY**: When the owner has already stated intent directly — don't manufacture
doubt about a confirmed fact.
**GENERALIZATION**: [SUPPORTED]
**CONFIDENCE**: [SUPPORTED]

### Name platform/scope assumptions explicitly, even ones nobody remembers deciding
**PRINCIPLE**: An artifact's incidental properties (a prototype happens to be a browser build)
tend to silently become assumed decisions unless someone states the actual decision out loud.
**WHY IT MATTERS**: Left implicit, dependent work (test harnesses, layout assumptions) compounds
around the accidental property, making it expensive to reverse later.
**HUSTLE EVIDENCE**: `BRAINSTORM_LOG.md` pivot 6 (web prototype → mobile application).
**WHEN TO APPLY**: Whenever a working prototype's implementation medium could be mistaken for a
platform commitment.
**WHEN NOT TO APPLY**: Trivial/throwaway prototypes with no dependent work accruing around them.
**GENERALIZATION**: [SUPPORTED]
**CONFIDENCE**: [SUPPORTED]

### A testable hypothesis beats a checklist when a product asks the user to believe something
**PRINCIPLE**: Where a product wants a user to act on a belief, make the belief an explicit,
falsifiable hypothesis (who/what/why) rather than a list of tasks.
**WHY IT MATTERS**: A checklist can be fully completed without the underlying belief ever being
challenged; a hypothesis can't be "completed" without being tested.
**HUSTLE EVIDENCE**: `research/real-world-bridge.md` — the model was revised from a field-list
("Business Builder") to a single hypothesis sentence within one day of review.
**WHEN TO APPLY**: Any feature asking a user to plan, predict, or commit to an unverified belief
about the real world.
**WHEN NOT TO APPLY**: Pure procedural tasks with no belief to falsify (e.g. "fill in your
address") — a checklist is the right shape there.
**GENERALIZATION**: [INFERENCE] — one strong HUSTLE instance, not independently cross-checked
against another project.
**CONFIDENCE**: [INFERENCE]

### Keep an internal epistemic-state model even when the UI stays plain
**PRINCIPLE**: Separate KNOWN (system-provided) / ASSUMED (user belief) / UNKNOWN / TESTED /
LEARNED as an internal model, without exposing the taxonomy words to the user.
**WHY IT MATTERS**: Prevents a specific credibility failure — presenting a system-generated fact
with the same confidence as something the user actually verified themselves.
**HUSTLE EVIDENCE**: `research/real-world-bridge.md` §5, explicit about the KNOWN-vs-TESTED
distinction and the plain-language UI translation.
**WHEN TO APPLY**: Any product that mixes system-provided facts, user beliefs, and real-world
verification in the same flow.
**WHEN NOT TO APPLY**: Products with only one information source (pure system-of-record apps) —
no epistemic mixing to protect against.
**GENERALIZATION**: [INFERENCE] — a decision-framework candidate, not yet reused elsewhere.
**CONFIDENCE**: [INFERENCE]

---

## MOBILE-SPECIFIC

### Emulator evidence and real-device evidence are not the same claim
**PRINCIPLE**: Label every mobile test result EMULATOR-VERIFIED or REAL-DEVICE-UNVERIFIED;
never let the former imply the latter.
**WHY IT MATTERS**: Thermal throttling, real touch latency, and real memory pressure under OS
contention are exactly the failure modes an emulator can't reproduce — HUSTLE's own validation
report keeps the verdict at CONDITIONAL GO specifically because this gap was never closed.
**HUSTLE EVIDENCE**: `RN_VALIDATION_REPORT.md`, `MEMORY.md` → "Current Validation State."
**WHEN TO APPLY**: Any mobile project without guaranteed real-device access during development.
**WHEN NOT TO APPLY**: Once real-device validation is actually done and passes — then the
distinction has served its purpose for that result.
**GENERALIZATION**: [SUPPORTED]
**CONFIDENCE**: [SUPPORTED]

### Build the autonomous-testing ladder, don't skip to the top rung
**PRINCIPLE**: Emulator boot → ADB scripted control → declarative UI-flow tool (Maestro) →
autonomous interaction with real assertions → adversarial stress, in that order, each layer
catching a failure class the previous one can't.
**WHY IT MATTERS**: "It installed and launched once" is not evidence of lifecycle, interaction,
or regression robustness — those are different claims needing different evidence.
**HUSTLE EVIDENCE**: `BRAINSTORM_LOG.md` pivot 9; `RN_VALIDATION_REPORT.md`'s adversarial
emulator pass.
**WHEN TO APPLY**: Any AI-agent-driven mobile QA workflow, especially without a physical device.
**WHEN NOT TO APPLY**: Throwaway prototypes not headed toward any real validation gate.
**GENERALIZATION**: [SUPPORTED]
**CONFIDENCE**: [SUPPORTED]

### `kill -9` on an unrooted Android emulator silently fails
**PRINCIPLE**: `adb shell kill -9 <pid>` returns `Operation not permitted` on an unrooted
emulator shell but the failure is easy to miss if the calling script doesn't check for it; use
`am force-stop` (verified via `pidof` returning empty) for a genuine kill/restart test.
**WHY IT MATTERS**: An unchecked failure here doesn't error loudly — it produces a plausible-
looking but fake "instant restart" result.
**HUSTLE EVIDENCE**: `BRAINSTORM_LOG.md` pivot 10b.
**WHEN TO APPLY**: Any Android emulator lifecycle test involving process termination.
**WHEN NOT TO APPLY**: On a rooted device/emulator where `kill -9` genuinely works — check
`whoami` first rather than assuming.
**GENERALIZATION**: [CERTAIN] — this is a documented Android permission model property, not
HUSTLE-specific. **LIBRARIAN CANDIDATE.**
**CONFIDENCE**: [CERTAIN]

### Maestro text selectors are full-match regex, not substring search
**PRINCIPLE**: `visible:`/`notVisible:`/plain string selectors in Maestro match a node's
*entire* text against the pattern (Java `String.matches()` semantics) — a true substring like
`"Day 1 / "` against actual text `"Day 1 / 14"` fails to match and reports the element as not
found, even though it is visibly, verifiably present in the same hierarchy dump used to report
the failure. Always wrap selectors in `.*wildcards.*` unless matching the full literal text.
**WHY IT MATTERS**: This produced repeated FAILED verdicts on `crisis_persistence_adversarial.yaml`
while screenshots and hierarchy dumps captured at the exact failure moment showed the correct
app state — a false-failure signal indistinguishable from a real one without opening the raw
hierarchy JSON. Compounded by a second, separate cause (a `notVisible`-as-mount-gate assertion
that passes vacuously before the JS bundle renders anything at all).
**HUSTLE EVIDENCE**: `rn-slice/.maestro/TEST_HARNESS_INVESTIGATION.md` — full GRAPH → LOOP →
ADVERSARY writeup, direct hierarchy/screenshot inspection, 3 consecutive clean reruns post-fix,
plus an intentional-failure control case confirming the harness still correctly reports FAILED
on a genuinely false assertion.
**WHEN TO APPLY**: Any Maestro flow (or any UI-automation tool with regex-based text matching)
where a selector is written as a bare prefix/fragment of the real on-screen text.
**WHEN NOT TO APPLY**: Selectors already written as full literal text or already wildcarded.
**GENERALIZATION**: [SUPPORTED] — the full-match-not-substring behavior is a Maestro/regex
property, not app-specific; the "positive assertion only, never absence-as-a-readiness-gate"
principle generalizes further, to any UI-automation tool. **LIBRARIAN CANDIDATE.**
**CONFIDENCE**: [CERTAIN] — directly reproduced (broke, then fixed, then reproduced the fix
holding across reruns) and directly inspected via hierarchy JSON, not inferred.

### `SafeAreaProvider` silently fails to mount children in jest without its official mock
**PRINCIPLE**: `react-native-safe-area-context`'s `SafeAreaProvider` waits for a native
`onInsetsChange` callback that jest's simulated environment never fires, so children never
render — `ReactTestRenderer.create(<App/>)` "succeeds" (no throw) while the whole tree stays
empty. A test asserting only "doesn't throw" passes vacuously even if the screen is fully
broken. Fix: `jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default)`
— note the required `.default`: the mock file only exports a `default`, so a bare `require()`
(CJS) without `.default` still leaves named imports (`SafeAreaProvider`, `SafeAreaView`)
undefined, producing a different but equally confusing crash.
**WHY IT MATTERS**: This is the same failure shape as the Maestro full-match lesson below —
a test that reports green (or in this case, doesn't-throw) without ever having exercised real
content — just surfacing in a different tool (jest/react-test-renderer instead of Maestro).
**HUSTLE EVIDENCE**: `rn-slice/__tests__/App.test.tsx` — the original Scanner-slice smoke test
had exactly this shape; found and fixed during the 2026-08-12 round-2 adversary pass
(`rn-slice/SCANNER_SLICE_REPORT.md` → "ADVERSARY ROUND 2", finding #6).
**WHEN TO APPLY**: Any RN project using `react-native-safe-area-context` with jest/
react-test-renderer (or `@testing-library/react-native`) tests that mount a screen wrapped in
`SafeAreaProvider`.
**WHEN NOT TO APPLY**: Projects not using this specific library, or tests that already assert
real rendered content (not just "no throw") — those would have caught the empty-tree case
anyway.
**GENERALIZATION**: [CERTAIN] — reproduced directly (broke, then fixed, confirmed real content
renders post-fix). The specific library/API is narrow, but the underlying principle
("assert positive content was rendered, not merely that render didn't throw") is the same
one already generalized from the Maestro lesson below. **LIBRARIAN CANDIDATE** (bundle with
the existing Maestro full-match entry as one broader "positive-content-assertion" principle,
rather than as a separate item, when a librarian pass runs).
**CONFIDENCE**: [CERTAIN]

### Windows MAX_PATH breaks RN/Gradle/CMake/Ninja native builds
**PRINCIPLE**: Native Android build tooling generates deep intermediate paths regardless of
project depth; a project root nested under `Documents\...` on Windows will eventually exceed the
260-character path limit. Fix the root's depth, not individual failing paths — a shallow
canonical root (`C:\claude-projects\<project>\` here) avoids the whole class of failure. A
project *move* also requires clearing stale generated absolute paths and a clean regeneration,
not just a filesystem move.
**WHY IT MATTERS**: Fixing one long path just relocates the failure to the next deep generated
path; the constraint is structural, not incidental.
**HUSTLE EVIDENCE**: `BRAINSTORM_LOG.md` pivot 11, `ANDROID_SETUP.md`, `DECISIONS.md` →
"Canonical path migration."
**WHEN TO APPLY**: Any native-build Windows project (RN, Flutter, any CMake/Ninja toolchain).
**WHEN NOT TO APPLY**: Pure JS/web projects with no native build step, or non-Windows dev
machines.
**GENERALIZATION**: [CERTAIN] — general Windows/native-toolchain property. **LIBRARIAN
CANDIDATE.**
**CONFIDENCE**: [CERTAIN]

### Five specific RN/Android toolchain gotchas (this machine's environment)
**PRINCIPLE**: `gradlew.bat` must be invoked directly (not wrapped); `adb` isn't on PATH by
default; first cold RN Android build takes ~44 minutes; an 18-25s first-launch window is
visually indistinguishable from a crash in a screenshot (verify via logcat's "Displayed"
timestamp instead); Gradle 9.4.1's diagnostics writer can produce a false-negative `BUILD
FAILED` after a genuinely successful install.
**WHY IT MATTERS**: Each one independently produces a plausible false-failure or false-crash
signal if not known in advance.
**HUSTLE EVIDENCE**: `DEVELOPMENT_JOURNEY.md` #9, `ANDROID_SETUP.md`.
**WHEN TO APPLY**: Any future RN/Android build work on this machine.
**WHEN NOT TO APPLY**: Different machine/toolchain versions — treat as a starting checklist to
re-verify, not an assumed-still-true fact.
**GENERALIZATION**: [SUPPORTED] for the general pattern ("build tool exit signals can lie, verify
independently"); [CERTAIN] but machine/version-specific for the exact five. **LIBRARIAN
CANDIDATE** (the pattern, not the exact version numbers).
**CONFIDENCE**: [SUPPORTED]

---

## AI-AGENT METHODOLOGY

### Don't trust a single review pass or a self-applied fix

*Independent reproduction, not just a second look, is what "don't trust a single pass" cashes
out to in practice — see the persistence-fix pass in `rn-slice/PERSISTENCE_VALIDATION_REPORT.md`
(own jest tests, own mocks, adversary's scratch files untouched). Extracted to
`~/.claude/knowledge/process/structured-validation-gate-prompting.md` step 3, 2026-08-12.*

**PRINCIPLE**: An agent's "fixed" claim, and even a first independent review's "clear," are each
individually fallible — require a second independent look after any fix before trusting it.
**WHY IT MATTERS**: In HUSTLE's domain-layer validation, a self-report claiming a clean 1:1 port
was wrong (4 major bugs found by review round 1); the round-2 fix for one of those bugs was
*itself* wrong (fired on 100% of runs) and caught only by review round 3.
**HUSTLE EVIDENCE**: `DEVELOPMENT_JOURNEY.md` #8.
**WHEN TO APPLY**: Any agent-authored fix of real consequence (architecture-critical logic,
anything gating a validation decision).
**WHEN NOT TO APPLY**: Trivial, easily-eyeballed changes (a typo fix, a one-line constant) —
the review overhead isn't proportionate.
**GENERALIZATION**: [SUPPORTED] — matches this project's own standing rule, now in `CLAUDE.md`.
**CONFIDENCE**: [SUPPORTED]

### An anomalously "too good" measurement is itself evidence of a broken method
**PRINCIPLE**: When an agent's own test produces a result cleaner or faster than plausible, treat
the anomaly as a signal to re-check the measurement method before reporting the result.
**WHY IT MATTERS**: This is exactly how the `kill -9` false-success was caught — a suspicious
`TotalTime: 0` across all 5 cycles, not a crash or visible error, was the only signal something
was wrong.
**HUSTLE EVIDENCE**: `BRAINSTORM_LOG.md` pivot 10b.
**WHEN TO APPLY**: Any automated measurement loop, especially ones run by an agent without a
human watching every cycle live.
**WHEN NOT TO APPLY**: n/a — this is a general skepticism heuristic, always cheap to apply.
**GENERALIZATION**: [CERTAIN] as a general engineering/testing heuristic. **LIBRARIAN
CANDIDATE.**
**CONFIDENCE**: [SUPPORTED]

### Hardware/environment gaps get labeled and worked around, never used to silently stop
**PRINCIPLE**: When a required validation resource (a physical device, in HUSTLE's case) is
unavailable, don't stall the workstream and don't silently substitute a weaker proxy as
equivalent — proceed as far as possible on the available proxy and label the result's actual
evidentiary weight honestly.
**WHY IT MATTERS**: Both failure modes are dishonest or wasteful in different ways: stalling
wastes the work that *could* be done; silent substitution overclaims what was actually shown.
**HUSTLE EVIDENCE**: `BRAINSTORM_LOG.md` pivot in the earlier version of this file ("Can
emulator-only evidence stand in for real-device validation?"), `RN_VALIDATION_REPORT.md`'s
CONDITIONAL GO verdict.
**WHEN TO APPLY**: Any project with a real, standing environment/access constraint (device
access, missing credentials, no staging environment).
**WHEN NOT TO APPLY**: When the missing resource is trivially obtainable — then get it, don't
build workaround infrastructure.
**GENERALIZATION**: [SUPPORTED] — a directly reusable stance for agent-driven QA under
constraints. **LIBRARIAN CANDIDATE.**
**CONFIDENCE**: [SUPPORTED]

### Never trust a wrapped batch-file invocation's silence as success
**PRINCIPLE**: `cmd.exe /c "some.bat ..."` can silently no-op; call `.bat` files directly and
check real exit output, not the wrapper's apparent success.
**WHY IT MATTERS**: This exact failure mode looked like a license/rate-limit problem across
multiple sessions before being root-caused.
**HUSTLE EVIDENCE**: `DEVELOPMENT_JOURNEY.md` #6.
**WHEN TO APPLY**: Any Windows batch-file automation run by an agent.
**WHEN NOT TO APPLY**: n/a.
**GENERALIZATION**: [SUPPORTED] — Windows-tooling-specific but not HUSTLE-specific. **LIBRARIAN
CANDIDATE.**
**CONFIDENCE**: [SUPPORTED]

### Explicit stopping conditions prevent scope creep off a validation pass
**PRINCIPLE**: State in advance, and hold to, a binding rule that a validation result (however
good) doesn't by itself authorize the next phase (migration, persistence, new features) without
explicit user sign-off.
**WHY IT MATTERS**: A CONDITIONAL GO is easy to round up to "let's go" in an agent's own
momentum; an explicit stop condition prevents that rounding.
**HUSTLE EVIDENCE**: `CLAUDE.md` → "Critical engineering rules," the binding stop condition
after the RN validation pass; this project's own session history shows the rule was honored (no
migration work started despite a CONDITIONAL GO).
**WHEN TO APPLY**: Any agent-driven validation gate with a consequential next phase behind it.
**WHEN NOT TO APPLY**: Low-consequence, cheaply-reversible next steps — the overhead of a formal
gate isn't worth it.
**GENERALIZATION**: [SUPPORTED] **LIBRARIAN CANDIDATE.**
**CONFIDENCE**: [SUPPORTED]

### A same-tick re-entrancy guard in a React event handler must be a ref, not state
**PRINCIPLE**: `if (someStateFlag) return;` inside an `onPress`/`onClick` handler is not a
reliable re-entrancy guard — two invocations dispatched in the same JS tick (a fast double-tap,
before the disabling prop re-renders) both close over the same stale state value and both pass
the check. Use a synchronous `useRef` set as the guard's first line instead; keep the state
value only for UI display (spinner/disabled styling), never for correctness.
**WHY IT MATTERS**: This exact bug class fired twice in HUSTLE, in two unrelated screens: Crisis
slice's `pick()` (Phase 3 adversary review) and Scanner slice's `commit()` (self-caught this
pass, before a formal adversary review). A recurrence across independently-written code is
strong evidence it's a systemic React pattern, not a one-off mistake.
**HUSTLE EVIDENCE**: `ROADMAP.md` Phase 3 (Crisis `pick()` fix); `rn-slice/SCANNER_SLICE_REPORT.md`
(Scanner `commit()` fix, independently reproduced via rebuild + reinstall-verify + clean
baseline re-run + fixed-case re-run, pre-fix evidence not reused).
**WHEN TO APPLY**: Any React/React Native event handler that gates a non-idempotent side effect
(a write, a charge, a network call, a persist) behind a "already in progress" check.
**WHEN NOT TO APPLY**: Handlers whose side effect is naturally idempotent, or where the disabling
UI prop is already proven to land before any possible re-dispatch (rare — don't assume this
without checking).
**GENERALIZATION**: [SUPPORTED] — this is a general React closure/state-timing property, not
HUSTLE- or RN-specific; recurrence across two independent handlers in this project raises
confidence it's a real recurring failure mode, not a coincidence. **LIBRARIAN CANDIDATE.**
**CONFIDENCE**: [SUPPORTED]

### Separating documentation/knowledge work from implementation work needs the same discipline
**PRINCIPLE**: A documentation/knowledge-extraction task should carry its own explicit non-goals
(no code changes, no architecture changes, no new feature work) exactly like an implementation
task does.
**WHY IT MATTERS**: Without that boundary, a "let's document what we learned" task can drift
into "and let's also fix/build the thing we just found a gap in" — legitimate work, but not the
task that was asked for.
**HUSTLE EVIDENCE**: This session's own governing prompts (documentation-system spec, this
knowledge-extraction spec) both stated explicit non-goals up front; both were held to.
**WHEN TO APPLY**: Any dedicated documentation, review, or knowledge-capture pass.
**WHEN NOT TO APPLY**: n/a.
**GENERALIZATION**: [SUPPORTED]
**CONFIDENCE**: [SUPPORTED]

---

## GENERAL ENGINEERING

### Surface polish and mechanical/functional substance are independent axes
**PRINCIPLE**: A thing can look finished and be functionally broken underneath (or vice versa);
verify each separately.
**WHY IT MATTERS**: HUSTLE's prototype scored well visually while being mechanically inert
underneath — a purely visual review would have missed it entirely.
**HUSTLE EVIDENCE**: `DEVELOPMENT_JOURNEY.md` #2.
**WHEN TO APPLY**: Any review process — don't let a strong visual/surface impression stand in
for functional verification.
**WHEN NOT TO APPLY**: n/a.
**GENERALIZATION**: [SUPPORTED] — well-established general software-review principle,
HUSTLE is a clean instance.
**CONFIDENCE**: [SUPPORTED]

### IMPLEMENTED and VERIFIED are different claims
**PRINCIPLE**: A change being made is not evidence it works; require direct observation
(execution, output inspection) before calling something verified.
**WHY IT MATTERS**: Both a build-tool false-negative and an agent's own false-positive self-
report occurred in this project — trusting either would have shipped a wrong belief.
**HUSTLE EVIDENCE**: `BRAINSTORM_LOG.md` pivot 10, `ANDROID_SETUP.md`.
**WHEN TO APPLY**: Universally, for any deliverable of real consequence.
**WHEN NOT TO APPLY**: n/a.
**GENERALIZATION**: [CERTAIN] — this is the core of the EXECUTE → OBSERVE → CORRECT → RETEST
loop, already codified project-wide (`CLAUDE.md`, user's own global standard). **LIBRARIAN
CANDIDATE.**
**CONFIDENCE**: [CERTAIN]

---

## Not yet lessons — open items to watch

- Whether Detox vs. Maestro turns into a lesson depends on which is picked and why
  (`DECISIONS.md` → "Detox vs. Maestro," currently open).
- Real-device validation, once run, may surface a gap the emulator pass couldn't see — that
  would extend the "emulator ≠ real-device" lesson above rather than create a new one.
- Whether the `REAL_WORLD_BRIDGE.md` hypothesis model survives implementation unchanged, or gets
  revised again once built, is unresolved — the model has already been revised twice on paper
  before any code existed.
