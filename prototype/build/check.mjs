import fs from 'fs';
import { execFileSync } from 'child_process';

const html = fs.readFileSync('hustle-shell.html', 'utf8');

/* ---- 1. does the inline JS parse? ---- */
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
scripts.forEach((s, i) => {
  fs.writeFileSync(`.chk${i}.js`, s);
  execFileSync(process.execPath, ['--check', `.chk${i}.js`]);
  fs.unlinkSync(`.chk${i}.js`);
  console.log(`script ${i}: parses (${s.length.toLocaleString()} bytes)`);
});

/* ---- 2. contrast of every foreground/background pair the CSS actually uses ---- */
const hex = h => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join(''); return h.match(/../g).map(x => parseInt(x, 16) / 255); };
const L = h => { const c = hex(h).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const CR = (a, b) => { const [x, y] = [L(a), L(b)].sort((m, n) => n - m); return (x + .05) / (y + .05); };

const T = { ink: '#14100D', surface: '#1F1813', s2: '#2A211A', warm: '#31211A', line: '#3A2E24',
  text: '#F5EDE3', text2: '#C4B3A0', text3: '#A89480',
  accent: '#E2571E', accentHi: '#F2701F', accentLo: '#B33F13', sign: '#F2A81C',
  good: '#6FBF73', bad: '#E2453C', badText: '#EE6B60', tagHot: '#3a2216', tagHotFg: '#F0A583',
  tagRisk: '#3a1d1a', tagRiskFg: '#F09A94' };

const pairs = [
  ['body text on page',        T.text,  T.ink,      4.5],
  ['body text on surface',     T.text,  T.surface,  4.5],
  ['secondary on surface',     T.text2, T.surface,  4.5],
  ['muted floor on surface',   T.text3, T.surface,  4.5],
  ['muted floor on raised',    T.text3, T.s2,       4.5],
  ['muted floor on warm bar',  T.text3, T.warm,     4.5],
  ['label on page',            T.text3, T.ink,      4.5],
  ['CTA ink on light stop',    T.ink,   T.accentHi, 4.5],
  ['CTA ink on dark stop',     T.ink,   T.accent,   4.5],
  ['kicker ink on sign',       T.ink,   T.sign,     4.5],
  ['skip-link ink on sign',    T.ink,   T.sign,     4.5],
  ['stamp ink on accent',      T.ink,   T.accent,   4.5],
  ['disabled CTA on page',     T.text3, T.ink,      4.5],
  ['pool figure on surface',   T.accent, T.surface, 3.0],
  ['good value on surface',    T.good,  T.surface,  4.5],
  ['warn value on surface',    T.sign,  T.surface,  4.5],
  ['bad text on surface',      T.badText, T.surface, 4.5],
  ['bad text on raised',       T.badText, T.s2,      4.5],
  ['hot tag',                  T.tagHotFg,  T.tagHot,  4.5],
  ['risk tag',                 T.tagRiskFg, T.tagRisk, 4.5],
  ['text on raised control',   T.text,  T.s2,       4.5],
  ['stepper ink on hover',     T.ink,   T.accent,   4.5]
];

let fails = 0;
console.log('\ncontrast (both gradient stops checked explicitly):');
for (const [name, fg, bg, min] of pairs) {
  const r = CR(fg, bg);
  const ok = r >= min;
  if (!ok) fails++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(6)}:1  (min ${min})  ${name}`);
}

/* ---- 3. static rules the shipped build broke ----
   Value checks run against comment-stripped source. The banned strings also
   appear inside the comments that document the shipped build's failures,
   which is evidence, not a violation — the first version of this check
   failed on its own explanation of the bug it was checking for. */
const code = html
  .replace(/\/\*[\s\S]*?\*\//g, ' ')   // CSS + JS block comments
  .replace(/<!--[\s\S]*?-->/g, ' ')    // HTML comments
  .replace(/^\s*\/\/.*$/gm, ' ');      // JS line comments

const checks = [
  ['no hardcoded 7 in day maths', !/\b7\s*-\s*\w+\s*-\s*1\b/.test(html)],
  ['no #fff / #ffffff value',      !/#(fff|ffffff)\b/i.test(code)],
  ['no #000 / #000000 value',      !/#(000|000000)\b/i.test(code)],
  ['bad-text token used for text', !/color:var\(--bad\)/.test(code)],
  ['has prefers-reduced-motion',  /prefers-reduced-motion/.test(html)],
  ['has :focus-visible ring',     /:focus-visible/.test(html) && /outline:3px/.test(html)],
  ['has @media breakpoints',      (html.match(/@media \(min-width/g) || []).length >= 5],
  ['has clamp()',                 /clamp\(/.test(html)],
  ['exactly one h1',              (html.match(/<h1/g) || []).length === 1],
  ['has localStorage',            /localStorage/.test(html)],
  ['has history.pushState',       /history\.pushState/.test(html)],
  ['video not preloaded in HTML', !/<video/.test(html)],
  ['has meta description',        /name="description"/.test(html)],
  ['has og: tags',                /property="og:/.test(html)],
  ['has favicon',                 /rel="icon"/.test(html)],
  ['has theme-color',             /name="theme-color"/.test(html)],
  ['no width/height transition',  !/transition:[^;]*\b(width|height|padding|margin)\b/.test(html)],
  ['no zero-offset colour glow',  !/box-shadow:\s*0\s+0\s+\d+px\s+(rgba\(2|#[EF])/i.test(html)]
];
console.log('\nstatic rules:');
for (const [name, ok] of checks) { if (!ok) fails++; console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}`); }

