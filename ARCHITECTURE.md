# ARCHITECTURE.md — HUSTLE production mobile platform

> Written 2026-08-08. Research/decision only — **no code changed, no framework installed, no
> migration started.** Answers: given everything documented in `PRODUCT.md`, `ROADMAP.md`,
> `DESIGN.md`, `TESTING.md`, `REAL_WORLD_BRIDGE.md`, and `research/`, what should HUSTLE's
> production mobile architecture be, and what happens to the current `prototype/hustle-shell.html`?
> See `ROADMAP.md` Phase 4 for the roadmap item this closes (decision made; migration itself
> stays a separate, future, un-started piece of work).

## 1. HUSTLE's actual requirements (from the docs, not from the prototype's tech)

**Product**, from `PRODUCT.md`/`ROADMAP.md`: a mobile game, primary target low-end Android,
prepaid/limited data paid by the player, possibly a shared classroom device, audience with
first-time exposure to business vocabulary — but the product intent was corrected mid-project to
a standalone **consumer app**, not facilitator-only, which makes app-store presence a plausible
acquisition channel, not just a nice-to-have. No iOS requirement appears anywhere in any HUSTLE
document — this is a real constraint on the decision below, not an oversight.

**Technical**, synthesized from `TESTING.md` and `research/low-literacy-low-end-android.md`: a
real gzipped payload/money budget already exists and binds; startup speed and low memory use are
named constraints, not aspirations; state must survive backgrounding and a shared-device handoff
(nothing in the current build does this reliably yet — a gap, not a solved problem); the product
already has a **substantial, hard-won visual identity** (`DESIGN.md`'s Sunrise system — sampled
palette, GSAP-driven game-feel layer: thumb dock, damage numbers, day-card curtain, streak,
verdict burst, a Canvas2D ambient effect) that took multiple correction passes to get right and
represents real, non-trivial product value, not throwaway scaffolding.

**Future-shaped, from `REAL_WORLD_BRIDGE.md`/`research/real-world-bridge.md`:** a post-game
hypothesis screen and a possible future LEARN/return loop. Both are currently pure client-side
state and computation — **neither has a confirmed requirement for a backend or cross-device sync
today.** The LEARN loop's own research page (§13) explicitly gates itself on observing real usage
before being designed at all, let alone built.

## 2. Evaluating the current prototype — preserve / port / rebuild / discard

Per the instruction this decision optimizes for: **preserve product value, not source code.**

| Category | Verdict | What / why |
|---|---|---|
| **Preserve** | Product logic & content | All game content (5 opportunities, plan questions, 14 crisis days, lesson text), the archetype/stat system, Five Forces framework, Field Notes design, the Sunrise **design tokens** (palette, type ramp, spacing, motion timing) as a specification — these are product value independent of any framework. |
| **Port** | State machine & business logic | `state.stats/archetype/biz/plan/log/crisisScore` and the functions that transform them (`crisisFrac`, `planScore`, commit/finish logic) are pure JS with no DOM dependency baked in by necessity — realistic to extract into a framework-agnostic domain layer (see §7) and reuse close to as-is. |
| **Rebuild** | The entire rendering/animation layer | CSS custom properties, GSAP timelines, scroll-snap carousels, the Canvas2D leaf-drift system, sticky-positioned thumb dock — all DOM/CSS-specific. None of this ports literally into a native or React Native UI; it must be re-authored against the target framework's own styling/animation primitives, using `DESIGN.md`'s tokens and the game-feel spec as the source of truth, not the CSS itself. |
| **Discard** | Prototype-specific implementation choices | Single-file-HTML structure, `localStorage`-as-only-persistence, the whole DOM-query-based view-update pattern, vendored-file-in-repo dependency management. None of these were product decisions — they were fast-iteration conveniences for a prototype and shouldn't constrain production. |

## 3–4. Architecture options, compared against HUSTLE's actual constraints

