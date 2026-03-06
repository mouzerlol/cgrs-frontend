#!/usr/bin/env node
/**
 * Extracts only the icons used in the codebase from @iconify-json packages
 * into a small curated bundle. Run this when adding new icons.
 *
 * Usage: node scripts/extract-icons.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Scan source files for icon references
// Two grep passes: one for double-quoted, one for single-quoted strings.
// Also scan .json files for icon references in data fixtures.
const grepDouble = execSync(
  `grep -rohE '"(lucide|mdi):[a-z0-9-]+"' ${ROOT}/src --include='*.tsx' --include='*.ts' --include='*.json' || true`,
  { encoding: 'utf-8' }
);
const grepSingle = execSync(
  `grep -rohE "'(lucide|mdi):[a-z0-9-]+'" ${ROOT}/src --include='*.tsx' --include='*.ts' || true`,
  { encoding: 'utf-8' }
);
const grepOutput = grepDouble + grepSingle;

const iconRefs = [...new Set(
  grepOutput
    .trim()
    .split('\n')
    .map(s => s.replace(/["']/g, ''))
    .filter(Boolean)
)];

// Group by prefix
const needed = {};
for (const ref of iconRefs) {
  const [prefix, name] = ref.split(':');
  if (!needed[prefix]) needed[prefix] = new Set();
  needed[prefix].add(name);
}

// Lucide renamed some icons — map old names to current ones
const LUCIDE_ALIASES = {
  'bar-chart-2': 'chart-bar',
  'check-circle': 'circle-check',
  'check-square': 'square-check',
  'home': 'house',
  'loader-2': 'loader-circle',
  'more-horizontal': 'ellipsis',
};

// Load full collections and extract subsets
const collections = [];

for (const [prefix, names] of Object.entries(needed)) {
  const pkgPath = resolve(ROOT, `node_modules/@iconify-json/${prefix}/icons.json`);
  const full = JSON.parse(readFileSync(pkgPath, 'utf-8'));

  const subset = {
    prefix: full.prefix,
    icons: {},
    aliases: {},
  };

  // Copy shared properties (width, height) if they exist at collection level
  if (full.width) subset.width = full.width;
  if (full.height) subset.height = full.height;

  let found = 0;
  let missing = [];
  for (const name of names) {
    if (full.icons[name]) {
      // Direct match — icon exists in the package
      subset.icons[name] = full.icons[name];
      found++;
    } else if (LUCIDE_ALIASES[name] && full.icons[LUCIDE_ALIASES[name]]) {
      // Hardcoded alias — include the real icon and add an alias
      const realName = LUCIDE_ALIASES[name];
      subset.icons[realName] = full.icons[realName];
      subset.aliases[name] = { parent: realName };
      found++;
    } else if (full.aliases?.[name]) {
      // Package-defined alias — resolve to parent icon and include both
      const parentName = full.aliases[name].parent;
      if (full.icons[parentName]) {
        subset.icons[parentName] = full.icons[parentName];
        subset.aliases[name] = { parent: parentName };
        found++;
      } else {
        missing.push(name);
      }
    } else {
      missing.push(name);
    }
  }

  if (missing.length) {
    console.warn(`Warning: ${prefix} missing icons:`, missing.join(', '));
  }

  collections.push(subset);
  console.log(`${prefix}: ${found}/${names.size} icons extracted`);
}

const output = JSON.stringify(collections, null, 0);
const outPath = resolve(ROOT, 'src/lib/icon-bundle.json');
writeFileSync(outPath, output);

const sizeKB = (Buffer.byteLength(output) / 1024).toFixed(1);
console.log(`\nWrote ${outPath} (${sizeKB} KB)`);
