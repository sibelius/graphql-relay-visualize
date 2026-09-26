import {
  GraphQLDeferDirective,
  GraphQLStreamDirective,
  specifiedDirectives,
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  type GraphQLNullableType,
  GraphQLString,
} from "graphql";
import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  cursorForObjectInConnection,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
  type ConnectionArguments,
} from "graphql-relay";
import {
  addComment,
  commentsForPost,
  db,
  getComment,
  getPost,
  getUser,
  postsByUser,
  sleep,
  viewerId,
  type CommentRow,
  type PostRow,
  type UserRow,
} from "./data.ts";

export type Context = { fail: boolean };

const NonNull = <T extends GraphQLNullableType>(t: T) => new GraphQLNonNull(t);

const { nodeInterface, nodeField, nodesField } = nodeDefinitions<Context>(
  (globalId) => {
    const { type, id } = fromGlobalId(globalId);
    const row = type === "User" ? getUser(id) : type === "Post" ? getPost(id) : type === "Comment" ? getComment(id) : null;
    return row ? { ...row, __typename: type } : null;
  },
  (obj) => (obj as { __typename: string }).__typename,
);

const tagged = <T extends object>(row: T | null, typename: string) => (row ? { ...row, __typename: typename } : null);

function failIfRequested(ctx: Context) {
  if (ctx.fail) throw new Error("Simulated server failure (toggled from the demo controls)");
}

const UserType: GraphQLObjectType = new GraphQLObjectType<UserRow, Context>({
  name: "User",
  description: "A person who writes posts and comments.",
  interfaces: [nodeInterface],
  fields: () => ({
    id: globalIdField("User"),
    name: { type: NonNull(GraphQLString) },
    username: { type: NonNull(GraphQLString) },
    bio: { type: GraphQLString },
    location: { type: GraphQLString },
    website: { type: GraphQLString },
    avatarColor: { type: NonNull(GraphQLString), description: "Hex color used to draw the avatar." },
    joinedAt: { type: NonNull(GraphQLString) },
    followerCount: { type: NonNull(GraphQLInt) },
    followingCount: { type: NonNull(GraphQLInt) },
    postCount: { type: NonNull(GraphQLInt), resolve: (u) => postsByUser(u.id).length },
    posts: {
      type: NonNull(PostConnection),
      args: connectionArgs,
      resolve: (u, args: ConnectionArguments) =>
        connectionFromArray(postsByUser(u.id).map((p) => tagged(p, "Post")!), args),
    },
  }),
});

const CommentType: GraphQLObjectType = new GraphQLObjectType<CommentRow, Context>({
  name: "Comment",
  interfaces: [nodeInterface],
  fields: () => ({
    id: globalIdField("Comment"),
    body: { type: NonNull(GraphQLString) },
    createdAt: { type: NonNull(GraphQLString) },
    author: { type: NonNull(UserType), resolve: (c) => tagged(getUser(c.authorId), "User") },
  }),
});

const PostInsightsType = new GraphQLObjectType({
  name: "PostInsights",
  fields: {
    readMinutes: { type: NonNull(GraphQLInt) },
    wordCount: { type: NonNull(GraphQLInt) },
    sentiment: { type: NonNull(GraphQLString) },
    related: { type: NonNull(new GraphQLList(NonNull(GraphQLString))) },
  },
});

const ActivityType = new GraphQLObjectType<{ id: string; message: string; userId: string; at: string }, Context>({
  name: "Activity",
  fields: () => ({
    id: { type: NonNull(GraphQLID) },
    message: { type: NonNull(GraphQLString) },
    at: { type: NonNull(GraphQLString) },
    actor: { type: NonNull(UserType), resolve: (a) => tagged(getUser(a.userId), "User") },
  }),
});

const { connectionType: CommentConnection, edgeType: CommentEdge } = connectionDefinitions({
  nodeType: CommentType,
  connectionFields: { totalCount: { type: NonNull(GraphQLInt) } },
});

const PostType: GraphQLObjectType = new GraphQLObjectType<PostRow, Context>({
  name: "Post",
  description: "A blog post. Liking it from anywhere updates it everywhere.",
  interfaces: [nodeInterface],
  fields: () => ({
    id: globalIdField("Post"),
    title: { type: NonNull(GraphQLString) },
    body: { type: NonNull(GraphQLString) },
    excerpt: { type: NonNull(GraphQLString), resolve: (p) => p.body.slice(0, 90) + "…" },
    createdAt: { type: NonNull(GraphQLString) },
    tags: { type: NonNull(new GraphQLList(NonNull(GraphQLString))) },
    likeCount: { type: NonNull(GraphQLInt), resolve: (p) => p.likedBy.size },
    viewerHasLiked: { type: NonNull(GraphQLBoolean), resolve: (p) => p.likedBy.has(viewerId) },
    author: { type: NonNull(UserType), resolve: (p) => tagged(getUser(p.authorId), "User") },
    insights: {
      type: NonNull(PostInsightsType),
      description: "Expensive analytics (~1.2s). A natural candidate for @defer.",
      resolve: async (p) => {
        await sleep(1200);
        const words = p.body.split(/\s+/).length * 40;
        return {
          readMinutes: Math.max(1, Math.round(words / 220)),
          wordCount: words,
          sentiment: p.likedBy.size > 2 ? "enthusiastic" : "curious",
          related: db.posts.filter((o) => o.id !== p.id && o.tags.some((t) => p.tags.includes(t))).slice(0, 3).map((o) => o.title),
        };
      },
    },
    sponsor: {
      type: GraphQLString,
      description: "Backed by a flaky service that always fails, to demo @catch.",
      resolve: () => {
        throw new Error("Sponsor service timed out");
      },
    },
    comments: {
      type: NonNull(CommentConnection),
      args: connectionArgs,
      resolve: (p, args: ConnectionArguments) => {
        const all = commentsForPost(p.id).map((c) => tagged(c, "Comment")!);
        return { ...connectionFromArray(all, args), totalCount: all.length };
      },
    },
  }),
});

