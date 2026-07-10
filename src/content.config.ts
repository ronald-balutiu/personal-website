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
    title: z.string().min(1),
    description: z.string().min(1),
    link: externalUrl,
    icon: z.string().regex(/^\/assets\/[a-z0-9-]+\.svg$/),
  }),
})

export const collections = { projects }
