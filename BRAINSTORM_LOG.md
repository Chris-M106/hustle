# BRAINSTORM_LOG.md — HUSTLE

Not a transcript. The intellectual pivots that materially changed the project — the questions
that mattered, not the conversation that carried them. Each entry: QUESTION → INITIAL ASSUMPTION
→ OPTIONS/IDEAS → CHALLENGE → REFRAME → DECISION/CURRENT POSITION → WHY → LESSON.

Evidence discipline: [CERTAIN] direct evidence inspected this pass, [SUPPORTED] strongly implied
by existing docs, [INFERENCE] reasonable read of the record, [NOT RECOVERABLE] cannot be
established — used rather than guessed. Full source docs: `PRODUCT.md`, `ROADMAP.md`,
`ARCHITECTURE.md`, `REAL_WORLD_BRIDGE.md`, `research/`.

---

## 1. Product quality: "looks premium" → "what is the objective standard?"

**QUESTION**: Is the product actually good?

**INITIAL ASSUMPTION**: A visual pass ("does this look premium/finished?") would answer that.
[SUPPORTED — `DEVELOPMENT_JOURNEY.md` #2 records a critique that started from exactly this kind
of surface read.]

**OPTIONS/IDEAS**: Ship on "looks done." Or hold it to an external, checkable bar.

