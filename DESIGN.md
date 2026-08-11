---
name: HUSTLE
description: A New Venture Creation game set in KwaDream — sunrise warmth over a real photograph, not dashboard cool.
colors:
  ink: "#3E3050"
  surface: "#473456"
  surface-raised: "#4C3A57"
  surface-warm: "#5A415C"
  hairline: "#6B5678"
  bone: "#F5F0FA"
  bone-muted: "#C9BFE0"
  bone-quiet: "#C4B8DB"
  enamel-orange: "#F2941C"
  enamel-orange-hi: "#FDB74D"
  enamel-orange-lo: "#C97012"
  sign-yellow: "#FFC98A"
  dusk-deep: "#3E3050"
  dusk-mid: "#5A415C"
  sun-core: "#F2941C"
  survive-green: "#6FBF73"
  gain-inflight: "#8FE093"
  daycard-warm: "#6B4630"
  bad: "#E2453C"
  bad-text: "#FA9086"
  tag-hot: "rgba(242,148,28,.16)"
  tag-hot-fg: "#FDCB8A"
  tag-risk: "#3a1d1a"
  tag-risk-fg: "#F09A94"
  tag-risk-border: "#7d2620"
  button-edge: "#8A4C0C"
  wash-warm: "#5A415C"
  shadow-ink: "rgba(0,0,0,.85)"
  shadow-ink-soft: "rgba(0,0,0,.55)"
typography:
  scale:
    xs: "0.75rem"
    sm: "0.875rem"
    base: "1rem"
    md: "1.125rem"
    lg: "1.25rem"
    xl: "1.5rem"
    2xl: "1.875rem"
    3xl: "2.25rem"
    4xl: "2.625rem"
    5xl: "3rem"
    6xl: "4rem"
    7xl: "7.5rem"
  display:
    fontFamily: "Anton, 'Arial Narrow', sans-serif"
    fontSize: "clamp(3rem, 15vw, 7.5rem)"
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Anton, 'Arial Narrow', sans-serif"
    fontSize: "clamp(1.875rem, 7vw, 3rem)"
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Anton, 'Arial Narrow', sans-serif"
    fontSize: "clamp(1.125rem, 4vw, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "normal"
  body:
    fontFamily: "Archivo, 'Segoe UI', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Archivo, 'Segoe UI', system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.14em"
  numeric:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tabular-nums"
rounded:
  hair: "1px"
  xs: "2px"
  sm: "4px"
  md: "10px"
  lg: "18px"
  pill: "99px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.enamel-orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px 26px"
    height: "56px"
  button-primary-disabled:
    backgroundColor: "transparent"
    textColor: "{colors.bone-quiet}"
    rounded: "{rounded.md}"
    padding: "16px 26px"
    height: "56px"
  stepper-control:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.bone}"
    rounded: "{rounded.md}"
    height: "52px"
    width: "52px"
  stepper-control-hover:
    backgroundColor: "{colors.enamel-orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "52px"
    width: "52px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.bone}"
    rounded: "{rounded.md}"
    padding: "18px"
  board:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.bone}"
    rounded: "{rounded.lg}"
    padding: "clamp(26px, 5vw, 52px)"
  tag:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.bone-muted}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
---

# Design System: HUSTLE

