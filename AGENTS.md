# Repository Instructions

## Scope

These instructions apply to work in this repository.

## Start of Work

1. Run `git status`.
2. Read `README.md` for setup and verification, and `docs/architecture.md` for implementation context.
3. Use the scripts in `package.json`; do not duplicate their steps manually.

Run `git fetch --prune` before the first branch or remote Git operation in a work phase. Reuse that
fetch for consecutive operations; fetch again before integrating or merging changes, or when remote
state may have changed.

## Documentation

- Follow the [documentation ownership](README.md#documentation-maintenance).
- Update the owning document in the same change as the behavior it describes. Link to executable
  configuration or another document instead of repeating its details.

## Project Conventions

- Keep the site statically generated with Astro unless a requirement explicitly changes that model.
- Preserve existing public features and UI options unless removal or renaming is explicitly requested.
- Treat `src/content.config.ts` as the source of truth for project frontmatter.
- Put palette values in `src/config/theme.ts` and other design values in `src/styles/tokens.css`
  before consuming their CSS tokens in component styles.
- Keep components organized by feature under `src/components/` and styles colocated under
  `src/styles/components/`.
- Keep SEO behavior centralized in `src/lib/seo.ts` and `src/components/SEO.astro`.
- Prefer durable fixes over compatibility shims or temporary workarounds.
- Add or update tests when behavior changes, especially for content integrity, routes, navigation,
  runtime health, theme behavior, metadata, and accessibility.

## Verification

- Use the smallest relevant command from [README Testing](README.md#testing) while iterating.
- Before committing application, dependency, configuration, or test changes, run `npm run release`.
  It may modify files through linting and formatting; inspect the resulting diff.
- For documentation-only changes, check the edited Markdown with Prettier, verify local links, and
  compare documented commands and behavior with the source. Application tests are unnecessary unless
  the change also affects executable files.
- A passing gate remains valid for the same file contents; do not rerun it solely to commit or push.
- Never claim a check passed unless it completed; report failures and checks that could not run.

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
