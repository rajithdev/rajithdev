// "Order tickets": a GitHub profile drawn as kitchen dockets on a rail.
// Edit profile.config.json and push: a GitHub Action runs this file and
// rewrites README.md and assets/. No dependencies. Preview: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { MONO, esc, wrap, n, slug, monoWidth } from './src/util.mjs';

const cfg = JSON.parse(readFileSync(new URL('./profile.config.json', import.meta.url), 'utf8'));
const dir = new URL('./assets/', import.meta.url);
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
const out = (name, s) => writeFileSync(new URL(name, dir), s.trim() + '\n');

const INK = '#191b1e', RED = '#c4161c', FADE = '#565b61';
const PAPER = { white: '#f6f7f7', yellow: '#ffe27d', pink: '#ffc4d0' };
const EDGE = { white: '#c9cdd1', yellow: '#dcb93f', pink: '#e495a8' };
const STILL = '@media (prefers-reduced-motion: reduce){*{animation:none!important}}';
const mono = (s, px) => monoWidth(s, px);

/* --- 5x7 dot-matrix lettering, drawn as vectors so it looks the same everywhere */
const G = {};
for (const row of `A 0E1111 1F111111|B 1E1111 1E11111E|C 0E1110 1010110E|D 1E1111 1111111E|E 1F1010 1E10101F|F 1F1010 1E101010|G 0E1110 1711110F|H 111111 1F111111|I 0E0404 0404040E|J 070202 0202120C|K 111214 18141211|L 101010 1010101F|M 111B15 15111111|N 111915 13111111|O 0E1111 1111110E|P 1E1111 1E101010|Q 0E1111 1115120D|R 1E1111 1E141211|S 0F1010 0E01011E|T 1F0404 04040404|U 111111 1111110E|V 111111 11110A04|W 111111 15151B11|X 11110A 040A1111|Y 11110A 04040404|Z 1F0102 0408101F|- 000000 1F000000|0 0E1113 1519110E|1 040C04 0404040E|2 0E1101 0608101F|3 1F0204 0201110E|4 02060A 121F0202|5 1F101E 0101110E|6 060810 1E11110E|7 1F0102 04080808|8 0E1111 0E11110E|9 0E1111 0F01020C`.split('|')) {
  G[row[0]] = row.slice(2).replace(' ', '').match(/../g).map((h) => parseInt(h, 16));
}
const dotCols = (s) => [...s].length * 6 - 1;
function dots(text, x, y, pitch, strike = 1.3) {
  const s = n(pitch * 0.9), w = n(pitch * strike);
  let d = '';
  [...text.toUpperCase()].forEach((ch, i) => (G[ch] ?? []).forEach((bits, r) => {
    for (let c = 0; c < 5; c++) if (bits & (16 >> c)) d += `M${n(x + (i * 6 + c) * pitch)} ${n(y + r * pitch)}h${w}v${s}h-${w}z`;
  }));
  return d;
}

/* --- paper with a torn lower edge */
function paper(x, y, w, h, tooth = 10) {
  let p = `M${x} ${y}H${x + w}V${y + h}`;
  const count = Math.round(w / tooth), t = w / count;
  for (let i = 0; i < count; i++) p += `l${n(-t / 2)} ${n(t * 0.55)}l${n(-t / 2)} ${n(-t * 0.55)}`;
  return p + 'Z';
}
const sheet = (x, y, w, h, kind) => `<path d="${paper(x, y, w, h)}" fill="${PAPER[kind]}" stroke="${EDGE[kind]}"/>`;
const rule = (x1, x2, y) => `<path d="M${x1} ${y}H${x2}" stroke="${INK}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
const rail = (w, h) => `<rect width="${w}" height="${h}" rx="3" fill="url(#steel)"/><rect y="${h - 3}" width="${w}" height="3" rx="1.5" fill="#4b5158"/>`;
const STEEL = `<linearGradient id="steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef0f2"/><stop offset=".4" stop-color="#b3b9c0"/><stop offset="1" stop-color="#7b838c"/></linearGradient>`;
const svg = (w, h, title, desc, defs, css, body) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc>
<defs>${defs}</defs><style>text{font-family:${MONO};fill:${INK}}${css}${STILL}</style>
${body}
</svg>`;
const text = (x, y, px, s, o = '') => `<text x="${x}" y="${y}" font-size="${px}" ${o}>${esc(s)}</text>`;