Five options considered: **A. Native Android** (Kotlin/Compose) · **B. React Native** (Hermes +
New Architecture) · **C. Flutter** · **D. Capacitor/hybrid** · **E. Web/PWA** (optionally TWA-
wrapped for Play Store). No iOS-specific option is evaluated on its own merits since no HUSTLE
document states an iOS requirement — React Native and Flutter's cross-platform reach is scored
only where it has *other* benefits for Android, not credited for iOS reach nobody asked for.

The instruction's 25-criterion list is real but not equally decisive for HUSTLE — the table below
carries the ones that actually differentiate the options for this product; the rest are covered
in prose immediately after because they don't discriminate (e.g. "security" doesn't meaningfully
differ across these five options for an app with no backend today; "developer productivity" is
addressed under AI-agent fit in §9, not repeated here).

| Criterion | A. Native | B. React Native | C. Flutter | D. Capacitor | E. Web/PWA |
|---|---|---|---|---|---|
| Cold start (low-end) | Best — no bridge/engine overhead | Strong — Hermes + New Arch ~350ms | Strong — ~1.2s typ., heavier init | **Weakest** — WebView init, ~2.3s typ. | Comparable to D, no install step |
| Memory baseline | Lowest | Lower (uses native UI components) | Higher (bundles own rendering engine, Skia/Impeller) | Depends on WebView | Depends on WebView |
| App size | Smallest | ~5–8MB baseline | ~8–12MB baseline | Small shell + WebView content | N/A (no install) or TWA-comparable to D |
| Animation-heavy UI on cheap hardware (HUSTLE's actual case: GSAP timelines, gradients, canvas) | Best — full native control | Good — Reanimated/Skia run off the JS thread | Good — own rendering pipeline | **Documented weak point** — WebView struggles with exactly this class of content | Same WebView-class ceiling as D |
| Prototype code/value reuse | Lowest — total UI rewrite, logic ports as reference only | Medium — logic layer ports close to as-is, UI rebuilt | Lowest — Dart rewrite, even content needs re-authoring as Dart data | **Highest** — near-literal reuse of the existing HTML/CSS/JS | Highest — is the existing app, refined |
| Offline capability | Full, native | Full, native | Full, native | Full (Capacitor ships this) | Full via service workers — much stronger in 2026 than a few years ago, but still one layer more fragile than native |
| App-store distribution | Yes | Yes | Yes | Yes | Via TWA wrapper only |
| AI-agent workflow continuity (see §9) | Lowest — new language, new test stack | Medium — same JS ecosystem, new UI/test stack | Lowest — new language, new test stack | **Highest** — Playwright and the existing render-verification loop keep working almost unchanged | Highest — zero change |

**Where each option fails HUSTLE's stated primary constraint (low-end Android):**
- **Native Android** doesn't fail it — it's the ceiling every other option is measured against.
  Its cost is elsewhere (§3/§9).
- **React Native** doesn't fail it either on current evidence — Hermes + the New Architecture has
  closed most of the historical gap, and it beats Flutter and Capacitor on the two axes (baseline
  memory, cold start) most likely to matter on the actual weakest device HUSTLE targets.
- **Flutter** carries a real memory/size cost from bundling its own rendering engine — the
  research above puts this at roughly 25MB of memory and several extra MB of app size versus
  React Native. On a modern midrange phone this is noise; on the low-RAM end of HUSTLE's named
  target, it's a real, if not disqualifying, tax.
- **Capacitor** is the one option with a *documented, specific* failure mode that lands directly
  on HUSTLE's own signature product surface: WebView is known to struggle with exactly the class
  of content `DESIGN.md`'s game-feel layer is built from (CSS gradients, GSAP-driven transform/
  opacity animation at 60fps, a canvas effect) — and it has the slowest measured cold start of the
  three benchmarked options. This isn't generic hybrid-app FUD; it's the specific weakness lining
  up with the specific thing this product already spent real effort tuning.
