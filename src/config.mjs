// Reads a raw config object, reports every problem at once in plain words,
// and returns a fully-defaulted config the builders can trust.
import { resolveTheme } from './themes.mjs';
import { ICONS } from './icons.mjs';
import { ARTS } from './svg.mjs';

export class ConfigError extends Error {
  constructor(problems) {
    super(`Invalid profile config:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
    this.name = 'ConfigError';
    this.problems = problems;
  }
}

const SECTION_TITLES = {
  about: 'About',
  featured: 'Featured build',
  projects: 'More builds',
  toolkit: 'Toolkit',
  activity: 'Activity',
};

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const isUrl = (u) => typeof u === 'string' && /^(https?:\/\/|mailto:)[^\s"<>]+$/i.test(u);

export function normalize(raw, { theme: themeOverride } = {}) {
  if (!isObj(raw)) throw new ConfigError(['the config must be a JSON object']);
  const problems = [];

  const str = (v, path, { required = false } = {}) => {
    if (v === undefined || v === null || v === '') {
      if (required) problems.push(`${path}: required`);
      return '';
    }
    if (typeof v !== 'string') {
      problems.push(`${path}: must be text`);
      return '';
    }
    return v.trim();
  };
  const url = (v, path, opts) => {
    const s = str(v, path, opts);
    if (s && !isUrl(s)) problems.push(`${path}: must be a full link starting with https://, http:// or mailto:`);
    return s;
  };
  const list = (v, path, max) => {
    if (v === undefined || v === null) return [];
    if (!Array.isArray(v)) {
      problems.push(`${path}: must be a list`);
      return [];
    }
    if (max && v.length > max) problems.push(`${path}: at most ${max} entries (found ${v.length})`);
    return v;
  };
  const strList = (v, path, max) => list(v, path, max).map((s, i) => str(s, `${path}[${i}]`, { required: true })).filter(Boolean);
  const objList = (v, path, max) =>
    list(v, path, max).filter((item, i) => {
      if (isObj(item)) return true;
      problems.push(`${path}[${i}]: must be an object`);
      return false;
    });

  const { theme, problems: themeProblems } = resolveTheme(themeOverride ?? raw.theme ?? 'neon');
  problems.push(...themeProblems);

  const cfg = {
    name: str(raw.name, 'name', { required: true }),
    github: str(raw.github, 'github'),
    theme,
    taglines: strList(raw.taglines, 'taglines', 8),
    status: str(raw.status, 'status'),
    location: str(raw.location, 'location'),
    links: objList(raw.links, 'links', 6).map((l, i) => ({
      label: str(l.label, `links[${i}].label`, { required: true }),
      text: str(l.text, `links[${i}].text`, { required: true }),
      url: url(l.url, `links[${i}].url`, { required: true }),
    })),
    about: null,
    featured: null,
    projects: [],
    toolkit: strList(raw.toolkit, 'toolkit', 40),
    streak: false,
    footer: str(raw.footer, 'footer'),
    credit: raw.credit !== false,
    titles: { ...SECTION_TITLES },
  };
  if (cfg.github && !/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(cfg.github)) problems.push('github: must be a GitHub username, without the @');

  if (raw.sections !== undefined) {
    if (!isObj(raw.sections)) problems.push('sections: must be an object of section titles');
    else for (const [key, value] of Object.entries(raw.sections)) {
      if (!(key in SECTION_TITLES)) problems.push(`sections.${key}: unknown section (available: ${Object.keys(SECTION_TITLES).join(', ')})`);
      else cfg.titles[key] = str(value, `sections.${key}`, { required: true }) || SECTION_TITLES[key];
    }
  }

  if (raw.about !== undefined) {
    if (!isObj(raw.about)) problems.push('about: must be an object');
    else cfg.about = {
      intro: str(raw.about.intro, 'about.intro'),
      rows: objList(raw.about.rows, 'about.rows', 8).map((r, i) => ({
        label: str(r.label, `about.rows[${i}].label`, { required: true }),
        value: str(r.value, `about.rows[${i}].value`, { required: true }),
      })),
    };
  }

  if (raw.featured !== undefined) {
    const f = raw.featured;
    if (!isObj(f)) problems.push('featured: must be an object');
    else {
      const art = str(f.art, 'featured.art') || 'orbit';
      if (!ARTS.includes(art)) problems.push(`featured.art: unknown artwork "${art}" (available: ${ARTS.join(', ')})`);
      const lead = isObj(f.lead) ? f.lead : {};
      if (!isObj(f.lead)) problems.push('featured.lead: required, an object with "title" and "text"');
      const features = objList(f.features, 'featured.features').map((ft, i) => {
        const icon = str(ft.icon, `featured.features[${i}].icon`) || 'bolt';
        if (!ICONS[icon]) problems.push(`featured.features[${i}].icon: unknown icon "${icon}" (available: ${Object.keys(ICONS).join(', ')})`);
        return {
          icon,
          title: str(ft.title, `featured.features[${i}].title`, { required: true }),
          text: str(ft.text, `featured.features[${i}].text`),
        };
      });
      if (features.length < 1 || features.length > 4) problems.push(`featured.features: between 1 and 4 entries (found ${features.length})`);
      cfg.featured = {
        name: str(f.name, 'featured.name', { required: true }),
        url: url(f.url, 'featured.url'),
        summary: str(f.summary, 'featured.summary'),
        art: ARTS.includes(art) ? art : 'orbit',
        lead: {
          title: str(lead.title, 'featured.lead.title', { required: isObj(f.lead) }),
          text: str(lead.text, 'featured.lead.text'),
        },
        features,
        stack: strList(f.stack, 'featured.stack', 12),
        demo: url(f.demo, 'featured.demo'),
        source: url(f.source, 'featured.source'),
      };
    }
  }

  cfg.projects = objList(raw.projects, 'projects', 12).map((p, i) => {
    const demo = url(p.demo, `projects[${i}].demo`);
    if (p.live !== undefined && typeof p.live !== 'boolean') problems.push(`projects[${i}].live: must be true or false`);
    return {
      name: str(p.name, `projects[${i}].name`, { required: true }),
      tag: str(p.tag, `projects[${i}].tag`),
      description: str(p.description, `projects[${i}].description`),
      stack: strList(p.stack, `projects[${i}].stack`, 8),
      url: url(p.url, `projects[${i}].url`) || demo,
      demo,
      live: typeof p.live === 'boolean' ? p.live : Boolean(demo),
    };
  });

  if (raw.activity !== undefined) {
    if (!isObj(raw.activity)) problems.push('activity: must be an object');
    else {
      if (raw.activity.streak !== undefined && typeof raw.activity.streak !== 'boolean') problems.push('activity.streak: must be true or false');
      cfg.streak = raw.activity.streak === true;
      if (cfg.streak && !cfg.github) problems.push('activity.streak: needs "github" set to your username');
    }
  }

  if (problems.length) throw new ConfigError(problems);
  return cfg;
}
