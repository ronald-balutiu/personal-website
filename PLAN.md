# Dark Mode Implementation Plan

Status: approved and implemented locally; the feature branch is ready for user review.

## 1. Goal

Add a polished dark mode to the Astro website with:

1. A compact, accessible light/dark toggle in the upper-right corner.
2. Automatic detection of the visitor's operating-system preference.
3. A warm dark palette that still feels like the existing website.
4. No cookies, `localStorage`, `sessionStorage`, IndexedDB, or any other persistent preference.
5. No new npm packages.
6. Full coverage for the homepage and any project-detail routes.

## 2. Confirmed behavior

The implementation must follow this exact lifecycle:

1. On every document load, start with the current value of
   `window.matchMedia('(prefers-color-scheme: dark)')`.
2. Apply that theme before the browser paints the page, so the visitor does not see a flash of
   the wrong theme.
3. When the visitor clicks the toggle, apply the opposite theme to the current document only.
4. The manual choice is held only in JavaScript memory and the `<html>` element's
   `data-theme` attribute. Never write it to a browser storage API or cookie.
5. While a manual override is active, ignore operating-system changes for that document.
6. A second click switches between light and dark. Reloading or navigating to another full page
   resets to the operating-system preference.
7. If no manual override is active, an operating-system preference change updates the page live.
8. If JavaScript is disabled, the toggle is hidden and CSS alone follows the operating-system
   preference. The site must still render correctly.

This is intentionally a binary toggle. Do not add a three-option System/Light/Dark menu unless
that scope is separately approved. The reload behavior is the way to clear the temporary override.

## 3. Existing architecture to preserve

The implementation must fit these existing boundaries:

- `src/layouts/Layout.astro` owns the document `<html>`, `<head>`, `<body>`, footer, and shared
  page shell. Use it for the global bootstrap and shared toggle.
- `src/styles/tokens.css` is the source of truth for design tokens.
- `src/styles/global.css` imports the component stylesheets.
- Homepage sections live under `src/components/intro`, `about`, `experience`, and `projects`.
- `src/pages/index.astro` and `src/pages/[project].astro` use the shared layout.
- `src/config/site.ts`, `src/lib/seo.ts`, and `src/components/SEO.astro` own SEO metadata,
  including the browser `theme-color` metadata.
- The project is a static Astro site. Do not add a runtime server, client framework, or theme
  dependency.
- Existing Playwright and axe tests must remain useful and must be extended rather than replaced.

Before implementation, confirm that the worktree is clean and create a dedicated branch from
`origin/master`, for example `feat/dark-mode`.

## 4. Design and implementation rules

### 4.1 Use semantic color tokens

Do not add dark-mode overrides one component at a time with random hex values. Replace
color-named or hard-coded presentation values with semantic roles in `src/styles/tokens.css`.

Use names equivalent to these roles:

- `--color-background`: page background.
- `--color-surface`: cards and elevated content surfaces.
- `--color-text`: primary text and headings.
- `--color-text-muted`: secondary text and metadata.
- `--color-accent`: the brown/rose brand accent.
- `--color-accent-strong`: hover and active accent.
- `--color-accent-soft`: light accent surfaces and chips.
- `--color-accent-contrast`: text placed on accent backgrounds.
- `--color-primary`: blue action background.
- `--color-primary-hover`: blue action hover background.
- `--color-primary-text`: text on blue actions.
- `--color-border`: subtle borders and outlines.
- `--color-focus`: keyboard focus outline.
- `--color-shadow-soft` and `--color-shadow-strong`: elevation shadows.
- `--color-overlay-soft` and `--color-overlay-strong`: project-card overlays.
- `--color-transparent`: transparent value where a token is useful.

Keep the existing typography, spacing, layout, and motion tokens. Migrate every color usage in
the component CSS and project-detail page to the semantic names. In particular, eliminate the
hard-coded `#f4f4f4` project-card background.

Define the light theme in `:root`. Define the dark theme in `:root[data-theme='dark']`. Also add a
`@media (prefers-color-scheme: dark)` fallback for `:root:not([data-theme])` so the site works when
JavaScript is unavailable. Set `color-scheme: light` or `color-scheme: dark` in the same theme
rules.

