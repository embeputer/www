export const fetchMarkdownPosts = async () => {
	const iterablePostFiles = Object.entries(import.meta.glob('/src/routes/blog/entry/*/+page.md'));

	const allPosts = await Promise.all(
		iterablePostFiles.map(async ([path, resolver]) => {
			const post: any = await resolver();
			return {
				meta: post.metadata,
				path: path.slice(11, -8),
				content: post.default.render()
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
