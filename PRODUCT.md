# PRODUCT.md — HUSTLE

> Written 2026-08-01 from an audit of the deployed build at
> <https://hustle-simulation.netlify.app/>. **No source repo was available**, so every
> statement below is derived from the live app's copy, DOM, and shipped JS bundle, or from
> the framing on the landing page. Items marked **[assumed]** were not verifiable and need
> confirmation from whoever owns the curriculum.

## What it is

A browser-based simulation game that teaches new venture creation. The player is an
unemployed youth in KwaDream, a South African township, starting with **R2,500**. The game
runs four stages:

1. **Build your hustle profile** — allocate 20 points across Innovation, Finance IQ, Sales
   Power, Network Score.
2. **Scan for opportunities** — survey five local business options, read Demand /
   Competition / Cost, commit the R2,500 to one.
3. **Write your business plan** — a five-section guided plan, graded.
4. **Survive the cash flow crisis** — 14 trading days of events (load shedding, late
   suppliers, customers paying next week). Four possible endings.

Stat choices in stage 1 gate what the player can see in later stages (verified in the
bundle: `network>=7`, `finance>=7`, `sales>=7` each unlock an extra insight). Choices
compound across all four stages.

## Who it is for

**Primary — the learner.** An unemployed South African youth enrolled on an NQF Level 2 /
SAQA 49648 New Venture Creation learnership. Assume:

- A **low-end Android phone**, not a laptop. The OS kills backgrounded tabs aggressively.
- **Prepaid mobile data**, paid for by the learner. Megabytes are money.
- Possibly a **shared device** passed between learners in a classroom.
- First-time exposure to business vocabulary. The game's own Learn Mode assumes this.

**Secondary — the facilitator.** Runs a cohort through it in a fixed period. **[assumed]**
Constraint worth designing to: ~30 learners, a handful of shared handsets, a 45-minute
period. Nothing in the current build survives a device being handed to the next learner.

## What success looks like

- The learner **finishes a run.** Learn Mode is stated on the landing page as 25–40 minutes;
  Play Mode 12–18. A run that dies at minute 30 teaches nothing.
- The learner can **explain why they failed or survived** — the four endings are written to
  make failure instructive, not shameful.
- A facilitator can run a cohort through it **inside one period, on shared hardware.**

## Constraints that actually bind

| Constraint | Consequence for design |
|---|---|
| Prepaid data | Total payload is a cost to the user. The current landing page spends ~1.27 MB before the learner has chosen anything, 90% of it an autoplaying video. |
| Low-end Android, tabs killed | Any run longer than a few minutes **must** persist. The current build stores nothing. |
| Shared classroom device | Needs either per-learner save slots or a fast, deliberate reset. Currently the second learner's session destroys the first's. |
| Daylight, cheap LCD | Contrast cannot be decorative. The current build has 32 genuine sub-4.5:1 text failures and a primary CTA at 1.15:1. |
| Institutional accreditation (NQF/SAQA) | An accessibility review is plausible. The current build has zero `aria-*`, zero `role`, one heading element total, and no visible focus. |
| Spreads by WhatsApp **[assumed]** | Link previews matter. No `og:` tags, no description, no favicon currently. |

## Brand personality

The **writing already has a voice and it is the best thing in the product.** It is specific,
unsentimental, and local: shisanyama, spaza row, "Stage 4 Load Shedding", "15+ traders at
the same market", tournament weekends cracking phone screens. The commit button rewrites
itself to carry the stakes — `Choose Phone Repair →` becomes `CHOOSE ANYWAY →` when the
player has under-scanned, and `TAKE THE RISK →` on a card graded Risky.

Voice rules derived from that copy:

- **Plain, direct, second person.** "You have R2,500 and a dream."
- **Never patronising, never cheerful about hardship.** The failure ending reads "Every
  entrepreneur fails before they win. The lessons are all there — go back and apply them."
  Keep that register.
- **Local nouns, not generic ones.** "Load shedding", not "power outage". "Spaza", not
  "convenience store". Rands with the R prefix, always.
- **The interface should sound like the copy.** It currently does not.

## Known product-truth open questions

- **The crisis length is contradictory in the shipped build.** The header renders `DAY 1/14`,
  the tutorial says "Seven trading days in KwaDream", and the footer computes days remaining
  off a hardcoded `7`. The bundle contains 210 day entries (5 businesses × 14 days × 3
  fields). Either the header lies or days 8–14 are authored and unreachable. **Unresolved —
  needs the source.**
- Is the classroom the design target, or an assumption? **[assumed]** throughout above.
- Is there a facilitator dashboard or cohort reporting requirement? Not visible in the build.

## Anti-reference

The shipped interface — a cool `#0B1724` navy dashboard with `#162130` cards, one amber
accent, Inter, and emoji as the entire icon system — reads as a generic 2021 crypto or
fintech admin panel. It carries none of the world the copy establishes. Confirmed with the
owner on 2026-08-01 that this was **not intentional**, and that the visual direction should
be replaced rather than polished. See `DESIGN.md`.
