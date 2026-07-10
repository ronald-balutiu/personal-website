# Repository Instructions

## Scope

These instructions apply to work in this repository. Keep them concise, concrete, and specific to
this codebase.

## Start of Work

1. Run `git status`.
2. Read `README.md` and `docs/architecture.md`.
3. Use the canonical commands documented below and in `package.json`.

Before branch, rebase, push, pull request, or other remote Git work, run `git fetch --prune`.

## Documentation

- `package.json` defines the available commands.
- `.github/workflows/` defines CI behavior.
- `README.md` documents setup, common commands, content editing, testing, and deployment.
- `docs/architecture.md` documents the current technical design.
- Update the relevant documentation in the same change as the behavior it describes; do not record
  implementation detail in more than one document unless each document needs it for its own purpose.

## Project Conventions

- Keep the site statically generated with Astro unless a requirement explicitly changes that model.
- Preserve existing public features and UI options unless removal or renaming is explicitly requested.
- Treat `src/content.config.ts` as the source of truth for project and experience frontmatter.
- Put new design values in `src/styles/tokens.css` before consuming them in component styles.
- Keep components organized by feature under `src/components/` and styles colocated under
  `src/styles/components/`.
- Keep SEO behavior centralized in `src/lib/seo.ts` and `src/components/SEO.astro`.
- Prefer durable fixes over compatibility shims or temporary workarounds.
- Add or update tests when behavior changes, especially for content integrity, routes, navigation,
  runtime health, theme behavior, metadata, and accessibility.

## Commands

- `npm ci`: install the locked dependencies.
- `npm run dev`: start the local Astro server.
- `npm run check`: run Astro and TypeScript diagnostics.
- `npm run test:unit`: run unit tests.
- `npm run test:e2e`: run Chromium end-to-end tests.
- `npm run test:a11y`: run Chromium accessibility tests.
- `npm run test:cross-browser`: run e2e and accessibility tests across Chromium, Firefox, and WebKit.
- `npm run release`: run the local quality gate. It may modify files through linting and formatting.

Use the smallest relevant verification command while iterating, then run `npm run release` before
creating a commit. Never claim a check was run unless it actually completed.

## Formatting and Naming

- Follow the repository Prettier and ESLint configuration.
- Use PascalCase for Astro component filenames.
- Use kebab-case for CSS filenames and project content slugs.
- Prefer existing patterns over introducing new abstractions.

## Safety

- Do not invoke `rm` or `rmdir`; use `trash` for cleanup instead.
- If an npm package installation fails because of a network error, stop and report it rather than
  trying alternative installation approaches.
- Ask for explicit confirmation before schema or persistence changes, destructive refactors, or
  irreversible data operations.

## Git and Change Hygiene

- Keep changes focused and reviewable.
- Do not commit directly to protected `master`; use a feature branch for commits.
- Use signed Conventional Commits.
- Do not rewrite history or perform irreversible operations without explicit confirmation.
- Do not commit generated output such as `dist/`, `.astro/`, `node_modules/`, test results, or
  Playwright artifacts.
