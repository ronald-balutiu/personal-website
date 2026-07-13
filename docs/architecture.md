# Architecture

This document describes the current implementation of the personal website. Keep it updated when
the system's structure or behavior changes.

## Runtime Model

Astro builds the site as static HTML, CSS, and JavaScript. The Astro configuration sets
`output: 'static'`, and the production build is written to `dist/`.

There is no application server or runtime data store. Project content is read at build time from an
Astro Content Collection.

## Routes and Layout

- `src/pages/index.astro` renders the main portfolio page.
- `src/layouts/Layout.astro` provides the shared document shell, SEO metadata, theme setup, and page
  metadata.
- `src/components/` contains feature-oriented UI components and shared navigation.
- `src/components/SEO.astro` renders resolved metadata, theme colors, and JSON-LD payloads.
- `src/components/theme/ThemeToggle.astro` provides the in-memory theme toggle.

The homepage is organized around a responsive hero. The project list remains implemented as a
separate component and its Markdown content remains available, but the homepage render is currently
disabled by the `showProjects` flag in `src/pages/index.astro`. The hero contains the greeting, About
copy, social links, and optimized portrait in a single semantic section. The greeting and hand appear
first; the remaining content enters after the hand animation. Each project row is a complete clickable
target with hover and keyboard-focus feedback when the project section is enabled. A reload restored
below the top skips the entrance sequence, using the previous scroll position kept briefly in session
storage.

The hero stays side-by-side only when the available width keeps the complete greeting on one line;
narrower desktop and tablet widths stack the portrait below the introduction. Stacked portrait crops
use taller landscape ratios on tablet and phone to keep the framing natural. The greeting keeps one
display size across breakpoints and wraps naturally when the available inline space is insufficient.

## Content Model

Content collections are defined in `src/content.config.ts` and loaded from Markdown files:

- `src/content/projects/` contains project entries.

Project frontmatter contains `order`, `title`, `description`, `link`, and `icon`. The schema validates
these fields at build time, and each project row links directly to its external repository.

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

- Unit tests in `tests/unit/` validate SEO utility behavior.
- End-to-end tests in `tests/e2e/` cover routes, runtime health, navigation, metadata, and theme
  interactions. Responsive coverage sweeps the 320px–1280px range to ensure display typography
  remains stable and wrapping only increases as available width decreases.
- Accessibility tests in `tests/a11y/` use axe-core across desktop, tablet, and mobile viewports in
  both color schemes.
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
