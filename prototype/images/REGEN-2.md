# REGEN-2.md — second fix batch, 2026-08-06

Found by a harsh-critic review pass over everything landed after REGEN-1, cross-checked by hand
where its findings conflicted with another agent's report (one false-positive corrected below —
`arch-unemployed`/`arch-employed` are fine, do not regenerate those). This file holds only what's
broken and the corrected prompt or fix. Full context for any asset: `PROMPTS.md`.

**Not regenerating (verified clean on direct re-check, despite being flagged by one pass):**
`arch-unemployed.webp`, `arch-employed.webp` — both are single clean 400×400 crops, no bleed.

---

## Re-crop only (art is fine, crop boundary is wrong — no new generation needed)

**`store-feature.webp`** — carries a baked contact-sheet label ("3 — store-feature.webp") across
the top of the frame. Re-crop from `GPT/Group A.png` with the top margin pushed down further to
clear the label row, same as was already done for `icon-1024.png` earlier in this session.

---

## A5 — `icon-1024.png` — reads as the banned H-monogram

**What's wrong:** two vertical support posts joined by a horizontal counter bar, topped by an
awning, is structurally a capital H with a sun sitting on it — exactly what A5's negative list
bans ("no letters, no monogram, no 'H'"), arrived at indirectly through the "market stall"
description rather than directly. On a 48dp launcher icon it will read as a stylized H-app-icon,
not a stall.

```
A flat app icon on a 1024 by 1024 square with generously rounded corners. Solid background #3E3050. Centred on it, a single bold symbol in #F2941C: a market stall awning rendered as a wide scalloped fan shape — five or six overlapping rounded scallops in a single unbroken sweep, no straight horizontal crossbar anywhere in the mark, no vertical support posts extending below the awning. Above the awning's peak, one small solid #FFC98A semicircle, reading as a low sun. The whole symbol is a single continuous silhouette, asymmetric left-to-right, wider on one side than the other so it cannot be read as a geometric letterform. Flat colour only, no gradients, no shading, no shadow. All content inside the central 78% of the square.

Avoid: any letter or monogram of any kind, especially H, I, or A shapes, any two parallel vertical strokes joined by a horizontal stroke, no text, no gradient, no glow, no bevel, no drop shadow, no photo, no scene, no people, no currency symbol, no rand sign, no upward-trending arrow, no chart, no rocket, no lightbulb, no handshake, symmetric left-right mirrored composition.
```

---

## B4 — `stall-shisanyama.webp` — shipped busy/full-trade, briefed empty/quiet

**What's wrong:** the brief is explicit this card must be the stand *before* trade starts —
*"the emptiness is deliberate... avoid duplicating `Typical hustle work place.jpeg`'s busy
reference framing."* What shipped is a fully loaded grill actively serving with a gathering
crowd — the exact busy framing the brief named and told the generator to avoid.

```
Digital painting, illustrative-realist, visible brushwork, slight canvas tooth. Not photography, not 3D, not flat vector. KwaDream township setting — corrugated iron, pallet wood, breeze block, red-brown earth, power lines, painted houses on the hillside behind. Palette anchors #3E3050, #5A415C, #F2941C, #FDB74D, #FFC98A, #6B4630, #F5F0FA, orange the only hot accent. One low warm sun, long directional shadows. Three-quarter view slightly below eye level, subject fills the left two-thirds, right third falls to a soft out-of-focus street, sun low-left ~25°, thin warm sky band fading to #5A415C at the corners.

A shisanyama grill stand near a stadium gate, mid-morning, quiet before trade — the stand is set up but has not opened yet. A long grill made from a cut oil drum on a welded frame, freshly lit, thin smoke rising straight up in the still air. The grill surface is mostly EMPTY — at most two or three pieces of meat laid out to test the heat, not a full load. A man in a canvas apron turns one piece with long tongs, alone, watching it, not looking at us. Beside the grill, a scarred wooden prep table with a chopping board and a stack of enamel plates, unused. Behind, empty red and green plastic chairs stacked and a single upturned crate. No crowd, no customers, no queue. Sun low-left through the thin smoke, catching it. Stillness and anticipation, not activity.

Avoid: beer bottles, beverage branding, crowd, queue, customers, party atmosphere, readable labels, stadium signage, national flags, team badges or football kit with visible lettering, a fully loaded grill, meat covering the whole grill surface, watermark, text anywhere in frame.
```

---

## C4-C10 row — three cards need full regeneration

