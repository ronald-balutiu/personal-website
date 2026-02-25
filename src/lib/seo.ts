import { siteConfig } from '../config/site'

/** JSON-LD payload object rendered in `<script type="application/ld+json">`. */
export type JsonLdObject = Record<string, unknown>

/** High-level page classification used to choose metadata defaults. */
export type SeoPageType = 'home' | 'project' | 'generic'

/** Open Graph page type. */
export type OpenGraphType = 'website' | 'article'

/**
 * Page-provided SEO input.
 *
 * Each optional field either:
 * - overrides a site default, or
 * - falls back to `siteConfig`/derived values when omitted.
 */
export interface SeoInput {
  /**
   * Page classification used to determine default OG type.
   * `project` resolves to `article`, all others resolve to `website`.
   */
  pageType: SeoPageType

  /**
   * Route path used to derive canonical URL when `canonical` is not provided.
   * @example `'/projects/my-project'`
   */
  path: string

  /**
   * Page title.
   * If omitted, `siteConfig.defaultTitle` is used.
   * If provided and not equal to `defaultTitle`, `siteConfig.titleTemplate` is applied.
   */
  title?: string

  /**
   * Page description.
   * If omitted, `siteConfig.defaultDescription` is used.
   */
  description?: string

  /**
   * Canonical URL override.
   * Accepts absolute URL or path. If omitted, canonical is derived from `path`.
   */
  canonical?: string

  /**
   * Open Graph type override.
   * If omitted, `pageType` selects the default.
   */
  ogType?: OpenGraphType

  /**
   * Open Graph/Twitter image override.
   * If omitted, `siteConfig.defaultOgImage` is used.
   */
  ogImage?: string

  /**
   * Open Graph/Twitter image alt text override.
   * If omitted, `siteConfig.defaultOgImageAlt` is used.
   */
  ogImageAlt?: string

  /**
   * Robots directive override.
   * Highest-priority robots control when provided.
   */
  robots?: string

  /**
   * Convenience flag for private pages.
   * Used only when `robots` is not provided.
   * Resolves to `noindex,nofollow`.
   */
  noindex?: boolean

  /**
   * Twitter card override.
   * If omitted, `siteConfig.twitterCard` is used.
   */
  twitterCard?: string

  /**
   * Structured data payloads for JSON-LD scripts.
   * If omitted, no JSON-LD scripts are rendered.
   */
  jsonLd?: JsonLdObject[]
}

/** Fully-resolved Open Graph metadata rendered in the document head. */
export interface ResolvedOpenGraph {
  type: OpenGraphType
  title: string
  description: string
  url: string
  siteName: string
  image: string
  imageAlt: string
  locale: string
}

/** Fully-resolved Twitter metadata rendered in the document head. */
export interface ResolvedTwitter {
  card: string
  title: string
  description: string
  image: string
  imageAlt: string
}

/** Final SEO payload consumed by the `SEO.astro` component. */
export interface ResolvedSeo {
  /** Final document title after default/template resolution. */
  title: string
  /** Final meta description after default resolution. */
  description: string
  /** Final absolute canonical URL. */
  canonical: string
  /** Final robots directive. */
  robots: string
  /** Final theme color rendered in `meta[name="theme-color"]`. */
  themeColor: string
  og: ResolvedOpenGraph
  twitter: ResolvedTwitter
  /** Structured data blocks rendered as JSON-LD scripts. */
  jsonLd: JsonLdObject[]
}

const absoluteUrlPattern = /^https?:\/\//i

/** Converts a path or URL-like value to an absolute URL using `siteConfig.siteUrl`. */
export const toAbsoluteUrl = (value: string): string => {
  return new URL(value, siteConfig.siteUrl).toString()
}

const resolveTitle = (title?: string): string => {
  const resolvedTitle = title ?? siteConfig.defaultTitle
  if (resolvedTitle === siteConfig.defaultTitle) {
    return resolvedTitle
  }

  return siteConfig.titleTemplate.replace('%s', resolvedTitle)
}

const resolveOgType = (input: SeoInput): OpenGraphType => {
  if (input.ogType) {
    return input.ogType
  }

  return input.pageType === 'project' ? 'article' : 'website'
}

const resolveCanonical = (input: SeoInput): string => {
  if (input.canonical) {
    if (absoluteUrlPattern.test(input.canonical)) {
      return input.canonical
    }

    return toAbsoluteUrl(input.canonical)
  }

  return toAbsoluteUrl(input.path)
}

const resolveRobots = (input: SeoInput): string => {
  if (input.robots) {
    return input.robots
  }

  if (input.noindex) {
    return 'noindex,nofollow'
  }

  return siteConfig.robots
}

/**
 * Resolves raw page SEO input into a complete metadata object.
 *
 * Resolution priority is:
 * 1) explicit page input
 * 2) derived value (for canonical/og type)
 * 3) site-level defaults from `siteConfig`
 */
export const buildSeo = (input: SeoInput): ResolvedSeo => {
  const title = resolveTitle(input.title)
  const description = input.description ?? siteConfig.defaultDescription
  const canonical = resolveCanonical(input)
  const ogType = resolveOgType(input)
  const ogImage = toAbsoluteUrl(input.ogImage ?? siteConfig.defaultOgImage)
  const ogImageAlt = input.ogImageAlt ?? siteConfig.defaultOgImageAlt

  return {
    title,
    description,
    canonical,
    robots: resolveRobots(input),
    themeColor: siteConfig.themeColor,
    og: {
      type: ogType,
      title,
      description,
      url: canonical,
      siteName: siteConfig.siteName,
      image: ogImage,
      imageAlt: ogImageAlt,
      locale: siteConfig.locale,
    },
    twitter: {
      card: input.twitterCard ?? siteConfig.twitterCard,
      title,
      description,
      image: ogImage,
      imageAlt: ogImageAlt,
    },
    jsonLd: input.jsonLd ?? [],
  }
}
