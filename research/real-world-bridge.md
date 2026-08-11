# The real-world bridge — from simulation to actually starting the business

> Researched 2026-08-08, in response to `REAL_WORLD_BRIDGE.md`: does finishing HUSTLE leave a
> player able to answer "I understand why I won or lost" but not "I know what to do Monday
> morning if I actually want to try this"? This page maps the real small-business journey
> against what HUSTLE's four stages actually teach today, using `PRODUCT.md`, `ROADMAP.md`,
> `DESIGN.md`, and the rest of `research/` as constraints — no invention, no implementation.
> Analysis only; see `REAL_WORLD_BRIDGE.md` §15 for why this stays research-only until reviewed.
>
> **Revision history**: first written 2026-08-08 with a post-game checklist MVP; revised same
> day to a single-hypothesis model after review; revised again same day to promote the
> **knowledge-state model (§5) to the authoritative core concept** and add the LEARN-loop
> investigation (§13). This version supersedes all earlier checklist- and field-list-based
> proposals — sections below are written fresh where superseded, not stacked as prior diffs.

## 1. The real small-business journey (researched, not assumed)

Built from customer-discovery methodology, cost-plus pricing practice, SA-specific
registration/bylaw sources, and cash-flow/risk guidance (full source list at the bottom).
Adapted to HUSTLE's actual audience and business types — a spaza shop or phone-repair kiosk
in a township, not a funded tech startup, so venture-capital-style stage-gates are dropped.

```text
IDEA
 → PROBLEM & CUSTOMER   (who exactly, what pain, said in their own words — not assumed)
 → VALIDATION            (talk to 10-30 real people before spending; a hypothetical "would you
                           buy this?" is worthless, past behavior is what counts)
 → COMPETITION            (visit or research who else solves this, and what you'd do differently)
 → OFFER & PRICE          (cost-plus: sum real costs, add a margin, sanity-check against what
                           competitors charge and what customers said they'd pay)
 → STARTUP COST & CAPITAL (one-time costs vs ongoing costs, kept separate; a contingency buffer
                           of 10-20% on top, not an afterthought)
 → SUPPLIERS               (find 2-3, compare price/MOQ/reliability — never single-source)
 → REGISTRATION/PERMIT     (SA-specific: sole trader = SARS registration only, no CIPC needed;
                           trading in public/from a residential property needs a municipal
                           permit under the 2024 informal-trading bylaw; food needs a health
                           certificate; turnover tax exists as a simplified option under R1m)
 → FIRST CUSTOMER & SALE   (proactive: an offer made to a specific person, not a customer who
                           just appears)
 → OPERATIONS & PAYMENT    (cash still dominates informal trade — only ~4% of informal-retail
                           transactions are card-based even where cards are common elsewhere —
                           but QR/PayShap is now genuinely viable with no POS hardware needed)
 → SEPARATE MONEY & RECORD-KEEPING (one pot for the business, track what came in/out — the
                           single habit that most determines whether year-two books make sense)
 → CASH-FLOW MANAGEMENT    (a rough weekly forecast beats no forecast; businesses fail from
                           running out of cash far more often than from being unprofitable)
 → MEASURE & REVIEW        (a periodic look-back habit, not a one-time postmortem)
 → RISK MANAGEMENT         (name what could go wrong before it happens, not just react when it
                           does)
 → GROWTH & SUPPORT        (SEDA — free training/mentorship/market access, all sectors; NYDA —
                           non-repayable grants R1,000-R200,000, ages 18-35, survivalist/early-
                           stage focus, 2-year mentorship commitment attached)
```

## 2. What HUSTLE already teaches (mapped stage by stage)

