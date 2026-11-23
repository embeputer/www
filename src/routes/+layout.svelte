<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const to = navigation.to?.url.pathname ?? '/';
		const from = navigation.from?.url.pathname ?? '/';
		document.documentElement.classList.toggle('is-back', to === '/' || to.length < from.length);

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	function getVilniusTime() {
		return new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/Vilnius' });
	}

	let vilniusTime = getVilniusTime();

	onMount(() => {
		vilniusTime = getVilniusTime();
		const interval = setInterval(() => {
			vilniusTime = getVilniusTime();
		}, 1000);
		return () => clearInterval(interval);
	});

	const names = {
		'/': 'home',
		'/projects/': 'projects',
		'/blog/': 'blog',
		'/contact/': 'contact',
		'/donate/': 'donate',
		'/guestbook/': 'guestbook'
	};

	$: pathname = $page.url.pathname;
	$: isHome = pathname === '/';
	$: pageName = pathname.startsWith('/blog/entry/') ? 'blog' : (names[pathname] ?? 'ember');
	$: documentTitle = isHome ? 'le ember' : `${pageName} · ember`;
</script>

<svelte:head>
	<title>{documentTitle}</title>
	<meta property="og:title" content="em | {pathname}" />
	<meta property="og:description" content="ember aetheria is a design engineer." />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:image" content="{$page.url.origin}/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<link rel="me" href="https://hachyderm.io/@imcharlie" />
</svelte:head>

<div class="shell">
	{#if !isHome}
		<a class="home-link" href="/">ember</a>
	{/if}

	<main>
		<slot />
	</main>

	<footer class="site-footer">
		<p>made by a puppy and machines of loving grace · <span class="clock">vilnius {vilniusTime}</span></p>
		<a href="https://github.com/embeputer/www">source code</a>
	</footer>
</div>
