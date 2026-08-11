# ROADMAP: HUSTLE

> Living document. Started 2026-08-05, after a hard `/impeccable critique` on the prototype
> (score 31/40 — see `.impeccable/critique/2026-08-05T11-29-31Z__prototype-hustle-shell-html.md`)
> and a research pass into comparable games/apps (see `research/`). This is the point where
> there's enough surface area — critique fixes plus a real wishlist of new mechanics — that
> working without a plan would mean picking things in whatever order they got mentioned in
> chat. Update this file as phases complete or priorities change; don't let it go stale.

## Product and testing standard (added 2026-08-08)

**HUSTLE is a mobile application**, not a website — see `PRODUCT.md` → "Product target vs.
current implementation." Everything below that still says "prototype" or "the browser build" is
describing today's implementation stage, not the product's platform commitment; the final
mobile technology (native / React Native / Flutter / Capacitor / PWA) is an open Phase 4
decision, not something to infer from what the prototype happens to be built in.

**Every change to `prototype/hustle-shell.html` must be verified through the actual rendered
application, not source-code inspection alone** — see `TESTING.md` for the full standard
(Playwright/browser automation workflow, first-time-player probing, mobile interaction and
network testing, the real-device validation hierarchy). This isn't new practice — Phase 1, 2.5,
and the Sunrise `DESIGN.md` passes were already done this way — but it's now written down as a
required practice rather than an implied one.

## Where this stands right now

- `prototype/hustle-shell.html` — single-file vanilla-JS prototype, all 4 stages (Profile →
  Scanner → Plan → Crisis) plus landing/archetype/mode onboarding and an Ending/ledger screen.
  **This is prototype infrastructure for iterating on game design and visual system — not the
  final mobile platform.** See the product/testing standard above.
  Real game content (opportunities, plan questions, all 14 crisis days, lesson cards) ported
  from `prototype/build/`, which itself was extracted from the deployed bundle — nothing in
  Stage 2-4 is invented.
- Visual system: **Sunrise** (see `DESIGN.md`) — committed, documented, detector-clean.
- `hustle-simulation.netlify.app` — the separately-deployed production app this prototype is
  redesigning *toward*, not replacing directly; PRODUCT.md's original audit was of that build.
- **Key files**: `PRODUCT.md` (audience/constraints/anti-reference), `DESIGN.md` (Sunrise
  visual system) + its sidecar `.impeccable/design.json` (shadows/motion/focus/breakpoints),
  `research/` (this pass's findings), `.impeccable/critique/` (multiple runs — the
  2026-08-01 ones audited the *deployed bundle* before source access existed; the 2026-08-04
  and 2026-08-05 ones critique this prototype directly and supersede the bundle-era findings).
  Also read `~/.claude/knowledge/design/frontend-lessons.md` before UI work — anti-slop bans,
  contrast rules, motion rules, portable across projects.
