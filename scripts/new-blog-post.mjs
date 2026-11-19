#!/usr/bin/env node
// Write one blog entry in the same shape as src/routes/blog/entry/*/+page.md.
// Does not commit or push. Run with --help for usage.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const entryRoot = join(root, 'src', 'routes', 'blog', 'entry');

const help = `write a blog post into src/routes/blog/entry/YYYYMMDD/+page.md

usage:
  npm run new-post
  npm run new-post -- --title "title" [--date YYYY-MM-DD]
  npm run new-post -- --title "title" --body-file draft.md
  npm run new-post -- --body-file draft.md
  echo "body" | npm run new-post -- --title "title"

options:
  --title       post title. asked in a terminal when omitted.
  --date        publish date, YYYY-MM-DD. defaults to the frontmatter date, or today.
  --modified    optional modified date, YYYY-MM-DD. omitted from the file when unset.
  --body        post markdown. prefer --body-file or stdin for longer posts.
  --body-file   read the post from a file. frontmatter fills title, date, and modified when those flags are omitted.
  --force       replace the post that already uses this date.
  --dry-run     print the file instead of writing it.
  --help        show this text.

the blog index and the atom and rss feeds pick up the new file on their own.
this script does not commit or push.
`;

function parseArgs(argv) {
	const opts = {
		title: undefined,
		date: undefined,
		modified: undefined,
		body: undefined,
		bodyFile: undefined,
		force: false,
		dryRun: false,
		help: false
	};
	const valued = {
		'--title': 'title',
		'--date': 'date',
		'--modified': 'modified',
		'--body': 'body',
		'--body-file': 'bodyFile'
	};

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--help' || arg === '-h') {
			opts.help = true;
			continue;
		}
		if (arg === '--force') {
			opts.force = true;
			continue;
		}
		if (arg === '--dry-run') {
			opts.dryRun = true;
			continue;
		}

		const eq = arg.indexOf('=');
		const key = eq === -1 ? arg : arg.slice(0, eq);
		const field = valued[key];
		if (!field) fail(`unknown argument: ${arg}\n\n${help}`);
		const value = eq === -1 ? argv[++i] : arg.slice(eq + 1);
		if (value === undefined) fail(`${key} needs a value`);
		opts[field] = value;
	}

	if (opts.body !== undefined && opts.bodyFile !== undefined) {
		fail('pass either --body or --body-file, not both');
	}
	return opts;
}

function fail(message) {
	console.error(message);
	process.exit(1);
}

function today() {
	const now = new Date();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${now.getFullYear()}-${month}-${day}`;
}

function parseDate(value, label) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		fail(`${label} must be YYYY-MM-DD`);
	}
	const [year, month, day] = value.split('-').map(Number);
	const utc = new Date(Date.UTC(year, month - 1, day));
	if (utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== day) {
		fail(`${label} must be a real calendar day: ${value}`);
	}
	return value;
}

function unquote(raw) {
	if (raw.length < 2) return raw;
	const quote = raw[0];
	if ((quote !== "'" && quote !== '"') || raw.at(-1) !== quote) return raw;
	const inner = raw.slice(1, -1);
	if (quote === "'") return inner.replaceAll("''", "'");
	return inner.replaceAll('\\"', '"').replaceAll('\\\\', '\\');
}

function yamlSingle(value) {
	return `'${value.replaceAll("'", "''")}'`;
}

function splitFrontmatter(text) {
	const match = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
	if (!match || !/^(title|date|modified):/m.test(match[1])) {
		return { fm: {}, body: text };
	}

	const fm = {};
	for (const line of match[1].split('\n')) {
		const field = line.match(/^(title|date|modified):\s*(.*)$/);
		if (field) fm[field[1]] = unquote(field[2].trim());
	}
	return { fm, body: text.slice(match[0].length) };
}

function prepare(raw) {
	const text = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
	const split = splitFrontmatter(text);
	return {
		fm: split.fm,
		body: split.body.replace(/^\n+/, '').replace(/\s+$/g, '')
	};
}

function renderPost({ title, date, modified, body }) {
	const lines = ['---', `title: ${yamlSingle(title)}`, `date: ${yamlSingle(date)}`];
	if (modified) lines.push(`modified: ${yamlSingle(modified)}`);
	lines.push('---', '', body, '');
	return lines.join('\n');
}

function destination(date) {
	return join(entryRoot, date.replaceAll('-', ''), '+page.md');
}

