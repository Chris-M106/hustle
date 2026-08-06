# Competitive teardown — named products, mechanic by mechanic

> Researched 2026-08-06. Goal: stop surveying genres and start naming competitors. The other
> pages in this wiki describe *categories* (financial literacy games, engagement mechanics);
> none of them names a product HUSTLE would lose a bake-off against and says why. This page
> does. Every entry gives: what it is, the mechanic worth stealing, the mechanic worth
> refusing, and the evidence. Unverifiable claims are marked **[assumed]** per project
> convention.
>
> Deliberately does **not** re-cover EVERFI / FutureSmart / Stock Market Game (see
> `financial-literacy-education.md`) or the Duolingo streak / Idle Miner battle pass (see
> `engagement-mechanics.md`). Duolingo appears here only for its *onboarding* and *low-end
> Android engineering*, which those pages don't touch.

---

## Band 1 — Business/tycoon sims: what makes a decision loop legible

### Lemonade Stand (MECC, 1973; Apple II port 1979)

The oldest ancestor of HUSTLE and still the cleanest. Each round: choose stock, price, and
advertising against your current cash; results are randomised on top of your inputs plus
events like thunderstorms and street closures. That is structurally the *same game* as
HUSTLE's Stage 4 — a 14-day loop of cash decisions punctuated by load shedding.

- **Steal:** the variable count. Contemporary assessments credit it with "just enough
  variables to make a complex challenge... but still a simply-grasped introduction to the
  offsetting priorities facing a business." Three levers, one random shock, immediate
  settlement. Every round *closes* — you see the day's profit before the next decision.
- **Refuse:** its pure-randomness settlement. A thunderstorm that wipes you regardless of
  skill teaches fatalism, which is the exact wrong lesson for an unemployed-youth audience
  already surrounded by uncontrollable shocks. HUSTLE's load-shedding events must remain
  *survivable by preparation*, not coin flips.
- **Evidence:** MECC/Bob Jamison 1973, Kellner Apple II port 1979, bundled with Apple
  machines through the 1980s; source later open-sourced.

### Game Dev Tycoon (Greenheart Games, 2013)

The genre's best-known "your choices are legible" sim. Design loop: pick topic + genre +
platform, then allocate development time across gameplay/story/graphics/sound in three
phases. Post-release, **reviewer feedback names what fans liked and disliked**, which you
feed into the next project.

- **Steal:** the *review screen between runs*. The game's teaching happens in the gap
  between projects, not during them — a named critique of your last decisions, delivered
  before you make the next set. This is the single most transferable mechanic on this page
  and it is exactly what `decision-journal-and-feedback-loops.md` argues HUSTLE lacks.
- **Refuse:** the hidden topic/genre compatibility matrix. Wiki-scraping is the actual
  meta-game — players optimise against a lookup table rather than reasoning. HUSTLE's
  Scanner (Demand/Competition/Cost) must stay reasoned-about, not memorised.
- **Evidence:** $8 title; the studio's own 2013 piracy experiment measured 3,104 pirated
  players against 214 buyers (~94%) in the first day — a published, verifiable number, and
  incidentally a warning about the price point at which a paid download dies.

### Kairosoft's mobile line (Game Dev Story, 2010, and successors)

Kairosoft is the proof that this loop works on a phone at all — *Game Dev Story* was their
first mobile title and Eurogamer's Keza MacDonald called it "the best thing I've ever played
on the iPhone."

- **Steal:** **carry-over between playthroughs.** You retain direction points and genre/type
  levels across runs, so a second playthrough starts from earned knowledge. HUSTLE's stated
  pedagogical goal is repetition (`engagement-mechanics.md` proposes a replay mark); Kairosoft
  shows the mechanical version — replay is *mechanically* better, not just badged.
- **Refuse:** discovery-by-obscurity. Kairosoft's depth is systems you're meant to stumble
  into over many runs, and reviewers note the formula repeats across titles until novelty
  drains. A learner on prepaid data gets one or two runs, not twenty. HUSTLE cannot fund its
  teaching from run #7.
- **Evidence:** Metacritic/Eurogamer reception; Kairosoft wiki documents the carry-over
  mechanic explicitly.

