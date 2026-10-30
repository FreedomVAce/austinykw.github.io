import { getCollection, type CollectionEntry } from 'astro:content';
import { SKILLS } from '../data/profile';

export type Project = CollectionEntry<'projects'>;

export const TYPE_LABEL: Record<Project['data']['type'], string> = {
  work: 'Work project',
  independent: 'Independent project',
  capstone: 'Capstone project',
};

export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects');
  for (const p of all) {
    const unknown = p.data.skills.filter((s) => !(SKILLS as readonly string[]).includes(s));
    if (unknown.length) {
      throw new Error(`${p.id}: unknown skill tag(s) ${unknown.join(', ')} — add them to SKILLS in src/data/profile.ts`);
    }
  }
  return all.sort((a, b) => a.data.order - b.data.order);
}
