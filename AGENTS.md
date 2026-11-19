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
- Add a post with `npm run new-post` (see below). Do not hand-write the entry path or frontmatter.

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
- `npm run new-post` – write one blog entry locally. Does not commit or push.

## Writing a blog post

The entry layout (`reader.svelte`) already renders the title, publish date, and author. The markdown file is the post body, wrapped in frontmatter.

Create it with the script so the path and frontmatter match the other entries:

```
npm run new-post -- --title "post title" --date YYYY-MM-DD --body-file draft.md
```

A full draft piped on stdin works too. If that draft starts with frontmatter, `title`, `date`, and `modified` are used when the matching flag is omitted. The file lands at `src/routes/blog/entry/YYYYMMDD/+page.md`. One post per calendar day; pass `--force` only to replace that day's file. The index, atom feed, and RSS feed discover the file on their own. Do not commit or push unless the user asks.

## Domain

- Production: https://t480.dev

## Cursor Cloud

- Node.js 22 is already on the default image. Vite 8 needs `^20.19` or `>=22.12`.
- `npm ci` installs dependencies. `npm run dev -- --host 0.0.0.0 --port 5173` serves the site.
- `npm run test` is not defined. Use `npm run check` and `npm run build`. `npm run lint` currently fails on existing ESLint issues.
- Client hydration breaks if SvelteKit's dev server returns raw files for `/assets/*?import`. After `npm ci`, run `python3 scripts/patch-kit-static-import.py` before opening the dev server in a browser. The Cloud Agent install applies the same guard.
