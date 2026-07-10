import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'

const externalUrl = z.url().refine((value) => /^https?:\/\//i.test(value), {
  message: 'Expected an HTTP(S) URL',
})

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    order: z.number().int().nonnegative(),
    title: z.string(),
    description: z.string(),
    details: z.string(),
    link: externalUrl,
    icon: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    ogImage: z.string().optional(),
    ogImageAlt: z.string().optional(),
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  }),
})

const experience = defineCollection({
  loader: glob({ base: './src/content/experience', pattern: '**/*.md' }),
  schema: z.object({
    company: z.string(),
    locations: z.array(z.string()).min(1),
    order: z.number().int().nonnegative(),
    roles: z
      .array(
        z.object({
          title: z.string(),
          dateRange: z.string(),
        })
      )
      .min(1),
    technologies: z.array(z.string()),
    highlights: z.array(z.string()).min(1),
  }),
})

export const collections = { projects, experience }
