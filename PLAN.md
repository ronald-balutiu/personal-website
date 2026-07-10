# Responsive Homepage Redesign Plan

## Objective

Rebuild the homepage as a compact, responsive landing page based on the supplied phone, tablet, and
desktop mocks. The redesigned homepage will contain two primary sections:

1. A hero containing the greeting, approved About copy, social links, peace-hand SVG, and portrait.
2. A simple project list using the existing project content and SVG icons.

The desktop layout will use two columns, while tablet and phone layouts will place the portrait below
the introduction. All four current About paragraphs will remain: the first paragraph stays with the
introductory copy, and the other three move responsively around the portrait as described below. The
existing color tokens, dark-mode behavior, social SVGs, peace SVG, project SVGs, SEO infrastructure,
and static Astro runtime model must remain intact.

No broad folder reorganization is required.

## Locked Requirements

- Do not change any current light- or dark-theme color values.
- Continue using the current social, peace-hand, and project SVGs where applicable.
- Preserve all four current About paragraphs. Keep the first paragraph in the primary introduction
  and render the remaining three as a secondary About-details block.
- On desktop, place the secondary About-details block below the four social links in the left column.
- On tablet and phone, place the portrait after the social links and the secondary About-details block
  immediately below the portrait.
- Use the full-name greeting `Hello, I'm Ronald Balutiu.` while preserving the current name treatment:
  `Ronald` is filled and `Balutiu` is outlined.
- Preserve the current DM Sans font throughout the redesigned homepage.
- Preserve the existing project titles and descriptions from project Markdown.
- Use `/Users/rbalutiu/Desktop/cropped.jpg` as the portrait source.
- Treat the three supplied mocks as the visual reference for responsive structure, proportions,
  hierarchy, and overall feel. The implementation should closely resemble them without requiring
  pixel-for-pixel reproduction.
- Remove the Experience section because it is no longer needed.
- Replace the current full-viewport intro with the compact layout shown in the mocks.
- On entry, fade in the homepage content and then run the peace-hand's current tilt movement.
- Preserve Astro's static-output model and avoid unnecessary client-side JavaScript.
- Keep the resulting component, content, style, test, and documentation structure clear and maintainable.

## Responsive Layout Specification

| Viewport                     | Hero                                               | Social links                          | Photo and remaining About copy                                                                      | Projects                                                    |
| ---------------------------- | -------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Phone, below roughly `640px` | Single column and left-aligned                     | 2x2 grid with visible labels          | Landscape photo, approximately `16 / 10`, followed immediately by About paragraphs 2-4              | Icon on the left; title, description, and link on the right |
| Tablet, `640px-1023px`       | Single centered column                             | One horizontal row                    | Full-width landscape photo, approximately `16 / 9`, followed immediately by About paragraphs 2-4    | Icon, copy, and GitHub link in three columns                |
| Desktop, `1024px+`           | Primary copy on the left and portrait on the right | One horizontal row in the left column | Portrait, approximately `3 / 4`; About paragraphs 2-4 sit below the social links in the left column | Full-width rows below the complete hero                     |

Use content-driven breakpoints rather than device detection. Validate the implementation against the
mock dimensions of 607x1280, 853x1280, and 1280x853.

## Source Assets and Visual References

The source portrait is:

- `/Users/rbalutiu/Desktop/cropped.jpg`
- JPEG, 1658x2210 pixels

During implementation, copy this source into `src/assets/images/` with a descriptive, kebab-case
filename and process it through Astro's image pipeline. Do not reference the Desktop path from the
site at runtime. Preserve the face as the primary focal point when producing portrait and landscape
crops.

The three mock images are stored locally at:

- `/Users/rbalutiu/Desktop/personal-website-redesign-references/phone-reference.jpg`
- `/Users/rbalutiu/Desktop/personal-website-redesign-references/tablet-reference.jpg`
- `/Users/rbalutiu/Desktop/personal-website-redesign-references/desktop-reference.jpg`

These files are design references, not assets to ship with the website. Use them throughout
implementation and verification to judge layout order, alignment, relative sizing, spacing, image
orientation, project-row structure, and responsive transitions. The goal is a clear visual match to
their design direction while retaining the site's approved content, colors, SVGs, font, accessibility,
and Astro implementation conventions.

## Implementation Plan

### 1. Establish the implementation baseline

Before editing:

1. Run `git fetch --prune`.
2. Create a feature branch from `master`; do not commit directly to protected `master`.
3. Run `npm run check` and `npm run test:unit` to establish the baseline.
4. Do not install a new package. Astro and the existing CSS architecture are sufficient.

### 2. Simplify the homepage composition

