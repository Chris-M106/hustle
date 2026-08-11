# TESTING.md — HUSTLE

> Written 2026-08-08 to make explicit and permanent a practice this project already followed
> ad hoc through Phase 1, Phase 2.5, and the `DESIGN.md` Sunrise passes (all of which used
> Playwright/headless-browser verification against a running render, not just source review —
> see `ROADMAP.md`'s change log for the bugs that verification style actually caught: the
> sticky-dock/tap race, the stage-stepper 360px overlap, the aborted-View-Transition console
> errors). This file states it as a requirement rather than an implied habit, and defines the
> workflow, viewport matrix, and validation hierarchy that requirement runs on.
>
> See `PRODUCT.md` → "Product target vs. current implementation" for why this matters: HUSTLE
> is a mobile application, not a website, and a mobile application's correctness lives in how
> it actually behaves on a touch device under real constraints — not in whether its source
> reads correctly.

## Environment status (added 2026-08-11, built same day)

**A standing Playwright harness now exists** — `package.json`, `playwright.config.js`,
`tests/smoke.spec.js`, chromium installed via `npx playwright install`. Run with
`npx playwright test` from the project root; serves `prototype/` on `127.0.0.1:4173`
via `http-server` (auto-started by Playwright's `webServer` config) and runs against
all three matrix viewports below (`android-360x640`, `android-412x915`,
`desktop-1280`).

Current coverage is a smoke tier only — launch/console-error check, landing-screen
visibility, and a real trial-click on the primary CTA (item 1 of the "Automated
coverage" priority list below). Items 2-8 (archetype through state persistence) are
**not yet written** — extend `tests/smoke.spec.js` or add new spec files per journey
as Phase 2 work touches those stages.

One real bug the harness caught immediately: the first draft of the "clickable
primary control" test picked up the `.skip` accessibility skip-link (visible per
Playwright's definition, positioned off-screen until focused) as the landing page's
"first visible button," and the trial-click timed out because that element sits
outside the viewport. Fixed by excluding `.skip` from the selector — a live example of
this file's own point: a DOM-present element is not automatically a genuinely
interactive one, and only running against the actual render surfaces that gap.

9/9 tests passing across all three viewport projects as of 2026-08-11.

## The two standing rules

**1. HUSTLE is a mobile application.** Design and evaluate mobile-first — start from the phone,
never shrink a desktop layout down. Low-end Android, prepaid/limited data, possibly a shared
device are the primary constraints, not edge cases (`PRODUCT.md` → "Who it is for" /
"Constraints that actually bind").

**2. A feature is not verified until the actual rendered application has been operated and
observed to behave correctly.** None of the following, alone, count as verification:

- the code compiles
- the build succeeds
- the DOM contains the expected element
- a unit test passes
- the source code appears logically correct on read-through

Each of those can be true while the feature is broken in the browser a real player uses — this
project has hit this exact gap more than once (the sticky-dock tap bug passed every source-level
check and only failed under an actual fast tap sequence; the font-CDN removal only proved itself
offline once no external requests were observed on a live network trace). Source review is a
useful first pass, not a substitute for the render.

## The verification loop

```text
OPEN → INTERACT → OBSERVE → SCREENSHOT → ANALYZE → FIX → REOPEN → RETEST
```

Use browser automation (Playwright, this project's established tool — see the scratchpad
scripts referenced in prior session work) wherever available. The agent should be able to:

- launch the application and navigate through screens
- click/tap controls, type input, scroll, select options
- inspect rendered state, console errors, and network behaviour
- capture screenshots
- test loading, error, and edge-case states, not just the happy path
- verify state persistence across reloads
- repeat the same journey after a fix to confirm the original failure is actually gone

**Actively try to break the application** — an unexpected tap order, a fast double-tap, a
mid-transition navigation, a reload mid-run. The happy path passing is necessary, not
sufficient.

## Fix discipline

```text
REPRODUCE → IDENTIFY ROOT CAUSE → FIX → RE-RUN THE SAME JOURNEY → REGRESSION CHECK → VERIFY
```

Do not patch symptoms, and do not declare something fixed because the code changed — the
original failure must be reproduced against the running app and shown to be gone. (This project
has a concrete example of getting this wrong mid-session: a first fix attempt for the sticky-
dock bug — `padding-bottom:7rem` on the parent — looked plausible on read-through and was wrong;
only re-testing against the render caught it, forcing a second, correct fix.)

## First-time-player probing

For important product iterations, run a first-time-user probe with **no priming** — don't tell
the agent what a screen means before it looks at the screen. The point is discovering whether
the interface communicates its own purpose.

Assume the player has never used HUSTLE, has no prior interface knowledge, has limited business
vocabulary, is motivated to succeed, and is on a low-end Android-type device. At every major
stage, ask:

- What would a first-time player think this screen means?
- Is the next action obvious? What would they try to tap?
- Is anything untappable that looks tappable, or vice versa?
- Is unnecessary reading required? Is terminology confusing?
- Does the screen feel like an app, not a webpage?
- Does anything look broken? Is feedback understandable?
- Could the player continue without external explanation?

## Mobile interaction testing

A visually correct element is not necessarily a functionally touchable one — a button that
exists in the DOM but can't reliably be tapped is a product failure, not a minor bug. Test
actual interaction, not just presence, with particular attention to:

- sticky/fixed elements and overlays (this project's own confirmed failure mode: a sticky dock
  pinning at scroll position 0 on short content, overlapping the control beneath it)
- z-index conflicts, scroll behaviour, horizontal carousels, bottom navigation
- touch targets, especially near screen edges, and accidental-tap risk
- safe-area insets, viewport changes, keyboard interaction

Verify **both** mouse and touch interaction paths where the testing tool supports it — they can
diverge (a known Playwright/headless-Chromium limitation: `touchscreen.tap()` on a nested child
inside a `<button>` doesn't always bubble reliably, while a direct button-box tap or
`mouse.click()` does; that's a testing-tool artifact with no real-device analog, not an app bug
— but it means never trusting only one interaction method's pass/fail).

## Network and performance probing

Because the target audience may be on prepaid data and low-end hardware, test under constrained
conditions, not just a fast dev-machine connection:

- cold-load payload size and startup time
- image and font loading (verify no external CDN dependency where one is claimed removed —
  confirm via a live network trace, not by removing the `<link>` tag and assuming)
- behaviour under throttled/slow/intermittent network (CDP `Network.emulateNetworkConditions` or
  equivalent)
- repeated-visit/cached-asset behaviour
- memory-heavy effects (animation, canvas/WebGL) on a capped-DPR, low-memory profile

Don't assume a dependency is acceptable because the desktop experience feels fast — measure.
`research/low-literacy-low-end-android.md` has this project's specific payload/money budget;
this file is about *how* to check the build against it, that page is *what* the numbers are.

## Visual inspection

Inspect the actual rendered interface via screenshot/device inspection — hierarchy, typography,
spacing, density, touch ergonomics, responsive behaviour, loading/empty/error states, and
whether it reads as "premium and app-like" or "a website on a phone." Don't judge visual quality
from source alone; this project's own `DESIGN.md` correction log has at least one case (the
ledger's pivot-day mark) where the documented mechanism and the actual rendered output had
diverged and only a `getComputedStyle` check on the live render caught it.

## Viewport / device matrix

| Priority | Viewport | Why |
|---|---|---|
| Primary | 360×640 | Representative low-end Android baseline — start every first-time-player probe here. |
| Secondary | 412×915 (or similar larger modern Android) | Confirms the layout isn't tuned to one exact size. |
| Tertiary | 768, 1280 | Desktop/tablet secondary access — not the design target, but shouldn't break. |

Test both portrait orientation as default and note where orientation-change or safe-area
behaviour matters.

## Automated coverage

Where practical, establish Playwright coverage for critical journeys — prioritized:

1. First launch / onboarding
2. Archetype selection
3. Scanner
4. Plan
5. Crisis (full 14-day run)
6. Ending
7. State persistence across reload
8. Critical navigation and error states

Automated happy-path coverage and exploratory agentic probing are **complementary, not
interchangeable** — automation catches regressions on known journeys; exploratory interaction
finds the things nobody thought to write a test for (this project's dock-tap bug was found this
way, not by an existing test).

## Real-device validation hierarchy

Browser mobile emulation is useful but is not equivalent to a real low-end Android device.
Escalate through this hierarchy; use the top of it for routine work, the bottom for
release-level or architecturally significant changes:

1. Source/unit tests
2. Automated browser tests (Playwright)
3. Agentic browser exploration (the loop above)
4. Throttled mobile/network emulation
5. Real low-end Android device testing

Don't require a physical device for every small change — use it strategically, for high-risk
changes or before a release, not as a routine gate.