| Real-world stage | HUSTLE mechanic today | How well it transfers |
|---|---|---|
| Competition | Scanner's Competition field + named Five Forces (rivalry, entrants, subs, suppliers, buyers), each with an authored "why" | **Strong.** This is the one stage HUSTLE teaches at concept-and-vocabulary depth, not just a number. |
| Startup cost & capital | R2,500 pool, per-opportunity Cost, "opening" cash after setup, an explicit under-R800 THIN-margin warning | **Strong.** Concrete, numeric, felt immediately (you watch your own cash shrink). |
| Cash-flow awareness (implicit) | HUD cash display, low/ok color states, THIN threshold, 14-day survive-or-bust framing | **Moderate.** Teaches *that* cash runs out; doesn't teach the *forecasting habit* that prevents it. |
| Supplier risk | Five Forces "supplier power" rating + Network stat's "better terms" unlock + a scripted late-supplier Crisis day | **Moderate.** Teaches the *risk exists*; never has the player *compare* suppliers themselves. |
| Risk management (reactive) | The entire 14-day Crisis deck — load shedding, a no-show supplier, a slow-pay customer — each with a real decision and a real consequence | **Strong, but one-directional.** Excellent at teaching "here's how you responded"; teaches nothing about preparing *before* the risk lands. |
| Record-keeping (implicit) | The Ending's day-by-day ledger, replayed with the worst day marked | **Moderate.** It *is* a simplified book of the business's cash movements — just never framed as "this is what bookkeeping looks like." |
| Customer/problem (surface) | One single-choice Plan question ("who is your customer") | **Weak.** Names the concept; never asks the player to find out anything real. |

## 3. What HUSTLE currently misses

- **Idea generation.** The player picks from five pre-authored, pre-validated opportunities. Real life starts from a blank page — HUSTLE never asks "what problem have *you* noticed?"
- **Validation as an action.** Demand is *handed to* the player as a HIGH/MEDIUM/LOW fact. In real life, nobody tells you your demand rating — you go find it out by talking to people. This is the single largest gap between the sim's epistemics and the real world's — and it's the reason §5's knowledge-state model exists: the fix isn't a new fact, it's a way of labeling that Scanner's numbers were never earned.
- **Pricing as a decision.** HUSTLE shows a Cost (what it takes to *start*) but never asks the player to *set a price* using their own costs and a margin. Profit is baked into the authored Crisis-day cash deltas.
- **Proactive customer acquisition.** Every Crisis-day event *happens to* the player. Real first-customer acquisition is something the player does *to* the world (identify ten people, make an offer). HUSTLE's loop is entirely reactive.
- **Registration, permits, tax.** Zero presence. Correctly so, per `REAL_WORLD_BRIDGE.md` §10 ("do not turn every legal/administrative requirement into game content") — but there is currently also no *pointer* anywhere in the product toward where a real player would go find this out.
- **A periodic review habit.** The Ending is a single postmortem. Real operating businesses review weekly; HUSTLE has no equivalent rhythm.
- **Anything past Day 14.** No connection at all today from "you survived/failed the simulation" to "here's what a person in your position would actually do next."

## 4. What should be gameplay (Level 1 — stays fast, stays a game)

Nothing new needs adding here to serve this layer — Scanner and Crisis already carry the two things a *game* can teach well (evaluating an opportunity, reacting under pressure) and `ROADMAP.md` Phase 2's still-open items (real budget allocation, a visible reputation signal, Field Notes) are the right gameplay-level fixes already identified by the existing research pass. This layer doesn't ask for new mechanics inside Stages 1-4 — it asks for what happens *after* Day 14.

## 5. The knowledge-state model (authoritative — the core product concept)