> Status: **provisional.** Extracted 2026-08-01 from the redesign prototype
> (`hustle-shell.html`, landing + Stage 1 only), not from the production app. The shipped
> build at hustle-simulation.netlify.app does **not** yet use any of this. Re-run
> `/impeccable document` in scan mode once these tokens land in the real codebase.
>
> **Revised 2026-08-03** against the four-stage prototype at
> `prototype/build/hustle-shell.html`, and — for the first time — against a **running
> render**: headless Edge over CDP, a full playthrough at 360 / 412 / 768 / 1280px, two
> decision strategies each. Everything in this file describing a measurement is now a
> measurement. Changed: the loss colour is split into `bad` / `bad-text` because the single
> `crisis-red` failed as text; the type ramp is enumerated in `typography.scale` and the
> prototype snapped onto it; the radius scale gained `1 / 2 / 99px`; the secondary fills
> that were shipping undocumented are listed.
>
> **Catalogued in the taste vault** (`~/.claude/taste-vault/index.html`, family
> *Painted Signboard*) as three entries: `hustle-signboard-hero`, `hustle-enamel-stripe`,
> `hustle-allocation-console`. Each carries the verified palette, type pairing and the one
> transferable lesson; the catalog's **Copy brief** button emits a build-ready prompt from them.
>
> **Superseded 2026-08-04/05 by the Sunrise world** (see `## Colors` below — replaces Painted
> Signboard's brown/bitumen base outright, per direction: "I don't want to see brown or black").
> `prototype/hustle-shell.html` was then ported (2026-08-05) to cover **all four stages**, not just
> landing + Stage 1: the real Stage 2-4 content (opportunities, plan questions, all 14 crisis days,
> lesson bands) was pulled from `prototype/build/hustle-shell.html` and restyled onto the Sunrise
> tokens below. `prototype/build/` itself still ships the old bitumen-brown palette and is now a
> **data source only**, not a visual reference — see `CONTINUE-IN-VSCODE.md`.

## Overview

**HUSTLE is a mobile application** (see `PRODUCT.md`) — every token, breakpoint, and component
below is designed mobile-first for low-end Android, not shrunk down from a desktop layout. The
current implementation renders these tokens in a browser prototype; that's an implementation
detail, not the design target. See `TESTING.md` for verifying any of this against the actual
rendered app rather than the source alone.

**Creative North Star: Sunrise, replacing Painted Signboard outright (2026-08-04).**

> THESIS: the game opens on the one real photograph in the whole product — a lone yellowwood
> at sunrise — and never leaves that photograph's own colour world for the rest of the
> session. The category default this refuses: a warm neutral "app dark mode" base that treats
> the hero photo as decoration bolted onto an unrelated system.
> OWN-WORLD: every dark surface in this file is a real sampled hue from the photo's own sky
> (deep indigo-purple, `PIL.Image.getpixel`, not eyeballed), never a warm brown/black. One
> accent, the photo's own sun core, carries every pressable action. No second hue competes
> with it.
> STORY: a lone yellowwood at dawn — the whole session, every screen, looks lit by the same
> sky the hero photo shows once.
> FORM: pinned by direction, not rolled — Persuade mode, Full-palette colour strategy (purple
> base + orange accent, both at page scale).

This **replaces** the brown/bitumen Painted Signboard system below, per explicit direction:
*"let's move away from the brown and orange and yellow theme of the previous hustler
template, we need to use sunrise theme for now on... I don't want to see brown or black."*
Painted Signboard's own reasoning — legible, worn, one hot accent, condensed caps sized to be
read from across a road — is **preserved structurally** (the enamel stripe, the stamped
corner-flag selection, condensed Anton display, the 3px hard button edge); only the *hue
family* moves, from a warm brown/orange bitumen ground to a real sampled indigo-purple sky
with the same photograph's own orange sun as the accent. The mechanism these tokens carry is
unchanged; the color evidence they're drawn from moved from "township enamel paint" to "the
one photograph already in the product."

**Confirmed anti-reference (both eras):** the shipped build's cool `#0B1724` navy dashboard
with `#162130` cards, Inter, emoji icons, and 10px micro-caps — a 2021 crypto admin panel
carrying none of the world the writing establishes. Also now anti-reference: this file's own
prior brown/bitumen ground, which the product owner explicitly rejected in favour of the
sunrise world above. Do not polish either; the sunrise world is what ships.

## Colors

**Superseded 2026-08-04.** Everything below this line described the brown/bitumen Painted
Signboard palette and its later purple-atmosphere amendment. That amendment (the paragraph
that used to open this section, "one accent role orange plus one atmosphere role purple") is
now **absorbed and generalised**: purple is no longer a secondary "atmosphere-only, hero-only"
role bolted onto a brown base — it *is* the base, everywhere, all the time. The rule it
established still holds exactly: **orange owns every pressable action, purple owns
everything else, and the two never compete as accents on the same element.** Only the scope
changed, from "the hero panel and its background wash" to the whole product.

**v2, 2026-08-04.** The first sunrise pass sampled the photo's *darkest* pixel (the top-left
corner) and read back as "dark app mode with a purple tint," not sunrise — correct hue, wrong
depth. Every dark surface below is now sampled from the upper-right sky band instead: real
mid-sky violet-blue, clear of the sun's glow, still `PIL.Image.getpixel`, still never
reconstructed from memory. `ink` and its ramp are indigo-purple by construction: the B channel
is equal to or above R at every step, which is what rules out brown returning by accident
later. This is a real, distinctly lighter ramp, not a tint adjustment — every text pairing
below was re-measured against it, and `bone-quiet` had to move (see below).

