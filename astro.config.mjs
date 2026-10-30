// @ts-check
import { defineConfig } from 'astro/config';

// The site is the `austinykw.github.io` user site, served at the domain root:
// https://austinykw.github.io/. To serve it from a sub-path instead (a project
// repo), set BASE_PATH (or change the default below) — every internal link goes
// through `withBase()` so nothing else needs to change.
/** Open external links in Markdown (e.g. dataset sources) in a new tab, like the rest of the site. */
function externalLinks() {
  /** @param {any} node */
  const walk = (node) => {
    if (node.type === 'element' && node.tagName === 'a' && /^https?:/.test(String(node.properties?.href))) {
      node.properties.target = '_blank';
      node.properties.rel = ['noopener', 'noreferrer'];
    }
    node.children?.forEach(walk);
  };
  return (/** @type {any} */ tree) => walk(tree);
}

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://austinykw.github.io',
  base: process.env.BASE_PATH ?? '/',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  markdown: { rehypePlugins: [externalLinks] },
});
