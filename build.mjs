// Generates the profile README assets. Run: node build.mjs
// Everything is self-hosted SVG (CSS animation only — GitHub strips scripts),
// so the profile does not depend on third-party badge/widget services.
import { writeFileSync, mkdirSync } from 'node:fs';

mkdirSync(new URL('./assets/', import.meta.url), { recursive: true });
const out = (name, svg) => writeFileSync(new URL(`./assets/${name}`, import.meta.url), svg.trim() + '\n');

const MONO = `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace`;
const SANS = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif`;
const CYAN = '#67e8f9';
const VIOLET = '#a78bfa';
const PINK = '#f0abfc';
const INK = '#e6edf3';
const MUTED = '#8b98a9';
const PANEL = '#0b0f17';

// Small deterministic PRNG so rebuilds are byte-stable.
let seed = 42;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);

const REDUCED = `@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`;

/* ------------------------------------------------------------------ hero */
{
  const W = 900, H = 340, HORIZON = 236, VX = W / 2;

  // Floor: rays from the vanishing point, plus horizontals that each slide to
  // the next one's position — a seamless "flying forward" loop.
  const rays = [];
  for (let x = -1350; x <= W + 1350; x += 90) rays.push(`<line x1="${VX}" y1="${HORIZON}" x2="${x}" y2="${H}"/>`);
  const ys = [];
  for (let i = 0; i < 9; i++) ys.push(HORIZON + 4 * Math.pow(1.5, i));
  const rows = ys.slice(0, -1).map((y, i) =>
    `<line class="row" style="--d:${(ys[i + 1] - y).toFixed(2)}px" x1="0" y1="${y.toFixed(2)}" x2="${W}" y2="${y.toFixed(2)}"/>`).join('');

  // Keep stars clear of the HUD row and the name block so they never sit on a glyph.
  const stars = Array.from({ length: 70 }, () => {
    const x = (rnd() * W).toFixed(1), y = (rnd() * (HORIZON - 66) + 54).toFixed(1);
    if (x > 250 && x < 650 && y > 84 && y < 206) return '';
    const r = (rnd() * 0.9 + 0.4).toFixed(2), delay = (rnd() * 5).toFixed(2), dur = (rnd() * 3 + 2.5).toFixed(2);
    return `<circle class="star" cx="${x}" cy="${y}" r="${r}" style="animation-delay:-${delay}s;animation-duration:${dur}s"/>`;
  }).join('');

  const lines = [
    'Full Stack Developer · SaaS Founder · Product Builder',
    'Founder of Velora Systems',
    'Building Dines — a restaurant operating system',
    'Next.js · Node.js · MongoDB',
  ];
  const typed = lines.map((t, i) =>
    `<text class="line l${i}" x="${VX}" y="196" text-anchor="middle"><tspan fill="${CYAN}">&gt; </tspan>${t}<tspan class="cur" fill="${CYAN}"> ▍</tspan></text>`).join('\n  ');

  const bracket = (x, y, sx, sy) =>
    `<path d="M${x} ${y + 18 * sy} V${y} H${x + 18 * sx}" />`;

  out('hero.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
  <title id="t">Rajith Raja</title>
  <desc id="d">Full Stack Developer, SaaS Founder, Product Builder. Founder of Velora Systems, building Dines.</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#05070d"/><stop offset=".55" stop-color="#090d1a"/><stop offset="1" stop-color="#0d0a1c"/>
    </linearGradient>
    <linearGradient id="ink" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${CYAN}"/><stop offset=".55" stop-color="${VIOLET}"/><stop offset="1" stop-color="${PINK}"/>
    </linearGradient>
    <linearGradient id="horizon" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${CYAN}" stop-opacity="0"/><stop offset=".3" stop-color="${CYAN}"/>
      <stop offset=".7" stop-color="${VIOLET}"/><stop offset="1" stop-color="${VIOLET}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="sun" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="${VIOLET}" stop-opacity=".55"/><stop offset=".45" stop-color="${CYAN}" stop-opacity=".16"/>
      <stop offset="1" stop-color="${CYAN}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="scanFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${CYAN}" stop-opacity="0"/><stop offset=".8" stop-color="${CYAN}" stop-opacity=".055"/><stop offset="1" stop-color="${CYAN}" stop-opacity="0"/>
    </linearGradient>
    <mask id="floorMask"><rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#floorFade)"/></mask>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>
    <filter id="glow" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <style>
    .hud { font: 600 11px ${MONO}; letter-spacing: 2.2px; fill: ${MUTED}; }
    .name { font: 800 78px ${SANS}; letter-spacing: -2px; }
    .line { font: 500 16px ${MONO}; fill: #c9d4e3; opacity: 0; animation: cycle 14s linear infinite; }
    .l1 { animation-delay: 3.5s; } .l2 { animation-delay: 7s; } .l3 { animation-delay: 10.5s; }
    .cur { animation: blink 1s steps(2, jump-none) infinite; }
    .star { fill: #cfe9ff; animation: twinkle 4s ease-in-out infinite; }
    .row { animation: fly 1.6s linear infinite; }
    .scan { animation: scan 7s linear infinite; }
    .dot { animation: pulse 2s ease-in-out infinite; transform-origin: 38px 34px; }
    @keyframes cycle { 0% { opacity: 0 } 2% { opacity: 1 } 23% { opacity: 1 } 25% { opacity: 0 } 100% { opacity: 0 } }
    @keyframes blink { 0% { opacity: 1 } 100% { opacity: 0 } }
    @keyframes twinkle { 0%, 100% { opacity: .15 } 50% { opacity: .9 } }
    @keyframes fly { to { transform: translateY(var(--d)); } }
    @keyframes scan { from { transform: translateY(-90px) } to { transform: translateY(${H}px) } }
    @keyframes pulse { 0%, 100% { opacity: .35; transform: scale(1) } 50% { opacity: 0; transform: scale(2.6) } }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; } .l0 { opacity: 1; } }
  </style>

  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    ${stars}
    <ellipse cx="${VX}" cy="${HORIZON}" rx="420" ry="120" fill="url(#sun)"/>
    <g mask="url(#floorMask)" stroke="${CYAN}" stroke-opacity=".38" stroke-width="1" fill="none">
      ${rays.join('')}
      ${rows}
    </g>
    <rect x="0" y="${HORIZON - 0.75}" width="${W}" height="1.5" fill="url(#horizon)"/>
    <rect class="scan" x="0" y="0" width="${W}" height="90" fill="url(#scanFill)"/>
  </g>

  <g fill="none" stroke="${CYAN}" stroke-opacity=".55" stroke-width="1.5">
    ${bracket(14, 14, 1, 1)}${bracket(W - 14, 14, -1, 1)}${bracket(14, H - 14, 1, -1)}${bracket(W - 14, H - 14, -1, -1)}
  </g>

  <circle class="dot" cx="38" cy="34" r="4" fill="#34d399"/>
  <circle cx="38" cy="34" r="3.5" fill="#34d399"/>
  <text class="hud" x="50" y="38">BUILDING DINES</text>
  <text class="hud" x="${W - 34}" y="38" text-anchor="end">KAUNAS, LT · 54.90°N 23.90°E</text>

  <text class="name" x="${VX}" y="146" text-anchor="middle" fill="url(#ink)" filter="url(#glow)" opacity=".55">Rajith Raja</text>
  <text class="name" x="${VX}" y="146" text-anchor="middle" fill="url(#ink)">Rajith Raja</text>
  ${typed}

  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" fill="none" stroke="#fff" stroke-opacity=".08"/>
</svg>`);
}

