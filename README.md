# Personal Website

Personal portfolio website built with Astro as a static site, with token-driven CSS, content-managed projects, and automated quality gates (lint, format, type checks, unit, e2e, and accessibility).

## Live Site

- Production URL: `https://ronaldbalutiu.com`

## Tech Stack

- Astro 5 (static output)
- TypeScript (strict Astro config)
- Vanilla CSS (design tokens in `src/styles/tokens.css`)
- Astro Content Collections (`src/content/projects/*.md`)
- Vitest (unit tests)
- Playwright + axe-core (e2e and accessibility)
- ESLint + Prettier
- GitHub Actions for CI

## Core Features

- Single-page portfolio sections: Intro, About, Experience, Projects.
- Sticky jump-link navigation with active-section tracking and hash/deep-link handling.
- Project cards sourced from markdown content.
- Optional project detail pages behind a feature flag (`PROJECT_DETAIL_PAGES_ENABLED`).
- Centralized design tokens for color, typography, spacing, and motion timing.
- Accessibility checks with serious/critical gating across desktop and iPhone-sized viewport.

## Project Structure

```text
.
├── src/
│   ├── components/
│   │   ├── intro/
│   │   ├── about/
│   │   ├── experience/
│   │   ├── projects/
│   │   └── JumpLinks.astro
│   ├── content/
│   │   ├── config.ts
│   │   └── projects/*.md
│   ├── config/features.ts
│   ├── layouts/Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── [project].astro
│   └── styles/
│       ├── tokens.css
│       ├── global.css
│       └── components/*.css
├── tests/
│   ├── unit/
│   ├── e2e/
│   └── a11y/
├── public/assets/
├── playwright.config.ts
├── vitest.config.ts
└── .github/workflows/release-ci.yml
```

## Prerequisites

- Node.js 24+ (CI uses Node 24)
- npm

## Getting Started

```sh
npm install
npm run dev
```

- Dev server: `http://localhost:4321`

## Build and Preview

```sh
npm run build
npm run preview
```

- Preview server defaults to `http://localhost:4321`.

## Scripts

### Development and Quality

- `npm run dev`: Run Astro dev server.
- `npm run build`: Build static site into `dist/`.
- `npm run preview`: Serve built site locally.
- `npm run check`: Run `astro check` (Astro + TypeScript diagnostics).
- `npm run lint`: ESLint with autofix.
- `npm run lint:check`: ESLint without autofix.
- `npm run format`: Prettier write mode.
- `npm run format:check`: Prettier check mode.

### Test Suites

- `npm run test:unit`: Run Vitest unit tests (`tests/unit`).
- `npm run test:e2e`: Run Playwright e2e tests on Chromium.
- `npm run test:a11y`: Run Playwright accessibility tests on Chromium.
- `npm run test`: Fast aggregate local suite (`check`, unit, e2e, a11y).
- `npm run test:cross-browser`: Full suite with e2e/a11y across Chromium + Firefox + WebKit.

### Release Gates

- `npm run release`: Local pre-commit quality gate (`lint`, `format`, `check`, `build`, `test`).
- `npm run release:ci`: CI gate (`lint:check`, `format:check`, `build`, `test:cross-browser`).

## Content Workflow

Projects are defined in markdown files under `src/content/projects/`.

Required frontmatter schema (`src/content/config.ts`):

- `title`
- `description`
- `details`
- `link` (URL)
- `icon` (asset path, usually `/assets/...`)

Current behavior:

- `PROJECT_DETAIL_PAGES_ENABLED` is set to `false` in `src/config/features.ts`.
- When disabled, project cards link directly to each project `link`.
- If enabled, Astro will generate static pages from `[project].astro` for each content slug.

## Styling System

- Global tokens: `src/styles/tokens.css`
- Base imports/layout primitives: `src/styles/global.css`
- Feature-level styles: `src/styles/components/*.css`

Recommendation:

- Add new colors, spacing, typography, and motion values in tokens first, then consume them in component styles.

## Testing Strategy

This repo uses layered tests:

- Unit (`tests/unit/content-integrity.test.ts`)
  - Validates project slugs/frontmatter/link/icon integrity.
  - Verifies asset references and catches dead files in `public/assets`.
- E2E (`tests/e2e/*.spec.ts`)
  - Route smoke checks and runtime health checks (console/page/request errors).
  - Jump-link interaction, active-state progression, deep-link refresh/back-forward behavior.
- Accessibility (`tests/a11y/core-routes.a11y.spec.ts`)
  - axe checks for core routes on desktop + iPhone-sized viewport.
  - Fails on serious/critical violations and unresolved incomplete findings.

Playwright artifacts should be kept under `playwright_output/`.

## CI

GitHub Actions workflow: `.github/workflows/release-ci.yml`

On pushes and pull requests to `master`, CI runs:

1. `npm ci`
2. `npx playwright install --with-deps`
3. `npm run release:ci`

## Deployment

This project is configured as a static site (`output: 'static'`) and can be deployed to static hosts.

Cloudflare Pages notes:

- Build output directory: `dist` (also defined in `wrangler.jsonc`).
- Use Pages commands for deployment (`wrangler pages ...`), not Workers deploy commands (`wrangler deploy`).

## License

All rights reserved. No license is granted for copying, modifying, or redistributing this source code.
