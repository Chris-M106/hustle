# REGEN-1.md — fixes for the first GPT pass, 2026-08-06

Six assets failed review against `PROMPTS.md`. This file holds only what changed and why, plus the
corrected paste-ready prompt for each. Everything else from the first pass (A1–A5, B1–B5, C2–C10,
C15–C17) is accepted as-is — do not regenerate those.

---

## C1 — `street-dawn.webp` — sky drifted warm, needed cold

**What came back:** a coral/magenta sunset sky. **What was asked for:** cold pre-dawn violet, warmth
confined to one thin horizon band. C1 seeds C2 and C3 as an image-reference — its temperature error
would propagate into both if accepted. Reject-and-reroll, not a fine-tune.

```
Digital painting, illustrative-realist, visible brushwork, slight canvas tooth, confident opaque strokes, edges slightly rough. Not photography, not 3D render, not flat vector. KwaDream township — corrugated iron, pallet wood, breeze block, tyre planters, plastic crates, overhead power lines, hillside of small painted houses behind, red-brown packed earth. Wide establishing view, camera at standing eye level, horizon on the lower third.

A township market street before opening, the minute before sunrise — not sunset, not dusk. Empty. Stalls shuttered — corrugated iron panels down, tarpaulins folded and tied, chairs stacked. Packed red-brown earth road running away from the camera. A single figure in the middle distance walking toward us carrying a folded trestle table under one arm, small in frame, unhurried.

Sky: the sky is COLD and dominated by deep indigo-violet #3E3050 from directly overhead down to about two-thirds of the frame height, grading only slightly warmer toward #5A415C lower down. Warmth is confined to ONE narrow band of #FFC98A running along the skyline itself, no more than 8% of the frame's height, sitting right where the land meets the sky. Above that band the sky stays cold violet-indigo all the way to the top edge. No direct sunlight anywhere in the scene — everything is in soft blue-violet pre-dawn shadow. Overhead power lines silhouetted against the cold sky. Very quiet, very still, cold air.

Avoid: sun disc visible, warm light on any surface, crowd, open stalls, lit windows, vehicles, text, logos, national flags, stars or moon, blue-hour cyan cast, watermark, orange sky, pink sky, magenta sky, coral sky, red sky, sunset colours anywhere, any warm hue filling more than the single thin horizon band, gradient that reads as "golden hour," gradient that reads as dusk.
```

---

## B6 — `stall-carwash.webp` — model substituted `veg`, not briefed

**What came back:** a vegetable stall, unbriefed, replacing the car wash. Decision made: regenerate
to the original brief. `veg` is not a chosen sixth business — discard it, do not fold it in as a
ninth asset.

```
Digital painting, illustrative-realist, visible brushwork, slight canvas tooth. Not photography, not 3D, not flat vector. KwaDream township setting — corrugated iron, pallet wood, breeze block, red-brown earth, power lines, painted houses on the hillside behind. Palette anchors #3E3050, #5A415C, #F2941C, #FDB74D, #FFC98A, #6B4630, #F5F0FA, orange the only hot accent. One low warm sun, long directional shadows. Three-quarter view slightly below eye level, subject fills the left two-thirds, right third falls to a soft out-of-focus street, sun low-left ~25°, thin warm sky band fading to #5A415C at the corners.

A hand car wash on a patch of packed red-brown earth beside a township road, mid-morning. A mid-size hatchback covered in white soap foam, a young man in shorts and gumboots working a sponge along the door in a long stroke. Two buckets, a coiled hose running off to a standpipe, a stack of folded microfibre cloths on an upturned crate. Water darkening the earth in a wide patch, catching the low sun as a hard bright glare. A second, already-washed car parked and beaded with water behind.

Avoid: car brand badges or logos, number plates, readable text on the vehicle, luxury or new vehicles, chrome gloss, branded cleaning products, watermark, text anywhere in frame, vegetables, produce stall, market vegetables of any kind.
```

---

## B7 — `stall-sewing.webp` — model substituted `shoe`, not briefed

**What came back:** a shoe-repair stall, unbriefed. Same decision: regenerate to the sewing brief.

```
Digital painting, illustrative-realist, visible brushwork, slight canvas tooth. Not photography, not 3D, not flat vector. KwaDream township setting — corrugated iron, pallet wood, breeze block, red-brown earth, power lines, painted houses on the hillside behind. Palette anchors #3E3050, #5A415C, #F2941C, #FDB74D, #FFC98A, #6B4630, #F5F0FA, orange the only hot accent. One low warm sun, long directional shadows. Three-quarter view slightly below eye level, subject fills the left two-thirds, right third falls to a soft out-of-focus street, sun low-left ~25°, thin warm sky band fading to #5A415C at the corners.

A small alterations and tailoring stall, mid-morning. An older mechanical sewing machine on a wooden table under a lean-to of corrugated iron. A seamstress in a printed headwrap guides fabric through the machine, both hands on the cloth, eyes on the needle. Beside her, a dressmaker's dummy with a half-pinned garment, a jar of tape measures and shears, and a wall of thread spools on nails arranged by colour — a full spectrum, the brightest thing in frame after the sun. Off-cuts of printed fabric on the floor. Low warm light through the open front of the lean-to catching the thread wall and the edge of the fabric under the needle.

Avoid: sewing machine brand marks, pattern packets with text, fashion posters, price board, readable labels, watermark, text anywhere in frame, shoes, boots, shoe-repair tools, shoe polish tins, cobbler's last.
```

