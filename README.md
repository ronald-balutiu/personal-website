# Personal Website

Personal website built with Astro and a lightweight, design-system CSS approach.

## Tech Stack

- Astro 5 (static site generation)
- ESLint + Prettier
- Vanilla CSS with design tokens

## Project Structure

```
/
├── astro.config.mjs
├── package.json
├── public/
│   └── assets/
└── src/
    ├── components/
    ├── content/
    │   └── projects/
    ├── layouts/
    ├── pages/
    └── styles/
```

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## Testing

```sh
# Type-check Astro files
npm run check

# Unit test runner
npm run test:unit

# Browser test runners (Chromium)
npm run test:e2e
npm run test:a11y

# Aggregate validation
npm run test
```

Install Playwright browsers once per machine:

```sh
npx playwright install chromium
```

## Content

Projects are managed through Astro content collections in `src/content/projects/`. Add a new project by creating a new Markdown file with frontmatter that matches the schema in `src/content/config.ts`.

## Styling

Styles live in `src/styles/`:
- `tokens.css` for design tokens (colors, spacing, typography)
- `global.css` for base styles and layout primitives
- `components/` for reusable component styles
