// SVG builders. Each returns one self-contained file: GitHub strips scripts
// from README images, so all motion is CSS, and every animation is switched
// off for visitors who prefer reduced motion.
import { MONO, SANS, esc, fit, wrap, n, sansWidth, monoWidth } from './util.mjs';
import { ICONS } from './icons.mjs';

const REDUCED = `@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`;
// Semibold and bold text runs wider than the regular-weight estimate.
const BOLD = 1.07;

/* ------------------------------------------------------------------ hero */
export function hero({ name, taglines, status, location }, t, rnd) {
  const W = 900, H = 340, HORIZON = 236, VX = W / 2;

  // Floor: rays from the vanishing point, plus horizontals that each slide to
  // the next one's position, which loops as "flying forward".
  const rays = [];
  for (let x = -1350; x <= W + 1350; x += 90) rays.push(`<line x1="${VX}" y1="${HORIZON}" x2="${x}" y2="${H}"/>`);
  const ys = Array.from({ length: 9 }, (_, i) => HORIZON + 4 * Math.pow(1.5, i));
  const rows = ys.slice(0, -1).map((y, i) =>
    `<line class="row" style="--d:${n(ys[i + 1] - y)}px" x1="0" y1="${n(y)}" x2="${W}" y2="${n(y)}"/>`).join('');

  // Shrink long names to fit, and keep stars clear of the name block.
  const namePx = Math.max(30, Math.min(78, Math.floor(800 / (sansWidth(name, 1) * 1.14))));
  const nameY = n(146 - (78 - namePx) * 0.35);
  const clear = Math.max(200, (sansWidth(name, namePx) * 1.14) / 2 + 24);
  const stars = Array.from({ length: 70 }, () => {
    const x = rnd() * W, y = rnd() * (HORIZON - 66) + 54;
    const r = rnd() * 0.9 + 0.4, delay = rnd() * 5, dur = rnd() * 3 + 2.5;
    if (x > VX - clear && x < VX + clear && y > 84 && y < 206) return '';
    return `<circle class="star" cx="${n(x, 1)}" cy="${n(y, 1)}" r="${n(r)}" style="animation-delay:-${n(delay)}s;animation-duration:${n(dur)}s"/>`;
  }).join('');

  // Taglines take turns: each is visible for PER seconds of the full cycle.
  const PER = 3.5;
  const lines = taglines.map((l) => fit(l, 16, 800, monoWidth));
  const many = lines.length > 1;
  const slot = 100 / Math.max(1, lines.length);
  const typed = lines.map((l, i) =>
    `<text class="line${i === 0 ? ' first' : ''}"${many ? ` style="animation-delay:${n(i * PER)}s"` : ''} x="${VX}" y="196" text-anchor="middle"><tspan fill="${t.a1}">&gt; </tspan>${esc(l)}<tspan class="cur" fill="${t.a1}"> ▍</tspan></text>`).join('\n  ');
  const lineCss = many
    ? `.line { font: 500 16px ${MONO}; fill: ${t.soft}; opacity: 0; animation: cycle ${n(lines.length * PER)}s linear infinite; }
    @keyframes cycle { 0% { opacity: 0 } ${n(slot * 0.08)}% { opacity: 1 } ${n(slot * 0.92)}% { opacity: 1 } ${n(slot)}% { opacity: 0 } 100% { opacity: 0 } }`
    : `.line { font: 500 16px ${MONO}; fill: ${t.soft}; }`;

  const hud = (s) => esc(fit(String(s).toUpperCase(), 11, 380, (x, px) => monoWidth(x, px, 2.2)));
  const bracket = (x, y, sx, sy) => `<path d="M${x} ${y + 18 * sy} V${y} H${x + 18 * sx}"/>`;
  const summary = [taglines[0], status, location].filter(Boolean).join('. ');

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
  <title id="t">${esc(name)}</title>
  <desc id="d">${esc(summary)}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${t.bg0}"/><stop offset=".55" stop-color="${t.bg1}"/><stop offset="1" stop-color="${t.bg2}"/>
    </linearGradient>
    <linearGradient id="ink" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${t.a1}"/><stop offset=".55" stop-color="${t.a2}"/><stop offset="1" stop-color="${t.a3}"/>
    </linearGradient>
    <linearGradient id="horizon" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${t.a1}" stop-opacity="0"/><stop offset=".3" stop-color="${t.a1}"/>
      <stop offset=".7" stop-color="${t.a2}"/><stop offset="1" stop-color="${t.a2}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="sun" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="${t.a2}" stop-opacity=".55"/><stop offset=".45" stop-color="${t.a1}" stop-opacity=".16"/>
      <stop offset="1" stop-color="${t.a1}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="scanFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${t.a1}" stop-opacity="0"/><stop offset=".8" stop-color="${t.a1}" stop-opacity=".055"/><stop offset="1" stop-color="${t.a1}" stop-opacity="0"/>
    </linearGradient>
    <mask id="floorMask"><rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#floorFade)"/></mask>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>
    <filter id="glow" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <style>
    .hud { font: 600 11px ${MONO}; letter-spacing: 2.2px; fill: ${t.muted}; }
    .name { font: 800 ${namePx}px ${SANS}; letter-spacing: -${n(namePx / 39)}px; }
    ${lineCss}
    .cur { animation: blink 1s steps(2, jump-none) infinite; }
    .star { fill: ${t.star}; animation: twinkle 4s ease-in-out infinite; }
    .row { animation: fly 1.6s linear infinite; }
    .scan { animation: scan 7s linear infinite; }
    .dot { animation: pulse 2s ease-in-out infinite; transform-origin: 38px 34px; }
    @keyframes blink { 0% { opacity: 1 } 100% { opacity: 0 } }
    @keyframes twinkle { 0%, 100% { opacity: .15 } 50% { opacity: .9 } }
    @keyframes fly { to { transform: translateY(var(--d)); } }
    @keyframes scan { from { transform: translateY(-90px) } to { transform: translateY(${H}px) } }
    @keyframes pulse { 0%, 100% { opacity: .35; transform: scale(1) } 50% { opacity: 0; transform: scale(2.6) } }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; } .first { opacity: 1; } }
  </style>

  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    ${stars}
    <ellipse cx="${VX}" cy="${HORIZON}" rx="420" ry="120" fill="url(#sun)"/>
    <g mask="url(#floorMask)" stroke="${t.a1}" stroke-opacity=".38" stroke-width="1" fill="none">
      ${rays.join('')}
      ${rows}
    </g>
    <rect x="0" y="${HORIZON - 0.75}" width="${W}" height="1.5" fill="url(#horizon)"/>
    <rect class="scan" x="0" y="0" width="${W}" height="90" fill="url(#scanFill)"/>
  </g>

  <g fill="none" stroke="${t.a1}" stroke-opacity=".55" stroke-width="1.5">
    ${bracket(14, 14, 1, 1)}${bracket(W - 14, 14, -1, 1)}${bracket(14, H - 14, 1, -1)}${bracket(W - 14, H - 14, -1, -1)}
  </g>

  ${status ? `<circle class="dot" cx="38" cy="34" r="4" fill="${t.ok}"/>
  <circle cx="38" cy="34" r="3.5" fill="${t.ok}"/>
  <text class="hud" x="50" y="38">${hud(status)}</text>` : ''}
  ${location ? `<text class="hud" x="${W - 34}" y="38" text-anchor="end">${hud(location)}</text>` : ''}

  <text class="name" x="${VX}" y="${nameY}" text-anchor="middle" fill="url(#ink)" filter="url(#glow)" opacity=".55">${esc(name)}</text>
  <text class="name" x="${VX}" y="${nameY}" text-anchor="middle" fill="url(#ink)">${esc(name)}</text>
  ${typed}

  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" fill="none" stroke="${t.line}" stroke-opacity=".18"/>