This is the architecture the rest of this page is built on. Everything downstream — the
hypothesis (§6), the MVP test (§7), Field Notes (§8), the post-game screen (§10), the LEARN
loop (§13) — is an application of this one distinction. It replaces the earlier framing ("close
the epistemics gap") with a concrete, five-state model that must not collapse into a single
generic idea of "knowledge":

| State | Meaning | Source |
|---|---|---|
| **KNOWN** | Information the simulation provided | The sim's own generated facts (Scanner's Demand/Competition ratings, costs) |
| **ASSUMED** | Something the player currently believes, not yet checked | The business hypothesis (§6) |
| **UNKNOWN** | Something the player has not yet verified | Whatever the hypothesis depends on that no one has tested |
| **TESTED** | Something the player investigated in the real world | The MVP real-world test (§7), or a future LEARN-loop report (§13) |
| **LEARNED** | What changed after testing | The delta between ASSUMED and what TESTED revealed |

Three hard rules follow directly from this model and govern every downstream design decision
on this page:

1. **Never present simulation-generated information as real-world evidence.** A HIGH demand
   rating from Scanner is KNOWN (the game told you), never TESTED (you found out) — the UI must
   keep these visually and linguistically distinct, permanently, not just at launch.
2. **Never present an assumption as a fact.** Surviving the 14-day simulation does not prove the
   business will work in reality — it proves the player made good decisions against the sim's
   own numbers, which is a different, narrower claim.
3. **A disproven assumption is a successful learning outcome, not a player failure.** Lean-
   startup practice treats an invalidated hypothesis as "a badge of honor — a sign the team
   saved its runway," and reframes progress itself as *validated learning*, not just finished
   product. HUSTLE's LEARN framing (§13) must inherit this directly: "you found out" is always
   phrased as a win, never a loss, regardless of which way the answer came out.

### Player-facing language (never the state names themselves)

The five states are the internal model. The player never sees the words "known," "assumed,"
"unknown," "tested," or "learned" — the UI stays plain, concrete, and non-academic:

```text
HUSTLE SAYS:     "Demand is high here."          (KNOWN)
YOU BELIEVE:     "Students will pay R450."        (ASSUMED)
STILL UNKNOWN:   "Will they actually pay R450?"   (UNKNOWN)
GO FIND OUT.                                      (→ TESTED, via §7's real-world test)

YOU FOUND OUT:   "Most people said R300."         (TESTED)
WHAT CHANGED?    "Your price assumption."         (LEARNED)
```

Worked example, carried through the rest of this page:

> **KNOWN** — "The simulation shows high demand for phone repair."
> **ASSUMED** — "I believe students near my location will pay R450 for this service."
> **UNKNOWN** — "I don't actually know whether students will pay R450."
> **TESTED** — "I spoke to three potential customers and asked what they have actually paid for repairs."
> **LEARNED** — "Two customers said R450 was too expensive and both had recently paid around R300."

## 6. The business hypothesis (authoritative — supersedes the earlier Business Builder field-list)

The Real-World Bridge produces one concise, falsifiable sentence, not a wall of separate
Business Builder fields:

> *"I believe [named customer] will pay R[price] for [business] because [reason]."*

This is the player's **ASSUMED** state, made explicit and testable. The supporting numbers this
page previously proposed as standalone Business Builder steps — a computed price (from Scanner's
own Cost data plus a margin), a named customer, a stated cash buffer — don't disappear; they
become the sentence's visible evidence, not separate screens the player fills in. The purpose is
not to make the player believe they have a validated business — surviving Day 14 already risked
implying that, which is exactly what rule 2 in §5 forbids. The purpose is to make them articulate
a belief precisely enough that it can be checked against reality.

## 7. The MVP real-world test (authoritative — supersedes the earlier checklist)

For MVP, the flagged assumption defaults to the **customer/problem** clause of the hypothesis —
not because customer risk is a universal entrepreneurship law (it isn't, and this page does not
claim it is), but because it's specifically HUSTLE's own identified transfer gap: demand is
currently *handed to* the player by Scanner rather than discovered (§3). No general-purpose
"riskiest assumption" ranking engine is being proposed for MVP — that's a real future
possibility, explicitly deferred, not required to ship the concept.

The MVP produces **one** low-cost real-world test, not a checklist:

