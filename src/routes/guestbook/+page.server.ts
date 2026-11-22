import { fail, redirect } from '@sveltejs/kit';
import { addMark, clearGuest, readGuest, readMarks, removeMark, updateMark } from '$lib/guestbook';

export const prerender = false;

export function load({ cookies }) {
	return {
		user: readGuest(cookies),
		marks: readMarks()
	};
}

export const actions = {
	sign: async ({ request, cookies }) => {
		const user = readGuest(cookies);
		if (!user) return fail(401);

		const message = String((await request.formData()).get('message') ?? '')
			.trim()
			.slice(0, 280);
		if (!message) return fail(400);
		if (!addMark(user, message)) return fail(409);

		redirect(303, '/guestbook/');
	},

	edit: async ({ request, cookies }) => {
		const user = readGuest(cookies);
		if (!user) return fail(401);

		const message = String((await request.formData()).get('message') ?? '')
			.trim()
			.slice(0, 280);
		if (!message) return fail(400);
		if (!updateMark(user, message)) return fail(404);

		redirect(303, '/guestbook/');
	},

	remove: async ({ cookies }) => {
		const user = readGuest(cookies);
		if (!user) return fail(401);

		removeMark(user.login);
		redirect(303, '/guestbook/');
	},

	logout: async ({ cookies, url }) => {
		clearGuest(cookies, url.protocol === 'https:');
		redirect(303, '/guestbook/');
	}
};
