// Verifies every internal href/src in the built site resolves to a real file.
// Run after `astro build`: node scripts/check-links.mjs
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const DIST = 'dist';
const BASE = (process.env.BASE_PATH ?? '/austinykw.github.io').replace(/\/$/, '');

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}

async function resolves(url) {
  const path = decodeURI(url.split(/[?#]/)[0]);
  if (BASE && !path.startsWith(`${BASE}/`) && path !== BASE) return false;
  const rel = path.slice(BASE.length) || '/';
  const target = join(DIST, rel);
  if (extname(rel)) return exists(target);
  return exists(join(target, 'index.html'));
}

const broken = [];
let checked = 0;
for await (const file of walk(DIST)) {
  if (!file.endsWith('.html')) continue;
  const html = await readFile(file, 'utf8');
  for (const [, url] of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|#|data:)/.test(url)) continue;
    checked++;
    if (!(await resolves(url))) broken.push(`${file}: ${url}`);
  }
  // In-page anchors must point at an element id on the same page.
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) {
    checked++;
    if (!html.includes(`id="${id}"`)) broken.push(`${file}: #${id}`);
  }
}

if (broken.length) {
  console.error(`✗ ${broken.length} broken internal link(s):\n  ${broken.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ ${checked} internal links OK`);
