<script>
	const links = [
		{ href: 'https://github.com/embeputer', label: 'github', icon: 'github', rel: 'me' },
		{ href: 'https://x.com/embeputer', label: 'twitter', icon: 'twitter', rel: 'me' },
		{ href: '/blog', label: 'blog', icon: 'list' },
		{ href: '/projects', label: 'projects', icon: 'asterisk' },
		{ href: '/contact', label: 'contact', icon: 'mail' },
		{ href: '/donate', label: 'donate', icon: 'heart' },
		{ href: '/guestbook', label: 'guestbook', icon: 'book' }
	];
</script>

{#snippet glyph(name)}
	<svg class="glyph" viewBox="0 0 24 24" aria-hidden="true">
		{#if name === 'asterisk'}
			<path d="M12 4.2v15.6M5.1 8.1l13.8 7.8M18.9 8.1 5.1 15.9" />
		{:else if name === 'list'}
			<path d="M10 7h8.5M10 12h8.5M10 17h8.5" />
			<path d="M6 7h.01M6 12h.01M6 17h.01" stroke-width="2.4" />
		{:else if name === 'mail'}
			<rect x="3.8" y="5.8" width="16.4" height="12.4" rx="1.6" />
			<path d="m4.8 7.2 7.2 5.4 7.2-5.4" />
		{:else if name === 'twitter'}
			<path
				d="M19.6 7.3a6.4 6.4 0 0 1-1.8.5 3.2 3.2 0 0 0 1.4-1.8 6.4 6.4 0 0 1-2 .8 3.2 3.2 0 0 0-5.5 2.9A9 9 0 0 1 5.1 6.8a3.2 3.2 0 0 0 1 4.3 3.2 3.2 0 0 1-1.4-.4v.1a3.2 3.2 0 0 0 2.6 3.1 3.2 3.2 0 0 1-1.4.1 3.2 3.2 0 0 0 3 2.2 6.4 6.4 0 0 1-4 1.4 9 9 0 0 0 13.8-7.6v-.4a6.5 6.5 0 0 0 1.6-1.6z"
				fill="currentColor"
				stroke="none"
			/>
		{:else if name === 'heart'}
			<path
				d="M12 18.4s-5.8-3.5-5.8-7.1a3.15 3.15 0 0 1 5.8-1.7 3.15 3.15 0 0 1 5.8 1.7c0 3.6-5.8 7.1-5.8 7.1z"
			/>
		{:else if name === 'book'}
			<path d="M8 5.2h9.2v13.6H8z" />
			<path d="M8 5.2c-1.5 0-2.4.7-2.4 2.1v9.4c0 1.4.9 2.1 2.4 2.1" />
			<path d="M10.4 9h4.4M10.4 12.2h4.4" />
		{:else if name === 'github'}
			<path
				d="M12 4.6a7.4 7.4 0 0 0-2.34 14.42c.37.07.5-.16.5-.35v-1.22c-2.06.45-2.5-.99-2.5-.99-.34-.86-.82-1.09-.82-1.09-.67-.46.05-.45.05-.45.74.05 1.13.76 1.13.76.66 1.13 1.73.8 2.15.61.07-.48.26-.8.47-1-1.65-.19-3.38-.82-3.38-3.66 0-.81.29-1.47.76-1.99-.08-.19-.33-.94.07-1.96 0 0 .62-.2 2.03.76a7 7 0 0 1 3.7 0c1.41-.96 2.03-.76 2.03-.76.4 1.02.15 1.77.07 1.96.47.52.76 1.18.76 1.99 0 2.85-1.74 3.47-3.4 3.65.27.23.51.69.51 1.39v2.06c0 .19.13.42.51.35A7.4 7.4 0 0 0 12 4.6z"
				fill="currentColor"
				stroke="none"
			/>
		{/if}
	</svg>
{/snippet}

<section class="home">
	<h1 class="greet">le ember</h1>
	<p class="lede">
		design engineer at <a href="https://x.com/neuronfndn">neuron</a> and
		<a href="https://x.com/ntrlhq">natural</a> and great stupid person @
		<a href="https://rnfl.net">the ryanair no fly list</a>
	</p>
	<div class="dots" aria-hidden="true"></div>
	<nav aria-label="Pages and profiles">
		<ul class="index">
			{#each links as link}
				<li>
					<a href={link.href} rel={link.rel}>{@render glyph(link.icon)}{link.label}</a>
				</li>
			{/each}
		</ul>
	</nav>
</section>
