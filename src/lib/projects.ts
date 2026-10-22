import { getCollection, type CollectionEntry } from 'astro:content';
import { SKILLS } from '../data/profile';

export type Project = CollectionEntry<'projects'>;

export const STATUS_LABEL: Record<Project['data']['status'], string> = {
  complete: 'Complete',
  'in-progress': 'Case study in progress',
  planned: 'Planned',
};

export const PROVENANCE_LABEL: Record<Project['data']['provenance'], string> = {
  public: 'Public data',
  synthetic: 'Synthetic data',
  personal: 'Self-collected data',
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
