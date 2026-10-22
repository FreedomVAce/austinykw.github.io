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
    /** One or two sentences, shown on cards and as the page meta description. */
    summary: z.string().max(320),
    /** Short label shown on the card, e.g. "Forecasting". */
    category: z.string(),
    /** Lower numbers appear first. */
    order: z.number().int(),
    featured: z.boolean().default(true),
    status: z.enum(['complete', 'in-progress', 'planned']),
    /**
     * Where the data on the public page comes from.
     * - public:    an openly licensed public dataset
     * - synthetic: generated data standing in for confidential work data
     * - personal:  data the author collected themselves
     */
    provenance: z.enum(['public', 'synthetic', 'personal']),
    /** Plain-language note on how the original confidential work was sanitised. */
    provenanceNote: z.string().optional(),
    /** Optional context line, e.g. "Professional project · rebuilt as a demo". */
    context: z.string().optional(),
    stack: z.array(z.string()).min(1),
    /** Skill tags used by the filter on /projects. Keep to the SKILLS list in src/data/profile.ts. */
    skills: z.array(z.string()).min(1),
    /** Headline numbers. Only ever results that are safe to publish. */
    metrics: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .max(4)
      .default([]),
    links: z
      .object({
        repo: z.string().url().optional(),
        demo: z.string().optional(),
        notebook: z.string().url().optional(),
        /** Code lives in a private repository: show 'available on request' instead of a link. */
        codePrivate: z.boolean().optional(),
      })
      .default({}),
    /** Interactive demo to embed on the case-study page; must be a key of DEMOS in src/pages/projects/[slug].astro. */
    demo: z.enum(['inventory-forecast', 'freight-dashboard', 'recommender', 'segmentation', 'ecommerce', 'face-emotion']).optional(),
    /** Optional thumbnail path under public/, e.g. "images/projects/x.png". */
    thumbnail: z.string().optional(),
    icon: z.string().default('chart'),
  }),
});

export const collections = { projects };
