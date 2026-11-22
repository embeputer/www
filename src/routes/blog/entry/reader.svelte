<script>
	/**
	 * @type string
	 */
	export let title;
	/**
	 * @type string
	 */
	export let date;
	/**
	 * @type string
	 */
	export let modified;
</script>

<svelte:head>
	<title>{title} | ember's blog</title>
	<meta name="description" content="ember's comfy blog" />
	<meta property="og:title" content="{title} | ember's blog" />
	<meta property="og:description" content="ember's comfy blog" />
</svelte:head>

<p class="back"><a href="/blog/">back to my blog</a></p>

<h2>{title}</h2>
<p class="meta">publish date: {date}</p>
{#if modified}
	<p class="meta">modified date: {modified}</p>
{/if}
<p class="meta">author: ember (stellirious@gmail.com) (@cms.14)</p>
<slot />