Update `src/pages/index.astro`:

- Remove the `About`, `Experience`, and `JumpLinks` imports and instances.
- Remove the `balancedRails` layout option.
- Render only the redesigned `Intro` and `Projects` components inside a shared, constrained homepage
  wrapper.
- Retain the current `WebSite` and `Person` JSON-LD.
- Preserve static rendering; do not add a framework component or hydrated island.

Target composition:

```astro
<Layout ...>
  <div class="home-page">
    <Intro />
    <Projects />
  </div>
</Layout>
```

### 3. Redesign the hero component

Update `src/components/intro/Intro.astro` so it owns the complete hero:

- Use one semantic `<section>` containing:
  - the peace-hand SVG;
  - one `<h1>` with the greeting `Hello, I'm Ronald Balutiu.`;
  - the first paragraph of the current About copy;
  - a `<nav aria-label="Social links">`;
  - the portrait; and
  - a secondary About-details block containing the current second, third, and fourth paragraphs.
- Keep the current social URLs and SVG files.
- Add visible text labels beside each social icon, matching the mocks.
- Keep social icons decorative with `alt=""`; the visible label supplies the accessible name.
- Only HTTP links should open in a new tab. The email link should remain a normal `mailto:` link.
- Keep the peace SVG implemented as a CSS mask so it inherits the existing accent color in both themes.
- Do not inline duplicate SVG markup.
- Preserve the current split name styling in the heading: render `Ronald` with the filled accent style
  and `Balutiu` with the outlined accent style. Render `Hello, I'm` with the filled accent treatment
  so the greeting reads naturally. Keep the greeting as one continuous `<h1>` for assistive
  technology.
- Place the decorative, `aria-hidden` peace-hand mask before the greeting text, following the mocks.
  Keep it within the heading layout so it scales and wraps with the title without creating a second
  heading or duplicate accessible text.
- Use a DOM order of primary introduction, portrait, secondary About details. Keep the social nav
  inside the primary introduction after the first paragraph. This source order matches tablet and
  phone; desktop CSS Grid will place the secondary details below the social nav in the left column
  without duplicating content or changing DOM order with JavaScript.

Target semantic structure:

```astro
<section class="intro" aria-labelledby="intro-title">
  <div class="intro-primary">
    <h1 id="intro-title">...</h1>
    <p class="intro-description">About paragraph 1</p>
    <nav class="intro-social-links" aria-label="Social links">...</nav>
  </div>
  <figure class="intro-portrait">...</figure>
  <div class="intro-about-details">
    <p>About paragraph 2</p>
    <p>About paragraph 3</p>
    <p>About paragraph 4</p>
  </div>
</section>
```

For the portrait:

- Copy `/Users/rbalutiu/Desktop/cropped.jpg` into `src/assets/images/`, not `public/`, using a
  descriptive kebab-case filename.
- Import it and render it with Astro's `Image` component from `astro:assets`.
- Provide explicit responsive widths and a correct `sizes` attribute.
- Give it meaningful alt text, such as `Portrait of Ronald Balutiu`.
- Use `loading="eager"` and `fetchpriority="high"` because the portrait is above the fold.
- Reset the portrait wrapper's default margin, frame it with an existing border token, and hide crop
  overflow. Make the generated image a block element that fills the wrapper.
- Control the crop with `aspect-ratio`, `object-fit: cover`, and a face-centered `object-position`.
- Use a portrait crop on desktop and a landscape crop on tablet and phone.
- First try one optimized source with responsive wrapper ratios and `object-position`. If that cannot
  preserve the face cleanly in both orientations, create separate portrait and landscape crop assets
  from the supplied source and use a native `<picture>` with media-specific sources. Never stretch
  the image to achieve a target ratio.

### 4. Migrate the About content

Move all four paragraphs from `src/components/about/About.astro` into the hero.

- Preserve every paragraph verbatim unless a copy change is explicitly approved.
- Keep the first paragraph in `.intro-primary`, between the heading and social nav.
- Put paragraphs 2-4, in their current order, inside `.intro-about-details`.
- Preserve strong emphasis around company and university names.
- Preserve the Seller Wallet external link and its external-link safety attributes.
- Preserve correct paragraph semantics and do not merge the paragraphs into one text node.
- Do not retain a separate `About` heading; the mock treats this content as the introduction beneath
  the main heading.

After migration, delete:

- `src/components/about/About.astro`
- `src/styles/components/about.css`

### 5. Implement the hero layout

Rewrite `src/styles/components/intro.css`:

- Remove the current `100svh` centered splash-screen behavior.
- Keep the hero in normal document flow so Projects follow the complete hero without an artificial
  full-viewport spacer.
