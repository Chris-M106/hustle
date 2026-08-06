# Porter's Five Forces & strategy simulations

> Researched 2026-08-05, in response to: "how to add Powel 5 laws" (Chris's phrasing —
> corrected here to **Porter's Five Forces**, Michael Porter's 1979 competitive-strategy
> framework). Goal: teach real strategic-analysis concepts through HUSTLE's Scanner stage
> instead of a lecture screen.

## The framework

Porter's Five Forces analyzes what determines competition and profitability in an industry:

1. **Competitive rivalry** — how hard existing players fight each other
2. **Threat of new entrants** — how easy it is for someone new to open next door
3. **Threat of substitutes** — how easily a customer solves the same need another way
4. **Bargaining power of suppliers** — how much your suppliers can squeeze your margin
5. **Bargaining power of buyers** — how much your customers can push your price down

## What the research found

Business-strategy simulations (Cesim, CompXM, university-level sims like "Global DNA")
already teach this framework experientially rather than didactically: a dashboard shows how
pricing, R&D spend, and marketing spend interact with competitor moves and buyer/supplier
power, and the player derives the framework from watching consequences rather than reading
a definition first. Simulations expose the five forces as *interacting systems*, not a
static checklist — the ways an industry's structure influences competition and profitability
show up as an emergent property of the decisions, not a labeled screen.

Marketing/R&D/operations spend tradeoffs are a first-class decision axis in these sims —
players see forecasting dashboards and ROI calculators before committing budget, not after.

## Where HUSTLE already has two of the five, unlabeled

The Scanner's `OPPS` data already carries:
- `demand` → proxy for buyer power / market pull
- `comp` (competition) → competitive rivalry, directly

Both are shown as plain HIGH/MEDIUM/LOW tags with no framework name attached.

## HUSTLE application

- **Name the framework the first time a player sees `demand`/`comp` together** — one short
  line, not a lecture screen: "Every spot you scan reads on the same five things that decide
  if any business survives — you're already looking at two of them."
- **Add the missing three as real fields on each opportunity**, sourced from or extending the
  existing `OPPS`/`TEASE` data:
  - *New entrants* — a spot with LOW barrier (cheap to copy, like the clothing stall) vs.
    HIGH barrier (the phone-repair kiosk's "technical barrier protects you from easy
    copycats" line already gestures at this in the current `insight` copy)
  - *Substitutes* — how easily a customer solves the need another way (a spaza's goods
    are highly substitutable; a phone-repair skill is not)
  - *Supplier power* — tie directly to the Network stat's existing "buys you a lifeline
    when the cash runs dry" framing; make the number visible, not just flavor text
- **Let a mid-Crisis event exercise the force the player under-scanned** — if they picked a
  low-barrier spot without checking new-entrant risk, a "new repair kiosk opens two doors
  down" event should be more likely to fire for that business specifically, so the
  consequence of skipping analysis is felt, not just described.

## Sources

- [Strategic Management – Porter's Five Forces – Business Simulation Literature](https://educationtrainingsociety.wordpress.com/2018/01/25/strategic-management-porters-five-forces-business-simulation-literature/)
- [How to Use Educational Technology - Business Simulation Games (Cesim)](https://www.cesim.com/blog/webinar-for-educators-how-to-teach-with-business-simulation-games)
- [The Five Competitive Forces: A Strategy Simulation Game (Bartleby)](https://www.bartleby.com/essay/The-Five-Competitive-Forces-A-Strategy-Simulation-FKPX2PPMZRFA)
- [Free Business Strategy Simulator: Porter's Five Forces & Competitive Analysis Tool](https://simulations4all.com/simulations/business-strategy-simulator)
