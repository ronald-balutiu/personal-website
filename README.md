# Ronald Balutiu - Personal Website

Source for [ronaldbalutiu.com](https://ronaldbalutiu.com), a static portfolio built with Astro.

The homepage presents an introduction, About copy, an optimized portrait, social links, and a
temporary light/dark theme toggle. Project content and components are retained, but the project
section is currently hidden.

## Documentation

- [Architecture](docs/architecture.md): routes, content rendering, SEO, theme behavior, and styling.
- [AGENTS.md](AGENTS.md): repository-specific instructions for coding agents.

## Tech Stack

- Astro 7 with static output
- TypeScript with Astro's strict configuration
- Vanilla CSS with centralized design tokens
- Astro Content Collections for project content
- Vitest for unit tests
- Playwright and axe-core for browser and accessibility tests
- ESLint and Prettier for code quality
- GitHub Actions for continuous integration

## Prerequisites

- Node.js 24.x, matching CI
- npm

## Getting Started

Install the locked dependency versions and start the development server:

```sh
npm ci
npm run dev
```

The development server runs at `http://localhost:4321`.

## Build and Preview

```sh
npm run build
npm run preview
```

## Common Commands

| Command                      | Purpose                                                              |
| ---------------------------- | -------------------------------------------------------------------- |
| `npm run dev`                | Start the Astro development server.                                  |
| `npm run build`              | Build the static site into `dist/`.                                  |
| `npm run preview`            | Serve the production build locally.                                  |
| `npm run check`              | Run Astro and TypeScript diagnostics.                                |
| `npm run test:unit`          | Run Vitest unit tests.                                               |
| `npm run test:e2e`           | Run Chromium end-to-end tests.                                       |
| `npm run test:a11y`          | Run Chromium accessibility tests.                                    |
| `npm run test:browser`       | Run e2e and accessibility tests together on Chromium.                |
| `npm run test`               | Run the fast local verification suite.                               |
| `npm run test:cross-browser` | Run e2e and accessibility tests on Chromium, Firefox, and WebKit.    |
| `npm run lint`               | Run ESLint with autofix.                                             |
| `npm run lint:check`         | Run ESLint without modifying files.                                  |
| `npm run format`             | Format files with Prettier.                                          |
| `npm run format:check`       | Check formatting without modifying files.                            |
| `npm run release`            | Run the local quality gate; linting and formatting may modify files. |
| `npm run release:ci`         | Run the CI-equivalent quality gate.                                  |

Scripts in [`package.json`](package.json) are the source of truth. See [Testing](#testing) for
verification choices and browser setup.

## Content

- Edit introduction and About copy, social links, and the portrait reference in
  [`Intro.astro`](src/components/intro/Intro.astro).
- Edit default titles, descriptions, sharing metadata, and the production origin in
  [`site.ts`](src/config/site.ts). Astro's sitemap configuration uses this same origin.
- Edit light and dark palettes in [`theme.ts`](src/config/theme.ts). They supply both CSS color
  tokens and browser theme-color metadata; other design tokens live in `src/styles/tokens.css`.
- Add or edit project entries in [`src/content/projects/`](src/content/projects/). Use an existing
  entry as a starting point and follow the schema in [`src/content.config.ts`](src/content.config.ts).
  The [content model](docs/architecture.md#content-model) explains sorting and rendering.
- Project content edits do not enable the hidden section. Its `showProjects` flag lives in
  [`index.astro`](src/pages/index.astro); enabling it also requires updating tests that assert it is
  absent.

## Testing

Install Chromium before running local browser tests:

```sh
npx playwright install chromium
```

For the cross-browser suite, install all configured engines:

```sh
npx playwright install chromium firefox webkit
```

Repeat browser installation after upgrading Playwright. Linux environments may also need browser
system dependencies; CI installs them with `npx playwright install --with-deps`.

Choose verification by the change:

| Change                                    | Verification while iterating                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| SEO utilities                             | `npm run test:unit`                                                                        |
| Astro or TypeScript                       | `npm run check`                                                                            |
| Routes, layout, metadata, or theme        | `npm run test:e2e`                                                                         |
| Accessibility, colors, or semantic markup | `npm run test:a11y`                                                                        |
| Browser-specific behavior                 | `npm run test:cross-browser`                                                               |
| Documentation only                        | `npx prettier --check README.md AGENTS.md docs/architecture.md` and review links and facts |

Before committing executable changes, run `npm run release`. For documentation-only changes, the
Markdown checks above are sufficient. CI runs `npm run release:ci` for every PR, including
documentation changes. Both gates cover linting, formatting, type diagnostics, a production build,
and tests; the local gate uses Chromium, while CI also tests Firefox and WebKit. The local gate
autofixes lint and formatting issues, so review its resulting diff before committing.

Unit tests cover SEO resolution. Browser tests cover homepage rendering, resource and runtime errors,
metadata, responsive layout and motion, and theme behavior with and without JavaScript. Accessibility
tests reject serious and critical axe-core findings across desktop, tablet, and phone viewports in
both color schemes.

[`playwright.config.ts`](playwright.config.ts) builds and serves the production site on
`http://127.0.0.1:4173`. Stop any existing server at that address before testing: each invocation
starts a fresh build and refuses to reuse an existing server. Playwright artifacts use `test-results/`,
which is ignored by Git. Set `PLAYWRIGHT_WORKERS=1` when a constrained machine needs fewer workers.
Set `PLAYWRIGHT_PORT` to an unused port if a separate preview server is already running.

Each quality gate generates Astro's types before typed linting, runs type diagnostics and unit tests
once, then one Playwright invocation covers
both browser suites against one production build. Standalone `test:e2e` and `test:a11y` commands
also build before testing. Test commands fail when no tests are discovered.

## CI and Deployment

GitHub Actions runs [`.github/workflows/release-ci.yml`](.github/workflows/release-ci.yml) on pushes
and pull requests targeting `master`. The workflow installs dependencies with `npm ci`, installs
Playwright browsers, and runs `npm run release:ci`.

The site is configured for static deployment. Cloudflare Pages uses `dist/` as its build output
directory, as also specified in [`wrangler.jsonc`](wrangler.jsonc). Use Cloudflare Pages commands
for deployment rather than Workers deploy commands.

## Documentation Maintenance

Keep documentation changes in the same change as the code they describe:

- This README owns setup, commands, content editing, test coverage and execution, and deployment.
- [`docs/architecture.md`](docs/architecture.md) owns implementation structure and application behavior.
- [`AGENTS.md`](AGENTS.md) owns repository conventions, agent workflow, and verification expectations.

The executable configuration in `package.json`, CI workflow files, and source code remains the source
of truth. Keep details in their owning document and link to them elsewhere. Record historical
decisions separately if they need to survive implementation changes.

## License

All rights reserved. No license is granted for copying, modifying, or redistributing this source code.
