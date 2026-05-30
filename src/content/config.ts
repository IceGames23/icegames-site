import { defineCollection, z } from 'astro:content';

const bilingual = z.object({ pt: z.string(), en: z.string() });

const projects = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: bilingual,
      summary: bilingual,
      role: bilingual,
      tech: z.array(z.string()),
      featured: z.boolean().default(false),
      order: z.number().default(99),
      cover: image().optional(),
      links: z
        .array(z.object({ label: z.string(), url: z.string().url() }))
        .default([]),
    }),
});

const testimonials = defineCollection({
  type: 'content',
  schema: z.object({
    author: z.string(),
    role: bilingual,
    quote: bilingual,
    order: z.number().default(99),
  }),
});

export const collections = { projects, testimonials };
