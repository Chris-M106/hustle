# ASSETS.md — HUSTLE art brief

> Written 2026-08-06. **This is a prompt book, not an art director's brief.** Every asset below
> carries a copy-pasteable generation prompt intended to be pasted into a modern image model
> more or less unedited. First pass is AI-generated on purpose — it produces the template a
> human illustrator (or a later, tighter model pass) can then match.
>
> Sources this was written against, all verified by reading, not inferred:
> `DESIGN.md` (Sunrise tokens, measured contrast), `PRODUCT.md` (audience, voice,
> anti-reference), `ROADMAP.md` (Phase 4 — this is now a consumer app, not only a classroom
> tool), the real markup of `prototype/hustle-shell.html`, and the reference images in
> `prototype/images/`, all of which were actually opened and looked at.
>
> **Never invent game content.** The five businesses, the four archetype outputs, the four
> verdict bands and the crisis deck below were read out of the shipped prototype. Anything
> marked **[PROPOSED]** is authored here and has no bundle behind it — it must not be treated
> as game canon until somebody decides it is.

---

## How to use this document

**1. Run a prompt.**
Paste the **Shared style preamble** (next section) first, then the asset's own
**Generation prompt** block, then its **Negative constraints** block. All three, every time, in
that order. The preamble is not optional decoration — it is the only thing making 33 separate
generations belong to one world. Generate 4 variants per asset; expect to keep 1.

**2. Iterate.**
Change *one* variable per re-roll — the dawn→day position, the camera height, or the density of
people — never the whole prompt. If a return drifts off-world, the fix is almost always to
re-state the palette hexes and the "single low sun" lighting clause, not to add adjectives. If
a model keeps baking in text, drop the word "sign" / "signboard" from the subject line and
describe the object as "a blank painted board" instead.

**3. Check on return — all five, before it enters the repo.**

| Check | How |
|---|---|
| Dimensions | Exactly the pixel size specified. Crop/resize rather than accept "close". |
| File size | Under the stated KB budget after conversion. `cwebp -q 78` is the working default; drop to `q 68` for anything behind a scrim. |
| Brand safety | Zoom to 100% and read every sign, wall, phone screen and vehicle. The reference poster in this repo carries four real telco logos and a national flag — a generated image will happily reproduce them. |
| Baked text | Any legible word in the image is a word that will need translating and can't be. Only the wordmark asset is allowed to contain letterforms. |
| Contrast on landing | Put the image behind the actual surface it lands on and check the text over it clears **4.5:1**. `bone` `#F5F0FA` is the text; if it doesn't clear, the fix is a solid scrim, never a translucent one — `DESIGN.md`: *"Never use a translucent fill behind text."* |

**4. Add it to the repo.**
`prototype/images/<name>` exactly as specified — lowercase, hyphenated, no spaces (the existing
`Hustle APP.jpeg` and `Typical hustle work place.jpeg` are reference material and stay as-is;
new production assets do not repeat that). Convert to webp, verify the budget, then wire the
mount point. Where an asset says *"not yet consumed"*, the mount point is a separate code change
and should be its own commit — do not land art and markup together.

**Never edit `prototype/hustle-shell.html` as part of an art drop.**

---

## The world split (decided — do not relitigate)

Two visual worlds, one narrative bridge.

**Poster world** — bright midday, chunky extruded display type, crowded frame, saturated. This is
what `prototype/images/Hustle APP.jpeg` establishes, and it owns everything **outside** the game:
store listing, splash, intro poster, Scanner job cards. Its job is to make somebody want in.

**Sunrise world** — the `DESIGN.md` token set: indigo-violet ground `#3E3050`, one orange accent
`#F2941C` sampled from the hero photo's own sun. It owns everything **inside** the game: the 14
trading days, crisis, ledger. Its job is to be legible on a cheap LCD in daylight for 25 minutes.

**The bridge is dawn → day.** The player starts alone at sunrise on an empty street and the market
fills and warms across the 14 days. The art must be generatable at points *along* that ramp, not
only at its two ends. Every asset below states its ramp position.

| Ramp | Name | Sky | Sun | Street |
|---|---|---|---|---|
| **0.0** | First light | Indigo-violet `#3E3050` overhead, `#5A415C` at the horizon | Below the horizon, a low warm rim only | Empty. One figure. Long shadows. |
| **0.25** | Sunrise | Violet above, `#FDB74D` band low | On the horizon, flaring | Two or three stalls opening. Shutters going up. |
| **0.5** | Mid-morning | Warm violet-grey fading to pale | Low-left, ~25°, raking | Half the stalls trading. First customers. |
| **0.75** | Late morning | Mostly warm neutral, faint violet at the top corners | High-left, ~50° | Busy. Most stalls open. |
| **1.0** | Full day | Bright blue, the poster world | Overhead | Crowded. This is `Hustle APP.jpeg`. |

The poster world is ramp **1.0**. The Sunrise world lives at **0.0–0.5**. Nothing sits at both.

**What the reference poster actually is, having looked at it:** a vertical AI painting of a
township marketplace at full midday under a bright blue sky with small cumulus. Fourteen named
stalls arranged in a dense grid across the frame — Nails & Beauty, Sew & Stitch, Wash Dry & Iron,
Shoe Clean & Repair, Car Wash, Tyres & Mechanic, Airtime Data & More, Phones & Accessories,
Print Copy CV, Photos, Recycle & Resell, Garden Care, Home Fix & Paint, Furniture & Pallets. Each
stall is a corrugated-iron and pallet-wood structure with a hand-painted board over it and a
worker mid-task. Behind them, a hillside of small brightly-painted houses. At the top, "HUSTLE"
in chunky 3D-extruded orange-to-yellow display caps with a heavy dark brown outline and visible
brush texture, over a cream torn-paper banner reading "Start small. Build big."

**It also carries, in the lower-left stall: MTN, Vodacom, Telkom and Cell C logos, and a South
African flag on a pole at upper right.** Both are unshippable. Every prompt below bans them
explicitly and the check on return exists specifically for this.

---

## Shared style preamble

**Paste this at the top of every single generation. No exceptions.** This is the coherence
mechanism; 33 images generated without it will come back as 33 unrelated pictures, and that is
the single most likely way this whole effort fails.

