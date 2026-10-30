import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * One Markdown file in src/content/projects/ = one project card + one case-study page.
 * To add a project: copy src/content/projects/_template.md, rename it, fill it in.
 * Files starting with "_" are ignored.
 */
const projects = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    /** One plain-language sentence: the business problem and the outcome. Shown on cards. */
    summary: z.string().max(240),
    /** Short label shown on the card, e.g. "Forecasting". */
    category: z.string(),
    /** Lower numbers appear first. */
    order: z.number().int(),
    /** Shown on the homepage. */
    featured: z.boolean().default(false),
    type: z.enum(['work', 'independent', 'capstone']),
    year: z.coerce.string(),
    /** What Austin personally did, one line. */
    role: z.string(),
    /** Where the data comes from, one line (e.g. "Public dataset — Olist, 99k orders"). */
    data: z.string(),
    /** The first thing a reader sees: three plain-language answers. */
    glance: z.object({ problem: z.string(), did: z.string(), result: z.string() }),
    stack: z.array(z.string()).min(1),
    /** Skill tags used by the filter on /projects. Keep to the SKILLS list in src/data/profile.ts. */
    skills: z.array(z.string()).min(1),
    /** Headline numbers. `note` marks where a figure comes from (e.g. "demo data"). */
    metrics: z.array(z.object({ value: z.string(), label: z.string(), note: z.string().optional() })).max(3).default([]),
    links: z.object({ repo: z.string().url().optional() }).default({}),
    /** Interactive component to embed; must be a key of DEMOS in src/pages/projects/[slug].astro. */
    demo: z.enum(['inventory-forecast', 'freight-dashboard', 'recommender', 'segmentation', 'ecommerce', 'face-emotion', 'ai-architecture']).optional(),
    icon: z.string().default('chart'),
  }),
});

export const collections = { projects };
