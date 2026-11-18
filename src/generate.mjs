// Turns a raw config into the full set of output files, in memory.
import { normalize } from './config.mjs';
import { renderReadme } from './readme.mjs';
import { prng, slug } from './util.mjs';
import * as svg from './svg.mjs';

/** Give each entry a unique file name built from `prefix` and its label. */
function fileNames(prefix, labels) {
  const used = new Set();
  return labels.map((label) => {
    const base = `${prefix}-${slug(label)}`;
    let name = base;
    for (let i = 2; used.has(name); i++) name = `${base}-${i}`;
    used.add(name);
    return `${name}.svg`;
  });
}

/**
 * @param {object} raw      parsed profile.config.json
 * @param {{ theme?: string }} [options]  `theme` overrides the config's theme
 * @returns {Record<string, string>} map of relative path to file content
 */
export function generate(raw, options = {}) {
  const cfg = normalize(raw, options);
  const t = cfg.theme;
  const rnd = prng(cfg.name); // seeded by name: stable per person, different between people
  const files = {};
  const put = (name, content) => { files[`assets/${name}`] = content.trim() + '\n'; };

  put('hero.svg', svg.hero(cfg, t, rnd));
  put('divider.svg', svg.divider(t));
  if (cfg.featured) put('featured.svg', svg.featured(cfg.featured, t, rnd));

  const accents = [t.a1, t.a2, t.a3];
  const links = fileNames('link', cfg.links.map((l) => l.label));
  cfg.links.forEach((l, i) => put(links[i], svg.pill(l.label, l.text, accents[i % accents.length], t)));

  // Accents alternate like a checkerboard across the two-column grid.
  const projects = fileNames('project', cfg.projects.map((p) => p.name));
  cfg.projects.forEach((p, i) => {
    const odd = (Math.floor(i / 2) + (i % 2)) % 2;
    put(projects[i], svg.card(p, t, odd ? t.a2 : t.a1, odd ? t.a1 : t.a2));
  });

  let stackWidth = 0;
  if (cfg.toolkit.length) {
    const chips = svg.stack(cfg.toolkit, t);
    stackWidth = chips.width;
    put('stack.svg', chips.svg);
  }
  if (cfg.footer) put('footer.svg', svg.footer(cfg.footer, t));

  files['README.md'] = renderReadme(cfg, { links, projects, stackWidth });
  return files;
}