### Motorsport Manager Mobile (Playsport Games)

The best-tuned *complexity ceiling* on mobile in this genre.

- **Steal:** the calibration. Reviews describe it as sitting "in the complexity spectrum
  wherein it requires frequent decision-making, without ever inducing paralysis by presenting
  too many options simultaneously," with a race weekend blazable "in minutes." That is
  HUSTLE's 12–18 minute Play Mode target, hit by a commercial product.
- **Refuse:** its phone layout. The same reviews flag elements "excessively spread out on
  tablets, but cramped on phones" — a management sim ported down rather than designed up.
  HUSTLE is phone-first or it is nothing.

### Capitalism Lab (Enlight/Trevor Chan lineage)

The maximalist end: full supply chains, macro coupling (GDP → risk appetite → asset prices →
inflation), marketed on Harvard and Stanford having used the Capitalism series as a teaching
tool.

- **Steal:** nothing mechanical. Steal the *positioning* — it sells to educators on named
  institutional adoption. HUSTLE's NQF/SAQA 49648 alignment is the same asset and is
  currently invisible in the product.
- **Refuse:** everything else. Desktop-only, hours-long, requires an instructor to scaffold.
  This is the failure mode HUSTLE's `PRODUCT.md` critique already named — "a simulation
  inside a webpage." Capitalism Lab is what that becomes if you keep adding realism.

---

## Band 2 — Financial literacy and entrepreneurship for African / emerging markets

**Verification note up front:** the handoff named "Bloom" as a South African product. **I
could not verify any South African youth financial-literacy app called Bloom.** The Blooms
that exist are a US teen investing app (Bloom Investing) and Fidelity Bloom (US). Treat the
SA "Bloom" as **[assumed non-existent]** until someone produces a store listing. Nor could I
verify a Zanaco financial-literacy app; Absa's ReadytoWork is the real product in that slot
and is covered below. This matters: HUSTLE's competitive set is smaller and more
government-shaped than a genre survey suggests.

### SAYouth.mobi (Harambee Youth Employment Accelerator) — the real incumbent

Not a game, and *the most dangerous competitor on this page*, because it already occupies
HUSTLE's exact user, device, and moment.

- **What it is:** the national youth work-seeker platform launched 2021 under the
  Presidential Youth Employment Intervention. Over **5.7 million registered**, 4 million+
  supported, 2 million+ reaching earning opportunities. Lists learnerships — i.e. it is the
  funnel that puts learners into the NQF programmes HUSTLE is taught inside.
- **Steal, urgently: it is zero-rated.** Data-free on MTN, Vodacom, Cell C, Telkom and Rain.
  A young person browses, registers and applies without spending a cent of prepaid data.
  Also steal the `.mobi` build discipline and the geo-matching feature that explicitly
  targets the *transport cost* barrier — a competitor that designs against the cost of
  getting to the opportunity, not just the opportunity.
- **Refuse:** its content model. It is a directory and an application funnel; it does not
  teach a decision. That gap is HUSTLE's actual reason to exist.
- **Uncomfortable read:** HUSTLE currently spends ~1.27 MB before the learner chooses
  anything, ~90% of it an autoplaying video (`PRODUCT.md`). Against a zero-rated incumbent,
  that is not a polish issue. Zero-rating is a commercial negotiation with networks, not a
  code change — but it is the bar the audience has already been taught to expect.

### Arifu (Nairobi)

Chatbot learning over interactive SMS *and* smartphone chat apps, working with or without
internet or airtime; content built with banks, MNOs, agribusinesses and NGOs. Serving
**1.2M+ learners** across Kenya, Zambia, Rwanda, Tanzania, Nigeria, Uganda; a Mastercard
Strive programme partner delivering practical small-business tips.

- **Steal:** the **distribution-first** design. Arifu did not build an app and hope; it
  embedded in the channel the learner already has and let partners fund the content. HUSTLE
  has no distribution story in `PRODUCT.md` beyond "**[assumed]** spreads by WhatsApp" —
  and no `og:` tags to survive that.
- **Refuse:** chat-only delivery. A branching text conversation cannot render the Scanner's
  Demand/Competition/Cost comparison, which is the one genuinely visual decision in HUSTLE.

