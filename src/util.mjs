// Shared helpers: escaping, text measurement and wrapping, a seeded PRNG.

export const MONO = `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace`;
export const SANS = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif`;

/** Escape text for use in SVG/HTML content and double-quoted attributes. */
export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** File-name-safe slug. Falls back to "item" for text with no ASCII letters. */
export const slug = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s_-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'item';

/** Round to at most `d` decimals, without trailing zeros. */
export const n = (v, d = 2) => Number(Number(v).toFixed(d));

// SVG text cannot wrap and we have no font metrics at build time, so widths
// are estimated per character. The estimates lean wide on purpose: a line
// that ends a little early looks fine, one that overflows its card does not.
const WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]|\p{Extended_Pictographic}/u;

function sansUnits(ch) {
  if (WIDE.test(ch)) return 1;
  if (ch === ' ') return 0.28;
  if (`iljI.,:;'|!`.includes(ch)) return 0.27;
  if (`ftr()[]-/"`.includes(ch)) return 0.36;
  if ('mwMW@'.includes(ch)) return 0.86;
  if (ch >= 'A' && ch <= 'Z') return 0.67;
  if (ch >= '0' && ch <= '9') return 0.58;
  return 0.54;
}

/** Estimated width in px of `s` set in the sans stack at `px`. */
export const sansWidth = (s, px) => [...String(s)].reduce((w, ch) => w + sansUnits(ch), 0) * px;

/** Estimated width in px of `s` set in the mono stack at `px` with letter-spacing `tracking`. */
export const monoWidth = (s, px, tracking = 0) =>
  [...String(s)].reduce((w, ch) => w + (WIDE.test(ch) ? 1 : 0.602) * px + tracking, 0);

/**
 * Wrap `text` into at most `maxLines` lines no wider than `maxWidth`.
 * Words too long for a line (or text with no spaces, such as CJK) are broken
 * by character. Text that does not fit ends with an ellipsis.
 */
export function wrap(text, px, maxWidth, maxLines = 2, measure = sansWidth) {
  const tokens = [];
  for (const word of String(text ?? '').trim().split(/\s+/).filter(Boolean)) {
    if (measure(word, px) <= maxWidth) {
      tokens.push({ text: word, glue: ' ' });
      continue;
    }
    let piece = '';
    for (const ch of word) {
      if (piece && measure(piece + ch, px) > maxWidth) {
        tokens.push({ text: piece, glue: '' });
        piece = ch;
      } else piece += ch;
    }
    if (piece) tokens.push({ text: piece, glue: ' ' });
  }

  const lines = [];
  let cur = '', glue = '';
  for (const tok of tokens) {
    const next = cur ? cur + glue + tok.text : tok.text;
    if (!cur || measure(next, px) <= maxWidth) cur = next;
    else {
      lines.push(cur);
      cur = tok.text;
    }
    glue = tok.glue;
  }
  if (cur) lines.push(cur);
  if (lines.length <= maxLines) return lines;

  const kept = lines.slice(0, maxLines);
  const chars = [...kept[maxLines - 1]];
  while (chars.length && measure(chars.join('') + '…', px) > maxWidth) chars.pop();
  kept[maxLines - 1] = chars.join('').replace(/[\s.,;:·-]+$/, '') + '…';
  return kept;
}

/** Single-line version of `wrap`: the text, shortened with an ellipsis if needed. */
export const fit = (text, px, maxWidth, measure = sansWidth) => wrap(text, px, maxWidth, 1, measure)[0] ?? '';

/** Deterministic PRNG seeded from a string, so rebuilds are byte-stable. */
export function prng(seedText) {
  let h = 2166136261;
  for (const ch of String(seedText)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  let s = h || 42;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
}
