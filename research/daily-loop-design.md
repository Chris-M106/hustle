# Daily-loop design: prepare, act, reflect

> Researched 2026-08-05, in response to: "what to do at the beginning of each day, how to
> prepare myself for the day, and how to close the day." Goal: give Stage 4's 14 identical
> "read card → tap button → next day" turns an actual rhythm instead of a flat repeat.

## Stardew Valley's day loop

Wake, plan the day against a hard time budget, tend to tasks, explore, go to bed — repeat.
Players enter a **flow state** from the combination of a clear goal plus immediate feedback;
time-limited days force prioritization every single cycle, which is what keeps 14 (or in
Stardew's case, hundreds of) days from feeling like the same day repeated. The engagement
comes from the *plan → act → consequence* rhythm, not from new content volume — the loop
itself is the product.

## HUSTLE application

HUSTLE's current Crisis loop is one beat: event card appears → pick a button → cash delta
animates → tap "Next day." Stardew's loop suggests splitting this into three beats:

1. **Morning prep** (new, short, one tap) — before the event card, a quick check: cash on
   hand, stock/readiness level, and a one-line callback to yesterday's lesson if one exists.
   Doesn't need new mechanics to start — it can just surface state that already exists
   (`state.cash`, the previous day's `log` entry) in a dedicated beat instead of folding it
   silently into the HUD.
2. **The event** (existing) — read the card, pick a decision.
3. **Close the day** (extends the existing `.outcome`/`.lesson` block) — not just the cash
   delta, but the Field Notes callback described in `decision-journal-and-feedback-loops.md`:
   what changed, and why it traces back to an earlier choice.

This doesn't require new game content (no new crisis days need writing) — it's a
restructuring of the existing render sequence in `renderCrisis()` into three visible steps
instead of one.

## Sources

- [Stardew Valley: Player Engagement Done Right (Medium)](https://medium.com/@shakeebzacky/stardew-valley-player-engagement-done-right-7d25f9dc00e9)
- [Examining the design principles of living in Stardew Valley](https://deeprootdepths.substack.com/p/examining-the-design-principles-of)
- [A Critical Play of Stardew Valley (Game Design Fundamentals)](https://medium.com/game-design-fundamentals/a-critical-play-of-stardew-valley-c7ec30ef5070)
- [MDA: Stardew Valley – The Mechanics of Magic](https://mechanicsofmagic.com/2024/04/09/mda-stardew-valley-2/)

**Follow-up worth researching later**: the web search for this topic did not surface good
material specifically on *Papers, Please*'s day-bookend mechanic (stamp quota, end-of-shift
tally) — worth a dedicated search if we want that comparison specifically, since its
"quota you must hit, tallied at day's end" shape is arguably closer to HUSTLE's cash-survival
mechanic than Stardew's open-ended farming loop is.