| Token | Value | Role |
|---|---|---|
| `ink` | `#3E3050` | Page base. Mid-sky indigo-violet — **not** brown, **not** pure `#000`, **not** the old near-black `#1B1626`. Also the text colour on any accent fill. |
| `surface` | `#473456` | Cards, boards, panels. |
| `surface-raised` | `#4C3A57` | Controls sitting on `surface` — steppers, tags, mode buttons. |
| `surface-warm` | `#5A415C` | The resume/interrupt bar, the tree panel's fallback gradient. This one **is** the literal sampled pixel, not a derived tone. Solid or gradient, never translucent behind text. |
| `hairline` | `#6B5678` | All borders. |
| `bone` | `#F5F0FA` | Primary text. 10.74:1 on `ink`. |
| `bone-muted` | `#C9BFE0` | Secondary text. 6.89:1 on `ink`. |
| `bone-quiet` | `#C4B8DB` | **The muted floor.** Was `#9A8FB8` (5.88:1 on the old, darker `ink`) — that value fell to 2.98:1 against the new, lighter `surface-warm`, a real WCAG failure. Lightened to clear 4.79:1 against the lightest step in the new ramp. Nothing goes quieter than this. |
| `enamel-orange` | `#F2941C` | The single accent — the photo's own sun core. 5.18:1 against `ink` (was 7.59:1 against the old, darker `ink` — still clears AA). |
| `enamel-orange-hi` | `#FDB74D` | Light stop of the accent gradient. 6.92:1 against `ink`. |
| `enamel-orange-lo` | `#C97012` | **Borders and hard shadow offsets only.** 3.33:1 against `ink` — never put `ink` text on it; it was never meant to hold text contrast. |
| `sign-yellow` | `#FFC98A` | The stripe motif and the focus ring. Never body text. |
| `survive-green` | `#6FBF73` | Positive game state (points fully spent, day survived). |
| `bad` | `#E2453C` | Risk and loss state — **stripes, borders, fills. Never text.** |
| `bad-text` | `#FA9086` | The readable loss colour. Was `#EE6B60`; re-measured at 4.96:1 / 4.58:1 against `surface` / `surface-raised` — the two surfaces a ledger or result view would actually use. Falls to 4.01:1 against `surface-warm`, which is fine: `surface-warm` is scoped to the resume bar and tree-panel fallback, never a place loss text is read. |

