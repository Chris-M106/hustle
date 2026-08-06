---
target: prototype/hustle-shell.html
total_score: 31
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-08-05T11-29-31Z
slug: prototype-hustle-shell-html
---
Method: dual-agent (A: aafd33064fb6bd17c · B: aa2c19e75f3bbbc7d). Both ran fully isolated from each other. Note: B's isolated sandbox had no browser-automation tool, so it correctly stopped after the CLI detector scan rather than fabricate browser findings. The parent orchestrator (with real Playwright access) independently gathered the required live-browser evidence afterward — after both isolated assessments were already complete and locked — to confirm or refute Assessment A's two P0 code-level claims. This did not influence either assessment's judgment; it only supplied the mechanical evidence B's sandbox couldn't reach.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2/4 | Crisis score and plan score compute continuously but are invisible until the Ending; only cash's color threshold signals "how am I doing" during play |
| 2 | Match System / Real World | 4/4 | Genuinely local vocabulary and figures throughout (load shedding, spaza, shisanyama, real Rand amounts) |
| 3 | User Control and Freedom | 3/4 | Real back-button routing and save/resume; but recommitting to a different Stage 2 business resets crisis state and never clears the old Stage 3 plan answers |
| 4 | Consistency and Standards | 4/4 | One accent role, stripe/stamp motifs reused identically, `.cta`/`.mode`/`.ans` share one grammar |
| 5 | Error Prevention | 3/4 | Strong disabled-CTA copy and double-submit guard; zero confirm/undo on an irreversible Crisis decision tap |
| 6 | Recognition Rather Than Recall | 3/4 | Scanned readouts stay visible; but your Stage 1 profile name/tagline is shown once at reveal and never resurfaces in Plan or Crisis |
| 7 | Flexibility and Efficiency | 2/4 | Mode screen's own copy promises "you can switch later" — confirmed via full script trace: no mode toggle exists anywhere past that screen |
| 8 | Aesthetic and Minimalist Design | 4/4 | DESIGN.md's discipline (one accent, no chromatic glow, no accent-border-left) holds faithfully in the shipped CSS |
| 9 | Error Recovery | 3/4 | Mostly n/a (no free-text input to validate); going broke cuts straight to the ending with no distinct "about to go under" beat first |
| 10 | Help and Documentation | 3/4 | Learn Mode's inline lesson cards cite real NVC unit standards appropriately; Play mode's decision buttons give no cue which choice teaches something before you commit |
| **Total** | | **31/40** | **Good** (band: 28–35) |

## Design Specificity Verdict

**Split verdict — the skin is bespoke, the skeleton is generic, and the skeleton is what you're feeling.**

**LLM assessment (Assessment A):** The copy/visual layer could not be dropped onto an unrelated product unchanged — real Rand figures, real KwaDream opportunities with authored insight text, a palette sampled pixel-by-pixel from an actual photograph. That is real authorship. But the interaction skeleton underneath — card → 2–4 button choices → a delta number → a "Next" button, repeated across Stage 3's five plan questions and all fourteen Stage 4 crisis days — is the same skeleton as a graded compliance quiz or a daily check-in app. Swap the copy and the mechanic runs unchanged for a diet-tracker or an HR training module. This is the mechanical answer to "doesn't read like a game": the authored layer is the paint; the generic form-wizard underneath is what's actually producing the feel.

**Deterministic scan (Assessment B):** Exit code 2, 15 findings — 14 advisory, 1 warning (`em-dash-overuse`, 11 em-dashes in body copy, a cadence tell from the volume of new authored copy this session). Advisory-only: 9 `design-system-font-size` findings (fluid `clamp()` endpoints and a few fixed sizes off the documented type ramp — mostly pre-existing, none newly introduced this session) and 5 `design-system-color` findings. Of those five, three (line 473) are false positives — literal `#fff`/`#E8F0F8` values sitting inside a code *comment* documenting the original shipped bug, not live CSS, a false-positive pattern already known from earlier in this project's history. The remaining two (lines 401, 406) are real but low-stakes: the hero CTA's glass specular highlight (`rgba(255,255,255,.16)`) and its hover-state gradient — genuine colors used in shipped code, just not enumerated in DESIGN.md's token table. No P0/P1-severity detector findings.

