# Ronald Balutiu - Personal Website

Production portfolio website built with Astro as a static web app. The codebase is structured for clean component boundaries, token-driven styling, content-managed projects, and strong automated quality gates.

## Live Site

- Production: `https://ronaldbalutiu.com`

## Highlights

- Section-based homepage (`Intro`, `About`, `Experience`, `Projects`)
- Markdown-backed projects via Astro Content Collections
- Optional project detail pages controlled by a feature flag
- Shared SEO metadata utilities and JSON-LD support
- Unit, e2e, and accessibility testing in local and CI pipelines

## Tech Stack

- Astro 5 (static output)
- TypeScript
- Vanilla CSS + design tokens
- Vitest
- Playwright + axe-core
- ESLint + Prettier
- GitHub Actions

## Project Architecture

```text
.
|-- src/
|   |-- components/
|   |   |-- about/About.astro
|   |   |-- experience/Experience.astro
|   |   |-- intro/Intro.astro
|   |   |-- projects/ProjectItem.astro
|   |   |-- projects/Projects.astro
|   |   |-- JumpLinks.astro
|   |   `-- SEO.astro
|   |-- config/
|   |   |-- features.ts
|   |   `-- site.ts
|   |-- content/
|   |   |-- config.ts
|   |   |-- experience/*.md
|   |   `-- projects/*.md
|   |-- layouts/Layout.astro
|   |-- lib/seo.ts
|   |-- pages/
|   |   |-- index.astro
|   |   `-- [project].astro
|   `-- styles/
|       |-- tokens.css
|       |-- global.css
|       `-- components/*.css
|-- public/assets/
|-- tests/
|   |-- unit/
|   |-- e2e/
|   `-- a11y/
|-- docs/metadata-tags-plan/
|-- playwright.config.ts
|-- vitest.config.ts
|-- wrangler.jsonc
`-- .github/workflows/release-ci.yml
```

## Prerequisites

- Node.js 24+
- npm

## Local Setup

```bash
npm install
npm run dev
```

Local dev server: `http://localhost:4321`

## Build and Preview

```bash
npm run build
npm run preview
```

## Commands

### Development

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start Astro dev server               |
| `npm run build`   | Build static output into `dist/`     |
| `npm run preview` | Preview the production build locally |
| `npm run clean`   | Remove local Astro cache (`.astro/`) |
| `npm run astro`   | Run Astro CLI directly               |

### Quality and Formatting

| Command                | Description                   |
| ---------------------- | ----------------------------- |
| `npm run lint`         | Run ESLint with autofix       |
| `npm run lint:check`   | Run ESLint in check mode      |
| `npm run format`       | Run Prettier in write mode    |
| `npm run format:check` | Run Prettier in check mode    |
| `npm run check`        | Run `astro check` diagnostics |

### Tests

| Command                      | Description                                              |
| ---------------------------- | -------------------------------------------------------- |
| `npm run test:unit`          | Run Vitest unit tests                                    |
| `npm run test:e2e`           | Run Playwright e2e tests (Chromium)                      |
| `npm run test:a11y`          | Run Playwright accessibility tests (Chromium)            |
| `npm run test`               | Run aggregate local test flow (`check`, unit, e2e, a11y) |
| `npm run test:cross-browser` | Run tests across Chromium, Firefox, and WebKit           |

### Release Gates

| Command              | Description                                                      |
| -------------------- | ---------------------------------------------------------------- |
| `npm run release`    | Local pre-commit gate: lint + format + check + build + test      |
| `npm run release:ci` | CI gate: sync + lint/format checks + build + cross-browser tests |

## Content Management

Project entries live in `src/content/projects/*.md` and are validated by `src/content/config.ts`.

Required frontmatter:

- `title`
- `description`
- `details`
- `link` (must be a URL)
- `icon`

Optional frontmatter:

- `seoTitle`
- `seoDescription`
- `ogImage`
- `ogImageAlt`
- `publishedAt`
- `updatedAt`

Current feature-flag behavior:

- `PROJECT_DETAIL_PAGES_ENABLED` in `src/config/features.ts` is currently `false`.
- With this setting, project cards link to each project's external `link`.
- If set to `true`, Astro generates static project detail routes via `src/pages/[project].astro`.

## Testing Strategy

- Unit tests validate content integrity and SEO utility behavior.
- E2E tests validate route health, navigation, and interaction behavior.
- A11y tests block serious/critical violations for desktop and mobile viewport presets.
- Playwright output is stored in `playwright_output/`.

## CI

GitHub Actions workflow: `.github/workflows/release-ci.yml`

On push/PR to `master`, CI runs:

1. `npm ci`
2. `npx playwright install --with-deps`
3. `npm run release:ci`

## Deployment

This project uses static output and Cloudflare Pages configuration.

- Build output directory: `dist` (also defined in `wrangler.jsonc`)
- Use `wrangler pages ...` commands for deployment

## License

All rights reserved. No license is granted for copying, modifying, or redistributing this source code.
