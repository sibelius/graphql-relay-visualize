// The same feature three ways: a post with its author, comments and a like
// button whose count must stay correct everywhere the post appears.

export const SAMPLES = [
  {
    key: "fetch",
    title: "REST · fetch + useEffect",
    lang: "tsx",
    code: `function PostPage({ id }: { id: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const post = await get<Post>(\`/posts/\${id}\`);          // round trip 1
        const [author, raw] = await Promise.all([
          get<User>(\`/users/\${post.authorId}\`),                // round trip 2
          get<Comment[]>(\`/posts/\${id}/comments\`),
        ]);
        const ids = [...new Set(raw.map((c) => c.authorId))];
        const users = await Promise.all(ids.map((u) => get<User>(\`/users/\${u}\`))); // 3 (N+1)
        const byId = new Map(users.map((u) => [u.id, u]));
        if (cancelled) return;
        setPost(post);
        setAuthor(author);
        setComments(raw.map((c) => ({ ...c, author: byId.get(c.authorId)! })));
      } catch (e) {
        if (!cancelled) setError(e as Error);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (error) return <ErrorView error={error} />;
  if (!post || !author) return <Spinner />;
  return (
    <PostView post={post} author={author} comments={comments}
      onLike={async () => {
        const prev = post;
        setPost({ ...post, likeCount: post.likeCount + 1, viewerHasLiked: true });
        // The feed, sidebar and profile each hold their own copy of this post:
        eventBus.emit("post:liked", post.id);
        try { await post_(\`/posts/\${id}/like\`); }
        catch { setPost(prev); eventBus.emit("post:unliked", post.id); }
      }}
    />
  );
}
// + types for Post, User, Comment kept in sync with the API by hand
// + an eventBus listener in every component that shows a post`,
  },
  {
    key: "query",
    title: "REST · TanStack Query",
    lang: "tsx",
    code: `function PostPage({ id }: { id: string }) {
  const post = useQuery({ queryKey: ["post", id], queryFn: () => get<Post>(\`/posts/\${id}\`) });
  const author = useQuery({
    queryKey: ["user", post.data?.authorId],
    queryFn: () => get<User>(\`/users/\${post.data!.authorId}\`),
    enabled: !!post.data,                                   // waterfall, by design
  });
  const comments = useQuery({ queryKey: ["comments", id], queryFn: () => get<Comment[]>(\`/posts/\${id}/comments\`) });
  const authors = useQueries({
    queries: [...new Set(comments.data?.map((c) => c.authorId) ?? [])].map((u) => ({
      queryKey: ["user", u],
      queryFn: () => get<User>(\`/users/\${u}\`),
    })),
  });

  const qc = useQueryClient();
  const like = useMutation({
    mutationFn: () => post_(\`/posts/\${id}/like\`),
    onMutate: async () => {
      // Every cache entry that might contain this post has to be patched:
      await qc.cancelQueries({ queryKey: ["post", id] });
      const prev = qc.getQueryData<Post>(["post", id]);
      qc.setQueryData<Post>(["post", id], (p) => p && { ...p, likeCount: p.likeCount + 1, viewerHasLiked: true });
      qc.setQueriesData<InfiniteData<Post[]>>({ queryKey: ["feed"] }, (feed) => patchPostInPages(feed, id));
      qc.setQueryData<Post>(["topPost"], (p) => (p?.id === id ? { ...p, likeCount: p.likeCount + 1 } : p));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      qc.setQueryData(["post", id], ctx?.prev);
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["topPost"] });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["post", id] }),
  });

  if (post.error || author.error || comments.error) return <ErrorView />;
  if (post.isPending || author.isPending || comments.isPending || authors.some((a) => a.isPending)) return <Spinner />;
  return <PostView post={post.data} author={author.data} comments={joinAuthors(comments.data, authors)} onLike={() => like.mutate()} />;
}
// + patchPostInPages, joinAuthors, query-key conventions shared across the app`,
  },
  {
    key: "relay",
    title: "GraphQL · Relay",
    lang: "tsx",
    code: `function PostPage({ id }: { id: string }) {
  const { post } = useLazyLoadQuery<PostPageQuery>(graphql\`
    query PostPageQuery($id: ID!) {
      post(id: $id) { ...PostView_post }
    }
  \`, { id });
  return post ? <PostView post={post} /> : <NotFound />;
}

function LikeButton({ post }: { post: LikeButton_post$key }) {
  const data = useFragment(graphql\`
    fragment LikeButton_post on Post { id likeCount viewerHasLiked }
  \`, post);
  const [commit] = useMutation<LikeButtonMutation>(graphql\`
    mutation LikeButtonMutation($input: LikePostInput!) {
      likePost(input: $input) { post { id likeCount viewerHasLiked } }
    }
  \`);
  return (
    <button onClick={() => commit({
      variables: { input: { postId: data.id, like: true } },
      optimisticResponse: {
        likePost: { post: { id: data.id, likeCount: data.likeCount + 1, viewerHasLiked: true } },
      },
    })}>♥ {data.likeCount}</button>
  );
}
// PostView, AuthorLine and CommentItem each declare their own fragment.
// One request. Loading via Suspense. Types generated. Every view of the post updates.`,
  },
] as const;
