<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	const USERNAME = 'stellirious';
	const API_URL = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&limit=1&api_key=${import.meta.env.VITE_LASTFM_API_KEY}&format=json`;

	type Track = {
		name: string;
		artist: string;
		album: string;
		image: string;
		url: string;
		nowPlaying: boolean;
		timestamp: number | null;
	};

	type Commit = {
		message: string;
		repo: string;
		sha: string;
		url: string;
		timestamp: number;
	};

	let track: Track | null = null;
	let error = false;
	let loading = true;
	let interval: ReturnType<typeof setInterval>;
	let commitInterval: ReturnType<typeof setInterval>;

	let commit: Commit | null = null;

	function relativeTime(uts: number): string {
		const diff = Math.floor(Date.now() / 1000) - uts;
		if (diff < 60) return 'just now';
		if (diff < 3600) {
			const m = Math.floor(diff / 60);
			return `${m} minute${m !== 1 ? 's' : ''} ago`;
		}
		if (diff < 86400) {
			const h = Math.floor(diff / 3600);
			return `${h} hour${h !== 1 ? 's' : ''} ago`;
		}
		const d = Math.floor(diff / 86400);
		return `${d} day${d !== 1 ? 's' : ''} ago`;
	}

	async function fetchTrack() {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 8000);
		try {
			const res = await fetch(API_URL, { signal: controller.signal });
			if (!res.ok) throw new Error('fetch failed');
			const data = await res.json();
			const t = data?.recenttracks?.track?.[0];
			if (!t) throw new Error('no track');
			track = {
				name: t.name,
				artist: t.artist['#text'],
				album: t.album['#text'],
				image: t.image?.[2]?.['#text'] ?? '',
				url: t.url,
				nowPlaying: t['@attr']?.nowplaying === 'true',
				timestamp: t.date?.uts ? parseInt(t.date.uts, 10) : null
			};
			error = false;
		} catch {
			error = true;
		} finally {
			clearTimeout(timeout);
			loading = false;
		}
	}

	async function fetchCommit() {
		try {
			const res = await fetch('https://api.github.com/users/embeputer/events/public?per_page=10');
			if (!res.ok) return;
			const events = await res.json();
			const push = events.find((e: { type: string }) => e.type === 'PushEvent');
			if (!push) return;
			const sha = push.payload.head;
			if (!sha) return;
			const commitRes = await fetch(`https://api.github.com/repos/${push.repo.name}/commits/${sha}`);
			if (!commitRes.ok) return;
			const commitData = await commitRes.json();
			commit = {
				message: commitData.commit.message.split('\n')[0],
				repo: push.repo.name,
				sha,
				url: commitData.html_url,
				timestamp: Math.floor(new Date(push.created_at).getTime() / 1000)
			};
		} catch {
			/* silent fail */
		}
	}

	onMount(() => {
		fetchTrack();
		fetchCommit();
		interval = setInterval(fetchTrack, 30000);
		commitInterval = setInterval(fetchCommit, 60000);
	});

	onDestroy(() => {
		clearInterval(interval);
		clearInterval(commitInterval);
	});
</script>

<div class="scrobble-widget">
	{#if loading}
		<p class="scrobble-status">fetching scrobbles...</p>
	{:else if error}
		<p class="scrobble-status">couldn't load last.fm data.</p>
	{:else if track}
		<a href={track.url} class="scrobble-inner" target="_blank" rel="noopener noreferrer">
			{#if track.image}
				<img src={track.image} alt="album art for {track.album}" class="scrobble-art" />
			{/if}
			<div class="scrobble-info">
				<span class="scrobble-track">{track.name}</span>
				<span class="scrobble-artist">{track.artist}</span>
				{#if track.album}
					<span class="scrobble-album">{track.album}</span>
				{/if}
				<span class="scrobble-time">
					{#if track.nowPlaying}
						♪ now playing
					{:else if track.timestamp}
						last scrobbled {relativeTime(track.timestamp)}
					{/if}
				</span>
			</div>
		</a>
	{/if}
	{#if commit}
		<div class="commit-bar">
			<i class="fa-solid fa-code-commit"></i>
			<a href={commit.url} class="commit-link" target="_blank" rel="noopener noreferrer">
				<span class="commit-msg">{commit.message}</span>
			</a>
			<span class="commit-time">{relativeTime(commit.timestamp)}</span>
		</div>
	{/if}
</div>

<style>
	.scrobble-widget {
		max-width: 400px;
		width: 100%;
		border: 1px solid var(--textColor);
		background-color: var(--tableOddBackgroundColor);
		padding: 10px;
		box-sizing: border-box;
		font-family: sans-serif;
	}

	.scrobble-status {
		color: var(--textColor);
		margin: 0;
		font-size: 0.9em;
	}

	.scrobble-inner {
		display: flex;
		flex-direction: row;
		gap: 10px;
		align-items: flex-start;
		text-decoration: none;
		color: inherit;
	}

	.scrobble-inner:hover .scrobble-track {
		text-decoration: underline;
	}

	.scrobble-art {
		width: 64px;
		height: 64px;
		flex-shrink: 0;
		object-fit: cover;
		image-rendering: auto;
	}

	.scrobble-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.scrobble-track {
		color: var(--linkColor);
		font-weight: bold;
		font-size: 0.95em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.scrobble-artist {
		color: var(--textColor);
		font-size: 0.9em;
	}

	.scrobble-album {
		color: var(--textColor);
		font-size: 0.85em;
		font-style: italic;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.scrobble-time {
		color: var(--textColor);
		font-size: 0.8em;
		margin-top: 4px;
		opacity: 0.75;
	}

	.commit-bar {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 10px;
		padding-top: 8px;
		border-top: 1px solid var(--textColor);
		font-size: 0.8em;
		color: var(--textColor);
		opacity: 0.85;
	}

	.commit-link {
		color: var(--linkColor);
		text-decoration: none;
		min-width: 0;
		flex: 1;
	}

	.commit-link:hover .commit-msg {
		text-decoration: underline;
	}

	.commit-msg {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: block;
	}

	.commit-time {
		flex-shrink: 0;
		opacity: 0.75;
	}
</style>