```
STYLE PREAMBLE — HUSTLE (paste before every prompt)

Medium: digital painting, illustrative-realist. Visible brushwork and a slight canvas
tooth. Confident opaque strokes, edges left slightly rough. NOT photography, NOT 3D
render, NOT flat vector, NOT cel-shaded cartoon, NOT airbrushed concept art.

World: KwaDream, a fictional South African township. Corrugated iron, pallet wood,
breeze block, hand-painted boards, tyre planters, plastic crates, overhead power lines,
a hillside of small brightly-painted houses in the far background. Warm red-brown packed
earth underfoot, never tarmac. Everything is built, worn, repaired and reused — never new,
never derelict.

People: Black and mixed-race South Africans, working, mid-task, competent and unposed.
Ordinary working clothes: overalls, aprons, football shirts, headwraps, bucket hats.
Nobody smiles at the camera. Nobody is a symbol of hardship. Dignity through competence.

Light: ONE low warm sun, always. Never a second light source, never studio lighting,
never rim-light for drama. Long directional shadows in one consistent direction across
every image in this set.

Palette (use these exact values as the anchors):
  deep shadow / sky        #3E3050  (indigo-violet — never brown, never black)
  warm shadow / horizon    #5A415C
  sun and every hot accent #F2941C
  sun flare highlight      #FDB74D
  low warm sky band        #FFC98A
  earth / structure warmth #6B4630
  light / paper / cloth    #F5F0FA
Orange is the ONLY hot accent. Nothing else in frame competes with it for attention.
Greens are muted olive; blues are dusty, never saturated cyan.

Framing: eye level or slightly below, 35mm equivalent, subject weighted off-centre.
No symmetry. No centred hero pose. No lens flare.

UNIVERSAL NEGATIVES (append to every prompt):
no real-world brand logos of any kind, no telecom brands, no MTN, no Vodacom, no Telkom,
no Cell C, no Coca-Cola, no readable product packaging, no national flags, no South
African flag, no legible text or lettering or numbers anywhere in the image, no signage
with words, no watermark, no signature, no navy blue or dark teal UI panels, no glass
dashboard cards, no HUD overlays, no charts or graphs, no neon glow, no chromatic
aberration, no Western stock-photo composition, no white saviour figures, no poverty
tourism, no ragged clothing, no visible distress or pity, no children working, no
smiling-at-camera, no generic "Africa" iconography (no acacia-sunset-silhouette clichés,
no tribal patterns, no wildlife).
```

Two notes on why this preamble is shaped the way it is:

- **"No legible text anywhere"** is absolute for every asset except the wordmark. Baked-in words
  cannot be translated, cannot be corrected, and models get South African signage wrong in ways
  a learner will notice immediately. The game already solved this: `DESIGN.md` records that the
  Scanner uses drawn line-icons because *"no real photography of these five spots exists in this
  repo, and this project's standing rule is never to invent or hotlink a placeholder."* Text in
  art is the same class of invention.
- **The palette block is repeated by hex, not by name.** Models weight literal hex strings.
  "Warm purple" drifts to brown by the third generation, which `DESIGN.md` explicitly guards
  against: *"check the B channel is equal to or above R before adding a new dark token, or brown
  returns by accident."*

---

# The assets

33 assets. Ordered by which world owns them.

---

## Group A — Poster world (outside the game)

### A1 — Intro / splash poster

**Purpose.** The first thing a learner sees before they've committed anything. It has to say "this
is about people like me building real things" in under two seconds, on a phone, in daylight. It
replaces nothing — the current landing hero is the yellowwood photo, which is the *game's* opening;
this is the *product's*.

**Dimensions.** 1080 × 1920 (9:16). One file only — no @2x. On a 360dp Android at DPR 3 the
physical panel is 1080px wide, so 1080 is already native.
**Format / budget.** `webp`, **≤ 150 KB** at `q 74`. This is the single largest asset in the set
and it is worth it; nothing else in group A gets this much.
**File.** `prototype/images/splash-poster.webp`
**Consumed at.** *Not yet consumed.* Needs a mount point: a new `<section class="screen" id="s-splash">`
ahead of `#s-landing` (line 1097), or as the `background-image` of a splash overlay sibling to
`.daycard` (line 1354). The current first screen is `#s-landing`, whose `.heroWrap` already owns
`#treePhoto`; do not displace it.
**Ramp position.** **1.0 — full day.** Poster world.

> **Generation prompt**
>
> A tall vertical painting of a busy township marketplace at full midday. A dense grid of eight
> to ten market stalls built from corrugated iron and pallet wood, each with a blank hand-painted
> board above it — boards are painted flat colour, completely wordless. Traders working at each
> stall: a phone repairer at a bench with a screwdriver, a woman braiding hair, a shopkeeper
> reaching for stock on a shelf, a man turning meat on a drum grill, a clothing trader hanging
> garments on a rail. Between the stalls, packed red-brown earth with tyre planters and stacked
> plastic crates. Behind and above, a hillside of small brightly-painted houses in coral, mint,
> lilac and ochre. Overhead power lines crossing the upper third. Bright blue sky with small
> scattered cumulus. Sun high, near-overhead, short hard shadows. Saturated, crowded, alive,
> optimistic. Composition leaves a clear uncluttered band across the top 22% of the frame for a
> wordmark to be placed later in code — sky only, no structures intruding into it. Digital
> painting with visible brushwork.
>
> **Negatives (in addition to the universal list):** no title text, no banner, no ribbon, no
> torn-paper scroll, no logos on any stall, no telco branding, no flags, no readable words on any
> board, no crowd of customers facing the viewer, no drone or bird's-eye angle.

**Note on the reference.** The reference poster bakes the wordmark and tagline into the image.
**Do not do that here.** The empty sky band exists so the wordmark ships as SVG (A4) laid over the
top — sharper on every screen, translatable tagline, and it lets the poster be re-cropped for the
store listing without re-generating type.

---

### A2 — Share / OG card

**Purpose.** `PRODUCT.md` records that the product spreads by WhatsApp **[assumed]**, and that the
shipped build has no `og:` image at all. The prototype's `<head>` already declares
`og:title`, `og:description` and `twitter:card = summary_large_image` (lines 9–12) — and then
never supplies the image the card promises. This is that image.

**Dimensions.** 1200 × 630 (1.91:1). Fixed by the OG spec; do not deviate.
**Format / budget.** `webp`, **≤ 80 KB**. Never fetched by the game itself — this is scraper-only
payload, so it costs the learner nothing.
**File.** `prototype/images/og-card.webp`
**Consumed at.** *Not yet consumed.* Needs `<meta property="og:image">` and
`<meta name="twitter:image">` added after line 12 of `prototype/hustle-shell.html`, with an
absolute URL — relative paths do not resolve for WhatsApp's scraper.
**Ramp position.** **0.75 — late morning.** Deliberately not full midday: the share card is the
handoff between worlds, and a warmer, lower sun reads better at thumbnail size than a flat
overhead one.

> **Generation prompt**
>
> A wide horizontal painting of a single market stall in a township, late morning. A young woman
> in an apron stands behind a wooden counter, mid-conversation with a customer whose back is to
> us, gesturing at goods on the counter — plastic crates, a stack of folded fabric, a small
> paraffin stove. The stall is corrugated iron and pallet wood with a blank painted board above,
> no words on it. The sun is low-left at about fifty degrees, raking warm light across the
> counter and throwing a long shadow to the right. Behind, out of focus, more stalls and a
> hillside of small brightly-painted houses. Sky warm and pale, with faint violet #3E3050 held in
> the top corners. The right 40% of the frame is deliberately open and simple — background only,
> no faces, no busy detail — so a title can be composited there later. Warm, competent, ordinary.
>
> **Negatives (in addition to the universal list):** no text overlay, no logo, no phone screens
> showing UI, no product packaging, no centred symmetrical composition, no eye contact with the
> viewer, no cluttered right-hand third.