function display(path) {
	return relative(root, path).split(sep).join('/');
}

function assertAvailable(path, force) {
	if (!force && existsSync(path)) {
		fail(
			`a post already exists at ${display(path)}\nedit that file, or rerun with --force to replace it.`
		);
	}
}

async function prompt(question) {
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	try {
		return (await rl.question(question)).trim();
	} finally {
		rl.close();
	}
}

function shellQuote(value) {
	return `'${value.replaceAll("'", `'\\''`)}'`;
}

function readFromEditor() {
	const dir = mkdtempSync(join(tmpdir(), 'new-blog-post-'));
	const file = join(dir, 'post.md');
	let text = '';
	let error = '';
	try {
		writeFileSync(file, '');
		const editor = process.env.VISUAL || process.env.EDITOR || 'nano';
		console.error(`opening ${editor} for the post body. save and close it when you are done.`);
		const result = /\s/.test(editor)
			? spawnSync(`${editor} ${shellQuote(file)}`, { stdio: 'inherit', shell: true })
			: spawnSync(editor, [file], { stdio: 'inherit' });
		if (result.error) {
			error = `could not start ${editor}: ${result.error.message}\nset EDITOR, or pass the body with --body-file or stdin.`;
		} else if (result.status !== 0) {
			error = `editor exited with status ${result.status}. the post was not written.`;
		} else {
			text = readFileSync(file, 'utf8');
		}
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
	if (error) fail(error);
	return text;
}

async function readStdin() {
	const chunks = [];
	for await (const chunk of process.stdin) chunks.push(chunk);
	return Buffer.concat(chunks).toString('utf8');
}

async function readBody(opts) {
	if (opts.bodyFile !== undefined) {
		if (!existsSync(opts.bodyFile)) fail(`body file not found: ${opts.bodyFile}`);
		return readFileSync(opts.bodyFile, 'utf8');
	}
	if (opts.body !== undefined) return opts.body;
	if (!process.stdin.isTTY) return readStdin();
	return readFromEditor();
}

function requireText(value, label) {
	if (value === undefined || value.trim() === '') fail(`${label} is empty`);
	if (value.includes('\n')) fail(`${label} must be a single line`);
	return value.trim();
}

async function main() {
	const opts = parseArgs(process.argv.slice(2));
	if (opts.help) {
		process.stdout.write(help);
		return;
	}

	const tty = Boolean(process.stdin.isTTY);
	const bodyReady = opts.body !== undefined || opts.bodyFile !== undefined || !tty;
	let title = opts.title;
	let date = opts.date;
	let modified = opts.modified;
	let promptedTitle;
	let promptedDate;
	let prepared;

	if (bodyReady) {
		prepared = prepare(await readBody(opts));
		title = title ?? prepared.fm.title;
		date = date ?? prepared.fm.date;
		modified = modified ?? prepared.fm.modified;
	}

	if (tty) {
		if (title === undefined) {
			promptedTitle = await prompt('title: ');
			title = promptedTitle;
		}
		if (date === undefined) {
			const entered = await prompt(`date [${today()}]: `);
			promptedDate = entered || today();
			date = promptedDate;
		}
	}

	if (!prepared) {
		prepared = prepare(await readFromEditor());
		title = opts.title ?? prepared.fm.title ?? promptedTitle;
		date = opts.date ?? prepared.fm.date ?? promptedDate;
		modified = opts.modified ?? prepared.fm.modified ?? modified;
	}

	title = requireText(title, 'title');
	date = parseDate(date ?? today(), 'date');
	const parsedModified = modified ? parseDate(modified, 'modified') : undefined;
	if (!prepared.body) fail('the post body is empty');

	const content = renderPost({
		title,
		date,
		modified: parsedModified,
		body: prepared.body
	});
	const dest = destination(date);
	const shown = display(dest);

	if (opts.dryRun) {
		process.stdout.write(`dry run, not saved: ${shown}\n${content}`);
		return;
	}

	assertAvailable(dest, opts.force);
	mkdirSync(dirname(dest), { recursive: true });
	try {
		writeFileSync(dest, content, { flag: opts.force ? 'w' : 'wx' });
	} catch (err) {
		if (err && err.code === 'EEXIST') assertAvailable(dest, false);
		throw err;
	}
	process.stdout.write(`saved ${shown}\n`);
}

main().catch((err) => {
	console.error(err instanceof Error ? err.message : err);
	process.exit(1);
});
