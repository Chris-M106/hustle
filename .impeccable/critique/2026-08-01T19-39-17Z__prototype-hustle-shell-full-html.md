---
target: prototype/hustle-shell-full.html
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-08-01T19-39-17Z
slug: prototype-hustle-shell-full-html
---
Method: dual-agent (A: a10e9962e0101c4bd · B: afc10a2f09419c5b3)

Target: `prototype/hustle-shell-full.html` — HUSTLE redesign prototype, all four stages.
Mode: Operate (stages 1–4) with a Persuade landing board.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Counters and stepper are strong; nothing signals that the run is being saved, and Stage 4 never names the business being run. |
| 2 | Match System / Real World | 3 | Voice survives where authored, but raw enum values leak: `.kind` renders `Day 6 · competition`. |
| 3 | User Control and Freedom | 2 | Real `pushState` routing, but no visible Back control on any stage, no way to revisit Scanner or plan, and "Start over" wipes the save with no confirmation. |
| 4 | Consistency and Standards | 3 | Token discipline good; `#31261e` hardcoded ×3, two different minus signs, `<s>` misused, flow content inside `<button>`. |
| 5 | Error Prevention | 1 | "Over budget by R-300"; no low-cash warning before ruin; boot order destroys the save before reading it. |
| 6 | Recognition Rather Than Recall | 2 | Chosen business, profile and plan answers are never shown again after their own stage — 25–40 minutes of pure recall. |
| 7 | Flexibility and Efficiency | 2 | Learn/Play modes are real, but every re-render wipes `innerHTML` and destroys keyboard focus. |
| 8 | Aesthetic and Minimalist Design | 3 | Strongest dimension; undercut by Stage 3's 15-button wall and full-page grain over 12px type. |
| 9 | Error Recovery | 2 | Bankruptcy gives a verdict but no diagnosis. No offline state, no `<noscript>`. |
| 10 | Help and Documentation | 2 | Lesson cards with NVC citations are excellent, but fire after the decision; jargon is unglossed at the moment of choosing. |
| **Total** | | **23/40** | **Acceptable — significant improvements needed** |

## Design Specificity Verdict

**The landing board is authored for this product. Stages 1–4 are a competent dark wizard wearing the same paint.**

Carrying real meaning: the enamel stripe (`--stripe`), which is load-bearing rather than decorative — it flips to `--good` on `.pool.done` and `.qcard.answered`, and to green/red on `.event.income`/`.expense`, so the motif encodes state. The `.kicker` at `rotate(-1.2deg)` in sign-yellow is the most authored gesture in the file. The warm ramp holds with no `#FFF`, `#000` or cool grey anywhere.

Generic and portable to any fintech dashboard: `.hud`, `.scorecard`/`.sc` (three equal tiles — which DESIGN.md explicitly bans as a feature row), `.bar i`, `.track i`. `header.top` with `backdrop-filter: blur(14px) saturate(1.3)` directly contradicts the north star — frosted glass is the opposite of enamel on metal, and is the anti-reference's own idiom.

The stamped corner flag is conceptually right and executionally generic: radius-matched, tucked inside the corner, indistinguishable from a SaaS selection badge. A stamp would be rotated and would over-run the edge.

Decoration rather than argument: the grain overlay at `opacity:.32`, `mix-blend-mode:overlay`, `z-index:60` sits above every 12px label in the system. No contrast checker can account for it because it composites above the text.

**Deterministic scan:** exit 2, 39 findings, all advisory drift notices — 26 `design-system-font-size`, 11 `design-system-color`, 6 `design-system-radius`. No functional or blocking rules fired. One is a false positive: `design-system-color` at L254 flags `#fff` inside the comment documenting the shipped build's 1.15:1 CTA.

Independently recomputed and confirmed: CTA ink on both gradient stops 6.41:1 / 5.06:1; all interactive elements ≥44px (`.ctrl button` a true 52×52); 43 font-size declarations, minimum 12px, none below; 7 `@media` blocks; 27 `aria-*`, 6 `role`, h1=1/h2=6/h3=7, all 6 sections labelled; no layout-property transitions; no zero-offset chromatic glow.

**Browser visualization: unavailable.** No puppeteer/playwright/jsdom resolvable, no MCP browser tool. No overlay exists and no computed-style measurement was taken.

## Overall Impression

The visual world is convincing and the accessibility scaffolding is real. But three of the file's headline claims are false in the running code, and the biggest one is the flagship: **the resume flow deletes the run it exists to restore.** The prototype was verified with static checks that could not catch behaviour, and behaviour is where it breaks.

## What's Working