- Avoid absolute positioning for the main content.

Desktop behavior:

- Use CSS Grid with named areas and a flexible left column plus a roughly `18rem-22rem` portrait
  column.
- Assign `.intro-primary` and `.intro-about-details` to the left column, with the details immediately
  below the social links. Assign `.intro-portrait` to the right column.
- Use grid areas equivalent to `primary portrait` followed by `details portrait`; allow the portrait
  to span both rows.
- Use a generous but bounded column gap.
- Keep the social nav visually attached to the first paragraph and use a smaller vertical gap before
  the secondary About details than the gap before the Projects section.
- Keep the image ratio near `3 / 4`.
- Let the hero's height be determined by the taller of the portrait or complete left-column copy so
  Projects never overlap either one.

Tablet behavior:

- Switch to one column.
- Center the heading and social row.
- Keep paragraph text left-aligned for readability.
- Place the landscape image after the social links.
- Place `.intro-about-details` immediately below the image, before Projects.

Phone behavior:

- Left-align the heading.
- Use a two-column social grid.
- Allow labels to wrap safely without horizontal overflow.
- Use a full-width landscape image.
- Place `.intro-about-details` immediately below the image, before Projects.

The layout must remain stable with longer project names, browser font changes, and user text scaling.

### 6. Preserve colors and refine tokens

Update `src/styles/tokens.css` only to add reusable layout, typography, and motion values.

Do not change existing light- or dark-theme values for:

- backgrounds or surfaces;
- text or muted text;
- accents;
- borders or focus colors;
- icon filters;
- shadows; or
- browser theme colors.

Potential additions include:

- a homepage maximum width around `70rem-72rem`;
- mobile and desktop inline padding;
- a hero grid gap;
- portrait widths and aspect ratios;
- project icon column widths;
- responsive font-size values needed by the new heading; and
- consolidated entrance-animation timing.

Retain the existing DM Sans family for body content, the greeting, and the project-section heading.
Do not add or load another font for this redesign.

### 7. Rebuild the project section as rows

Update `src/components/projects/Projects.astro`:

- Change the heading to `A couple things I've made` using the final approved apostrophe style.
- Keep `getCollection('projects')` and sort entries by `order`.
- Keep project Markdown as the source of truth.
- Continue respecting `PROJECT_DETAIL_PAGES_ENABLED`.
- Render a semantic list or sequence of project articles rather than a card grid.

Update `src/components/projects/ProjectItem.astro`:

- Replace the whole-card anchor with an `<article>` containing:
  - the decorative project icon;
  - an `<h3>` title;
  - the description; and
  - an explicit `GitHub` or `View project` link with an external-link indicator.
- Keep `/assets/laptop.svg` and `/assets/sudoku.svg`.
- Keep the icon `alt=""` because the adjacent heading names the project.
- Preserve external-link safety attributes on HTTP links.
- Give the explicit link a clear focus state.

Rewrite `src/styles/components/projects.css`:

- Remove card backgrounds, rounded corners, shadows, lift-on-hover effects, and the auto-fit card grid.
- Separate project rows with existing border or accent-line tokens.
- On desktop and tablet, use an `icon | copy | link` grid.
- On phone, use `icon | copy`, with the link below the description in the copy column.
- Constrain icon dimensions while preserving their intrinsic aspect ratios.
- Ensure long titles and descriptions wrap without pushing links beyond the viewport.

Keep the optional project detail route and its feature flag unchanged; they are separate from the
homepage presentation.

### 8. Consolidate the entrance animation

Implement this CSS-driven sequence:

1. The name, all four About paragraphs, social links, portrait, and projects fade in together with a
   subtle upward translation.
2. When the fade finishes, the peace hand performs its current movement, approximately
   `12deg -> 24deg -> 12deg`.
3. The hand remains at its final resting angle.

Implementation details:

- Apply the shared fade to the homepage wrapper instead of assigning separate delays to each element.
- Keep the hand movement as a separate animation whose delay equals the fade duration.
- Align the theme-toggle fade timing with the homepage entrance so it does not appear much later.
- Do not add JavaScript solely for animation.
- Under `prefers-reduced-motion: reduce`, show all content immediately and disable the hand movement
  and translation.
- Remove the `intro-enter-immediate` behavior currently coupled to `JumpLinks`.

### 9. Simplify the shared layout and footer

Update `src/layouts/Layout.astro`:

- Remove `balancedRails`, the left and right rail slots, and rail-specific markup because the homepage
  is their only consumer.
- Keep SEO, theme initialization, the static `<main>`, the theme toggle, and the dynamic copyright year.
- Add a constrained footer inner wrapper so the copyright aligns with homepage content rather than
  being centered.