/* --------------------------------------------------------------- divider */
out('divider.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 12" width="900" height="12" role="presentation">
  <defs>
    <linearGradient id="l" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${CYAN}" stop-opacity="0"/><stop offset=".2" stop-color="${CYAN}" stop-opacity=".55"/>
      <stop offset=".8" stop-color="${VIOLET}" stop-opacity=".55"/><stop offset="1" stop-color="${VIOLET}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <style>.glint { animation: run 5s ease-in-out infinite; } @keyframes run { from { transform: translateX(-140px) } to { transform: translateX(900px) } } ${REDUCED}</style>
  <rect x="0" y="5.5" width="900" height="1" fill="url(#l)"/>
  <rect class="glint" x="0" y="5" width="140" height="2" rx="1" fill="url(#g)"/>
</svg>`);

/* ---------------------------------------------------------- dines bento */
{
  const W = 900, H = 336, GAP = 16;
  const tile = (x, y, w, h) => `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${PANEL}"/>
    <rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="15.5" fill="none" stroke="#94a3b8" stroke-opacity=".2"/>
    <rect x="${x + 22}" y="${y}" width="${w - 44}" height="1" fill="url(#top)"/>`;

  // Left hero tile: a stylised QR with a travelling scan beam.
  const LW = 292, Q = 148, QX = (LW - Q) / 2, QY = 40, N = 13, C = Q / N;
  const finder = (cx, cy) => `
    <rect x="${QX + cx * C}" y="${QY + cy * C}" width="${C * 3}" height="${C * 3}" rx="5" fill="none" stroke="${CYAN}" stroke-width="${(C * 0.7).toFixed(2)}"/>
    <rect x="${QX + (cx + 1) * C + 1.5}" y="${QY + (cy + 1) * C + 1.5}" width="${C - 3}" height="${C - 3}" rx="1.5" fill="${CYAN}"/>`;
  const inFinder = (c, r) => (c < 4 && r < 4) || (c > N - 5 && r < 4) || (c < 4 && r > N - 5);
  let cells = '';
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (inFinder(c, r) || rnd() < 0.52) continue;
    const fill = rnd() < 0.22 ? VIOLET : '#cbd5e1';
    cells += `<rect x="${(QX + c * C + 1.4).toFixed(2)}" y="${(QY + r * C + 1.4).toFixed(2)}" width="${(C - 2.8).toFixed(2)}" height="${(C - 2.8).toFixed(2)}" rx="2" fill="${fill}" fill-opacity=".85"/>`;
  }

  const RX = LW + GAP, RW = (W - RX - GAP) / 2, RH = (H - GAP) / 2;
  const icons = {
    kitchen: `<rect x="0" y="2" width="30" height="20" rx="3"/><path d="M6 9h10M6 14h16M10 28h10M15 22v6"/>`,
    waiter: `<path d="M5 0h20v30l-5-3-5 3-5-3-5 3z"/><path d="M10 9h10M10 15h10M10 21h6"/>`,
    floor: `<rect x="0" y="0" width="12" height="12" rx="3"/><rect x="18" y="0" width="12" height="12" rx="6"/><rect x="0" y="18" width="12" height="12" rx="6"/><rect x="18" y="18" width="12" height="12" rx="3"/>`,
    book: `<rect x="0" y="4" width="30" height="26" rx="4"/><path d="M0 12h30M8 0v8M22 0v8M8 20l4 4 9-8"/>`,
  };
  const small = (col, row, idx, icon, title, l1, l2) => {
    const x = RX + col * (RW + GAP), y = row * (RH + GAP);
    return `${tile(x, y, RW, RH)}
    <text class="idx" x="${x + 24}" y="${y + 40}">${idx}</text>
    <g transform="translate(${x + RW - 56} ${y + 22})" fill="none" stroke="${CYAN}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[icon]}</g>
    <text class="ttl" x="${x + 24}" y="${y + 92}">${title}</text>
    <text class="dsc" x="${x + 24}" y="${y + 116}">${l1}</text>
    <text class="dsc" x="${x + 24}" y="${y + 135}">${l2}</text>`;
  };

  out('dines.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
  <title id="t">Dines — restaurant operating system</title>
  <desc id="d">QR ordering, kitchen display, waiter dashboard, floor map and reservations.</desc>
  <defs>
    <linearGradient id="top" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${CYAN}" stop-opacity="0"/><stop offset=".5" stop-color="${CYAN}" stop-opacity=".8"/><stop offset="1" stop-color="${VIOLET}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${CYAN}" stop-opacity="0"/><stop offset="1" stop-color="${CYAN}" stop-opacity=".45"/>
    </linearGradient>
    <radialGradient id="halo" cx=".5" cy=".35" r=".6">
      <stop offset="0" stop-color="${VIOLET}" stop-opacity=".22"/><stop offset="1" stop-color="${VIOLET}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="qr"><rect x="${QX - 6}" y="${QY - 6}" width="${Q + 12}" height="${Q + 12}" rx="10"/></clipPath>
  </defs>
  <style>
    .idx { font: 600 12px ${MONO}; letter-spacing: 2px; fill: ${CYAN}; }
    .ttl { font: 600 20px ${SANS}; fill: ${INK}; }
    .dsc { font: 400 14px ${SANS}; fill: ${MUTED}; }
    .beam { animation: sweep 3.2s ease-in-out infinite alternate; }
    @keyframes sweep { from { transform: translateY(-34px) } to { transform: translateY(${Q - 4}px) } }
    ${REDUCED}
  </style>

  ${tile(0, 0, LW, H)}
  <rect x="0" y="0" width="${LW}" height="${H}" rx="16" fill="url(#halo)"/>
  <g clip-path="url(#qr)">
    ${cells}
    ${finder(0, 0)}${finder(N - 3, 0)}${finder(0, N - 3)}
    <g class="beam"><rect x="${QX - 6}" y="${QY}" width="${Q + 12}" height="34" fill="url(#beam)"/><rect x="${QX - 6}" y="${QY + 33}" width="${Q + 12}" height="1.5" fill="${CYAN}"/></g>
  </g>
  <text class="idx" x="24" y="${H - 96}">01</text>
  <text class="ttl" x="24" y="${H - 68}">QR Ordering</text>
  <text class="dsc" x="24" y="${H - 44}">Customers scan, browse &amp; order</text>
  <text class="dsc" x="24" y="${H - 25}">straight from their table</text>

  ${small(0, 0, '02', 'kitchen', 'Kitchen Display', 'Live order queue for', 'kitchen staff')}
  ${small(1, 0, '03', 'waiter', 'Waiter Dashboard', 'Take orders &amp; manage', 'table service')}
  ${small(0, 1, '04', 'floor', 'Floor Map', 'Visual table management', '&amp; status tracking')}
  ${small(1, 1, '05', 'book', 'Reservations', 'Full booking &amp; guest', 'management system')}
</svg>`);
}

