/** Prefix an internal path with the configured base path (see astro.config.mjs). */
export function withBase(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  const clean = path.replace(/^\//, '');
  return clean ? `${base}/${clean}` : `${base}/`;
}

/** True when `current` is `target` or a page beneath it. */
export function isActive(current: string, target: string): boolean {
  const norm = (p: string) => p.replace(/\/$/, '') || '/';
  const c = norm(current);
  const t = norm(withBase(target));
  return t === norm(withBase('')) ? c === t : c === t || c.startsWith(`${t}/`);
}
