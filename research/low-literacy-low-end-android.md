# Low-literacy & low-end-Android constraints

> Researched 2026-08-06. Written first, deliberately: this page is upstream of every other
> research topic in this wiki. Art budget, payload, typography, animation, interaction targets
> and persistence are all downstream of the numbers here. If a mechanic proposed elsewhere
> can't survive these constraints, it doesn't ship.
>
> Method note: figures below are cited to named sources. Where a number could not be verified
> from a primary or reputable secondary source, it is marked **[assumed]** — the same
> convention `PRODUCT.md` uses. Measurements of HUSTLE's own payload were taken directly from
> `prototype/` on 2026-08-06 (`wc -c` and `gzip -9`), not estimated.
>
> Cross-reference, added 2026-08-08: this page defines the *constraints*; `TESTING.md` defines
> *how to verify the build against them* (throttled network probes, real-device validation
> hierarchy, viewport matrix) and `PRODUCT.md` states HUSTLE's platform target (mobile
> application, not a website) that makes these constraints binding in the first place.

---

## 1. What "low-end Android" concretely means

### The device floor

Android (Go edition) is the OS Google mandates for low-RAM devices, and its floor has moved:

| Android version | Minimum RAM for Go | Minimum storage |
|---|---|---|
| 8.1 (Go) | 512 MB | — |
| 11 (Go) | 1 GB | — |
| 13 (Go) | **2 GB** | **16 GB** |