---

### A3 — Store feature graphic

**Purpose.** The wide banner every app store puts above the description. Different job from A1:
it is seen once, at small size, next to competing tiles, and it has to read as *a game* rather
than as a course.

**Dimensions.** 1024 × 500. Google Play's feature-graphic spec. Generate at 2048 × 1000 and
downscale, so the detail survives.
**Format / budget.** `webp`, **≤ 70 KB**. Store-only; never fetched in-session.
**File.** `prototype/images/store-feature.webp`
**Consumed at.** *Not yet consumed and will not be* — store metadata, not app markup. It lives in
the repo so it versions with the art it has to match.
**Ramp position.** **1.0 — full day.**

> **Generation prompt**
>
> A wide horizontal painting of a township market street seen straight down its length, midday.
> Stalls line both sides in receding perspective, corrugated iron and pallet wood, blank painted
> boards above each with no lettering. Traders at work along both sides, customers moving down the
> middle of the packed red-brown earth road. Strong one-point perspective with the vanishing point
> low and slightly right of centre, opening onto a hillside of brightly-painted houses under a
> bright blue sky. Warm saturated colour, high energy, deep depth of field. The left third holds
> the strongest visual interest; the right third is simpler and more open.
>
> **Negatives (in addition to the universal list):** no text, no title, no store badges, no device
> mockups, no screenshots inside the image, no UI, no flags, no logos, no aerial view.

---

### A4 — Wordmark

**Purpose.** The one place letterforms are allowed. Used at the top of the splash, over the OG
card, and (optionally) to replace the text node in the header brand.

**Dimensions.** SVG, authored on a 1200 × 320 viewBox. Must stay legible down to 120px wide.
**Format / budget.** `svg`, **≤ 12 KB** after `svgo`. If a generated raster is traced, cap paths
aggressively — an untraced auto-trace of textured 3D type will land at 200 KB+ and must be
rejected.
**File.** `prototype/images/wordmark.svg`
**Consumed at.** `<span class="brand">` at **line 1083** of `prototype/hustle-shell.html` currently
renders the literal string `Hustle` with a decorative `<i>`, and the `<h1 id="t-landing">` at
**line 1105** renders `Hustle` in Anton. Either can take the SVG, but **keep a real text node for
the accessible name** — replacing the `h1`'s text outright loses the one-`h1`-per-screen rule
`DESIGN.md` requires.
**Ramp position.** **N/A** — the wordmark belongs to the poster world's *type*, not its light.

