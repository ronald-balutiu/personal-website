export interface SiteConfig {
  /** Production origin used for canonical and asset URLs. Must not end in `/`. */
  siteUrl: string
  /** Name reported to Open Graph consumers. */
  siteName: string
  defaultTitle: string
  /** `%s` is replaced with a page-specific title. */
  titleTemplate: string
  defaultDescription: string
  /** Public path to the fallback social sharing image. */
  defaultOgImage: string
  defaultOgImageAlt: string
  /** Open Graph locale format, such as `en_US`. */
  locale: string
  /** BCP 47 language tag used by HTML and structured data. */
  language: string
  /** Browser chrome colors for each color scheme. */
  themeColors: {
    light: string
    dark: string
  }
  /** Default search-engine indexing directive. */
  robots: string
  /** Default Twitter/X preview format. */
  twitterCard: string
}

export const siteConfig: SiteConfig = {
  siteUrl: 'https://ronaldbalutiu.com',
  siteName: 'Ronald Balutiu',
  defaultTitle: 'Ronald Balutiu',
  titleTemplate: '%s | Ronald Balutiu',
  defaultDescription:
    'New York-based software engineer building clear, dependable, and intuitive systems.',
  defaultOgImage: '/assets/og-default.png',
  defaultOgImageAlt: 'Homepage hero of Ronald Balutiu portfolio with name and engineering tagline.',
  locale: 'en_US',
  language: 'en-US',
  themeColors: {
    light: '#f8f2ee',
    dark: '#292827',
  },
  robots: 'index,follow',
  twitterCard: 'summary_large_image',
}
