import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  // Update with your actual site URL
  site: 'https://ronaldbalutiu.com',

  integrations: [sitemap()],

  markdown: {
    shikiConfig: {
      theme: 'github-dark', // Code block theme
    },
  },

  // Ensures SSG (Static Site Generation)
  output: 'static',

  vite: {},
})
