import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'

import { siteConfig } from './src/config/site.ts'

export default defineConfig({
  site: siteConfig.siteUrl,

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
