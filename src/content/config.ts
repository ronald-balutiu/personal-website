import { defineCollection, z } from 'astro:content'

const projects = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    details: z.string(),
    link: z.string().url(),
    icon: z.string(),
  }),
})

export const collections = { projects }
