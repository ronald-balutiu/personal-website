import { defineCollection, z } from 'astro:content'

const projects = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    details: z.string(),
    link: z.string().url(),
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
