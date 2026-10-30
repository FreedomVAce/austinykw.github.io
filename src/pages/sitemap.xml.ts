import type { APIRoute } from 'astro';
import { getProjects } from '../lib/projects';
import { withBase } from '../lib/url';

/** Plain sitemap for search engines; submit `<site>/sitemap.xml` in Google Search Console. */
export const GET: APIRoute = async ({ site }) => {
  const projects = await getProjects();
  const paths = ['', 'projects/', 'about/', 'resume/', 'contact/', ...projects.map((p) => `projects/${p.id}/`)];
  const urls = paths.map((p) => `  <url><loc>${new URL(withBase(p), site).href}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
