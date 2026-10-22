// Fails if any term from a PRIVATE denylist appears in the repo or the built site.
//
// The denylist holds employer names, internal system names, real SKUs, vendor
// names, internal hostnames, etc. — so it must never be committed. Keep it at
// ~/.portfolio-denylist.txt (or point CONFIDENTIAL_DENYLIST at it): one term per
// line, case-insensitive, lines starting with # are comments. Terms shorter
// than 4 characters are matched as whole words only.
//
// Usage: node scripts/scan-confidential.mjs [dir ...]   (default: src public dist)
import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const listPath = process.env.CONFIDENTIAL_DENYLIST ?? join(homedir(), '.portfolio-denylist.txt');
if (!existsSync(listPath)) {
  console.error(`✗ Denylist not found at ${listPath}. Create it (one term per line) before publishing.`);
  process.exit(2);
}

const terms = (await readFile(listPath, 'utf8'))
  .split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = terms.map((t) => ({
  // Report only a hash of the term so CI logs never echo the confidential word itself.
  id: `term#${terms.indexOf(t) + 1}`,
  re: new RegExp(t.length < 4 ? `\\b${esc(t)}\\b` : esc(t), 'i'),
}));

const TEXT = /\.(astro|md|mdx|ts|js|mjs|json|html|css|svg|txt|csv|yml|yaml|py|ipynb|toml|cfg|ini)$/i;
async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', '.astro'].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (TEXT.test(p)) yield p;
  }
}

const roots = process.argv.slice(2).length ? process.argv.slice(2) : ['src', 'public', 'dist', 'README.md'];
const hits = [];
for (const root of roots.filter(existsSync)) {
  const files = (await stat(root)).isDirectory() ? walk(root) : [root];
  for await (const file of files) {
    const lines = (await readFile(file, 'utf8')).split('\n');
    lines.forEach((line, i) => {
      for (const { id, re } of patterns) if (re.test(line)) hits.push(`${file}:${i + 1} matches ${id}`);
    });
  }
}

if (hits.length) {
  console.error(`✗ ${hits.length} denylisted term(s) found:\n  ${hits.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ No denylisted terms in ${roots.join(', ')} (${terms.length} terms checked)`);
