<script>
	export let data;

	let editing = false;

	$: mine = data.user
		? data.marks.find((mark) => mark.login.toLowerCase() === data.user.login.toLowerCase())
		: undefined;
</script>

<section class="guestbook">
	<h1>guestbook</h1>

	{#if data.user}
		<form class="sign-form" method="POST" action={editing && mine ? '?/edit' : '?/sign'}>
			<button class="who" type="submit" formaction="?/logout" formnovalidate>
				authenticated as {data.user.login}
			</button>
			{#if mine && !editing}
				<p class="choices">
					<button type="button" on:click={() => (editing = true)}>edit</button>
					<button type="submit" formaction="?/remove" formnovalidate>remove</button>
				</p>
			{:else}
				<label class="sr-only" for="mark">message</label>
				<input
					id="mark"
					name="message"
					type="text"
					maxlength="280"
					required
					pattern=".*\S.*"
					title="write something"
					placeholder="say something"
					autocomplete="off"
					value={editing && mine ? mine.message : ''}
				/>
				<p class="choices">
					<button type="submit">{editing && mine ? 'save' : 'send'}</button>
					{#if editing && mine}
						<button type="submit" formaction="?/remove" formnovalidate>remove</button>
					{/if}
				</p>
			{/if}
		</form>
	{:else}
		<p class="signin"><a href="/auth/github">sign in with github</a></p>
	{/if}

	{#if data.marks.length === 0}
		<p class="meta">nobody has signed yet</p>
	{:else}
		<ul class="marks">
			{#each data.marks as mark}
				<li>
					<a href={mark.url}>{mark.login}</a>: {mark.message}
				</li>
			{/each}
		</ul>
	{/if}
</section>
