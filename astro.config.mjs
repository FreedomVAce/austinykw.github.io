// @ts-check
import { defineConfig } from 'astro/config';

// The site is served from the `austinykw.github.io` repo under the FreedomVAce
// account, i.e. https://freedomvace.github.io/austinykw.github.io/.
// If the repo is renamed to <username>.github.io or a custom domain is added,
// set BASE_PATH=/ (or change the default below) — every internal link goes
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
  site: process.env.SITE_URL ?? 'https://freedomvace.github.io',
  base: process.env.BASE_PATH ?? '/austinykw.github.io',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  markdown: { rehypePlugins: [externalLinks] },
});
