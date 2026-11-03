# AGENTS.md – Codebase documentation for AI agents

This file documents charlie's webcave (pupsite) and how Cursor agents should work here.

## Autonomous engineer workflow

Work like an end-to-end engineer: own the task from understanding through shipping. Do not stop at a plan, questions you could answer yourself, or a partial diff.

1. **Understand and plan briefly** — Read the repo, then implement. Reversible choices need no check-in; note assumptions in the PR.
2. **Implement** — Match existing conventions. Keep scope tight.
3. **Verify for real** — Install deps, run the commands in [Project facts](#project-facts), fix failures, re-run until green. For UI changes, run the dev server or preview and confirm behavior.
4. **Tests** — Add or update automated tests when you change behavior and the repo has a test setup (this repo currently has none in `package.json`).
5. **Ship** — Commit on a feature branch, push, open a PR (what / why / verification / assumptions / follow-ups). Watch CI if present; fix until checks pass.
6. **Clean up** — No debug leftovers or commented-out code.
7. **Final report** — Short summary, verification evidence, open items.

**Keep going** until the task is done; long runs are fine.

**Only stop and ask** for: secrets or credentials, destructive or irreversible actions (deleting data, force-pushing shared branches, production deploys, spending money), or a genuinely ambiguous product decision.

## Project facts

| | |
|---|---|
| **Repo** | Static personal site (“embsite” / pupsite), production at https://t480.dev |
| **Stack** | SvelteKit 2, Vite 8, TypeScript, mdsvex, `@sveltejs/adapter-static`, Font Awesome 6, plain CSS in `static/css/body.css` |
| **Key paths** | `src/routes/` (pages, mostly `.md`), `src/lib/` (shared code), `static/` (assets, global CSS), `scripts/` (build helpers) |
| **CI** | No `.github/workflows` in this repo |

**Setup:** `npm ci`

**Dev:** `npm run dev`

**Verify (run after substantive changes):**

```bash
npm run check    # svelte-kit sync + svelte-check
npm run lint     # prettier --check . && eslint .
npm run build    # vite build → output in build/
```

**Preview production build:** `npm run preview`

**Format (fix Prettier):** `npm run format`

**Tests:** No `test` script in `package.json` and no Playwright (or other) test config checked in.

## Project structure

```
src/
├── app.d.ts
├── lib/                 # utils (e.g. blogEntries.ts), components
├── routes/
│   ├── +layout.svelte   # header, nav, footer
│   ├── +page.md         # home
│   ├── about/, contact/, donate/, presence/, projects/
│   └── blog/            # index, atom/rss, entry/YYYYMMDD/+page.md
static/css/body.css      # global styles, CSS variables, .sr-only
```

## Routing and content

- SvelteKit file-based routing; `.md` pages use mdsvex.
- Blog posts: `src/routes/blog/entry/<date>/+page.md` with frontmatter `title`, `date`, optional `modified`.
- `blogEntries.ts` discovers posts via `import.meta.glob`, sorted by date descending.

## Key conventions

- **Navbar:** `+layout.svelte`; active link via `$page.url.pathname` (`.active`).
- **Footer:** site metadata, GitHub link (embeputer/www), last modified date.
- **Mastodon rel="me":** hidden `<a class="sr-only">` in `<svelte:head>`.
- **Assets:** under `/assets/` (e.g. `picture.png`, `censor.gif`, `blahaj.png`).

## Styling

- CSS variables in `:root`; light/dark via `prefers-color-scheme`.
- `.sr-only` for visually hidden content.
- Breakpoints: 810px and 450px.
