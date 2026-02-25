import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://ronaldbalutiu.com',

  integrations: [sitemap()],

  output: 'static',
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'always',
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
})
