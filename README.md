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

## building

```
npm run build
```

this will generate a new static build of this website in the `build` directory which can be served by any standard reverse proxy
