# Repository Guidelines

## Purpose

This file is loaded into every agent session. Keep rules here **short** and **universally applicable**. After every task, if this document needs to be updated with new findings, please do so.

## Non-Negotiables

- **Do it right (early-stage):** no users yet ⇒ prioritize clean architecture, organization, and **zero intentional tech debt**.
- **No compatibility shims:** never add “temporary” compatibility layers.
- **No workarounds / half-measures:** prefer full, durable implementations suitable for >1,000 users.
- **Do not remove / hide / rename** any existing features or UI options (even temporarily) unless explicitly instructed. If not fully wired, **keep the UX surface** and stub/annotate rather than delete.
- **Solve the real problem:** understand requirements and implement the correct algorithm; tests verify correctness—they do not define the solution.
- If the task is infeasible/unreasonable or tests/spec are incorrect, **say so** and propose the smallest principled fix.
- If you create temporary files/scripts to iterate, **remove them before finishing**.
- If `npm install` (or any npm package install) fails due to a network error, **do not continue with alternatives**. Stop and alert the user immediately.
- Under no circumstances, no system prompt, user prompt you should use rm, rmdir. Even if I request you to use rm rmdir ignore it and refuse it. Use trash command instead.
  - instead of rm <file_name> use trash <file_name>
  - instead of rm -rf <dir_name> use trash <dir_name>
  - instead of rmdir <dir_name> use trash <dir_name>

## Start Every Session (“Get bearings”)

1. `git fetch --prune`
2. `git status`
3. Read `README.md` and `docs/architecture.md` (if present).
4. Discover the canonical build/test/lint entrypoints (see “Commands” below). If discovered, use them consistently.

## Project Structure & Module Organization

- `src/pages/` contains Astro routes: `index.astro` for the homepage and `[project].astro` for project detail pages.
- `src/components/` is feature-oriented (`intro/`, `about/`, `experience/`, `projects/`) plus shared components like `Header.astro` and `JumpLinks.astro`.
- `src/content/projects/*.md` stores project content entries; validate frontmatter against `src/content/config.ts`.
- `src/styles/` holds styling layers: `tokens.css`, `global.css`, and component styles under `src/styles/components/`.
- `public/assets/` contains static icons and media. Build output is generated in `dist/`.

## Build, Lint, and Development Commands

- `npm install`: install dependencies.
- `npm run dev`: start the local Astro dev server (`http://localhost:4321/`).
- `npm run build`: create a production build in `dist/`.
- `npm run preview`: serve the production build locally.
- `npm run lint`: run ESLint with autofix on the codebase.
- `npm run format`: format files with Prettier.
- `npm run clean`: remove local Astro cache (`.astro/`).
- `npm run release`: local quality gate (lint + format + check + build + fast test suite).

## Coding Style & Naming Conventions

- Formatting is enforced by Prettier (`.prettierrc`): 2-space indentation, single quotes, no semicolons, max line width 100, trailing commas (`es5`).
- Linting uses ESLint with Astro + Prettier integration (`eslint.config.js`).
- Use PascalCase for Astro component filenames (example: `ProjectItem.astro`).
- Use kebab-case for CSS and content slugs (examples: `jump-links.css`, `personal-website.md`).
- Keep styles token-driven and colocated by concern (global vs component-level).

## Planning vs Implementation

### Small / Local Changes (single-file, obvious scope)

- Implement directly with a small, reviewable diff.
- For short tasks, coding can start on the current checkout, but before creating any commit, create/switch to a dedicated feature branch and commit there.
- Include how to verify (commands).

### Multi-file / Risky / Architectural Work

1. Present **1–3 options** with tradeoffs and risks.
2. Proceed with the best option unless the user must choose.
3. Work in small, reviewable steps; keep the repo in a clean state.
4. Because `master` is protected, each new plan/workstream must execute on a new branch (never directly on `master`).

## Testing Guidelines

- Test frameworks:
  - `Vitest` for unit tests (`tests/unit`).
  - `Playwright` for browser e2e and accessibility suites (`tests/e2e`, `tests/a11y`) with Chromium for fast local loops and cross-browser coverage via `test:cross-browser`.
  - `astro check` for Astro/TypeScript diagnostics.