</svg>`;
}

/* --------------------------------------------------------------- divider */
export function divider(t) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 12" width="900" height="12" role="presentation">
  <defs>
    <linearGradient id="l" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${t.a1}" stop-opacity="0"/><stop offset=".2" stop-color="${t.a1}" stop-opacity=".55"/>
      <stop offset=".8" stop-color="${t.a2}" stop-opacity=".55"/><stop offset="1" stop-color="${t.a2}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${t.glint}" stop-opacity="0"/><stop offset=".5" stop-color="${t.glint}" stop-opacity=".95"/><stop offset="1" stop-color="${t.glint}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <style>.glint { animation: run 5s ease-in-out infinite; } @keyframes run { from { transform: translateX(-140px) } to { transform: translateX(900px) } } ${REDUCED}</style>
  <rect x="0" y="5.5" width="900" height="1" fill="url(#l)"/>
  <rect class="glint" x="0" y="5" width="140" height="2" rx="1" fill="url(#g)"/>
</svg>`;
}

/* ------------------------------------------------- featured project bento */
// Animated artwork for the lead tile, drawn in a Q x Q square at (X, Y).
const ART = {
  // A stylised QR code with a travelling scan beam.
  qr(Q, X, Y, t, rnd) {
    const N = 13, C = Q / N;
    const finder = (cx, cy) => `
    <rect x="${n(X + cx * C)}" y="${n(Y + cy * C)}" width="${n(C * 3)}" height="${n(C * 3)}" rx="5" fill="none" stroke="${t.a1}" stroke-width="${n(C * 0.7)}"/>
    <rect x="${n(X + (cx + 1) * C + 1.5)}" y="${n(Y + (cy + 1) * C + 1.5)}" width="${n(C - 3)}" height="${n(C - 3)}" rx="1.5" fill="${t.a1}"/>`;
    const inFinder = (c, r) => (c < 4 && r < 4) || (c > N - 5 && r < 4) || (c < 4 && r > N - 5);
    let cells = '';
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (inFinder(c, r) || rnd() < 0.52) continue;
      const fill = rnd() < 0.22 ? t.a2 : t.soft;
      cells += `<rect x="${n(X + c * C + 1.4)}" y="${n(Y + r * C + 1.4)}" width="${n(C - 2.8)}" height="${n(C - 2.8)}" rx="2" fill="${fill}" fill-opacity=".85"/>`;
    }
    return {
      defs: `<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${t.a1}" stop-opacity="0"/><stop offset="1" stop-color="${t.a1}" stop-opacity=".45"/>
    </linearGradient>
    <clipPath id="art"><rect x="${n(X - 6)}" y="${n(Y - 6)}" width="${Q + 12}" height="${Q + 12}" rx="10"/></clipPath>`,
      css: `.beam { animation: sweep 3.2s ease-in-out infinite alternate; }
    @keyframes sweep { from { transform: translateY(-34px) } to { transform: translateY(${Q - 4}px) } }`,
      body: `<g clip-path="url(#art)">
    ${cells}
    ${finder(0, 0)}${finder(N - 3, 0)}${finder(0, N - 3)}
    <g class="beam"><rect x="${n(X - 6)}" y="${Y}" width="${Q + 12}" height="34" fill="url(#beam)"/><rect x="${n(X - 6)}" y="${Y + 33}" width="${Q + 12}" height="1.5" fill="${t.a1}"/></g>
  </g>`,
    };
  },

  // Three rings with a satellite on each, turning at different speeds.
  orbit(Q, X, Y, t) {
    const cx = n(X + Q / 2), cy = n(Y + Q / 2);
    // Satellites start at different angles so the still (reduced-motion)
    // frame looks composed too.
    const rings = [[26, 7, t.a1, 20], [48, 11, t.a2, 150], [70, 17, t.a3, 255]];
    const body = rings.map(([r, dur, col, deg], i) => {
      const a = (deg * Math.PI) / 180;
      return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${t.line}" stroke-opacity=".3"${i === 1 ? ' stroke-dasharray="2 6"' : ''}/>
    <g class="orb" style="animation-duration:${dur}s${i === 1 ? ';animation-direction:reverse' : ''}"><circle cx="${n(cx + r * Math.cos(a))}" cy="${n(cy + r * Math.sin(a))}" r="${n(5.5 - i * 0.75)}" fill="${col}"/></g>`;
    }).join('');
    return {
      defs: '',
      css: `.orb { transform-origin: ${cx}px ${cy}px; animation: spin 9s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg) } }`,
      body: `${body}
    <circle cx="${cx}" cy="${cy}" r="13" fill="${t.a1}" fill-opacity=".16"/>
    <circle cx="${cx}" cy="${cy}" r="6" fill="${t.a1}"/>`,
    };
  },

  // A bar chart whose bars breathe out of step with each other.
  bars(Q, X, Y, t, rnd) {
    const N = 7, GAP = 8, BW = (Q - GAP * (N - 1)) / N;
    let body = '';
    for (let i = 0; i < N; i++) {
      const h = Q * (0.38 + rnd() * 0.6);
      body += `<rect class="bar" x="${n(X + i * (BW + GAP))}" y="${n(Y + Q - h)}" width="${n(BW)}" height="${n(h)}" rx="4" fill="${i % 3 === 1 ? t.a2 : t.a1}" fill-opacity=".85" style="animation-delay:-${n(rnd() * 2.4)}s"/>`;
    }
    return {
      defs: '',
      css: `.bar { transform-box: fill-box; transform-origin: 50% 100%; animation: bob 2.4s ease-in-out infinite alternate; }
    @keyframes bob { from { transform: scaleY(.45) } to { transform: scaleY(1) } }`,
      body: `${body}
    <rect x="${n(X)}" y="${n(Y + Q + 5)}" width="${Q}" height="1.5" rx=".75" fill="${t.line}" fill-opacity=".5"/>`,
    };
  },
};
export const ARTS = Object.keys(ART);

export function featured(f, t, rnd) {
  const W = 900, H = 336, GAP = 16, LW = 292;
  const tile = (x, y, w, h) => `
  <rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="16" fill="${t.panel}"/>
  <rect x="${n(x + 0.5)}" y="${n(y + 0.5)}" width="${n(w - 1)}" height="${n(h - 1)}" rx="15.5" fill="none" stroke="${t.line}" stroke-opacity=".2"/>
  <rect x="${n(x + 22)}" y="${n(y)}" width="${n(w - 44)}" height="1" fill="url(#top)"/>`;

  const Q = 148;
  const art = ART[f.art](Q, (LW - Q) / 2, 40, t, rnd);
  const leadLines = wrap(f.lead.text, 14, LW - 48, 2);

  // Right side: one row for up to two features, two rows for three or four.
  // Tiles in a row share its width, so three features leave the last one wide.
  const RX = LW + GAP, RW = W - RX;
  const rowsOf = f.features.length <= 2 ? [f.features] : [f.features.slice(0, 2), f.features.slice(2)];
  const RH = (H - GAP * (rowsOf.length - 1)) / rowsOf.length;
  let idx = 2, small = '';
  rowsOf.forEach((row, r) => {
    const w = (RW - GAP * (row.length - 1)) / row.length;
    row.forEach((ft, c) => {
      const x = RX + c * (w + GAP), y = r * (RH + GAP);
      const lines = wrap(ft.text, 14, w - 48, 2);
      // Short tiles read top-down; tall ones anchor their text to the bottom.
      const ty = RH > 200 ? y + RH - 68 : y + 92;
      small += `${tile(x, y, w, RH)}
  <text class="idx" x="${n(x + 24)}" y="${n(y + 40)}">${String(idx++).padStart(2, '0')}</text>
  <g transform="translate(${n(x + w - 56)} ${n(y + 22)})" fill="none" stroke="${t.a1}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[ft.icon]}</g>
  <text class="ttl" x="${n(x + 24)}" y="${n(ty)}">${esc(fit(ft.title, 20, (w - 48) / BOLD))}</text>
  ${lines.map((l, i) => `<text class="dsc" x="${n(x + 24)}" y="${n(ty + 24 + i * 19)}">${esc(l)}</text>`).join('\n  ')}`;
    });
  });

  const desc = [f.lead, ...f.features].map((x) => `${x.title}: ${x.text}`).join('. ');
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
  <title id="t">${esc(f.name)}</title>
  <desc id="d">${esc(desc)}</desc>
  <defs>
    <linearGradient id="top" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${t.a1}" stop-opacity="0"/><stop offset=".5" stop-color="${t.a1}" stop-opacity=".8"/><stop offset="1" stop-color="${t.a2}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="halo" cx=".5" cy=".35" r=".6">
      <stop offset="0" stop-color="${t.a2}" stop-opacity=".22"/><stop offset="1" stop-color="${t.a2}" stop-opacity="0"/>
    </radialGradient>
    ${art.defs}
  </defs>
  <style>
    .idx { font: 600 12px ${MONO}; letter-spacing: 2px; fill: ${t.a1}; }
    .ttl { font: 600 20px ${SANS}; fill: ${t.ink}; }
    .dsc { font: 400 14px ${SANS}; fill: ${t.muted}; }
    ${art.css}
    ${REDUCED}
  </style>
  ${tile(0, 0, LW, H)}
  <rect x="0" y="0" width="${LW}" height="${H}" rx="16" fill="url(#halo)"/>
  ${art.body}
  <text class="idx" x="24" y="${H - 96}">01</text>
  <text class="ttl" x="24" y="${H - 68}">${esc(fit(f.lead.title, 20, (LW - 48) / BOLD))}</text>
  ${leadLines.map((l, i) => `<text class="dsc" x="24" y="${H - 44 + i * 19}">${esc(l)}</text>`).join('\n  ')}
  ${small}
</svg>`;
}

