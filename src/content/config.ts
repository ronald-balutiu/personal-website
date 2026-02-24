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

export const collections = { projects }
