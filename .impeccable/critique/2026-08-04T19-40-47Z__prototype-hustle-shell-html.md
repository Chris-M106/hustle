---
target: prototype/hustle-shell.html
total_score: 25
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
timestamp: 2026-08-04T19-40-47Z
slug: prototype-hustle-shell-html
---
Method: dual-agent (A: general-purpose · B: general-purpose)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Stage-1 point pool/resume bar excellent; landing/archetype/mode screens give zero "step N of 3" signal before the game's own 4-stage stepper takes over |
| 2 | Match System / Real World | 3/4 | Strong local vocabulary in the scan-grid ("Taxi rank," "Spaza row"); hero lede ("the good kind of alone") is more literary than the documented plain-direct voice |
| 3 | User Control and Freedom | 3/4 | Real pushState/popstate — genuine browser Back works. No in-page way back to archetype/mode from Stage 1 without browser chrome |
| 4 | Consistency and Standards | 3/4 | Token discipline is real in CSS; docked for the brown leak below |
| 5 | Error Prevention | 4/4 | Stat stepper clamps correctly both directions, buttons disable at bounds |
| 6 | Recognition Rather Than Recall | 4/4 | Disabled CTA states the exact unmet condition ("Spend 12 more points") |
| 7 | Flexibility and Efficiency | n/a | Persuade-mode onboarding, no expert path expected |
| 8 | Aesthetic and Minimalist Design | 3/4 | Docked for the DARK_COLORS brown leak and three uncached Google Fonts requests on a metered-data audience |
| 9 | Error Recovery | 2/4 | "Start over" wipes localStorage with zero confirmation — one accidental tap destroys another learner's save on a shared device |
| 10 | Help and Documentation | n/a | Inline stat copy functions as help; no dedicated help affordance needed at this scope |

Total: 25/32 (8 applicable heuristics) -> 78% -> Good, not yet Excellent.

## Design Specificity Verdict

LLM assessment: Genuinely authored, not a reskin. The palette traces to real PIL.Image.getpixel() reads on the hero photo; the leaf-particle spawn positions come from a hand-scanned canopy silhouette against the actual 1672x941 image; the archetype copy and scan-grid vocabulary are specific in a way a template never produces.

Real crack: the three.js leaf system's own color constants are brown. DARK_COLORS (line 1055): 0x1c0f04, 0x281808, 0x140a02, 0x2a1a0a, plus ambient fill light 0x3a2e24 (line 992) — every one fails the file's own documented test (B channel >= R). The CSS layer honored "no brown, no black" perfectly; the WebGL layer didn't get the memo.

Deterministic scan: detect.mjs exit code 2, 13 findings — all advisory except one warning. 8 design-system-font-size (lines 130, 132, 180, 192, 228, 257, 433, 617), 5 design-system-color (lines 340, 400 — line 400 is a false positive, inside a code comment documenting the old shipped bug, not live CSS), 1 em-dash-overuse (8 in body text).

Browser evidence: Zero console/page errors, both viewports. Header transparent-at-top -> solid-.scrolled confirmed via computed style. CTA confirmed genuinely glass (gradient + backdrop-filter:blur(20px) saturate(1.7) + translucent border). DOM-wide computed-style sweep for brown/warm-neutral dark surfaces found zero in the painted CSS layer — brown only exists in WebGL constants. No horizontal overflow at 360/390/768/1280px. Real :focus-visible ring present.

## Overall Impression

The hero delivers the wow moment — real photo, real particle system, real glass CTA, real nav behavior. What doesn't yet land: the premium feeling is front-loaded into screen one and goes conventional-card-UI immediately after, one literal instruction leaked past the CSS audit into the three.js layer, and two P1s — no visible primary action above the fold, and 9px carousel dots — hit exactly the phone-in-one-hand audience this product is built for.

## What's Working

1. Photo-sampled palette methodology, not a vibe — PIL.Image.getpixel() reads, documented hex, a hard invariant (B >= R).
2. Disabled states that teach the mechanic — "Spend 12 more points" counting down live.
3. Real history-based routing — Back button has real meaning for Android-gesture-nav users.

## Priority Issues

[P1] No visible primary action in the first viewport
Why it matters: hero is 92vh with the only CTA hidden (opacity:0) until scroll > 80px. Sole affordance is a small bobbing chevron.
Fix: give the first viewport a real always-visible entry point — promote the hint to a labeled "Scroll to start" or add a quiet persistent button under the copy block.
Suggested command: /impeccable onboard

[P1] Archetype carousel dots are 9px tap targets
Why it matters: every other control in this file honors a 48px+ floor; 9px dots can't reliably be tapped one-thumb.
Fix: expand hit area to >=44px via padding, keep the 9px visual dot centered inside.
Suggested command: /impeccable adapt

[P1] Explicit "no brown" directive violated in DARK_COLORS/ambient light
Why it matters: 0x1c0f04, 0x281808, 0x140a02, 0x2a1a0a (line 1055) and 0x3a2e24 (line 992) are brown by the file's own stated test.
Fix: replace with purple-family darks derived from --surface/--surface-2.
Suggested command: /impeccable polish

[P2] "Start over" has no confirmation
Why it matters: on the stated shared-classroom-device scenario, one accidental tap wipes a learner's save with zero undo.
Fix: two-tap confirm, no modal needed.
Suggested command: /impeccable harden

[P2] Hero uses 92vh, DESIGN.md bans vh outright
Why it matters: own doc states "min-height:100dvh, never 100vh" as a hard rule, and this lives on the exact Android-Chrome address-bar-collapse case that rule exists to prevent.
Fix: 92vh -> 92dvh.
Suggested command: /impeccable polish

## Persona Red Flags

Jordan (first-timer): Lands on a strong hero, but nothing above the fold reads as clickable. "the good kind of alone, the kind with a view like this" is an idiom that could read as confusing against the "plain, direct" voice rule.

Casey (distracted, one-thumb): Carousel's native scroll-snap is right for tap accuracy, but 9px dots fail her specifically — forced into swipe-only navigation.

## Minor Observations

- Anton/Archivo/JetBrains Mono loaded from Google Fonts CDN — inconsistent with the file's own reasoning for vendoring three.js locally.
- renderer.render() still fires every frame under prefers-reduced-motion even though leaf transforms stop updating.
- No try/catch around new THREE.WebGLRenderer(...) — unverified fallback behavior if WebGL is blocked.
- 8 literal font-sizes off the documented type ramp (detector-caught).

## Questions to Consider

1. If the brief is "wow effect, has to look like a 10k page," is one full-bleed hero enough to carry a flow that reverts to conventional card UI immediately after? Where does the premium feeling live after screen one?
2. The brown leak raises a process question: was the palette audited only at the CSS/DESIGN.md layer? What catches this in the larger production codebase this prototype is meant to seed?
3. Given the stated data-cost constraint, is a 468KB three.js bundle plus a WebGL particle system for ambient leaf decoration the right trade, or does "wow effect" need its own explicit data budget?