/* ---- 4. font-size floors ----
   The `font:` shorthand counts. The first version of this check only matched
   `font-size:`, so two `font:700 .72rem/1` declarations — 11.52px, the stamped
   corner flag on the opportunity and plan cards — sat under the floor while
   this line printed "under 12px: 0". A harness passing is necessary, not
   sufficient; it only ever tests what it was told to look at. */
const decls = [
  ...html.matchAll(/font-size:\s*([\d.]+)(rem|px)/g),
  ...html.matchAll(/\bfont:\s*[^;{}]*?(\d*\.?\d+)(rem|px)(?:\s*\/|\s)/g)
];
const sizes = decls
  .map(m => m[2] === 'rem' ? +m[1] * 16 : +m[1])
  .filter(v => v > 0);
const under12 = sizes.filter(v => v < 12);
console.log(`\ntype floors: ${sizes.length} fixed font-size decls (incl. font: shorthand), min ${Math.min(...sizes)}px, under 12px: ${under12.length}`);
if (under12.length) fails++;

/* ---- 5. every fixed size sits on the DESIGN.md ramp ---- */
const RAMP = [.75, .875, 1, 1.125, 1.25, 1.5, 1.875, 2.25, 2.625, 3, 4, 7.5].map(r => r * 16);
const offRamp = [...new Set(sizes.filter(v => !RAMP.some(r => Math.abs(r - v) < .01)))];
console.log(`type ramp : ${offRamp.length ? 'FAIL off-ramp ' + offRamp.map(v => v + 'px').join(', ') : 'PASS all sizes on the DESIGN.md scale'}`);
if (offRamp.length) fails++;

/* ---- 6. text encoding integrity ----
   Every check above reads the file with `utf8` and then asks about its content,
   so a file that is valid UTF-8 carrying double-encoded *text* passes all of
   them. That is exactly what shipped: an editor wrote template.html back
   through cp1252, turning all 51 em-dashes into "â€”" and the chosen-spot
   checkmark into "âœ“", and 43 assertions plus the design detector reported
   clean. Read the bytes, not the decoded string. */
const raw = fs.readFileSync('hustle-shell.html');
const enc = [
  ['no UTF-8 BOM', !(raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF)],
  ['decodes as strict UTF-8', (() => {
    try { new TextDecoder('utf-8', { fatal: true }).decode(raw); return true; } catch { return false; }
  })()],
  /* C3 A2 = "â" — the cp1252 re-encoding signature. Latin text here has no
     legitimate use for it, so any occurrence is corruption, not content. */
  ['no cp1252 double-encoding', !raw.includes(Buffer.from([0xC3, 0xA2]))],
  ['no U+FFFD replacement char', !html.includes('�')]
];
console.log('\nencoding:');
for (const [name, ok] of enc) { if (!ok) fails++; console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}`); }

console.log(fails ? `\n${fails} FAILURES` : '\nall checks pass');
process.exit(fails ? 1 : 0);