- **Web/PWA** doesn't fail the performance axis (it's WebView-class, same ceiling as Capacitor,
  same weakness on animation-heavy content) but fails a *different* named requirement:
  `PRODUCT.md`'s explicit "I am using the app," not "I opened a website" quality bar, and the
  weaker app-store discoverability story for a product whose intent just pivoted toward being a
  discoverable consumer app.

## 5. Offline / data model

**OFFLINE-FIRST** (must work with zero network): the entire 14-day game loop — Profile, Scanner,
Plan, Crisis, Ending — and all state persistence. This is non-negotiable per `PRODUCT.md`'s
prepaid-data/low-connectivity constraints and is already true of the prototype's intent, if not
yet its reliability.

**OFFLINE-CAPABLE / ONLINE-REQUIRED, narrowly:** the four external-resource pointers
(`research/real-world-bridge.md` §11 — SARS/municipality/SEDA/NYDA) inherently need a network at
tap-time to actually load, same as any external link; nothing else in the currently-designed
product needs one.

**Do not build a backend for HUSTLE today.** No document establishes a confirmed requirement for
one. The only two plausible future drivers are both explicitly unresolved: the facilitator/cohort
dashboard question `PRODUCT.md` and `ROADMAP.md` still mark `[assumed]`, and a hypothetical
cross-device LEARN-loop return flow that `research/real-world-bridge.md` §13 explicitly declines
to design until real MVP usage data exists. Revisit backend need only if one of those two becomes
a confirmed requirement — don't build the infrastructure ahead of the decision.

## 6. State and domain architecture

Recommend a **framework-agnostic domain layer in TypeScript**, holding the concepts already
implicit in the prototype's `state` object — Player (archetype, stats), Business (chosen
opportunity, cash, day), Scanner readout, Plan answers, Crisis log/decisions, Field Notes, and
the future Hypothesis/real-world-test/Learning concepts from `research/real-world-bridge.md` —
with pure functions for every transition (`commitBusiness`, `resolveCrisisDay`, `scorePlan`, …)
and zero import of any UI framework. This is the single highest-leverage structural decision in
this document, independent of which rendering framework wins: it's what lets the framework
choice below be *revisited later without a second full rewrite*, and it directly satisfies the
brief's own warning against letting business logic couple to individual screens — the prototype
already half-violates this (state lives in one global object read directly by view code), so this
is corrective, not just future-proofing.

**Source of truth**: the domain layer's in-memory state, snapshotted to local persistence
(AsyncStorage/SQLite-equivalent under React Native) on every transition — the same "never lose a
run" requirement `DESIGN.md` already states for the current build, just implemented reliably
instead of best-effort. **UI state** (which screen, animation-in-flight, scroll position) stays
in the view layer and is never persisted. **Derived state** (Momentum meter, Plan-strength meter,
the Five Forces readout) is computed from domain state on read, never stored redundantly — matches
the prototype's own existing, correct pattern for these.

## 7. Prototype → production strategy

**Option A — migrate/reuse as much as possible (i.e., Capacitor-wrap the existing app).**
Benefit: fastest path to a store listing, maximal literal code reuse. Risk: ships HUSTLE's
weakest documented performance profile on exactly the constraint the product cares most about,
and the specific failure mode (WebView + animation-heavy content) lines up with the product's own
signature visual layer. Rejected as the primary strategy for that reason, not because reuse is
bad in general.

**Option B — selectively port product logic, rebuild UI/application architecture.** Benefit:
keeps the real, hard-won value (content, game logic, design tokens as spec) while giving up only
the parts that were always prototype-specific (DOM/CSS implementation). Cost: real, bounded
UI-layer rework — every animation and layout in `DESIGN.md`'s game-feel section gets re-authored
once, against the target framework's primitives, guided by the existing spec rather than guessed.
**Recommended.**

**Option C — treat the prototype purely as reference, rebuild cleanly.** Benefit: cleanest
possible production codebase. Cost: throws away real, working, already-portable domain logic and
content data for no benefit over Option B — Option B captures the same UI-rebuild benefit while
keeping the free logic reuse. Rejected as strictly dominated by B.