---

## B8 — `stall-printcv.webp` — model substituted `tavern` (beer), not briefed and content-inappropriate

**What came back:** a tavern stall with visible beer bottles and a cooler. Rejected on content grounds,
not just brief-drift: this is a New Venture Creation product for an NQF Level 2 youth learnership —
alcohol retail is not a business the game should be teaching or normalising as a starter venture, and
nobody authorised it as new content. Regenerate to the original print/copy/CV brief.

```
Digital painting, illustrative-realist, visible brushwork, slight canvas tooth. Not photography, not 3D, not flat vector. KwaDream township setting — corrugated iron, pallet wood, breeze block, red-brown earth, power lines, painted houses on the hillside behind. Palette anchors #3E3050, #5A415C, #F2941C, #FDB74D, #FFC98A, #6B4630, #F5F0FA, orange the only hot accent. One low warm sun, long directional shadows. Three-quarter view slightly below eye level, subject fills the left two-thirds, right third falls to a soft out-of-focus street, sun low-left ~25°, thin warm sky band fading to #5A415C at the corners.

A small print and copy shop in a converted shipping container, mid-morning. A desktop multifunction printer on a laminate counter, its output tray holding a short stack of blank paper. Behind the counter, a woman in a purple blouse working at an old desktop computer, its screen turned away from us so nothing on it is visible. A laminating machine, a guillotine cutter, and a wall rack of blank coloured card stock. A customer's forearm and hand rest on the near edge of the counter, the rest of them out of frame. Low sun through the container's open door lands in a hard bright rectangle across the counter and the paper stack.

Avoid: readable screen content, printer brand logos, sample documents with text, CV templates visible, posters, price list, Microsoft or Adobe interfaces, watermark, text anywhere in frame, alcohol, beer, beer bottles, cooler box, bar counter, tavern, liquor of any kind.
```

---

## C11 — `verdict-1.webp` (Business Boss) — baked-in text/UI, not a photographic scene

**What came back:** a diptych card with a green colour-block bottom half, a smiley-face circle icon,
and the words "SUCCESS" / caption text baked into the image. Spec called for a photographic scene
only — the tier is already communicated by the existing `.verdict-stamp` CSS component
(`sign-yellow`/`survive-green`/`enamel-orange`/`bad-text`), so baking a second, redundant, untranslatable
verdict indicator into the art is both a spec miss and a `DESIGN.md` violation (emoji-as-icon-system is
explicitly banned there).

```
Digital painting, illustrative-realist, visible brushwork. Not photography, not 3D, not flat vector. KwaDream township setting. Palette anchors #3E3050, #F2941C, #FFC98A secondary accent. Sun high-left ~50°, bright and warm.

A trader standing at the open front of a well-stocked stall late in the morning, hands on her hips, surveying it. Two customers at the counter being served by a second person — she has help now. Shelves full, goods well arranged, a second table added on the side. Sun high-left at fifty degrees, bright and warm, pale #FFC98A catching the top edge of the stall. Settled competence, not triumph.

This is a single continuous photographic-feeling scene filling the entire frame edge to edge. It is NOT a card, NOT a poster, NOT a UI component, NOT split into panels or colour blocks.

Avoid: any text, letters, words, captions, titles, banners of any kind, any icon, any emoji, any face-in-a-circle symbol, any colour-block panel or bar overlaid on the image, any border or frame drawn around the scene, split-screen or diptych composition, arms raised in victory, fist pump, money in frame, cash, celebration, confetti, trophy, luxury goods, logos, watermark.
```

---

## C12 — `verdict-2.webp` (Sharp Operator) — same failure class as C11

```
Digital painting, illustrative-realist, visible brushwork. Not photography, not 3D, not flat vector. KwaDream township setting. Palette anchors #3E3050, #F2941C, muted #6FBF73 secondary accent. Warm raking light from the left.

A trader mid-morning at a solid, working stall, counting stock on a shelf with one hand and marking a small notebook with the other. The notebook page is blank and turned away. Reasonable stock, one customer approaching from the right. Warm raking light from the left. Muted #6FBF73 green in the painted stall structure. Competent, mid-flow, unremarkable in the best way.

This is a single continuous photographic-feeling scene filling the entire frame edge to edge. It is NOT a card, NOT a poster, NOT a UI component, NOT split into panels or colour blocks.

Avoid: any text, letters, words, captions, titles, banners of any kind, any icon, any emoji, any face-in-a-circle symbol, any colour-block panel or bar overlaid on the image, any border or frame drawn around the scene, split-screen or diptych composition, readable notebook, numbers or handwriting visible, money, celebration, empty shelves, logos, watermark.
```