### Eneza Education / Shupavu291

SMS + USSD + web learning on feature phones, national-curriculum-aligned, with an
"Ask-a-Teacher" service answering inside ~30 minutes. **10M+ learners since 2012**, at
**$0.03/day, $0.15/week, $0.50/month.**

- **Steal:** the price anchor. A competitor has established what learning-on-a-phone costs
  this market: cents. Any HUSTLE monetization thinking (`engagement-mechanics.md`, ROADMAP)
  is bounded by that number, not by app-store norms.
- **Steal:** a **human** in the loop with a response-time SLA. HUSTLE has a facilitator
  standing in the room and uses them for nothing.
- **Refuse:** subscription-gating the core. Any per-day charge on HUSTLE collides with the
  fact that the learner is *already* paying for the data.

### M-Shule (Kenya)

SMS/chatbot personalised micro-courses, no smartphone, no data, no airtime required.
23,000+ learners direct, 30 counties plus Uganda and Tanzania; reports **7–20% higher exam
scores** versus peers, and its course line now explicitly includes **financial literacy and
vocational skills** — i.e. it is moving into HUSTLE's subject matter from below.

- **Steal:** publishing an outcome delta. A number like "7–20% higher" is what a SETA or a
  funder buys. HUSTLE has no measurement design at all.
- **Refuse:** its scale ceiling as a model — 23k after years is a reminder that SMS
  economics cap growth. Smallness is not automatically virtue.

### Ubongo (Tanzania)

Edutainment via TV, radio, mobile — **48M+ households**, 80+ broadcasters, 23 countries,
13 languages. Evaluated with RCTs, focus groups, mobile surveys and longitudinal studies;
Tanzanian 3–6 year-olds watching *Akili and Me* for a month outperformed peers by 24% in
counting, 13% in ESL, 9% in fine motor skills.

- **Steal:** **localisation as a first-class asset, and the research function.** Ubongo's
  differentiator is that content is culturally specific, and that they can prove it worked.
  `PRODUCT.md` correctly identifies HUSTLE's local writing — shisanyama, spaza row, Stage 4
  — as "the best thing in the product." Ubongo shows that is the moat, not the garnish.
- **Refuse:** broadcast one-to-many. No decision loop, no consequence.

### Absa ReadytoWork

Free e-learning across work / money / people / **entrepreneurial** skills, pan-African, with
job search built in; iOS and Android apps exist (App Store ZA listing verified). Absa
reports **23,000+ young people upskilled**.

- **Steal:** the **corporate-sponsored free tier**. This is the funding model that works in
  this market — EVERFI's model too (`financial-literacy-education.md`). A bank pays,
  the learner doesn't.