Use a warm charcoal background and a lightened warm accent for dark mode. Do not simply invert
the page. Check every foreground/background pair with axe and manual inspection; adjust the
palette until normal text, headings, links, chips, borders, focus indicators, and buttons have
acceptable contrast.

Do not add a global `transition: all` for the theme. A theme change may be immediate. If a subtle
color transition is later added, it must be limited to the relevant properties and disabled under
`prefers-reduced-motion: reduce`.

### 4.2 Prevent a flash of the wrong theme

Add a small `is:inline` script as the first executable content in the `<head>` of
`src/layouts/Layout.astro`, immediately after the `SEO.astro` output and before font links and
other non-essential content. This ordering guarantees that the theme-color meta elements already
exist while the theme is still selected before the browser's first paint. The script must:

1. Read `window.matchMedia('(prefers-color-scheme: dark)').matches`.
2. Set `document.documentElement.dataset.theme` to either `dark` or `light`.
3. Set `document.documentElement.style.colorScheme` to the same value if needed for immediate
   browser-control styling.
4. Activate the matching theme-color meta element and deactivate the other one as described in
   section 4.5.

The script must not read or write cookies or storage. Keep it short, synchronous, and independent
of a network request. The CSS media-query fallback remains required even though this script runs
in normal browsers.

### 4.3 Add the toggle as a shared Astro component

Create `src/components/theme/ThemeToggle.astro` and a colocated stylesheet such as
`src/styles/components/theme-toggle.css`.

If the separate stylesheet is used, import it from `src/styles/global.css` alongside the other
component stylesheets. Alternatively, keep the toggle styles in a scoped `<style>` block inside
`ThemeToggle.astro`. Choose exactly one approach; do not create a stylesheet that is not imported
or otherwise applied.

Render the component once from `Layout.astro`, outside the page content so it is available on the
homepage and project routes. Position it in the upper-right corner with a stable, responsive
offset that respects mobile safe-area insets. A fixed or layout-level absolute position is fine;
do not let it change the document flow or introduce horizontal scrolling.

The control must:

- Be a real `<button type="button">`.
- Have at least a 44px by 44px pointer target.
- Have a visible `:focus-visible` outline using the focus token.
- Have an accessible name that describes the action, such as “Switch to dark mode” or “Switch to
  light mode”.
- Use `aria-pressed="true"` when dark mode is active and `false` when light mode is active.
- Use an inline SVG sun/moon icon with `currentColor`, not a network image.
- Preserve the existing understated brown/neutral visual language.
- Be hidden by default with the `hidden` attribute and revealed by the client script. This keeps
  a non-functional button out of the UI when JavaScript is disabled.

The component script must initialize its state from `document.documentElement.dataset.theme`,
update the data attribute, `colorScheme`, button label, and `aria-pressed`, and listen for
`matchMedia` `change` events. It must track a local `manualOverride` boolean in memory only.

Use the modern `MediaQueryList.addEventListener('change', ...)` API. If a compatibility fallback is
needed, keep it small and document why it is necessary; do not add a framework or polyfill.

### 4.4 Make fixed-color assets theme-aware

CSS `color` cannot recolor an SVG loaded through `<img>`. Audit every decorative asset used by
the page before declaring the dark theme complete:

- Social icons in `src/components/intro/Intro.astro`.
- The peace-sign icon in the intro heading.
- Project icons rendered by `src/components/projects/ProjectItem.astro`.
- Any icon or illustration used by the project-detail page.

For simple monochrome decorative icons, a carefully scoped CSS filter is acceptable if it is
visually verified in both themes. For the peace-sign icon and any multicolor asset, prefer an
inline SVG or a theme-specific source whose fill/stroke uses the semantic accent token. Do not
assume files with names such as `*-white.svg` are correct; inspect their actual fills first.

Keep decorative images `alt=""` and `aria-hidden="true"` where appropriate. Do not sacrifice
accessible names for social links while changing the visual asset.