---

## C13 — `verdict-3.webp` (Hustler in Training) — same failure class as C11

```
Digital painting, illustrative-realist, visible brushwork. Not photography, not 3D, not flat vector. KwaDream township setting. Palette anchors #3E3050, #F2941C secondary accent. Warm light from the low left.

A trader at a thinly-stocked stall in mid-morning light, crouched down re-sorting goods in a crate, working on the problem. The stall is standing, tidy, and clearly still open — it is just not full. One person passing without stopping. Warm #F2941C light from the low left across the crate and their hands.

This is a single continuous photographic-feeling scene filling the entire frame edge to edge. It is NOT a card, NOT a poster, NOT a UI component, NOT split into panels or colour blocks.

Avoid: any text, letters, words, captions, titles, banners of any kind, any icon, any emoji, any face-in-a-circle symbol, any colour-block panel or bar overlaid on the image, any border or frame drawn around the scene, split-screen or diptych composition, head in hands, slumped posture, closed shutters, abandonment, pity framing, rain, logos, watermark.
```

---

## C14 — `verdict-4.webp` (Back to the Drawing Board) — same failure class as C11, plus the specific trap the original brief warned about

**What came back:** rain, dusk-dark blue-grey palette, a diptych with a red colour block and the word
"FAILURE" plus a frowning-face icon. This is precisely the failure mode the original prompt flagged in
advance — *"models read 'failure ending' and produce dusk, rain, and a slumped figure"* — and it
happened. Doubling down on the instruction below; if it recurs, drop every word that could read as
"failure"/"loss" from the prompt and describe only the physical scene.

```
Digital painting, illustrative-realist, visible brushwork. Not photography, not 3D, not flat vector. KwaDream township setting. Palette anchors #3E3050, #FDB74D, muted #FA9086 secondary accent. Low sun directly in frame at the end of the street, flaring. Dry, clear, bright morning air — NOT rain, NOT overcast, NOT dusk.

A trader standing at an empty stall just after sunrise, one hand resting on the bare counter, looking down the street toward the low sun rather than at the empty stall. The structure is intact — the stall is standing, the tarpaulin is tied, nothing is broken. Just no stock. Long shadow stretching toward the camera. The low sun is directly in frame at the end of the street, flaring #FDB74D. Muted #FA9086 in the painted stall boards. This is the beginning of a day, not the end of one — bright morning light, clear sky, dry ground.

This is a single continuous photographic-feeling scene filling the entire frame edge to edge. It is NOT a card, NOT a poster, NOT a UI component, NOT split into panels or colour blocks.

Avoid: any text, letters, words, captions, titles, banners of any kind, any icon, any emoji, any face-in-a-circle symbol, any colour-block panel or bar overlaid on the image, any border or frame drawn around the scene, split-screen or diptych composition, rain, wet ground, puddles, overcast sky, grey sky, dusk, night, packing up, dismantling, crying, head in hands, broken or wrecked structure, back turned to the sun, defeat posture, shame, dark or desaturated colour grade, logos, watermark.
```

---

## C18–C20 — spot icons for carwash/sewing/printcv — wrong construction, not what was briefed

**What came back:** solid filled orange icons. The shipped Scanner icon system (`ICONS` object,
`prototype/hustle-shell.html` lines 1425–1431) is `stroke="currentColor"` line art at `stroke-width:1.6`,
`fill="none"` — a filled-orange icon dropped into that row would visibly split the set in two families.
This asset is text-model SVG, not image-model raster — the first pass appears to have gone through an
image generator by mistake. Re-run through a text/code model.

```
Write three 24×24 SVG icons matching this exact construction: viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round", five to eight path elements maximum, NO fills of any colour, no text, no ids, no groups, no <rect> as a background, no orange, no colour of any kind — currentColor only, so the icon can be recoloured by CSS the same way the other five in this set already are. Match the visual weight of a Lucide-style outline icon.

1. carwash — a car in side profile with two arcs of water or foam above it.
2. sewing — a sewing machine: an L-shaped body, a needle arm, and a horizontal bed line.
3. printcv — a document sheet with a folded corner emerging from a printer body.
```

---

## Not regenerating

A1–A5, B1–B5 (the five real businesses), C2–C10, C15–C17 passed review at contact-sheet resolution.
Next check on those is a 100%-zoom brand/flag sweep per `ASSETS.md`'s "Check on return" table, once
they're cropped to individual files — not a regen.