```text
Talk to 3 people who match [named customer].

Ask what they have actually paid for [problem] — not whether they would buy from you.
```

Past behavior over hypothetical willingness, the same distinction §1 already established from
the customer-discovery sources: 3-5 people is enough to falsify a bad hypothesis even if not
enough to fully confirm a good one, and that's the honest bar for a first test at this audience's
time and resource budget. One meaningful test beats a large checklist — both because it's
methodologically correct (test the identified leap-of-faith assumption first) and because it's
better game feel at the exact moment §12 warns about (the payoff right after 14 tense days).

## 8. Field Notes as the bridge

`decision-journal-and-feedback-loops.md` already designed Field Notes as a mid-Crisis callback
connecting an earlier choice to its consequence. That mechanism is the natural spine for this
layer — it needs one more link added to a chain that already exists, and that link is a
knowledge-state transition (§5), not a new authoring system:

```text
DECISION → CONSEQUENCE → LESSON (Field Note, already designed — the LEARNED state, generated
                                  by the sim rather than a real-world test)
                              → REAL-WORLD ACTION (new: the same Field Note text becomes the
                                reason clause of a hypothesis, or a flagged UNKNOWN to test)
```

Concretely: a Field Note that fires mid-Crisis ("Day 3 you skipped the generator rental to save
cash — that's part of why today's load-shedding event hit twice as hard") is already a
real-world-transferable lesson in narrative form. Example using the brief's own case:

> **SIMULATION** — "You depended on one supplier."
> **FIELD NOTE** — "One supplier became a single point of failure."
> **REAL-WORLD ACTION** — "Find two alternative suppliers before committing significant money."

The only new work is carrying the same `state.log`-derived text into the post-game hypothesis
and test screen instead of only the Crisis HUD — reusing the templated-generic-plus-authored-
connectors design already specified, not building a separate educational system.

## 9. Three levels (unchanged)

- **LEVEL 1 — GAME.** "Can I make good entrepreneurial decisions?" Stays fast, stays a game — §4.
- **LEVEL 2 — BUSINESS BUILDER.** "Can I turn the idea into a realistic business hypothesis?" — §6.
- **LEVEL 3 — REAL-WORLD ACTION.** "What should I actually test or do next?" — §7 for MVP, §13 for the future loop.

HUSTLE does not become a complete business-management platform, accounting system, CRM, legal
service, or business course at any of these levels — the player needs enough to take the next
intelligent step, not everything.

## 10. Proposed post-game experience (authoritative — supersedes the earlier field-mockup)

Not a congratulations screen, and not a checklist wall. A single new sequence inserted between
the existing Ending ledger and "Run it again," structured as a calm transition rather than a
new stage of pressure:

```text
14 DAYS COMPLETE
 → YOUR RESULT            (existing Ending ledger — unchanged)
 → WHAT YOU LEARNED        (existing "pivot day" Field Note, already in state.log)
 → YOUR BUSINESS HYPOTHESIS  "I believe [customer] will pay R[price] for [business]
                              because [reason]."                         (§6, ASSUMED)
 → WHAT IS STILL UNKNOWN?    "Will they actually pay R[price]?"          (§5, UNKNOWN)
 → TEST IT IN THE REAL WORLD  §7's single test, personalized             (→ TESTED)

WHERE TO GO NEXT
SEDA — free training & mentorship → [link]
NYDA — youth grant, ages 18-35 → [link]
```

Every field sources from data the current build already has by the time the Ending renders —
`state.biz`, `state.plan`, `state.log`, the archetype pick — plus the one hypothesis sentence
from §6. No new content-authoring system, no new business data. The sequence is deliberately
short: one hypothesis, one flagged unknown, one test, then the two resource pointers — not a
return to checklist density.

## 11. What should remain outside HUSTLE (external resource / off-platform)

Named, current, and clearly labeled as *pointers*, not in-game content:

- **SARS** — sole-trader registration (no CIPC needed), turnover-tax micro-business threshold (≤R1m).
- **Local municipality** — informal-trading permit (2024 national bylaw framework; municipal specifics vary — say so explicitly, don't guess a specific municipality's rule).
- **SEDA** — free business training, mentorship, market access; all ages, strong township focus.
- **NYDA** — non-repayable grants (R1,000-R200,000) for ages 18-35, with a 2-year mentorship commitment attached.

Framed exactly as `REAL_WORLD_BRIDGE.md` §10 requires: HUSTLE is not an accountant, lawyer, or
government agency; requirements vary by location and business; point to the current official
source rather than restating a rule that could go stale or vary by municipality.

## 12. Risks of making HUSTLE too educational

- **Scope creep into an MBA course.** Every real-world topic researched here (registration, tax,
  permits, formal bookkeeping) is a rabbit hole with its own genuine complexity. The discipline
  `REAL_WORLD_BRIDGE.md` §2 and §10 already state is the right one: name it, point to it, never
  teach it inline.
- **Losing the game feel at the exact moment it should land hardest.** The post-game screen is
  the payoff moment right after 14 days of tension — a wall of checkboxes here reads as the game
  "turning into homework" right when the player should feel finished. §10's short sequence (one
  hypothesis, one unknown, one test) exists specifically to protect this.
