/**
 * Central source of truth for site-level SEO defaults.
 */
export interface SiteConfig {
  /**
   * Absolute production origin used to build canonical and asset URLs.
   * @defaultValue `'https://ronaldbalutiu.com'`
   * @remarks Must not end with `/`.
   */
  siteUrl: string

  /**
   * Human-readable site name used in Open Graph metadata.
   * @defaultValue `'Ronald Balutiu'`
   */
  siteName: string

  /**
   * Fallback document title used when a page does not provide a custom title.
   * @defaultValue `'Ronald Balutiu'`
   */
  defaultTitle: string

  /**
   * Template applied to non-default page titles.
   * `%s` is replaced with the page-provided title.
   * @defaultValue `'%s | Ronald Balutiu'`
   */
  titleTemplate: string

  /**
   * Fallback page description for `meta[name="description"]`.
   * @defaultValue `'Design-minded engineer shipping high quality, high impact work.'`
   */
  defaultDescription: string

  /**
   * Fallback social preview image path under `public/`.
   * @defaultValue `'/assets/og-default.png'`
   */
  defaultOgImage: string

  /**
   * Fallback alt text used for OG/Twitter image metadata.
   * @defaultValue `'Homepage hero of Ronald Balutiu portfolio with name and engineering tagline.'`
   */
  defaultOgImageAlt: string

  /**
   * Open Graph locale identifier.
   * @defaultValue `'en_US'`
   */
  locale: string

  /**
   * Language code used in structured data (`inLanguage`).
   * @defaultValue `'en-US'`
   */
  language: string

  /**
   * Browser UI tint color (`meta[name="theme-color"]`).
   * @defaultValue `'#f8f2ee'`
   */
  themeColor: string

  /**
   * Default robots directive for public pages.
   * @defaultValue `'index,follow'`
   */
  robots: string

  /**
   * Default Twitter card format.
   * @defaultValue `'summary_large_image'`
   */
  twitterCard: string
}

export const siteConfig: SiteConfig = {
  siteUrl: 'https://ronaldbalutiu.com',
  siteName: 'Ronald Balutiu',
  defaultTitle: 'Ronald Balutiu',
  titleTemplate: '%s | Ronald Balutiu',
  defaultDescription: 'Design-minded engineer shipping high quality, high impact work.',
  defaultOgImage: '/assets/og-default.png',
  defaultOgImageAlt: 'Homepage hero of Ronald Balutiu portfolio with name and engineering tagline.',
  locale: 'en_US',
  language: 'en-US',
  themeColor: '#f8f2ee',
  robots: 'index,follow',
  twitterCard: 'summary_large_image',
}
