# ze embsite

this is the source code for moi website

## developing

### fetching dependencies

```
npm install
```

this should do the trick

### running a dev server

```
npm run dev
```

this will open a development http server, you can append `-- --open` to this to have it automatically load the page in your default browser

### code quality

```
npm run format
```

to tidy up all sources

```
npm run lint
```

to detect any errors with this codebase

## writing a blog post

```
npm run new-post
```

this asks for a title and a date, then opens `$EDITOR` (or `nano`) for the post. it saves `src/routes/blog/entry/YYYYMMDD/+page.md` with the same frontmatter as the other entries: `title` and `date`, plus `modified` when you pass one. the blog index and the feeds pick the file up on their own.

from a script or an agent, skip the prompts:

```
npm run new-post -- --title "post title" --body-file draft.md
```

the date defaults to today. pass `--date YYYY-MM-DD` to pick one, or put `title` and `date` in the draft's frontmatter. `npm run new-post -- --help` lists the flags. this does not commit or push.

## building

```
npm run build
```

this will generate a new static build of this website in the `build` directory which can be served by any standard reverse proxy