- **Overpromising certainty.** A computed price or a stated buffer amount can read as more
  authoritative than it is — these are starting estimates from a simplified sim, not financial
  advice. §5's rule 2 (never present an assumption as a fact) is the direct guardrail here, not
  just a framing nicety.
- **Patronizing tone.** The audience is explicitly "limited formal business education, strong
  desire to succeed" (`REAL_WORLD_BRIDGE.md` §11) — simplifying the real-world checklist risks
  sliding into a tone that talks down. `PRODUCT.md`'s existing voice rules (plain, direct, second
  person, local nouns) are the guardrail; this layer should sound like the rest of the game, not
  like a different, softer product bolted on. §14's target-user framing restates this directly.
- **Turning "you were wrong" into a penalty.** Unique to the hypothesis model: because the player
  now states a claim in their own words, a disproving test result can land as personal failure
  if the UI doesn't actively reframe it. §5 rule 3 and §13 Q9 exist to prevent this — every
  disproved-assumption moment must read as "you found out," never "you were wrong."

## 13. The LEARN loop — investigated, not designed for build

The brief asked whether the smallest viable return loop is worth including:
`RUN → REFLECT → FORM HYPOTHESIS → IDENTIFY UNKNOWN → TEST IN REAL LIFE → RETURN → REPORT WHAT
HAPPENED → LEARN → UPDATE HYPOTHESIS → OPTIONAL REPLAY`. Everything through "TEST IN REAL LIFE"
is already the MVP (§6, §7, §10). What follows — RETURN onward — is investigated here and
answered question by question, but **not designed for build**; per the brief, this stays
lightweight-in-concept only, explicitly not a CRM, journal, evidence-upload system, or analytics
product.

