---
target: "https://hustle-simulation.netlify.app/"
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
timestamp: 2026-08-01T07-51-31Z
slug: hustle-simulation-netlify-app
---
Method: dual-agent (A: acc8f1d566c9d6db6 · B: ad44769c8ac484625)

Target: https://hustle-simulation.netlify.app/ — HUSTLE, New Venture Creation game (NQF L2 / SAQA 49648). React/Vite SPA, zero CSS files, all inline style objects.

Caveat carried from both assessments: screenshots failed and the viewport reported 0x0 all session. Nobody has seen this rendered. Every visual claim below derives from the DOM, computed styles, and the shipped bundle. Spacing rhythm and composition are unjudged.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Strong live counters (SCANNED 2/5, POINTS LEFT, SECTION 1/5, CASH R2,800); but header says DAY 1/14 while footer says "6 days remaining" |
| 2 | Match System / Real World | 4 | Best dimension. Load shedding, spaza, shisanyama, rand, NQF framing all native |
| 3 | User Control and Freedom | 1 | history.length===1 at every stage. Refresh wipes a 40-min run. No undo on the R2,500 commit |
| 4 | Consistency and Standards | 2 | Stage-1 CTA uses the light ink token as a background while every other CTA uses amber gradient; day counts disagree three ways |
| 5 | Error Prevention | 1 | Same card is both "scan" and "choose" — second tap spends R2,500, no confirm. CTA rendered "-2 point left" and still advanced |
| 6 | Recognition Rather Than Recall | 3 | Persistent context chips carry state well; scanner data unreachable after commit |
| 7 | Flexibility and Efficiency | 4 | Learn/Play split with honest time ranges is a real, well-judged accommodation |
| 8 | Aesthetic and Minimalist Design | 2 | Learn Mode auto-opens ~350 words above the task; 87 of ~144 fontSize declarations are <=13px, 25 at 10px |
| 9 | Error Recovery | 2 | Failure copy written with dignity, but no mid-run recovery and no resume after a crash |
| 10 | Help and Documentation | 4 | Outstanding — per-stage explainers, persistent LEARN, per-decision lessons, built-in Calculator |
| **Total** | | **26/40** | **Acceptable — significant improvements needed** |

Score differs from Assessment A's 26 vs 27: error prevention dropped to 1 on B's direct observation that the confirm button rendered "-2 point left" and advanced anyway.

## Design Specificity Verdict

**Authored writing wearing a rented UI.**

The content is unmistakably built for this product and nobody else. Shisanyama, spaza shop, load shedding as a scheduled crisis type ("Stage 4 Load Shedding", "Stage 6 Saturday Blackout" — grid vocabulary, not generic "power outage"), R600 startup costs, "15+ traders at the same market", tournament weekends cracking phone screens. The commit button rewrites itself to match stakes: `Choose Phone Repair →` becomes `CHOOSE ANYWAY →` when you have under-scanned, `TAKE THE RISK →` on a card graded Risky. That is a designer thinking about what a button means.

The chrome could belong to any crypto dashboard from 2021. #0B1724 navy, #162130 cards, #22344A hairlines, one amber accent (#F4B942), 16px radii, Inter, emoji as the entire icon system, 10px micro-caps labels. No township visual language anywhere in the shell — no texture, no photography past one landing video, no typographic grit. The gap between "Shisanyama · HIGH RISK" and the calm slate card holding it is the single biggest missed opportunity in the product.

If the interface were destroyed and only the copy survived, the product would still feel like KwaDream. If only the interface survived, it would feel like a fintech admin panel.

**Deterministic scan:** CLI detector not run — detect.mjs takes markup file paths, no local checkout exists, only the deployed bundle. Correctly skipped per the reference.

**Visual overlays:** browser injection SUCCEEDED. document.title mutation and inline script execution confirmed; live-server.mjs ran on port 8400; http://localhost:8400/detect.js loaded into the https page with no CSP and no mixed-content block; 8 impeccable* globals appeared and document.body.children went 1 -> 9. Detector findings read via impeccableScan() return values because read_console_messages returned "Policy check in progress". The overlay tab has since been discarded — no overlay is currently visible to the user.