## 8. AI-assisted development fit

The entire HUSTLE workflow to date — `TESTING.md`'s verification loop, Playwright, live-render
inspection, `getComputedStyle` sampling, headless-browser screenshot capture — is built on the
app being a **renderable web surface**. That continuity has real, demonstrated value in this
project (it's what caught the sticky-dock bug and the 360px overlap — see
`[[verification-signal-traps]]` case 9 in the portable knowledge base). React Native keeps the
*logic* layer in the same language and largely the same testing philosophy (a JS/TS domain layer
is unit-testable exactly as today), but the *UI* verification loop needs a real replacement
(Detox, Maestro, or an equivalent RN-aware automation tool) — this is a genuine, non-trivial
workflow change, not a detail. Native Android and Flutter both require a full language and
tooling switch with no reuse of the AI-agent workflow built so far. Per the brief's own
instruction, this factor is real but subordinate to the low-end-performance constraint — it's why
React Native beats Native/Flutter *given the low-end verdict is close*, not a reason to override
Capacitor's or Web's stronger workflow continuity against their weaker performance profile.

## 9. Scope discipline — don't over-architect

| | Needed now | Reasonable soon | Future | Not needed |
|---|---|---|---|---|
| Offline-first game loop | ✅ | | | |
| Reliable local persistence (survive background/shared-device) | ✅ | | | |
| A JS/TS domain layer decoupled from UI | ✅ | | | |
| RN UI rebuild of the Sunrise game-feel layer | | ✅ | | |
| New UI-automation test stack (Detox/Maestro) | | ✅ | | |
| Real low-end Android device validation | | ✅ | | |
| Backend for facilitator/cohort dashboard | | | possible, gated on confirming the requirement | |
| Cross-device LEARN-loop sync | | | possible, gated on `research/real-world-bridge.md` §13's own usage-data gate | |
| Push notifications | | | only if the (explicitly-avoided) forced-return pattern is ever revisited — currently ruled out by that same research page | |
| Microservices, real-time infra, multi-tenant backend | | | | ❌ — no evidence any of this is ever needed for a single-player offline game |

## 10. Recommendation

**RECOMMENDED ARCHITECTURE: React Native (Hermes engine, New Architecture), Android-first, no
iOS commitment implied or required.**

**WHY:**
- Best low-end-Android performance profile of the genuinely app-store-distributable, native-feel
  options — beats Flutter on memory/size, beats Capacitor on cold start and on the specific
  animation-heavy-content weakness that lines up with HUSTLE's own visual system.
- The product's real, non-throwaway value — game logic, content, and the design-token
  specification — carries forward through a JS/TS domain layer (§6) with far less rewrite risk
  than a Dart or Kotlin port.
- Reasonable app-store presence for the now-confirmed consumer-app intent (`ROADMAP.md` Phase 4),
  which Web/PWA satisfies only partially.

**TRADE-OFF:** the entire visual/game-feel layer (`DESIGN.md`'s hard-won Sunrise system) has to
be re-authored against React Native's styling and animation primitives — this is real, bounded
work, not automatic. The AI-agent testing workflow needs a genuine UI-automation replacement.

**RISKS:**
- UI-layer rebuild could drift visually from the verified `DESIGN.md` tokens if not treated as a
  1:1 port of a specification, not a "redesign while we're at it."
- No RN-based UI-testing workflow exists yet for this project — first vertical slice is also the
  first test of whether the AI-agent verification discipline in `TESTING.md` actually transfers.
- Performance numbers cited in §3–4 are general benchmarks, not HUSTLE-specific measurements — see
  §13 for the experiment that should happen before full commitment.

**MITIGATION:** build the domain layer first and keep it framework-agnostic regardless (§6) —
this bounds the blast radius of the UI framework choice being wrong. Build one real vertical
slice (Scanner or Crisis, the two most animation-dense stages) on a real low-end Android device
before committing the rest of the migration, specifically to pressure-test the §3 benchmarks
against HUSTLE's actual content, not generic ones.

**"Would you choose the same architecture if we started HUSTLE from zero today?"** Mostly yes,
with one honest caveat: with *zero* legacy JS investment and an Android-only requirement stated
from day one, pure native Kotlin/Compose is the theoretical performance ceiling and would be a
defensible from-zero choice on performance grounds alone. React Native is the right call **given
where HUSTLE actually is** — a real, working JS domain layer and content set already exist, and
the AI-agent workflow this project runs on is JS-native — not because it's abstractly optimal in
a vacuum. That's a real distinction, not a hedge: this recommendation is conditioned on the
project's actual state, and should be reopened only if that state changes materially (e.g., an
iOS requirement appears, or a from-zero rewrite is chosen for unrelated reasons).