**CHALLENGE**: A hard critique (31/40) found the product **looked authored but played
mechanically inert** — Stage 1 choices didn't branch anything, Crisis/Plan scoring was invisible
until the end. Visual polish and mechanical substance turned out to be independent axes, not
one thing. [CERTAIN — `DEVELOPMENT_JOURNEY.md` #2, `ROADMAP.md` Phase 1.] Separately, the shipped
visual system itself was later found to be a generic navy fintech-admin look that "carries none
of the world the copy establishes" — confirmed with the product owner as unintentional.
[CERTAIN — `PRODUCT.md` → "Anti-reference."]

**REFRAME**: "Does this look premium?" is not a real question — it has no falsifiable answer.
The real question became "what does a genuinely strong product in this category look like, and
how do we establish that standard with evidence rather than taste?"

**DECISION/CURRENT POSITION**: Standard now built from research → benchmark → evidence, not
vibes: `research/best-practices.md`, `research/competitive-teardown.md`,
`research/low-literacy-low-end-android.md`, `research/engagement-mechanics.md` feed `DESIGN.md`
(the Sunrise system) and `PRODUCT.md`'s constraint table, and every claim in those docs is
checked against the actual shipped bundle rather than the pitch. [CERTAIN — files exist and
were read this pass and prior sessions.]

**WHY**: A taste judgment ("premium") can't be argued with or falsified; a benchmark-and-
evidence judgment can be checked, disagreed with on specifics, and re-run later.

**LESSON**: RESEARCH → BENCHMARK → EVIDENCE → DESIGN STANDARD → ADVERSARIAL CRITIQUE is a
reusable quality pipeline — see `LESSONS_LEARNED.md` (Project Methodology).

---

## 2. Target user: who is actually playing this?

**QUESTION**: Who is HUSTLE for, and what does that require of the interface?

**INITIAL ASSUMPTION**: The deployed bundle was audited with no source access, producing a
facilitator/NQF-SAQA classroom framing as the default read. [CERTAIN — `PRODUCT.md` header,
`DEVELOPMENT_JOURNEY.md` #1.]

**OPTIONS/IDEAS**: Treat the learner as a generic app user vs. treat them as a specific person
with specific constraints — limited formal education, first-time exposure to business
vocabulary, a low-end shared Android device, prepaid data they personally pay for.

**CHALLENGE**: `PRODUCT.md` → "Who it is for" is explicit that the primary user has "first-time
exposure to business vocabulary," possibly a shared device, and data that "is money." Separately
`research/low-literacy-low-end-android.md` grounds this in an external standard — W3C's
definition of low-literacy design as targeting **below lower-secondary education (7-9 years of
schooling)** — not an invented persona. [CERTAIN — file read this pass.] This is a strong-
ambition, low-formal-education user, not a low-ambition one: the entire premise of the game
(start a business from R2,500) assumes drive the interface must not condescend to.
[SUPPORTED — `PRODUCT.md` → "Brand personality": "Never patronising, never cheerful about
hardship."]

**REFRAME**: The UX problem isn't "make it simple" in the generic sense — it's "make it
legible and non-condescending to someone with strong ambition and limited formal schooling, on
hardware and a data budget that themselves constrain every design choice."

**DECISION/CURRENT POSITION**: Voice rules and contrast/accessibility constraints in `PRODUCT.md`
and `DESIGN.md` are written directly against this user, not a generic mobile user. Numeracy-
specific interface guidance (`research/low-literacy-low-end-android.md` §3) is treated as a
constraint, not a nice-to-have.

**WHY**: A generic "keep it simple" instinct tends to simplify content; this user needs
*navigability and dignity* preserved while content stays real (rands, real township nouns,
real stakes) — those are different design moves.

**LESSON**: When a target user has a real, specific constraint profile (literacy, device,
data cost, dignity), go find the external standard for that profile rather than improvising one
— see `LESSONS_LEARNED.md`.

---

## 3. Classroom tool → consumer app

[Unchanged from the prior version of this file — see `DECISIONS.md` → "Consumer-app reframe"
and `DEVELOPMENT_JOURNEY.md` #3 for full detail. Kept short here to avoid duplicating.]

**QUESTION**: Is HUSTLE a classroom tool or a consumer app?
**INITIAL ASSUMPTION**: Facilitator/NQF-SAQA classroom tool (audited framing, `PRODUCT.md`).
**CHALLENGE**: Idea owner's actual intent, surfaced mid-roadmap-work, was a standalone consumer
product. [CERTAIN — `ROADMAP.md` Phase 4, "Correction, 2026-08-05."]
**REFRAME**: Classroom/NQF-SAQA is who the *curriculum* is written for; it no longer defines the
*product's* boundaries.
**DECISION/CURRENT POSITION**: Consumer-app framing, facilitator use as a possible secondary
channel, not the primary target.
**WHY**: Acting on the actual stated intent rather than the artifact-derived guess.
**LESSON**: An audited/reverse-engineered framing is a starting hypothesis, not ground truth —
confirm intent with the owner before it hardens into architecture.

---

## 4. Simulation → real-world business transfer

**QUESTION**: "If I finish HUSTLE and want to actually start this business in real life, do I
understand what to do next?" [CERTAIN — this is the literal opening question of
`REAL_WORLD_BRIDGE.md` §1.]

**INITIAL ASSUMPTION**: Winning or losing the simulation, with an explanation of why, was enough
— "I understand why I won or lost" was treated as the finish line.

**OPTIONS/IDEAS considered** (`REAL_WORLD_BRIDGE.md` §3, `research/real-world-bridge.md`):
- Add a generic post-game checklist ("things to do next").
- Add a full business-course layer (rejected outright — `REAL_WORLD_BRIDGE.md` §2 explicitly
  forbids turning HUSTLE into "an online MBA course").
- Build a structured **business hypothesis** the player carries out of the game.

**CHALLENGE**: A flat checklist doesn't transfer — it's a list of tasks with no connection to
what the player actually believed and why. `research/real-world-bridge.md` line 11 records the
model itself was **revised twice in one day**: from a generic field-list ("Business Builder")
to a single-hypothesis model, then promoted further. A checklist can't be falsified; a
hypothesis can.

**REFRAME**: SIMULATION → "how would I actually do this in real life?" → not CHECKLIST but
HYPOTHESIS MODEL → CUSTOMER-FIRST ASSUMPTION → REAL-WORLD TEST → LEARN LOOP.

**DECISION/CURRENT POSITION**: The authoritative model (`research/real-world-bridge.md` §6,
explicitly marked "supersedes the earlier Business Builder field-list") is a single sentence:
*"I believe [customer] will pay R[price] for [business] because [reason]."* — one flagged
unknown, one real-world test (talk to 3-5 real people), one LEARNED delta. **This is a design
spec, not yet built** — `REAL_WORLD_BRIDGE.md` is explicitly framed as "a NEW PRODUCT-DIRECTION
LAYER that must be evaluated after the current audit/implementation cycle," and nothing in
`MEMORY.md`'s current-state section shows it implemented. [CERTAIN — file content, cross-checked
against `MEMORY.md`.]

**WHY**: A checklist can be completed without being falsified — you can tick every box and still
be selling something nobody wants. A single testable hypothesis, explicitly labeled ASSUMED
until TESTED, forces contact with reality the way a startup customer-discovery process does.
[SUPPORTED — `research/real-world-bridge.md` line 107 explicitly cites startup practice
treating an invalidated hypothesis as a good outcome, not a failure.]

**LESSON**: When a product asks a user to *believe* something and then act on it, make the
belief explicit and testable rather than folding it into an implicit checklist item — see
`LESSONS_LEARNED.md` (Project Methodology / General Engineering).

---

## 5. The KNOWN/ASSUMED/UNKNOWN/TESTED/LEARNED knowledge-state model

**QUESTION**: How do you represent, inside a game UI, the difference between "the simulation
told you," "you believe," and "you've actually verified"?

**INITIAL ASSUMPTION**: Not recorded as a separate step — this model emerged directly out of
pivot #4 above as its supporting structure, not as an independently-explored alternative.
[NOT RECOVERABLE — whether earlier framings existed before this five-state model isn't
established by available evidence.]

**OPTIONS/IDEAS**: None recorded as rejected alternatives to the five states themselves.

**CHALLENGE**: Without separating these, a game risks a specific and easy-to-miss bug: showing
the player a simulation-provided fact (KNOWN, e.g. Scanner's Demand rating) framed with the same
confidence as something they've actually verified in the real world (TESTED) — collapsing the
epistemic status of two very different kinds of information. [CERTAIN —
`research/real-world-bridge.md` line 101 states this explicitly: "a rating from Scanner is
KNOWN..., never TESTED..., the UI must [distinguish them]."]

**REFRAME**: n/a — this is the resolving structure for pivot #4, not a separate reframed
question.

**DECISION/CURRENT POSITION**: Five explicit internal states — KNOWN (simulation-provided),
ASSUMED (player belief, untested), UNKNOWN (unverified), TESTED (real-world investigated),
LEARNED (the delta after testing) — kept internal to the model; the player-facing UI never shows
the taxonomy words, only plain sentences ("HUSTLE SAYS," "YOU BELIEVE," "STILL UNKNOWN," "GO
FIND OUT," "YOU FOUND OUT," "WHAT CHANGED"). [CERTAIN — `research/real-world-bridge.md` §5,
lines 114-124, directly quoted.]

**WHY**: The semantic purpose is to prevent a specific credibility failure — a game claiming to
teach real-world business judgment shouldn't blur "the game told you" with "you found out" have
the same weight, or the whole exercise stops being honest about what it's actually taught.

**LESSON**: A five-state epistemic model (KNOWN/ASSUMED/UNKNOWN/TESTED/LEARNED) generalizes past
this game — any product that mixes system-provided facts with user beliefs and real-world
verification benefits from keeping those states explicit internally even when the UI stays
plain. Flagged in `LESSONS_LEARNED.md` as a decision-framework candidate.

---

## 6. Web prototype → real mobile application

**QUESTION**: Does `prototype/hustle-shell.html` being a browser build commit the shipped
product to being a website?

**INITIAL ASSUMPTION**: Left implicit and unexamined for a period — the browser build was the
only artifact, so browser-shaped assumptions (responsive layout thinking, DOM-based Playwright
testing) had begun accruing around it without an explicit decision.

**OPTIONS/IDEAS**: Ship as a responsive website. Ship as a genuine installed mobile app.

**CHALLENGE**: Checked directly against the audience already documented — low-end Android,
prepaid data, a device the OS "kills backgrounded tabs" on (`PRODUCT.md` → "Who it is for"). A
responsive website doesn't meet an "app-native" quality bar on that hardware/data profile; a
website also doesn't own its own lifecycle (background/foreground, persistence) the way an
installed app does.

**REFRAME**: "Is this a website" → "this is a mobile application; the browser build is the
implementation/iteration stage, not the platform decision."

**DECISION/CURRENT POSITION**: `PRODUCT.md` amended to state this explicitly and authoritatively.
Every subsequent prototype change required verification through the actual rendered app, not
source inspection alone (`TESTING.md`).

**WHY**: Left implicit, the assumption would have kept compounding silently (more DOM-based
tests, more responsive-web-shaped UI decisions) until reversing it became expensive.

**LESSON**: Name platform assumptions explicitly and early, even when — especially when — no
one remembers deciding them. See `LESSONS_LEARNED.md` (Project Methodology).

---

## 7. Architecture investigation: RN, Flutter, Capacitor, native, PWA

**QUESTION**: Given the mobile-application commitment above, which technology?

**REQUIREMENTS/CONSTRAINTS** (`ARCHITECTURE.md` §3-4, `PRODUCT.md`): low-end Android
performance as the binding constraint (not iOS, not high-end Android); an animation-heavy design
system (`DESIGN.md`) that the tech choice has to render well, not just "run"; an existing JS/TS
domain layer and content set with real rewrite cost if discarded; a solo AI-agent-driven dev
workflow that benefits from ecosystem maturity and tooling that doesn't fight the agent.

**OPTIONS**: Native Kotlin/Compose, React Native, Flutter, Capacitor (WebView-hybrid), PWA.

**TRADE-OFFS** (`ARCHITECTURE.md` §3-4, `DECISIONS.md` → "React Native as production platform"):
- **Native**: theoretical performance ceiling, zero legacy-JS leverage, full rewrite of domain
  logic and content from scratch — explicitly named as the answer "if starting from zero"
  (`ARCHITECTURE.md` §10's own caveat), not the answer given HUSTLE's actual current state.
- **Flutter**: worse memory/size profile than RN per the comparison used.
- **Capacitor**: WebView-based — specifically weak exactly where HUSTLE is heaviest, the
  animation-dense content, and weak on cold start.
- **PWA**: doesn't meet the app-native quality bar decided in pivot #6, and inherits the same
  install/lifecycle limitations that made "web app" the wrong frame in the first place.
- **React Native (Hermes, New Architecture)**: best low-end-Android profile among the
  app-store-distributable, native-feel options; domain logic/content carry forward in JS/TS with
  far less rewrite risk than a Dart or Kotlin port.

**EXPERIMENT**: Not committed on the comparison alone — see pivot #8 (vertical-slice gate). The
comparison in `ARCHITECTURE.md` §3-4 itself is explicitly *generic industry benchmark data, not
HUSTLE-specific measurement* — that gap is precisely why the experiment in pivot #8 exists.
[SUPPORTED — `DECISIONS.md` → "React Native as production platform," EVIDENCE line, states this
directly.]

**EVIDENCE**: `ARCHITECTURE.md` §3-4, §10-12. HUSTLE-specific evidence from the actual
experiment: `RN_VALIDATION_REPORT.md`, `DEVELOPMENT_JOURNEY.md` #8-10.

**CONDITIONAL DECISION**: React Native, Hermes, New Architecture, Android-first — with an
explicit confidence rating of Medium-High (`ARCHITECTURE.md` §12), not High, and an explicit
"what would change our mind" clause (an iOS requirement removes RN's Android-specific edge; a
from-zero rewrite for unrelated reasons reopens native as the ceiling option). Status:
**CONDITIONAL GO**, not clean GO — real low-end device testing, the one condition
`ARCHITECTURE.md` §11 itself named as required, remains open.

**LESSON**: Treat a generic framework benchmark comparison as a hypothesis-generator, not a
verdict — see pivot #8 and `LESSONS_LEARNED.md` (Architecture / Project Methodology).

---

## 8. Vertical-slice validation gate

**QUESTION**: Given a recommendation (React Native) built on generic benchmarks, do we migrate
the whole app on that basis, or validate first?

**INITIAL ASSUMPTION**: None recorded as seriously entertained — the record shows the gate
decision made directly off recognizing the benchmark-evidence gap in pivot #7, not after a
period of planning full migration first. [INFERENCE.]

**OPTIONS/IDEAS**: Full migration on the architecture recommendation's strength alone, vs. one
real vertical slice first.

**CHALLENGE**: A full-app rewrite is expensive and hard to reverse; if the RN recommendation
were wrong in a way generic benchmarks couldn't show (e.g. this project's specific animation
load, this exact content set, this specific low-end profile), the cost of discovering that would
land only after most of the rewrite was already sunk.

**REFRAME**: "Should we migrate to RN?" → "what's the smallest experiment that would tell us if
the RN recommendation survives contact with HUSTLE's actual content and hardware constraints?"

**DECISION/CURRENT POSITION**: Build one vertical slice — the Crisis stage, chosen specifically
for being animation-dense, the axis the framework choice was most sensitive to — fully through
RN + Hermes + New Architecture, validate it end-to-end, and only then decide on full migration.
Binding stop condition: no migration work starts off the validation report without explicit user
sign-off, regardless of how well the slice performs.

**WHY**: Bounds the blast radius of the architecture bet being wrong to one stage's rework, not
the whole app's — HYPOTHESIS → SMALL REPRESENTATIVE SLICE → VALIDATE → MEASURE → ADVERSARY →
DECISION, applied to a framework choice rather than a feature.

**EVIDENCE**: The domain-layer extraction alone caught 4 major self-report-disproving bugs
across independent adversary review rounds before any UI existed — direct evidence the gate
caught real problems, not just theoretical ones (`DEVELOPMENT_JOURNEY.md` #8).

**LESSON**: A generic benchmark plus a real but small representative experiment beats either a
benchmark-only commitment or a full-scale bet on an unvalidated recommendation — see
`LESSONS_LEARNED.md` (Architecture / Project Methodology).

---

## 9. Autonomous testing: from "can we install it" to adversarial regression

**QUESTION**: How do you validate a mobile UI when no physical device exists and the developer
is an AI agent, not a human tapping a phone?

**INITIAL ASSUMPTION**: Getting the app to install and launch on an emulator would be sufficient
evidence of "it works."

**OPTIONS/IDEAS considered along the way**: manual screenshot-only checks; `adb`-scripted
interaction without an assertion framework; a dedicated UI-test tool (Detox vs. Maestro, still
open — `DECISIONS.md`).

**CHALLENGE**: A single install-and-screenshot check doesn't catch lifecycle bugs (kill/restart,
backgrounding), doesn't catch interaction bugs (rapid taps, rotation), doesn't catch regressions
across repeated runs, and — critically — doesn't catch bugs in the *test method itself* (see
pivot #10). "It launched once" and "it's robust" are different claims.

**REFRAME**: From "did it install" to a genuinely adversarial battery: cold start × N, real
kill/restart × N (not a fake one — see #10), network interruption, spam-tap/swipe/rotation
stress, and repeated Maestro regression runs, each with direct evidence (command output or
screenshot actually inspected) rather than an assumed pass.

**DECISION/CURRENT POSITION**: ANDROID EMULATOR → ADB (scripted lifecycle/network/input control)
→ MAESTRO (declarative UI flows, black-box via the OS accessibility layer) → autonomous
interaction with real assertions → screenshots directly inspected, not just captured → repeated
runs → adversarial stress. Every result labeled EMULATOR-VERIFIED, explicitly not treated as
equivalent to REAL-DEVICE-UNVERIFIED evidence.

**WHY**: Each layer catches a different failure class; skipping straight to "it launched" would
have missed the kill-9 methodology bug (#10) entirely, along with any lifecycle-specific defect.

**LESSON**: For an AI-agent-driven mobile QA workflow with no physical device, build the ladder
— don't skip to the top rung and call the bottom rungs implied. See `LESSONS_LEARNED.md`
(Mobile-Specific / AI-Agent Methodology).

---

## 10. Verification methodology and the "implemented ≠ verified" line

**QUESTION**: When is something actually done — when it's built, or when it's confirmed to work?

**CHALLENGE**: Recurred multiple times in this project (domain-layer self-report claiming a
clean 1:1 port that adversary review found 4 major bugs in; Gradle's own diagnostics writer
producing a false-negative `BUILD FAILED` after a genuinely successful install — see
`ANDROID_SETUP.md`). Each time, trusting the tool's or the agent's own completion claim would
have been wrong.

**REFRAME**: IMPLEMENTED and VERIFIED are different claims that require different evidence.
EXECUTE → OBSERVE → CORRECT → RETEST became the standing loop, not EXECUTE → assume it worked.

**DECISION/CURRENT POSITION**: Standing rule in `CLAUDE.md`: every code change verified by
actually running it, never by source-inspection or exit-code alone; every deliverable of real
size goes through independent adversary review, because self-applied fixes in this project's own
history have been wrong twice in a row before being right (pivot below, #10b).

**WHY**: A tool's or an agent's own "success" signal is itself just another claim that can be
wrong — false-negative build failures and false-positive self-reports both happened in this
project, not hypothetically.

**LESSON**: See `LESSONS_LEARNED.md` (AI-Agent Methodology / General Engineering) — this is the
single most load-bearing methodological lesson HUSTLE produced.

---

## 10b. The `kill -9` verification-method failure

**QUESTION**: Did the app survive a real process kill and cold restart?

**INITIAL ASSUMPTION**: `adb shell kill -9 <pid>` followed by `am start -W` would produce a
genuine kill/restart cycle, timeable via `TotalTime`.

**APPARENT SUCCESS**: Five cycles all reported `TotalTime: 0` — read, on first glance, as an
implausibly fast restart.

**CHALLENGE / TEST METHOD CHALLENGED**: The anomalous *perfection* of the number (0ms, every
cycle) was itself treated as suspicious rather than reported as a great result.

**METHOD INVALIDITY DISCOVERED**: `adb shell whoami` returned `shell` (non-root); an isolated
`kill -9` test reproduced `/system/bin/sh: kill: <pid>: Operation not permitted`. The unrooted
emulator shell cannot signal another app's process — every prior `kill -9` had silently no-oped,
and `am start` had just refocused the still-alive activity.

**METHOD CORRECTED**: `am force-stop`, verified by `pidof` returning empty afterward — confirming
genuine termination before timing the restart.

**TEST REPEATED, RESULT ACCEPTED**: Full kill/restart battery re-run correctly with the fixed
method; results reported in `RN_VALIDATION_REPORT.md` as EMULATOR-VERIFIED.

**LESSON**: An anomalously "too good" measurement is itself evidence of a broken measurement
method, not a result to report at face value. Flagged `LIBRARIAN CANDIDATE` in
`LESSONS_LEARNED.md`.

---

## 11. Environment discovery: Windows MAX_PATH

**QUESTION**: Why did a Gradle/CMake/Ninja native build fail with `Filename longer than 260
characters` under a project nested at `Documents\claude-projects\hustle\...`?

**INITIAL ASSUMPTION**: Not anticipated in advance — discovered via the actual build failure,
not predicted.

**CHALLENGE**: RN's native codegen (Gradle → CMake → Ninja) generates deep intermediate build
paths regardless of project depth; combined with an already-nested Windows path, this exceeded
the 260-character `MAX_PATH` limit. Individually shortening the failing path would only relocate
the failure to the next deep generated path, not fix the underlying constraint.

**REFRAME**: "Fix this one long path" → "the project root itself needs to be shallow, as a
standing property of any native-build project on this machine."

**DECISION/CURRENT POSITION**: Canonical root moved to `C:\claude-projects\<project>\`. After
the move, **stale generated absolute paths** in Gradle's cache/config (pointing at the old
nested location) had to be cleared, not just the source moved — a clean regeneration was
required before the release build succeeded. [SUPPORTED — this class of problem (stale generated
absolute paths after a project move) is a standard Gradle-caching failure mode; the specific
clean-regeneration step is recorded in this project's environment fix but the exact commands
used are `[NOT RECOVERABLE]` from available docs without deeper transcript access.]

**WHY**: A shallow root is the only fix that doesn't just move the failure point downstream.

**LESSON**: Windows native-build tooling (Gradle/CMake/Ninja specifically) needs a shallow
project root as a standing environment property, and a project *move* on this class of tooling
requires a clean regeneration pass, not just a file-system move — see `LESSONS_LEARNED.md`,
flagged `LIBRARIAN CANDIDATE`.