1. **The stripe is a system component, not an ornament.** It appears on six surfaces and changes colour to encode state on three of them. It solves the problem an accent `border-left` would solve while carrying two colours and a 26px rhythm a border cannot.

2. **Disabled states that name the unmet condition.** `Spend 12 more points` → `Spend 1 more point`, `Answer 3 more sections`, `Scan a spot first` → `Tap a scanned spot to choose it`. Three buttons each teaching their own precondition, legible at 5.4:1 with a dashed border rather than the shipped 1.76:1 ghost.

3. **The contrast and tap-target work holds under independent measurement.** The `crisis-red` split into `--bad` (stripes) and `--bad-text` (text) applies DESIGN.md's own gradient lesson to a token DESIGN.md had not caught.

## Priority Issues

### [P0] The resume flow silently deletes the run it is supposed to restore
Boot order is `state = fresh(); boot(true); offerResume();`. `boot()`'s first statement is `setMode()`, which ends in `save()` — so every page load writes the empty state over the saved run before `offerResume()` calls `load()`. Verified at template.html:1205 vs :1216. The resume bar is dead code in the normal path.

Second branch: if the hash survives (browser restore, shared link, tab reload — all normal on the target device), `boot(true)` calls `show("crisis")` on a fresh state; `deck()` resolves `CRISIS[null]` to `CRISIS.spaza`, dropping the player into Day 1 of a business they never chose.

**Why it matters:** PRODUCT.md names this the binding constraint — "a lost run is a lost lesson". `design.json` records persistence as a verified result. The writes are verified; the read is not.

**Fix:** `state = load()?.s || fresh();` before `boot()`. Gate the hash route on state validity — if the target stage needs `state.biz` and there is none, fall back to landing.

**Suggested command:** `/impeccable harden`

### [P0] Every re-render destroys keyboard focus
`renderStats()`, `renderScan()`, `renderPlan()` and `renderCrisis()` all rebuild via `innerHTML`, so the element the user just activated no longer exists and focus falls to `<body>`. Stage 1 needs 12 `+` presses — twelve full re-tabs from the top. Stage 2 breaks outright: tap to scan → focus dies → tab back to the same card to commit.

**Why it matters:** for an NQF/SAQA product where an accessibility review is plausible, this is worse than the missing focus rings it was built to fix, because the ring now exists and lands nowhere.

**Fix:** restore focus by id after render, or mutate in place — `bump()` only needs to change one textContent, one `scaleX`, and the disabled flags.

**Suggested command:** `/impeccable harden`

### [P1] "Over budget by R-300", and capital that is never spent
`salon` carries `cost: 2200, fits: false`, so `rands(o.cost - CAPITAL)` renders **"Over budget by R-300"** on a card that simultaneously shows `Cost R2,200` against `Your capital R2,500`. Separately, nothing debits `o.cost` from `state.cash` anywhere — every business opens Stage 4 at exactly R2,500, whether the player chose the R600 stall or the R4,500 shisanyama.

**Why it matters:** Stage 2's whole premise is compare the numbers. The interface does the arithmetic wrong in front of the learner, then applies no consequence either way.

**Fix:** derive `fits` from `o.cost <= CAPITAL` rather than trusting the imported flag; render the over-budget line only on a positive delta. Then debit at commit and show the opening balance on the button — "Choose Phone Repair → opens at R1,300".

**Suggested command:** `/impeccable clarify`

### [P1] The ending scorecard prints a denominator that does not exist
`#endScore` renders `Crisis decisions {score}/21`. Verified against the data: all five businesses have 12 decision days with a real score range of **14–36**. A competent run displays "30/21" as its closing summary. Worse, because the scoring formula clamps at `min(1, score/21)`, the 30-point crisis component is maxed by nearly every run — the decisions the player agonised over for 14 days barely move the result.

**Why it matters:** peak-end. This is the last screen, and PRODUCT.md's second success criterion is that the learner can explain why they failed or survived.

**Fix:** print `30 of 36`. Re-scale the formula to the real range. Better: replace the three ratios with a 14-row ledger — day, choice, rand delta, and the one that cost them.

**Suggested command:** `/impeccable clarify`

### [P2] Stage 3 is a 15-button wall with no progressive disclosure
`renderPlan()` appends all five `.qcard`s at once — 15 `.ans` buttons, roughly four screen-heights of near-identical cards on a 375px viewport, with no numbering and no per-section progress. This is the stage furthest from the audience's vocabulary and it gets the least support; Stages 1, 2 and 4 all chunk correctly.

