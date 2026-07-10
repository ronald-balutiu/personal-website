# Architecture

This document describes the current implementation of the personal website. Keep it updated when
the system's structure or behavior changes.

## Runtime Model

Astro builds the site as static HTML, CSS, and JavaScript. The Astro configuration sets
`output: 'static'`, and the production build is written to `dist/`.

There is no application server or runtime data store. Project and experience content is read at
build time from Astro Content Collections.

## Routes and Layout

- `src/pages/index.astro` renders the main portfolio page.
- `src/pages/[project].astro` provides optional static project detail pages.
- `src/layouts/Layout.astro` provides the shared document shell, SEO metadata, theme setup, and page
  metadata.
- `src/components/` contains feature-oriented UI components and shared navigation.
- `src/components/SEO.astro` renders resolved metadata, theme colors, and JSON-LD payloads.
- `src/components/theme/ThemeToggle.astro` provides the in-memory theme toggle.

The homepage is organized into Intro, About, Experience, and Projects sections. `JumpLinks.astro`
provides sticky section navigation, active-section tracking, and hash/deep-link behavior.

## Content Model

Content collections are defined in `src/content.config.ts` and loaded from Markdown files:

- `src/content/projects/` contains project entries.
- `src/content/experience/` contains work experience entries.

Project frontmatter includes ordering, project details, external links, icons, optional SEO metadata,
and optional publication dates:

- Required: `order`, `title`, `description`, `details`, `link`, and `icon`.
- Optional: `seoTitle`, `seoDescription`, `ogImage`, `ogImageAlt`, `publishedAt`, and `updatedAt`.

Experience frontmatter includes company, locations, ordering, roles, technologies, and highlights.

The project detail route is controlled by the build-time constant
`PROJECT_DETAIL_PAGES_ENABLED` in `src/config/features.ts`:

- When `false`, project cards link directly to the external project URL.
- When `true`, Astro generates a static detail page for each project slug.

This is a build-time toggle, not an environment-backed runtime feature flag.

## SEO and Theme Behavior

`src/config/site.ts` holds site-level SEO defaults, while `src/lib/seo.ts` resolves page-specific
metadata and structured data. The shared `SEO.astro` component renders the result for each route.

The site follows the visitor's system light or dark preference. The theme toggle can temporarily
switch the current page to the other theme, but the choice is kept only in memory and is not written
to browser storage. Reloading or navigating to a new page returns to the system preference.

## Styling

- `src/styles/tokens.css` contains shared color, typography, spacing, and motion values.
- `src/styles/global.css` defines global styles and shared layout primitives.
- `src/styles/components/` contains feature-level styles, including the theme toggle.

New reusable design values should be added to the token layer instead of duplicated in component
styles.

## Verification

The repository uses layered verification:

- Unit tests in `tests/unit/` validate content, asset, and SEO utility behavior.
- End-to-end tests in `tests/e2e/` cover routes, runtime health, navigation, metadata, and theme
  interactions.
- Accessibility tests in `tests/a11y/` use axe-core across desktop and mobile viewport presets.
- `npm run test:cross-browser` runs browser tests on Chromium, Firefox, and WebKit.

The local quality gate is `npm run release`. CI runs `npm run release:ci` after installing all three
Playwright browser engines.

## Deployment

The site can be deployed to a static host. The repository is configured for Cloudflare Pages, with
`dist/` as the build output directory in `wrangler.jsonc`.

## Documentation Ownership

- `README.md` owns setup, common commands, content editing, testing, and deployment instructions.
- `AGENTS.md` owns repository conventions and agent verification expectations.
- This document owns the current technical architecture.
- Historical decisions should be recorded separately if they need to be preserved after the
  architecture changes.
