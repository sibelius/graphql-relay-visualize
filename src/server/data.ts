// In-memory "database" shared by the GraphQL endpoint and the REST endpoints,
// so both sides of every comparison serve exactly the same data.

export type UserRow = {
  id: string;
  name: string;
  username: string;
  bio: string;
  location: string;
  website: string | null;
  avatarColor: string;
  joinedAt: string;
  followerCount: number;
  followingCount: number;
};

export type PostRow = {
  id: string;
  authorId: string;
  title: string;
  body: string;
  createdAt: string;
  likedBy: Set<string>;
  tags: string[];
};

export type CommentRow = {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: string;
};

type DB = {
  users: UserRow[];
  posts: PostRow[];
  comments: CommentRow[];
  nextCommentId: number;
};

const VIEWER_ID = "u1";

function seed(): DB {
  const users: UserRow[] = [
    ["u1", "Ada Lovelace", "ada", "First programmer. Writes notes longer than the paper.", "London", "ada.dev", "#f472b6"],
    ["u2", "Alan Turing", "alan", "Thinking about thinking machines.", "Manchester", "turing.io", "#60a5fa"],
    ["u3", "Grace Hopper", "grace", "It's easier to ask forgiveness than it is to get permission.", "Arlington", "cobol.run", "#34d399"],
    ["u4", "Edsger Dijkstra", "edsger", "Simplicity is prerequisite for reliability.", "Nuenen", "ewd.org", "#fbbf24"],
    ["u5", "Barbara Liskov", "barbara", "Substitutable since 1987.", "Cambridge", "liskov.sub", "#a78bfa"],
    ["u6", "Donald Knuth", "don", "Premature optimization is the root of all evil.", "Stanford", "taocp.net", "#f87171"],
  ].map(([id, name, username, bio, location, website, avatarColor], i) => ({
    id,
    name,
    username,
    bio,
    location,
    avatarColor,
    // Edsger has no website, which the @required demo relies on.
    website: username === "edsger" ? null : website,
    joinedAt: new Date(Date.UTC(2015 + i, i, 3 + i)).toISOString(),
    followerCount: 1200 + i * 731,
    followingCount: 40 + i * 13,
  }));

  const titles = [
    "Why colocated fragments scale",
    "The normalized cache, explained",
    "Optimistic UI without the tears",
    "Cursor pagination in practice",
    "Schema-first design",
    "Declarative data requirements",
    "One round trip to rule them all",
    "Data masking keeps components honest",
    "Persisted queries for free",
    "Garbage collection in the client cache",
    "Refetchable fragments",
    "Connections and edges",
    "Type generation from the schema",
    "Suspense-driven loading states",
    "The Node interface",
    "Mutations that update everything",
    "Over-fetching is a tax",
    "N+1 requests on the client",
    "Compilers make runtimes smaller",
    "Global object identification",
    "Deferred fragments",
    "Subscriptions and live data",
    "Rendering only what changed",
    "Static queries, dynamic apps",
  ];
  const tagPool = ["relay", "graphql", "react", "performance", "caching", "dx", "types"];

  const posts: PostRow[] = titles.map((title, i) => {
    const likedBy = new Set<string>();
    for (let u = 0; u < users.length; u++) {
      if ((i * 7 + u * 3) % 5 < 2 && users[u].id !== VIEWER_ID) likedBy.add(users[u].id);
    }
    return {
      id: `p${i + 1}`,
      authorId: users[i % users.length].id,
      title,
      body: `${title}. This post walks through the idea with a small example, the trade-offs it makes, and how it shows up in a real product. Every paragraph here is filler so REST payloads carry realistic weight.`,
      createdAt: new Date(Date.UTC(2026, 8, 25 - i, 9 + (i % 8))).toISOString(),
      likedBy,
      tags: [tagPool[i % tagPool.length], tagPool[(i + 3) % tagPool.length]],
    };
  });

  const commentBodies = [
    "This clicked for me, thanks!",
    "How does this interact with the store?",
    "We shipped this last quarter and never looked back.",
    "Great write-up.",
    "Could you add a diagram?",
    "The compiler does so much heavy lifting here.",
  ];
  const comments: CommentRow[] = [];
  let c = 1;
  posts.forEach((post, i) => {
    const count = 2 + (i % 3);
    for (let k = 0; k < count; k++) {
      comments.push({
        id: `c${c++}`,
        postId: post.id,
        authorId: users[(i + k + 1) % users.length].id,
        body: commentBodies[(i + k) % commentBodies.length],
        createdAt: new Date(Date.parse(post.createdAt) + (k + 1) * 3_600_000).toISOString(),
      });
    }
  });

  return { users, posts, comments, nextCommentId: c };
}

// Survive dev-server hot reloads so mutations aren't lost on every edit.
const g = globalThis as unknown as { __relayVizDB?: DB };
export const db: DB = (g.__relayVizDB ??= seed());

export const viewerId = VIEWER_ID;

export function resetDB() {
  Object.assign(db, seed());
}

export const getUser = (id: string) => db.users.find((u) => u.id === id) ?? null;
export const getPost = (id: string) => db.posts.find((p) => p.id === id) ?? null;
export const getComment = (id: string) => db.comments.find((c) => c.id === id) ?? null;
export const postsByUser = (userId: string) => db.posts.filter((p) => p.authorId === userId);
export const commentsForPost = (postId: string) => db.comments.filter((c) => c.postId === postId);

export function addComment(postId: string, authorId: string, body: string): CommentRow {
  const comment: CommentRow = {
    id: `c${db.nextCommentId++}`,
    postId,
    authorId,
    body,
    createdAt: new Date().toISOString(),
  };
  db.comments.push(comment);
  return comment;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function latencyFrom(req: Request, fallback = 0) {
  const raw = req.headers.get("x-demo-latency") ?? new URL(req.url).searchParams.get("latency");
  const n = raw == null ? fallback : Number(raw);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 5000) : fallback;
}
