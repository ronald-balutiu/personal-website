# Ronald Balutiu - Personal Website

Source for [ronaldbalutiu.com](https://ronaldbalutiu.com), a static portfolio built with Astro.

The site presents Intro, About, Experience, and Projects sections. Project and experience entries
are managed as Markdown content, while shared design tokens keep the visual system consistent.

## Documentation

- [Architecture](docs/architecture.md): routes, content schema, SEO, theme behavior, styling, testing, and deployment.
- [AGENTS.md](AGENTS.md): repository-specific instructions for coding agents.

## Highlights

- Section-based homepage with sticky jump-link navigation.
- Markdown-backed project and experience content via Astro Content Collections.
- Optional project detail pages controlled by a build-time toggle.
- Shared SEO metadata utilities and JSON-LD support.
- System light/dark theme support with a temporary in-memory toggle.
- Unit, end-to-end, and accessibility testing in local and CI pipelines.

## Tech Stack

- Astro 5 with static output
- TypeScript with Astro's strict configuration
- Vanilla CSS with centralized design tokens
- Astro Content Collections for project and experience content
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
| `npm run test`               | Run the fast local verification suite.                               |
| `npm run test:cross-browser` | Run e2e and accessibility tests on Chromium, Firefox, and WebKit.    |
| `npm run lint`               | Run ESLint with autofix.                                             |
| `npm run lint:check`         | Run ESLint without modifying files.                                  |
| `npm run format`             | Format files with Prettier.                                          |
| `npm run format:check`       | Check formatting without modifying files.                            |
| `npm run release`            | Run the local quality gate; linting and formatting may modify files. |
| `npm run release:ci`         | Run the CI-equivalent quality gate.                                  |
| `npm run clean`              | Remove the generated Astro cache.                                    |

Use `npm run release` before committing. CI uses `npm run release:ci`, which also runs the full
cross-browser test suite.

## Content

Project entries live in [`src/content/projects/`](src/content/projects/), and experience entries live
in [`src/content/experience/`](src/content/experience/). Both collections are validated by
[`src/content.config.ts`](src/content.config.ts). See the [architecture documentation](docs/architecture.md#content-model)
for their schemas and the project-detail route behavior.

## Testing

The repository runs unit, end-to-end, accessibility, and cross-browser tests. Playwright output is
written to `playwright_output/`, which is ignored by Git. See the
[architecture documentation](docs/architecture.md#verification) for coverage details.

## CI and Deployment

GitHub Actions runs [`.github/workflows/release-ci.yml`](.github/workflows/release-ci.yml) on pushes
and pull requests targeting `master`. The workflow installs dependencies with `npm ci`, installs
Playwright browsers, and runs `npm run release:ci`.

The site is configured for static deployment. Cloudflare Pages uses `dist/` as its build output
directory, as also specified in [`wrangler.jsonc`](wrangler.jsonc). Use Cloudflare Pages commands
for deployment rather than Workers deploy commands.

## Documentation Maintenance

Keep documentation changes in the same change as the code they describe:

- Update this README when setup, commands, content editing, testing, or deployment changes.
- Update [`docs/architecture.md`](docs/architecture.md) when the application's implementation or
  behavior changes.
- Update [`AGENTS.md`](AGENTS.md) only when repository conventions or verification expectations change.

The executable configuration in `package.json`, CI workflow files, and source code remains the source
of truth; documentation should explain and link to it rather than duplicate implementation details.

## License

All rights reserved. No license is granted for copying, modifying, or redistributing this source code.