- Preserve the current theme toggle and its non-persistent manual override.

Update `src/styles/global.css`:

- Remove imports for About, Experience, and JumpLinks styles.
- Remove the page-rail rules.
- Add the shared homepage-container and footer-alignment rules.
- Keep global focus, link, reduced-motion, and theme behavior.

### 10. Remove Experience completely

Remove the dead implementation rather than hiding it:

- Delete `src/components/experience/Experience.astro`.
- Delete `src/styles/components/experience.css`.
- Delete `src/content/experience/` and its Markdown entries.
- Remove the `experience` collection from `src/content.config.ts`.
- Export only the `projects` collection.

This prevents unused content from continuing to be validated and loaded at build time.

### 11. Remove obsolete jump navigation

Delete:

- `src/components/JumpLinks.astro`
- `src/styles/components/jump-links.css`
- `tests/e2e/jump-links-interaction.spec.ts`

A single consolidated hero and project list do not need sticky numbered navigation, and removing it
also removes unnecessary client-side JavaScript.

### 12. Keep SEO synchronized

Update `src/config/site.ts` only where visible content changes require it:

- Make `defaultDescription` agree with the final introductory copy.
- Keep `public/assets/og-default.png` and its existing image-specific alt text unchanged in this
  redesign. Updating the social-preview artwork is outside this implementation unless separately
  requested.
- Do not change theme-color values.

The existing SEO component and metadata utility do not need structural changes. Update any exact
SEO unit-test expectation affected by the new default description.

### 13. Update documentation

Update:

- `README.md` to describe the hero-and-project homepage and project-only content collection.
- `docs/architecture.md` to remove rails, jump links, separate About and Experience sections, and the
  experience collection.
- `AGENTS.md` so its content-schema convention refers only to project frontmatter.
- The README's stale `Astro 5` reference so it matches the installed Astro 7 version.

### 14. Update and add tests

Revise the homepage route smoke test to assert:

- the approved greeting is the only homepage `<h1>`;
- all four current About paragraphs are present exactly once and in semantic paragraph elements;
- the projects heading is present;
- social links have visible labels and correct destinations;
- no About or Experience section headings remain; and
- project rows and explicit external links are present.

Add responsive homepage tests at desktop, tablet, and phone widths using relative layout assertions:

- The desktop portrait is to the right of the introduction.
- On desktop, the secondary About-details block is in the left column below the social nav.
- Tablet and phone portraits are below the introduction and wider than tall.
- On tablet and phone, the secondary About-details block is below the portrait and above Projects.
- Phone social links form two rows.
- Desktop and tablet project links occupy the final column.
- Phone project links sit below their descriptions.
- No viewport has horizontal overflow.

Add motion coverage:

- Normal motion exposes both the homepage fade and hand-tilt animations.
- Reduced-motion mode renders the homepage immediately with no animation.

Extend accessibility coverage to include a tablet viewport and retain light- and dark-theme checks.
In `tests/a11y/core-routes.a11y.spec.ts`, remove the obsolete `#about-title` incomplete-result
allowlist entry and update project selectors only if their class names change. Do not add new
allowlist entries to mask regressions. Keep the existing metadata, theme-toggle, content-integrity,
and optional project-route tests.

### 15. Verification and acceptance

During implementation:

1. Run `npm run check` after component and schema changes.
2. Run `npm run test:unit` after content and asset changes.
3. Run the focused homepage, theme, and accessibility Playwright tests.
4. Capture local screenshots at the three mock dimensions and compare them side by side with the
   Desktop reference images.
5. Verify light and dark themes separately.
6. Run `npm run release` before committing. Remember that this command may format or lint files.

The screenshot comparison is directional rather than pixel-perfect. Confirm that the implementation
matches the references in composition, responsive ordering, alignment, spacing rhythm, relative
scale, and overall visual character. Differences are acceptable when required by the approved copy,
existing SVG proportions, DM Sans typography, accessibility, or robust responsive behavior.

The redesign is complete when:

- Existing color values are unchanged.
- Existing social, peace-hand, and project SVGs remain in use.
- The real portrait is optimized through Astro.
- All four About paragraphs are preserved, with responsive ordering matching this plan.
- Experience, the separate About section, rails, and jump-link dead code are gone.
- The three responsive structures match the mocks.
- Entrance motion follows the fade-then-hand sequence.
- Reduced-motion users receive an immediate, static page.
- Keyboard focus, external-link behavior, and semantic headings remain accessible.
- `npm run release` completes successfully.

## Resolved Inputs

All planning inputs are resolved. The implementation should use the Desktop portrait and mock
references documented above.
