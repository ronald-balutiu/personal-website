# Architecture

This document describes the current implementation. See the [README](../README.md) for setup,
editing instructions, verification, deployment, and documentation ownership.

## Runtime Model

[`astro.config.mjs`](../astro.config.mjs) configures static output, the production site origin,
sitemap generation, and inlined stylesheets. Astro builds HTML, CSS, JavaScript, and optimized image
assets into `dist/`.

There is no application server or runtime data store. Project content is read at build time from an
Astro Content Collection.

## Routes and Layout

- `src/pages/index.astro` renders the main portfolio page.
- `src/layouts/Layout.astro` provides the shared document shell, SEO metadata, theme setup, and page
  metadata.
- `src/components/intro/Intro.astro` contains the hero, About copy, portrait, and social navigation.
- `src/components/projects/` contains the retained project list and row components.
- `src/components/SEO.astro` renders resolved metadata, theme colors, and JSON-LD payloads.
- `src/components/theme/ThemeToggle.astro` provides the in-memory theme toggle.
- `src/components/theme/ThemeHead.astro` emits palette CSS with the initial system theme.
- `src/components/intro/HomeEntrance.astro` manages the homepage entrance via the layout's head slot.

The homepage is organized around a responsive hero. The project list remains implemented as a
separate component and its Markdown content remains available, but the homepage render is currently
disabled by the `showProjects` flag in `src/pages/index.astro`. The hero contains the greeting, About
copy, social links, and optimized portrait in a single semantic section. The greeting and hand appear
first; the remaining content enters after the hand animation. Each project row is a complete clickable
target with hover and keyboard-focus feedback when the project section is enabled. A reload restored
below the top skips the entrance sequence, using the previous scroll position kept briefly in session
storage. It is written on `pagehide` and consumed on the next homepage visit, with storage access
guarded so unavailable or full storage cannot introduce runtime errors. On a scrolled reload, the
page briefly stays hidden while restoring that position once. Restoration runs after the DOM is ready,
waiting up to 200 ms for fonts so slow requests do not hold the page hidden. Other navigation uses
native browser restoration. Global smooth scrolling is omitted so restoration happens immediately.
Skipping the entrance preserves the hand's resting tilt, including with reduced motion enabled.

The hero uses a two-column layout at the desktop breakpoint and stacks on narrower screens, with
tablet and phone portrait crops defined in `src/styles/components/intro.css`. Stacked layouts show
the introduction, recent creator platform work, portrait, earlier experience, and social links in that
order. They use a
square crop, while phones below the mobile breakpoint use a wider 4:3 crop. Both scale with the
available width up to a maximum size. Their size, ratio, and vertical position use tokens in `src/styles/tokens.css`; the image
fills the frame independently of its intrinsic dimensions. The greeting keeps one
display size across breakpoints and wraps naturally. Reduced-motion preferences disable the entrance
animations. The portrait is imported from `src/assets/images/` and processed through Astro's `Image`
component; icons in `public/assets/` are served unchanged. The layout loads DM Sans from Google Fonts,
so browser resource-health tests also depend on those external requests succeeding.

## Content Model

Content collections are defined in `src/content.config.ts` and loaded from Markdown files:

- `src/content/projects/` contains project entries.

[`src/content.config.ts`](../src/content.config.ts) is the source of truth for frontmatter validation.
The list sorts entries by ascending `order` and passes frontmatter to `ProjectItem.astro`; Markdown
bodies are not rendered. Links open the configured external HTTP(S) URL in a new tab, and icons refer
to SVG files under `public/assets/`. There are no individual project routes.

## SEO and Theme Behavior

`src/config/site.ts` holds site-level SEO defaults, while `src/lib/seo.ts` resolves page-specific
metadata and structured data. The shared `SEO.astro` component renders the result for each route.

The homepage supplies WebSite and Person JSON-LD through the layout's SEO input. Astro's
configuration imports `siteConfig.siteUrl` for sitemap generation, so the origin is defined once.

The light palette defines the token shape required for both themes at compile time.
`ThemeHead.astro` renders CSS variables from the palettes in `src/config/theme.ts`, including the
system dark fallback. Those same palettes supply browser theme-color metadata through `siteConfig`.
CSS supplies the initial system theme before JavaScript runs. `ThemeToggle.astro` initializes
`data-theme` and follows system preference changes until the visitor toggles manually, then holds the
override in memory for the current page. It updates the button's accessible state and browser
theme-color metadata.
Reloading or navigating to a new page returns to the system preference. Without JavaScript, CSS
provides the system theme and the toggle remains hidden. Theme choices are never stored; the
session-storage scroll value described above supports reload restoration and entrance motion.

## Styling

- `src/config/theme.ts` defines shared palette values emitted as CSS tokens by `ThemeHead.astro`.
- `src/styles/tokens.css` contains shared typography, spacing, motion, and non-palette values.
- `src/styles/global.css` defines global styles and shared layout primitives.
- `src/styles/components/` contains feature-level styles, including the theme toggle.

`global.css` imports the tokens and component styles, and the shared layout imports `global.css`.
The reusable `text-flow` class clears child block margins and spaces text blocks using the shared
`--paragraph-gap` token. Intro uses that same token between its text containers on desktop; stacked
layouts retain separate spacing around the portrait.
Global styles use border-box sizing and an explicit `text-link` class for inline links. The shared
`home-reveal` class owns content entrance animations, reduced-motion handling, and the scrolled-reload
bypass; the hand animation and theme toggle hover behavior remain in their component styles.
Copy width, portrait spacing, and interaction transition timing use the shared design tokens.
Emphasized names in the Intro copy use the theme's accent color and the semibold weight token.
The generated palette CSS also supplies system theme fallbacks for visitors without JavaScript.