**Cross-check that mattered:** both the bundled detector and Assessment B's harness resolve background via background-color only, ignoring background-image, so gradient CTAs get flagged wrongly. B therefore dismissed the Stage-1 CTA finding as an artifact. Verified directly on a clean load: `Reveal Profile: The All-Rounder →`, not disabled, `color: rgb(255,255,255)` on `linear-gradient(135deg, rgb(232,240,248) 0%, rgba(232,240,248,0.733) 100%)` = **1.15:1 against both stops**. B's rule is right for the amber and green CTAs (#0b1724 on orange ≈ 9:1, genuinely passes) but wrong here, because this gradient is light on both stops. A was right. Real P0.

## Overall Impression

The pedagogy and the writing are better than the shell deserves. Stat-gated scanner insights (network>=7, finance>=7, sales>=7) genuinely change what the player sees; the persistent context chips solve a recall problem most educational software collapses under; the failure ending refuses to shame the player. Then the interface undoes it: the only exit from Stage 1 is invisible, a 40-minute session has zero persistence on devices that kill background tabs, and roughly half the authored crisis content may be unreachable.

Biggest opportunity: the visual world. Second biggest: making the thing survive a class bell.

## What's Working

1. **The persistent context chip row** (💰 Calculator · 📱 Phone Repair · 📋 Strong Plan · 💰 R2,800). Smartest thing in the product. A four-stage arc where choices compound would normally collapse under recall load; this makes every prior decision continuously visible without an extra tap.
2. **Verdict-adaptive commit copy.** `CHOOSE ANYWAY →` at 2 of 5 scanned; `TAKE THE RISK →` on a Risky card. The button carries the game's moral argument. Most educational software ships "Continue".
3. **Learn/Play split with honest numbers.** Real time ranges (25–40 vs 12–18) and one marked "★ RECOMMENDED FIRST TIME" respects a first-timer, someone revising, and someone budgeting prepaid data and a lunch break.

## Priority Issues

**[P0] Stage-1 primary CTA is invisible**
- What: `REVEAL PROFILE: THE ALL-ROUNDER →` renders white on a #E8F0F8 gradient. 1.15:1, verified on a clean load in a third session after the two assessments disagreed.
- Why it matters: it is the only exit from Stage 1. On a cheap LCD in daylight the player cannot see the button that continues the game. The first stage becomes a dead end and the run ends before it starts.
- Fix: use the landing CTA tokens — `linear-gradient(135deg,#F4B942,#E06C00)` with `color:#0B1724`. The light token was authored as ink, not as a background.
- Suggested command: /impeccable colorize

**[P0] Zero persistence on a 25–40 minute session**
- What: localStorage and sessionStorage are both empty at every checkpoint; 0 occurrences of either in the bundle. history.length===1 at all four stages. URL never changes; 0 history.pushState. Refresh from Day 3/14 with R3,700 landed back on the landing screen. Assessment A lost two full playthroughs this way.
- Why it matters: the stated audience is on a low-end Android that kills backgrounded tabs, often a shared classroom device. One incoming call ends a 40-minute lesson at Day 9 with no way back. Back exits the site entirely. This destroys completion rates silently — nobody will know why.
- Fix: serialize state to localStorage on every stage transition and every crisis day; "Resume your hustle" card on the landing page; push a history entry per stage so Back means back.
- Suggested command: /impeccable harden

**[P1] The crisis stage contradicts itself about its own length**
- What: header renders `DAY 1/14`; the tutorial says "Seven trading days in KwaDream"; the footer computes `${7-S-1} days remaining` off a hardcoded 7. The bundle holds 210 day entries = 5 businesses x 14 days x 3 fields.
- Why it matters: either the header lies, or the loop truncates and roughly half the authored crisis content — days 8–14, already written and shipped — is unreachable. Either way the landing page's promise to "Survive 14 days of business reality" is broken.
- Fix: pick 14, derive every counter from one constant, delete the hardcoded 7, verify days 8–14 render.
- Suggested command: /impeccable harden

**[P1] No accessibility layer and no responsive layer, structurally**
- What: across 421,113 chars — `aria-*` 0 on every stage, `[role]` 0, `onKeyDown` 0, `@media` 0, `matchMedia` 0, `innerWidth` 0, `:focus` 0, `outline` 0, `prefers-reduced-motion` 0, `clamp(` 0, `vw` 0, `minWidth` 0. Exactly one heading element in the whole app (an h2 on the cash-flow stage), no h1. Focus measured live after .focus(): outlineStyle "none", boxShadow "none". Zero CSS files means @media/:focus/:hover are structurally impossible, not merely absent.
- Why it matters: a screen reader hears five consecutive buttons whose entire accessible name is identical ("Signal Detected Tap to Scan ? Unknown Opportunity Tap to scan") — the Scanner is unusable and unwinnable. A single max-width:440px with no media queries is the only width rule in the app, so at 1280px about 66% of the viewport is unused and the layout is byte-identical from 440px up. An autoplaying looping video with no reduced-motion escape is a vestibular hazard.
- Fix: label the five scanner cards by index and state; real heading hierarchy with one h1; a focus ring; one prefers-reduced-motion rule swapping the video for the existing poster; minHeight:48 on the steppers. This is gated on extracting a stylesheet first.
- Suggested command: /impeccable adapt

**[P1] 32 genuine contrast failures across four stages, plus 9 undersized tap targets**
- What: two foregrounds cause nearly all of it — `#4a6070` and `#2e4a62` on #0F1E2E / #162130 / #0B1724. Worst genuine offenders are the disabled-state CTAs at 1.76:1 15px/800 ("3 points left", "Select an answer"), then every stage title at 1.82:1 and every micro-cap label at 2.57:1/10px. On Profile at 375x812, 9 of 10 targets fail 44x44 on height: 4x `−` and 4x `+` at 143x40, the explainer toggle at 297x43. Proximity violations: 0. Horizontal overflow: 0 at all three breakpoints.
- Why it matters: the failing text is the labelling layer — Demand, Competition, Cost, Points Left, days remaining. The player is asked to make comparative decisions using numbers they cannot read in daylight, then to hit a 40px stepper one-handed in a taxi.
- Fix: lift muted foreground to roughly #8FA6B8, floor body at 14px and labels at 12px, minHeight 48 on steppers, and give disabled CTAs a legible disabled treatment rather than near-invisible ink.
- Suggested command: /impeccable typeset

**[P2] Stage 1 ships pre-solved and its tutorial describes a state that never exists**
- What: opens at 5/5/5/5 with POINTS LEFT 0, CTA already live, all four `+` disabled. The tutorial says "Tap + to raise a stat" and "The Confirm button only activates when all 20 points are used — not before." Separately, B observed the confirm button rendering the literal label "-2 point left" and advancing the stage anyway.
- Why it matters: the first act of a game about hard choices is a choice already made, and the first two controls a first-timer touches are both dead. 4/6/5/5 still returned "The All-Rounder", reinforcing that the stats do not matter.
- Fix: start at 2/2/2/2 with 12 points to spend. Now `+` is the live control, the CTA earns its unlock, and the tutorial becomes true. Clamp the points counter so a negative value can never enable advance.
- Suggested command: /impeccable onboard

## Cognitive Load: 5 of 8 failed — CRITICAL

- FAIL Single focus — Stage 1 renders ~350 words of tutorial, four steppers, a status line and the CTA at once.
- FAIL Chunking — the auto-opened panel is 9 stacked blocks (4 "What to do" + 4 "What each stat does" + a tip).
- FAIL Visual hierarchy — 87 of ~144 fontSize declarations <=13px; 25 at 10px.
- FAIL One thing at a time — Scanner shows five cards, an expanded detail panel and the tutorial simultaneously.
- FAIL Minimal choices — the Scanner presents 5 options, over the working-memory threshold of 4.
- PASS Visual grouping, Working memory (the chip row is the fix), Progressive disclosure (accordions and scan-to-reveal are the best-executed pattern in the app).

## Emotional Journey

Peak is well placed: the profile reveal (⚡ The All-Rounder, a quote, four stat bars, a ⚠ WATCH OUT weakness) is the one moment the interface performs rather than reports. End is handled with unusual care — four endings, and the failure state reads "Every entrepreneur fails before they win. The lessons are all there — go back and apply them." For a curriculum aimed at unemployed youth, refusing to shame the losing player is right and well executed.

Valley one is Stage 1, self-inflicted: the emotional promise is "R2,500 and a dream" over a cinematic video, and the first interaction is a settings form that is already filled in. Valley two is the R2,500 commitment — the most consequential moment in the game — which has no ceremony and no confirmation. A stray second tap on the same card spends the entire budget and the game moves on without comment.

## Persona Red Flags

**Jordan (confused first-timer)** — Taps "Start in Learn Mode", lands on Stage 1, reads "Tap + to raise a stat", taps `+`, nothing happens. Four times. No disabled-state explanation anywhere near the steppers. Then cannot find `REVEAL PROFILE` because it is white on white. Jordan's first 90 seconds are two dead controls in a row.

**Sam (accessibility-dependent)** — Hard blocked at the Scanner: five sibling buttons whose entire accessible name is identical, no aria-label, no index, no aria-expanded on the accordion so the scan/expand toggle is silent. Focus is invisible everywhere (outlineStyle "none", boxShadow "none") though buttons are real buttons so reachability works. At 200% zoom with @media 0, the chip row has no reflow rule. The 10px #2E4A62 "days remaining" is unreadable at any zoom for low vision.

**Casey (distracted mobile, one-handed)** — The `−`/`+` steppers are 143x40, under the 44px floor, as adjacent siblings; mis-taps near-certain in a moving taxi. The Scanner's dual-purpose card is the real trap: tap once to scan, a reflex second tap on the same target spends R2,500 irreversibly with no confirm — this happened to Assessment A. Any interruption that kills the tab loses everything.

**Thandi (project-specific: unemployed KwaDream youth, low-end Android, prepaid data, shared classroom device)** — The 1,013,247-byte MP4 fires with preload="auto" on landing before she has chosen anything; total landing payload ≈1.27 MB, 90% of it video plus poster, and the 149 KB poster downloads in full as well. On prepaid that is real money spent on decoration. Zero navigator.connection / saveData / effectiveType in the bundle — no data-saver path exists. On a shared device with no persistence and no profiles, a facilitator cannot let two learners alternate: the second learner's session destroys the first's. A 40-minute Learn Mode with zero save state, on a device that kills background tabs, is a curriculum that cannot survive a class bell.

## Minor Observations

- All five pre-scan cards are byte-identical, so "which do I scan first" is a coin flip dressed as market research — the stage's own premise.
- Emoji carry the entire icon system (💡💰📣🤝📱🏪✂️🍗👗). Inconsistent across Android versions, verbose under a screen reader.
- No meta description, no OG tags, no Twitter tags, no favicon, no theme-color, no manifest, no canonical. Anything shared in a WhatsApp class group — the way this will actually spread — previews as a bare link.
- Images are the one place a11y attributes exist: 5 of 5 have alt. lang="en" is present.
- No clickable-div pattern anywhere; every interactive element is a real button. That part is sound.
- Zero console errors or warnings across a full playthrough.
- onMouseEnter 4 vs onMouseLeave 3 — hover faked in JS on ~4 elements with a mismatched pair, so one element likely enters a hover state and never exits.
- useState 29 with no reducer and no store: all game state is scattered component state, which is why persistence was never wired — there is nothing central to serialize.
- Scanner insights are genuinely stat-gated and do change what you see, but the Finance IQ insight read identically across two different cards ("Check if this cost fits within your plan's budget allocation"). The gate is real; the reward is not specific yet.
- HTML document is 347 bytes. Netlify, HSTS on, Cache-Control public,max-age=0,must-revalidate.

## Questions to Consider

1. The writing does 100% of the world-building and the visual design 0%. Why is the shell allowed to be a dark dashboard when the copy already knows exactly where it is set?
2. Days 8–14 of crisis content are shipped and appear unreachable. Is the 14-day promise a design decision or a bug nobody has played long enough to notice? That it is not answerable in one playthrough is itself the finding.
3. The thesis is that cash runs out and choices are irreversible. What would it look like if the interface itself were scarce — if the Scanner cost you a scan, if the tutorial panel cost you time, if the cards got visibly harder to read as your cash dropped?
4. A facilitator has 30 learners, 8 shared phones, one 45-minute period. Nothing in this build survives a device being handed to the next learner. Was the classroom the design target, or the assumed target?
5. Stage 1 hands the player a solved puzzle; Stage 2 hands them five identical unmarked doors. Both are decisions with no information. What does the player learn in the first four minutes that they could not have learned by pressing Continue twice?