> **Generation prompt**
>
> The single word HUSTLE in chunky three-dimensional extruded display capitals, hand-painted
> signwriter style. Heavy condensed sans-serif letterforms, very tight letter spacing, letters
> slightly irregular as if painted by hand rather than typeset. Face of the letters is a vertical
> gradient from #FDB74D at the top to #F2941C at the bottom with visible brush texture and a few
> lighter drag marks. Extrusion depth to the lower right in #C97012. A heavy uniform outline in
> deep #3E3050 around the whole word, about 6% of the cap height. Word sits on a very slight
> upward arc. Isolated on a flat mid-grey background, no scene, no shadow on the ground, no
> banner, no ribbon.
>
> **Negatives (in addition to the universal list):** no tagline, no second word, no background
> scene, no drop shadow onto a surface, no bevel gloss or chrome, no brown outline (the outline is
> the indigo #3E3050 — the reference poster's brown outline is deliberately NOT reproduced), no
> stars, no swashes, no graffiti or drip effects.

**Deliberate divergence from the reference.** The reference poster outlines the type in dark
brown. `DESIGN.md` bans brown outright: *"I don't want to see brown or black... check the B
channel is equal to or above R."* The outline moves to `ink` `#3E3050`. Everything else about the
letterform — the extrusion, the orange-to-yellow face, the hand-painted texture — is preserved.
This is the one place the poster world is overruled by the Sunrise world, and it is overruled on
purpose so the wordmark can sit legibly inside the game as well as outside it.

---

### A5 — App icon

**Purpose.** The home-screen tap target, and the WhatsApp-forward thumbnail. On a shared classroom
handset it also has to be findable in a grid of other icons at 48dp.

**Dimensions.** Master 1024 × 1024. Exports: 512, 192, 180, 144, 96, 48.
**Format / budget.** Master `png` (source, gitignored from deploy), shipped exports `webp`,
**≤ 20 KB for the whole export set.** Plus a maskable-safe variant with all content inside the
central 80% circle.
**File.** `prototype/images/icon-1024.png` → `prototype/images/icon-{512,192,180}.webp`
**Consumed at.** Line 13 of `prototype/hustle-shell.html` currently ships an **inline data-URI SVG
favicon** — an `#F2941C` rounded square with a `#3E3050` letter `H`. That is a real, working,
zero-byte-of-network placeholder and it is genuinely decent. Replacing it costs a network request
the current one doesn't. **Recommendation: keep the data-URI favicon for the browser tab and add
the raster icons only via `<link rel="apple-touch-icon">` and a web app manifest**, for the
install-to-home-screen case that Phase 4's consumer-app direction actually needs.
**Ramp position.** **N/A** — flat mark, no scene, no light.

> **Generation prompt**
>
> A flat app icon on a 1024 by 1024 square with generously rounded corners. Solid background
> #3E3050. Centred on it, a single bold symbol in #F2941C: a simplified hand-painted market stall
> — a trapezoid awning over two upright posts and a horizontal counter line — reduced to five or
> six thick strokes, geometric, no perspective, no detail, no texture. The strokes have slightly
> uneven hand-painted ends. Above the awning, one small solid #FFC98A semicircle sitting on the
> awning line, reading as a low sun rising behind the stall. Nothing else. Flat colour only, no
> gradients, no shading, no shadow. All content inside the central 78% of the square.
>
> **Negatives (in addition to the universal list):** no letters, no monogram, no "H", no text, no
> gradient, no glow, no bevel, no drop shadow, no photo, no scene, no people, no currency symbol,
> no rand sign, no upward-trending arrow, no chart, no rocket, no lightbulb, no handshake.

The banned-cliché list at the end of that negative block is doing real work. "Business game" is a
prompt that pulls hard toward rocket-and-upward-arrow iconography, which is precisely the
generic-fintech drift `PRODUCT.md`'s anti-reference section names.

---

## Group B — Stall art (Scanner job cards)

Eight cards. **Five are real game content, read out of `prototype/hustle-shell.html`. Three are
`[PROPOSED]` and authored here.**

Shared spec for all eight:

**Purpose.** Give the Scanner's five opportunities a face. `DESIGN.md` records the current state
honestly: each opportunity carries a drawn `.spot-icon` glyph *because* no real photography
exists, and *"this project's standing rule is never to invent or hotlink a placeholder for an
image nobody has actually seen."* Generating art deliberately, to spec, against a documented brief,
is not that — but the line-icons stay regardless, as the low-bandwidth fallback and as the
compact mark in the committed-business header.

**Dimensions.** 640 × 412 (roughly 14:9). **No @2x.** A `.scan-grid` card is at most ~320 CSS px
wide at the 680px breakpoint, so 640 is already 2× at the widest realistic case. Shipping a 3×
set would double the group's budget for detail nobody on this hardware will resolve.
**Format / budget.** `webp`, **≤ 28 KB each**, `q 72`. **Group total ≤ 224 KB.**
**Files.** `prototype/images/stall-<id>.webp`, `<id>` matching the game's own opportunity `id`
exactly.
**Consumed at.** `.scan-grid` cards, built in JS at **line ~1992** of `prototype/hustle-shell.html`
(`'<span class="spot-icon" aria-hidden="true">' + (ICONS[o.id] || '') + '</span>'`). *Not yet
consumed as imagery* — needs a new `.spot-art` element above `.spot-icon` in that template, with
`loading="lazy"` so a card's art only costs data when the carousel reaches it.
**Ramp position.** **0.5 — mid-morning**, for all eight, without exception. This is the hinge: the
Scanner is the last screen before the 14 days begin, so it sits exactly halfway between the poster
world that sold the game and the Sunrise world that runs it. Holding all eight at one identical
ramp position is also what makes them read as one row rather than eight moods.

**Shared framing clause — paste into all eight prompts.** Three-quarter view from slightly below
eye level. The stall occupies the left two-thirds; the right third falls away to a soft
out-of-focus street. Sun low-left at about twenty-five degrees, long shadow thrown right. Sky
visible only as a thin band at the top, warm pale fading to #5A415C at the corners.

---

### B1 — `phonerepair` — Phone Repair Kiosk *(real — HIGH demand, LOW competition, R1,200, "Strong")*

Teaser in the bundle: *Taxi rank — "Three people this morning asked the same question. Nobody
nearby answers it."*

**File.** `prototype/images/stall-phonerepair.webp`

> **Generation prompt** *(after preamble + shared framing clause)*
>
> A small phone repair kiosk at a township taxi rank, mid-morning. A narrow booth of corrugated
> iron and pallet wood with a fold-down wooden counter. On the counter, a green cutting mat, a
> magnifying lamp on an arm, a tray of tiny screws, three opened handsets face-down with their
> backs off, and a spool of solder. The repairer, a young man in a plain grey work shirt, sits on
> a stool leaning in with fine tweezers, entirely absorbed, not looking up. A single bare bulb on
> a cable above the counter, unlit. Behind the booth, the blurred flank of a white minibus and
> people moving. Warm raking light catches the metal tools and the edge of the counter.
>
> **Negatives:** no readable phone screens, no phone brand marks, no apple or android logos, no
> price list, no signage, no telco branding, no customer at the counter.

---

### B2 — `spaza` — Spaza Shop *(real — HIGH demand, HIGH competition, R800, "Possible")*

Teaser: *Spaza row — "Six shops already trading. Whatever you sell, someone sells it cheaper."*

**File.** `prototype/images/stall-spaza.webp`

> **Generation prompt** *(after preamble + shared framing clause)*
>
> A small spaza shop built into the front of a breeze-block house, mid-morning. A window hatch
> with painted burglar bars, a narrow shelf counter beneath it. Behind the hatch, densely stacked
> shelves of unbranded goods — plain white and brown paper packets, unlabelled tins, loose sweets
> in glass jars, bread in a clear bag, eggs in a tray. A woman in a headwrap reaches up for
> something on a high shelf, half in shadow inside the shop, half lit through the hatch. Outside,
> a stack of empty plastic crates and a chest freezer with its lid down. Warm low light spills
> through the hatch and lands on the counter.
>
> **Negatives:** no product branding of any kind, no readable packaging, no price stickers, no
> Coca-Cola, no cigarette advertising, no airtime branding, no signage.

---

### B3 — `salon` — Hair Salon *(real — HIGH demand, MEDIUM competition, R2,200 — over the R2,500 opening only when combined with costs; the bundle marks it `fits:false`, "Possible")*

Teaser: *Corner house — "Steady weekly custom. The rent is the part that bites."*

**File.** `prototype/images/stall-salon.webp`

> **Generation prompt** *(after preamble + shared framing clause)*
>
> A one-room hair salon on the corner of a township house, mid-morning. A single swivel chair
> facing a large mirror propped against a painted breeze-block wall. A hairdresser in a work apron
> stands behind a seated client, hands working a braid, concentrating. A trolley beside them with
> combs, clips, a hooded dryer with its cord looped, and jars of product with plain unlabelled
> lids. The wall behind the mirror is painted a soft mint green, chipped. Light comes through an
> open doorway on the left, low and warm, landing across the floor and up the back of the chair.
> The client's face is turned away.
>
> **Negatives:** no product branding, no readable labels, no poster of hairstyles on the wall, no
> price list, no salon name, no glamour lighting, no beauty-advertising gloss.

---

### B4 — `shisanyama` — Shisanyama *(real — HIGH demand, HIGH competition, R4,500, over budget, "High Risk")*

Teaser: *Stadium gate — "Dead midweek. Tournament weekends the queue goes round the block."*

**File.** `prototype/images/stall-shisanyama.webp`

> **Generation prompt** *(after preamble + shared framing clause)*
>
> A shisanyama grill stand near a stadium gate, mid-morning, quiet before trade. A long grill made
> from a cut oil drum on a welded frame, lit, thin smoke rising straight up in the still air. Coils
> of boerewors and cuts of meat laid across the bars. A man in a canvas apron turns a piece with
> long tongs, watching it, not us. Beside the grill, a scarred wooden prep table with a chopping
> board and a stack of enamel plates. Behind, empty red and green plastic chairs stacked and a
> single upturned crate. Sun low-left through the smoke, catching it. The emptiness is deliberate —
> the trade has not started.
>
> **Negatives:** no beer bottles, no beverage branding, no crowd, no party atmosphere, no
> readable labels, no stadium signage, no flags, no team badges or football kit with visible
> lettering.

The reference image `Typical hustle work place.jpeg` is a shisanyama at full capacity with a
seated crowd. **Do not reproduce that framing here.** It is ramp 1.0 poster-world material; this
card is the same business at ramp 0.5, before the queue, because the Scanner is a screen about
judging potential rather than watching success.

---

### B5 — `clothing` — Weekend Clothing Stall *(real — MEDIUM demand, HIGH competition, R600, "Risky")*

Teaser: *Market strip — "Cheapest way in. Fifteen other traders had the same idea."*

**File.** `prototype/images/stall-clothing.webp`

> **Generation prompt** *(after preamble + shared framing clause)*
>
> A weekend clothing stall on a market strip, mid-morning. A simple frame of steel poles with a
> faded canvas tarpaulin stretched over it. Garments hang densely from two rails — plain shirts,
> printed dresses, denim — arranged by colour, no visible graphics on any garment. A folding table
> at the front with stacks of folded clothes and a large woven plastic bag half-unpacked beneath
> it. The trader, a woman in a blue overall coat, is re-hanging a shirt on the rail, her back
> three-quarters to us. Immediately behind and to the right, the near-identical tarpaulins of two
> other traders recede down the strip — the competition is visible in frame. Low sun comes through
> the tarpaulin, tinting the light warm.
>
> **Negatives:** no clothing brand logos, no sports team kit, no slogan t-shirts, no readable
> garment prints, no price tags, no mannequins, no fashion-editorial posing.

---

### B6 — `carwash` — Car Wash **[PROPOSED — authored, not game content]**

**Not in the shipped bundle.** No demand/competition/cost figures exist for it and none are
invented here. It appears in the reference poster and is a plausible sixth opportunity; the art
can be generated ahead of the decision, but **the game must not gain a sixth card until someone
authors its numbers, its 14 days of events, and its Five Forces rows.**

**File.** `prototype/images/stall-carwash.webp`

> **Generation prompt** *(after preamble + shared framing clause)*
>
> A hand car wash on a patch of packed red-brown earth beside a township road, mid-morning. A
> mid-size hatchback covered in white soap foam, a young man in shorts and gumboots working a
> sponge along the door in a long stroke. Two buckets, a coiled hose running off to a standpipe,
> a stack of folded microfibre cloths on an upturned crate. Water darkening the earth in a wide
> patch, catching the low sun as a hard bright glare. A second, already-washed car parked and
> beaded with water behind. No number plates visible, no manufacturer badges.
>
> **Negatives:** no car brand badges or logos, no number plates, no readable text on the vehicle,
> no luxury or new vehicles, no chrome gloss, no branded cleaning products.

---

### B7 — `sewing` — Sew & Stitch / Alterations **[PROPOSED — authored, not game content]**

**File.** `prototype/images/stall-sewing.webp`

> **Generation prompt** *(after preamble + shared framing clause)*
>
> A small alterations and tailoring stall, mid-morning. An older mechanical sewing machine on a
> wooden table under a lean-to of corrugated iron. A seamstress in a printed headwrap guides fabric
> through the machine, both hands on the cloth, eyes on the needle. Beside her, a dressmaker's
> dummy with a half-pinned garment, a jar of tape measures and shears, and a wall of thread spools
> on nails arranged by colour — a full spectrum, the brightest thing in frame after the sun.
> Off-cuts of printed fabric on the floor. Low warm light through the open front of the lean-to
> catching the thread wall and the edge of the fabric under the needle.
>
> **Negatives:** no sewing machine brand marks, no pattern packets with text, no fashion posters,
> no price board, no readable labels.

---

### B8 — `printcv` — Print, Copy & CV **[PROPOSED — authored, not game content]**

**File.** `prototype/images/stall-printcv.webp`

> **Generation prompt** *(after preamble + shared framing clause)*
>
> A small print and copy shop in a converted shipping container, mid-morning. A desktop
> multifunction printer on a laminate counter, its output tray holding a short stack of blank
> paper. Behind the counter, a woman in a purple blouse working at an old desktop computer, its
> screen turned away from us so nothing on it is visible. A laminating machine, a guillotine
> cutter, and a wall rack of blank coloured card stock. A customer's forearm and hand rest on the
> near edge of the counter, the rest of them out of frame. Low sun through the container's open
> door lands in a hard bright rectangle across the counter and the paper stack.
>
> **Negatives:** no readable screen content, no printer brand logos, no sample documents with text,
> no CV templates visible, no posters, no price list, no Microsoft or Adobe interfaces.

---

## Group C — Sunrise world (inside the game)

Everything from here down lives at ramp **0.0–0.5** and obeys `DESIGN.md` absolutely. These images
sit behind or beside real text, so contrast is not decorative — `PRODUCT.md` records the shipped
build had *"32 genuine sub-4.5:1 text failures and a primary CTA at 1.15:1."* Do not add to that
count with art.

### C1–C3 — Dawn→day street backdrops (the bridge, made literal)

**Purpose.** This is the mechanism that makes the dawn→day narrative something the player *sees*
rather than something a design document claims. Three backdrops, swapped behind the Crisis screen
as the 14 days progress: the same street, same camera position, same stalls, at three points on the
ramp. The market fills and warms while the player trades.

**Dimensions.** 1440 × 900 each (16:10). Used as a `background-image` on `#s-crisis`, heavily
scrimmed, so it never needs to be sharp.
**Format / budget.** `webp`, **≤ 55 KB each**, `q 62` — a low quality setting is correct here
precisely because the image sits under a solid scrim. **Group total ≤ 165 KB.**
**Files.** `prototype/images/street-dawn.webp`, `street-morning.webp`, `street-day.webp`
**Consumed at.** *Not yet consumed.* Needs a `background-image` on `<section class="screen"
id="s-crisis">` (**line 1299**), driven by a class set from the day counter — days 1–4 → `dawn`,
5–9 → `morning`, 10–14 → `day`. **Preload the next backdrop during the `.daycard` curtain wipe
(line 1354)**, which already covers the screen while it is rebuilt — `DESIGN.md`: *"the screen
underneath is swapped while covered, so a render is never seen half-built."* That existing
mechanism is exactly the right place to hide a 55 KB fetch.
**Mandatory scrim.** These sit behind body text. Ship them under a solid
`linear-gradient(#3E3050 0%, rgba(62,48,80,.92) 100%)` overlay or equivalent solid treatment, and
re-measure `bone` `#F5F0FA` against the result. Never a translucent fill under the text itself.

> **Generation prompt — C1 `street-dawn` (ramp 0.0)**
>
> A township market street before opening, first light. Empty. Stalls shuttered — corrugated iron
> panels down, tarpaulins folded and tied, chairs stacked. Packed red-brown earth road running away
> from the camera. A single figure in the middle distance walking toward us carrying a folded
> trestle table under one arm, small in frame, unhurried. The sky is deep indigo-violet #3E3050
> overhead grading to #5A415C at the horizon, with one narrow warm band of #FFC98A right along the
> skyline where the sun has not yet risen. No direct sunlight anywhere in the scene. Everything is
> in soft blue-violet shadow. Overhead power lines silhouetted. Very quiet, very still, cold air.
> Wide establishing view, camera at standing eye level, horizon on the lower third.
>
> **Negatives:** no sun disc visible, no warm light on any surface, no crowd, no open stalls, no
> lit windows, no vehicles, no text, no logos, no stars or moon, no blue-hour cyan cast.

> **Generation prompt — C2 `street-morning` (ramp 0.25–0.4)**
>
> The identical township market street, same camera position and same stalls, at sunrise. Three or
> four stalls now open — shutters raised, one tarpaulin being tied off, a trestle table set up. Four
> or five people, some working, one walking. The sun is just on the horizon at the end of the street,
> flaring #FDB74D, throwing very long shadows straight toward the camera. The sky is still violet
> #3E3050 above, with a broad #FFC98A band low. Warm light strikes only the upper edges of the
> stalls and the tops of heads; everything below remains in violet shadow. Smoke from one grill
> rising straight up and catching the light.
>
> **Negatives:** no crowd, no full trade, no midday blue sky, no short shadows, no text, no logos,
> no vehicles in the foreground, no lens flare star-burst.

> **Generation prompt — C3 `street-day` (ramp 0.5–0.65)**
>
> The identical township market street, same camera position and same stalls, mid-morning. Most
> stalls now open and trading, ten or twelve people working and moving through the frame, goods out
> on tables. The sun is low-left at about thirty degrees, raking, warm, throwing long shadows to the
> right across the packed earth. The sky is warm and pale near the horizon with faint violet #3E3050
> retained only in the top corners of the frame. Colour is fuller and more saturated than at
> sunrise, but this is still not midday — the shadows are still long and the light is still warm.
>
> **Negatives:** no overhead midday sun, no short shadows, no bright blue sky, no crowd density
> approaching a festival, no text, no logos, no celebration.

**These three must be generated as a set, in one session, describing the same street.** If they are
generated on different days from different seeds they will be three different streets and the whole
device collapses into "the background changed colour". Generate C1 first, then use it as an
image-to-image or style-reference input for C2 and C3 wherever the model supports it. **This is the
highest-risk generation in the entire document.**

---

### C4–C6 — Archetype portraits

**Purpose.** The archetype screen asks *"Which one's you?"* and offers three real, verbatim
options. It currently renders as three text cards. A portrait gives a learner something to
recognise themselves in before they have made any choice at all — and this is the screen where a
16-year-old decides whether the game is for people like them.

The three are read directly from `prototype/hustle-shell.html` (lines 1142–1155):

| # | `data-arch` | Card heading | Card body |
|---|---|---|---|
| C4 | `unemployed` | Looking for my shot | *"No job right now. R2,500 is what you've got, and this is what you do with it."* |
| C5 | `employed` | Already working, want more | *"You've got a job. This is the side hustle you build around it."* |
| C6 | `student` | Still studying, just curious | *"Not hustling yet. You want to know what it actually takes before you do."* |

**Dimensions.** 400 × 400 (1:1). Displayed at ~72–96 CSS px, so this is already well over 2×.
**Format / budget.** `webp`, **≤ 18 KB each**, `q 70`. **Group total ≤ 54 KB.**
**Files.** `prototype/images/arch-unemployed.webp`, `arch-employed.webp`, `arch-student.webp`
**Consumed at.** *Not yet consumed.* Each `<button class="mode arch-card">` at **lines 1142, 1147,
1152**. Note that `.arch-card h3` carries `padding-right:5.5rem` (**line 495**) reserving space at
the card's right edge — that reserved gutter is where the portrait goes, and it means this asset
needs **no layout change**, only an inserted `<img>`. Note also that `.arch-card` applies a
permanent `--tilt` rotation (lines 476–480): the portrait will be rotated with its card, so do not
generate anything whose composition depends on being perfectly level.
**Ramp position.** **0.15 — just before sunrise.** The archetype screen is the first thing after
the landing; nobody has traded yet. Keep all three identical on the ramp so the choice is between
*people*, not between *times of day*.

**Shared clause for all three.** Head-and-shoulders three-quarter portrait, square crop, subject
weighted to the left of frame. Background is an out-of-focus township street at first light,
reduced almost entirely to soft #3E3050 and #5A415C shapes. The only warm light is a thin #FFC98A
rim along one edge of the face and shoulder from the low sun behind. Calm, direct, self-possessed.
Not smiling. Not sad.

> **C4 `unemployed`** — A young man in his early twenties, close-cropped hair, wearing a plain
> dark hooded top with the hood down. Chin slightly lifted, looking out of frame past the camera.
> Hands not visible. Nothing in the composition indicates hardship — this is a person deciding
> something, not a person in need.
>
> **Negatives:** no pity framing, no downcast eyes, no torn or dirty clothing, no begging or
> waiting posture, no charity-appeal composition, no text, no logos.

> **C5 `employed`** — A woman in her late twenties in a plain collared work shirt with a lanyard
> at her chest — the lanyard card is blank, edge-on, completely wordless. A canvas bag strap over
> one shoulder. Half-turned as if stopping on the way somewhere, one eyebrow slightly raised.
>
> **Negatives:** no readable ID card, no company logo, no corporate office background, no suit, no
> laptop, no text.

> **C6 `student`** — A young woman, seventeen or eighteen, a backpack strap over one shoulder,
> plain t-shirt. Curious, slightly amused expression, head tilted. Looking almost but not quite at
> the camera.
>
> **Negatives:** no school uniform with a visible badge or crest, no books with readable titles, no
> classroom background, no phone in hand, no text.

---

### C7–C10 — Crisis scenario art

**Purpose.** The 14 days are where the game lives, and they are currently entirely typographic.
`DESIGN.md` describes the whole existing game layer — damage numbers, day cards, streaks, screen
shake — as devices attached to *"a moment the engine already treats as significant."* Scenario art
is the same idea one level up: give the four recurring event *families* a face so a learner
remembers the day, not the number.

**Only four assets for fourteen days, on purpose.** The crisis deck is real game content and was
not read out in full here; these four cover the event families `PRODUCT.md` names explicitly —
*"load shedding, late suppliers, customers paying next week"* — plus the demand-spike family the
shisanyama teaser names (*"tournament weekends the queue goes round the block"*). **Any event not
in these four families ships with no art at all rather than with art that misrepresents it.** A
wrong picture on a decision screen is worse than no picture. If the deck turns out to need a fifth
family, that is a new asset and a new decision, not a re-purposed one.

**Dimensions.** 480 × 270 (16:9). Sits above `.event`'s text at roughly full column width.
**Format / budget.** `webp`, **≤ 20 KB each**, `q 68`. **Group total ≤ 80 KB.**
**Files.** `prototype/images/crisis-loadshedding.webp`, `crisis-supplier.webp`,
`crisis-credit.webp`, `crisis-surge.webp`
**Consumed at.** `<div class="event" id="eventBox"></div>` at **line 1317** of
`prototype/hustle-shell.html`, populated in JS. *Not yet consumed* — needs an `<img>` at the top of
the `#eventBox` template keyed off an event-family field, and that field does not exist in the
deck yet. **Adding it is a content decision, not an art decision** — someone has to map each of
the 14 days to a family, and that mapping is authored, not derived.
**Ramp position.** **0.3–0.5**, varying slightly per card — these are things that happen during the
trading day, so they may sit a little further along the ramp than the archetypes. Never past 0.5.

> **C7 `crisis-loadshedding`** — A township street stall at dusk during a power cut. Every light is
> out. A woman stands behind her counter holding a paraffin lamp at chest height; it is the only
> light source in the frame, throwing warm #F2941C light up onto her face and hands and leaving
> everything beyond a metre away in deep #3E3050. Behind her, the dark shapes of unlit stalls and
> a dead fridge with its door open. Ramp position: after the day, light gone.
>
> **Negatives:** no candles arranged decoratively, no cosy atmosphere, no power-utility branding,
> no text, no logos, no visible generator brand, no despair or theatrics.

> **C8 `crisis-supplier`** — An empty delivery bay behind a stall, mid-morning. A trader stands
> beside a stack of empty plastic crates looking down the road at nothing, a phone held loosely at
> his side, screen dark and turned away. The stall's shelves visible behind him are half-bare. Low
> sun from the left throwing his long shadow across the empty crates. The subject of the picture is
> the absence.
>
> **Negatives:** no delivery vehicle in frame, no branded crates or pallets, no readable phone
> screen, no anger or gesticulating, no text, no logos.

> **C9 `crisis-credit`** — A close three-quarter view across a stall counter, mid-morning. A
> customer's hands are open and empty, palms slightly up, resting on the counter beside a small
> pile of goods that has been set aside rather than paid for. The trader's hands rest on the
> counter opposite, still. Neither face is in frame — the picture is entirely hands, the goods, and
> the counter between them. Low warm light across the counter surface from the left.
>
> **Negatives:** no money visible, no cash, no notes or coins, no card machine, no readable
> packaging, no faces, no confrontation, no text, no logos.

> **C10 `crisis-surge`** — A queue at a grill stand, seen from behind and to one side, late
> morning. Eight or nine people waiting, backs mostly to us, the line running out of frame. At the
> front, the trader's arm reaching across the grill with tongs, motion-blurred slightly. Thick
> smoke. The sun is higher here than in any other Sunrise-world asset — this is a good day and it
> should feel like one — but still raking from the left, still throwing long shadows. Energy,
> pressure, not chaos.
>
> **Negatives:** no faces at camera, no football team kit with lettering or badges, no stadium
> signage, no flags, no beer branding, no crowd trouble, no text, no logos.

---

### C11–C14 — Verdict art

**Purpose.** One image per ending band. `PRODUCT.md`: *"the four endings are written to make
failure instructive, not shameful"*, and this is the asset most capable of breaking that. The
bottom band gets a picture of somebody still standing in their stall, not somebody packing up.

The four bands are read verbatim from `prototype/hustle-shell.html` (**lines 2404–2407**):

| # | Tier | Title | Ramp |
|---|---|---|---|
| C11 | 1 (score ≥ 80) | **Business Boss** | 0.75 |
| C12 | 2 (≥ 60) | **Sharp Operator** | 0.6 |
| C13 | 3 (≥ 40) | **Hustler in Training** | 0.45 |
| C14 | 4 (≥ 0) | **Back to the Drawing Board** | 0.3 |

**The ramp position is the mechanic here.** The better the run, the further into the day the player
got. This makes the dawn→day story pay off at exactly the moment the run is graded, without a word
of explanation. A learner who runs it twice will notice the light changed and will understand why.

**Dimensions.** 720 × 480 (3:2).
**Format / budget.** `webp`, **≤ 26 KB each**, `q 70`. **Group total ≤ 104 KB.** Only one is ever
fetched in a session — load it lazily at `finish()`, not up front.
**Files.** `prototype/images/verdict-1.webp` … `verdict-4.webp`
**Consumed at.** `<section class="screen" id="s-end">` (**line 1323**). The natural mount is
between `.end-head` (**line 1325**) and `<p class="verdict" id="endTitle">` (**line 1330**).
**Do not let it collide with `#endStamp`** (line 1327) — `DESIGN.md` carries an explicit correction
about the verdict stamp colliding with long titles: *"Anchor a corner mark to a short, fixed-width
sibling — never to a text box whose length varies with content."* The image is a full-width block
in its own right; the stamp stays where it is, in the `.end-head` row.
**Tier colour tie-in.** `.verdict-stamp` is tier-coloured in CSS (**lines 864–865**): tier 1
`sign-yellow` `#FFC98A`, tier 2 `survive-green` `#6FBF73`, tier 3 `enamel-orange` `#F2941C`, tier 4
`bad-text` `#FA9086`. Each prompt below biases its secondary colour toward its tier's colour so the
image and the stamp agree.

> **C11 `verdict-1` — Business Boss (ramp 0.75)** — A trader standing at the open front of a
> well-stocked stall late in the morning, hands on her hips, surveying it. Two customers at the
> counter being served by a second person — she has help now. Shelves full, goods well arranged,
> a second table added on the side. Sun high-left at fifty degrees, bright and warm, pale #FFC98A
> catching the top edge of the stall. Settled competence, not triumph.
>
> **Negatives:** no arms raised in victory, no fist pump, no money in frame, no cash, no
> celebration, no confetti, no trophy, no luxury goods, no text, no logos.

> **C12 `verdict-2` — Sharp Operator (ramp 0.6)** — A trader mid-morning at a solid, working
> stall, counting stock on a shelf with one hand and marking a small notebook with the other. The
> notebook page is blank and turned away. Reasonable stock, one customer approaching from the
> right. Warm raking light from the left. Muted #6FBF73 green in the painted stall structure.
> Competent, mid-flow, unremarkable in the best way.
>
> **Negatives:** no readable notebook, no numbers or handwriting visible, no money, no celebration,
> no empty shelves, no text, no logos.

> **C13 `verdict-3` — Hustler in Training (ramp 0.45)** — A trader at a thinly-stocked stall in
> mid-morning light, crouched down re-sorting goods in a crate, working on the problem. The stall
> is standing, tidy, and clearly still open — it is just not full. One person passing without
> stopping. Warm #F2941C light from the low left across the crate and their hands.
>
> **Negatives:** no head in hands, no slumped posture, no closed shutters, no abandonment, no
> pity framing, no rain, no text, no logos.

> **C14 `verdict-4` — Back to the Drawing Board (ramp 0.3)** — A trader standing at an empty stall
> just after sunrise, one hand resting on the bare counter, looking down the street toward the low
> sun rather than at the empty stall. The structure is intact — the stall is standing, the
> tarpaulin is tied, nothing is broken. Just no stock. Long shadow stretching toward the camera.
> The low sun is directly in frame at the end of the street, flaring #FDB74D. Muted #FA9086 in the
> painted stall boards. This is the beginning of a day, not the end of one.
>
> **Negatives:** no packing up, no dismantling, no crying, no head in hands, no broken or wrecked
> structure, no rain, no dusk or night, no back turned to the sun, no defeat posture, no
> shame, no text, no logos.

C14 is the one asset in this document most likely to come back wrong. Models read "failure ending"
and produce dusk, rain, and a slumped figure. **Re-roll it until the sun is rising and the person
is standing.** If it will not comply, drop the word "failure" from the prompt entirely and describe
only the scene.

---

### C15–C17 — Empty states

**Purpose.** Three screens can legitimately be empty, and an empty screen with nothing in it reads
as a broken screen on a device that kills backgrounded tabs. `DESIGN.md` bans emoji as an icon
system, so these are drawn.

**Dimensions.** SVG, 240 × 160 viewBox, single-colour `currentColor` line art at 1.6px stroke —
identical construction to the existing `ICONS` glyphs at **lines 1425–1431**, just larger and
looser.
**Format / budget.** `svg`, **≤ 5 KB each**. **Group total ≤ 15 KB.** These should be inlined into
the markup, not fetched — at this size a network request costs more than the bytes.
**Files.** `prototype/images/empty-scan.svg`, `empty-plan.svg`, `empty-ledger.svg`
**Consumed at.** C15 — `#scanGrid`, populated at **line 1970**, currently never empty (it always
renders five cards) so this is the *pre-scan* state, not a no-results state: pair it with the
existing `#scanHint` copy at **line 1256**. C16 — `<section id="s-plan">` (**line 1281**), for a
plan section with no answer yet. C17 — `#endLedger` (**line 1338**), for a run abandoned before day
1. All three: *not yet consumed.*
**Ramp position.** **N/A** — line art, no light, no scene.

Generate these as **SVG directly from a text model**, not as raster from an image model. An image
model will return a PNG of a drawing, which then has to be traced, which will blow the 5 KB budget
by an order of magnitude and lose `currentColor` theming.

> **Prompt (for a text model, not an image model)**
>
> Write three SVG icons, each on a `viewBox="0 0 240 160"`, `fill="none"`,
> `stroke="currentColor"`, `stroke-width="1.6"`, `stroke-linecap="round"`,
> `stroke-linejoin="round"`. Loose, hand-drawn, single continuous-feeling line work — not
> geometric, not perfectly straight. No fills, no text, no gradients, under 5 KB each, no
> `<style>` blocks, no ids.
> 1. An empty market stall: an awning, two posts, an empty counter, and one folded crate beside it.
> 2. A blank sheet of paper on a clipboard with a pencil resting across it — no lines or writing on
>    the sheet.
> 3. An open ledger book, both pages blank, ruled with three faint horizontal lines each and
>    nothing written on them.

---

### C18–C20 — Spot icons for the proposed businesses **[PROPOSED]**

**Purpose.** The five real opportunities already have hand-authored line glyphs in `ICONS`
(**lines 1425–1431**). If B6–B8 are ever promoted from proposed to real, they need matching
glyphs, drawn to the same construction, or the Scanner row will visibly split into two icon
families.

**Dimensions.** SVG, `viewBox="0 0 24 24"`, `stroke-width="1.6"`, `fill="none"`,
`stroke="currentColor"` — matching the existing five exactly.
**Format / budget.** `svg`, **≤ 2 KB each**. **Group total ≤ 6 KB.** Inlined into the `ICONS`
object, never fetched.
**Files.** No separate files — these are string literals added to `ICONS`. Listed here as assets
because they are art that has to be produced.
**Consumed at.** `ICONS` object, **lines 1425–1431**, read at **line 1992**.
**Ramp position.** **N/A.**

> **Prompt (for a text model, not an image model)**
>
> Write three 24×24 SVG icons matching this exact construction:
> `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
> stroke-linecap="round" stroke-linejoin="round"`, five to eight path elements maximum, no fills,
> no text, no ids, no groups. Match the visual weight of a Lucide-style outline icon.
> 1. `carwash` — a car in side profile with two arcs of water or foam above it.
> 2. `sewing` — a sewing machine: an L-shaped body, a needle arm, and a horizontal bed line.
> 3. `printcv` — a document sheet with a folded corner emerging from a printer body.

---

## Budget summary

| Group | Assets | Budget |
|---|---:|---:|
| A — Poster world (splash, OG, feature, wordmark, icon) | 5 | 332 KB |
| B — Stall art (5 real + 3 proposed) | 8 | 224 KB |
| C1–C3 — Dawn→day street backdrops | 3 | 165 KB |
| C4–C6 — Archetype portraits | 3 | 54 KB |
| C7–C10 — Crisis scenario art | 4 | 80 KB |
| C11–C14 — Verdict art | 4 | 104 KB |
| C15–C17 — Empty states (SVG) | 3 | 15 KB |
| C18–C20 — Proposed spot icons (SVG) | 3 | 6 KB |
| **Total in repo** | **33** | **980 KB** |

**What the learner actually pays for is not 980 KB.** Three separate figures matter and only the
last one is a real cost:

- **332 KB never reaches the game.** The splash, OG card, feature graphic and icon set are store
  and scraper payload. A learner playing the game downloads none of them.
- **Cut the 3 proposed stalls (84 KB) and 3 proposed icons (6 KB)** and the shippable in-game
  set is **558 KB**.
- **Worst-case single playthrough, with lazy loading applied as specified: ~482 KB** — wordmark
  12, three archetypes 54, five stall cards 140 (only if the player scans all five), three
  backdrops 165, crisis art 80, one verdict 26, one empty state 5.

That 482 KB sits on top of the existing 332 KB `yellowwood-sunrise-wide.webp` hero and the vendored
GSAP. **It roughly doubles the game's media weight**, and that is a real decision that needs making
rather than assuming. If it has to come down, the honest order to cut in is: drop C2 and C3 and
hold one backdrop (−110 KB), then drop crisis art (−80 KB). Do not cut the archetype portraits —
they are 54 KB on the screen that decides whether a learner stays.

---

## The one risk most likely to sink this

**Thirty-three images generated across many sessions will not look like one world, and the failure
will be invisible until they are all in the repo together.**

Coherence in AI image generation is not a property of any individual prompt — every prompt here can
succeed on its own terms and the set can still fail. The specific failure modes to expect:

1. **Palette drift toward brown.** `#3E3050` is an unusual base and models pull hard toward the
   warm-neutral they associate with "township", "market", "earth". `DESIGN.md` names this exactly:
   *"check the B channel is equal to or above R before adding a new dark token, or brown returns by
   accident."* Same failure, different medium.
2. **The dawn→day ramp collapsing to two states.** C1/C2/C3 are the whole bridge between the two
   worlds. If they are generated on different days from different seeds, they become three
   different streets and the device reads as "the background changed colour" rather than "time
   passed". Generate the set in one sitting, C1 first, C1 as image-reference for C2 and C3.
3. **Rendering style splitting.** "Illustrative-realist digital painting" is a wide band. Half the
   set can land photographic and half can land as flat vector, and each half will look fine
   alone.

The mitigations are built in above — the preamble, the repeated literal hexes, the ramp table, the
shared framing clause across all eight stall cards — but they are mitigations, not guarantees.
The actual defence is a process one:

**Generate one full column first — A1, B1, C2, C5, C11 — five images spanning every group and
three ramp positions. Put them side by side. If those five do not read as one world, the preamble
is wrong and must be fixed before the other twenty-eight are generated.** Fixing a preamble after
thirty-three generations means regenerating thirty-three.
