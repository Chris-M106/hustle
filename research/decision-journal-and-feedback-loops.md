# Decision journal & delayed feedback loops

> Written 2026-08-05, in response to: "in one round I took X decision that led to Y outcome
> that put me in a bad position... which let me get knowledge and take a better decision.
> Talking about critical thinking and reasoning — how to take good decisions?" This one is
> less a single external source and more a synthesis of what the other research pages already
> point at (EVERFI's self-reflection activities, the critique's own P1 finding), written up as
> its own topic because it's the connective mechanic across almost everything else here.

## The core idea

HUSTLE already logs everything needed for this: the Ledger (`state.log`) records day, event,
choice, cash delta, and running cash for every single day played. The gap the
`/impeccable critique` run on 2026-08-05 found is that **this record is only ever shown once,
at the very end** (the Ending's ledger-replay table). A player who made a costly decision on
Day 3 doesn't reconnect it to its consequence until Day 14 is already over — critical
thinking about *why* a choice was good or bad has nowhere to attach itself during play.

EVERFI's research-validated design leans on "game-based problem-solving **and self-reflection
activities**" together, not problem-solving alone — the reflection half is what's currently
missing from HUSTLE's Crisis loop.

## The mechanic: Field Notes

A short, specific callback that fires every 3-4 days during Stage 4, referencing a real
earlier entry in `state.log` and connecting it to what just happened:

> "Day 3 you skipped the generator rental to save cash. That's part of why today's
> load-shedding event hit twice as hard."

This is not a new content-authoring burden — the connective tissue can be templated
generically off fields the log already has (day number, event title, choice label, delta),
with a handful of authored connector phrases for the highest-signal pairings (e.g., any
Stage 2 under-scan choice reconnected to a Stage 4 event that specifically punishes it).

## Why this is the single highest-leverage fix from the whole research pass

Every other topic in this folder — Porter's forces, budgeting, marketing — teaches a
*concept*. Field Notes is what makes any of those concepts *stick*, because it's the
mechanism that turns "you made a choice and a number changed" into "you made a choice, here's
why it mattered, and here's what to do differently." Critical thinking is trained by
reflection-on-action, not by the action alone.

## HUSTLE application

- Fold this directly into the "close the day" beat proposed in `daily-loop-design.md` — it's
  the actual content of that beat, not a separate feature.
- Directly closes the critique's P1 finding ("Crisis and Plan hide the running score for the
  entire game") — a Field Notes callback IS a partial, narrative form of live scoring
  feedback, delivered as story rather than a number.
- Could extend to Stage 3 (Plan) too: if a plan answer turns out to matter for a specific
  Crisis event, call that back explicitly ("Your plan said you'd handle a supplier
  no-show by X — that's exactly what happened on Day 7").

## Sources

This page synthesizes findings already cited in `financial-literacy-education.md` (EVERFI's
self-reflection-activity design) and the persisted critique report at
`.impeccable/critique/2026-08-05T11-29-31Z__prototype-hustle-shell-html.md` (the P1 finding
this mechanic directly answers). No new external sources searched for this page specifically
— worth a dedicated search later on "spaced repetition" / "retrieval practice" learning
science if we want to ground the timing (every 3-4 days) in something more rigorous than
intuition.
