import fs from 'fs';
const src = fs.readFileSync('bundle.js', 'utf8');
const BS = String.fromCharCode(92);

function slice(startPat, open, close) {
  const i = src.indexOf(startPat);
  if (i < 0) throw new Error('not found: ' + startPat);
  const j = src.indexOf(open, i);
  let depth = 0;
  for (let k = j; k < src.length; k++) {
    const c = src[k];
    if (c === '"' || c === "'" || c === '`') {
      const q = c; k++;
      while (k < src.length && src[k] !== q) { if (src[k] === BS) k++; k++; }
      continue;
    }
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) return src.slice(j, k + 1); }
  }
  throw new Error('unbalanced: ' + startPat);
}

const crisis = eval('(' + slice('kl={', '{', '}') + ')');
const plan   = eval('(' + slice('[{id:"vision"', '[', ']') + ')');
const opps   = eval('(' + slice('[{id:"phonerepair"', '[', ']') + ')');

// Drop the fields the redesign does not use: emoji (banned as an icon system),
// img (unfetched), and every *Color field (the old palette is the anti-reference).
const dropKeys = new Set(['emoji', 'img', 'demandColor', 'compColor', 'vColor', 'color', 'icon']);
const strip = v => Array.isArray(v) ? v.map(strip)
  : (v && typeof v === 'object')
    ? Object.fromEntries(Object.entries(v).filter(([k]) => !dropKeys.has(k)).map(([k, x]) => [k, strip(x)]))
    : v;

const data =
  'var OPPS=' + JSON.stringify(strip(opps)) + ';\n' +
  'var PLAN=' + JSON.stringify(strip(plan)) + ';\n' +
  'var CRISIS=' + JSON.stringify(strip(crisis)) + ';';

const out = fs.readFileSync('template.html', 'utf8').replace('/*__DATA__*/', () => data);
if (out.includes('/*__DATA__*/')) throw new Error('placeholder not replaced');
fs.writeFileSync('hustle-shell.html', out);

console.log('opportunities:', opps.length);
console.log('plan sections :', plan.length);
console.log('crisis        :', Object.entries(crisis).map(([k, v]) => k + '=' + v.length + 'd').join(' '));
console.log('data bytes    :', data.length.toLocaleString());
console.log('output bytes  :', out.length.toLocaleString());