/* ---------------------------------------------------------- project card */
export function card(p, t, accent, other) {
  const W = 442, H = 196, INNER = W - 48;
  const namePx = Math.max(15, Math.min(21, Math.floor(INNER / (sansWidth(p.name, 1) * BOLD))));
  const lines = wrap(p.description, 14, INNER, 2);
  const track = (s, px) => monoWidth(s, px, 1.2);

  // Drop trailing stack items until the line fits.
  const SEP = '  ·  ';
  const stack = p.stack.map((s) => s.toUpperCase());
  while (stack.length > 1 && track(stack.join(SEP), 11) > INNER) stack.pop();
  const stackLine = fit(stack.join(SEP), 11, INNER, track);
  const tag = fit(p.tag.toUpperCase(), 11, INNER - (p.live ? 90 : 0), (s, px) => monoWidth(s, px, 2));

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
  <title id="t">${esc(p.name)}</title>
  <desc id="d">${esc([p.description, p.stack.length ? `Built with ${p.stack.join(', ')}.` : ''].filter(Boolean).join(' '))}</desc>
  <defs>
    <linearGradient id="top" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${accent}" stop-opacity="0"/><stop offset=".5" stop-color="${accent}" stop-opacity=".8"/><stop offset="1" stop-color="${other}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="halo" cx="1" cy="0" r=".9">
      <stop offset="0" stop-color="${accent}" stop-opacity=".14"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <style>
    .tag { font: 600 11px ${MONO}; letter-spacing: 2px; fill: ${accent}; }
    .live { font: 600 11px ${MONO}; letter-spacing: 2px; fill: ${t.muted}; }
    .ttl { font: 600 ${namePx}px ${SANS}; fill: ${t.ink}; }
    .dsc { font: 400 14px ${SANS}; fill: ${t.muted}; }
    .stk { font: 600 11px ${MONO}; letter-spacing: 1.2px; fill: ${t.soft}; }
    .dot { animation: pulse 2s ease-in-out infinite; transform-origin: ${W - 74}px 32px; }
    @keyframes pulse { 0%, 100% { opacity: .35; transform: scale(1) } 50% { opacity: 0; transform: scale(2.6) } }
    ${REDUCED}
  </style>
  <rect width="${W}" height="${H}" rx="16" fill="${t.panel}"/>
  <rect width="${W}" height="${H}" rx="16" fill="url(#halo)"/>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="15.5" fill="none" stroke="${t.line}" stroke-opacity=".2"/>
  <rect x="22" y="0" width="${W - 44}" height="1" fill="url(#top)"/>

  ${tag ? `<text class="tag" x="24" y="36">${esc(tag)}</text>` : ''}
  ${p.live ? `<circle class="dot" cx="${W - 74}" cy="32" r="3.5" fill="${t.ok}"/>
  <circle cx="${W - 74}" cy="32" r="3" fill="${t.ok}"/>
  <text class="live" x="${W - 24}" y="36" text-anchor="end">LIVE</text>` : ''}
  <text class="ttl" x="24" y="78">${esc(fit(p.name, namePx, INNER / BOLD))}</text>
  ${lines.map((l, i) => `<text class="dsc" x="24" y="${106 + i * 20}">${esc(l)}</text>`).join('\n  ')}
  ${stackLine ? `<rect x="24" y="${H - 46}" width="${INNER}" height="1" fill="${t.line}" fill-opacity=".16"/>
  <text class="stk" x="24" y="${H - 22}">${esc(stackLine)}</text>` : ''}
</svg>`;
}

/* ------------------------------------------------------------ chip rows */
export function stack(items, t) {
  const W = 560, GAP = 10, ROW = 50;
  const chips = items.map((s) => {
    const label = s.toUpperCase();
    return { label, w: Math.min(W, Math.round(monoWidth(label, 13, 1.6) + 44)) };
  });
  const widthOf = (row) => row.reduce((a, c) => a + c.w, 0) + (row.length - 1) * GAP;

  // Greedy fill tells us how many rows are needed; then spread the chips
  // evenly across that many rows when it fits, so the last row is not a stub.
  const greedy = [[]];
  for (const c of chips) {
    const row = greedy.at(-1);
    if (row.length && widthOf([...row, c]) > W) greedy.push([c]);
    else row.push(c);
  }
  const per = Math.ceil(chips.length / greedy.length);
  const even = [];
  for (let i = 0; i < chips.length; i += per) even.push(chips.slice(i, i + per));
  const rows = even.every((r) => widthOf(r) <= W) ? even : greedy;

  const H = rows.length * ROW - 12;
  let body = '';
  rows.forEach((row, r) => {
    let x = (W - widthOf(row)) / 2;
    const y = r * ROW;
    row.forEach((c, k) => {
      const col = (k + r) % 2 ? t.a2 : t.a1;
      body += `
  <rect x="${n(x)}" y="${y}" width="${c.w}" height="36" rx="18" fill="${t.panel}"/>
  <rect x="${n(x + 0.5)}" y="${y + 0.5}" width="${c.w - 1}" height="35" rx="17.5" fill="none" stroke="${col}" stroke-opacity=".38"/>
  <rect x="${n(x + 14)}" y="${y + 15}" width="6" height="6" rx="1.5" transform="rotate(45 ${n(x + 17)} ${y + 18})" fill="${col}"/>
  <text class="chip" x="${n(x + (c.w + 14) / 2)}" y="${y + 22.5}" text-anchor="middle">${esc(c.label)}</text>`;
      x += c.w + GAP;
    });
  });

  return {
    width: W,
    height: H,
    svg: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(items.join(', '))}">
  <style>.chip { font: 600 13px ${MONO}; letter-spacing: 1.6px; fill: ${t.ink}; }</style>${body}
</svg>`,
  };
}

