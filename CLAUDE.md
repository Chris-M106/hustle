# CLAUDE.md — HUSTLE

Project identity, critical rules, and the documentation map. Keep this file small — current
state lives in `MEMORY.md`, deep knowledge lives in the documents below. Do not duplicate their
content here.

## What HUSTLE is

A 14-day financial-literacy simulation game for low-end-Android, prepaid-data users. Currently
a vanilla-JS browser prototype (canonical for design/content) plus a React Native validation
slice (Crisis stage only, not a migration). Full definition: `PRODUCT.md`.

## Critical constraints

- Target device profile is low-end Android, not this dev machine — never assume desktop-class
  performance is representative.
- Windows dev machine: use `C:\claude-projects\hustle\`, never a `Documents\...`-nested path —
  RN/Gradle/CMake builds exceed Windows `MAX_PATH` otherwise. Details: `ANDROID_SETUP.md`.
- No physical Android device exists for this project. The `hustle_lowend` emulator is a
  deliberate stand-in for controllable, repeatable testing — not a real-device substitute.
  Every test result must be labeled **EMULATOR-VERIFIED** or **REAL-DEVICE-UNVERIFIED**.
  Absence of a device is a known, standing limitation — never a reason to stop validation work.

## Critical engineering rules

- The prototype (`prototype/hustle-shell.html`) remains canonical for design/content until a
  real-device-validated migration slice exists. Do not treat the RN slice as a replacement.
- Every code change must be verified by actually running it (browser automation for the
  prototype, on-device/emulator install for RN) — not by source-code inspection alone, and not
  by trusting a build tool's exit code alone (Gradle's own diagnostics writer has produced
  false-negative `BUILD FAILED` after a real successful install — see `ANDROID_SETUP.md`).
- Code deliverables of any real size go through `adversary` review before being marked done.
  This project's own history shows self-applied fixes need a second independent look — a
  "fixed" claim was itself wrong twice in the same workstream (`DEVELOPMENT_JOURNEY.md`).
- Do not start migration, persistence work, or new feature work off the back of a validation
  pass unless the user explicitly greenlights it. This is a binding stop condition established
  during the RN architecture validation workstream, not a general default to assume forever —
  check `MEMORY.md` → "Next Action" for current status before assuming it still applies.

## Verification rules

Never call something tested/verified/complete beyond what was actually run and inspected. State
what was checked and what was not. See `TESTING.md` for the full standard (the two standing
rules, the verification loop, the real-device validation hierarchy).

## Documentation update rule

At the end of every **substantial** task, ask: did the project's current state materially
change (architecture decision, validation gate result, major feature completed, blocker found,
objective changed, constraint discovered, confidence level changed)? If yes, update `MEMORY.md`.
Do not update it for trivial actions. Full rule set: `MEMORY.md` is current-state-only —
history belongs in `DEVELOPMENT_JOURNEY.md`, rationale in `DECISIONS.md`. Don't duplicate; link.

## Knowledge capture

After meaningful work (a decision, a failure, a discovery, a validation gate), check: did this
create durable knowledge — something unknown before, a wrong assumption corrected, a reusable
principle, a failure mode, a better AI-agent method? If yes: (1) update the relevant doc
(`DEVELOPMENT_JOURNEY.md`/`DECISIONS.md`/`BRAINSTORM_LOG.md`/`LESSONS_LEARNED.md`), (2) flag
broadly reusable items `LIBRARIAN CANDIDATE` in `LESSONS_LEARNED.md`, (3) check for an existing
entry before adding a new one. Don't wait to be asked. Don't do this for routine work. Full
system: `LESSONS_LEARNED.md`, `NEXT_APP_PLAYBOOK.md`.

## Documentation map

- **`MEMORY.md`** → Read first. Current project state, validation status, next action.
- **`PRODUCT.md`** → What HUSTLE is, who it's for, product constraints.
- **`ROADMAP.md`** → Plan, phase-by-phase progress, dependencies, next steps. Also currently
  holds the most detailed blow-by-blow history of the RN validation workstream.
- **`ARCHITECTURE.md`** → Technical architecture, technology choices, trade-offs, the RN
  decision and its validation gate.
- **`DESIGN.md`** → Sunrise visual system: colors, type, layout, components, do's/don'ts.
- **`TESTING.md`** → Testing methodology, verification standard, real-device validation
  hierarchy.
- **`DEVELOPMENT_JOURNEY.md`** → How HUSTLE evolved: prototype → product rethink → research →
  mobile reframe → architecture investigation → RN validation. Problem → investigation →
  decision → evidence → lesson, at milestone granularity.
- **`DECISIONS.md`** → Significant decisions with context, options considered, rationale,
  evidence, and what would change them.
- **`BRAINSTORM_LOG.md`** → Questions and pivots that materially changed direction (e.g. the
  classroom-tool → consumer-app reframe).
- **`LESSONS_LEARNED.md`** → HUSTLE-specific lessons. Items marked `LIBRARIAN CANDIDATE` are
  broadly reusable and pending a separate librarian extraction pass.
- **`NEXT_APP_PLAYBOOK.md`** → What to do differently starting the next app, grounded in HUSTLE
  evidence — pre-build questions, questions to ask Claude, knowledge gaps, principle synthesis.
- **`RN_VALIDATION_REPORT.md`** → Standalone report: RN architecture CONDITIONAL GO verdict,
  what was validated, what wasn't, both adversarial emulator validation passes.
- **`ANDROID_SETUP.md`** → Android SDK/emulator environment: canonical paths, versions, the
  five build-toolchain gotchas hit on this machine.
- **`research/`** → Supporting evidence for product, design, business, and technical decisions
  (see `research/README.md` for its own index).

## Librarian

This repository preserves HUSTLE's own history, decisions, and evidence — that stays here,
never duplicated into the vault. A shared cross-project knowledge vault exists at
`~/.claude/knowledge/` (index: `KNOWLEDGE.md`). Before writing new reusable
research/methodology in this project, search the vault first — reuse/reference an existing
entry rather than re-deriving it. When a HUSTLE lesson is broadly reusable beyond this
project, it's flagged `LIBRARIAN CANDIDATE` in `LESSONS_LEARNED.md`; a separate `/librarian`
pass (not automatic) checks the vault for an equivalent, updates it if HUSTLE adds material
new evidence, or creates an atomic entry if none exists — never a duplicate. `NEXT_APP_PLAYBOOK.md`
is HUSTLE's own grounded playbook; its generalizable methodology already lives in the vault's
`process/mobile-app-development-playbook.md` (cross-linked both directions) — read that first
for a *new* project, this file for HUSTLE's own reasoning.