- **Refuse:** its format. Modules and quizzes with a bank's logo on them. This is HUSTLE's
  clearest positive differentiation and should be defended loudly: ReadytoWork *tells*, HUSTLE
  *simulates*. **[assumed]** — I did not complete a walkthrough of the ReadytoWork course
  content (the platform's TLS chain failed to verify on fetch); the "modules and quizzes"
  characterisation is from Absa's own descriptions, not a screen-by-screen review.

### The Kidpreneur (Ethiopia)

The single closest direct competitor found — AI-driven entrepreneurship simulation for ages
8–18, "web-based platform optimized for low-end devices," bilingual English/Amharic. Three
modes: Quest (AI-generated scenarios adapting to each decision), Builder (Business Model
Canvas with AI guidance), Startup (**AI plays your customer and gives real feedback**).
Competency framework mapped to **EMPRETEC**, the UN's global entrepreneurship programme.

- **Steal:** the **external competency framework mapping**. Kidpreneur anchors to EMPRETEC;
  HUSTLE has SAQA 49648 available and doesn't visibly claim it. Also steal "AI plays your
  customer" as a concept — a Stage 3 business plan critiqued *in character* by a KwaDream
  customer would beat HUSTLE's current silent grading.
- **Refuse:** AI-generated scenario content. HUSTLE's authored, local, unsentimental writing
  is better than generated scenarios will be, and generation is a per-session data and
  latency cost this audience cannot pay.
- **Evidence / caveat:** self-reported **300+ students piloted, 11+ schools**. That is a
  pilot, not a product — HUSTLE is not behind here on scale, only on framework legibility.

---

## Band 3 — Learnership / accreditation-adjacent e-learning on cheap phones

Thin band, and that is itself the finding. SETA-accredited providers (e.g. SpecCon Holdings,
accredited across 7 SETAs, 300+ course library) sell a conventional LMS to employers, with
learners studying "from home using a smartphone or laptop." I found **no** SETA-accredited
provider marketing a genuinely low-data or WhatsApp-delivered learnership curriculum.

- **Steal:** the B2B2C sale. These providers sell to the employer/SETA and the learner
  receives it free — the commercially proven route into exactly HUSTLE's deployment context.
- **Refuse:** LMS-shaped content (video + PDF + multiple choice), which is what "mobile
  learning" means in this market today and is unusable on prepaid data.
- **The opening:** a genuinely offline-capable, sub-megabyte, accredited-curriculum
  simulation has no named competitor in South Africa that I could find. **[assumed]** —
  absence of evidence from web search is weak evidence of absence; a procurement-side check
  with a SETA would be worth more than more searching.

---

## Band 4 — Onboarding and first-session craft on low-end Android

### Facebook Lite (Meta, 2015)

The canonical build. Stated goals: **under 1 MB APK**, usable on 2G, working on Gingerbread
and a **2009-year-class device**.

- **What it sacrificed:** photo preloading (scrolling is slower, data is cheaper); shipped
  translations and images, pulled from the server on demand and cached; **Unicode symbols
  instead of image assets for icons**.
- **What it refused to sacrifice:** the core feed and the ability to post. It stayed
  Facebook. It also kept a single persistent connection with dynamic shared-dictionary
  compression — i.e. it spent engineering effort rather than features.
- **Steal, directly:** Unicode/system glyphs over image icons. HUSTLE currently uses emoji as
  its entire icon system (`PRODUCT.md`) — which is the *right instinct executed as an
  accident*; Facebook Lite made the same call deliberately and for the same reason.

### Duolingo — the low-end Android programme (not the streak)

- Cut Android download from **46 MB to 20 MB (56%)** via App Bundles, explicitly because
  "many of their users have entry-level devices with limited storage." 32% of remaining size
  is assets, mostly images, now monitored automatically for regressions.
- Ran **200+ A/B tests in 2024** targeting emerging-market performance, optimising for
  *conversion*, not latency: app-open conversion on entry-level devices went **91% → 94.7%**,
  and users waiting 5+ seconds fell **39% → 8%**.
- **Steal:** measuring performance in conversion terms. "Did the learner get in" is the
  metric, not milliseconds.
- **Refuse nothing here.** This is the discipline HUSTLE has none of.

### Duolingo — the onboarding order

The sign-up screen sits **behind the first lesson**; moving it there reportedly lifted DAU by
**20%**. Onboarding asks ~3 things. Unregistered users get the core loop; leaderboards are
what's withheld. The paywall appears only after a small win.

- **Steal:** value before identity. HUSTLE should never gate Stage 1 behind anything.
- **Refuse:** the 38-screen onboarding flow modern Duolingo has accreted. On prepaid data
  every pre-value screen is a charge.

### Google's Go family — the cautionary tale

YouTube Go shut down **August 2022**; Google's reasoning was that the main app had improved
enough on entry-level devices and networks that a separate lite build no longer earned its
keep. Files Go survived by dropping "Go" and becoming *the* product.

- **The lesson:** a separate "lite version" is a maintenance liability that eventually loses
  to the main product getting better. **Do not build HUSTLE Lite.** Build HUSTLE at
  Lite's weight.

---

## HUSTLE application

### Adopt — ranked

1. **The between-runs review screen (Game Dev Tycoon).** Named critique of the decisions you
   just made, delivered before the next run. Highest leverage on this page, and it converges
   exactly with `decision-journal-and-feedback-loops.md` from a completely different
   direction — two independent research passes landing on the same mechanic is the strongest
   signal in this wiki.
2. **Payload discipline as a product feature, Facebook Lite style.** Target sub-1 MB to first
   decision. Kill the autoplaying video. Unicode/system glyphs, deliberately. Measure it the
   Duolingo way — entry-level-device *conversion into Stage 1*, not load time.
3. **Value before identity (Duolingo).** Stage 1 must be reachable with zero gates, and any
   future save/account prompt belongs *after* the first opportunity is scanned.
4. **Mechanical carry-over between runs (Kairosoft), not a badge.** Replay should start
   smarter — e.g. previously-read Learn cards stay unlocked, previously-seen crisis events
   are annotated with what you did last time.
5. **An external competency claim (Kidpreneur/EMPRETEC, Capitalism Lab/Harvard).** SAQA 49648
   is sitting unused on the shelf. Put it on the page.
6. **A published outcome number (M-Shule 7–20%, Ubongo 24%/13%/9%).** Even a crude pre/post
   on a single cohort beats zero. This is what funders and SETAs actually buy.
7. **A human-in-the-loop role for the facilitator (Eneza's Ask-a-Teacher).** The facilitator
   is in the room and the product ignores them.

### Deliberately do not adopt

- **A separate lite build.** YouTube Go's shutdown is the argument.
- **Randomness as the settlement mechanism (Lemonade Stand).** Shocks must be survivable by
  preparation for this audience specifically.
- **Hidden optimal-combination tables (Game Dev Tycoon), or depth that only pays off on run
  #7 (Kairosoft).** HUSTLE gets one or two runs per learner.
- **AI-generated scenario text (Kidpreneur).** The authored local voice is better and free at
  runtime.
- **Added realism (Capitalism Lab).** HUSTLE's diagnosed problem is that it already reads as
  a simulation, not a game. More systems makes it worse.
- **Per-day subscription on the core (Eneza).** The learner already pays, in data.

### Where HUSTLE is currently weaker than a named competitor

Stated plainly, no hedging:

- **vs. SAYouth.mobi — data cost.** They are zero-rated on all five major networks and have
  5.7M registered users on HUSTLE's exact demographic. HUSTLE spends 1.27 MB on a video
  before a decision is made. On the single constraint `PRODUCT.md` says binds hardest, HUSTLE
  is losing to an incumbent that already owns the audience.
- **vs. Absa ReadytoWork and Arifu — distribution and funding.** Both have a named payer and a
  channel. HUSTLE has a Netlify URL and an **[assumed]** WhatsApp rumour, with no `og:` tags
  to survive being shared there.
- **vs. Eneza / M-Shule / Ubongo — evidence.** Three competitors publish learner-outcome
  deltas from real evaluations. HUSTLE has published nothing and has no measurement designed
  in. `financial-literacy-education.md` already flagged EVERFI's ESSA Level III validation as
  the eventual bar; four more products clear some version of it.
- **vs. Motorsport Manager — session shape.** They hit "meaningful decisions in minutes,
  phone-sized" as a shipped commercial product. HUSTLE's own build can't agree with itself
  whether the crisis is 7 or 14 days (`PRODUCT.md`, unresolved).
- **vs. Kairosoft — replay.** Their second run is mechanically different. HUSTLE's is
  identical, which makes its stated pedagogy of repetition a hope rather than a mechanic.
- **vs. Game Dev Tycoon — the price lesson, sideways.** A well-reviewed $8 tycoon game saw
  ~94% piracy on day one. Any paid-download plan for a prepaid-data audience is dead on
  arrival; the viable models on this page are all sponsor-funded (Absa, EVERFI), B2B2C
  (SpecCon/SETA) or cents-per-week (Eneza).

**Where HUSTLE genuinely leads, and should defend:** it is the only product found that is
*simultaneously* a real decision simulation, locally and specifically written, and aimed at
the NQF learnership context. ReadytoWork has the context but not the simulation. Kidpreneur
has the simulation but not the locality or the scale. Nobody has all three. That is a real
position — it is just not currently being claimed, funded, measured, or made cheap enough to
reach.

## Sources

- [Lemonade Stand (Wikipedia)](https://en.wikipedia.org/wiki/Lemonade_Stand)
- [Game Dev Tycoon Development Mechanics (Shapes)](https://shapes.inc/fandom/game-dev-tycoon/game-mechanics)
- [What happens when pirates play a game development simulator (Greenheart Games)](https://www.greenheartgames.com/2013/04/29/what-happens-when-pirates-play-a-game-development-simulator-and-then-go-bankrupt-because-of-piracy/)
- [Video game studio pirates its own game (CNN Money)](https://money.cnn.com/2013/04/29/technology/innovation/game-dev-tycoon-piracy/index.html)
- [Game Dev Story (Wikipedia)](https://en.wikipedia.org/wiki/Game_Dev_Story)
- [Game Dev Story (Kairosoft Wiki)](https://kairosoft.fandom.com/wiki/Game_Dev_Story)
- [Motorsport Manager Mobile 3 review (Stuff)](https://stuff.tv/app-reviews/motorsport-manager-mobile-3/review)
- [Motorsport Manager review (Stuff)](https://www.stuff.tv/game-reviews/motorsport-manager/review)
- [Capitalism Lab — Business Strategy Game](https://www.capitalismlab.com/business-strategy-game/)
- [Capitalism Lab — Educational Uses](https://www.capitalismlab.com/educational-uses/)
- [Harambee marks milestone of supporting 4 million young South Africans](https://www.harambee.co.za/harambee-marks-milestone-of-supporting-4-million-young-south-africans-on-sa-youth-platform/)
- [SA Youth.mobi opens pathways to jobs and training (SAnews)](https://www.sanews.gov.za/south-africa/sa-youthmobi-opens-pathways-jobs-and-training-young-people)
- [SA Youth is free to use — no data needed (SAYouth)](https://sayouth.mobi/View/ViewContent?cmsId=4e73dmbrjvtshr35zsscwapjxq)
- [Arifu (home)](https://arifu.com/)
- [Arifu — Mastercard Strive programme profile](https://www.mastercardstrive.org/programs/arifu)
- [AI Chatbot Platform Arifu is Helping East African Farmers (Synced)](https://syncedreview.com/2020/09/15/ai-chatbot-platform-arifu-is-helping-east-african-farmers-learn-finances-and-farming-skills-via-texts/)
- [Eneza Education (UNESCO financing toolkit)](https://www.unesco.org/en/dtc-financing-toolkit/eneza-education)
- [Eneza Education (HundrED)](https://hundred.org/en/innovations/eneza-education)
- [M-Shule SMS Learning & Training, Kenya (UNESCO UIL)](https://www.uil.unesco.org/en/litbase/m-shule-sms-learning-training-kenya)
- [M-Shule (home)](https://www.mshule.com/)
- [Ubongo — Impact](https://www.ubongo.org/impacts/)
- [Ubongo — How we do it](https://www.ubongo.org/what-we-do/how-we-do-it/)
- [Absa — Getting ReadytoWork](https://www.absa.africa/getting-readytowork/)
- [Absa ReadytoWork (App Store, ZA)](https://apps.apple.com/za/app/absa-readytowork/id1586779425)
- [The Kidpreneur](https://www.thekidpreneur.com/)
- [SpecCon Holdings — Accredited Training & Learnerships](https://speccon.co.za/)
- [How we built Facebook Lite for every Android phone and network (Engineering at Meta)](https://engineering.fb.com/2016/03/09/android/how-we-built-facebook-lite-for-every-android-phone-and-network/)
- [Duolingo case study (Google Play Console)](https://play.google.com/console/about/duolingo-casestudy/)
- [A little spring cleaning: reducing the app size by 20% (Duolingo blog)](https://blog.duolingo.com/emerge-tool-app-size/)
- [Duolingo's Android Performance Case Study and DAU Growth](https://mobile-vitals.com/article/2281-duolingo-duolingo-s-android-performance-case-study-and-dau-growth)
- [Duolingo — an in-depth UX and user onboarding breakdown (UserGuiding)](https://userguiding.com/blog/duolingo-onboarding-ux)
- [Duolingo Onboarding Teardown (Relaunch)](https://relaunch.ai/blog/duolingo-onboarding-teardown-7-b-tests-behind-their-9-conver.html)
- [YouTube Go to shut down in August (TechCrunch)](https://techcrunch.com/2022/05/05/youtube-go-shutting-down-august/)
- [Files (Google) — Wikipedia](https://en.wikipedia.org/wiki/Files_(Google))
