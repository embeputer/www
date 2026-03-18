import { render } from 'svelte/server';

export const fetchMarkdownPosts = async ({ includeContent = false } = {}) => {
	const iterablePostFiles = Object.entries(import.meta.glob('/src/routes/blog/entry/*/+page.md'));

	const allPosts = await Promise.all(
		iterablePostFiles.map(async ([path, resolver]) => {
			const post: any = await resolver();
			let content = '';
			if (includeContent) {
				const rendered = render(post.default);
				content = rendered.body;
			}
			return {
				meta: post.metadata,
				path: path.slice(11, -8),
				...(includeContent && { content })
			};
		})
	);

	const sortedPosts = allPosts.sort((a, b) => {
		const bPost: any = new Date(b.meta.date);
		const aPost: any = new Date(a.meta.date);
		return bPost - aPost;
	});

	return sortedPosts;
};
