#!/usr/bin/env node
// Builds README.md and assets/*.svg from profile.config.json.
//
//   node build.mjs                          build the profile in this folder
//   node build.mjs --out preview            write the result somewhere else
//   node build.mjs --theme ember            try another theme without editing the config
//   node build.mjs --config other.json      use a different config file
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { generate } from './src/generate.mjs';
import { THEMES } from './src/themes.mjs';

const HELP = `Usage: node build.mjs [options]

  --config <file>   config to read (default: profile.config.json)
  --out <dir>       folder to write README.md and assets/ into (default: .)
  --theme <name>    override the config's theme (${Object.keys(THEMES).join(', ')})
  --help            show this message`;

function parseArgs(argv) {
  const args = { config: 'profile.config.json', out: '.', theme: undefined };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--help' || flag === '-h') return { help: true };
    if (!['--config', '--out', '--theme'].includes(flag)) throw new Error(`Unknown option "${flag}"\n\n${HELP}`);
    const value = argv[++i];
    if (value === undefined) throw new Error(`${flag} needs a value\n\n${HELP}`);
    args[flag.slice(2)] = value;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return console.log(HELP);

  const configPath = resolve(args.config);
  if (!existsSync(configPath)) throw new Error(`Config not found: ${configPath}`);
  let raw;
  try {
    raw = JSON.parse(readFileSync(configPath, 'utf8'));
  } catch (err) {
    throw new Error(`${args.config} is not valid JSON: ${err.message}`);
  }

  const files = generate(raw, { theme: args.theme });
  const outDir = resolve(args.out);
  const assetsDir = join(outDir, 'assets');
  mkdirSync(assetsDir, { recursive: true });

  // Remove link and project images left over from entries that no longer exist.
  for (const name of readdirSync(assetsDir)) {
    if (/^(link|project)-.*\.svg$/.test(name) && !files[`assets/${name}`]) rmSync(join(assetsDir, name));
  }
  for (const [path, content] of Object.entries(files)) {
    const target = join(outDir, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  console.log(`Wrote ${Object.keys(files).length} files to ${outDir}`);
}

try {
  main();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
