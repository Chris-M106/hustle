# DAYLIGHT-RAMP.md — the progressive dawn→day bridge

> Status: **mechanism decided, not yet built.** Written 2026-08-06 to close Open Decision #1 from
> the 2026-08-06 handoff. Fold into `DESIGN.md` once shipped; until then `DESIGN.md` stays accurate
> to shipped code and this file is the spec.

Chris chose **progressive** over a single switch at commit, knowing it was the more expensive
option. This document is the *how*. It exists because the obvious implementation is measurably
wrong, and that needed proving before any CSS was written.

## The finding that changes the design

The handoff proposed warming `--ink`, `--surface`, `--surface-2`, `--surface-warm` across the 14
days. The direction of "dawn → day" implies those surfaces get **lighter**. But the Sunrise world is
light-text-on-dark-surface. Lightening the surfaces closes the gap against every text token, so
contrast *falls* as the day count rises — the ramp's own success condition destroys its legibility.

Measured, against the real shipped token values in `prototype/hustle-shell.html:53-73`:

| Text token | on `--ink` | on `--surface` | on `--surface-2` | on `--surface-warm` |
|---|---|---|---|---|
| `--text` `#F5F0FA` | 10.74 | 9.89 | 9.13 | 7.98 |
| `--text-2` `#C9BFE0` | 6.89 | 6.34 | 5.86 | 5.12 |
| `--text-3` `#C4B8DB` | 6.44 | 5.93 | 5.48 | **4.79** |

`--text-3` on `--surface-warm` is the binding constraint at **4.79:1** — 0.29 of headroom above the
4.5:1 floor. Mixing each surface toward a warm midday tone until the worst text token breaks 4.5:1
gives the available range:

| Surface | max mix toward day before failure |
|---|---|
| `--ink` | 0.15 |
| `--surface` | 0.12 |
| `--surface-2` | 0.08 |
| `--surface-warm` | **0.02** |

Two percent. **A luminance-based ramp is not buildable on this palette.** This is the same class of
error `DESIGN.md` already records — the original build shipped a 1.15:1 primary button by checking
only the light stop of a gradient — except here the *endpoint* fails, not merely a middle step.

## The mechanism

**Daylight is carried by hue and by artwork, not by surface luminance.**

### 1. One source of truth

A single `--daylight` custom property on `<html>`, `0` → `1`, driven from `state.day / DAYS()`.
Every warming token is a `color-mix()` against it. This is the handoff's own recommendation and it
survives: it keeps the Ending, the ledger and a **resumed save** all landing at the correct point of
the ramp for free. The per-stage-class alternative drifts and gets resume wrong. Rejected.

### 2. Constant-luminance hue rotation

Surfaces rotate violet → warm at approximately **flat relative luminance**. Dawn and day endpoints:

| Token | dawn (day 1) | day (day 14) | L dawn → L day |
|---|---|---|---|
| `--ink` | `#3E3050` | `#4A2F3A` | 0.0372 → 0.0379 |
| `--surface` | `#473456` | `#553541` | 0.0447 → 0.0486 |
| `--surface-2` | `#4C3A57` | `#5B3B44` | 0.0525 → 0.0577 |
| `--surface-warm` | `#5A415C` | `#6A4348` | 0.0673 → 0.0755 |

The world warms in *hue* — the violet drains out of it and the surfaces go toward a warm brown-rose —
while staying at the luminance the text tokens were measured against. That reads as the sun coming
up without inverting the polarity of the interface.

### 3. One required token change

Constant-luminance rotation alone still fails days 13–14 (`--text-3` on `--surface-warm` bottoms at
**4.47:1**), because that token had almost no headroom to begin with. Fix:

```
--text-3: #CBC0E0;   /* was #C4B8DB */
```

Worst case across all 14 days × 4 surfaces becomes **4.84:1**. Verified at every step, not just the
endpoints. Alternatives `#D0C6E4` (5.13) and `#D5CCE8` (5.43) also pass with more margin if the
lighter value reads acceptably.

Note `--text-3` has already been lightened once for exactly this reason — the file comment at line 62
records the old `#9A8FB8` falling to 2.98:1 on the then-new `--surface-warm`. This is the same
failure recurring, which is an argument for making the contrast check automated rather than manual.

### 4. Where the actual brightness lives

Since the chrome cannot brighten, the *perception* of daylight is carried by three things that have
no text on them and therefore unlimited range:

- **The ambient `body::before` wash** (`hustle-shell.html:121-127`) — `position:fixed`, `z-index:-1`,
  `pointer-events:none`. Nothing is ever read against it. Its three radial gradients ramp freely:
  the violet sky-top stop retreats, the two orange stops grow in radius and alpha.
- **The artwork.** Per `ASSETS.md`, stall art is generated at points along the dawn→day ramp. The
  market visibly fills and brightens. This is where the poster world's brightness actually enters
  the game — which is the whole point of Option C's bridge.
- **`--sign` and the stripe motif**, non-text by definition, free to warm.

### 5. Tokens that must NOT move

- **`--accent` `#F2941C`.** Orange owns every pressable action. If it drifts, "this is pressable"
  stops being a reliable signal. Frozen. (It also sits at 3.85:1 on `--surface-warm` already — fine
  for a non-text UI component at the 3:1 bar, but it has no room to give.)
- **`--good` / `--bad` / `--bad-text`.** State colours. `--bad-text` is 4.01:1 on `--surface-warm`
  and `DESIGN.md` already forbids it there; the ramp must not create new adjacencies that put it
  there.

## Reduced motion

A 14-day colour ramp is **not motion** and still runs under `prefers-reduced-motion` — a learner who
sets that preference should not be denied the narrative. But it must never *animate between* days:
under the query it is set to the correct value for the current day instantly, with the transition
duration zeroed. Deciding this deliberately rather than inheriting it, per the handoff.

The resumed-save case falls out of this for free: a save restored at day 9 sets `--daylight` to
`8/13` on load and is simply *at* the right value, with no catch-up animation, for every user.

## Verification required before this ships

1. Contrast at **every one of the 14 steps**, all text tokens × all surfaces — not just endpoints.
   The script that produced the tables above is the basis; make it a checked-in check, not a
   one-off, since this is the second time this exact failure has occurred.
2. `node ~/.claude/skills/impeccable/scripts/detect.mjs --json prototype/hustle-shell.html` — flags
   any colour not documented in `DESIGN.md`. Every endpoint above must be documented there first.
3. A real playthrough screenshotting days 1, 5, 9, 14 — shot at ~1200–1500ms, never ~700ms
   (`~/.claude/knowledge/debugging/headless-browser-capture-traps.md` Trap 6).

## Sequencing

Build this **after** the artwork exists, not before. The ramp's endpoints have to be chosen against
real art sitting on those surfaces. The hue endpoints in §2 are derived from contrast math alone and
should be re-judged by eye once stall art is in.