### 4.5 Keep browser metadata synchronized

Update the site configuration and SEO types so light and dark browser UI colors are defined in one
place. A clear shape such as `themeColors: { light: string; dark: string }` is preferred over
scattered constants.

Update `src/components/SEO.astro` to emit exactly two theme-color meta elements:

```html
<meta
  id="theme-color-light"
  name="theme-color"
  content="..."
  media="(prefers-color-scheme: light)"
/>
<meta id="theme-color-dark" name="theme-color" content="..." media="(prefers-color-scheme: dark)" />
```

The exact formatting may follow the repository's Prettier output. When JavaScript is disabled,
the media attributes make the browser choose the correct UI color automatically. When JavaScript
is enabled, the bootstrap and toggle scripts must set the active element's `media` to `all` (or an
equivalent always-matching value) and the inactive element's `media` to `not all`. They must also
restore the original light/dark media queries whenever the active theme follows the operating
system. Do not add a third unqualified `theme-color` element, because that creates ambiguous
browser behavior.

Preserve all existing canonical, Open Graph, Twitter, and JSON-LD metadata behavior. Do not change
routes or content-collection behavior as part of the metadata work.

## 5. Required implementation order

Follow these steps in order. Do not skip verification steps or combine unrelated refactors.

### Step 1: Establish a safe baseline

1. Run `git fetch --prune`.
2. Run `git status` and confirm there are no unrelated changes.
3. Read `README.md` and this plan.
4. Create the feature branch from `origin/master` immediately after confirming the worktree is
   clean.
5. Run `npm run release` on that feature branch and record the baseline result. This ordering is
   required because the repository's release command runs formatting and lint autofixes that may
   modify files.

If the baseline release fails for an unrelated reason, stop and report it before changing theme
code.

### Step 2: Implement the token system

1. Edit `src/styles/tokens.css`.
2. Add the light semantic roles and the dark semantic roles.
3. Add the system-preference fallback and `color-scheme` declarations.
4. Update all CSS consumers under `src/styles/` and the inline project-detail styles in
   `src/pages/[project].astro`.
5. Replace the project-card hard-coded background and white overlay values with tokens.
6. Run `npm run check` and `npm run format:check`.

Do not move content collections, change routes, or alter unrelated layout behavior during this
step.

### Step 3: Implement initial detection and the toggle

1. Add the blocking bootstrap script to `src/layouts/Layout.astro`.
2. Add `ThemeToggle.astro` and its stylesheet.
3. Render the toggle once from `Layout.astro`.
4. Implement the in-memory manual override and system `change` listener.
5. Ensure no code calls `document.cookie`, `localStorage`, `sessionStorage`, IndexedDB, or a
   third-party preference service.
6. Update the theme-color meta element whenever the active theme changes.
7. Run `npm run check` and `npm run format:check` again.

### Step 4: Audit and update assets

1. Inspect the actual SVG `fill` and `stroke` values used by the homepage.
2. Make social/project icons readable in both themes using the least-complex correct approach.
3. Make the peace-sign accent readable in both themes without a blue or unintended inverted color.
4. Preserve current icon sizes, loading behavior, links, and animation timing.
5. Confirm that project-card icons remain visible on the dark surface.

### Step 5: Update metadata and documentation

1. Update `src/config/site.ts`, `src/lib/seo.ts`, and `src/components/SEO.astro` for the two
   theme colors.
2. Add a short “Theme behavior” section to `README.md` describing system detection, temporary
   overrides, the no-storage guarantee, and the no-JavaScript fallback.
3. Do not document a persistent preference because none will exist.

### Step 6: Add automated tests before final verification

Create `tests/e2e/theme-toggle.spec.ts` using Playwright. Use
`page.emulateMedia({ colorScheme: 'light' | 'dark' })` before navigation.

Cover all of these cases:

1. Light system preference loads the light theme.
2. Dark system preference loads the dark theme.
3. The toggle is visible with a correct accessible name and `aria-pressed` state.
4. Clicking the toggle changes `data-theme`, the accessible label, `aria-pressed`, computed page
   colors, and the theme-color meta content.