- **Standing test environment built 2026-08-11** — Playwright harness (`package.json`,
  `playwright.config.js`, `tests/smoke.spec.js`), run via `npx playwright test`.
  Smoke-tier coverage only (launch/console errors, landing visibility, primary-CTA
  clickability) across the three-viewport matrix; 9/9 passing. Deeper per-stage journey
  coverage (archetype → Scanner → Plan → Crisis → Ending → persistence) is **not yet
  written** — extend as Phase 2 items below touch those stages. See `TESTING.md` →
  "Environment status" for detail, including a real bug the harness caught on its
  first run (an a11y skip-link false-positiving as the landing page's primary CTA).
- Known gap, confirmed by the 2026-08-05 critique: **the prototype looks authored but plays
  mechanically inert** — Stage 1's stat/archetype choices don't branch anything, and
  Crisis/Plan scoring is invisible until the very end. This is the throughline the next two
  phases exist to fix.

## Phase 1 — Make choices matter (critique fixes) — ✅ done 2026-08-05

Directly from the 2026-08-05 critique's P0/P1 findings. This was the prerequisite for
everything in Phase 2 meaning anything — no amount of new educational content matters if the
player still can't feel any choice's consequence until the Ending. Verified via Playwright +
detector, zero console errors.

- [x] Wire `state.stats`/`state.archetype` into at least one real branch each — done via
      finance/sales/network ≥7 Scanner insight unlocks (restoring the mechanic `PRODUCT.md`
      documents the original shipped build had) and an archetype-keyed closing line on the
      Ending screen
- [x] Surface a live signal during Crisis/Plan instead of hiding `crisisScore`/`planScore()`
      until `finish()` — a qualitative "Momentum" meter (word + bar, deliberately not the raw
      score) in the Crisis HUD, reusing `crisisFrac()`; a "Plan strength" meter in Stage 3
      computed from answered-so-far sections
- [x] Removed the always-visible `.note` dev-disclosure block entirely (HTML + its now-orphaned
      CSS)
- [x] Fixed the `#live` region — moved to a direct child of `<main>`, outside every `.screen`,
      so it's never inside a `display:none` ancestor regardless of active stage
- [x] Added a real mode-switch control (`#modeToggle`) in the persistent header, visible once
      past onboarding (same `.pre-game` hide the stage stepper already used) — the Mode
      screen's "you can switch later" claim is now true

## Phase 2 — Deepen the business education

Backed by `research/`. Each item links to the page with the full research + design detail.

- [x] **Name and complete Porter's Five Forces in the Scanner** — done 2026-08-05. `rivalry`
      reads `o.comp` verbatim and `buyers` is the inverse of `o.demand`; the other three
      (`entrants`, `subs`, `suppliers`) are authored per opportunity in a `FORCES` table, and
      **each authored row prints the judgement it rests on directly underneath it** so a call
      somebody made never passes as a number the game measured. Rendered as five three-segment
      pressure gauges plus an out-of-15 total. The framework is named **once**, after the first
      spot has actually been read — the research's own finding was that strategy sims teach
      this by letting the player derive it from consequences, not by opening with a definition.
      Two further hooks came free: `Network >= 7` really does take one step off supplier power
      (making the stat's "better supplier terms" promise true), and the commit hint plus the
      Ending's review both name the high force you are carrying, so the analysis is closed back
      to the outcome. → `research/porters-five-forces-and-strategy.md`
      - **Still open from that page:** letting a mid-Crisis event fire preferentially against
        the force the player under-scanned. The crisis decks are fixed authored data, so this
        needs deck work, not view work — it belongs with the 3-beat restructure below.
- [ ] **Real budget allocation** — split cash into a weekly/daily allocation decision
      (stock, marketing, buffer) instead of one undifferentiated pool.
      → `research/porters-five-forces-and-strategy.md`, `research/marketing-and-customer-retention.md`
- [ ] **A visible marketing/reputation signal**, distinct from cash, that only moves in
      response to specific choices (marketing spend, consistent service, a Plan answer about
      the target customer).
      → `research/marketing-and-customer-retention.md`
- [ ] **Field Notes decision journal** — the single highest-leverage item in the whole
      research pass. Resurface `state.log` entries mid-game, connecting an earlier choice to
      its actual consequence, instead of only replaying the ledger at the Ending.
      → `research/decision-journal-and-feedback-loops.md`
- [ ] **Restructure Crisis into a 3-beat daily loop** (morning prep → the event → close the
      day) instead of one flat beat — the close-the-day beat is where Field Notes lives.
      → `research/daily-loop-design.md`

## Phase 2.5 — The game layer — ✅ done 2026-08-05

Not originally on this roadmap. Added after: *"it simply doesn't read like a game, it reads
more like a simulation inside a webpage"* — and the fix for that is not more content, it is
that the moments the engine already treats as significant have to **land**. GSAP, vendored
locally (`prototype/vendor/gsap.min.js`), never a CDN. Full spec in `DESIGN.md` → "The game
layer".

- [x] **Thumb dock** — the stage's one real action pinned in reach on Stages 1–4, safe-area
      padded. Mobile is the design target, not an adaptation: this is the single change that
      most separates "a page you scroll" from "a thing you play" on a phone.
- [x] **Damage numbers** — the real `cashChange` thrown from the element that changed.
- [x] **Day card** — a full-bleed curtain between trading days, with the screen swapped while
      covered so a render is never seen half-built. 14 days became 14 curtain-ups.
- [x] **Streak** — consecutive good calls named while you are still in them, judged off the
      deck's own best-available score rather than a threshold invented in the view.
- [x] **Verdict burst** — tier 1–2 only. A run that went broke never gets one.
- [x] Haptics on every decision, screen shake scaled to the loss relative to what you hold,
      elastic meters, and an authored per-stage entrance timeline.
- [x] **Bug this pass exposed and fixed:** the live momentum meter normalised against all 14
      days, so a won opening day read as "Shaky" on an empty bar. It now grades on days
      actually played. A progress signal must be normalised against what has happened, not
      against what could still happen.
- [x] **Dropped anime.js entirely** — 118KB, ~40% of page weight, dead once GSAP covered every
      call site. GSAP is now the only animation dependency.
- [x] Also fixed en route: aborted View Transitions surfacing as uncaught errors (three per
      run); `rands()` printing a negative close as `R-100` instead of `−R100`; the ledger
      calling a no-decision day "one decision"; the dock's transparent gradient band
      swallowing taps on content beneath it (invisible, and the worst kind); the archetype
      Continue button landing at y=621 in a 640px viewport; the hero kicker stretching to
      34rem because `.hero-copy` is a flex column; and a focus ring drawn around the H1 on
      load, because `show()` focuses headings for screen-reader announcement and the focus
      rule matched every `[tabindex]`.

## Phase 3 — Engagement layer

Only after Phase 1 and 2 — an engagement layer on top of mechanically-inert choices would just
be decoration.

- [ ] **Founder's Path** — a participation-based reward track across the 14 days (read every
      lesson, survive a thin-cash day, diversify stat spend). The structure is worth building
      now regardless of the monetization question below — a free/premium split can be
      layered onto a track that already works, but a track designed around a paywall from day
      one tends to warp the design toward extraction.
      → `research/engagement-mechanics.md`
- [ ] A replay-streak mark for completing the 14 days more than once (Play mode's stated
      use case is revision/replay — reward the actual pedagogical goal, not daily login)
      → `research/engagement-mechanics.md`

## Phase 4 — Beyond the prototype

**Correction, 2026-08-05: the idea owner's actual intent is to turn this into a consumer
app**, not to stay a facilitator-only learnership tool. Everything in `PRODUCT.md` about the
NQF/SAQA classroom audience is still real and still binding — that's who the *content* is
written for — but the *product* itself should be planned as something that stands on its own
outside a classroom, which changes what Phase 4 actually needs to answer.

- [x] **Choose the mobile technology and the reuse plan** — ✅ decided 2026-08-08, see
      `ARCHITECTURE.md`. **Recommendation: React Native (Hermes + New Architecture),
      Android-first.** Beats Flutter on memory/size and Capacitor on cold-start and on the
      specific WebView-vs-animation-heavy-content weakness that lines up with `DESIGN.md`'s own
      game-feel layer. Domain logic/content ports as a framework-agnostic TS layer; the whole
      Sunrise UI/animation layer gets rebuilt against RN primitives, guided by `DESIGN.md` as
      spec. **Decision only — migration itself is un-started**, gated on a real-device-validated
      vertical slice first (`ARCHITECTURE.md` §11/§13).
- [ ] Decide whether/how these mechanics port from this vanilla-JS prototype into the real
      React app at `hustle-simulation.netlify.app` — folds into the reuse plan above
- [ ] **A real monetization model**, chosen deliberately rather than defaulted into — see
      "Monetization, done carefully" below before building anything here
- [ ] Facilitator-side needs, currently **[assumed]** and unresolved per `PRODUCT.md`: cohort
      reporting, shared-device reset flow for a classroom period, whether a facilitator
      dashboard is a real requirement — **still relevant even for a consumer app**, since
      classroom/facilitated use is a plausible acquisition channel, not a separate product
- [ ] Outcome validation — EVERFI's FutureSmart is ESSA Level III validated (see
      `research/financial-literacy-education.md`); worth deciding early whether HUSTLE should
      eventually be measured the same way, since that changes what "done" means for Phase 2,
      and a credible efficacy claim is also a real consumer-app differentiator

