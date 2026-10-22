// @ts-check
import { defineConfig } from 'astro/config';

// The site is served from the `austinykw.github.io` repo under the FreedomVAce
// account, i.e. https://freedomvace.github.io/austinykw.github.io/.
// If the repo is renamed to <username>.github.io or a custom domain is added,
// set BASE_PATH=/ (or change the default below) — every internal link goes
// through `withBase()` so nothing else needs to change.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://freedomvace.github.io',
  base: process.env.BASE_PATH ?? '/austinykw.github.io',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