5. A second click switches back to the other explicit theme.
6. Changing the emulated system preference updates the page when no manual override is active.
7. Changing the emulated system preference does not replace an active manual override.
8. Reloading after a manual override returns to the emulated system preference.
9. Use a fresh browser context and an initialization spy/guard to count calls to
   `Storage.prototype.setItem` and cookie writes. Assert that no theme-related storage or cookie
   writes occur. Also assert that `document.cookie`, `localStorage`, and `sessionStorage` remain
   empty before and after toggling. If a browser prevents safe instrumentation of the cookie setter,
   retain the empty-state assertions and a targeted source search for forbidden storage APIs.
10. The toggle works with keyboard focus and does not cause horizontal overflow at the existing
    desktop and mobile viewports.

Add a separate no-JavaScript test case with `javaScriptEnabled: false`. Emulate both color schemes,
load the homepage, assert that the CSS media fallback produces the expected computed background
and text colors, and assert that the toggle remains hidden because it cannot function. This test is
required; do not assume the normal JavaScript-enabled tests prove the fallback works.

Extend `tests/a11y/core-routes.a11y.spec.ts` so axe runs against both light and dark themes on
the existing homepage and any enabled project routes. Call `page.emulateMedia({ colorScheme })`
before navigation and wait for the settled `html[data-theme]` value before running axe. Do not add
a color-contrast allowlist entry unless the issue is proven to be an axe false positive and the
reason is documented in the test.

If a pure, browser-independent theme resolver is introduced, add focused Vitest coverage for it.
Do not create tests for implementation details that the browser tests already cover.

### Step 7: Verify locally and review the diff

Run, in this order:

```bash
npm run check
npm run format:check
npm run lint:check
npm run test:unit
npm run test:cross-browser
npm run release
git diff --check
```

`npm run release` includes the Chromium checks and runs formatting/lint autofixes. Run it last,
then inspect `git diff` again so any formatter changes are intentional and included in the review.

Manually inspect the running site at least at:

- 1440 × 900 with light system preference.
- 1440 × 900 with dark system preference.
- 390 × 844 with light system preference.
- 390 × 844 with dark system preference.

Check the toggle, title, paragraph text, links, jump links, cards, chips, focus rings, footer,
project routes, page transitions/animations, external-link behavior, and browser UI color. Confirm
there is no first-paint flash, horizontal overflow, unreadable icon, or serious/critical axe
finding.

Before committing, inspect `git diff` and run a targeted search for accidental storage use and
remaining hard-coded presentation colors. Keep the diff limited to the theme feature and its
tests/documentation.

## 6. Git and local-commit requirements

1. Work only on the dedicated feature branch; do not push the branch or modify the remote
   repository during this task.
2. Run `npm run release` successfully immediately before committing.
3. Create signed commits using Conventional Commit wording.
4. Before finishing, squash the branch locally into one signed commit, as required by `AGENTS.md`.
5. Do not push, open a pull request, enable auto-merge, or merge anything. The user will inspect
   the local commit first; PR preparation can happen later as a separate step.

Do not rewrite history or force-push without explicit authorization. If the branch must be
rewritten to satisfy the one-commit rule, ask before doing so unless the user has already approved
that workflow for this task. The user has approved the local squash workflow for this task, but this
does not authorize pushing or other remote operations.

## 7. Definition of done

The feature is complete only when all of the following are true:

- System light/dark preference is detected on every page load.
- The toggle is present, styled consistently, keyboard accessible, and at least 44px target size.
- The toggle changes the current document without writing any persistent preference.
- Reloading resets to the system preference.
- CSS works without JavaScript.
- All page content, cards, controls, links, focus indicators, icons, and metadata match the active
  theme.
- Light and dark axe checks have no new serious or critical findings.
- Unit, end-to-end, accessibility, cross-browser, and release checks pass.
- The final diff contains no unrelated changes.
- The feature branch contains exactly one signed squashed commit with the verification performed
  documented in the implementation handoff; no PR has been opened or remote branch changed.