## Monetization, done carefully — not "out of scope" anymore, but not a free-for-all either

The correction above changes what's *possible*; it doesn't change who's playing. The audience
PRODUCT.md documents — low-end Android, prepaid data paid for by the learner, possibly a
shared device — makes certain monetization patterns actively predatory rather than merely
distasteful, regardless of whether the product is "for a classroom" or "for consumers." Decide
the model deliberately in Phase 4, informed by `research/engagement-mechanics.md`'s note on
what the battle-pass research found (points for participation, not performance, is the
transferable part) — but don't default into the parts of that research this file previously
ruled out sight-unseen:

- Prefer a model where the core 14-day experience is never paywalled mid-run (nothing that
  stops a player broke and mid-crisis behind a paywall)
- If a premium tier exists, prefer it sitting on cosmetic/replay/extra-content value, not on
  gating the lessons themselves — the educational content is the product's actual
  differentiator per `PRODUCT.md`'s own anti-reference framing
- Avoid countdown-timer/limited-time-offer urgency mechanics aimed at a prepaid-data audience
  specifically — the "data costs real money" constraint in `PRODUCT.md` doesn't disappear
  just because the business model changed
- Revisit `research/engagement-mechanics.md`'s Founder's Path design once the monetization
  model is chosen, since a free/premium split can reuse that track's structure directly

## How to use this file

Pick the next unchecked item in the earliest open phase, check the linked research page for
the design detail already worked out, then implement. Re-run `/impeccable critique` after
Phase 1 lands to confirm the score moves before starting Phase 2.
