import type { CommentRow, PostRow, UserRow } from "./data";

// REST resources return the whole row plus the kind of extra fields real
// endpoints accumulate over time — the client can't opt out of any of them.
export const restUser = (u: UserRow) => ({
  ...u,
  email: `${u.username}@example.com`,
  links: { self: `/api/rest/users/${u.id}`, posts: `/api/rest/users/${u.id}/posts` },
  settings: { theme: "system", locale: "en-US", notifications: { email: true, push: false, digest: "weekly" } },
  createdAt: u.joinedAt,
  updatedAt: u.joinedAt,
});

export const restPost = (p: PostRow) => ({
  id: p.id,
  authorId: p.authorId,
  title: p.title,
  body: p.body,
  tags: p.tags,
  likedBy: [...p.likedBy],
  createdAt: p.createdAt,
  updatedAt: p.createdAt,
  links: { self: `/api/rest/posts/${p.id}`, comments: `/api/rest/posts/${p.id}/comments` },
});

export const restComment = (c: CommentRow) => ({ ...c, links: { author: `/api/rest/users/${c.authorId}` } });