/* --- hero */
const words = cfg.name.split(' ');
const nameLines = [words.slice(0, 2).join(' '), words.slice(2).join(' ')].filter(Boolean);
const { status, place, order, note } = cfg.header;
const PRINT = `.feed{animation:feed 1s steps(16) both}@keyframes feed{from{transform:translateY(-104%)}}`;
function hero(W, H, o) {
  const X = o.x, TW = W - X * 2 - o.spare, IN = X + o.pad, TOP = o.rail - 8, R = X + TW - o.pad;
  const pitch = n(Math.min(o.maxPitch, (TW - o.pad * 2) / Math.max(...nameLines.map(dotCols))));
  let y = TOP + o.head;
  let b = text(IN, y, o.small, status, `fill="${FADE}" style="fill:${FADE}"`) + text(R, y, o.small, place, `text-anchor="end" style="fill:${FADE}"`);
  y += o.gap;
  for (const l of nameLines) { b += `<path d="${dots(l, IN, y, pitch, 1.1)}" fill="${INK}"/>`; y += pitch * 7 + pitch * 2.4; }
  y += o.after; b += rule(IN, R, n(y)); y += o.line;
  for (const l of order) { b += text(IN, n(y), o.px, '1', 'font-weight="700"') + text(n(IN + o.px * 1.3), n(y), o.px, l, 'font-weight="700"'); y += o.line; }
  for (const l of note) { b += `<text x="${n(IN + o.px * 1.3)}" y="${n(y)}" font-size="${o.px}" font-weight="600" style="fill:${RED}">${esc(l)}</text>`; y += o.line; }
  const TH = n(y - TOP);
  return svg(W, H, cfg.name, `${order.join(', ')}. ${note.join(' ')}. ${place}.`, STEEL + `<clipPath id="c"><rect y="${TOP}" width="${W}" height="${H}"/></clipPath>`, PRINT,
    `<g clip-path="url(#c)"><g transform="rotate(${o.tilt} ${X + TW} ${TOP})">${sheet(X + o.spare + 4, TOP, TW, TH - 34, 'pink')}</g><g transform="rotate(${o.tilt / 2.4} ${X + TW} ${TOP})">${sheet(X + o.spare / 2, TOP, TW, TH - 14, 'yellow')}</g><g class="feed">${sheet(X, TOP, TW, TH, 'white')}${b}</g></g>${rail(W, o.rail)}`);
}
out('hero.svg', hero(846, 490, { x: 14, spare: 40, pad: 34, rail: 30, head: 46, gap: 22, small: 24, px: 27, line: 39, after: 8, maxPitch: 7.4, tilt: -1.6 }));

/* --- link stubs */
const kinds = ['white', 'yellow', 'pink'];
cfg.links.forEach((l, i) => {
  const W = 268, H = 62, k = kinds[i % 3];
  const px = Math.min(15, Math.floor((W - 36) / mono(l.text, 1) * 10) / 10);
  out(`link-${slug(l.label)}.svg`, svg(W, H, l.label, l.text, '', '', `<path d="M.5 .5H${W - 0.5}V22a9 9 0 0 0 0 18V${H - 0.5}H.5V40a9 9 0 0 0 0-18Z" fill="${PAPER[k]}" stroke="${EDGE[k]}"/>` + text(20, 25, 12, l.label.toUpperCase(), `style="fill:${FADE}"`) + text(20, 47, px, l.text, 'font-weight="700"')));
});

/* --- Dines as a kitchen display: the lit header moves station to station */
const f = cfg.featured;
const stations = [f.lead, ...f.features];
const KDS = `.k{fill:#e9eef2}.m{fill:#aab4bd}.lit{opacity:0;animation:lit ${stations.length * 1.6}s infinite}@keyframes lit{0%,${n(100 / stations.length)}%{opacity:1}${n(100 / stations.length + 1)}%,100%{opacity:0}}@media (prefers-reduced-motion:reduce){.l0{opacity:1}}`;
const bezel = (W, H) => `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="#2a2f35" stroke="#555d66"/><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="5" fill="#0e1214"/>`;
const station = (st, i, y) => {
  const W = 400, P = 24, RH = 74;
  let b = `<rect x="${P}" y="${y}" width="${W - P * 2}" height="${RH}" rx="4" fill="#1b2125"/><rect x="${P}" y="${y}" width="34" height="${RH}" rx="4" fill="#38424a"/><rect class="lit l${i}" style="animation-delay:${n(i * 1.6)}s" x="${P}" y="${y}" width="34" height="${RH}" rx="4" fill="#2f9e57"/><text x="${P + 17}" y="${y + 44}" text-anchor="middle" font-size="19" font-weight="700" style="fill:#fff">${i + 1}</text><text x="${P + 46}" y="${y + 26}" font-size="17" font-weight="700" style="fill:#e9eef2">${esc(st.title)}</text>`;
  wrap(st.text, 14, W - P * 2 - 54, 2, mono).forEach((l, j) => { b += `<text x="${P + 46}" y="${y + 46 + j * 18}" font-size="14" style="fill:#b4bec7">${esc(l)}</text>`; });
  return b;
};
const screen = (list, from, head) => svg(400, 288, 'Dines', list.map((x) => `${x.title}: ${x.text}`).join('. '), '', KDS, bezel(400, 288) + head + list.map((x, j) => station(x, from + j, (head ? 100 : 26) + j * 82)).join(''));
out('dines-1.svg', screen(stations.slice(0, 2), 0, `<path d="${dots('DINES', 26, 38, 5.4, 1.2)}" fill="#7fe3a0"/><text x="374" y="60" text-anchor="end" font-size="15" style="fill:#b4bec7">restaurant OS</text>`));
out('dines-2.svg', screen(stations.slice(2), 2, ''));