## 11. Migration strategy — sequence, not a plan

```
current prototype (stable, keeps shipping content/design updates as-is)
  → extract the domain layer (§6) as standalone TypeScript, tested independently of any UI
  → stand up a minimal React Native shell, prove the domain layer runs unmodified inside it
  → build one vertical slice (Scanner or Crisis) in RN, matching DESIGN.md tokens exactly
  → validate that slice on a real low-end Android device — the first real test of §10's bet
  → stand up the RN UI-testing workflow (Detox/Maestro) alongside it
  → migrate remaining stages, one at a time, each validated the same way
  → regression-test the full 14-day loop end to end
  → release candidate
```

No detailed implementation plan yet, per the brief — this is the sequence, not the work breakdown.

## 12. Decision gate

| Decision | Recommendation | Confidence | Why |
|---|---|---|---|
| Production platform | React Native, Android-first | Medium-High | Best low-end profile among app-store-distributable options; no iOS requirement removes RN's classic justification but its Android-specific profile still wins on the evidence in §3–4 |
| Framework | React Native + Hermes + New Architecture | Medium-High | Same as above |
| State architecture | Framework-agnostic TS domain layer, decoupled from UI | High | Directly answers §6's coupling requirement; de-risks the framework bet itself |
| Local persistence | On-device only (AsyncStorage/SQLite-equivalent) | High | No confirmed requirement for cloud/cross-device sync yet |
| Backend | None at MVP | Medium | Both plausible drivers (facilitator dashboard, LEARN-loop sync) are explicitly unconfirmed in existing docs |
| Offline strategy | Offline-first for the whole game loop; online only for external resource links | High | Directly matches `PRODUCT.md`'s stated constraints |
| Testing strategy | New RN-native UI-automation stack (Detox/Maestro), domain layer unit-tested directly | Medium | Real, necessary, not yet designed — first vertical slice is also the first test of this |
| Prototype reuse | Port logic/content/domain as TS; rebuild UI natively against RN primitives | Medium-High | Capacitor's documented WebView weakness on animation-heavy content rules out literal UI reuse |
| Real-device strategy | Required before the vertical slice is trusted, not deferred to release | High | Named as the primary constraint; project has zero real-device evidence today |

**Decisions we can make now:** platform/framework direction, domain-layer extraction as the
first concrete step, no-backend-at-MVP.

**Decisions we should defer:** exact RN animation library choice (Reanimated vs. Skia-based, or
a mix) — decide once the vertical slice's actual animation needs are being built, not
speculatively; the specific UI-testing tool (Detox vs. Maestro) — same reasoning.

**Assumptions that need validation:** that §3–4's general RN/Flutter/Capacitor benchmarks
actually hold for HUSTLE's specific content on HUSTLE's specific target hardware — they're
industry figures, not measurements of this app. The facilitator-dashboard requirement itself is
still `[assumed]` in `PRODUCT.md` and should be resolved before it's allowed to justify any
backend work.

**Experiment needed before full commitment:** the one vertical slice named in §11, measured on a
real low-end Android device against `research/low-literacy-low-end-android.md`'s existing budget
numbers — this is the concrete gate between "recommended" and "confirmed."
