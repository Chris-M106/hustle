# NEXT_APP_PLAYBOOK.md

"If I started my next mobile app tomorrow knowing everything from HUSTLE, what would I do
differently from day one?" Grounded in `LESSONS_LEARNED.md` and `BRAINSTORM_LOG.md` — not
generic startup/mobile-dev advice. Every item states WHY.

**This file's generalizable content already lives in the shared knowledge vault** at
`~/.claude/knowledge/process/mobile-app-development-playbook.md` (day-zero sequence,
tech-selection framework, testing hierarchy, AI-agent workflow, anti-patterns — cross-linked
back to HUSTLE). For a genuinely *new* project, start there, not here — it's stripped of
HUSTLE-specific framing and kept current across projects. This file stays as HUSTLE's own
grounded articulation (why each item, in this project's own terms) and as the source record
the vault entry cites.

---

## BEFORE WRITING CODE

- **State the platform decision explicitly, on day one, even for a prototype.** A browser
  prototype's medium was mistaken for a platform commitment in HUSTLE until amended weeks in
  (`BRAINSTORM_LOG.md` pivot 6). WHY: dependent work compounds silently around an unstated
  assumption.
- **Decide consumer vs. institutional/facilitator product before writing the product doc**, not
  after auditing an artifact. HUSTLE's classroom framing came from auditing a deployed bundle and
  was wrong about actual intent (pivot 3). WHY: artifact audits reveal what was built, not what
  was intended.
- **Pick the canonical project root path with the OS's build-tooling limits in mind up front**
  (Windows: shallow, outside `Documents\`). WHY: `MAX_PATH` failures under native toolchains are
  structural, not incidental — fixing them after the fact means a project move plus a full clean
  regeneration.

## PRODUCT DISCOVERY

- **Write down who the user actually is, including literacy/education level, before designing
  UX**, and cite a real external standard (W3C low-literacy design, in HUSTLE's case) rather than
  an assumed persona. WHY: HUSTLE's UX (voice, reading level, iconography) is directly shaped by
  this and would be wrong without it.
- **If the product asks users to believe something about the real world, model it as a
  falsifiable hypothesis, not a checklist.** WHY: a checklist can be completed without the belief
  ever being tested; a hypothesis can't (`LESSONS_LEARNED.md` → "PROJECT METHODOLOGY").

## RESEARCH

- **Replace "does this look good" with RESEARCH → BENCHMARK → EVIDENCE → DESIGN STANDARD →
  ADVERSARIAL CRITIQUE before any product-quality judgment.** WHY: taste judgments can't be
  argued with; standards can be checked and re-run. HUSTLE's 31/40 critique found a mechanical
  problem a surface pass missed.

## UX-DESIGN

- **Verify mechanics and visuals separately — a good look does not imply working mechanics.**
  HUSTLE's Stage-1 choices didn't branch anything despite reading as authored
  (`DEVELOPMENT_JOURNEY.md` #2). WHY: they're independent axes; only checking one leaves the
  other's failures invisible.

## ARCHITECTURE

- **Run REQUIREMENTS → CONSTRAINTS → OPTIONS → TRADE-OFFS → HIGH-RISK ASSUMPTION → SMALLEST
  REPRESENTATIVE EXPERIMENT → MEASURE → ADVERSARY → DECISION, not "pick the popular framework."**
  HUSTLE's RN choice came from constraints (low-end Android, existing JS domain layer,
  animation-heavy design system), not popularity.
- **If the recommendation rests on generic industry benchmarks rather than project-specific
  measurement, say so explicitly and gate the decision on a real slice.** HUSTLE's own
  `ARCHITECTURE.md` names this gap; the vertical-slice gate exists specifically to close it.
- **State up front what would change the decision** (a new platform requirement, a discovered
  performance problem) — HUSTLE's RN decision carries this list in `DECISIONS.md`. WHY: makes the
  decision falsifiable instead of sticky-by-default.

## PROTOTYPING

- **Build one small, representative vertical slice before committing to a full migration or
  rewrite**, with a binding stop condition that a passing slice doesn't itself authorize full
  migration. WHY: bounds the cost of the architecture bet being wrong; caught 4 major bugs in
  HUSTLE's domain-layer port that a self-report had missed.
- **Keep domain logic framework-agnostic (plain TypeScript/language, no framework imports) and
  port it first, standalone, before any UI work.** WHY: isolates arithmetic/logic correctness
  from rendering correctness — HUSTLE's adversary rounds could differential-test the domain layer
  against the original with a 225-point simulation, independent of any screen existing yet.

## TESTING STRATEGY

- **Build the autonomous-testing ladder in order: emulator boot → scripted device control (adb)
  → declarative UI-flow tool (Maestro/Detox) → autonomous interaction with real assertions →
  adversarial stress.** Don't skip to the top rung. WHY: each layer catches a failure class the
  previous can't; "it launched once" isn't evidence of lifecycle or regression robustness.
- **Label every mobile-test result EMULATOR-VERIFIED or REAL-DEVICE-UNVERIFIED, never let one
  imply the other.** HUSTLE's own RN validation stayed at CONDITIONAL GO specifically because
  this gap was never closed. WHY: thermal throttling, real touch latency, real memory pressure
  under OS contention are exactly what an emulator can't reproduce.
- **Treat an anomalously clean measurement as a signal the method is broken, not a good result.**
  HUSTLE's `kill -9` false-success (`TotalTime: 0` across 5 cycles, actually a silent permission
  failure) was caught exactly this way. WHY: automated loops don't self-report broken methodology.
- **Never trust a build tool's exit code alone.** Gradle's diagnostics writer produced a
  false-negative `BUILD FAILED` after a genuinely successful install in HUSTLE. WHY: verify via
  independent evidence (logcat, actual device state), not the wrapper's claimed result.

## AI-AGENT SETUP

- **State explicit non-goals up front for every phase** (no migration without sign-off, no app
  code changes during a documentation pass). WHY: HUSTLE's own stop conditions were honored
  specifically because they were explicit, not because an agent judged scope correctly on its own.
- **Require independent re-verification of agent-authored fixes on anything consequential** — a
  self-applied fix is not evidence it's correct. HUSTLE's domain-layer port needed 3 adversary
  rounds before a genuinely clean result; round 2's own fix was itself wrong.
- **Call batch/shell tooling directly, not through a wrapper (`cmd.exe /c "..."`), and check real
  output.** A wrapped invocation silently no-op'd across multiple HUSTLE sessions before being
  root-caused.

## AUTONOMOUS TESTING

- **Script lifecycle actions (kill, restart, background/foreground, rotate) via adb rather than
  manual interaction**, but verify the underlying command actually did what it claims (`pidof`
  after a kill, not just the command's own reported success). WHY: `kill -9` on an unrooted
  emulator fails silently — the command "succeeding" and the process actually dying are different
  claims.

## DOCUMENTATION-MEMORY

- **Separate current state (fast-recovery), history (narrative), rationale (decisions), pivots
  (brainstorm), and lessons (extracted principles) into distinct files from the start**, not one
  growing log. HUSTLE's own `MEMORY.md`/`DEVELOPMENT_JOURNEY.md`/`DECISIONS.md`/
  `BRAINSTORM_LOG.md`/`LESSONS_LEARNED.md` split exists because a single roadmap history file
  was becoming the de facto (and inadequate) memory system.
- **Tag every recovered claim with its evidence strength** (`[CERTAIN]`/`[SUPPORTED]`/
  `[INFERENCE]`/`[HYPOTHESIS]`/`[NOT RECOVERABLE]`), especially when reconstructing past reasoning
  from documents rather than live memory. WHY: prevents inventing a plausible-sounding history
  that didn't happen.

## RELEASE VALIDATION

- **A CONDITIONAL GO is a real, named gap, not a soft "basically done."** Don't round it up. HUSTLE
  never started migration off its CONDITIONAL GO precisely because the stop condition was binding
  and explicit.
- **Real-device validation is a distinct, still-required evidence class even after extensive
  emulator work** — no amount of additional emulator testing substitutes for it.

## COMMON TRAPS

- Treating an artifact's incidental property (prototype happens to be a browser build) as a
  platform decision.
- Treating a passing benchmark from generic industry sources as project-specific proof.
- Treating "it installed and launched" as lifecycle/regression evidence.
- Treating a build tool's exit code as ground truth.
- Treating a self-applied fix, or even one independent review pass, as sufficient without a
  second independent look on anything consequential.
- Treating an anomalously clean automated-test result as good news before checking the method.
- Letting a passing validation gate silently authorize the next, bigger phase.

---

## QUESTIONS TO ASK BEFORE BUILDING

**PRODUCT**: Who exactly is the user (education level, device class, connectivity)? What's the
one thing this product must never be mistaken for (e.g. "not a business course")?
**UX**: What's the reading level of every screen? Does polish exist independent of working
mechanics, or only alongside it?
**RESEARCH**: What's the external, checkable standard being critiqued against — not just "does
this look good"?
**ARCHITECTURE**: What constraint is actually driving this choice — and is the supporting
benchmark project-specific or generic? What would change the decision?
**MOBILE**: What's the actual target device class, and is dev/test hardware representative of it?
**TESTING**: What's the smallest vertical slice that would falsify this architecture choice? What
rung of the autonomous-testing ladder does each result actually prove?
**AI AGENT**: What's explicitly out of scope for this task? What's the stop condition after this
phase?
**DOCUMENTATION**: If this session ended right now, what would the next session need to not
repeat the last mistake?
**RELEASE**: What evidence class is still missing before this can honestly be called done (e.g.
real-device testing)?

## QUESTIONS TO ASK CLAUDE

- What assumptions are you making right now that haven't been stated?
- What's the dependency graph for this task — what has to happen before what?
- What's the highest-risk node in that graph, and how would we know early if it fails?
- What would falsify this architecture/approach?
- What's the smallest experiment that would test the risky assumption?
- How will you verify this claim — what will you actually run or inspect?
- How could this fail, specifically — not "does this work" but "how can I make this fail"?
- What have you NOT tested, and why?
- What evidence actually supports this claim — direct inspection, or inference?
- What should become persistent project knowledge from this work?
- Is this claim IMPLEMENTED or VERIFIED — and how do you know the difference here?
- Did a single pass check this, or an independent second look?
- What environment gap exists (device, credentials, staging) and how is it being labeled, not
  silently substituted for?
- What's explicitly out of scope for what you're about to do?
- If this result looks unusually clean, have you checked the measurement method itself?

---

## KNOWLEDGE GAPS EXPOSED BY HUSTLE

### Windows native-toolchain path limits
**WHAT IT IS**: `MAX_PATH` (260 chars) breaks RN/Gradle/CMake/Ninja builds regardless of how
careful the project's own directory naming is.
**WHY IT MATTERS**: Not knowing this in advance costs a project-root migration mid-project.
**HOW HUSTLE EXPOSED IT**: Actual `ninja: error: Stat(...): Filename longer than 260 characters`
failures under the original nested path.
**WHAT TO REMEMBER**: Pick a shallow canonical root before any native-build work starts, on any
future Windows project.

### Unrooted-emulator kill semantics
**WHAT IT IS**: `kill -9` requires root and fails silently (no crash, no visible error) on a
stock Android emulator shell.
**WHY IT MATTERS**: A lifecycle test built on this assumption produces confidently wrong data.
**HOW HUSTLE EXPOSED IT**: A suspiciously perfect `TotalTime: 0` across 5 restart cycles.
**WHAT TO REMEMBER**: Use `am force-stop`, verify via `pidof`, on any future adb-scripted testing.

### Emulator evidence's actual evidentiary ceiling
**WHAT IT IS**: No amount of emulator testing substitutes for real-device validation — thermal,
touch-latency, and memory-pressure-under-contention failure modes are specifically the ones an
emulator can't reproduce.
**WHY IT MATTERS**: Without this named explicitly, a thorough emulator pass reads as "done."
**HOW HUSTLE EXPOSED IT**: `ARCHITECTURE.md` itself named real-device testing as a required gate
condition that emulator work, however extensive, couldn't satisfy — hence CONDITIONAL GO, not GO.
**WHAT TO REMEMBER**: Name the evidence ceiling of every test environment before relying on it.

### Wrapped batch-file silent failure
**WHAT IT IS**: `cmd.exe /c "some.bat ..."` can silently no-op on Windows.
**WHY IT MATTERS**: Looks like an unrelated failure (a license/rate-limit issue, in HUSTLE's
case) across multiple sessions before being root-caused.
**HOW HUSTLE EXPOSED IT**: `sdkmanager.bat` invoked via `cmd.exe /c` repeatedly produced zero
effect with no error.
**WHAT TO REMEMBER**: Call `.bat` files directly; check real output, not wrapper success.

---

## FINAL SYNTHESIS

### 20 principles to carry into every future app
1. State the platform decision explicitly on day one — don't let an artifact's medium imply it.
2. Decide consumer vs. institutional product before writing the product doc.
3. Name the target user's literacy/device/connectivity profile against a real external standard.
4. Model real-world beliefs as falsifiable hypotheses, not checklists.
5. Critique product quality against RESEARCH → BENCHMARK → EVIDENCE → DESIGN STANDARD, not taste.
6. Verify mechanics and visuals as independent axes.
7. Derive architecture from constraints, not framework popularity.
8. Flag when a recommendation rests on generic benchmarks rather than project-specific evidence.
9. State up front what would change an architecture decision.
10. Validate any risky architecture bet against one small representative slice before full
    migration, with a binding stop condition.
11. Port domain logic framework-agnostic, standalone, before any UI work.
12. Build the autonomous-testing ladder in order — don't skip to the top rung.
13. Label every test result by its actual evidence ceiling (emulator vs. real device).
14. Treat an anomalously clean automated result as a signal to check the method, not good news.
15. Never trust a build tool's exit code alone — verify independently.
16. State explicit non-goals for every task phase, especially documentation/knowledge work.
17. Require independent re-verification of any consequential agent-authored fix.
18. Call batch/shell tooling directly; don't trust a wrapper's silence as success.
19. Separate current-state, history, rationale, pivots, and lessons into distinct docs early.
20. Tag every recovered historical claim with its actual evidence strength.

### 15 questions to ask before building
See "QUESTIONS TO ASK BEFORE BUILDING" above.

### 15 questions to ask Claude
See "QUESTIONS TO ASK CLAUDE" above (15 listed).

### 10 engineering anti-patterns to avoid
1. Treating a prototype's implementation medium as a platform decision.
2. Treating generic industry benchmarks as project-specific proof.
3. Treating "installed and launched once" as lifecycle/regression evidence.
4. Treating a build tool's exit code as ground truth.
5. Treating a self-applied or single-reviewed fix as sufficient on consequential code.
6. Treating an anomalously clean test result as good news before checking method validity.
7. Letting a passing validation gate silently authorize the next, bigger phase.
8. Wrapping batch/shell invocations and trusting the wrapper's silence.
9. Assuming a root-capable emulator/device without checking.
10. Reconstructing project history without evidence tags, inventing plausible-sounding reasoning.

### 10 testing principles
1. Build the ladder: emulator → adb → declarative UI tool → autonomous assertions → adversarial.
2. Label every result by its real evidence ceiling.
3. Never let emulator evidence imply real-device evidence.
4. Verify lifecycle actions (kill, restart) actually happened, not just that the command returned.
5. Treat anomalous cleanliness as a method-validity signal.
6. Verify via independent evidence (logcat, screenshots, direct output), not tool self-report.
7. Differential-test domain/logic layers standalone before any UI exists.
8. Require a second independent review pass on consequential fixes.
9. Test failure injection (network interruption, forced kill, stress) not just the happy path.
10. Re-run regression after every fix, not just once at the end.

### 10 architecture principles
1. Derive choices from actual constraints, not framework popularity.
2. Separate domain logic from framework/UI layer from day one.
3. Name what would change the decision, up front.
4. Gate any large bet on a small representative slice first.
5. Bound blast radius — validate the riskiest assumption smallest and earliest.
6. Distinguish prototype-grade from production-grade requirements explicitly.
7. Treat reversible and irreversible decisions differently in how much validation they need.
8. Flag when supporting evidence is generic vs. project-specific.
9. Keep a binding stop condition between "validated" and "next phase greenlit."
10. Revisit the decision if the state it was conditioned on changes (e.g. new platform target).