1. **Is the loop worth including?** Conditionally yes, but as a *future* addition gated on real
   usage signal from the MVP, not designed now. Lean-startup practice treats reporting back on a
   tested hypothesis as the actual point of the whole exercise (learning is "the primary
   product"), so a hypothesis nobody ever reports back on is only half a loop — but building the
   return mechanism before the hypothesis-and-test screen has even shipped risks solving a
   problem that hasn't been observed yet.
2. **Does it materially improve learning transfer?** Plausibly, in theory — closing Build-
   Measure-Learn is the whole mechanism lean-startup practice is built on. Unproven for *this*
   product and audience until §7's MVP ships and real behavior is observed. Recommend sequencing
   the decision after that data exists, not before.
3. **Minimum interaction required?** Three taps, no free text: what happened (a structured
   choice — "they paid more / less / the same / didn't want it"), a system-suggested hypothesis
   update, one confirm. Multiple choice throughout — matches §14's "reduce interface friction,
   not intellectual challenge."
4. **Should the player record what happened, what they learned, and what they'd change?**
   Combine into the smallest possible surface: "what happened" is the only thing asked of the
   player; "what changed" (the LEARNED state) is system-computed as the delta between the
   original ASSUMED sentence and the structured answer, not a second question.
5. **Should the player update the original hypothesis?** Yes — this is the actual point (the
   ASSUMED→LEARNED transition made real) — but as a single system-suggested edit the player
   accepts or adjusts, not an open rewrite.
6. **Mandatory or optional?** Optional, always. Never gate replay or new content behind it —
   `engagement-mechanics.md` (already in this research set) already flags forced-return
   mechanics as the FOMO pattern to explicitly avoid copying for this audience.
7. **Simplest implementation that preserves the premium feel?** A single async re-entry point —
   e.g. a "continue your hypothesis" state visible next time the player opens HUSTLE — not a
   notification chain. Push-style urgency is the wrong register for a reflective, curiosity-led
   moment.
8. **Does it create a natural reason to return without artificial engagement mechanics?**
   Yes, and this is the strongest argument for eventually building it: an unresolved, personally-
   stated claim is a genuine intrinsic trigger — curiosity about whether you were right — distinct
   from a manufactured streak. Habit-formation research is explicit that this kind of return
   pressure must stay intrinsic and must not be propped up with extrinsic reward mechanics that
   have to "graduate away" later; the hypothesis itself, not a notification, is the trigger.
9. **What happens when the real-world test disproves the hypothesis?** It must be presented as
   a successful outcome, explicitly and consistently — "You found out. Your assumption changed."
   — never as a loss condition. This is §5 rule 3 applied at the return moment, and it's the
   single most important tone decision in the whole loop: get this wrong and the LEARN loop
   punishes the exact behavior (testing an assumption) the entire layer exists to encourage.
10. **How could learning eventually connect back to replaying HUSTLE?** Speculative and
    explicitly out of scope for this investigation: a returning player could in principle start a
    new run with their LEARNED result pre-loaded as a starting fact instead of a blank slate.
    Genuinely interesting, not designed here, flagged for a later, separate product decision.
11. **How should the five knowledge states be represented without feeling academic?** Never by
    their model names — always through §5's plain-language mapping (HUSTLE SAYS / YOU BELIEVE /
    STILL UNKNOWN / GO FIND OUT / YOU FOUND OUT / WHAT CHANGED). The five-state model is
    internal architecture; "known," "assumed," "unknown," "tested," and "learned" as literal UI
    copy would be exactly the academic tone §14 rules out.

## 14. Target user (unchanged)

A motivated person who may have limited formal business education, limited prior exposure to
entrepreneurship terminology, and limited resources, but has a strong desire to succeed.

```text
SIMPLE LANGUAGE + SERIOUS DECISIONS + PRACTICAL ACTIONS
```

The intellectual challenge is not reduced — the unnecessary language and interface friction
required to access it is. This governs every UI decision above: the knowledge-state model (§5)
stays sophisticated internally and plain-spoken on screen; the MVP test (§7) stays to one
sentence, not a form; the LEARN loop (§13) stays three taps, not a journal.

## 15. MVP vs future (authoritative)

**MVP** — build order:

1. **The hypothesis screen (§6, §10)** — one sentence, assembled from data the build already has
   plus one new required input ("name your customer," the only Business Builder field this MVP
   still needs collected).
2. **The flagged assumption (§7)** — hardcoded default to the customer/problem clause; no ranking
   engine.
3. **One real-world test (§7)** — tied only to the flagged assumption.
4. **The four external-resource pointers (§11)** — static links, unchanged from every prior draft
   of this page.
5. **Field Notes → hypothesis reason clause (§8)** — gated on Field Notes itself shipping
   (`ROADMAP.md` Phase 2, currently unchecked); second half of a mechanic not yet built, not a
   standalone MVP item.