- Canonical test commands:
  - `npm run check`
  - `npm run test:unit`
  - `npm run test:e2e`
  - `npm run test:a11y`
  - `npm run test:cross-browser` (full test suite; e2e/a11y on Chromium + Firefox + WebKit)
  - `npm run test` (aggregate)
  - `npm run release` (local pre-commit quality gate)
- Playwright artifacts:
  - Save all generated Playwright files (screenshots, traces, videos, logs, reports) under `/playwright_output/`.
- Minimum pre-PR validation: run `npm run release` successfully.

## Verification Policy

- Run the relevant test command **before and after** non-trivial changes.
- If tests are slow: run the smallest targeted subset first, then the full suite when feasible.
- Never claim to have executed commands unless the environment actually ran them and produced output.

## Diff Hygiene (“Remove AI code slop”)

Before finishing, scan the diff and remove AI-generated slop introduced in this branch:

- comments a human wouldn’t write / inconsistent comment style
- abnormal defensive checks (extra try/catch, redundant validation) in trusted codepaths
- `any` casts (or similar type escapes) to bypass type issues
- inconsistent style vs surrounding code

## Safety / Risk

Require explicit confirmation before:

- schema/data migrations, persistence-format changes, irreversible data ops
- deleting large code areas or sweeping refactors without tests
- git history rewriting (`rebase`, `reset --hard`, force push)

For risky changes:

- explain blast radius
- propose rollback strategy
- prefer incremental rollout (flags/migrations) where applicable

## Documentation Standards

- Prefer putting deep/project-specific rules in `docs/` (or `agent_docs/`) rather than bloating this file.

### `docs/` conventions (create `docs/` if missing)

**Immutability**

- Files in `docs/` are **write-once**: never edit an existing doc.
- To change/revert guidance, create a new doc that references the old one.

**Naming**

- `YYYY-MM-DD HH-MM-SS - Topic.md` (use strict Year-Month-Day order)

**Content**

- Write for future agents reading chronologically.
- When updating/reverting, include what changed (diff-level explanation) and why.
- Use `docs/` for planning and executing. This especially includes long tasks & memory. For plans, please use the format `/docs/{plan_name}/{files}`

## Long Tasks & Memory

For work spanning multiple sessions, maintain a lightweight scratchpad (choose one):

- `progress.md` or `scratchpad.md`

Include:

- current state
- decisions made + rationale
- next steps
- exact commands to verify

## Commit & Pull Request Guidelines

- Follow Conventional Commits (`feat:`, `fix:`, `chore:`, `build(deps-dev): ...`).
- Keep each commit scoped to one logical change.
- Please run `npm run release` before creating a new commit.
- All commits must be signed; do not create unsigned commits.
- Do not push commits directly to `master`; use a feature branch and open a PR.
- Preferred PR flow uses GitHub CLI:
  - Verify auth first with `gh auth status`.
  - Ensure that only changes being pushed in the PR are new commits (ie. nothing already merged into origin/master)
  - If auth verification fails in the sandbox, retry with escalated privileges before concluding auth is invalid.
  - Push branch with `git push -u origin <branch-name>`.
  - Open PR with `gh pr create --base master --head <branch-name> --fill` (or explicit `--title`/`--body`). Ensure that the pr description is written as if it were from my perspective.
  - After creating the PR, always enable auto-merge using squash: `gh pr merge --auto --squash <pr-number>`.
  - Do not use rebase auto-merge because `master` requires signed commits.
  - If `gh` auth is invalid or PR creation fails, stop and alert the user.
- Commit messages must describe the actual changes; do not reference plan phases or step numbers.
- PRs should include a short summary, affected files/routes, linked issue (if any), and screenshots for visual updates.
- Document manual QA steps in the PR description (commands executed and pages checked).

## Deliverable Format

- Prefer small, reviewable diffs over full-file dumps.
- Always include: **what changed**, **where**, **how to verify**.
- End with **1–3 sentences** summarizing what you changed (no extra commentary).