### `arch-student.webp` — the sourced cell was another trader portrait, not a student

The crop agent correctly withheld this rather than mislabel it — the sourced grid cell shows a
mature tradeswoman in a headwrap and denim apron, arms crossed, same register as the unemployed
card, not the briefed 17-18-year-old. Full regen needed.

```
Digital painting, illustrative-realist, visible brushwork. Not photography, not 3D, not flat vector. Head-and-shoulders three-quarter portrait, square crop, subject weighted to the left of frame. Background is an out-of-focus township street at first light, reduced almost entirely to soft #3E3050 and #5A415C shapes. The only warm light is a thin #FFC98A rim along one edge of the face and shoulder from the low sun behind. Calm, direct, self-possessed. Not smiling. Not sad.

A young woman, seventeen or eighteen, a backpack strap over one shoulder, plain t-shirt. Curious, slightly amused expression, head tilted. Looking almost but not quite at the camera.

Avoid: school uniform with a visible badge or crest, books with readable titles, classroom background, phone in hand, text, watermark, collared work shirt, crossed-arms confident trader pose, apron, headwrap, any wardrobe that reads as an adult tradesperson rather than a teenager.
```

### `crisis-supplier.webp` — sourced cell had no trader in frame; composition's whole point is the person feeling the absence

**What's wrong:** the brief's point is explicit — *"the subject of the picture is the absence,"*
which only reads if there's a person present to feel it. Empty shelves alone are just an empty
shop.

```
Digital painting, illustrative-realist, visible brushwork. Not photography, not 3D, not flat vector. KwaDream township setting. Palette anchors #3E3050, #5A415C, #F2941C, #6B4630. Low sun from the left, long shadow.

An empty delivery bay behind a stall, mid-morning. A trader stands beside a stack of empty plastic crates looking down the road at nothing, a phone held loosely at his side, screen dark and turned away. The stall's shelves visible behind him are half-bare. The trader must be clearly present and visible in the frame, not merely implied — this is a picture of a person facing an absence, not an empty room. Low sun from the left throwing his long shadow across the empty crates.

Avoid: delivery vehicle in frame, branded crates or pallets, readable phone screen, anger or gesticulating, text, logos, watermark, an empty scene with no person present.
```

### `crisis-credit.webp` — sourced cell was a wide populated street scene, not the briefed hands-only close shot

```
Digital painting, illustrative-realist, visible brushwork. Not photography, not 3D, not flat vector. KwaDream township setting. Palette anchors #3E3050, #5A415C, #F2941C, #6B4630. Low warm light from the left.

A close three-quarter view across a stall counter, mid-morning, tightly framed — this is a close-up, not a wide establishing shot. A customer's hands are open and empty, palms slightly up, resting on the counter beside a small pile of goods that has been set aside rather than paid for. The trader's hands rest on the counter opposite, still. Neither face is in frame — the entire image is hands, the goods, and the counter between them, filling most of the frame. No wide street, no background crowd, no storefront visible beyond soft out-of-focus blur at the very edges.

Avoid: money visible, cash, notes or coins, card machine, readable packaging, faces, confrontation, text, logos, watermark, wide shot, visible street or crowd, multiple full figures in frame.
```

### `crisis-surge.webp` — sourced cell was a rain scene with a tonally threatening hooded figure; worst mismatch in the set

**What's wrong, specifically:** the brief calls for a busy grill-stand queue on "a good day" —
energy, not chaos. What generated was a hooded figure reaching into a produce stall in heavy rain
under one harsh bulb — no rain was ever authorized for this card, and the framing reads closer to
a theft/threat vignette than a demand spike. Do not reuse or crop any part of this source image.

```
Digital painting, illustrative-realist, visible brushwork. Not photography, not 3D, not flat vector. KwaDream township setting. Palette anchors #3E3050, #F2941C, #FDB74D. Raking sun from the left, higher than the other crisis scenes. Clear dry weather, no rain, no clouds.

A queue at a grill stand, seen from behind and to one side, late morning, under clear bright sun. Eight or nine people waiting in an orderly line, backs mostly to us, the line running out of frame. At the front, the trader's arm reaching across the grill with tongs, motion-blurred slightly. Thick smoke rising from the grill. Energy, pressure, anticipation of a good trading day — not chaos, not danger, not confrontation.

Avoid: rain, wet ground, storm, dark stormy sky, faces at camera, football team kit with lettering or badges, stadium signage, national flags, beer branding, crowd trouble, theft, aggressive reaching gesture, hooded or concealed figure, threatening posture, text, logos, watermark.
```

