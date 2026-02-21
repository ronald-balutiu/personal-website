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

## Start Every Session (“Get bearings”)
1. `git status`
2. Read `README.md` and `docs/architecture.md` (if present).
3. Discover the canonical build/test/lint entrypoints (see “Commands” below). If discovered, use them consistently.

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

## Coding Style & Naming Conventions
- Formatting is enforced by Prettier (`.prettierrc`): 2-space indentation, single quotes, no semicolons, max line width 100, trailing commas (`es5`).
- Linting uses ESLint with Astro + Prettier integration (`eslint.config.js`).
- Use PascalCase for Astro component filenames (example: `ProjectItem.astro`).
- Use kebab-case for CSS and content slugs (examples: `jump-links.css`, `personal-website.md`).
- Keep styles token-driven and colocated by concern (global vs component-level).

## Planning vs Implementation
### Small / Local Changes (single-file, obvious scope)
- Implement directly with a small, reviewable diff.
- Include how to verify (commands).

### Multi-file / Risky / Architectural Work
1. Present **1–3 options** with tradeoffs and risks.
2. Proceed with the best option unless the user must choose.
3. Work in small, reviewable steps; keep the repo in a clean state.

## Testing Guidelines
- No automated test framework is configured yet.
- Minimum pre-PR validation: run `npm run lint` and `npm run build` successfully.
- For UI changes, run `npm run dev` and manually verify desktop/mobile behavior for `/` and project routes (for example, `/personal-website`).

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
- PRs should include a short summary, affected files/routes, linked issue (if any), and screenshots for visual updates.
- Document manual QA steps in the PR description (commands executed and pages checked).

## Deliverable Format
- Prefer small, reviewable diffs over full-file dumps.
- Always include: **what changed**, **where**, **how to verify**.
- End with **1–3 sentences** summarizing what you changed (no extra commentary).
