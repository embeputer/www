<script>
	export let data;
</script>

## welcome to ember publishing co.

this is what i write. rants, marvelous content, something in between

<ul>
{#each data.posts as post}
<li><a href="{post.path}">{post.meta.title}</a> | {post.meta.date}</li>
{/each}
</ul>
