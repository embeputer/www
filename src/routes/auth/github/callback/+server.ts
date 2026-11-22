import { env } from '$env/dynamic/private';
import { oauthConfigured, takeState, writeGuest } from '$lib/guestbook';

export const prerender = false;

export async function GET({ url, cookies }) {
	const back = new Response(null, {
		status: 302,
		headers: { location: '/guestbook/' }
	});

	if (!oauthConfigured()) return back;

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const saved = takeState(cookies);
	if (!code || !state || state !== saved) return back;

	const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: {
			accept: 'application/json',
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			client_id: env.GITHUB_CLIENT_ID,
			client_secret: env.GITHUB_CLIENT_SECRET,
			code,
			redirect_uri: `${url.origin}/auth/github/callback/`
		})
	});
	const token = await tokenResponse.json();
	if (!token.access_token) return back;

	const userResponse = await fetch('https://api.github.com/user', {
		headers: {
			accept: 'application/vnd.github+json',
			authorization: `Bearer ${token.access_token}`,
			'user-agent': 'ember-guestbook'
		}
	});
	if (!userResponse.ok) return back;
	const user = await userResponse.json();
	if (!user.login) return back;

	writeGuest(
		cookies,
		{
			login: user.login,
			url: user.html_url || `https://github.com/${user.login}`
		},
		url.protocol === 'https:'
	);

	return back;
}
