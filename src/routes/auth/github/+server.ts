import { env } from '$env/dynamic/private';
import { newState, oauthConfigured } from '$lib/guestbook';

export const prerender = false;

export function GET({ url, cookies }) {
	if (!oauthConfigured()) {
		return new Response('github oauth is not configured', { status: 500 });
	}

	const state = newState(cookies);
	const redirect = new URL('https://github.com/login/oauth/authorize');
	redirect.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
	redirect.searchParams.set('redirect_uri', `${url.origin}/auth/github/callback/`);
	redirect.searchParams.set('scope', 'read:user');
	redirect.searchParams.set('state', state);

	return new Response(null, {
		status: 302,
		headers: { location: redirect.toString() }
	});
}