/* -------------------------------------------------------- project cards */
// One SVG per project so each card can be its own link in the README.
// Text cannot wrap in SVG: keep description lines under ~52 characters and
// the stack line under ~46.
function projectCard(file, { tag, name, lines, stack, accent = CYAN, live = true }) {
  const W = 442, H = 196;
  out(file, `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
  <title id="t">${name}</title>
  <desc id="d">${lines.join(' ')} Built with ${stack.join(', ')}.</desc>
  <defs>
    <linearGradient id="top" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${accent}" stop-opacity="0"/><stop offset=".5" stop-color="${accent}" stop-opacity=".8"/><stop offset="1" stop-color="${VIOLET}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="halo" cx="1" cy="0" r=".9">
      <stop offset="0" stop-color="${accent}" stop-opacity=".14"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <style>
    .tag { font: 600 11px ${MONO}; letter-spacing: 2px; fill: ${accent}; }
    .live { font: 600 11px ${MONO}; letter-spacing: 2px; fill: ${MUTED}; }
    .ttl { font: 600 21px ${SANS}; fill: ${INK}; }
    .dsc { font: 400 14px ${SANS}; fill: ${MUTED}; }
    .stk { font: 600 11px ${MONO}; letter-spacing: 1.2px; fill: #c9d4e3; }
    .dot { animation: pulse 2s ease-in-out infinite; transform-origin: ${W - 74}px 32px; }
    @keyframes pulse { 0%, 100% { opacity: .35; transform: scale(1) } 50% { opacity: 0; transform: scale(2.6) } }
    ${REDUCED}
  </style>
  <rect width="${W}" height="${H}" rx="16" fill="${PANEL}"/>
  <rect width="${W}" height="${H}" rx="16" fill="url(#halo)"/>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="15.5" fill="none" stroke="#94a3b8" stroke-opacity=".2"/>
  <rect x="22" y="0" width="${W - 44}" height="1" fill="url(#top)"/>

  <text class="tag" x="24" y="36">${tag}</text>
  ${live ? `<circle class="dot" cx="${W - 74}" cy="32" r="3.5" fill="#34d399"/>
  <circle cx="${W - 74}" cy="32" r="3" fill="#34d399"/>
  <text class="live" x="${W - 24}" y="36" text-anchor="end">LIVE</text>` : ''}
  <text class="ttl" x="24" y="78">${name}</text>
  ${lines.map((l, i) => `<text class="dsc" x="24" y="${106 + i * 20}">${l}</text>`).join('\n  ')}
  <rect x="24" y="${H - 46}" width="${W - 48}" height="1" fill="#94a3b8" fill-opacity=".16"/>
  <text class="stk" x="24" y="${H - 22}">${stack.map(s => s.toUpperCase()).join('  ·  ')}</text>
</svg>`);
}
projectCard('project-uptimekit.svg', {
  tag: 'OPEN SOURCE · MIT',
  name: 'UptimeKit',
  lines: ['Website &amp; API uptime monitoring: incident detection,', 'latency analytics, background workers, email alerts.'],
  stack: ['Next.js', 'Postgres', 'BullMQ', 'Docker'],
});
projectCard('project-eneba.svg', {
  tag: 'FULL-STACK BUILD',
  name: 'Game-key Marketplace',
  lines: ['Store with filters, typo-tolerant search, multi-seller', 'offers and a checkout that delivers a digital key.'],
  stack: ['React', 'TypeScript', 'Laravel', 'Postgres'],
  accent: VIOLET,
});
projectCard('project-student-tools.svg', {
  tag: 'STATIC WEB APP',
  name: 'Student Tools',
  lines: ['Attendance, GPA/CGPA and grade calculators. No', 'backend: every formula is unit-tested, runs in-browser.'],
  stack: ['Next.js', 'React 19', 'Vitest', 'Playwright'],
  accent: VIOLET,
});
projectCard('project-komorebi.svg', {
  tag: 'CREATIVE FRONT END',
  name: 'Komorebi 木漏れ日商店',
  lines: ['Scroll-driven storefront: fly down from the rooftops', 'into a tiny Japanese corner shop and pick snacks.'],
  stack: ['HTML', 'CSS', 'Canvas', 'No libraries'],
});