**Live-browser confirmation:** I independently verified Assessment A's two most serious code-level claims with a real click-through (Playwright, zero console/page errors throughout):
- The `.note` dev-disclosure block (containing the literal text *"Prototype shell — all four stages. Vanilla JS standing in for the React..."*) has `display:block; visibility:visible` and is present in page flow **both on the landing screen and while Stage 2 (Scanner) is the active screen** — confirmed unconditional, not gated by any `.screen.on` toggle.
- The only `aria-live` element on the page (`#live`) sits inside `#s-profile`, whose computed `display` is `"none"` while Stage 2 is active. Triggering a real scan action produced the text *"Taxi rank scanned. Phone Repair Kiosk. Demand HIGH, competition LOW, cost R1 200."* written into `#live.textContent` — confirming the announcement fires but reaches a node no assistive tech will ever see update, because its container has no box.

## Overall Impression

The prototype is well-crafted at the paint layer and structurally inert at the mechanic layer. Every screen looks authored for this specific product; almost none of the choices you make on the way in (archetype, stat allocation) or through it (plan answers, crisis decisions) visibly change your standing until a single report card at the very end. That gap — not a missing animation or a color choice — is the entire distance between "reads like a webpage" and "reads like a game." The single biggest opportunity: make at least one of the currently-cosmetic choices (Stage 1 stats, archetype) actually gate something a player can see change in real time.

## What's Working

1. **The Stage 2 commit button rewrites its own label from live state** — `"Choose Phone Repair →"` becomes `"CHOOSE ANYWAY →"` when under-scanned, or `"TAKE THE RISK →"` when the opening cash falls thin. This is the one place mechanical state surfaces as urgent language instead of a data readout, and it's the closest thing in the product to a real "stakes-in-the-interface" moment.
2. **The Ending's ledger-as-replay**, day-by-day with the pivot day marked by a measured text-contrast shift rather than a decorative rail — a deliberate, documented rejection of the generic three-tile results-screen pattern.
3. **Accessibility engineering craft is well above what "prototype shell" implies** — real `<button>`s throughout, focus preserved across every re-render, honest disabled-state copy naming the unmet condition, 3px focus-visible rings — which makes the `#live` gap read as a genuine slip in an otherwise-careful build, not systemic neglect.

## Priority Issues

**[P0] The dev-disclosure `.note` block is visible on every single screen, for the entire session.** Confirmed live: unconditionally in page flow regardless of which stage is active, containing engineering commentary ("standing in for the React tree," "P0 fixes") that breaks the fiction under whatever screen the player is currently on — including directly beneath the Ending's verdict stamp, the game's one peak-emotion moment.
*Why it matters:* No amount of visual polish above this line matters if a scroll on any screen surfaces the build's own confession that it's a prototype.
*Fix:* Remove it from the shipped build entirely, or gate it behind a `?debug` query param.
*Suggested command:* `/impeccable distill`

**[P0] Archetype and Stat-allocation choices are entirely cosmetic — write-only state.** Confirmed via full script trace: `state.archetype` is set and saved but never read anywhere to vary copy, difficulty, or content, despite the screen's own text promising "it just shapes how the story talks to you." `state.stats` is read only by the profile-label function (`profileKey()`) — nothing in the Scanner, Plan, or Crisis stages branches on stat values. `PRODUCT.md` documents that the *original shipped build* gated real content on stat thresholds; that mechanic did not carry into this rebuild.
*Why it matters:* This is the direct, traceable cause of the game-feel complaint — the two screens most structured like a game (an archetype pick, a point-build) are the two with zero downstream consequence.
*Fix:* Restore at least one real branch per mechanic — e.g. a stat-gated extra insight in the Scanner, and an Ending message variant keyed on `state.archetype`.
*Suggested command:* `/impeccable shape` (redesign the mechanic), then `/impeccable clarify` for the copy that currently overpromises

**[P1] The only `aria-live` region goes silent for 75% of the game.** Confirmed live: `#live` sits inside `#s-profile`, which computes `display:none` outside Stage 1. Every `say()` call from Scan, Plan, and Crisis — spot-scanned confirmations, plan-answer-recorded counts, full day-outcome text — writes real text into a node that cannot be announced, because its ancestor has no box.
*Why it matters:* A screen-reader user gets full narration for one stage out of five, then total silence for the rest of the game, in a build that is otherwise notably careful about focus and disabled-state labeling.
*Fix:* Move `#live` to a location outside all `.screen` elements (e.g. as a direct child of `<body>` or `<main>`, unconditionally visible-to-AT).
*Suggested command:* `/impeccable audit`

