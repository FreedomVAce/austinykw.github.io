import { getCollection, type CollectionEntry } from 'astro:content';
import { SKILLS } from '../data/profile';

export type Project = CollectionEntry<'projects'>;

export const TYPE_LABEL: Record<Project['data']['type'], string> = {
  work: 'Work project',
  independent: 'Independent project',
  capstone: 'Capstone project',
};

/** Latest year a project ran: "2022 – present" → current year, "2025 – 2026" → 2026. */
function endYear(year: string): number {
  if (/present/i.test(year)) return new Date().getFullYear();
  return Math.max(...(year.match(/\d{4}/g) ?? ['0']).map(Number));
}

/** Newest first; projects from the same year keep their `order` (strongest first). */
export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects');
  for (const p of all) {
    const unknown = p.data.skills.filter((s) => !(SKILLS as readonly string[]).includes(s));
    if (unknown.length) {
      throw new Error(`${p.id}: unknown skill tag(s) ${unknown.join(', ')} — add them to SKILLS in src/data/profile.ts`);
    }
  }
  return all.sort((a, b) => endYear(b.data.year) - endYear(a.data.year) || a.data.order - b.data.order);
}
