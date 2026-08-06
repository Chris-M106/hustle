# HUSTLE research wiki

Curated research feeding HUSTLE's design and roadmap — so a future session (or a future
collaborator) can pull a finding instead of re-searching it. Read this index, then open the
page whose hook matches what you're working on. Each page carries its own sources and a
"HUSTLE application" section mapping the research to a concrete mechanic proposal — this is
meant to be actionable, not just a reading list.

## Topics

- [Low-literacy & low-end-Android constraints](low-literacy-low-end-android.md) — RAM/data/reading-
  level constraints that bind before any other design decision. Pull this first for any visual or
  copy work; it sets the budget everything else spends against.
- [Competitive teardown](competitive-teardown.md) — named products (business-sim games, African-
  market fintech-literacy apps, low-end-Android onboarding) torn down for what to steal and what to
  refuse. Pull this before designing a new mechanic or onboarding flow.
- [Porter's Five Forces & strategy simulations](porters-five-forces-and-strategy.md) — how
  business-strategy sims teach competitive analysis experientially; HUSTLE's Scanner already
  has 2 of the 5 forces, unlabeled. Pull this when working on Stage 2 (Scanner) depth.
- [Engagement mechanics: streaks, battle passes, loyalty design](engagement-mechanics.md) —
  Duolingo's streak, Idle Miner Tycoon's battle pass, gamified-loyalty retention data, and
  what NOT to copy (monetization/FOMO) for this audience. Pull this for any "make it more
  hooky" ask.
- [Daily-loop design: prepare, act, reflect](daily-loop-design.md) — Stardew Valley's
  plan→act→consequence rhythm, applied to restructuring Stage 4's flat event-loop into three
  beats. Pull this when reworking Crisis pacing.
- [Financial literacy education games — comparable products](financial-literacy-education.md)
  — EVERFI (FutureSmart, Stock Market Game), the closest real cousin to HUSTLE's actual
  deployment context (facilitated classroom, standards-aligned). Pull this for anything about
  educational validity or comparable products.
- [Marketing & customer retention mechanics](marketing-and-customer-retention.md) — why
  "good product" alone doesn't explain repeat business, and how to make marketing a real
  budget tradeoff instead of a lecture. Pull this for Stage 2/3 marketing-concept work.
- [Decision journal & delayed feedback loops](decision-journal-and-feedback-loops.md) — the
  connective mechanic across everything else here: HUSTLE already logs every decision
  (`state.log`), it just never resurfaces the log until the very end. The single
  highest-leverage fix from this whole research pass. Pull this first for almost any
  "make it feel like a game" or critical-thinking work.

## How this wiki started

Written 2026-08-05 after a hard `/impeccable critique` (see
`.impeccable/critique/2026-08-05T11-29-31Z__prototype-hustle-shell-html.md`) found that
HUSTLE's Stage 1 archetype/stat choices are write-only and scoring is hidden until the
Ending — the mechanical cause of Chris's "reads like a simulation inside a webpage, not a
game" reaction. Chris then asked to research comparable products (business-sim games,
financial-literacy platforms, engagement-mechanic design) and turn findings into a
standing reference rather than re-deriving them each session. See `../ROADMAP.md` for how
these findings turn into planned work.

## Maintenance

- Add a new page per topic, not per search query — a topic with 2 sources and 3 with 20 are
  both one file.
- Every page needs a "HUSTLE application" section. A page of pure links with no mapping back
  to this product isn't pulling its weight here.
- Update this index's one-line hooks whenever a page's scope changes enough that the hook
  would mislead.