const { connectionType: PostConnection } = connectionDefinitions({
  nodeType: PostType,
  connectionFields: { totalCount: { type: NonNull(GraphQLInt) } },
});

const QueryType = new GraphQLObjectType<unknown, Context>({
  name: "Query",
  fields: () => ({
    node: nodeField,
    nodes: nodesField,
    viewer: { type: NonNull(UserType), resolve: () => tagged(getUser(viewerId), "User") },
    user: {
      type: UserType,
      args: { username: { type: NonNull(GraphQLString) } },
      resolve: (_, { username }) => tagged(db.users.find((u) => u.username === username) ?? null, "User"),
    },
    post: {
      type: PostType,
      args: { id: { type: NonNull(GraphQLID) } },
      resolve: (_, { id }) => tagged(getPost(fromGlobalId(id as string).id), "Post"),
    },
    users: { type: NonNull(new GraphQLList(NonNull(UserType))), resolve: () => db.users.map((u) => tagged(u, "User")) },
    feed: {
      type: NonNull(PostConnection),
      description: "Every post, newest first. A Relay-style cursor connection.",
      args: connectionArgs,
      resolve: (_, args: ConnectionArguments) => {
        const all = db.posts.map((p) => tagged(p, "Post")!);
        return { ...connectionFromArray(all, args), totalCount: all.length };
      },
    },
    activity: {
      type: NonNull(new GraphQLList(NonNull(ActivityType))),
      description: "Produced one item at a time (~400ms apart). Use @stream to render items as they arrive.",
      resolve: async function* () {
        const verbs = ["liked", "commented on", "shared", "bookmarked", "replied to", "quoted"];
        for (let i = 0; i < 8; i++) {
          await sleep(400);
          const post = db.posts[(i * 5) % db.posts.length];
          const user = db.users[(i * 2 + 1) % db.users.length];
          yield { id: `a${i}`, message: `${verbs[i % verbs.length]} “${post.title}”`, userId: user.id, at: new Date().toISOString() };
        }
      },
    },
    topPost: {
      type: NonNull(PostType),
      description: "The post with the most likes.",
      resolve: () => tagged([...db.posts].sort((a, b) => b.likedBy.size - a.likedBy.size)[0], "Post"),
    },
  }),
});

const postPayload = (postId: string) => tagged(getPost(fromGlobalId(postId).id), "Post");

const LikePostMutation = mutationWithClientMutationId<{ postId: string; like: boolean }, { postId: string }, Context>({
  name: "LikePost",
  inputFields: { postId: { type: NonNull(GraphQLID) }, like: { type: NonNull(GraphQLBoolean) } },
  outputFields: { post: { type: PostType, resolve: ({ postId }) => postPayload(postId) } },
  mutateAndGetPayload: ({ postId, like }, ctx) => {
    failIfRequested(ctx);
    const post = getPost(fromGlobalId(postId).id);
    if (!post) throw new Error("Post not found");
    if (like) post.likedBy.add(viewerId);
    else post.likedBy.delete(viewerId);
    return { postId };
  },
});

const RenameUserMutation = mutationWithClientMutationId<{ userId: string; name: string }, { userId: string }, Context>({
  name: "RenameUser",
  inputFields: { userId: { type: NonNull(GraphQLID) }, name: { type: NonNull(GraphQLString) } },
  outputFields: {
    user: { type: UserType, resolve: ({ userId }) => tagged(getUser(fromGlobalId(userId).id), "User") },
  },
  mutateAndGetPayload: ({ userId, name }, ctx) => {
    failIfRequested(ctx);
    const user = getUser(fromGlobalId(userId).id);
    if (!user) throw new Error("User not found");
    user.name = name.trim().slice(0, 40) || user.name;
    return { userId };
  },
});

const AddCommentMutation = mutationWithClientMutationId<{ postId: string; body: string }, { comment: CommentRow }, Context>({
  name: "AddComment",
  inputFields: { postId: { type: NonNull(GraphQLID) }, body: { type: NonNull(GraphQLString) } },
  outputFields: {
    commentEdge: {
      type: CommentEdge,
      resolve: ({ comment }: { comment: CommentRow }) => {
        const all = commentsForPost(comment.postId);
        return { cursor: cursorForObjectInConnection(all, comment), node: tagged(comment, "Comment") };
      },
    },
    post: { type: PostType, resolve: ({ comment }: { comment: CommentRow }) => tagged(getPost(comment.postId), "Post") },
  },
  mutateAndGetPayload: ({ postId, body }, ctx) => {
    failIfRequested(ctx);
    const post = getPost(fromGlobalId(postId).id);
    if (!post) throw new Error("Post not found");
    return { comment: addComment(post.id, viewerId, body.slice(0, 280)) };
  },
});

const MutationType = new GraphQLObjectType<unknown, Context>({
  name: "Mutation",
  fields: () => ({
    likePost: LikePostMutation,
    renameUser: RenameUserMutation,
    addComment: AddCommentMutation,
  }),
});

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  types: [UserType, PostType, CommentType],
  directives: [...specifiedDirectives, GraphQLDeferDirective, GraphQLStreamDirective],
});