`dusk-deep`/`dusk-mid`/`sun-core` (the amendment's original three tokens) are now plain
aliases — `dusk-deep = ink`, `dusk-mid = surface-warm`, `sun-core = enamel-orange` — kept only
so the leaf-drift system's own lighting code doesn't need to change when the base palette
does. Reach for `ink`/`surface-warm`/`enamel-orange` in new code; the alias names exist for
the code that already used them.

**The loss colour is split, for the same reason the accent is.** This file previously
carried one `crisis-red: #E2453C` with no measured contrast. Measured against the v2 ramp, it
still fails as text — even worse than before, since the surfaces got lighter and closed the
gap. It is fine as a painted mark — the pivot-day rail in the ledger, a border, a stripe —
because nothing is read off it. Anything a learner reads uses `bad-text`.

### Secondary fills

These are not decoration; each is a measured pair carrying text, and each was previously
undocumented here while shipping in the prototype.

| Token | Value | Role |
|---|---|---|
| `tag-hot` / `tag-hot-fg` | `rgba(242,148,28,.16)` / `#FDCB8A` | The `Loud` signal tag. |
| `tag-risk` / `tag-risk-fg` | `#3a1d1a` / `#F09A94` | The `Spiky` signal tag — kept in the red family deliberately; risk/loss stays red regardless of which world owns the base palette. Border `#7d2620`. |
| `button-edge` | `#8A4C0C` | The primary button's hard 3px offset. Never a text or fill colour. |
| `wash-warm` | `#5A415C` | Top stop of the board's light wash gradient — same value as `surface-warm`. Behind nothing that is read. |
| `gain-inflight` | `#8FE093` | The damage-number popup on a positive day, and only there. `survive-green` measures 5.38:1 on `ink` sitting still on a card; a figure that is simultaneously scaling, moving and fading needs more headroom than a static one, so the popup uses a lifted step (7.60:1 on `ink`, 5.21:1 on the warmest surface it can cross). Never used for a static label — `survive-green` still owns those. |
| `daycard-warm` | `#6B4630` | Last stop of the day-card curtain gradient only (`ink → surface-warm → daycard-warm`), reading as the sunrise the hero photo opens on. `bone` measures 7.36:1 against it and `sign-yellow` clears it comfortably; nothing else is ever drawn on this value. |

**The gradient rule that bit us.** `ink` text sits on the accent gradient, so **both stops
must clear 4.5:1 against `ink`.** The first draft used `enamel-orange → enamel-orange-lo`;
the dark stop measured 3.28:1 and failed. The shipping pair is
`enamel-orange-hi → enamel-orange`. Checking only the light stop of a gradient is how the
original build shipped a 1.15:1 primary button.

**Never use a translucent fill behind text.** The resume bar was originally
`rgba(226,87,30,.2)`; its real contrast was unknowable to both the eye and every automated
checker. Solid colours only where text sits.

## Typography

| Role | Face | Notes |
|---|---|---|
| Display / Headline / Title | **Anton** | Uppercase, `letter-spacing: -0.01em`, `line-height: 0.94`. The signboard voice. Fluid via `clamp()`. |
| Body | **Archivo** | 400/500/600/700. `text-wrap: pretty` on paragraphs, `balance` on headings. Measure capped at `62ch`. |
| Numeric | **JetBrains Mono** | All money and all counters. `font-variant-numeric: tabular-nums` so figures don't jitter as cash changes. |

**Hard floors, non-negotiable:** body **16px**, labels **12px**. The shipped build put 87 of
~144 declarations at ≤13px and 25 at 10px; that is the labelling layer — Demand, Competition,
Cost — the player is asked to compare numbers they cannot read.

Labels are `0.75rem / 600 / 0.14em` uppercase. Do not go to 10px to fit more in; cut words.

### The ramp

`typography.scale` in the frontmatter is the enumerated ramp. **Every literal `font-size`,
and both endpoints of every `clamp()`, must land on a step.**

| Step | rem | px | Used for |
|---|---|---|---|
| `xs` | 0.75 | 12 | Labels, table headers, tags. The floor. |
| `sm` | 0.875 | 14 | Secondary and hint text under a body line. |
| `base` | 1 | 16 | Body. Also table cells — data is read, not skimmed. |
| `md` | 1.125 | 18 | Lead paragraph, event description. |
| `lg` | 1.25 | 20 | Small title. |
| `xl` | 1.5 | 24 | Section heading, brand mark, money figures. |
| `2xl`–`7xl` | 1.875 / 2.25 / 2.625 / 3 / 4 / 7.5 | 30–120 | Anton display sizes and `clamp()` endpoints. |

**This ramp is a correction, not a description.** The prototype had accumulated **17 distinct
fixed sizes**, six of them — `.85 .86 .88 .9 .92 .95rem` — inside a 1.6px band no eye can
tell apart. 37 declarations were snapped onto the scale above. Six of those were `.95rem`
body copy in the ledger, which went **up** to 16px and now honours the body floor this
document already stated. If a new size seems necessary, the answer is almost always weight,
colour, or space instead.

## Layout

- **Container** `min(100% - 2rem, 1180px)`, centred.
- **Real breakpoints**, not a single fixed column: `640px` (mode cards go 2-up), `680px`
  (opportunity grid 3-up), `720px` (stepper shows labels), `780px` (stat grid 2-up), `900px`
  (landing splits asymmetric). The shipped build has **zero** `@media` queries and a single
  `max-width: 440px`, which wastes ~66% of a 1280px viewport.
- **Asymmetry over symmetry.** The landing is `1.35fr / .85fr`, not equal columns. Avoid the
  three-equal-cards feature row entirely.
- `min-height: 100dvh`, never `100vh`.
- **Tap targets: 48px minimum, 52px for the paired steppers.** The shipped `−`/`+` are
  143×40 and sit as adjacent siblings — a one-handed mis-tap in a moving taxi.
- Fluid type via `clamp()`; no fixed pixel widths on content.
- **A responsive rule needs both halves.** The stage stepper had a `min-width:720px` block
  that laid the chips out for a word label, and nothing that hid the label below it. On a
  360px render the four names stacked as a third grid row inside a 32px square, 53.8px wide,
  and overlapped into `ProfiScan`. Whenever a breakpoint reveals something, write the rule
  that hides it in the base state — never rely on the element being absent by default.
- **Wide content scrolls inside its own box.** The ledger table is 548px at a 360px viewport;
  it sits in a `.ledger-wrap` with `overflow-x:auto`, so the page itself never scrolls
  sideways. Measured page overflow is **0px at 360 / 412 / 768 / 1280**.

## Elevation & Depth

Depth is **printed**, not glowing.

- `--shadow: 0 2px 0 rgba(0,0,0,.55), 0 18px 34px -20px rgba(0,0,0,.85)` — one hard offset
  suggesting a physical board, plus a neutral ambient drop.
- The primary button carries `0 3px 0 #8A4C0C` and presses down to `0 1px 0` on `:active`.
  That hard coloured offset is the *edge* of a painted sign, not a halo.
- **Banned: chromatic glow.** No zero-offset coloured `box-shadow`, no accent-tinted blur on
  a dark background. It is the default "cool" tell of generated UI and the detector flags it.
- Grain: a fixed `feTurbulence` SVG overlay at `opacity: .32`, `mix-blend-mode: overlay`,
  `pointer-events: none`. Two wide radial washes behind everything so the base is never a
  flat fill.

## Shapes

- Radii `1 / 2 / 4 / 10 / 18 / 99px`. Tighter inside, softer on containers. Do not apply one
  radius to everything. `1px` and `2px` exist only to knock the corner off a painted mark —
  the skewed brand slab, a stripe cap — where a 4px radius would read as a rounded button.
  `99px` is the pill, used only where a shape must read as a token rather than a control.
- **The enamel stripe is the one recurring motif.** A `::before` pseudo-element,
  8–10px wide, full height, filled with
  `repeating-linear-gradient(180deg, enamel-orange 0 26px, sign-yellow 26px 52px)`.
  It marks the board, the points pool, and the resume bar.
- **Do not use an accent left-border on cards.** A thick coloured border on one side is the
  single most recognisable tell of AI-generated UI, and the detector flags it as `side-tab`.
  The stripe pseudo-element is the authored replacement — it carries two colours and a
  rhythm, which a `border-left` cannot.
- Selection state is a **stamped corner flag** (`✓ chosen`, filled accent, squared into the
  card corner), not a coloured rail.

## Components

**`button-primary`** — `ink` on the `enamel-orange-hi → enamel-orange` gradient, 56px tall,
hard 3px offset shadow. Hover lifts 2px and brightens 7%; active presses to `translateY(2px)`
and collapses the offset.

**`button-primary` disabled** — transparent with a 2px dashed `hairline` border and
`bone-quiet` text (5.4:1). **The disabled label must state the unmet condition**, e.g.
"Spend 12 more points", not a near-invisible restatement. The shipped build's disabled CTA is
1.76:1 and is the worst genuine contrast failure in the app.

**`stepper-control`** — 52×52, `surface-raised`, inverts to accent-on-`ink` on hover, scales
to `.94` on press. Always `aria-label`ed with the stat name and direction.

**`card` / `board`** — background and spacing carry the hierarchy. No border-plus-shadow-plus-
background stack. The board additionally carries the stripe and a 5% top light wash.

**Opportunity cards must differ before they are scanned.** The shipped build renders five
byte-identical "Unknown Opportunity" placeholders, which makes the first tap a coin flip
inside a stage whose whole premise is market research. Each carries a place name, a signal
tag (`Loud` / `Steady` / `Spiky`), and a one-line teaser.

**`ledger` — the result screen.** The ending is the **run itself, replayed**: one row per
trading day carrying day, event, choice, rand delta and running cash. The worst single swing
is marked as the pivot day — and named again in prose beneath the table. Table cells are
`base` (16px), headers `xs` (12px), all money `tabular-nums`. The table is wider than a
phone and lives inside a `.ledger-wrap` with `overflow-x:auto`. Catalogued as
`hustle-ledger` in `~/.claude/taste-vault/`.

> **Correction, 2026-08-03:** this section and the loss-colour note above both described
> the pivot mark as "a 6px `bad` rail against the row." Sampled with `getComputedStyle` on
> the real render, the pivot row's `border-left`, `box-shadow`, and `background` are all
> `none` — no rail exists. The actual mechanism is simpler: the pivot day's own number cell
> switches from `bone-quiet` (`#A89480`) to full `bone` (`#F5EDE3`), nothing else changes.
> Prose described a mark that isn't there; the render is correct, the doc wasn't.

**Do not summarise a run as three number tiles.** It is the same three-equal-cards shape
banned in Layout, and it throws away everything the player actually did in order to print
three figures they cannot act on. A learner who cannot say *which day* cost them the run has
not been taught anything. Show the days.

**Archetype picker — fanning card stack, revised 2026-08-05.** Replaced the scroll-snap
carousel with the taste vault's `card-stack-fan` pattern, but adapted: the fan plays once as
a staggered entrance (`arch-fan-in`, 70ms/card, each card landing on a small permanent tilt
via a `--tilt` custom property) and the cards then **settle into a static grid** — no
ongoing collapse/re-fan interaction. The original scroll-snap choice existed specifically to
avoid a spring-physics fan mis-registering a tap on cheap Android; keeping the physicality in
the arrival only, never in a repeatable gesture, keeps that guarantee while still using the
fanning pattern. `.mode.arch-card:hover/:active/[aria-pressed]` compose with `var(--tilt)` at
higher specificity than the shared `.mode` rules, so Learn/Play's own hover motion is
untouched.

**Scanner — browsed as a portfolio, revised 2026-08-05.** `.scan-grid` is now a horizontal
scroll-snap carousel (dots synced on scroll, same technique the archetype screen used to
run) rather than a static grid — unlike the one-time archetype pick, this screen is tapped
repeatedly (scan, then commit), so a carousel that stays browsable the whole time is the
right fit, not just an entrance. Each opportunity also carries a small line-icon
(`.spot-icon`, `currentColor` stroke, `--accent`) — a drawn glyph, not a photo: no real
photography of these five spots exists in this repo, and this project's standing rule is
never to invent or hotlink a placeholder for an image nobody has actually seen.

**Play mode's lesson, made real, 2026-08-05.** The mode-choice copy has always promised
lessons stay "on tap" in Play mode; the implementation only ever showed them in Learn mode
and hid them outright otherwise — a promise the code didn't keep. Fixed with
`.reveal-lesson-btn`, a quiet dashed-border secondary action (echoing the disabled-CTA
vocabulary already in this system) that reveals the same `.lesson` block on tap.

**`stamp` — the delight motif, added 2026-08-05.** A real ink-stamp mark (`3px solid
currentColor` rectangle or circle, `stamp-punch` keyframe: rotate -11deg/scale 1.4/opacity 0
→ rotate -3deg/scale 1/opacity 1, 460-500ms) extends the signboard's existing physical
grammar — the enamel stripe, the stamped `✓ chosen` corner flag — to the three moments that
carry real weight: **Stage 1 locked** (`.stamp.accent`, "Locked in", beside the Scanner CTA),
**a trading day closed** (`.stamp.good`/`.stamp.bad` by cash delta, inside the Stage 4
outcome block, fresh DOM node per day so the punch replays naturally), and **the final
verdict** (`.verdict-stamp`, a circular variant, tier-coloured, one word per band —
`Business Boss` / `Sharp Op` / `In Training` / `Try Again`). Never a toast, never confetti —
this is the product's own vocabulary, not a borrowed one.

> **Placement correction, 2026-08-05:** the first pass anchored `.verdict-stamp` to the
> verdict title's own box (`position:absolute; right:-.6rem`). Long titles like "Back To The
> Drawing Board" run close to the board's full width, so the last letters collided with the
> stamp circle — real text, wrong anchor. Fixed by moving the stamp into a `.end-head` row
> beside the kicker, entirely clear of the title, and dropping the absolute positioning.
> Anchor a corner mark to a short, fixed-width sibling — never to a text box whose length
> varies with content.

**`momentum`/`plan-strength` — live qualitative signals, added 2026-08-05 (ROADMAP Phase 1).**
A word (`Shaky`/`Building`/`Solid`/`Strong`) plus a `scaleX` bar, reusing the same `.bar`
mechanism Stage 1's stat allocation already established. Deliberately qualitative, not the
raw `crisisScore`/`planScore()` number — showing the literal score would let a player
min-max a mechanic meant to reflect judgment, not arithmetic. This is the fix for the
2026-08-05 critique's P1 finding that scoring was invisible until `finish()`.

**Mode-toggle**, added 2026-08-05. A small pill button (`.mode-toggle`, 36px tall, outline
style, never competing with the accent CTA) in the persistent header, hidden pre-game via the
same `#topHeader.pre-game` mechanism the stage stepper already used. Makes the Mode screen's
"you can switch later" copy true instead of a dead promise.

### The game layer (2026-08-05)

Five devices, each attached to a moment the engine already treats as significant. None is
decoration looking for a home, and every one is a *no-op* when `gsap` is absent or
`prefers-reduced-motion` is set — the state change each decorates happens independently, so
the game is fully playable and fully legible with the whole layer inert. GSAP is vendored at
`prototype/vendor/gsap.min.js`, never a CDN: on prepaid data, a CDN fetch is a way for the
game to simply not work.

**One animation library, not two.** anime.js was removed the same day GSAP landed. Once GSAP
covered every call site, anime.js was 118KB of dead fallback — roughly 40% of the page weight,
on exactly the connection that can least afford it. Two libraries animating the same
`opacity`/`transform` also visibly jitter, so keeping both was never free. Rule: when a new
motion dependency subsumes an old one, delete the old one in the same pass; a "fallback" nobody
exercises is just weight.

| Device | Where | Rule |
|---|---|---|
| **Thumb dock** | Stages 1–4 | `position: sticky; bottom: 0`, bleeding to the screen edge, padded past `env(safe-area-inset-bottom)`. The stage's one real action is never out of thumb reach at any scroll position. Deliberately **not** applied to the Ending's row — that board is `overflow: hidden`, where sticky is inert, and the Ending is a read, not a play. |
| **Damage number** | Crisis resolve | The real `cashChange`, thrown from the element that changed, born 52px clear of it so both stay readable. Never an invented score. |
| **Day card** | Between trading days | A full-bleed curtain wipe; the screen underneath is swapped **while covered**, so a render is never seen half-built. |
| **Streak** | Crisis HUD | Consecutive good calls, named while you are still in them. "Good" is the day's own best-available score or within one point of it — the deck's numbers decide, never a threshold invented in the view. Days with no decision are neutral: they neither build nor break a streak, because nothing about them was a call you made. |
| **Verdict burst** | Ending | Enamel-coloured chips from the stamp, on tier 1–2 only. A run that went broke never gets one — a burst over "Back to the Drawing Board" would be lying to the player. |

Screen shake scales with the loss *relative to what you are holding*, so a R150 knock on
R4,000 barely registers and a R900 one on R1,000 nearly throws the screen. Haptics
(`navigator.vibrate`) fire only off a decision the player just made, never ambiently.

**The meter bug this layer exposed.** `crisisFrac()` normalised the live momentum meter
against the range of all fourteen days, so one good opening day measured against fourteen
days of headroom pinned the bar near empty and printed **"Shaky" over a day the player had
just won**. Fixed by giving `crisisRange(upto)` a limit and grading the live meter on days
actually played; the Ending still grades against the full run. A progress signal must be
normalised against what has happened, not against what could still happen.

**`.forces` — the five-forces readout, added 2026-08-05 (ROADMAP Phase 2).** Five rows,
three segments each, filled toward *this one squeezes you*: green at 1, accent at 2, `bad` at
3. Two of the five (`rivalry`, `buyers`) are read straight off the shipped bundle's own
`comp`/`demand` data; the other three are authored per opportunity, and **every authored row
prints the judgement it rests on underneath itself** so nothing reads as a number the game
measured when it is really a call somebody made. The framework is named once, after the first
spot has been read — never as a definition ahead of the evidence.

**Focus** — `3px solid sign-yellow`, `outline-offset: 3px`, on `:focus-visible` for every
interactive element. The shipped bundle has zero `:focus` and zero `outline` declarations.

**Motion** — 200ms `cubic-bezier(.2,.7,.3,1)`. Animate `transform` and `opacity` only; the
stat bars use `scaleX` with a left origin, never `width`. Everything collapses to 0.001ms
under `prefers-reduced-motion: reduce`.

## Do's and Don'ts

**Do**

- Check **both** stops of every gradient that has text on it.
- Keep one accent *role* per surface. If something needs to stand out and orange is taken,
  use size, weight, or space — not a competing hue. Purple (`dusk-deep`/`dusk-mid`) is
  atmosphere, not a second accent, and orange still owns every pressable action even on a
  purple ground.
- Use `tabular-nums` for every rand figure and every counter.
- Give the disabled state an honest label naming what is missing.
- Persist to `localStorage` on every state change and push a history entry per stage. On the
  target device a lost run is a lost lesson.
- Gate heavy media behind an explicit tap. The poster is the default; the video is opt-in.
- Write one `h1` per screen and a real heading hierarchy under it.

**Don't**

- Don't use `#FFF`, `#000`, brown, or a warm neutral. Every dark surface in this system is
  indigo-purple, sampled from the sunrise photo's own sky — check the B channel is equal to
  or above R before adding a new dark token, or brown returns by accident.
- Don't put an accent `border-left` on a card.
- Don't emit a coloured glow shadow.
- Don't animate `width`, `height`, `padding`, or `margin`.
- Don't drop text below 16px body / 12px label to make something fit.
- Don't use emoji as the icon system. They render differently across Android versions and a
  screen reader narrates them verbosely.
- Don't put text on a translucent background.
- Don't pre-solve a stage. Stage 1 opens at 2/2/2/2 with 12 points to spend, so the `+`
  control the tutorial describes is actually live.
