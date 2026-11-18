// Writes the profile README that ties the generated SVGs together.
import { esc } from './util.mjs';

const REPO = 'https://github.com/rajithdev/profile-forge';

/** Escape characters that would start Markdown or HTML syntax. */
const md = (s) => esc(s).replace(/([\\`*_[\]])/g, '\\$1');

/**
 * Tiny inline Markdown for text placed inside HTML (where GitHub does not
 * run Markdown): **bold**, `code` and [text](link).
 */
export function inline(s) {
  return esc(s)
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

export function renderReadme(cfg, assets) {
  const DIVIDER = `<img src="assets/divider.svg" width="100%" alt="" />`;
  let count = 0;
  const heading = (title) => `### \`${String(++count).padStart(2, '0')}\` &nbsp;${title}`;
  const sections = [];

  if (cfg.about && (cfg.about.intro || cfg.about.rows.length)) {
    const parts = [heading(md(cfg.titles.about))];
    if (cfg.about.intro) parts.push(cfg.about.intro);
    if (cfg.about.rows.length) {
      parts.push(['<table>',
        ...cfg.about.rows.map((r) => `<tr><td><code>${esc(r.label.toUpperCase())}</code></td><td>${inline(r.value)}</td></tr>`),
        '</table>'].join('\n'));
    }
    sections.push(parts.join('\n\n'));
  }

  if (cfg.featured) {
    const f = cfg.featured;
    const target = f.url || f.demo || f.source;
    const title = target ? `[${md(f.name)}](${target})` : md(f.name);
    const img = `<img src="assets/featured.svg" width="100%" alt="${esc([f.name, f.lead.title, ...f.features.map((x) => x.title)].join(' · '))}" />`;
    const meta = [];
    if (f.stack.length) meta.push(`**Stack** &nbsp;${f.stack.map((s) => `<code>${esc(s)}</code>`).join(' ')}`);
    if (f.demo) meta.push(`[**Live demo ↗**](${f.demo})`);
    if (f.source) meta.push(`[**Source ↗**](${f.source})`);
    const parts = [heading(`${md(cfg.titles.featured)} — ${title}`)];
    if (f.summary) parts.push(f.summary);
    parts.push(target ? `<a href="${esc(target)}">${img}</a>` : img);
    if (meta.length) parts.push(meta.join(' &nbsp;·&nbsp; '));
    sections.push(parts.join('\n\n'));
  }

  if (cfg.projects.length) {
    const cells = cfg.projects.map((p, i) => {
      const alt = esc([p.name, p.description.replace(/\.$/, ''), p.stack.join(', ')].filter(Boolean).join('. '));
      const img = `<img src="assets/${assets.projects[i]}" width="49%" alt="${alt}" />`;
      return p.url ? `<a href="${esc(p.url)}">${img}</a>` : img;
    });
    const rows = [];
    for (let i = 0; i < cells.length; i += 2) rows.push(`<p align="center">\n${cells.slice(i, i + 2).join('\n')}\n</p>`);
    const parts = [heading(md(cfg.titles.projects)), rows.join('\n')];
    const demos = cfg.projects.filter((p) => p.demo).map((p) => `[${md(p.name)} ↗](${p.demo})`);
    if (demos.length) parts.push(`**Live** &nbsp;${demos.join(' &nbsp;·&nbsp; ')}`);
    sections.push(parts.join('\n\n'));
  }

  if (cfg.toolkit.length) {
    sections.push([
      heading(md(cfg.titles.toolkit)),
      `<div align="center">\n<img src="assets/stack.svg" width="${assets.stackWidth}" alt="${esc(cfg.toolkit.join(' · '))}" />\n</div>`,
    ].join('\n\n'));
  }

  if (cfg.streak) {
    const c = (hex) => hex.slice(1).toUpperCase();
    // Blend two hex colours: the badge's rules and dates sit back from the text.
    const mix = (a, b, w) => '#' + [1, 3, 5].map((i) =>
      Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - w) + parseInt(b.slice(i, i + 2), 16) * w).toString(16).padStart(2, '0')).join('');
    const t = cfg.theme;
    const query = [
      `user=${cfg.github}`, 'hide_border=true', 'border_radius=16',
      `background=${c(t.panel)}`, `stroke=${c(mix(t.panel, t.line, 0.2))}`, `ring=${c(t.a1)}`, `fire=${c(t.a2)}`,
      `currStreakNum=${c(t.ink)}`, `sideNums=${c(t.ink)}`, `currStreakLabel=${c(t.a1)}`,
      `sideLabels=${c(t.muted)}`, `dates=${c(mix(t.panel, t.muted, 0.6))}`,
    ].join('&');
    sections.push([
      heading(md(cfg.titles.activity)),
      `<div align="center">\n<img width="520" src="https://streak-stats.demolab.com?${query}" alt="GitHub contribution streak" />\n</div>`,
    ].join('\n\n'));
  }

  const head = ['<div align="center">', '',
    `<img src="assets/hero.svg" width="100%" alt="${esc([cfg.name, cfg.taglines[0]].filter(Boolean).join(' — '))}" />`];
  if (cfg.links.length) {
    head.push('', '<br/><br/>', '',
      cfg.links.map((l, i) =>
        `<a href="${esc(l.url)}"><img src="assets/${assets.links[i]}" height="36" alt="${esc(l.label)}: ${esc(l.text)}" /></a>`).join('&nbsp;\n'));
  }
  head.push('', '</div>');

  const out = [head.join('\n')];
  if (sections.length) out.push('<br/>', sections.join(`\n\n${DIVIDER}\n\n`));
  const tail = [];
  if (cfg.footer) tail.push(`<img src="assets/footer.svg" width="100%" alt="${esc(cfg.footer)}" />`);
  if (cfg.credit) tail.push(`<p align="center"><sub>Built with <a href="${REPO}">profile-forge</a></sub></p>`);
  if (tail.length) out.push('<br/>', tail.join('\n\n'));
  return out.join('\n\n') + '\n';
}