/* --- project tickets */
const kindOf = (p) => (PAPER[p.paper] ? p.paper : 'white');
const files = cfg.projects.map((p, i) => {
  const W = 400, H = 330, X = 4, TW = W - 8, IN = 26, INNER = W - IN * 2, k = kindOf(p);
  const latin = p.name.replace(/[^\x20-\x7e]/g, '').trim(), extra = p.name.slice(latin.length).trim();
  const pitch = n(Math.min(3.5, INNER / dotCols(latin)));
  let b = sheet(X, 8, TW, H - 18, k) + rail(W, 14);
  b += text(IN, 42, 15, `#${String(i + 1).padStart(2, '0')}`, 'font-weight="700"') + text(W - IN, 42, 13, p.tag, `text-anchor="end" style="fill:${k === 'white' ? FADE : '#4a4030'}"`);
  b += `<path d="${dots(latin, IN, 62, pitch)}" fill="${INK}"/>`;
  if (extra) b += text(n(IN + (dotCols(latin) + 3) * pitch), n(62 + pitch * 6.4), 20, extra, 'font-weight="700"');
  wrap(p.description, 15, INNER, 4, mono).forEach((l, j) => { b += text(IN, 116 + j * 21, 15, l); });
  b += rule(IN, W - IN, 204);
  p.stack.slice(0, 4).forEach((x, j) => { b += text(IN, 231 + j * 24, 16, '1', 'font-weight="700"') + text(IN + 24, 231 + j * 24, 16, x, 'font-weight="700"'); });
  const stamp = p.demo ? 'LIVE' : 'CODE', col = p.demo ? RED : INK, sp = 4.2;
  b += `<g transform="translate(${W - 106} 258) rotate(-8)"><rect x="-64" y="-30" width="128" height="60" rx="6" fill="none" stroke="${col}" stroke-width="3.5"/><path d="${dots(stamp, n(-dotCols(stamp) * sp / 2), n(-3.5 * sp), sp)}" fill="${col}"/></g>`;
  const file = `ticket-${slug(latin)}.svg`;
  out(file, svg(W, H, p.name, `${p.description} ${p.stack.join(', ')}.`, STEEL, '', b));
  return file;
});

/* --- toolkit as two receipts */
const half = Math.ceil(cfg.toolkit.length / 2);
[cfg.toolkit.slice(0, half), cfg.toolkit.slice(half)].forEach((items, t) => {
  const W = 400, H = 40 + Math.ceil(items.length / 2) * 36 + 22;
  out(`toolkit-${t + 1}.svg`, svg(W, H, 'Toolkit', items.join(', '), STEEL, '', sheet(4, 8, W - 8, H - 18, 'white') + rail(W, 14) + items.map((x, i) => text(28 + (i % 2) * 182, 52 + Math.floor(i / 2) * 36, 17, x, 'font-weight="700"')).join('')));
});

/* --- README */
const a = cfg.about;
writeFileSync(new URL('./README.md', import.meta.url), `<img src="assets/hero.svg" width="100%" alt="${esc(`${cfg.name}. ${order.join(', ')}. ${note.join(' ')}.`)}">

<p align="center">
${cfg.links.map((l) => `<a href="${l.url}"><img src="assets/link-${slug(l.label)}.svg" width="268" alt="${esc(`${l.label}: ${l.text}`)}"></a>`).join('\n')}
</p>

${a.intro}

${a.rows.map((r) => `- **${r.label}:** ${r.value}`).join('\n')}

## Dines

<p align="center">
<a href="${f.url}"><img src="assets/dines-1.svg" width="400" alt="${esc(stations.slice(0, 2).map((x) => `${x.title}: ${x.text}`).join('. '))}"></a>
<a href="${f.url}"><img src="assets/dines-2.svg" width="400" alt="${esc(stations.slice(2).map((x) => `${x.title}: ${x.text}`).join('. '))}"></a>
</p>

${f.summary}

**Built with** ${f.stack.join(', ')}. **[getdines.com](${f.url})**

## Builds

${cfg.legend}

<p align="center">
${cfg.projects.map((p, i) => `<a href="${p.url}"><img src="assets/${files[i]}" width="400" alt="${esc(`${p.name}: ${p.description} ${p.stack.join(', ')}`)}"></a>`).join('\n')}
</p>

**Try them:** ${cfg.projects.filter((p) => p.demo).map((p) => `[${p.name}](${p.demo})`).join(' · ')}

## Toolkit

<p align="center">
<img src="assets/toolkit-1.svg" width="400" alt="${esc(cfg.toolkit.slice(0, half).join(', '))}">
<img src="assets/toolkit-2.svg" width="400" alt="${esc(cfg.toolkit.slice(half).join(', '))}">
</p>

<p align="center"><img width="520" src="https://streak-stats.demolab.com?user=${cfg.github}&hide_border=true&border_radius=4&background=F6F7F7&stroke=C9CDD1&ring=191B1E&fire=C4161C&currStreakNum=191B1E&sideNums=191B1E&currStreakLabel=C4161C&sideLabels=565B61&dates=565B61" alt="GitHub contribution streak"></p>

<p align="center"><sub>${cfg.footer}</sub></p>
`);
console.log('built');
