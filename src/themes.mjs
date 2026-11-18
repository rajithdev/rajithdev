// Colour themes. Every value is a 6-digit hex colour so it can be dropped
// into SVG attributes and third-party badge URLs alike.
//
//   bg0..bg2  hero background gradient      panel     card / chip background
//   ink       headings                      soft      body text on the hero
//   muted     secondary text                line      hairlines and borders
//   a1 a2 a3  accents                       ok        "live" dot
//   star      hero stars                    onAccent  text on an accent fill
//   glint     highlight that runs along the divider

export const THEMES = {
  neon: {
    bg0: '#05070d', bg1: '#090d1a', bg2: '#0d0a1c', panel: '#0b0f17',
    ink: '#e6edf3', soft: '#c9d4e3', muted: '#8b98a9', line: '#94a3b8',
    a1: '#67e8f9', a2: '#a78bfa', a3: '#f0abfc', ok: '#34d399',
    star: '#cfe9ff', onAccent: '#05070d', glint: '#ffffff',
  },
  ember: {
    bg0: '#0d0705', bg1: '#190d09', bg2: '#1c0a12', panel: '#140c0a',
    ink: '#f7ece6', soft: '#e6d3ca', muted: '#a8958b', line: '#b8a398',
    a1: '#fb923c', a2: '#f43f5e', a3: '#fbbf24', ok: '#34d399',
    star: '#ffe6cf', onAccent: '#140805', glint: '#ffffff',
  },
  aurora: {
    bg0: '#030f0c', bg1: '#061915', bg2: '#081424', panel: '#07130f',
    ink: '#e6f3ee', soft: '#c9e3d8', muted: '#86a297', line: '#94b8a8',
    a1: '#34d399', a2: '#22d3ee', a3: '#a3e635', ok: '#facc15',
    star: '#d6fff0', onAccent: '#03110c', glint: '#ffffff',
  },
  paper: {
    bg0: '#fbfaf7', bg1: '#f5f1e8', bg2: '#efe9dc', panel: '#fffdf8',
    ink: '#1c1917', soft: '#44403c', muted: '#78716c', line: '#a8a29e',
    a1: '#0f766e', a2: '#7c3aed', a3: '#be185d', ok: '#16a34a',
    star: '#a8a29e', onAccent: '#ffffff', glint: '#0f766e',
  },
};

const HEX = /^#[0-9a-f]{6}$/i;

/**
 * Resolve a theme setting to a full token set.
 * Accepts a theme name, or an object of overrides with an optional `base`.
 * Returns `{ theme, problems }`.
 */
export function resolveTheme(input = 'neon') {
  const problems = [];
  const names = Object.keys(THEMES).join(', ');

  if (typeof input === 'string') {
    if (!THEMES[input]) problems.push(`theme: unknown theme "${input}" (available: ${names})`);
    return { theme: THEMES[input] ?? THEMES.neon, problems };
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { theme: THEMES.neon, problems: [`theme: must be a theme name (${names}) or an object of colour overrides`] };
  }

  const { base = 'neon', ...overrides } = input;
  if (!THEMES[base]) problems.push(`theme.base: unknown theme "${base}" (available: ${names})`);
  const theme = { ...(THEMES[base] ?? THEMES.neon) };
  for (const [key, value] of Object.entries(overrides)) {
    if (!(key in theme)) problems.push(`theme.${key}: unknown colour token (available: ${Object.keys(theme).join(', ')})`);
    else if (typeof value !== 'string' || !HEX.test(value)) problems.push(`theme.${key}: must be a 6-digit hex colour such as "#67e8f9"`);
    else theme[key] = value;
  }
  return { theme, problems };
}