**[P1] Crisis and Plan hide the running score for the entire game.** `crisisScore` and `planScore()` compute continuously but surface only once, at `finish()`. Combined with a deterministic day-0 event variant and zero timer/sound/haptic feedback, this is the direct structural cause of "simulation inside a webpage, not a game": you fill out a form now and get graded later, rather than feeling how you're doing turn to turn.
*Why it matters:* This is the single largest lever on the "does this feel like a game" question — bigger than any visual or motion treatment.
*Fix:* Surface a live, incrementing signal (a trust/momentum meter alongside cash) that moves every day, the way cash already does.
*Suggested command:* `/impeccable shape`

**[P2] The Mode screen's "you can switch later" promise has no corresponding UI anywhere past that screen.** Confirmed via full script trace: `setMode()` is wired only to the two buttons on `#s-mode`; no toggle exists in the Stage 4 HUD or anywhere else.
*Why it matters:* A stated, specific promise that turns out false erodes trust in every other claim the interface makes.
*Fix:* Add a small mode toggle to the persistent header/HUD once past onboarding, or remove the claim from the copy.
*Suggested command:* `/impeccable clarify`

## Persona Red Flags

**Jordan (first-timer):** Lands on Stage 1 with the 4 mentality-preset chips and the 4 stat steppers both live and visible at once for the same 12-point pool, with no ordering cue beyond a small label — likely taps the bigger, more game-like steppers first and never notices the presets. Told on the Mode screen "you can switch later," Jordan will go looking for that toggle later and not find one. At the Ending, scrolling past the ledger surfaces the `.note` block's raw engineering confession directly beneath the verdict stamp — at the exact moment the game should be delivering its payoff, it reads instead as the app admitting it's broken.

**Sam (accessibility-dependent):** Gets full narration during Stage 1 (stat changes, points remaining), then total silence for the rest of the game — confirmed live: "Taxi rank scanned. Phone Repair Kiosk..." is written to `#live` while scanning, but that node's container computes `display:none` at that exact moment. Worth crediting in the same breath: the disabled-CTA and focus-ring discipline elsewhere in the build is genuinely above-average, which is exactly why this specific gap reads as a slip, not systemic neglect.

**Riley (stress-tester):** Scans and commits to Phone Repair, writes the Stage 3 plan, back-buttons into the Scanner, and commits to Spaza instead — the commit handler correctly resets crisis state but never clears the old plan answers, so Stage 3 still shows "answered" (green stripe) as if written for the new venture, no re-confirmation asked. Replaying the same business twice is pixel-for-pixel identical (a documented, deliberate reproducibility tradeoff for facilitators) — there's no variance left to stress a second playthrough against.

## Minor Observations

- The 332KB real hero photo is a genuine improvement over the 1.27MB autoplay video `PRODUCT.md` flagged in the original shipped build.
- `INSIGHT` has a custom, situational copy override only for the `salon` opportunity; every other opportunity falls back to a static insight string that never reacts to anything the player actually did.
- Detector's 9 font-size findings are mostly pre-existing fluid-`clamp()` endpoints; worth a dedicated `/impeccable typeset` pass to snap them onto the ramp, but none are severity-worthy on their own.
- The two undocumented hero-CTA glass colors (lines 401, 406) are real but low-stakes — worth adding to DESIGN.md's Secondary Fills table next time that file is touched, not urgent on their own.

## Questions to Consider

1. What if Stage 1's stats and the archetype pick actually gated content the way the original shipped build did — would restoring that one mechanic close most of the "doesn't feel like a game" gap on its own, before any further visual work?
2. What if the Crisis HUD showed a live, ticking momentum/trust meter next to cash — rising or falling every single day the way cash already does — would that alone convert the linear quiz-loop into something with felt stakes turn to turn?
3. What if a Crisis decision had a half-second "are you sure" weight before it banked — would that read as dread (good tension) or fight the snappy feel the rest of the system works hard to deliver?