---

## Continuity break — `street-morning.webp` regeneration required as part of the C1-C2-C3 set

**What's wrong:** `ASSETS.md` names C1-C3 its highest-risk generation specifically because they
must be the *same street, same camera, same stalls* at three times of day. `street-dawn.webp`
(accepted, C1) shows plain grey-blue corrugated shutters and packed red-brown earth. What shipped
as `street-morning.webp` shows vivid rainbow poster-world signboards on every stall and a
paved/cobblestone-looking wet ground — a different street on a different day, not the same one an
hour later. This must be regenerated using `street-dawn.webp` itself as an image-reference input
if the tool supports it, so the structure genuinely carries over.

```
Digital painting, illustrative-realist, visible brushwork, slight canvas tooth, confident opaque strokes, edges slightly rough. Not photography, not 3D render, not flat vector. KwaDream township — corrugated iron, pallet wood, breeze block, tyre planters, plastic crates, overhead power lines, hillside of small painted houses behind, red-brown packed earth (NOT paving, NOT cobblestone, NOT wet-looking). Wide establishing view, camera at standing eye level, horizon on the lower third. This must be the SAME street as the attached reference image: same stall structures, same plain corrugated-iron and pallet-wood construction with no colourful painted signboards yet, same packed red-brown dirt road, same power-line poles in the same positions — only the light and the number of open stalls change.

The identical township market street from the reference image, now at sunrise. Three or four stalls open — shutters raised, one tarpaulin being tied off, a trestle table set up. Four or five people, some working, one walking. The sun is just on the horizon at the end of the street, flaring #FDB74D softly (not a stark hard-edged white disc — soft flare only), throwing very long shadows straight toward the camera. The sky is still violet #3E3050 above, with a broad #FFC98A band low. Warm light strikes only the upper edges of the stalls and the tops of heads; everything below remains in violet shadow. Smoke from one grill rising straight up and catching the light. Stalls remain plain corrugated iron and wood — no colourful painted boards yet; those belong to the fully-open poster world later in the day, not this hour.

Avoid: crowd, full trade, midday blue sky, short shadows, text, logos, national flags, vehicles in the foreground, hard-edged sun disc, lens flare star-burst, colourful painted stall signboards, paved or cobblestone ground, wet-looking ground, any street layout or stall structure that differs from the reference image, watermark.
```

---

## Compositional misses — same content, needs the reserved space actually honoured

### `splash-poster.webp` — top-22% wordmark band is not clear

Colour signboards intrude starting around 13-15% down the frame, well inside the reserved band.
Add explicit framing pressure. Use the existing A1 prompt from `PROMPTS.md` unchanged, but replace
its final framing sentence with:

```
The top 25% of the frame, measured from the very top edge, must be sky only — no signboards, no roofs, no power lines, no structures of any kind may enter that band. Push all stalls, boards and rooflines down so the tallest one begins no higher than 25% of the way down the image. This is a hard requirement, not a suggestion — the space is reserved for a wordmark to be composited later in code.
```

### `og-card.webp` — right 40% is busy, brief needs it open for a title overlay

Use the existing A2 prompt from `PROMPTS.md` unchanged, but replace its framing sentence with:

```
The right 40% of the frame must be simple and uncluttered — soft out-of-focus background only, no additional figures, no crates, no patterned goods, nothing that competes for attention. Keep all secondary detail (background stalls, bystanders, patterned fabric) confined to the left 60% of the frame. This is a hard requirement: the open space is reserved for a title to be composited later in code.
```

---

## Needs a dedicated zoom check, not a regen (yet)

`verdict-1.webp`, `verdict-2.webp`, `verdict-3.webp`, and `splash-poster.webp`'s bottle-shelf
area: shelf/counter packaging renders denser and more label-like than the deliberately-generic
treatment `stall-spaza.webp` got right. Before shipping, crop each shelf region to 100% and read
every visible label by eye for real brand text or logos. If any resolve to legible real-world
marks, they go in this file's next revision as regenerations; if they're convincingly abstract
pattern/colour with no readable words, they can ship as-is — do not decide this from the
full-frame thumbnail.

Also unresolved: `street-day.webp` — crowd density and a bright sun-disc lean toward full
poster-world energy rather than the "still not midday" the brief specifies. Judge this once
`street-morning.webp` is fixed and the three can be compared as an actual set — a call made in
isolation right now would be guessing at the wrong reference point.