**Fix:** one section per view with `Section 2 of 5` in the existing `.stage-head` slot. The routing already exists, so each section would get a real history entry and the Android back button would walk the plan backwards.

**Suggested command:** `/impeccable layout`

## Cognitive Load

**5 clear failures of 8** — high load, critical fix needed.

FAIL single focus (Stage 3 shows five questions at once) · FAIL chunking (5 opportunities, 5 sections) · PASS grouping · PASS visual hierarchy · FAIL one-thing-at-a-time · FAIL minimal choices · FAIL working memory (business, profile and plan all vanish after their stage) · PARTIAL progressive disclosure (good in Stages 2 and 4, absent in Stage 3).

Decision points over 4 options: `#scanGrid` 5 buttons · `#planHost` 15 buttons · `#stats` 8 live steppers.

## Emotional Journey

Peaks are real: `showReveal()` naming your weakness in the same breath as your strength, and `#commitBtn` rewriting itself to `Take the risk: Hair Salon →`.

The end is the weakest screen, which is the worst place for it. Valleys have no floor — `.cash.low` fires only at `cash <= 0`, after the player is already dead. There is no amber warning. Then `nextDay()` sees the zero and calls `finish(true)`, so the player taps a button labelled **"Day 6 →"** and lands on "Back to the Drawing Board". The button lies at the highest-stakes moment in the game.

The failure copy promises "the lessons are all there" and the interface provides no route back to any lesson.

## Persona Red Flags

**Jordan (first-timer, first exposure to business vocabulary):** undefined jargon at the moment of decision — "Accept on 30-day terms", "negotiate an earlier payout slot" — with the explaining lesson firing only after the choice, and only in Learn mode. `Loud/Steady/Spiky signal` is a taxonomy the shell invents and never defines. `.kind` reads `Day 6 · competition`. The two-tap scanner is explained only in prose above the grid; a scanned and unscanned card share the same border.

**Sam (screen reader, keyboard-only, low vision):** focus destruction on every re-render is disqualifying. Flow content (`h3`, `p`, `dl`) nested inside `<button>`. `<s>` used to hold step digits. `aria-pressed` used for what is semantically single-select — should be `radiogroup`/`aria-checked`, which would also give arrow-key nav. `show()`'s `scrollTo({behavior:"smooth"})` is not gated by `prefers-reduced-motion` — the CSS media query cannot reach it. On the ending screen, focus lands on `#t-end`, which is `class="sr"`, so the sighted keyboard user's ring vanishes.

**Casey (one-handed, interrupted, slow connection):** interrupted mid-session is her defining condition and resume is broken. Layout shift in `#scanGrid` — a scanned card grows, pushing the others down, so a returning tap hits the wrong card and the commit button changes under her thumb. Stage 4 stacks ~170px of permanent chrome above a scrolling event card, putting decisions below the fold. Three Google-hosted font families load before anything is chosen; the 1MB video gating is well done, the fonts are unbudgeted.

## Minor Observations

- `vClass()` is dead code — both branches return `""`.
- `#31261e` hardcoded ×3; should be a `--surface-3` token.
- `rands()` emits ASCII `-` for negatives while `.delta` uses U+2212. Two minus signs on the same screen.
- `.event` styles exist only for `income`/`expense`/`emergency` — 10 of 14 days fall through to the default stripe, so the motif's best idea is inactive most of the game.
- `STEP_OF.end === 3`, so the stepper still shows Stage 4 as current on the ending screen.
- `--surface-raised` is referenced in two comments with contrast claims but is never defined or consumed; the live token is `--surface-2`.
- Back from crisis lands on the plan with answers still editable, silently re-grading a run in progress.
- `▶` in `#playVid` renders with emoji presentation on several Android stacks — a near-miss on the project's own no-emoji ban.
- No `<noscript>`.
- Stage 1's stats gate nothing. PRODUCT.md verified `network>=7`/`finance>=7`/`sales>=7` unlocks in the shipped bundle; this shell implements none, so "These four traits follow you into every stage" is a promise the code does not keep.

## Questions to Consider

1. If the stats gate nothing, why is Stage 1 first — implement the gates, or admit it is flavour and move it after the Scanner?
2. What is the ending scorecard for? If it exists so a learner can explain their result, three context-free ratios are the wrong artefact. A 14-row ledger is the same data in a form they could photograph and take to a facilitator.
3. Is the sticky HUD earning its 170px, or is the real design a ledger? A pinned total teaches "watch the number"; a scrollable history teaches "money has a story" — which is the actual unit standard.
4. If `.event::before` carried cash trajectory rather than event type, would the stripe become the HUD you have not built yet?