/* ------------------------------------------------------------ chip rows */
const CHAR = 9.4; // 13px mono + 1.6px tracking, close enough across the fallback fonts (text is centred in its chip)
function chipRow(items, y, W, accentAt = 0) {
  const widths = items.map(t => Math.round(t.length * CHAR + 44));
  const total = widths.reduce((a, b) => a + b, 0) + (items.length - 1) * 10;
  let x = (W - total) / 2, s = '';
  items.forEach((t, i) => {
    const w = widths[i], col = (i + accentAt) % 2 ? VIOLET : CYAN;
    s += `<rect x="${x}" y="${y}" width="${w}" height="36" rx="18" fill="${PANEL}"/>
    <rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="35" rx="17.5" fill="none" stroke="${col}" stroke-opacity=".38"/>
    <rect x="${x + 14}" y="${y + 15}" width="6" height="6" rx="1.5" transform="rotate(45 ${x + 17} ${y + 18})" fill="${col}"/>
    <text class="chip" x="${x + (w + 14) / 2}" y="${y + 22.5}" text-anchor="middle">${t.toUpperCase()}</text>`;
    x += w + 10;
  });
  return s;
}
out('stack.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 138" width="560" height="138" role="img" aria-label="Next.js, TypeScript, React, Node.js, MongoDB, Tailwind CSS, Vercel, JavaScript, PostgreSQL, Prisma, Redis, Docker">
  <style>.chip { font: 600 13px ${MONO}; letter-spacing: 1.6px; fill: ${INK}; }</style>
  ${chipRow(['Next.js', 'TypeScript', 'React', 'Node.js'], 0, 560)}
  ${chipRow(['MongoDB', 'Tailwind CSS', 'Vercel', 'JavaScript'], 50, 560, 1)}
  ${chipRow(['PostgreSQL', 'Prisma', 'Redis', 'Docker'], 100, 560)}
</svg>`);

/* ----------------------------------------------------------- link pills */
function pill(file, label, value, accent) {
  const lw = Math.round(label.length * 8.4 + 30), vw = Math.round(value.length * 8.2 + 52), W = lw + vw, H = 40;
  out(file, `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${label}: ${value}">
  <defs><clipPath id="c"><rect width="${W}" height="${H}" rx="20"/></clipPath></defs>
  <style>
    .k { font: 700 11px ${MONO}; letter-spacing: 1.8px; fill: #05070d; }
    .v { font: 500 13.5px ${MONO}; fill: ${INK}; }
  </style>
  <g clip-path="url(#c)">
    <rect width="${W}" height="${H}" fill="${PANEL}"/>
    <rect width="${lw}" height="${H}" fill="${accent}"/>
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="19.5" fill="none" stroke="${accent}" stroke-opacity=".5"/>
  <text class="k" x="${lw / 2 + 2}" y="24" text-anchor="middle">${label}</text>
  <text class="v" x="${lw + 14}" y="24.5">${value}</text>
  <path d="M${W - 27} 25 l9 -9 m-7 0 h7 v7" fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`);
}
pill('link-portfolio.svg', 'PORTFOLIO', 'velorasystems.co', CYAN);
pill('link-linkedin.svg', 'LINKEDIN', 'in/rajith-raja', VIOLET);
pill('link-email.svg', 'EMAIL', 'hello@velorasystems.co', PINK);

/* ---------------------------------------------------------------- footer */
out('footer.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 64" width="900" height="64" role="img" aria-label="Velora Systems — Kaunas, Lithuania">
  <defs>
    <linearGradient id="l" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${CYAN}" stop-opacity="0"/><stop offset="1" stop-color="${CYAN}" stop-opacity=".6"/>
    </linearGradient>
    <linearGradient id="r" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${VIOLET}" stop-opacity=".6"/><stop offset="1" stop-color="${VIOLET}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <style>
    .f { font: 600 11px ${MONO}; letter-spacing: 3px; fill: ${MUTED}; }
    .b { animation: beat 2.4s ease-in-out infinite; } @keyframes beat { 0%, 100% { opacity: .3 } 50% { opacity: 1 } }
    ${REDUCED}
  </style>
  <rect x="0" y="31.5" width="270" height="1" fill="url(#l)"/>
  <rect x="630" y="31.5" width="270" height="1" fill="url(#r)"/>
  <rect class="b" x="282" y="28" width="7" height="7" rx="1.5" transform="rotate(45 285.5 31.5)" fill="${CYAN}"/>
  <rect class="b" x="611" y="28" width="7" height="7" rx="1.5" transform="rotate(45 614.5 31.5)" fill="${VIOLET}" style="animation-delay:-1.2s"/>
  <text class="f" x="450" y="35.5" text-anchor="middle">VELORA SYSTEMS · KAUNAS, LT</text>
</svg>`);

console.log('assets written');