/* ----------------------------------------------------------- link pills */
export function pill(label, value, accent, t) {
  const key = label.toUpperCase();
  const lw = Math.round(monoWidth(key, 11, 1.8) + 30);
  const vw = Math.round(monoWidth(value, 13.5) + 52);
  const W = lw + vw, H = 40;
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(label)}: ${esc(value)}">
  <defs><clipPath id="c"><rect width="${W}" height="${H}" rx="20"/></clipPath></defs>
  <style>
    .k { font: 700 11px ${MONO}; letter-spacing: 1.8px; fill: ${t.onAccent}; }
    .v { font: 500 13.5px ${MONO}; fill: ${t.ink}; }
  </style>
  <g clip-path="url(#c)">
    <rect width="${W}" height="${H}" fill="${t.panel}"/>
    <rect width="${lw}" height="${H}" fill="${accent}"/>
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="19.5" fill="none" stroke="${accent}" stroke-opacity=".5"/>
  <text class="k" x="${lw / 2 + 2}" y="24" text-anchor="middle">${esc(key)}</text>
  <text class="v" x="${lw + 14}" y="24.5">${esc(value)}</text>
  <path d="M${W - 27} 25 l9 -9 m-7 0 h7 v7" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

/* ---------------------------------------------------------------- footer */
export function footer(text, t) {
  const W = 900, MID = W / 2;
  const track = (s, px) => monoWidth(s, px, 3);
  const label = fit(text.toUpperCase(), 11, 620, track);
  const half = track(label, 11) / 2;
  const left = n(Math.max(40, MID - half - 34)), right = n(Math.min(W - 40, MID + half + 34));
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 64" width="${W}" height="64" role="img" aria-label="${esc(text)}">
  <defs>
    <linearGradient id="l" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${t.a1}" stop-opacity="0"/><stop offset="1" stop-color="${t.a1}" stop-opacity=".6"/>
    </linearGradient>
    <linearGradient id="r" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${t.a2}" stop-opacity=".6"/><stop offset="1" stop-color="${t.a2}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <style>
    .f { font: 600 11px ${MONO}; letter-spacing: 3px; fill: ${t.muted}; }
    .b { animation: beat 2.4s ease-in-out infinite; } @keyframes beat { 0%, 100% { opacity: .3 } 50% { opacity: 1 } }
    ${REDUCED}
  </style>
  <rect x="0" y="31.5" width="${n(left - 12)}" height="1" fill="url(#l)"/>
  <rect x="${n(right + 12)}" y="31.5" width="${n(W - right - 12)}" height="1" fill="url(#r)"/>
  <rect class="b" x="${n(left - 3.5)}" y="28" width="7" height="7" rx="1.5" transform="rotate(45 ${left} 31.5)" fill="${t.a1}"/>
  <rect class="b" x="${n(right - 3.5)}" y="28" width="7" height="7" rx="1.5" transform="rotate(45 ${right} 31.5)" fill="${t.a2}" style="animation-delay:-1.2s"/>
  <text class="f" x="${MID}" y="35.5" text-anchor="middle">${esc(label)}</text>
</svg>`;
}