Any device launching with Android 10/11 and **≤2 GB RAM must ship Android Go**
([Android Developers](https://developer.android.com/guide/topics/androidgo);
[XDA](https://www.xda-developers.com/android-go-edition-requirement-new-low-ram-devices/)).

In South Africa the retail floor is lower than the spec floor. Functional smartphones start
around **R129** (Mobicel S2 Plus at PEP), and the ZTE Blade A36 at **R799** is cited as the
only sub-R1,000 handset with guaranteed Android 13 updates and full 4G band coverage
([Gadget](https://gadget.co.za/r1000smartphones39f/)). The 2025 Budget cut the 9% ad valorem
luxury duty on smartphones under R2,500, which nudges the floor down further, not up.

**Design against:** 2 GB total system RAM, of which Chrome gets a fraction. A single-core
Cortex-A53-class core at ~1.4–1.8 GHz. **[assumed]** — exact SoC varies by handset; the
A53-class assumption is the standard entry-level Android profile and matches Alex Russell's
"$200 Android" baseline below.

### Background-tab eviction — the constraint that kills unsaved runs

Chrome on Android "kills background tabs aggressively in order to ensure memory usage is low"
([Chromium design docs](https://www.chromium.org/chromium-os/chromiumos-design-docs/tab-discarding-and-reloading/);
[Chrome for Developers](https://developers.google.com/web/updates/2015/09/tab-discarding)).
The `MemoryPressureListener` responds to OS pressure signals, not to a fixed threshold. The
"Discard tabs to save memory" behaviour is **enabled by default on devices with ≤4 GB RAM**.

Practical consequence: a learner who answers a WhatsApp message mid-run, or takes a call, or
whose classmate opens anything else, comes back to a **reloaded page**. Not a paused page — a
fresh document with fresh globals. `visibilitychange` may or may not fire before the kill;
`pagehide` is the more reliable last-chance hook, and even it is not guaranteed under OOM.

**Design against:** assume the page can be destroyed at any moment with **zero notice**.
The only correct model is write-on-every-state-change persistence, not write-on-unload.

### GPU / animation headroom

Entry-level Android GPUs (Mali-G52 MP1 / Adreno 610-class and below **[assumed]** for this
price band) are a real constraint, and there is a worse failure mode than slowness: if the
driver is blocklisted or hardware acceleration is off, Chrome falls back to **SwiftShader
software rendering**, where WebGL "works" but runs at single-digit FPS. Guidance for three.js
on mobile is: keep draw calls **under 50**, cap `devicePixelRatio` at 2, disable shadow maps,
halve texture resolutions — and note that **mobile GPUs thermally throttle**, so 60 FPS at
second 0 can be 20 FPS by second 30 under sustained load
([Simplified Media, WebGL & three.js](https://simplified.media/guides/webgl-threejs);
[Cinevva WebGL checker notes](https://app.cinevva.com/tools/webgl-webgpu-checker)).

**Design against:** ≤50 draw calls, `min(devicePixelRatio, 1.5)`, no shadow maps, no
post-processing, and a **mandatory non-WebGL fallback path** that is visually complete on its
own — not a blank box.

### Browser version floor

Android 13 Go devices ship a modern Chrome/WebView, and Chrome self-updates independently of
the OS, so evergreen-Chrome APIs are broadly safe. The realistic floor is **Chrome 100+**
**[assumed]** — StatCounter publishes per-version Android share for South Africa
([StatCounter, Android version share — South Africa](https://gs.statcounter.com/android-version-market-share/mobile/south-africa))
but the specific split was not read for this page and should be checked before relying on
anything newer than baseline-2023 (`:has()`, container queries, View Transitions).

### Storage

16 GB total on a Go device, with the OS taking a large share. Learners' phones are usually
near-full. **Design against:** localStorage quota is fine (~5 MB per origin) but treat a
`QuotaExceededError` from a full device as a **real** branch that must not crash the run.

---

## 2. Data cost as a design constraint — and an honest correction

### What a megabyte actually costs this learner

| Figure | Value | Source |
|---|---|---|
| SA average price of 1 GB, 2025 | **R20.50** | [ITWeb](https://www.itweb.co.za/content/rxP3jqBpLYL7A2ye) |
| **Prepaid** 1 GB bundle, 2025 (down from R100 in 2020) | **R79** | [ITWeb](https://www.itweb.co.za/content/rxP3jqBpLYL7A2ye) |
| Telkom 40 GB prepaid, per GB | ~R4.73 | [ITWeb](https://www.itweb.co.za/content/rxP3jqBpLYL7A2ye) |
| ICASA 2 GB basket | R152, below the 2% GNI benchmark | [ICASA State of the ICT Sector, Mar 2026](https://www.icasa.org.za/uploads/files/The-State-of-the-ICT-Sector-Report-of-South-Africa-31-March-2026.pdf) |
| 1 GB as % of average income, SA | **1.41%** | [Connecting Africa / GSMA-derived](https://www.connectingafrica.com/4g-networks/the-state-of-mobile-broadband-affordability-in-africa) |
| 1 GB as % of income, Africa average | 5.7% | same |

The number that binds is **R79/GB prepaid** — not the R20.50 blended average. Our learner buys
small bundles because they buy what they can afford today, and small bundles carry the worst
per-MB rate. **R79/GB = R0.077 per megabyte.**

Out-of-bundle rates are worse again and are the genuine risk (a learner whose bundle runs out
mid-run keeps browsing at punitive per-MB rates), but a current verified out-of-bundle tariff
was not found. **[assumed] R0.29–R0.99/MB** — verify with a current Vodacom/MTN tariff sheet
before quoting this to anyone.

### The derived payload budget

Two independent budgets, and they disagree about what matters:

- **Money budget.** Target: one full run should cost **under R0.25** of prepaid data — roughly
  the price of nothing, which is the point; the learner must never weigh "can I afford to
  finish". At R0.077/MB that is **~3.2 MB total, all requests, all reloads.**
- **Time/CPU budget.** Alex Russell's real-world budget, baselined on a $200 Android on
  400 Kbps / 400 ms RTT: **130–170 KB gzipped critical-path**, ≤5 s first-load
  Time-to-Interactive
  ([Infrequently Noted, *Can You Afford It?*](https://infrequently.org/2017/10/can-you-afford-it-real-world-web-performance-budgets/);
  [*The Mobile Performance Inequality Gap*](https://infrequently.org/2021/03/the-performance-inequality-gap/)).

### Measuring HUSTLE honestly against both

Measured on disk, 2026-08-06:

| Asset | Raw | Gzipped |
|---|---|---|
| `prototype/hustle-shell.html` | 393,158 B | **114,115 B** |
| `prototype/vendor/gsap.min.js` | 72,214 B | **28,012 B** |
| `prototype/vendor/three.module.min.js` | 467,665 B | **117,488 B** |
| `images/yellowwood-sunrise-wide.webp` (the only referenced image) | 332,304 B | (already compressed) |
| Google Fonts — Anton + Archivo ×4 + JetBrains Mono ×2 | — | **~120 KB [assumed]** |
| **First-load total, over the wire** | | **~712 KB** |

**Verdict on the money budget: HUSTLE passes, comfortably.** ~712 KB ≈ **R0.055 per cold
load** at prepaid rates. Even ten cold loads across a session is ~55 cents.

**Verdict on the CPU budget: HUSTLE fails, badly.** ~260 KB of gzipped JS+HTML is **1.5–2×
Russell's entire critical-path budget**, and `three.module.min.js` alone (117 KB gz / 468 KB
raw) exceeds it. On a CPU-bound entry-level device the binding cost is **parse and compile of
468 KB of JavaScript**, not its transfer.

**This is a correction to `PRODUCT.md`.** The "Constraints that actually bind" table leads with
prepaid data and frames payload as primarily a money problem. At the current payload it is not.
The learner's phone will choke before their wallet does. Data cost was the right constraint for
the *deployed* build's 1.27 MB autoplaying video — a video is bytes *and* decode *and* battery —
but for the prototype the ordering should be **CPU/RAM first, bytes second**.

Three things follow that are still worth doing on the bytes:

1. **The `images/` folder is a loaded gun.** It holds **~26 MB** of PNGs (several single files
   over 3 MB) of which exactly **one 332 KB `.webp` is referenced**. One careless `<img src>`
   pointing at `South_africa_places_1.png` costs a learner **R0.23 in a single request** —
   four times the entire current page. The build step must physically exclude un-referenced
   `images/*.png`, not rely on discipline.
2. **The single-file HTML is the right call, and should stay.** 393 KB in one document means
   one request, no waterfall, and it works from a saved file or a warm cache with no network.
   The cost is cache granularity — a one-word copy edit invalidates all 114 KB. That's an
   acceptable trade for this audience; do not split it into modules to "fix" it.
3. **Google Fonts is a genuine own-goal.** Three families and seven weights, fetched from a
   third-party origin, on a cold DNS lookup over a 400 ms-RTT link, blocking text render.
   Self-host, subset to Latin, and cut to **two weights of one family plus one display face**.

---

## 3. Low-literacy and low-numeracy interface design

### The reading-level target

WCAG 2.2 SC 3.1.5 (Reading Level, Level AAA) requires that where text demands reading ability
above the **lower secondary education level** — defined by W3C as **7–9 years of schooling** —
a supplemental simpler version must exist
([W3C, Understanding SC 3.1.5](https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html);
[W3C technique G153](https://www.w3.org/WAI/WCAG22/Techniques/general/G153)). Critically, the
criterion explicitly permits **removing proper names and titles** before assessing — which is
exactly the exemption HUSTLE needs, because "shisanyama", "KwaDream" and "load shedding" are
proper nouns and local terms, not complexity.

For this audience the AAA target is not optional polish. PIRLS 2021 found **81% of South
African Grade 4 learners cannot read for meaning in any language**, up from 78% in 2016, with
SA ranked **last of 43 participating countries** (score 288 vs. the PIRLS centrepoint of 500)
([Daily Maverick](https://www.dailymaverick.co.za/article/2023-05-16-international-study-shows-81-of-grade-4s-in-south-africa-cannot-read-for-meaning/);
[University of Pretoria](https://www.up.ac.za/research-matters/news/study-shows-81-of-grade-4-learners-sa-have-reading-difficulties);
[Nic Spaull, 10 main findings](https://nicspaull.com/2023/05/18/10-main-findings-from-pirls-2021-south-africa/)).
An NQF Level 2 learner today was a Grade 4 learner inside that cohort. Reading fluency, not
business knowledge, is the likeliest failure mode of a run.

**Design against: Grade 7 reading level after proper-noun removal.** Sentences under ~15 words.
One idea per sentence. Active voice, second person — which the existing voice already does
("You have R2,500 and a dream").

### Icon-only never survives

The ICT4D literature is unambiguous and it is not new. Microsoft Research's Text-Free UI work
ran **570 participants and 700+ field hours** across India, the Philippines and **South Africa**
([Microsoft Research, UIs for Low-Literate Users](https://www.microsoft.com/en-us/research/project/uis-low-literate-users/);
[Medhi Thies, *UI Design for Low-literate and Novice Users*](https://courses.cs.washington.edu/courses/cse490c/18au/readings/medhi-thies-2015.pdf)).
Findings that matter here:

- **Abstract glyphs are semantically opaque** to low-literate users. Users prefer **concrete,
  photorealistic** representations over stylised icons.
- **Standard icons are actively misread** — a padlock meaning "secure" reads as "locked out /
  you can't have this". Directly relevant: any locked/gated affordance in HUSTLE risks reading
  as punishment.
- Interfaces need different designs for **illiterate vs. semi-literate vs. literate-but-novice**
  users, and text-only UIs are "severely error-prone for literate but novice users" — which is
  precisely our learner. They can read; they have never met the words.
- See also [Tuli et al., *Actionable UI Design Guidelines for Smartphone…* (CSCW 2021)](https://anupriyatuli.github.io/publications/2021_CSCW.pdf)
  for the SARAL synthesis of two decades of this literature.

**Design against: icon + always-visible text label, every time.** Never icon-only, never a
tooltip, never a long-press to reveal a name. An emoji with no label is the worst case of all —
it is an abstract glyph with cultural loading and no accessible name.

### Numbers

Frequencies and fractions are more accessible than percentages **at every numeracy level**, and
the strongest single rule is: **never ask the reader to do a calculation**
([Pennsylvania Health Literacy Coalition, Numeracy Best Practices](https://healthliteracypa.org/numeracy-best-practices-how-to-make-numbers-clear/);
[Cochrane plain-language-summary RCTs](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7201737/)).
A brief explanation or simple visual of *what the number means* is what makes it actionable.

**Design against:** "3 out of 10 customers", not "30% conversion". Always show the arithmetic's
*result* alongside its inputs — "R2,500 − R900 = **R1,600 left**", never R2,500 and R900 on
separate cards.

### How much text a screen can carry

**[assumed], but derived rather than guessed:** at Grade-7 reading fluency on a ~5.5" screen,
budget **≤45 words per screen** with no scrolling required to find the action, and **≤2
sentences** in any single block. Anything above that is where a learner scans, gives up, and
taps the biggest button.

---

## 4. Language reality

English is a **home language for only 8.7%** of South Africans — behind isiZulu (24.4%),
isiXhosa (16.3%), Afrikaans (10.6%) and Sepedi (10.0%), and roughly level with Setswana (8.3%)
([Census 2022, via South Africa Gateway](https://southafrica-info.com/arts-culture/the-languages-of-south-africa/)).
The overwhelmingly likely learner is operating in English as an **additional** language, while
simultaneously meeting business vocabulary for the first time. That is two cognitive loads
stacked, and GSMA's connectivity work identifies **literacy and digital skills** as one of the
two consistent barriers (with handset affordability) among people aware of mobile internet but
not using it
([GSMA, State of Mobile Internet Connectivity in Sub-Saharan Africa](https://www.gsma.com/solutions-and-impact/connectivity-for-good/mobile-for-development/blog/the-state-of-mobile-internet-connectivity-in-sub-saharan-africa/)).

Consequences:

- **Idiom is the enemy; local nouns are not.** "Load shedding" and "spaza" are *easier* than
  "power outage" and "convenience store" for this reader, because they are the words they
  already own. "Bite the bullet", "in the red", "cash is king" are harder. The existing voice
  rule in `PRODUCT.md` is correct and should be sharpened to name idiom specifically.
- **Build the localisation seam now, translate later.** The document is `<html lang="en">`
  with no string layer. Retrofitting i18n into 393 KB of interleaved markup and copy is the
  kind of task that never happens. Extracting strings into one object is cheap today.
- **Business terms need a first-use gloss, in-line.** Not a glossary screen — the learner will
  not navigate to it and back.

---

## 5. Shared devices and interruption

`PRODUCT.md` already names this. The research sharpens it into requirements.

A 45-minute period, ~30 learners, a handful of handsets **[assumed]** means a device is handed
over **mid-run**, not at a clean ending. Combined with Chrome's eviction behaviour (§1), the
persistence model has to satisfy three separate things that are often conflated:

1. **Crash/eviction resume** — same learner, same run, restore silently and exactly.
2. **Deliberate handover** — new learner, explicit destructive reset, must be *hard to do by
   accident* and *fast to do on purpose*.
3. **Multiple learners over a day** — a run belongs to a learner, not to a device.

The current prototype has **3 `localStorage`/`sessionStorage` references** — some persistence
exists, an improvement on the deployed build `PRODUCT.md` audited. But three references is not
a save system; it is not enough to cover named slots plus reset plus schema versioning.

**Design against:** write full state on every mutation (it's a few KB — cost is nil); key on a
**learner-chosen name**, not a device ID; version the schema so a mid-cohort deploy doesn't
brick in-flight runs; and treat `QuotaExceededError` as a normal branch.

---

## 6. Daylight on a cheap LCD

Entry-level phone LCDs run roughly **250–450 nits**; **1,000+ nits** is the threshold at which
a display is considered sunlight-readable, and direct midday sun wants 1,500–2,500
([Orient Display](https://orientdisplay.com/knowledge-base/tft-basics/sunlight-readable-tft-lcd/);
[Riverdi](https://riverdi.com/blog/sunlight-readable-displays-the-most-important-parameters-of-outdoor-lcd-displays-you-need-to-know)).
Our learner is therefore **2–6× short of readable** whenever they're outdoors or near a window,
and *effective* contrast — the on-screen ratio after ambient reflection — collapses toward 1:1
long before the nominal ratio does.

This is why WCAG's 4.5:1 is a floor here, not a target. Nominal 4.5:1 in a lab is well under
3:1 in a courtyard.

Tap targets: WCAG 2.2 SC **2.5.8 Target Size (Minimum), Level AA** requires **24 × 24 CSS px**
([W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/); [Silktide summary](https://silktide.com/accessibility-guide/the-wcag-standard/2-5/input-modalities/2-5-8-target-size-minimum/)).
That is the legal floor for a single-purpose page, not a good number for a thumb on a cracked
screen. **44 × 44 CSS px** with **8 px minimum separation** is the number to design to.

---

## HUSTLE application

Ordered by leverage. Each names the file, token or mechanic to change.

### A. Make three.js conditional, or cut it

`vendor/three.module.min.js` is **117 KB gzipped / 468 KB raw** — on its own it blows Russell's
entire 130–170 KB critical-path budget, and parse/compile is the dominant cost on an A53-class
core. `hustle-shell.html` has **15 `THREE.` references**, which suggests one background effect,
not a 3D game.

1. **Load it lazily and never on the critical path** — the first paint and the Stage 1 stat
   allocation must not wait on it.
2. **Gate it on a capability + budget check**: skip entirely when
   `navigator.deviceMemory <= 2`, when `navigator.connection.saveData` is true, when
   `prefers-reduced-motion: reduce`, or when the WebGL renderer string contains `SwiftShader`.
3. **The fallback must be the primary design.** A static `background-image` using the existing
   `yellowwood-sunrise-wide.webp` should look finished on its own. If the page only looks right
   with WebGL, the WebGL isn't optional and the budget question has to be re-opened properly.
4. **Honest challenge:** if three.js exists to render one animated background, replace it with
   CSS/SVG and delete the dependency. That single change recovers ~45% of the gzipped payload
   and the large majority of the parse cost. GSAP at 28 KB gz is defensible; three.js at 117 KB
   is not, for a background.

### B. Build-step guard on `images/`

Add a check that fails the build if any `images/*.png` is referenced from `hustle-shell.html`.
26 MB of unreferenced source PNGs sitting next to a shipping page is one autocomplete away from
a R0.23-per-load regression. Keep the sources; make them unshippable.

### C. Self-host and cut the type stack

`hustle-shell.html` currently pulls **Anton + Archivo (400/500/600/700) + JetBrains Mono
(500/700)** from `fonts.googleapis.com` — a third-party DNS lookup and a render-blocking
stylesheet on a 400 ms-RTT link. Self-host, subset to Latin, drop to **Archivo 400 + 700 and
one display weight of Anton**; JetBrains Mono earns its place only if numbers are genuinely
tabular-aligned somewhere it matters. `font-display: swap` is already set — keep it.

### D. Persistence: promote from 3 calls to a real save system

Replace the current ad-hoc storage with one `saveState()` that serialises the whole state
object, called on **every** mutation:

- `hustle:save:<learnerName>` — full state, plus `schemaVersion`.
- `hustle:lastActive` — for silent resume after eviction.
- **Silent restore on load.** No "resume?" dialogue — a learner who was evicted mid-Crisis
  should not have to make a decision about it.
- **Explicit handover**, not a hidden reset: a labelled `Hand phone to next learner →` control
  that names the current learner ("This ends Thabo's run") and requires one confirmation.
  Deliberate, one screen, no accidental path to it.
- **Guard `QuotaExceededError`** and degrade to in-memory with a plain warning rather than
  throwing. A full 16 GB Go device is the expected case, not the edge case.

### E. Icon+label everywhere; retire emoji-as-icon-system

`PRODUCT.md`'s anti-reference already flags emoji as the entire icon system. The ICT4D
literature makes it a correctness failure, not an aesthetic one: abstract glyphs are opaque to
this audience and standard icons get misread (the padlock→"you're locked out" finding is
directly relevant to Stage 1's stat gates at `network>=7` / `finance>=7` / `sales>=7`).

- Every interactive icon carries a **visible text label**, always. No tooltips, no long-press.
- **Reframe the locked insights.** A gated insight currently risks reading as punishment. Label
  it with what it *costs*, not with a lock: "Network 7+ sees who supplies this street" — a
  described reward is legible; a padlock is a slap.
- If a pictorial system is wanted, prefer **concrete and photographic** over stylised line
  glyphs, per the Medhi/Thies findings.

### F. Copy pass at Grade 7, and name idiom as the enemy

Run every string through a reading-level check with proper nouns excluded (WCAG 3.1.5 permits
the exclusion, and it protects the local voice that is the best thing in this product). Add one
voice rule to `PRODUCT.md`'s list:

> **No idiom.** Local nouns yes; figurative English no. "Load shedding" is easier than "power
> outage". "In the red" is harder than "you owe more than you have".

Business terms get a **first-use inline gloss** — `margin` → "margin (what's left after you pay
for the stock)" — not a glossary screen.

### G. Numbers as arithmetic, not as percentages

Wherever the Scanner or Crisis shows a rate, show it as a natural frequency with the result
computed for the learner:

- `HIGH demand` → "About 7 in 10 people walking past will buy" **[assumed numbers — needs the
  real `OPPS` data]**
- Every money change shows its full sum on one line: `R2,500 − R900 = R1,600 left`. Never make
  the learner subtract. This applies especially to the 14 Crisis days, where an unshown running
  balance is a compounding comprehension debt.

### H. Contrast and target tokens, set against daylight not against a lab

- Body and all numeric text: **7:1 minimum** (WCAG AAA), not 4.5:1 — because effective contrast
  outdoors on a 250–450 nit panel is a fraction of nominal.
- Primary CTA: **7:1** and never a light-on-light amber. (`PRODUCT.md` records the deployed
  build's CTA at **1.15:1** — invisible indoors, nonexistent outdoors.)
- Interactive minimum **44 × 44 CSS px**, 8 px separation — above WCAG 2.5.8's 24 px floor.
- Focus ring **≥3:1 against both** the focused control and the background, visible on every
  interactive element.
- Bake these as design tokens in `hustle-shell.html` so a future colour pass cannot quietly
  regress them.

### I. Cut the localisation seam now

Extract every user-facing string into a single `STRINGS` object keyed by id, with
`<html lang="en">` driving selection. Do not translate anything yet — just make translating
possible without a rewrite. With ~91% of South Africans speaking something other than English
at home, an isiZulu or isiXhosa pass is a plausible near-term ask, and it is only cheap if the
seam already exists.

### J. One correction to `PRODUCT.md`'s constraint table

The table orders prepaid data first. On the prototype's measured payload (~712 KB ≈ **R0.055**
per cold load) money is not the binding constraint — **RAM, CPU and tab eviction are**. Suggest
re-ordering the "Constraints that actually bind" table to lead with device capability, and
restating the data row as a *ceiling not to breach* (**≤3.2 MB per full run**, ≈R0.25) rather
than as the primary pressure. This does not weaken the constraint; it stops it being used to
justify decisions that a CPU budget would have caught first.

---

## Sources

**Device & platform**
- [Android (Go edition) — Android Developers](https://developer.android.com/guide/topics/androidgo)
- [Device capability for billions — Android Developers](https://developer.android.com/docs/quality-guidelines/build-for-billions/device-capacity)
- [Google plans to make Android Go required for new low-RAM devices — XDA](https://www.xda-developers.com/android-go-edition-requirement-new-low-ram-devices/)
- [Tab Discarding and Reloading — Chromium design docs](https://www.chromium.org/chromium-os/chromiumos-design-docs/tab-discarding-and-reloading/)
- [Tab Discarding in Chrome — Chrome for Developers](https://developers.google.com/web/updates/2015/09/tab-discarding)
- [StatCounter — Android version market share, South Africa](https://gs.statcounter.com/android-version-market-share/mobile/south-africa)

**Performance budgets**
- [Alex Russell, *Can You Afford It?: Real-world Web Performance Budgets*](https://infrequently.org/2017/10/can-you-afford-it-real-world-web-performance-budgets/)
- [Alex Russell, *The Mobile Performance Inequality Gap, 2021*](https://infrequently.org/2021/03/the-performance-inequality-gap/)
- [Addy Osmani, *The Cost of JavaScript*](https://medium.com/dev-channel/the-cost-of-javascript-84009f51e99e)
- [WebGL & three.js performance guidance — Simplified Media](https://simplified.media/guides/webgl-threejs)

**Data cost & connectivity**
- [The highs and lows of data prices in SA — ITWeb](https://www.itweb.co.za/content/rxP3jqBpLYL7A2ye)
- [ICASA, State of the ICT Sector Report, 31 March 2026](https://www.icasa.org.za/uploads/files/The-State-of-the-ICT-Sector-Report-of-South-Africa-31-March-2026.pdf)
- [The state of mobile broadband affordability in Africa — Connecting Africa](https://www.connectingafrica.com/4g-networks/the-state-of-mobile-broadband-affordability-in-africa)
- [GSMA, State of Mobile Internet Connectivity in Sub-Saharan Africa](https://www.gsma.com/solutions-and-impact/connectivity-for-good/mobile-for-development/blog/the-state-of-mobile-internet-connectivity-in-sub-saharan-africa/)
- [GSMA, Affordability of Internet-Enabled Handsets and Data (SOMIC 2025)](https://www.gsma.com/somic/affordability-of-internet-enabled-handsets-and-data/)
- [Gadget — 6 of the best sub-R1000 smartphones in SA](https://gadget.co.za/r1000smartphones39f/)

**Literacy, language & low-literate UI**
- [PIRLS 2021: 81% of SA Grade 4s cannot read for meaning — Daily Maverick](https://www.dailymaverick.co.za/article/2023-05-16-international-study-shows-81-of-grade-4s-in-south-africa-cannot-read-for-meaning/)
- [University of Pretoria — PIRLS 2021 findings](https://www.up.ac.za/research-matters/news/study-shows-81-of-grade-4-learners-sa-have-reading-difficulties)
- [Nic Spaull — 10 main findings from PIRLS 2021 South Africa](https://nicspaull.com/2023/05/18/10-main-findings-from-pirls-2021-south-africa/)
- [Census 2022 languages of South Africa — South Africa Gateway](https://southafrica-info.com/arts-culture/the-languages-of-south-africa/)
- [Microsoft Research — UIs for Low-Literate Users](https://www.microsoft.com/en-us/research/project/uis-low-literate-users/)
- [Medhi & Thies — *User Interface Design for Low-literate and Novice Users* (PDF)](https://courses.cs.washington.edu/courses/cse490c/18au/readings/medhi-thies-2015.pdf)
- [*Text-Free User Interfaces for Illiterate and Semiliterate Users* — ITID (PDF)](https://itidjournal.org/index.php/itid/article/download/243/243-579-2-PB.pdf)
- [Tuli et al. — *Actionable UI Design Guidelines for Smartphone…* CSCW 2021 (PDF)](https://anupriyatuli.github.io/publications/2021_CSCW.pdf)
- [Numeracy Best Practices: How to Make Numbers Clear — PA Health Literacy Coalition](https://healthliteracypa.org/numeracy-best-practices-how-to-make-numbers-clear/)
- [Framing numerical findings of Cochrane plain language summaries: two RCTs](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7201737/)

**Accessibility**
- [Web Content Accessibility Guidelines (WCAG) 2.2 — W3C](https://www.w3.org/TR/WCAG22/)
- [Understanding SC 3.1.5: Reading Level — W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html)
- [G153: Making the text easier to read — W3C WAI](https://www.w3.org/WAI/WCAG22/Techniques/general/G153)
- [WCAG 2.5.8 Target Size (Minimum) — Silktide](https://silktide.com/accessibility-guide/the-wcag-standard/2-5/input-modalities/2-5-8-target-size-minimum/)
- [Sunlight readable TFT LCD — Orient Display](https://orientdisplay.com/knowledge-base/tft-basics/sunlight-readable-tft-lcd/)
- [Sunlight readable displays: key parameters — Riverdi](https://riverdi.com/blog/sunlight-readable-displays-the-most-important-parameters-of-outdoor-lcd-displays-you-need-to-know)
