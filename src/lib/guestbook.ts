import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';

const sessionCookie = 'guestbook_session';
const stateCookie = 'guestbook_oauth_state';
const file = join(process.cwd(), 'data', 'guestbook.json');

export type Guest = {
	login: string;
	url: string;
};

export type Mark = Guest & {
	message: string;
	at: string;
};

export function oauthConfigured() {
	return Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);
}

function secret() {
	return env.GITHUB_SESSION_SECRET || env.GITHUB_CLIENT_SECRET || '';
}

function sign(value: string) {
	const mac = createHmac('sha256', secret()).update(value).digest('base64url');
	return `${value}.${mac}`;
}

function unsign(token: string) {
	const dot = token.lastIndexOf('.');
	if (dot === -1 || !secret()) return null;
	const value = token.slice(0, dot);
	const mac = token.slice(dot + 1);
	const expected = createHmac('sha256', secret()).update(value).digest('base64url');
	const left = Buffer.from(mac);
	const right = Buffer.from(expected);
	if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
	return value;
}

export function readGuest(cookies: Cookies): Guest | null {
	const token = cookies.get(sessionCookie);
	if (!token) return null;
	const value = unsign(token);
	if (!value) return null;
	try {
		const guest = JSON.parse(Buffer.from(value, 'base64url').toString()) as Guest;
		if (!guest.login || !guest.url) return null;
		return guest;
	} catch {
		return null;
	}
}

export function writeGuest(cookies: Cookies, guest: Guest, secure: boolean) {
	const value = Buffer.from(JSON.stringify(guest)).toString('base64url');
	cookies.set(sessionCookie, sign(value), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure,
		maxAge: 60 * 60 * 24 * 30
	});
}

export function clearGuest(cookies: Cookies, secure: boolean) {
	cookies.delete(sessionCookie, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure
	});
}

export function newState(cookies: Cookies) {
	const state = randomBytes(16).toString('hex');
	cookies.set(stateCookie, state, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: false,
		maxAge: 60 * 10
	});
	return state;
}

export function takeState(cookies: Cookies) {
	const state = cookies.get(stateCookie);
	cookies.delete(stateCookie, { path: '/' });
	return state ?? null;
}

export function readMarks(): Mark[] {
	try {
		const marks = JSON.parse(readFileSync(file, 'utf8')) as Mark[];
		return Array.isArray(marks) ? marks : [];
	} catch {
		return [];
	}
}

function sameLogin(a: string, b: string) {
	return a.toLowerCase() === b.toLowerCase();
}

function writeMarks(marks: Mark[]) {
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, JSON.stringify(marks, null, 2));
}

export function findMark(login: string) {
	return readMarks().find((mark) => sameLogin(mark.login, login)) ?? null;
}

export function addMark(guest: Guest, message: string) {
	const marks = readMarks();
	if (marks.some((mark) => sameLogin(mark.login, guest.login))) return false;
	marks.unshift({
		login: guest.login,
		url: guest.url,
		message,
		at: new Date().toISOString()
	});
	writeMarks(marks);
	return true;
}

export function updateMark(guest: Guest, message: string) {
	const marks = readMarks();
	const index = marks.findIndex((mark) => sameLogin(mark.login, guest.login));
	if (index === -1) return false;
	marks[index] = {
		login: guest.login,
		url: guest.url,
		message,
		at: new Date().toISOString()
	};
	writeMarks(marks.filter((mark, i) => i === index || !sameLogin(mark.login, guest.login)));
	return true;
}

export function removeMark(login: string) {
	writeMarks(readMarks().filter((mark) => !sameLogin(mark.login, login)));
}
