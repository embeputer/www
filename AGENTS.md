# AGENTS.md – Codebase documentation for AI agents

This file documents the structure and conventions of charlie's webcave (pupsite).

## Tech stack

- **Framework:** SvelteKit 2
- **Build:** Vite 5
- **Styling:** Plain CSS (`static/css/body.css`)
- **Content:** mdsvex for Markdown pages
- **Adapter:** @sveltejs/adapter-static (static site generation)
- **Icons:** Font Awesome 6

## Project structure

```
src/
├── app.d.ts           # SvelteKit app types
├── lib/
│   ├── index.ts       # Lib exports
│   └── utils/
│       └── blogEntries.ts   # Fetches and sorts blog posts from markdown
├── routes/
│   ├── +layout.svelte # Root layout: header, nav, footer
│   ├── +layout.ts    # Layout load (if any)
│   ├── +page.md      # Home page
│   ├── about/+page.md
│   ├── blog/
│   │   ├── +page.md      # Blog index
│   │   ├── +page.ts      # Loads posts via fetchMarkdownPosts()
│   │   ├── atom.xml/+server.ts
│   │   ├── rss.xml/+server.ts
│   │   └── entry/
│   │       ├── reader.svelte   # Layout for blog entries (mdsvex layout)
│   │       └── YYYYMMDD/+page.md   # Individual posts
│   ├── contact/+page.md
│   ├── donate/+page.md
│   ├── presence/+page.md
│   └── projects/+page.md
static/
├── css/body.css      # Global styles, CSS variables, .sr-only
└── (assets: images, etc.)
```

## Routing

- SvelteKit file-based routing
- `.md` files are processed by mdsvex
- Blog entries live at `src/routes/blog/entry/<date>/+page.md` with frontmatter: `title`, `date`, optionally `modified`
- `blogEntries.ts` uses `import.meta.glob` to discover posts and sorts by date descending

## Key conventions

- **Navbar:** Defined in `+layout.svelte`. Uses `$page.url.pathname` for active link styling (`.active` class)
- **Footer:** Site metadata, GitHub link (embeputer/www), last modified date
- **Mastodon rel="me":** Hidden link in `<svelte:head>` with `class="sr-only"` for verification
- **Assets:** Imported from `/assets/` (e.g. `picture.png`, `censor.gif`, `blahaj.png`)

## Styling

- CSS variables in `:root` for theming (light/dark via `prefers-color-scheme`)
- `.sr-only` for visually hidden content (e.g. Mastodon link)
- Responsive breakpoints at 810px and 450px

## Scripts

- `npm run dev` – dev server
- `npm run build` – static build
- `npm run preview` – preview build
- `npm run test` – Playwright tests
- `npm run check` – Svelte type check
- `npm run lint` / `npm run format` – Prettier + ESLint

## Domain

- Production: https://t480.dev