**Future — do not build now:**

- Return / report-what-happened / LEARN / update-hypothesis (§13, all eleven sub-answers) —
  gated on observing real usage of the MVP first.
- A dynamic riskiest-assumption ranking engine (§7) — the static customer-first default is
  sufficient until there's evidence it isn't.
- Any connection between a completed LEARN cycle and a subsequent replay's starting state
  (§13 Q10) — a separate, later product decision.

---

## Sources

**Customer discovery & validation**
- [4 Steps of Customer Discovery Before You Launch (Medium)](https://kaego-ogbechie-rust.medium.com/4-steps-of-customer-discovery-before-you-launch-9e39f579f1b7)
- [Customer Discovery in 4 Steps (Center for Economic Development)](https://economicdevelopment.umw.edu/blog/2020/12/09/customer-discovery/)
- [How to Validate a Business Idea Before You Launch (The Entrepreneurs' Center)](https://ecinnovates.com/validate-a-business-idea/)

**Pricing**
- [Cost-plus pricing: When to use it (QuickBooks)](https://quickbooks.intuit.com/r/accounting/cost-plus-pricing/)
- [8 Proven Pricing Strategies for Small Businesses (Ramp)](https://ramp.com/blog/small-business-pricing-methods)

**Suppliers**
- [How to Evaluate and Choose Reliable Suppliers, Free Checklist (SaleHoo)](https://www.salehoo.com/learn/how-to-choose-suppliers)

**First customers**
- [Get Your First Customer (Harvard Innovation Labs)](https://innovationlabs.harvard.edu/how-to/get-your-first-customer)
- [How to Get Your First 100 Customers with No Marketing Budget](https://www.marketingandmain.com/blog/how-to-get-your-first-100-customers-when-you-have-zero-marketing-budget-2025-newark-business-owners-playbook)

**South Africa — registration, tax, permits**
- [How to Register a Sole Proprietorship in South Africa (Accounter)](https://accounter.co.za/compliance/sole-proprietor/registration)
- [FAQ: Requirements for a micro business to qualify for turnover tax (SARS)](https://www.sars.gov.za/faq/faq-what-are-the-requirements-for-a-micro-business-to-qualify-for-turnover-tax/)
- [Government simplifies the process to apply for spaza shop permits (SAnews)](https://www.sanews.gov.za/south-africa/government-simplifies-process-apply-spaza-shop-permits)
- [Guide to register spaza shops (SAnews)](https://www.sanews.gov.za/features-south-africa/guide-register-spaza-shops)
- [City of Ekurhuleni Spaza Shop Policy 2024 (PDF)](https://www.ekurhuleni.gov.za/wp-content/uploads/2025/02/SPAZA-SHOP-POLICY-APPROVED-30JAN205-.pdf)

**Cash flow & startup costs**
- [How to Calculate Start-up Costs for Your Business (SME South Africa)](https://smesouthafrica.co.za/how-to-calculate-start-up-costs-for-your-business/)
- [A simple guide to cashflow for small businesses (Business Partners)](https://www.businesspartners.co.za/a-simple-guide-to-cashflow-for-small-businesses/)
- [Cash Flow Management: 7 Expert Tips (Lula)](https://lula.co.za/blog/business-funding/cash-flow-management/)

**Bookkeeping / separating money**
- [Small Business Series: Separating personal and business finances (Center For Rural Affairs)](https://www.cfra.org/blog/separating-personal-and-business-finances)
- [5 Ways to Separate Your Personal and Business Finances (SBA)](https://sba.gov/blog/5-ways-separate-your-personal-business-finances)

**Payment methods**
- [Cash Payments Still Dominate In Informal Trade (SME South Africa)](https://smesouthafrica.co.za/cash-payments-still-dominate-informal-trade/)
- [Real-time payments in South Africa: the state of PayShap in 2026 (Stitch)](https://stitch.money/blog/real-time-payments-in-south-africa-the-state-of-payshap-in-2026)
- [How Street Wallet is changing payment methods for informal traders (Bizcommunity)](https://www.bizcommunity.com/article/how-street-wallet-is-changing-payment-methods-for-informal-traders-923834a)

**Support & funding**
- [NYDA Funding and Support for South African Youth (SME South Africa)](https://smesouthafrica.co.za/sme-guides/guide-to-nyda-funding/)
- [SEDA: Unlocking Business Growth in South Africa (Entrepreneur Hub SA)](https://entrepreneurhubsa.co.za/seda-unlocking-business-growth-in-south-africa/)

**Risk management**
- [Effective Risk Management for Small Business (Embroker)](https://www.embroker.com/blog/risk-management-for-small-business/)
- [Strategies for Managing Risks for Small Businesses (US Chamber of Commerce)](https://www.uschamber.com/co/start/strategy/risk-management-strategies-for-small-businesses)

**Lean-startup hypothesis & assumption testing**
- [Riskiest Assumption Test (RAT) and Its Role in MVP Development (Apptunix)](https://www.apptunix.com/blog/riskiest-assumption-test/)
- [Riskiest Assumption Test (ModelThinkers)](https://modelthinkers.com/mental-model/riskiest-assumption-test)
- [Lean Startup Hypothesis vs. Assumption: Why the Difference Matters (Kromatic)](https://kromatic.com/blog/assumption-vs-hypothesis-to-the-death/)
- [Lean Startup: Assumption Prioritization and Hypothesis Generation (co:dify Group)](https://codify.in/2023/08/20/lean-startup-assumptions-and-hypotheses/)
- [How Assumptions Mapping Can Focus Your Teams On Running Experiments That Matter (Strategyzer)](https://www.strategyzer.com/library/how-assumptions-mapping-can-focus-your-teams-on-running-experiments-that-matter)
- [Assumption Prioritization Canvas: How to Identify And Test The Right Assumptions (Product Compass)](https://www.productcompass.pm/p/assumption-prioritization-canvas)
- [How To Validate Your Business Idea By Testing A Hypothesis (Medium)](https://medium.com/how-to-hatch/how-to-validate-your-business-idea-by-testing-a-hypothesis-fb91c9c164c6)
- [Playbook 02: Customer Discovery & Assumption Testing (LeanPivot.ai)](https://leanpivot.ai/playbook-02-customer-discovery/)
- [The Minimum Viable Testing Process for Evaluating Startup Ideas (First Round Review)](https://review.firstround.com/the-minimum-viable-testing-process-for-evaluating-startup-ideas/)

**Pivot/persevere and learning-as-progress (added 2026-08-08, §5 rule 3 / §13)**
- [Learning as the Real Product: Deciding When to Pivot or Persevere (LeanPivot.ai)](https://leanpivot.ai/blog/learning-as-the-real-product-deciding-when-to-pivo/)
- [Measuring and Learning: The Lean Startup Approach (Medium)](https://federicomete.medium.com/measuring-and-learning-the-lean-startup-approach-83759643ec61)
- [Pivot or Persevere? Find Out Using Lean Experiments (UX Mastery)](https://uxmastery.com/pivot-or-persevere-find-out-using-lean-experiments/)

**Habit formation and natural return triggers (added 2026-08-08, §13 Q6-Q8)**
- [The Habit Loop in Product Design: Build Sticky Apps (productgrowth.in)](https://productgrowth.in/insights/consumer/habit-loop-product-design/)
- [Building Habit Forming Products (Beyond the Backlog)](https://beyondthebacklog.com/2024/03/23/building-habit-forming-products/)
- [The psychology of user retention: designing for habit formation (Studio Contrast)](https://www.contrast.studio/articles/the-psychology-of-user-retention-designing-for-habit-formation)
